import api from './client';

export const getWords   = (params) => api.get('/words', { params }).then((r) => r.data);
export const createWord = (data)   => api.post('/words', data).then((r) => r.data);
export const updateWord = (id, data) => api.put(`/words/${id}`, data).then((r) => r.data);
export const deleteWord = (id)     => api.delete(`/words/${id}`).then((r) => r.data);

export const importWords = (languagePairId, file) => {
  const form = new FormData();
  form.append('languagePairId', languagePairId);
  form.append('file', file);
  return api.post('/words/import', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data);
};
