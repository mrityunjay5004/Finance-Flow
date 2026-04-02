const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

const authenticate = catchAsync(async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw new ApiError(401, 'Authentication required');
  }

  const token = header.split(' ')[1];
  const decoded = jwt.verify(token, config.jwt.secret);

  const user = await User.findById(decoded.id);
  if (!user || user.status === 'inactive') {
    throw new ApiError(401, 'User not found or inactive');
  }

  req.user = user;
  next();
});

module.exports = authenticate;
