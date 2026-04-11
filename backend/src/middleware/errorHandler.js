module.exports = (err, req, res, next) => {
  console.error(err.stack || err.message);

  // Prisma unique constraint violation
  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'Already exists' });
  }

  // Multer file type error
  if (err.message && err.message.includes('Only .xlsx and .csv')) {
    return res.status(400).json({ error: err.message });
  }

  const status = err.status || 500;
  const message =
    process.env.NODE_ENV === 'production' && status === 500
      ? 'Internal server error'
      : err.message;

  res.status(status).json({ error: message });
};
