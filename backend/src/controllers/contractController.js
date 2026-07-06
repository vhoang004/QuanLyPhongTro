const { Contract, Room, Tenant } = require("../models");
const { Op } = require("sequelize");
const { paginateQuery, buildPaginationResponse, isExpiringWithinDays } = require("../services/helpers");

const getAllContracts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = "", status } = req.query;

    const where = {};
    if (status) where.status = status;

    if (search) {
      where[Op.or] = [
        { "$room.room_number$": { [Op.like]: `%${search}%` } },
        { "$tenant.full_name$": { [Op.like]: `%${search}%` } },
      ];
    }

    // Multi-tenant: admin sees all, manager sees only their own
    if (req.user.role !== 'admin') {
      where.account_id = req.user.id;
    }

    const { rows, count } = await Contract.findAndCountAll({
      where,
      attributes: ["id", "room_id", "tenant_id", "tenant_ids", "start_date", "end_date", "deposit", "price_per_month", "status", "terms", "created_at", "account_id"],
      include: [
        { model: Room, as: "room", attributes: ["id", "room_number", "room_name", "room_type", "base_price"] },
        { model: Tenant, as: "tenant", attributes: ["id", "full_name", "phone_number", "citizen_id"] },
      ],
      order: [["created_at", "DESC"]],
      ...paginateQuery({ page, limit }),
    });

    return res.json(buildPaginationResponse(rows, count, page, limit));
  } catch (error) {
    next(error);
  }
};

const getContractById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const contract = await Contract.findByPk(id, {
      include: [
        { model: Room, as: "room" },
        { model: Tenant, as: "tenant" },
      ],
    });

    if (!contract) {
      return res.status(404).json({ message: "Hop dong khong ton tai." });
    }

    if (req.user.role !== 'admin' && contract.account_id !== req.user.id) {
      return res.status(403).json({ message: "Ban khong co quyen xem hop dong nay." });
    }

    return res.json({ contract });
  } catch (error) {
    next(error);
  }
};

const createContract = async (req, res, next) => {
  try {
    const { room_id, tenant_id, tenant_ids, start_date, end_date, deposit, price_per_month, terms, account_id } = req.body;

    if (!room_id || !tenant_id || !start_date || !end_date || !price_per_month) {
      return res.status(400).json({ message: "Vui long dien day du thong tin bat buoc." });
    }

    const start = new Date(start_date);
    const end = new Date(end_date);
    if (end <= start) {
      return res.status(400).json({ message: "Ngay ket thuc phai lon hon ngay bat dau." });
    }

    const room = await Room.findByPk(room_id);
    if (!room) {
      return res.status(404).json({ message: "Phong khong ton tai." });
    }

    const existingActive = await Contract.findOne({
      where: { room_id, status: "active" },
    });
    if (existingActive) {
      return res.status(400).json({ message: "Phong nay dang co hop dong active." });
    }

    const tenantActive = await Contract.findOne({
      where: { tenant_id, status: "active" },
    });
    if (tenantActive) {
      return res.status(400).json({ message: "Nguoi thue dang co hop dong active." });
    }

    const contract = await Contract.create({
      room_id,
      tenant_id,
      tenant_ids: tenant_ids || [tenant_id],
      account_id: req.user.id,
      start_date,
      end_date,
      deposit: deposit || 0,
      price_per_month,
      terms,
      status: "active",
      handover_status: "none",
    });

    room.status = "rented";
    await room.save();

    return res.status(201).json({ message: "Tao hop dong thanh cong.", contract });
  } catch (error) {
    next(error);
  }
};

const renewContract = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { new_end_date } = req.body;

    if (!new_end_date) {
      return res.status(400).json({ message: "Ngay ket thuc moi la bat buoc." });
    }

    const contract = await Contract.findByPk(id);
    if (!contract) {
      return res.status(404).json({ message: "Hop dong khong ton tai." });
    }

    if (req.user.role !== 'admin' && contract.account_id !== req.user.id) {
      return res.status(403).json({ message: "Ban khong co quyen thuc hien." });
    }

    if (contract.status !== "active" && contract.status !== "expired") {
      return res.status(400).json({ message: "Chi co the gia han hop dong active hoac expired." });
    }

    const newEnd = new Date(new_end_date);
    const currentEnd = new Date(contract.end_date);

    if (newEnd <= currentEnd) {
      return res.status(400).json({ message: "Ngay ket thuc moi phai lon hon ngay cu." });
    }

    contract.end_date = new_end_date;
    if (contract.status === "expired") {
      contract.status = "active";
      if (contract.room) {
        contract.room.status = "rented";
        await contract.room.save();
      }
    }
    await contract.save();

    return res.json({ message: "Gia han hop dong thanh cong.", contract });
  } catch (error) {
    next(error);
  }
};

