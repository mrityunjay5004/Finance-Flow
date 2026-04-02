const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const paginate = require('../utils/paginate');

const getAll = async (query) => {
  const { page, limit, skip } = paginate(query);
  const filter = {};

  if (query.search) {
    const searchRegex = new RegExp(query.search, 'i');
    filter.$or = [{ name: searchRegex }, { email: searchRegex }];
  }

  const [users, total] = await Promise.all([
    User.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
    User.countDocuments(filter)
  ]);

  return {
    users,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

const getById = async (id) => {
  const user = await User.findById(id);
  if (!user) throw new ApiError(404, 'User not found');
  return user;
};

const update = async (id, data) => {
  delete data.password;
  delete data.email;

  const user = await User.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true
  });

  if (!user) throw new ApiError(404, 'User not found');
  return user;
};

const remove = async (id) => {
  const user = await User.findByIdAndDelete(id);
  if (!user) throw new ApiError(404, 'User not found');
  return user;
};

module.exports = { getAll, getById, update, remove };
