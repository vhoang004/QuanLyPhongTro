const { Room, Contract, Tenant, sequelize } = require("../models");
const { Op } = require("sequelize");
const { paginateQuery, buildPaginationResponse } = require("../services/helpers");

const getAllRooms = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = "", status, room_type, floor } = req.query;

    const where = {};
    if (search) {
      where[Op.or] = [
        { room_number: { [Op.like]: `%${search}%` } },
        { room_name: { [Op.like]: `%${search}%` } },
      ];
    }
    if (status) where.status = status;
    if (room_type) where.room_type = room_type;
    if (floor) where.floor = parseInt(floor);

    // Multi-tenant: filter rooms that belong to this account via active contracts
    if (req.user.role !== 'admin') {
      where.id = {
        [Op.in]: [
          sequelize.literal(
            `SELECT room_id FROM contracts WHERE account_id = ${parseInt(req.user.id)}`
          ),
        ],
      };
    }

    const { rows, count } = await Room.findAndCountAll({
      where,
      order: [["floor", "ASC"], ["room_number", "ASC"]],
      ...paginateQuery({ page, limit }),
      include: [
        {
          model: Contract,
          as: "contracts",
          attributes: [],
          where: { status: "active" },
          required: false,
        },
      ],
      attributes: {
        include: [
          [
            sequelize.literal(`(
              SELECT COUNT(DISTINCT tenant_id) FROM (
                SELECT c.tenant_id FROM contracts c WHERE c.room_id = Room.id AND c.status = 'active' AND c.tenant_id IS NOT NULL
                UNION ALL
                SELECT jt.tenant_id FROM contracts c, JSON_TABLE(c.tenant_ids, '$[*]' COLUMNS (tenant_id INT PATH '$')) AS jt WHERE c.room_id = Room.id AND c.status = 'active'
              ) AS all_tenants
            )`),
            "current_tenants",
          ],
        ],
      },
    });

    return res.json(buildPaginationResponse(rows, count, page, limit));
  } catch (error) {
    next(error);
  }
};

const getRoomById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const room = await Room.findByPk(id);

    if (!room) {
      return res.status(404).json({ message: "Phong khong ton tai." });
    }

    // Fetch contracts with all tenants expanded (tenant_id + tenant_ids array)
    const contractsSql = `
      SELECT
        c.*,
        t_main.id AS main_tenant_id,
        t_main.full_name AS main_tenant_name,
        t_main.citizen_id AS main_tenant_citizen_id,
        t_main.phone_number AS main_tenant_phone,
        GROUP_CONCAT(DISTINCT jt.tenant_id ORDER BY jt.tenant_id) AS extra_tenant_ids
      FROM contracts c
      LEFT JOIN tenants t_main ON c.tenant_id = t_main.id
      LEFT JOIN JSON_TABLE(c.tenant_ids, '$[*]' COLUMNS (tenant_id INT PATH '$')) AS jt
      WHERE c.room_id = :roomId
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `;

    const rawContracts = await sequelize.query(contractsSql, {
      replacements: { roomId: id },
      type: sequelize.QueryTypes.SELECT,
    });

    // Resolve extra tenants names
    const extraTenantIds = [...new Set(rawContracts.flatMap(c =>
      c.extra_tenant_ids ? c.extra_tenant_ids.split(',').map(Number) : []
    ))];

    let extraTenantsMap = {};
    if (extraTenantIds.length > 0) {
      const extraTenants = await Tenant.findAll({
        where: { id: extraTenantIds },
        attributes: ['id', 'full_name', 'citizen_id', 'phone_number'],
      });
      extraTenantsMap = Object.fromEntries(extraTenants.map(t => [t.id, t]));
    }

    const contracts = rawContracts.map(c => {
      const extraIds = c.extra_tenant_ids ? c.extra_tenant_ids.split(',').map(Number) : [];
      return {
        ...c,
        extra_tenant_ids: undefined,
        main_tenant_id: undefined,
        main_tenant_name: undefined,
        main_tenant_citizen_id: undefined,
        main_tenant_phone: undefined,
        mainTenant: c.main_tenant_id ? {
          id: c.main_tenant_id,
          full_name: c.main_tenant_name,
          citizen_id: c.main_tenant_citizen_id,
          phone_number: c.main_tenant_phone,
        } : null,
        extraTenants: extraIds.map(tid => extraTenantsMap[tid]).filter(Boolean),
      };
    });

    return res.json({ room, contracts });
  } catch (error) {
    next(error);
  }
};

