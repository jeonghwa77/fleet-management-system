import { projectId, publicAnonKey } from './supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-ed545625`;

// 로컬 모크 데이터
const MOCK_VEHICLES = [
  {
    id: 'vehicle_1',
    name: '아반떼',
    type: '승용차',
    plateNumber: '12가 3456',
    capacity: 5,
    status: 'available' as const,
    fuelType: '휘발유',
    createdAt: new Date().toISOString()
  },
  {
    id: 'vehicle_2',
    name: '그랜저',
    type: '승용차',
    plateNumber: '34나 5678',
    capacity: 5,
    status: 'reserved' as const,
    fuelType: '휘발유',
    createdAt: new Date().toISOString()
  },
  {
    id: 'vehicle_3',
    name: '스타렉스',
    type: '승합차',
    plateNumber: '56다 7890',
    capacity: 12,
    status: 'available' as const,
    fuelType: '디젤',
    createdAt: new Date().toISOString()
  },
  {
    id: 'vehicle_4',
    name: '포터',
    type: '화물차',
    plateNumber: '78라 9012',
    capacity: 3,
    status: 'maintenance' as const,
    fuelType: '디젤',
    createdAt: new Date().toISOString()
  }
];

const MOCK_RESERVATIONS = [
  {
    id: 'reservation_1',
    vehicleId: 'vehicle_2',
    vehicleName: '그랜저',
    employeeName: '김민수',
    department: '영업부',
    purpose: '고객 미팅',
    startDate: '2025-08-08',
    endDate: '2025-08-08',
    startTime: '09:00',
    endTime: '18:00',
    status: 'approved' as const,
    createdAt: '2025-08-07T10:30:00Z'
  },
  {
    id: 'reservation_2',
    vehicleId: 'vehicle_1',
    vehicleName: '아반떼',
    employeeName: '이영희',
    department: '인사부',
    purpose: '출장',
    startDate: '2025-08-09',
    endDate: '2025-08-10',
    startTime: '08:00',
    endTime: '17:00',
    status: 'completed' as const,
    createdAt: '2025-08-07T14:15:00Z'
  }
];

class ApiClient {
  private useMockData = false;
  private mockVehicles = [...MOCK_VEHICLES];
  private mockReservations = [...MOCK_RESERVATIONS];

  private async request(endpoint: string, options: RequestInit = {}) {
    // 먼저 서버 연결을 시도
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      
      const config: RequestInit = {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
          ...options.headers,
        },
      };

