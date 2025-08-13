import { useState, useCallback } from 'react';
import { Vehicle, Reservation } from '../types';
import { apiClient } from '../utils/api';
import { updateDepartmentName } from '../utils/constants';

export const useData = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // 데이터 로드
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [vehiclesData, reservationsData] = await Promise.all([
        apiClient.getVehicles(),
        apiClient.getReservations()
      ]);
      
      // 예약 데이터의 부서명 업데이트
      const updatedReservations = reservationsData.map(reservation => ({
        ...reservation,
        department: updateDepartmentName(reservation.department)
      }));
      
      setVehicles(vehiclesData);
      setReservations(updatedReservations);
      setIsInitialized(vehiclesData.length > 0);
      setError(null);
    } catch (err) {
      console.error('데이터 로드 실패:', err);
      setError(err instanceof Error ? err.message : '데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  // 초기 데이터 설정
  const initializeData = useCallback(async () => {
    try {
      setLoading(true);
      await apiClient.initializeData();
      await loadData();
    } catch (err) {
      console.error('초기 데이터 설정 실패:', err);
      setError(err instanceof Error ? err.message : '초기 데이터 설정에 실패했습니다.');
    }
  }, [loadData]);

  // 차량 추가
  const addVehicle = useCallback(async (vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newVehicle = await apiClient.createVehicle(vehicle);
      setVehicles(prev => [newVehicle, ...prev]);
      return newVehicle;
    } catch (err) {
      console.error('차량 추가 실패:', err);
      throw err;
    }
  }, []);

  // 차량 수정
  const updateVehicle = useCallback(async (id: string, updates: Partial<Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>>) => {
    try {
      const updatedVehicle = await apiClient.updateVehicle(id, updates);
      setVehicles(prev => 
        prev.map(vehicle => 
          vehicle.id === id ? updatedVehicle : vehicle
        )
      );
      return updatedVehicle;
    } catch (err) {
      console.error('차량 수정 실패:', err);
      throw err;
    }
  }, []);

  // 차량 삭제
  const deleteVehicle = useCallback(async (id: string) => {
    try {
      // 해당 차량에 대한 예약이 있는지 확인
      const vehicleReservations = reservations.filter(r => r.vehicleId === id && r.status === 'approved');
      if (vehicleReservations.length > 0) {
        throw new Error('해당 차량에 활성 예약이 있어 삭제할 수 없습니다.');
      }

      await apiClient.deleteVehicle(id);
      setVehicles(prev => prev.filter(vehicle => vehicle.id !== id));
    } catch (err) {
      console.error('차량 삭제 실패:', err);
      throw err;
    }
  }, [reservations]);

  // 예약 추가 (바로 승인된 상태로 생성)
  const addReservation = useCallback(async (reservation: Omit<Reservation, 'id' | 'createdAt' | 'status'>) => {
    try {
      const reservationWithStatus = {
        ...reservation,
        status: 'approved' as const
      };
      
      const newReservation = await apiClient.createReservation(reservationWithStatus);
      setReservations(prev => [newReservation, ...prev]);
      
      // 차량 목록 다시 로드 (상태 변경을 반영하기 위해)
      const vehiclesData = await apiClient.getVehicles();
      setVehicles(vehiclesData);
    } catch (err) {
      console.error('예약 생성 실패:', err);
      throw err;
    }
  }, []);

  // 예약 취소
  const cancelReservation = useCallback(async (id: string) => {
    try {
      const updatedReservation = await apiClient.updateReservationStatus(id, 'cancelled');
      setReservations(prev => 
        prev.map(reservation => 
          reservation.id === id ? updatedReservation : reservation
        )
      );
      
      // 차량 목록 다시 로드 (상태 변경을 반영하기 위해)
      const vehiclesData = await apiClient.getVehicles();
      setVehicles(vehiclesData);
    } catch (err) {
      console.error('예약 취소 실패:', err);
      throw err;
    }
  }, []);

  // 예약 완료 처리 (사용하지 않지만 ReservationManagement에서 필요하므로 빈 함수 유지)
  const completeReservation = useCallback(async (id: string) => {
    // 빈 함수 - 더 이상 사용하지 않음
  }, []);

  // 예약 삭제 (사용하지 않지만 ReservationManagement에서 필요하므로 빈 함수 유지)
  const deleteReservation = useCallback(async (id: string) => {
    // 빈 함수 - 더 이상 사용하지 않음
  }, []);

  return {
    // State
    vehicles,
    reservations,
    loading,
    error,
    isInitialized,
    
    // Actions
    loadData,
    initializeData,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    addReservation,
    cancelReservation,
    completeReservation,
    deleteReservation
  };
};