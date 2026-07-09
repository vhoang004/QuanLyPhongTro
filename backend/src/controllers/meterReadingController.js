const { MeterReading, Room, Contract, Service, sequelize } = require("../models");
const { Op } = require("sequelize");
const { paginateQuery, buildPaginationResponse } = require("../services/helpers");

const getAllMeterReadings = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, room_id, billing_month, search } = req.query;

    const where = {};
    if (room_id) where.room_id = room_id;
    if (billing_month) where.billing_month = billing_month;

    let roomCondition = {};
    if (search) {
      roomCondition = {
        [Op.or]: [
          { "$room.room_number$": { [Op.like]: `%${search}%` } },
          { "$room.room_name$": { [Op.like]: `%${search}%` } },
        ],
      };
    }

    // Multi-tenant: filter by rooms belonging to this account
    if (req.user.role !== 'admin') {
      where.room_id = {
        [Op.in]: [
          sequelize.literal(
            `SELECT room_id FROM contracts WHERE account_id = ${parseInt(req.user.id)}`
          ),
        ],
      };
    }

    const { rows, count } = await MeterReading.findAndCountAll({
      where: { ...where, ...roomCondition },
      include: [
        { model: Room, as: "room", attributes: ["id", "room_number", "room_name"] },
      ],
      order: [["billing_month", "DESC"], ["room_id", "ASC"]],
      ...paginateQuery({ page, limit }),
    });

    const servicePrices = await getServicePrices();
    const readingsWithCost = rows.map((r) => {
      const elecUsed = r.current_electricity - r.prev_electricity;
      const waterUsed = r.current_water - r.prev_water;
      return {
        ...r.toJSON(),
        electricity_used: elecUsed,
        water_used: waterUsed,
        electricity_cost: elecUsed * servicePrices.electricity,
        water_cost: waterUsed * servicePrices.water,
      };
    });

    return res.json(buildPaginationResponse(readingsWithCost, count, page, limit));
  } catch (error) {
    next(error);
  }
};

const getServicePrices = async () => {
  try {
    const services = await Service.findAll();
    const prices = { electricity: 3500, water: 15000 };
    services.forEach((s) => {
      const name = s.service_name.toLowerCase();
      if (name.includes("dien") || name.includes("electric")) {
        prices.electricity = parseFloat(s.unit_price);
      } else if (name.includes("nuoc") || name.includes("water")) {
        prices.water = parseFloat(s.unit_price);
      }
    });
    return prices;
  } catch (error) {
    return { electricity: 3500, water: 15000 };
  }
};

const recordMeterReading = async (req, res, next) => {
  try {
    const { room_id, billing_month, current_electricity, current_water } = req.body;

    if (!room_id || !billing_month || current_electricity === undefined || current_water === undefined) {
      return res.status(400).json({ message: "Vui long dien day du thong tin." });
    }

    if (current_electricity < 0 || current_water < 0) {
      return res.status(400).json({ message: "Chi so khong duoc am." });
    }

    const room = await Room.findByPk(room_id);
    if (!room) return res.status(404).json({ message: "Phong khong ton tai." });

    const prevReading = await MeterReading.findOne({
      where: { room_id, billing_month: { [Op.lt]: billing_month } },
      order: [["billing_month", "DESC"]],
    });

    const prevElec = prevReading ? prevReading.current_electricity : 0;
    const prevWatr = prevReading ? prevReading.current_water : 0;

    if (current_electricity < prevElec) {
      return res.status(400).json({
        message: `Chi so dien moi (${current_electricity}) phai lon hon chi so cu (${prevElec}).`,
      });
    }
    if (current_water < prevWatr) {
      return res.status(400).json({
        message: `Chi so nuoc moi (${current_water}) phai lon hon chi so cu (${prevWatr}).`,
      });
    }

    const existing = await MeterReading.findOne({
      where: { room_id, billing_month },
    });

    if (existing) {
      existing.prev_electricity = prevElec;
      existing.current_electricity = current_electricity;
      existing.prev_water = prevWatr;
      existing.current_water = current_water;
      await existing.save();
      return res.json({ message: "Cap nhat chi so thanh cong.", meter_reading: existing });
    }

    const meterReading = await MeterReading.create({
      room_id,
      billing_month,
      prev_electricity: prevElec,
      current_electricity,
      prev_water: prevWatr,
      current_water,
    });

    return res.status(201).json({ message: "Ghi chi so thanh cong.", meter_reading: meterReading });
  } catch (error) {
    next(error);
  }
};

