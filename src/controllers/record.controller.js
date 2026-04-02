const recordService = require('../services/record.service');
const catchAsync = require('../utils/catchAsync');

const create = catchAsync(async (req, res) => {
  const record = await recordService.create(req.body, req.user._id);
  res.status(201).json({ success: true, record });
});

const getAll = catchAsync(async (req, res) => {
  const result = await recordService.getAll(req.query, req.user._id);
  res.json({ success: true, ...result });
});

const getById = catchAsync(async (req, res) => {
  const record = await recordService.getById(req.params.id, req.user._id);
  res.json({ success: true, record });
});

const update = catchAsync(async (req, res) => {
  const record = await recordService.update(req.params.id, req.body, req.user._id);
  res.json({ success: true, record });
});

const remove = catchAsync(async (req, res) => {
  await recordService.softDelete(req.params.id, req.user._id);
  res.json({ success: true, message: 'Record deleted successfully' });
});

module.exports = { create, getAll, getById, update, remove };
