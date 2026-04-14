import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

export default api;

// Jobs
export const jobsApi = {
  list: (params?: Record<string, string>) => api.get('/jobs', { params }),
  create: (data: unknown) => api.post('/jobs', data),
  get: (id: string) => api.get(`/jobs/${id}`),
  update: (id: string, data: unknown) => api.patch(`/jobs/${id}`, data),
  delete: (id: string) => api.delete(`/jobs/${id}`),
};

// Screening
export const screeningApi = {
  triggerUmurava: (jobId: string, data: unknown) =>
    api.post(`/jobs/${jobId}/screen/umurava`, data),
  triggerExternal: (jobId: string, file: File, topN: number) => {
    const form = new FormData();
    form.append('file', file);
    form.append('topN', String(topN));
    return api.post(`/jobs/${jobId}/screen/external`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getResults: (jobId: string) => api.get(`/jobs/${jobId}/screening-results`),
  getResultById: (jobId: string, resultId: string) =>
    api.get(`/jobs/${jobId}/screening-results/${resultId}`),
  exportCSV: (jobId: string, resultId: string) =>
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/jobs/${jobId}/screening-results/${resultId}/export`,
};

// Interview
export const interviewApi = {
  launch: (jobId: string) =>
    api.post(`/jobs/${jobId}/interviews`),
  getInterview: (jobId: string) =>
    api.get(`/jobs/${jobId}/interviews`),
  getSessions: (jobId: string, interviewId: string) =>
    api.get(`/jobs/${jobId}/interviews/${interviewId}/sessions`),
  triggerEvaluation: (jobId: string, interviewId: string) =>
    api.post(`/jobs/${jobId}/interviews/${interviewId}/evaluate`),
  advanceCandidate: (jobId: string, interviewId: string, sessionId: string, advance: boolean) =>
    api.patch(`/jobs/${jobId}/interviews/${interviewId}/sessions/${sessionId}/advance`, { advance }),
  exportCSV: (jobId: string, interviewId: string) =>
    `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api/v1'}/jobs/${jobId}/interviews/${interviewId}/export`,
  getCandidateSession: (token: string) =>
    api.get(`/interview-session/${token}`),
  submitResponses: (token: string, responses: { questionId: string; answerText: string }[]) =>
    api.post(`/interview-session/${token}/responses`, { responses }),
};

// Umurava
export const umuravaApi = {
  getTalents: (params?: Record<string, string>) => api.get('/umurava/talents', { params }),
};