const recordBatchMeterReadings = async (req, res, next) => {
  try {
    const { readings, billing_month } = req.body;

    // #region agent log
    fetch('http://127.0.0.1:7691/ingest/b7170261-fdc1-4338-8711-7e3024e1f6c4',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'695c29'},body:JSON.stringify({sessionId:'695c29',location:'meterReadingController.js:145',message:'batch endpoint entered',data:{readingsCount:readings?.length,billing_month,readings:readings?.map(r=>({room_id:r.room_id,current_electricity:r.current_electricity,current_water:r.current_water}))},hypothesisId:'H1',runId:'initial',timestamp:Date.now()})}).catch(()=>{});
    // #endregion

    if (!readings || !Array.isArray(readings) || readings.length === 0) {
      return res.status(400).json({ message: "Danh sach doc so rong." });
    }
    if (!billing_month) {
      return res.status(400).json({ message: "Vui long chon ky thang." });
    }

    const results = [];
    const errors = [];

    const servicePrices = await getServicePrices();

    // Fix N+1: batch load all rooms in ONE query
    const roomIds = readings.map(r => r.room_id);
    const roomsMap = {};
    if (roomIds.length > 0) {
      const rooms = await Room.findAll({ where: { id: { [Op.in]: [...new Set(roomIds)] } } });
      rooms.forEach(r => { roomsMap[r.id] = r; });
    }

    // Fix N+1: batch load all previous readings for all rooms in ONE query
    const prevReadingsMap = {};
    if (roomIds.length > 0) {
      const allPrevReadings = await MeterReading.findAll({
        where: { room_id: { [Op.in]: [...new Set(roomIds)] }, billing_month: { [Op.lt]: billing_month } },
        order: [["billing_month", "DESC"]],
      });
      allPrevReadings.forEach(r => {
        if (!prevReadingsMap[r.room_id]) prevReadingsMap[r.room_id] = r;
      });
    }

    for (const reading of readings) {
      try {
        const { room_id, current_electricity, current_water } = reading;

        if (!room_id || current_electricity === undefined || current_water === undefined) {
          errors.push({ room_id, message: "Thong tin khong day du." });
          continue;
        }

        const room = roomsMap[room_id];
        if (!room) {
          errors.push({ room_id, message: "Phong khong ton tai." });
          continue;
        }

        const prevReading = prevReadingsMap[room_id];
        const prevElec = prevReading ? prevReading.current_electricity : 0;
        const prevWatr = prevReading ? prevReading.current_water : 0;

        const elecUsed = current_electricity - prevElec;
        const waterUsed = current_water - prevWatr;

        if (current_electricity < prevElec || current_electricity < 0) {
          // #region agent log
          fetch('http://127.0.0.1:7691/ingest/b7170261-fdc1-4338-8711-7e3024e1f6c4',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'695c29'},body:JSON.stringify({sessionId:'695c29',location:'meterReadingController.js:201',message:'electricity validation failed',data:{room_id,current_electricity,prevElec,reason:current_electricity<0?'negative':current_electricity<prevElec?'less_than_prev':'unknown'},hypothesisId:'H1',runId:'initial',timestamp:Date.now()})}).catch(()=>{});
          // #endregion
          errors.push({ room_id: room.room_number, message: `Chi so dien khong hop le (cu: ${prevElec}).` });
          continue;
        }
        if (current_water < prevWatr || current_water < 0) {
          // #region agent log
          fetch('http://127.0.0.1:7691/ingest/b7170261-fdc1-4338-8711-7e3024e1f6c4',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'695c29'},body:JSON.stringify({sessionId:'695c29',location:'meterReadingController.js:206',message:'water validation failed',data:{room_id,current_water,prevWatr,reason:current_water<0?'negative':current_water<prevWatr?'less_than_prev':'unknown'},hypothesisId:'H1',runId:'initial',timestamp:Date.now()})}).catch(()=>{});
          // #endregion
          errors.push({ room_id: room.room_number, message: `Chi so nuoc khong hop le (cu: ${prevWatr}).` });
          continue;
        }

        const existing = await MeterReading.findOne({
          where: { room_id, billing_month },
        });

        let meterReading;
        if (existing) {
          existing.prev_electricity = prevElec;
          existing.current_electricity = current_electricity;
          existing.prev_water = prevWatr;
          existing.current_water = current_water;
          await existing.save();
          meterReading = existing;
        } else {
          meterReading = await MeterReading.create({
            room_id,
            billing_month,
            prev_electricity: prevElec,
            current_electricity,
            prev_water: prevWatr,
            current_water,
          });
        }

        results.push({
          ...meterReading.toJSON(),
          room_number: room.room_number,
          electricity_used: elecUsed,
          water_used: waterUsed,
          electricity_cost: elecUsed * servicePrices.electricity,
          water_cost: waterUsed * servicePrices.water,
          unit_prices: servicePrices,
        });
      } catch (err) {
        errors.push({ room_id: reading.room_id, message: err.message });
      }
    }

    return res.json({
      message: `Ghi ${results.length}/${readings.length} chi so thanh cong.`,
      results,
      errors,
      unit_prices: servicePrices,
    });
    // #region agent log
    fetch('http://127.0.0.1:7691/ingest/b7170261-fdc1-4338-8711-7e3024e1f6c4',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'695c29'},body:JSON.stringify({sessionId:'695c29',location:'meterReadingController.js:250',message:'batch response sent',data:{resultsCount:results.length,errorsCount:errors.length,totalReadings:readings.length,errors:errors},hypothesisId:'H1',runId:'initial',timestamp:Date.now()})}).catch(()=>{});
    // #endregion
  } catch (error) {
    next(error);
  }
};