const createRoom = async (req, res, next) => {
  try {
    const {
      room_number, room_name, room_type, base_price, area, floor,
      address, description, amenities, deposit_amount,
      electricity_price, water_price, internet_price, parking_price, other_services_price
    } = req.body;

    if (!room_number || !base_price) {
      return res.status(400).json({ message: "So phong va gia thue la bat buoc." });
    }

    const existing = await Room.findOne({ where: { room_number } });
    if (existing) {
      return res.status(409).json({ message: "So phong da ton tai." });
    }

    const room = await Room.create({
      room_number,
      room_name,
      room_type,
      base_price,
      area,
      floor: floor || 1,
      address,
      description,
      amenities: amenities || [],
      images: [],
      deposit_amount: deposit_amount || 0,
      electricity_price: electricity_price || 3500,
      water_price: water_price || 15000,
      internet_price: internet_price || 0,
      parking_price: parking_price || 0,
      other_services_price: other_services_price || 0,
      status: "available",
    });

    return res.status(201).json({ message: "Tao phong thanh cong.", room });
  } catch (error) {
    next(error);
  }
};

const updateRoom = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      room_number, room_name, room_type, base_price, area, floor,
      address, description, amenities, status, images,
      deposit_amount, electricity_price, water_price, internet_price,
      parking_price, other_services_price
    } = req.body;

    const room = await Room.findByPk(id);
    if (!room) {
      return res.status(404).json({ message: "Phong khong ton tai." });
    }

    if (room_number && room_number !== room.room_number) {
      const existing = await Room.findOne({ where: { room_number } });
      if (existing) {
        return res.status(409).json({ message: "So phong da ton tai." });
      }
    }

    const fields = {
      room_number, room_name, room_type, base_price, area, floor,
      address, description, amenities, status, images,
      deposit_amount, electricity_price, water_price, internet_price,
      parking_price, other_services_price
    };

    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) room[key] = value;
    }

    await room.save();
    return res.json({ message: "Cap nhat phong thanh cong.", room });
  } catch (error) {
    next(error);
  }
};

const deleteRoom = async (req, res, next) => {
  try {
    const { id } = req.params;

    const room = await Room.findByPk(id);
    if (!room) {
      return res.status(404).json({ message: "Phong khong ton tai." });
    }

    const activeContract = await Contract.findOne({
      where: { room_id: id, status: "active" },
    });

    if (activeContract) {
      return res.status(400).json({
        message: "Phong dang co hop dong active. Vui long thanh ly hop dong truoc.",
      });
    }

    await room.destroy();
    return res.json({ message: "Xoa phong thanh cong." });
  } catch (error) {
    next(error);
  }
};

const uploadRoomImages = async (req, res, next) => {
  try {
    const { id } = req.params;

    const room = await Room.findByPk(id);
    if (!room) {
      return res.status(404).json({ message: "Phong khong ton tai." });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Khong co anh nao duoc tai len." });
    }

    const newImages = req.files.map((f) => `/uploads/${f.filename}`);
    const existingImages = Array.isArray(room.images) ? room.images : [];
    room.images = [...existingImages, ...newImages];
    await room.save();

    return res.json({ message: "Tai anh thanh cong.", images: room.images });
  } catch (error) {
    next(error);
  }
};

const deleteRoomImage = async (req, res, next) => {
  try {
    const { id, imageIndex } = req.params;

    const room = await Room.findByPk(id);
    if (!room) {
      return res.status(404).json({ message: "Phong khong ton tai." });
    }

    const images = Array.isArray(room.images) ? [...room.images] : [];
    const index = parseInt(imageIndex);

    if (index < 0 || index >= images.length) {
      return res.status(400).json({ message: "Chi so anh khong hop le." });
    }

    images.splice(index, 1);
    room.images = images;
    await room.save();

    return res.json({ message: "Xoa anh thanh cong.", images: room.images });
  } catch (error) {
    next(error);
  }
};

