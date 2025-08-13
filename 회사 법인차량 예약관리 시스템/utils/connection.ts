import { ConnectionStatus } from '../types';
import { apiClient } from './api';

export const connectionUtils = {
  // 연결 상태 확인
  checkConnection: async (): Promise<{ connected: boolean; isUsingMockData: boolean }> => {
    try {
      const health = await apiClient.healthCheck();
      return {
        connected: health.connected,
        isUsingMockData: apiClient.isUsingMockData()
      };
    } catch (error) {
      return {
        connected: false,
        isUsingMockData: true
      };
    }
  },

  // 서버 연결 재시도
  retryConnection: async (): Promise<{ connected: boolean }> => {
    try {
      const result = await apiClient.retryConnection();
      return result;
    } catch (error) {
      return { connected: false };
    }
  }
};