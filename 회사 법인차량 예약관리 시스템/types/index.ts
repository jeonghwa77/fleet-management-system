export interface Vehicle {
  id: string;
  name: string;
  type: string;
  plateNumber: string;
  capacity: number;
  status: 'available' | 'reserved' | 'maintenance';
  fuelType: string;
  color?: string; // 차량별 캘린더 색상
  createdAt?: string;
  updatedAt?: string;
}

export interface Reservation {
  id: string;
  vehicleId: string;
  vehicleName: string;
  employeeName: string;
  department: string;
  purpose: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  status: 'approved' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  department: string;
  createdAt?: string;
}

export type ConnectionStatus = 'online' | 'offline' | 'checking';