import api from './client';

export const getLanguagePairs  = ()     => api.get('/languages').then((r) => r.data);
export const createLanguagePair = (data) => api.post('/languages', data).then((r) => r.data);
export const deleteLanguagePair = (id)   => api.delete(`/languages/${id}`).then((r) => r.data);
