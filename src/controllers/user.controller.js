const userService = require('../services/user.service');
const catchAsync = require('../utils/catchAsync');

const getAll = catchAsync(async (req, res) => {
  const result = await userService.getAll(req.query);
  res.json({ success: true, ...result });
});

const getById = catchAsync(async (req, res) => {
  const user = await userService.getById(req.params.id);
  res.json({ success: true, user });
});

const update = catchAsync(async (req, res) => {
  const user = await userService.update(req.params.id, req.body);
  res.json({ success: true, user });
});

const remove = catchAsync(async (req, res) => {
  await userService.remove(req.params.id);
  res.json({ success: true, message: 'User deleted successfully' });
});

module.exports = { getAll, getById, update, remove };
