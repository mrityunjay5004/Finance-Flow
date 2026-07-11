const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

const generateToken = (id) => jwt.sign({ id }, config.jwt.secret, {
  expiresIn: config.jwt.expiresIn,
});

const register = async ({ name, email, password }) => {
  if (await User.findOne({ email })) {
    throw new ApiError(409, 'Email already in use');
  }

  const user = await User.create({ name, email, password, role: 'analyst' });
  
  return {
    user: { id: user._id, name, email, role: user.role },
    token: generateToken(user._id),
  };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');
  
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  if (user.status === 'inactive') {
    throw new ApiError(403, 'Your account is deactivated');
  }

  return {
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    token: generateToken(user._id),
  };
};

module.exports = { register, login };