const getMeterReadingByRoom = async (req, res, next) => {
  try {
    const { room_id } = req.params;
    const { limit = 12 } = req.query;

    const readings = await MeterReading.findAll({
      where: { room_id },
      order: [["billing_month", "DESC"]],
      limit: parseInt(limit),
    });

    const servicePrices = await getServicePrices();
    const readingsWithCost = readings.map((r) => {
      const elecUsed = r.current_electricity - r.prev_electricity;
      const waterUsed = r.current_water - r.prev_water;
      return {
        ...r.toJSON(),
        electricity_used: elecUsed,
        water_used: waterUsed,
        electricity_cost: elecUsed * servicePrices.electricity,
        water_cost: waterUsed * servicePrices.water,
      };
    });

    return res.json({ readings: readingsWithCost });
  } catch (error) {
    next(error);
  }
};

const getServicePriceList = async (req, res, next) => {
  try {
    const services = await Service.findAll({
      order: [["id", "ASC"]],
    });
    const prices = { electricity: 3500, water: 15000 };
    services.forEach((s) => {
      const name = s.service_name.toLowerCase();
      if (name.includes("dien") || name.includes("electric")) {
        prices.electricity = parseFloat(s.unit_price);
      } else if (name.includes("nuoc") || name.includes("water")) {
        prices.water = parseFloat(s.unit_price);
      }
    });
    return res.json({ services, prices });
  } catch (error) {
    next(error);
  }
};

const getRoomsForMeterReading = async (req, res, next) => {
  try {
    const { billing_month } = req.query;

    const rooms = await Room.findAll({
      where: { status: "rented" },
      attributes: ["id", "room_number", "room_name", "base_price"],
      order: [["room_number", "ASC"]],
    });

    const readings = {};
    if (billing_month) {
      const monthReadings = await MeterReading.findAll({
        where: { billing_month },
        attributes: ["room_id", "prev_electricity", "current_electricity", "prev_water", "current_water"],
      });
      monthReadings.forEach((r) => {
        readings[r.room_id] = r.toJSON();
      });
    }

    const prevMonth = billing_month
      ? new Date(new Date(billing_month).getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0].slice(0, 7) + "-01"
      : null;

    const lastReadings = {};
    if (prevMonth) {
      const prevReadings = await MeterReading.findAll({
        where: { billing_month: { [Op.lte]: prevMonth } },
        attributes: ["room_id", "current_electricity", "current_water"],
        order: [["billing_month", "DESC"]],
      });
      prevReadings.forEach((r) => {
        if (!lastReadings[r.room_id]) {
          lastReadings[r.room_id] = r.toJSON();
        }
      });
    }

    const roomsWithReadings = rooms.map((r) => {
      const currentRead = readings[r.id] || null;
      const prevRead = lastReadings[r.id] || null;
      return {
        ...r.toJSON(),
        current_reading: currentRead,
        prev_reading: prevRead,
        has_reading: !!currentRead,
      };
    });

    return res.json({ rooms: roomsWithReadings });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllMeterReadings,
  recordMeterReading,
  recordBatchMeterReadings,
  getMeterReadingByRoom,
  getServicePriceList,
  getRoomsForMeterReading,
};
