import api from './client';

export const getStats    = () => api.get('/stats').then((r) => r.data);
export const getActivity = () => api.get('/stats/activity').then((r) => r.data);