      console.log(`API 요청: ${url}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8초 타임아웃
      
      const response = await fetch(url, {
        ...config,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error(`API 응답 오류 ${response.status}:`, errorText);
        throw new Error(`서버 오류 (${response.status})`);
      }
      
      const data = await response.json();
      console.log(`API 응답 성공:`, data);
      
      // 서버 응답 형식에 따라 데이터 반환
      if (data.success === false) {
        throw new Error(data.error || 'Server returned error');
      }
      
      return data.data || data; // 서버가 { success: true, data: [...] } 형식으로 응답하는 경우
      
    } catch (error) {
      console.warn(`API 요청 실패, 로컬 데이터 사용:`, error);
      
      // 서버 연결 실패 시 모크 데이터 사용
      this.useMockData = true;
      return this.handleMockRequest(endpoint, options);
    }
  }

  private handleMockRequest(endpoint: string, options: RequestInit = {}) {
    console.log(`모크 데이터 사용: ${endpoint}`);
    
    const method = options.method || 'GET';
    
    // 차량 관련 요청
    if (endpoint === '/vehicles') {
      if (method === 'GET') {
        return Promise.resolve(this.mockVehicles);
      }
      if (method === 'POST') {
        const vehicleData = JSON.parse(options.body as string);
        const newVehicle = {
          ...vehicleData,
          id: `vehicle_${Date.now()}`,
          createdAt: new Date().toISOString()
        };
        this.mockVehicles.push(newVehicle);
        return Promise.resolve(newVehicle);
      }
    }
    
    // 개별 차량 수정/삭제
    if (endpoint.includes('/vehicles/') && !endpoint.includes('/status')) {
      const vehicleId = endpoint.split('/')[2];
      
      if (method === 'PUT') {
        const updates = JSON.parse(options.body as string);
        const vehicleIndex = this.mockVehicles.findIndex(v => v.id === vehicleId);
        
        if (vehicleIndex !== -1) {
          this.mockVehicles[vehicleIndex] = {
            ...this.mockVehicles[vehicleIndex],
            ...updates,
            updatedAt: new Date().toISOString()
          };
          return Promise.resolve(this.mockVehicles[vehicleIndex]);
        }
        return Promise.reject(new Error('차량을 찾을 수 없습니다.'));
      }
      
      if (method === 'DELETE') {
        const vehicleIndex = this.mockVehicles.findIndex(v => v.id === vehicleId);
        
        if (vehicleIndex !== -1) {
          // 해당 차량에 대한 활성 예약이 있는지 확인
          const hasActiveReservations = this.mockReservations.some(
            r => r.vehicleId === vehicleId && r.status === 'approved'
          );
          
          if (hasActiveReservations) {
            return Promise.reject(new Error('해당 차량에 활성 예약이 있어 삭제할 수 없습니다.'));
          }
          
          this.mockVehicles.splice(vehicleIndex, 1);
          return Promise.resolve({ message: 'Vehicle deleted successfully' });
        }
        return Promise.reject(new Error('차량을 찾을 수 없습니다.'));
      }
    }
    
    // 예약 관련 요청
    if (endpoint === '/reservations') {
      if (method === 'GET') {
        return Promise.resolve(this.mockReservations);
      }
      if (method === 'POST') {
        const reservationData = JSON.parse(options.body as string);
        const newReservation = {
          ...reservationData,
          id: `reservation_${Date.now()}`,
          status: reservationData.status || 'approved', // 기본적으로 승인됨으로 설정
          createdAt: new Date().toISOString()
        };
        this.mockReservations.unshift(newReservation);
        
        // 차량 상태를 예약중으로 변경
        const vehicle = this.mockVehicles.find(v => v.id === reservationData.vehicleId);
        if (vehicle && newReservation.status === 'approved') {
          vehicle.status = 'reserved';
        }
        
        return Promise.resolve(newReservation);
      }
    }
    
    // 예약 상태 업데이트
    if (endpoint.includes('/reservations/') && endpoint.includes('/status')) {
      const reservationId = endpoint.split('/')[2];
      const { status } = JSON.parse(options.body as string);
      
      const reservation = this.mockReservations.find(r => r.id === reservationId);
      if (reservation) {
        reservation.status = status;
        
        // 차량 상태도 업데이트
        const vehicle = this.mockVehicles.find(v => v.id === reservation.vehicleId);
        if (vehicle) {
          if (status === 'approved') {
            vehicle.status = 'reserved';
          } else if (status === 'cancelled' || status === 'completed') {
            vehicle.status = 'available';
          }
        }
        
        return Promise.resolve(reservation);
      }
    }
    
    // 예약 삭제
    if (endpoint.includes('/reservations/') && method === 'DELETE') {
      const reservationId = endpoint.split('/')[2];
      const reservationIndex = this.mockReservations.findIndex(r => r.id === reservationId);
      
      if (reservationIndex !== -1) {
        const reservation = this.mockReservations[reservationIndex];
        
        // 차량 상태를 사용 가능으로 변경
        const vehicle = this.mockVehicles.find(v => v.id === reservation.vehicleId);
        if (vehicle) {
          vehicle.status = 'available';
        }
        
        this.mockReservations.splice(reservationIndex, 1);
        return Promise.resolve({ message: 'Reservation deleted successfully' });
      }
    }
    
    // 초기 데이터 설정
    if (endpoint === '/initialize') {
      return Promise.resolve({ message: '모크 데이터가 이미 설정되어 있습니다.' });
    }
    
    // 헬스 체크
    if (endpoint === '/health') {
      return Promise.resolve({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        connected: false,
        mode: 'mock'
      });
    }
    
    return Promise.reject(new Error(`지원하지 않는 모크 요청: ${endpoint}`));
  }

  // 서버 연결 상태 확인
  async healthCheck() {
    try {
      const result = await this.request('/health');
      return { ...result, connected: !this.useMockData };
    } catch (error) {
      return { 
        status: 'offline', 
        timestamp: new Date().toISOString(),
        connected: false,
        mode: 'mock'
      };
    }
  }

  // 차량 관련 API
  async getVehicles() {
    return this.request('/vehicles');
  }

  async createVehicle(vehicle: any) {
    return this.request('/vehicles', {
      method: 'POST',
      body: JSON.stringify(vehicle),
    });
  }

  async updateVehicle(vehicleId: string, updates: any) {
    return this.request(`/vehicles/${vehicleId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async updateVehicleStatus(vehicleId: string, status: string) {
    return this.request(`/vehicles/${vehicleId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async deleteVehicle(vehicleId: string) {
    return this.request(`/vehicles/${vehicleId}`, {
      method: 'DELETE',
    });
  }

  // 예약 관련 API
  async getReservations() {
    return this.request('/reservations');
  }

  async createReservation(reservation: any) {
    return this.request('/reservations', {
      method: 'POST',
      body: JSON.stringify(reservation),
    });
  }

  async updateReservationStatus(reservationId: string, status: string) {
    return this.request(`/reservations/${reservationId}/status`, {
      method: 'PATCH', // 서버에서 PATCH를 사용하므로 일치시킴
      body: JSON.stringify({ status }),
    });
  }

  async deleteReservation(reservationId: string) {
    return this.request(`/reservations/${reservationId}`, {
      method: 'DELETE',
    });
  }

  // 대시보드 통계
  async getDashboardStats() {
    if (this.useMockData) {
      const stats = {
        totalVehicles: this.mockVehicles.length,
        availableVehicles: this.mockVehicles.filter(v => v.status === 'available').length,
        reservedVehicles: this.mockVehicles.filter(v => v.status === 'reserved').length,
        maintenanceVehicles: this.mockVehicles.filter(v => v.status === 'maintenance').length,
        totalReservations: this.mockReservations.length,
        approvedReservations: this.mockReservations.filter(r => r.status === 'approved').length,
        completedReservations: this.mockReservations.filter(r => r.status === 'completed').length,
        cancelledReservations: this.mockReservations.filter(r => r.status === 'cancelled').length,
      };
      return Promise.resolve(stats);
    }
    
    return this.request('/dashboard/stats');
  }

  // 초기 데이터 설정
  async initializeData() {
    return this.request('/initialize', {
      method: 'POST',
    });
  }

  // 현재 모드 확인
  isUsingMockData() {
    return this.useMockData;
  }

  // 서버 연결 재시도
  async retryConnection() {
    this.useMockData = false;
    return this.healthCheck();
  }
}

export const apiClient = new ApiClient();