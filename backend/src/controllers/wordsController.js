const prisma = require('../db');
const { parseFile } = require('../services/importService');

const verifyPairOwnership = async (pairId, userId) => {
  const pair = await prisma.languagePair.findFirst({
    where: { id: pairId, userId },
  });
  return pair;
};

exports.list = async (req, res, next) => {
  try {
    const { languagePairId, search, page = 1, limit = 50 } = req.query;

    if (!languagePairId) {
      return res.status(400).json({ error: 'languagePairId is required' });
    }

    const pair = await verifyPairOwnership(languagePairId, req.user.id);
    if (!pair) return res.status(404).json({ error: 'Language pair not found' });

    const where = {
      languagePairId,
      userId: req.user.id,
      ...(search && {
        OR: [
          { sourceWord: { contains: search, mode: 'insensitive' } },
          { targetWord: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [words, total] = await Promise.all([
      prisma.word.findMany({
        where,
        include: { progress: { where: { userId: req.user.id } } },
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      prisma.word.count({ where }),
    ]);

    res.json({ words, total, page: Number(page), limit: Number(limit) });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { languagePairId, sourceWord, targetWord } = req.body;

    if (!languagePairId || !sourceWord?.trim() || !targetWord?.trim()) {
      return res.status(400).json({ error: 'languagePairId, sourceWord and targetWord are required' });
    }

    const pair = await verifyPairOwnership(languagePairId, req.user.id);
    if (!pair) return res.status(404).json({ error: 'Language pair not found' });

    const word = await prisma.word.create({
      data: {
        userId: req.user.id,
        languagePairId,
        sourceWord: sourceWord.trim(),
        targetWord: targetWord.trim(),
      },
    });

    res.status(201).json(word);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const word = await prisma.word.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!word) return res.status(404).json({ error: 'Word not found' });

    const { sourceWord, targetWord } = req.body;
    const updated = await prisma.word.update({
      where: { id: req.params.id },
      data: {
        ...(sourceWord?.trim() && { sourceWord: sourceWord.trim() }),
        ...(targetWord?.trim() && { targetWord: targetWord.trim() }),
      },
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const word = await prisma.word.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!word) return res.status(404).json({ error: 'Word not found' });

    await prisma.word.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

exports.importFile = async (req, res, next) => {
  try {
    const { languagePairId } = req.body;

    if (!languagePairId) {
      return res.status(400).json({ error: 'languagePairId is required' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'File is required' });
    }

    const pair = await verifyPairOwnership(languagePairId, req.user.id);
    if (!pair) return res.status(404).json({ error: 'Language pair not found' });

    const rows = parseFile(req.file);
    if (rows.length === 0) {
      return res.status(400).json({ error: 'No valid word pairs found in file. Expected: header row + rows with two columns (word, translation).' });
    }

    const result = await prisma.word.createMany({
      data: rows.map((row) => ({
        userId: req.user.id,
        languagePairId,
        sourceWord: row.source,
        targetWord: row.target,
      })),
      skipDuplicates: true,
    });

    res.status(201).json({ imported: result.count, total: rows.length });
  } catch (error) {
    next(error);
  }
};
