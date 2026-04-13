const bcrypt = require('bcryptjs');
const prisma = require('../db');

exports.getProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, name: true, createdAt: true },
    });
    res.json(user);
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name } = req.body;

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { name: name?.trim() || null },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required' });
    }

    // Password rules
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' });
    }
    if (!/[A-Z]/.test(newPassword)) {
      return res.status(400).json({ error: 'New password must contain at least one uppercase letter' });
    }
    if (!/[a-z]/.test(newPassword)) {
      return res.status(400).json({ error: 'New password must contain at least one lowercase letter' });
    }
    if (!/[^A-Za-z0-9]/.test(newPassword)) {
      return res.status(400).json({ error: 'New password must contain at least one special character' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { passwordHash },
    });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};
