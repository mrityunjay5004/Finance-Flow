const authService = require('../services/auth.service');
const catchAsync = require('../utils/catchAsync');

const register = catchAsync(async (req, res) => {
  const result = await authService.register(req.body);
  res.status(201).json({ success: true, ...result });
});

const login = catchAsync(async (req, res) => {
  const result = await authService.login(req.body);
  res.json({ success: true, ...result });
});

const me = catchAsync(async (req, res) => {
  const { _id, name, email, role } = req.user;
  res.json({
    success: true,
    user: { id: _id, name, email, role }
  });
});

module.exports = { register, login, me };
