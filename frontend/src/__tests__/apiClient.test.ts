import apiClient from '@/api/client';

describe('API Client', () => {
  it('has empty baseURL', () => {
    expect(apiClient.defaults.baseURL).toBe('');
  });

  it('sets Content-Type header', () => {
    expect(apiClient.defaults.headers['Content-Type']).toBe('application/json');
  });
});