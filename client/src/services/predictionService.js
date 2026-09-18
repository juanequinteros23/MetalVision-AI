import api from './api';

export const predictionService = {
  async predictSingle(file, modelName = 'ensemble') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('model', modelName);

    const response = await api.post('/predictions/predict', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async predictBatch(files, modelName = 'ensemble') {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    formData.append('model', modelName);

    const response = await api.post('/predictions/batch', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async getHistory(limit = 50, offset = 0) {
    const response = await api.get(`/predictions/history?limit=${limit}&offset=${offset}`);
    return response.data;
  },

  async getPredictionById(id) {
    const response = await api.get(`/predictions/${id}`);
    return response.data;
  },

  async getStats() {
    const response = await api.get('/predictions/stats');
    return response.data;
  },

  async getModelsInfo() {
    const response = await api.get('/predictions/models/info');
    return response.data;
  }
};
