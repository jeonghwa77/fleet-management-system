import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Calendar as CalendarIcon, Car, Clock, TrendingUp, ChevronRight, RefreshCw, ChevronLeft, ChevronRight as ChevronRightIcon } from 'lucide-react';
import { format, addDays, isWithinInterval, startOfDay, endOfDay, startOfMonth, endOfMonth, isSameDay, addMonths, subMonths, getDaysInMonth, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Vehicle, Reservation } from '../App';

interface DashboardProps {
  vehicles: Vehicle[];
  reservations: Reservation[];
  isMobile?: boolean;
  onRefresh?: () => void;
}

export default function Dashboard({ vehicles, reservations, isMobile = false, onRefresh }: DashboardProps) {
  const today = new Date();
  const tomorrow = addDays(today, 1);
  const nextWeek = addDays(today, 7);
  const now = new Date();

  // 캘린더 관련 상태
  const [currentMonth, setCurrentMonth] = useState(today);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [showDateDialog, setShowDateDialog] = useState(false);
  
  // 차량 필터 상태
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<string[]>([]);

  // 차량별 색상 생성 함수 (사용자 설정 색상 우선)
  const getVehicleColor = (vehicleId: string, customColor?: string) => {
    // 사용자가 설정한 색상이 있으면 우선 사용
    if (customColor) return customColor;
    
    // 기본 색상 팔레트에서 해시 기반으로 할당
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 
      'bg-pink-500', 'bg-indigo-500', 'bg-red-500', 'bg-orange-500',
      'bg-teal-500', 'bg-cyan-500', 'bg-lime-500', 'bg-emerald-500'
    ];
    let hash = 0;
    for (let i = 0; i < vehicleId.length; i++) {
      hash = vehicleId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // 예약 상태를 시간에 따라 동적으로 계산
  const getReservationCurrentStatus = (reservation: Reservation) => {
    if (reservation.status === 'cancelled') {
      return 'cancelled';
    }

    const startDateTime = new Date(`${reservation.startDate} ${reservation.startTime}`);
    const endDateTime = new Date(`${reservation.endDate} ${reservation.endTime}`);

    if (now < startDateTime) {
      return 'scheduled'; // 예약 중 (시작 전)
    } else if (now >= startDateTime && now <= endDateTime) {
      return 'in-use'; // 사용 중
    } else {
      return 'completed'; // 완료됨
    }
  };

  // 특정 날짜의 예약 목록 가져오기 (필터 적용)
  const getReservationsForDate = (date: Date) => {
    return filteredReservations.filter(reservation => {
      if (reservation.status === 'cancelled') return false;
      const reservationStartDate = new Date(reservation.startDate);
      const reservationEndDate = new Date(reservation.endDate);
      return isWithinInterval(date, {
        start: startOfDay(reservationStartDate),
        end: endOfDay(reservationEndDate)
      });
    });
  };

  // 필터된 예약 목록
  const filteredReservations = useMemo(() => {
    if (selectedVehicleIds.length === 0) {
      return reservations;
    }
    return reservations.filter(reservation => 
      selectedVehicleIds.includes(reservation.vehicleId)
    );
  }, [reservations, selectedVehicleIds]);

  // 캘린더에 표시할 날짜별 예약 정보
  const calendarReservations = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const dateMap = new Map();

    filteredReservations.forEach(reservation => {
      if (reservation.status === 'cancelled') return;

      const startDate = new Date(reservation.startDate);
      const endDate = new Date(reservation.endDate);
      
      // 현재 월과 겹치는 예약만 처리
      if (startDate <= monthEnd && endDate >= monthStart) {
        let currentDate = new Date(Math.max(startDate.getTime(), monthStart.getTime()));
        const lastDate = new Date(Math.min(endDate.getTime(), monthEnd.getTime()));

        while (currentDate <= lastDate) {
          const dateKey = format(currentDate, 'yyyy-MM-dd');
          if (!dateMap.has(dateKey)) {
            dateMap.set(dateKey, []);
          }
          dateMap.get(dateKey).push(reservation);
          currentDate = addDays(currentDate, 1);
        }
      }
    });

    return dateMap;
  }, [filteredReservations, currentMonth]);

  // 차량 필터 핸들러
  const handleVehicleFilter = (vehicleId: string) => {
    if (vehicleId === 'all') {
      setSelectedVehicleIds([]);
    } else {
      setSelectedVehicleIds(prev => 
        prev.includes(vehicleId) 
          ? prev.filter(id => id !== vehicleId)
          : [...prev, vehicleId]
      );
    }
  };

  // 차량별 색상 범례 (예약이 있는 차량만)
  const vehicleColorLegend = useMemo(() => {
    const vehiclesWithReservations = vehicles.filter(vehicle => 
      reservations.some(res => res.vehicleId === vehicle.id && res.status !== 'cancelled')
    );
    return vehiclesWithReservations.map(vehicle => ({
      ...vehicle,
      color: getVehicleColor(vehicle.id, vehicle.color)
    }));
  }, [vehicles, reservations]);

  // 오늘의 예약 (필터 적용)
  const todayReservations = filteredReservations.filter(reservation => {
    const reservationDate = new Date(reservation.startDate);
    return isWithinInterval(reservationDate, {
      start: startOfDay(today),
      end: endOfDay(today)
    });
  });

  // 내일의 예약 (필터 적용)
  const tomorrowReservations = filteredReservations.filter(reservation => {
    const reservationDate = new Date(reservation.startDate);
    return isWithinInterval(reservationDate, {
      start: startOfDay(tomorrow),
      end: endOfDay(tomorrow)
    });
  });

  // 이번 주 예약 (필터 적용)
  const thisWeekReservations = filteredReservations.filter(reservation => {
    const reservationDate = new Date(reservation.startDate);
    return isWithinInterval(reservationDate, {
      start: startOfDay(today),
      end: endOfDay(nextWeek)
    });
  });

  // 차량 상태별 통계
  const vehicleStats = {
    available: vehicles.filter(v => v.status === 'available').length,
    reserved: vehicles.filter(v => v.status === 'reserved').length,
    maintenance: vehicles.filter(v => v.status === 'maintenance').length
  };

  // 예약 상태별 통계 (동적 상태 기반, 필터 적용)
  const reservationStats = {
    scheduled: filteredReservations.filter(r => getReservationCurrentStatus(r) === 'scheduled').length,
    inUse: filteredReservations.filter(r => getReservationCurrentStatus(r) === 'in-use').length,
    completed: filteredReservations.filter(r => getReservationCurrentStatus(r) === 'completed').length,
    cancelled: filteredReservations.filter(r => r.status === 'cancelled').length
  };

  const utilizationRate = vehicles.length > 0 ? Math.round((vehicleStats.reserved / vehicles.length) * 100) : 0;

  const getStatusBadge = (reservation: Reservation) => {
    const currentStatus = getReservationCurrentStatus(reservation);
    switch (currentStatus) {
      case 'scheduled':
        return <Badge variant="default" className="bg-blue-500">예약 중</Badge>;
      case 'in-use':
        return <Badge variant="default" className="bg-orange-500">사용 중</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-green-500">완료됨</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">취소됨</Badge>;
    }
  };

  // 날짜 클릭 핸들러
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    const dayReservations = getReservationsForDate(date);
    if (dayReservations.length > 0) {
      setShowDateDialog(true);
    }
  };

  // 커스텀 캘린더 컴포넌트
  const CustomCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // 일요일 시작
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    
    const calendarDays = eachDayOfInterval({
      start: calendarStart,
      end: calendarEnd
    });

    const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

    return (
      <div className="space-y-4">
        {/* 캘린더 헤더 */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">
            {format(currentMonth, 'yyyy년 MM월', { locale: ko })}
          </h3>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* 차량별 필터 */}
        {vehicleColorLegend.length > 0 && (
          <div className="space-y-3 p-3 bg-muted/50 rounded-lg">
            <h4 className="text-sm font-medium flex items-center">
              <Car className="w-4 h-4 mr-2" />
              차량별 필터
              <span className="ml-2 text-xs text-muted-foreground">
                ({selectedVehicleIds.length === 0 ? '전체' : `${selectedVehicleIds.length}개`} 선택)
              </span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {/* 전체보기 버튼 */}
              <Button
                variant={selectedVehicleIds.length === 0 ? "default" : "outline"}
                size="sm"
                onClick={() => handleVehicleFilter('all')}
                className="h-8 text-xs"
              >
                전체보기
              </Button>
              
              {/* 차량별 필터 버튼 */}
              {vehicleColorLegend.map(vehicle => (
                <Button
                  key={vehicle.id}
                  variant={selectedVehicleIds.includes(vehicle.id) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleVehicleFilter(vehicle.id)}
                  className="h-8 text-xs flex items-center space-x-1"
                  title={`${vehicle.name} (${vehicle.plateNumber}) - 클릭하여 필터링`}
                >
                  <div className={`w-2.5 h-2.5 rounded-full ${vehicle.color} shadow-sm`} />
                  <span className="truncate max-w-20">
                    {vehicle.name}
                  </span>
                </Button>
              ))}
            </div>
            
            {/* 필터 상태 표시 */}
            {selectedVehicleIds.length > 0 && (
              <div className="text-xs text-muted-foreground">
                선택된 차량: {selectedVehicleIds.map(id => {
                  const vehicle = vehicles.find(v => v.id === id);
                  return vehicle?.name;
                }).filter(Boolean).join(', ')}
              </div>
            )}
          </div>
        )}

        {/* 캘린더 그리드 */}
        <div className="border rounded-lg overflow-hidden">
          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 bg-muted">
            {weekDays.map((day, index) => (
              <div key={day} className={`p-3 text-center text-sm font-medium ${index === 0 ? 'text-red-600' : index === 6 ? 'text-blue-600' : ''}`}>
                {day}
              </div>
            ))}
          </div>

          {/* 날짜 그리드 */}
          <div className="grid grid-cols-7">
            {calendarDays.map((date) => {
              const dateKey = format(date, 'yyyy-MM-dd');
              const dayReservations = calendarReservations.get(dateKey) || [];
              const isToday = isSameDay(date, today);
              const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
              const isSelected = selectedDate && isSameDay(date, selectedDate);

              return (
                <button
                  key={dateKey}
                  onClick={() => handleDateSelect(date)}
                  className={`
                    min-h-[100px] p-2 border-r border-b text-left hover:bg-accent transition-colors
                    ${!isCurrentMonth ? 'text-muted-foreground bg-muted/50' : ''}
                    ${isToday ? 'bg-primary/10 border-primary' : ''}
                    ${isSelected ? 'bg-accent' : ''}
                    ${dayReservations.length > 0 ? 'cursor-pointer' : ''}
                  `}
                  disabled={!isCurrentMonth}
                >
                  <div className="flex flex-col h-full">
                    {/* 날짜 숫자 */}
                    <div className={`text-sm mb-1 ${isToday ? 'font-bold text-primary' : ''}`}>
                      {format(date, 'd')}
                    </div>

                    {/* 예약 표시 - 개별 예약을 "차량명(예약자명)" 형식으로 표시 */}
                    <div className="flex-1 space-y-1">
                      {dayReservations.slice(0, 4).map((reservation, index) => {
                        const vehicle = vehicles.find(v => v.id === reservation.vehicleId);
                        const vehicleName = vehicle?.name || '알 수 없음';
                        const shortVehicleName = vehicleName.length > 4 ? vehicleName.substring(0, 4) : vehicleName;
                        const shortEmployeeName = reservation.employeeName.length > 3 ? reservation.employeeName.substring(0, 3) : reservation.employeeName;
                        
                        return (
                          <div
                            key={`${reservation.id}-${index}`}
                            className={`text-xs px-1 py-0.5 rounded text-white truncate ${getVehicleColor(reservation.vehicleId, vehicle?.color)}`}
                            title={`${vehicleName} - ${reservation.employeeName} (${reservation.startTime}-${reservation.endTime})`}
                          >
                            {shortVehicleName}({shortEmployeeName})
                          </div>
                        );
                      })}
                      {dayReservations.length > 4 && (
                        <div className="text-xs text-muted-foreground px-1">
                          +{dayReservations.length - 4}개 더
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>


      </div>
    );
  };

  if (isMobile) {
    return (
      <div className="space-y-4">
        {/* 모바일용 새로고침 버튼 */}
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="text-xs"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            새로고침
          </Button>
        </div>

        {/* 모바일용 요약 카드 */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl mb-1">{vehicles.length}</div>
                <div className="text-sm text-muted-foreground">전체 차량</div>
                <div className="text-xs text-green-600 mt-1">
                  {vehicleStats.available}대 사용가능
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">{reservationStats.scheduled + reservationStats.inUse}</div>
                <div className="text-sm text-muted-foreground">활성 예약</div>
                <div className="text-xs text-blue-600 mt-1">
                  {reservationStats.inUse}대 사용중
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 모바일용 캘린더 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <CalendarIcon className="w-5 h-5 mr-2" />
              예약 캘린더
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <CustomCalendar />
          </CardContent>
        </Card>

        {/* 오늘 일정 */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">오늘 일정</CardTitle>
              <Badge variant="outline">{format(today, 'MM월 dd일', { locale: ko })}</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {todayReservations.length > 0 ? (
              <div className="space-y-3">
                {todayReservations.slice(0, 3).map(reservation => (
                  <div key={reservation.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{reservation.vehicleName}</div>
                      <div className="text-sm text-muted-foreground truncate">
                        {reservation.employeeName} · {reservation.startTime}
                      </div>
                    </div>
                    {getStatusBadge(reservation)}
                  </div>
                ))}
                {todayReservations.length > 3 && (
                  <Button variant="ghost" size="sm" className="w-full">
                    {todayReservations.length - 3}건 더 보기
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <CalendarIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>오늘 예약이 없습니다</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 예약 현황 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              예약 현황
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-xl">{reservationStats.scheduled}</div>
                <div className="text-sm text-blue-700">예약 중</div>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <div className="text-xl">{reservationStats.inUse}</div>
                <div className="text-sm text-orange-700">사용 중</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 데스크톱 버전
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <CardTitle>대시보드</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              새로고침
            </Button>
          </div>
          <CardDescription>
            전체 차량 및 예약 현황을 한눈에 확인하세요.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* 예약 캘린더 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CalendarIcon className="h-5 w-5" />
            <span>예약 캘린더</span>
          </CardTitle>
          <CardDescription>
            차량별로 구분된 예약 일정을 확인하세요. 날짜를 클릭하면 해당 날짜의 예약 정보를 볼 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CustomCalendar />
        </CardContent>
      </Card>

      {/* 차량 현황 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Car className="h-5 w-5" />
              <span>차량 현황</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">사용 가능</span>
                <span className="text-sm">{vehicleStats.available}대</span>
              </div>
              <Progress value={vehicles.length > 0 ? (vehicleStats.available / vehicles.length) * 100 : 0} className="h-2" />
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">예약중</span>
                <span className="text-sm">{vehicleStats.reserved}대</span>
              </div>
              <Progress value={vehicles.length > 0 ? (vehicleStats.reserved / vehicles.length) * 100 : 0} className="h-2 bg-yellow-100" />
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">정비중</span>
                <span className="text-sm">{vehicleStats.maintenance}대</span>
              </div>
              <Progress value={vehicles.length > 0 ? (vehicleStats.maintenance / vehicles.length) * 100 : 0} className="h-2 bg-red-100" />
            </div>

            <div className="pt-2 border-t">
              <div className="flex justify-between items-center">
                <span>차량 이용률</span>
                <span className="text-lg">{utilizationRate}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>예약 현황</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl">{reservationStats.scheduled}</div>
                <div className="text-sm text-blue-700">예약 중</div>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <div className="text-2xl">{reservationStats.inUse}</div>
                <div className="text-sm text-orange-700">사용 중</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-2xl">{reservationStats.completed}</div>
                <div className="text-sm text-green-700">완료됨</div>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <div className="text-2xl">{reservationStats.cancelled}</div>
                <div className="text-sm text-red-700">취소됨</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 일정 현황 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5" />
              <span>오늘 예약 ({format(today, 'MM월 dd일', { locale: ko })})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayReservations.length > 0 ? (
              <div className="space-y-3">
                {todayReservations.map(reservation => (
                  <div key={reservation.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <div className="font-medium">{reservation.vehicleName}</div>
                      <div className="text-sm text-muted-foreground">
                        {reservation.employeeName} ({reservation.department})
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {reservation.startTime} - {reservation.endTime}
                      </div>
                    </div>
                    {getStatusBadge(reservation)}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">오늘 예약이 없습니다.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5" />
              <span>내일 예약 ({format(tomorrow, 'MM월 dd일', { locale: ko })})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tomorrowReservations.length > 0 ? (
              <div className="space-y-3">
                {tomorrowReservations.map(reservation => (
                  <div key={reservation.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <div className="font-medium">{reservation.vehicleName}</div>
                      <div className="text-sm text-muted-foreground">
                        {reservation.employeeName} ({reservation.department})
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {reservation.startTime} - {reservation.endTime}
                      </div>
                    </div>
                    {getStatusBadge(reservation)}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">내일 예약이 없습니다.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 이번 주 예약 요약 */}
      <Card>
        <CardHeader>
          <CardTitle>이번 주 예약 요약</CardTitle>
          <CardDescription>
            {format(today, 'MM월 dd일', { locale: ko })} - {format(nextWeek, 'MM월 dd일', { locale: ko })} 기간의 예약 현황
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-3xl mb-2">{thisWeekReservations.length}</div>
            <div className="text-muted-foreground">
              {selectedVehicleIds.length > 0 ? '필터된 예약 건수' : '총 예약 건수'}
            </div>
            {selectedVehicleIds.length > 0 && (
              <div className="text-xs text-muted-foreground mt-1">
                선택된 차량의 예약만 표시됨
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 날짜별 예약 상세 다이얼로그 */}
      <Dialog open={showDateDialog} onOpenChange={setShowDateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedDate && format(selectedDate, 'yyyy년 MM월 dd일 (E)', { locale: ko })} 예약
            </DialogTitle>
            <DialogDescription>
              선택한 날짜의 모든 예약 정보입니다.
            </DialogDescription>
          </DialogHeader>
          {selectedDate && (
            <div className="space-y-3">
              {getReservationsForDate(selectedDate).map(reservation => (
                <div key={reservation.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded ${getVehicleColor(reservation.vehicleId, vehicles.find(v => v.id === reservation.vehicleId)?.color)}`} />
                      <span className="font-medium">{reservation.vehicleName}</span>
                    </div>
                    {getStatusBadge(reservation)}
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>{reservation.employeeName} ({reservation.department})</div>
                    <div>{reservation.startTime} - {reservation.endTime}</div>
                    <div className="truncate">{reservation.purpose}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}