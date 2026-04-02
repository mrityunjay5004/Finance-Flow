const Record = require('../models/Record');
const ApiError = require('../utils/ApiError');
const paginate = require('../utils/paginate');

const create = (data, userId) => {
  return Record.create({ ...data, createdBy: userId });
};

const getAll = async (query, userId) => {
  const { page, limit, skip } = paginate(query);
  const filter = { createdBy: userId, isDeleted: false };

  if (query.type) filter.type = query.type;
  if (query.category) filter.category = new RegExp(query.category, 'i');
  
  if (query.startDate || query.endDate) {
    filter.date = {
      ...(query.startDate && { $gte: new Date(query.startDate) }),
      ...(query.endDate && { $lte: new Date(query.endDate) })
    };
  }

  if (query.search) {
    const searchRegex = new RegExp(query.search, 'i');
    filter.$or = [
      { category: searchRegex },
      { notes: searchRegex }
    ];
  }

  const [records, total] = await Promise.all([
    Record.find(filter).skip(skip).limit(limit).sort({ date: -1 }),
    Record.countDocuments(filter)
  ]);

  return { 
    records, 
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

const getById = async (id, userId) => {
  const record = await Record.findOne({ _id: id, createdBy: userId, isDeleted: false });
  if (!record) throw new ApiError(404, 'Record not found');
  return record;
};

const update = async (id, data, userId) => {
  const record = await Record.findOneAndUpdate(
    { _id: id, createdBy: userId, isDeleted: false },
    data,
    { new: true, runValidators: true }
  );
  if (!record) throw new ApiError(404, 'Record not found');
  return record;
};

const softDelete = async (id, userId) => {
  const record = await Record.findOneAndUpdate(
    { _id: id, createdBy: userId, isDeleted: false },
    { isDeleted: true },
    { new: true }
  );
  if (!record) throw new ApiError(404, 'Record not found');
  return record;
};

module.exports = { create, getAll, getById, update, softDelete };
