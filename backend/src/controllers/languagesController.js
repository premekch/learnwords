const prisma = require('../db');

exports.list = async (req, res, next) => {
  try {
    const pairs = await prisma.languagePair.findMany({
      where: { userId: req.user.id },
      include: { _count: { select: { words: true } } },
      orderBy: { createdAt: 'asc' },
    });
    res.json(pairs);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { sourceLanguage, targetLanguage } = req.body;

    if (!sourceLanguage?.trim() || !targetLanguage?.trim()) {
      return res.status(400).json({ error: 'Source and target language are required' });
    }
    if (sourceLanguage.trim().toLowerCase() === targetLanguage.trim().toLowerCase()) {
      return res.status(400).json({ error: 'Source and target language must be different' });
    }

    const pair = await prisma.languagePair.create({
      data: {
        userId: req.user.id,
        sourceLanguage: sourceLanguage.trim(),
        targetLanguage: targetLanguage.trim(),
      },
      include: { _count: { select: { words: true } } },
    });

    res.status(201).json(pair);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'This language pair already exists' });
    }
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const pair = await prisma.languagePair.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!pair) return res.status(404).json({ error: 'Language pair not found' });

    await prisma.languagePair.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};
