const prisma = require('../db');
const sm2 = require('../services/sm2');

exports.getCards = async (req, res, next) => {
  try {
    const { languagePairId, limit = 20 } = req.query;

    if (!languagePairId) {
      return res.status(400).json({ error: 'languagePairId is required' });
    }

    const pair = await prisma.languagePair.findFirst({
      where: { id: languagePairId, userId: req.user.id },
    });
    if (!pair) return res.status(404).json({ error: 'Language pair not found' });

    const now = new Date();
    const cardLimit = Math.min(Number(limit), 50);

    const words = await prisma.word.findMany({
      where: { languagePairId, userId: req.user.id },
      include: { progress: { where: { userId: req.user.id } } },
    });

    const due = [];
    const newCards = [];

    for (const word of words) {
      for (const direction of ['forward', 'backward']) {
        const progress = word.progress.find((p) => p.direction === direction);
        const displaySource = direction === 'forward' ? word.sourceWord : word.targetWord;
        const displayTarget = direction === 'forward' ? word.targetWord : word.sourceWord;

        if (!progress) {
          newCards.push({
            wordId: word.id,
            direction,
            sourceWord: displaySource,
            targetWord: displayTarget,
            isNew: true,
            progress: null,
          });
        } else if (progress.nextReview <= now) {
          due.push({
            wordId: word.id,
            direction,
            sourceWord: displaySource,
            targetWord: displayTarget,
            isNew: false,
            progress: {
              easeFactor: progress.easeFactor,
              interval: progress.interval,
              repetitions: progress.repetitions,
              nextReview: progress.nextReview,
            },
          });
        }
      }
    }

    // New cards first, then due sorted by overdue-ness
    due.sort((a, b) => new Date(a.progress.nextReview) - new Date(b.progress.nextReview));
    const allDue = [...newCards, ...due];
    const selected = allDue.slice(0, cardLimit);

    // Shuffle
    for (let i = selected.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [selected[i], selected[j]] = [selected[j], selected[i]];
    }

    res.json({
      cards: selected,
      totalDue: allDue.length,
      languagePair: pair,
    });
  } catch (error) {
    next(error);
  }
};

exports.submitReview = async (req, res, next) => {
  try {
    const { wordId, direction, quality } = req.body;

    if (!wordId || !direction || quality === undefined) {
      return res.status(400).json({ error: 'wordId, direction and quality are required' });
    }
    if (quality < 0 || quality > 5) {
      return res.status(400).json({ error: 'Quality must be 0–5' });
    }
    if (!['forward', 'backward'].includes(direction)) {
      return res.status(400).json({ error: 'Direction must be "forward" or "backward"' });
    }

    const word = await prisma.word.findFirst({
      where: { id: wordId, userId: req.user.id },
    });
    if (!word) return res.status(404).json({ error: 'Word not found' });

    const existing = await prisma.wordProgress.findUnique({
      where: { userId_wordId_direction: { userId: req.user.id, wordId, direction } },
    });

    const current = existing || { easeFactor: 2.5, interval: 0, repetitions: 0 };
    const next = sm2.calculate(current, quality);

    const updated = await prisma.wordProgress.upsert({
      where: { userId_wordId_direction: { userId: req.user.id, wordId, direction } },
      update: {
        easeFactor: next.easeFactor,
        interval: next.interval,
        repetitions: next.repetitions,
        nextReview: next.nextReview,
        lastReview: new Date(),
      },
      create: {
        userId: req.user.id,
        wordId,
        direction,
        easeFactor: next.easeFactor,
        interval: next.interval,
        repetitions: next.repetitions,
        nextReview: next.nextReview,
        lastReview: new Date(),
      },
    });

    // Update daily stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.dailyStats.upsert({
      where: { userId_date: { userId: req.user.id, date: today } },
      update: {
        cardsStudied: { increment: 1 },
        correctAnswers: { increment: quality >= 3 ? 1 : 0 },
      },
      create: {
        userId: req.user.id,
        date: today,
        cardsStudied: 1,
        correctAnswers: quality >= 3 ? 1 : 0,
      },
    });

    res.json({ progress: updated, nextReview: next.nextReview });
  } catch (error) {
    next(error);
  }
};