const terminateContract = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { handover_status, note } = req.body;

    const contract = await Contract.findByPk(id, { include: ["room"] });
    if (!contract) {
      return res.status(404).json({ message: "Hop dong khong ton tai." });
    }

    if (req.user.role !== 'admin' && contract.account_id !== req.user.id) {
      return res.status(403).json({ message: "Ban khong co quyen thuc hien." });
    }

    if (contract.status !== "active" && contract.status !== "expired") {
      return res.status(400).json({ message: "Hop dong khong the thanh ly." });
    }

    contract.status = "terminated";
    contract.end_date = new Date().toISOString().split("T")[0];
    if (handover_status) contract.handover_status = handover_status;
    await contract.save();

    const remainingActive = await Contract.findOne({
      where: { room_id: contract.room_id, status: "active", id: { [Op.ne]: contract.id } },
    });
    if (!remainingActive && contract.room) {
      contract.room.status = "available";
      await contract.room.save();
    }

    return res.json({
      message: "Thanh ly hop dong thanh cong.",
      contract,
      room_status: contract.room?.status,
    });
  } catch (error) {
    next(error);
  }
};

const getExpiringContracts = async (req, res, next) => {
  try {
    const { days = 15 } = req.query;

    const contracts = await Contract.findAll({
      where: { status: "active" },
      include: [
        { model: Room, as: "room" },
        { model: Tenant, as: "tenant" },
      ],
      order: [["end_date", "ASC"]],
    });

    const expiring = contracts.filter((c) => isExpiringWithinDays(c.end_date, parseInt(days)));

    return res.json({ count: expiring.length, contracts: expiring });
  } catch (error) {
    next(error);
  }
};

const getContractsByRoom = async (req, res, next) => {
  try {
    const { roomId } = req.params;

    const contracts = await Contract.findAll({
      where: { room_id: parseInt(roomId) },
      include: [
        { model: Room, as: "room", attributes: ["id", "room_number", "room_name", "room_type", "base_price"] },
        { model: Tenant, as: "tenant", attributes: ["id", "full_name", "phone_number", "citizen_id"] },
      ],
      order: [["start_date", "DESC"]],
    });

    return res.json({ data: contracts, count: contracts.length });
  } catch (error) {
    next(error);
  }
};

const getContractTenants = async (req, res, next) => {
  try {
    const { id } = req.params;

    const contract = await Contract.findByPk(id, {
      attributes: ["id", "tenant_id", "tenant_ids", "room_id", "status"],
    });

    if (!contract) {
      return res.status(404).json({ message: "Hop dong khong ton tai." });
    }

    // Collect all tenant IDs: primary (tenant_id) + extra (tenant_ids array)
    const allTenantIds = new Set();
    if (contract.tenant_id) allTenantIds.add(contract.tenant_id);
    if (contract.tenant_ids && Array.isArray(contract.tenant_ids)) {
      contract.tenant_ids.forEach(id => allTenantIds.add(id));
    }

    if (allTenantIds.size === 0) {
      return res.json({ tenant_ids: [], tenants: [] });
    }

    const tenants = await Tenant.findAll({
      where: { id: { [Op.in]: [...allTenantIds] } },
      attributes: ["id", "full_name", "phone_number", "citizen_id"],
    });

    return res.json({
      tenant_id: contract.tenant_id,
      tenant_ids: [...allTenantIds],
      tenants,
    });
  } catch (error) {
    next(error);
  }
};