const getRoomStats = async (req, res, next) => {
  try {
    // Multi-tenant: admin sees all, manager sees only their own
    let where = {};
    if (req.user.role !== 'admin') {
      where.id = {
        [Op.in]: [
          sequelize.literal(
            `SELECT room_id FROM contracts WHERE account_id = ${parseInt(req.user.id)}`
          ),
        ],
      };
    }
    const allRooms = await Room.findAll({ where: { ...where, status: { [Op.ne]: "inactive" } } });
    const total = allRooms.length;
    const available = allRooms.filter(r => r.status === "available").length;
    const rented = allRooms.filter(r => r.status === "rented").length;
    const maintenance = allRooms.filter(r => r.status === "maintenance").length;

    return res.json({ total, available, rented, maintenance });
  } catch (error) {
    next(error);
  }
};

const getRoomTypesStats = async (req, res, next) => {
  try {
    // Multi-tenant: admin sees all, manager sees only their own
    let roomWhere = {};
    if (req.user.role !== 'admin') {
      roomWhere.id = {
        [Op.in]: [
          sequelize.literal(
            `SELECT room_id FROM contracts WHERE account_id = ${parseInt(req.user.id)}`
          ),
        ],
      };
    }

    const stats = await Room.findAll({
      where: roomWhere,
      attributes: [
        "room_type",
        [sequelize.fn("COUNT", sequelize.col("id")), "total"],
        [sequelize.fn("SUM", sequelize.literal("CASE WHEN status = 'available' THEN 1 ELSE 0 END")), "available"],
        [sequelize.fn("SUM", sequelize.literal("CASE WHEN status = 'rented' THEN 1 ELSE 0 END")), "rented"],
      ],
      group: ["room_type"],
    });

    return res.json({ stats });
  } catch (error) {
    next(error);
  }
};

const syncRoomStatus = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    // Multi-tenant: admin syncs all, manager syncs only their own
    const contractWhere = req.user.role !== 'admin'
      ? { status: "active", account_id: req.user.id }
      : { status: "active" };

    // Auto-expire contracts where end_date < today
    await Contract.update(
      { status: "expired" },
      { where: { end_date: { [Op.lt]: today }, ...contractWhere } }
    );

    // Get rooms that belong to this account
    let roomWhere = {};
    if (req.user.role !== 'admin') {
      roomWhere.id = {
        [Op.in]: [
          sequelize.literal(
            `SELECT room_id FROM contracts WHERE account_id = ${parseInt(req.user.id)}`
          ),
        ],
      };
    }
    const rooms = await Room.findAll({ where: { ...roomWhere, status: { [Op.ne]: "inactive" } } });

    const results = { fixed: [], errors: [] };

    // Fix N+1: batch load active contracts
    const roomIds = rooms.map(r => r.id);
    const activeContractsByRoom = {};
    if (roomIds.length > 0) {
      const activeContracts = await Contract.findAll({
        where: { room_id: { [Op.in]: roomIds }, status: "active" },
        attributes: ["id", "room_id"],
      });
      activeContracts.forEach(c => { activeContractsByRoom[c.room_id] = c; });
    }

    for (const room of rooms) {
      const activeContract = activeContractsByRoom[room.id];

      if (activeContract && room.status !== "rented") {
        await room.update({ status: "rented" });
        results.fixed.push({ room: room.room_number, from: room.status, to: "rented" });
      } else if (!activeContract && room.status === "rented") {
        await room.update({ status: "available" });
        results.fixed.push({ room: room.room_number, from: "rented", to: "available" });
      }
    }

    return res.json({
      message: "Dong bo trang thai phong thanh cong.",
      total_rooms: rooms.length,
      fixed_count: results.fixed.length,
      fixed_rooms: results.fixed,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  uploadRoomImages,
  deleteRoomImage,
  getRoomStats,
  getRoomTypesStats,
  syncRoomStatus,
};
