const prisma = require('../db');

exports.getStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalWords, totalPairs, learnedWords, todayStats, recentDays, allTime] =
      await Promise.all([
        prisma.word.count({ where: { userId } }),
        prisma.languagePair.count({ where: { userId } }),
        // "Learned" = forward direction has interval > 21 days (mature card)
        prisma.wordProgress.count({
          where: { userId, direction: 'forward', interval: { gt: 21 } },
        }),
        prisma.dailyStats.findUnique({
          where: { userId_date: { userId, date: today } },
        }),
        prisma.dailyStats.findMany({
          where: { userId },
          orderBy: { date: 'desc' },
          take: 60,
        }),
        prisma.dailyStats.aggregate({
          where: { userId },
          _sum: { cardsStudied: true, correctAnswers: true },
        }),
      ]);

    // Calculate streak
    let streak = 0;
    const todayStr = today.toISOString().split('T')[0];
    const yesterdayStr = new Date(today.getTime() - 86400000).toISOString().split('T')[0];

    const dayStrings = recentDays
      .map((d) => d.date.toISOString().split('T')[0])
      .sort()
      .reverse();

    if (dayStrings.length > 0 && (dayStrings[0] === todayStr || dayStrings[0] === yesterdayStr)) {
      streak = 1;
      for (let i = 1; i < dayStrings.length; i++) {
        const diff =
          (new Date(dayStrings[i - 1]) - new Date(dayStrings[i])) / (1000 * 60 * 60 * 24);
        if (diff === 1) {
          streak++;
        } else {
          break;
        }
      }
    }

    const totalStudied = allTime._sum.cardsStudied || 0;
    const totalCorrect = allTime._sum.correctAnswers || 0;
    const accuracy = totalStudied > 0 ? Math.round((totalCorrect / totalStudied) * 100) : 0;

    res.json({
      totalWords,
      totalPairs,
      learnedWords,
      todayCardsStudied: todayStats?.cardsStudied || 0,
      todayCorrectAnswers: todayStats?.correctAnswers || 0,
      streak,
      totalStudied,
      accuracy,
    });
  } catch (error) {
    next(error);
  }
};

exports.getActivity = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 89);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const stats = await prisma.dailyStats.findMany({
      where: { userId, date: { gte: thirtyDaysAgo } },
      orderBy: { date: 'asc' },
    });

    res.json(stats);
  } catch (error) {
    next(error);
  }
};