const getAvailableTenants = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const accountFilter = isAdmin ? {} : { account_id: req.user.id };

    // All tenants under this account
    const allTenants = await Tenant.findAll({
      attributes: ["id", "full_name", "phone_number", "citizen_id"],
      order: [["full_name", "ASC"]],
    });

    // Active contracts under this account
    const activeContracts = await Contract.findAll({
      where: {
        status: "active",
        ...accountFilter,
      },
      attributes: ["id", "tenant_id", "tenant_ids"],
    });

    const occupiedTenantIds = new Set();
    for (const c of activeContracts) {
      if (c.tenant_id) occupiedTenantIds.add(c.tenant_id);
      if (c.tenant_ids && Array.isArray(c.tenant_ids)) {
        c.tenant_ids.forEach(id => occupiedTenantIds.add(id));
      }
    }

    const availableTenants = allTenants.filter(t => !occupiedTenantIds.has(t.id));
    return res.json({ tenants: availableTenants });
  } catch (error) {
    next(error);
  }
};

const syncContractRoomStatus = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    // Find contracts that should be expired
    const contractsToExpire = await Contract.findAll({
      where: {
        end_date: { [Op.lt]: today },
        status: "active",
      },
    });

    if (contractsToExpire.length > 0) {
      const roomIds = contractsToExpire.map(c => c.room_id);

      // Update contracts to expired
      await Contract.update(
        { status: "expired" },
        { where: { id: { [Op.in]: contractsToExpire.map(c => c.id) } } }
      );

      // Only set room available if no other active contracts exist for that room
      const activeContracts = await Contract.findAll({
        where: {
          room_id: { [Op.in]: roomIds },
          status: "active",
          id: { [Op.notIn]: contractsToExpire.map(c => c.id) },
        },
      });
      const roomsToFree = roomIds.filter(rid => !activeContracts.some(c => c.room_id === rid));
      if (roomsToFree.length > 0) {
        await Room.update(
          { status: "available" },
          { where: { id: { [Op.in]: roomsToFree } } }
        );
      }
    }

    return res.json({
      message: "Dong bo thanh cong.",
      expired_contracts: contractsToExpire.length,
    });
  } catch (error) {
    next(error);
  }
};

const updateContract = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { start_date, end_date, deposit, price_per_month, terms, tenant_ids } = req.body;

    const contract = await Contract.findByPk(id, { include: ["room"] });
    if (!contract) {
      return res.status(404).json({ message: "Hop dong khong ton tai." });
    }

    if (req.user.role !== 'admin' && contract.account_id !== req.user.id) {
      return res.status(403).json({ message: "Ban khong co quyen thuc hien." });
    }

    if (contract.status === "terminated") {
      return res.status(400).json({ message: "Khong the sua hop dong da thanh ly." });
    }

    if (start_date && end_date) {
      const start = new Date(start_date);
      const end = new Date(end_date);
      if (end <= start) {
        return res.status(400).json({ message: "Ngay ket thuc phai lon hon ngay bat dau." });
      }
      contract.start_date = start_date;
      contract.end_date = end_date;
    } else if (start_date) {
      const start = new Date(start_date);
      const end = new Date(contract.end_date);
      if (end <= start) {
        return res.status(400).json({ message: "Ngay bat dau phai nho hon ngay ket thuc." });
      }
      contract.start_date = start_date;
    } else if (end_date) {
      const start = new Date(contract.start_date);
      const end = new Date(end_date);
      if (end <= start) {
        return res.status(400).json({ message: "Ngay ket thuc phai lon hon ngay bat dau." });
      }
      contract.end_date = end_date;
    }

    if (deposit !== undefined) contract.deposit = parseFloat(deposit) || 0;
    if (price_per_month !== undefined) contract.price_per_month = parseFloat(price_per_month);
    if (terms !== undefined) contract.terms = terms;

    // Cập nhật danh sách người thuê (chỉ khi có)
    if (tenant_ids !== undefined && Array.isArray(tenant_ids) && tenant_ids.length > 0) {
      contract.tenant_ids = tenant_ids;
      if (!contract.tenant_id || !tenant_ids.includes(contract.tenant_id)) {
        contract.tenant_id = tenant_ids[0];
      }
    }

    await contract.save();

    const updated = await Contract.findByPk(id, {
      include: [
        { model: Room, as: "room" },
        { model: Tenant, as: "tenant" },
      ],
    });

    return res.json({ message: "Cap nhat hop dong thanh cong.", contract: updated });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllContracts,
  getContractById,
  createContract,
  updateContract,
  renewContract,
  terminateContract,
  getExpiringContracts,
  getContractsByRoom,
  getContractTenants,
  getAvailableTenants,
  syncContractRoomStatus,
};
