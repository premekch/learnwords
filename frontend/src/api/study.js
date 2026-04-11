import api from './client';

export const getStudyCards = (languagePairId, limit = 20) =>
  api.get('/study/cards', { params: { languagePairId, limit } }).then((r) => r.data);

export const submitReview = (data) =>
  api.post('/study/review', data).then((r) => r.data);
