"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Check, AlertCircle, Loader2, Clock } from 'lucide-react';
import { Vehicle, Reservation, User } from '../App';
import { Alert, AlertDescription } from './ui/alert';

interface ReservationFormProps {
  vehicles: Vehicle[];
  onSubmit: (reservation: Omit<Reservation, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  existingReservations: Reservation[];
  currentUser: User;
  isMobile?: boolean;
}

export default function ReservationForm({ vehicles, onSubmit, existingReservations, currentUser, isMobile = false }: ReservationFormProps) {
  // 오늘 날짜 문자열 생성
  const todayString = new Date().toISOString().split('T')[0];

  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [employeeName, setEmployeeName] = useState(currentUser.name); // 로그인 사용자 정보로 기본값 설정
  const [department, setDepartment] = useState(currentUser.department); // 로그인 사용자 정보로 기본값 설정
  const [purpose, setPurpose] = useState('');
  const [startDate, setStartDate] = useState(todayString); // 오늘 날짜로 기본값 설정
  const [endDate, setEndDate] = useState(todayString); // 오늘 날짜로 기본값 설정
  const [startTime, setStartTime] = useState('09:00'); // 종일 시작 시간으로 기본값 설정
  const [endTime, setEndTime] = useState('18:00'); // 종일 종료 시간으로 기본값 설정
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const departments = ['프로젝트 1팀', '프로젝트 2팀', '연구개발팀', '경영지원팀', '기타'];

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
  ];

  // 오늘 날짜를 YYYY-MM-DD 형식으로 가져오기
  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // 종일 버튼 클릭 핸들러
  const handleAllDayClick = () => {
    setStartTime('00:00');
    setEndTime('23:59');
  };

  // 날짜와 시간을 조합하여 Date 객체로 변환하는 헬퍼 함수
  const createDateTime = (dateStr: string, timeStr: string): Date => {
    return new Date(`${dateStr}T${timeStr}:00`);
  };

  // 시간 충돌 검사 함수 (완전히 수정된 버전)
  const isTimeConflict = (vehicleId: string, checkStartDate: string, checkEndDate: string, checkStartTime: string, checkEndTime: string) => {
    const activeReservations = existingReservations.filter(reservation => 
      reservation.vehicleId === vehicleId && reservation.status !== 'cancelled'
    );

    console.log(`=== 차량 ${vehicleId}의 충돌 검사 ===`);
    console.log('검사할 예약:', { checkStartDate, checkEndDate, checkStartTime, checkEndTime });
    console.log('기존 활성 예약들:', activeReservations);

    // 새 예약의 시작/종료 일시
    const newStart = createDateTime(checkStartDate, checkStartTime);
    const newEnd = createDateTime(checkEndDate, checkEndTime);

    console.log('새 예약 일시:', {
      start: `${checkStartDate} ${checkStartTime} (${newStart.toISOString()})`,
      end: `${checkEndDate} ${checkEndTime} (${newEnd.toISOString()})`
    });

    const hasConflict = activeReservations.some(reservation => {
      // 기존 예약의 시작/종료 일시
      const existingStart = createDateTime(reservation.startDate, reservation.startTime);
      const existingEnd = createDateTime(reservation.endDate, reservation.endTime);

      console.log(`기존 예약 일시:`, {
        vehicle: reservation.vehicleName,
        start: `${reservation.startDate} ${reservation.startTime} (${existingStart.toISOString()})`,
        end: `${reservation.endDate} ${reservation.endTime} (${existingEnd.toISOString()})`
      });

      // 시간 겹침 검사: 새 예약의 시작이 기존 예약 종료보다 이르고,
      // 새 예약의 종료가 기존 예약 시작보다 늦은 경우
      const timeOverlap = newStart < existingEnd && newEnd > existingStart;
      
      console.log(`시간 겹침 결과: ${timeOverlap}`);
      console.log(`- 새 시작(${newStart.getTime()}) < 기존 종료(${existingEnd.getTime()}): ${newStart < existingEnd}`);
      console.log(`- 새 종료(${newEnd.getTime()}) > 기존 시작(${existingStart.getTime()}): ${newEnd > existingStart}`);
      
      return timeOverlap;
    });

    console.log(`최종 충돌 결과: ${hasConflict}`);
    return hasConflict;
  };

  // 가용 차량 필터링 (수정된 버전)
  const availableVehicles = useMemo(() => {
    console.log('=== 가용 차량 필터링 시작 ===');
    console.log('전체 차량:', vehicles);
    console.log('전체 예약:', existingReservations);

    // 정비 중이 아닌 모든 차량을 대상으로 함 (available, reserved 모두 포함)
    const baseAvailable = vehicles.filter(v => v.status !== 'maintenance');
    console.log('정비중이 아닌 차량들:', baseAvailable);
    
    // 날짜와 시간이 모두 입력된 경우에만 충돌 검사
    if (!startDate || !endDate || !startTime || !endTime) {
      console.log('날짜/시간 미입력 - 기본 차량 반환');
      return baseAvailable;
    }

    console.log('충돌 검사 수행 중...');
    const filteredVehicles = baseAvailable.filter(vehicle => {
      const conflict = isTimeConflict(vehicle.id, startDate, endDate, startTime, endTime);
      console.log(`차량 ${vehicle.name} (${vehicle.id}): 충돌=${conflict}`);
      return !conflict;
    });

    console.log('최종 가용 차량:', filteredVehicles);
    return filteredVehicles;
  }, [vehicles, startDate, endDate, startTime, endTime, existingReservations]);

  // 가용한 차량이 있을 때 첫 번째 차량을 자동 선택
  React.useEffect(() => {
    if (availableVehicles.length > 0 && !selectedVehicle) {
      setSelectedVehicle(availableVehicles[0].id);
    } else if (availableVehicles.length === 0) {
      setSelectedVehicle('');
    } else if (selectedVehicle && !availableVehicles.find(v => v.id === selectedVehicle)) {
      // 현재 선택된 차량이 가용 목록에 없으면 첫 번째 차량으로 변경
      setSelectedVehicle(availableVehicles[0]?.id || '');
    }
  }, [availableVehicles, selectedVehicle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedVehicle || !employeeName || !department || !purpose || 
        !startDate || !endDate || !startTime || !endTime) {
      setError('모든 필드를 입력해주세요.');
      return;
    }

    const vehicle = vehicles.find(v => v.id === selectedVehicle);
    if (!vehicle) {
      setError('선택한 차량을 찾을 수 없습니다.');
      return;
    }

    // 시간 검증
    if (startTime >= endTime) {
      setError('종료 시간은 시작 시간보다 늦어야 합니다.');
      return;
    }

    // 날짜 검증
    if (startDate > endDate) {
      setError('종료일은 시작일보다 늦어야 합니다.');
      return;
    }

    // 과거 날짜 검증
    if (startDate < getTodayString()) {
      setError('시작일은 오늘 이후여야 합니다.');
      return;
    }

    // 시간 충돌 검사
    if (isTimeConflict(selectedVehicle, startDate, endDate, startTime, endTime)) {
      setError('선택한 시간에 해당 차량이 이미 예약되어 있습니다.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const reservation: Omit<Reservation, 'id' | 'createdAt' | 'status'> = {
        vehicleId: selectedVehicle,
        vehicleName: vehicle.name,
        employeeName,
        department,
        purpose,
        startDate,
        endDate,
        startTime,
        endTime
      };

      await onSubmit(reservation);
      
      // 폼 초기화 (사용자 정보와 기본 날짜/시간은 유지)
      setSelectedVehicle('');
      setPurpose('');
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (err) {
      console.error('예약 생성 실패:', err);
      setError(err instanceof Error ? err.message : '예약 생성에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {!isMobile && (
        <Card>
          <CardHeader>
            <CardTitle>차량 예약 신청</CardTitle>
            <CardDescription>
              법인차량 사용을 위해 예약을 신청해주세요. 신청 즉시 예약이 완료됩니다.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* 성공 메시지 */}
      {showSuccess && (
        <Alert className="border-green-200 bg-green-50">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            예약이 성공적으로 완료되었습니다! 예약 관리에서 확인하실 수 있습니다.
          </AlertDescription>
        </Alert>
      )}

      {/* 에러 메시지 */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* 디버깅 정보 */}
      {process.env.NODE_ENV === 'development' && startDate && endDate && startTime && endTime && (
        <Alert className="border-blue-200 bg-blue-50">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>디버깅 정보:</strong><br/>
            전체 차량 수: {vehicles.length}개<br/>
            정비중이 아닌 차량: {vehicles.filter(v => v.status !== 'maintenance').length}개<br/>
            선택 가능한 차량: {availableVehicles.length}개<br/>
            활성 예약: {existingReservations.filter(r => r.status !== 'cancelled').length}개<br/>
            <strong>검사할 시간:</strong> {startDate === endDate ? `${startDate} ${startTime}-${endTime}` : `${startDate} ${startTime} ~ ${endDate} ${endTime}`}<br/>
            <strong>해당 시간 예약 현황:</strong><br/>
            {existingReservations
              .filter(r => r.status !== 'cancelled' && (
                (r.startDate <= endDate && r.endDate >= startDate)
              ))
              .map(r => (
                <div key={r.id} className="text-xs ml-2">
                  • {r.vehicleName}: {r.startDate === r.endDate ? 
                    `${r.startDate} ${r.startTime}-${r.endTime}` : 
                    `${r.startDate} ${r.startTime} ~ ${r.endDate} ${r.endTime}`
                  }
                </div>
              ))}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className={isMobile ? "p-4" : "p-6"}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 신청자 정보 */}
            <div className={isMobile ? "space-y-4" : "grid grid-cols-1 md:grid-cols-2 gap-4"}>
              <div className="space-y-2">
                <Label htmlFor="employee">신청자 성명 *</Label>
                <Input
                  id="employee"
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  placeholder="성명을 입력하세요"
                  required
                  className={isMobile ? "h-12" : ""}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">소속 부서 *</Label>
                <Select value={department} onValueChange={setDepartment} required disabled={isSubmitting}>
                  <SelectTrigger className={isMobile ? "h-12" : ""}>
                    <SelectValue placeholder="부서를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 사용 기간 및 시간 */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Label className="text-base">사용 기간 및 시간 *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAllDayClick}
                  disabled={isSubmitting}
                  className="h-8"
                >
                  <Clock className="w-4 h-4 mr-1" />
                  종일
                </Button>
              </div>

              {/* 시작일시 */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <Label className="font-medium text-blue-700">사용 시작</Label>
                </div>
                <div className={isMobile ? "space-y-3" : "grid grid-cols-2 gap-4"}>
                  <div className="space-y-2">
                    <Label htmlFor="startDate" className="text-sm text-muted-foreground">날짜</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => {
                        const newStartDate = e.target.value;
                        setStartDate(newStartDate);
                        
                        // 종료 날짜가 시작 날짜보다 이전인 경우 시작 날짜와 같게 수정
                        if (endDate && newStartDate > endDate) {
                          setEndDate(newStartDate);
                        }
                        // 날짜 변경 시 useEffect에서 자동으로 차량 선택 처리됨
                      }}
                      min={getTodayString()}
                      required
                      className={isMobile ? "h-12" : ""}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startTime" className="text-sm text-muted-foreground">시간</Label>
                    <Select value={startTime} onValueChange={(value) => {
                      setStartTime(value);
                      // 시간 변경 시 useEffect에서 자동으로 차량 선택 처리됨
                    }} required disabled={isSubmitting}>
                      <SelectTrigger className={isMobile ? "h-12" : ""}>
                        <SelectValue placeholder="시간 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="00:00">00:00</SelectItem>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>{time}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* 종료일시 */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <Label className="font-medium text-red-700">사용 종료</Label>
                </div>
                <div className={isMobile ? "space-y-3" : "grid grid-cols-2 gap-4"}>
                  <div className="space-y-2">
                    <Label htmlFor="endDate" className="text-sm text-muted-foreground">날짜</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => {
                        setEndDate(e.target.value);
                        // 날짜 변경 시 useEffect에서 자동으로 차량 선택 처리됨
                      }}
                      min={startDate || getTodayString()}
                      required
                      className={isMobile ? "h-12" : ""}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime" className="text-sm text-muted-foreground">시간</Label>
                    <Select value={endTime} onValueChange={(value) => {
                      setEndTime(value);
                      // 시간 변경 시 useEffect에서 자동으로 차량 선택 처리됨
                    }} required disabled={isSubmitting}>
                      <SelectTrigger className={isMobile ? "h-12" : ""}>
                        <SelectValue placeholder="시간 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>{time}</SelectItem>
                        ))}
                        <SelectItem value="23:59">23:59</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* 기간 요약 */}
              {startDate && endDate && startTime && endTime && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm">
                    <span className="font-medium">선택된 사용 기간:</span><br />
                    <span className="text-blue-600">
                      {startDate === endDate 
                        ? `${startDate} ${startTime} ~ ${endTime}` 
                        : `${startDate} ${startTime} ~ ${endDate} ${endTime}`
                      }
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* 차량 선택 */}
            <div className="space-y-2">
              <Label htmlFor="vehicle">차량 선택 *</Label>
              {startDate && endDate && startTime && endTime ? (
                <>
                  <Select 
                    value={selectedVehicle} 
                    onValueChange={setSelectedVehicle} 
                    required 
                    disabled={isSubmitting || availableVehicles.length === 0}
                  >
                    <SelectTrigger className={isMobile ? "h-12" : ""}>
                      <SelectValue 
                        placeholder={
                          availableVehicles.length > 0 
                            ? `${availableVehicles.length}대의 차량 선택 가능` 
                            : "선택한 시간에 사용 가능한 차량이 없습니다"
                        } 
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {availableVehicles.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.name} ({vehicle.plateNumber}) - {vehicle.type}
                          {vehicle.status !== 'available' && ` [${vehicle.status}]`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {availableVehicles.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      선택하신 시간에는 사용 가능한 차량이 없습니다. 다른 시간대를 선택해보세요.
                    </p>
                  )}
                  {availableVehicles.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      {startDate === endDate 
                        ? `${startDate} ${startTime}-${endTime}` 
                        : `${startDate} ${startTime} ~ ${endDate} ${endTime}`} 시간대에 
                      <span className="text-green-600 font-medium">{availableVehicles.length}대</span>의 차량을 사용하실 수 있습니다.
                    </p>
                  )}
                </>
              ) : (
                <>
                  <Select disabled>
                    <SelectTrigger className={isMobile ? "h-12" : ""}>
                      <SelectValue placeholder="먼저 사용 날짜와 시간을 선택해주세요" />
                    </SelectTrigger>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    사용 날짜와 시간을 입력하면 해당 시간에 사용 가능한 차량을 확인할 수 있습니다.
                  </p>
                </>
              )}
            </div>

            {/* 사용 목적 */}
            <div className="space-y-2">
              <Label htmlFor="purpose">사용 목적 *</Label>
              <Textarea
                id="purpose"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="차량 사용 목적을 상세히 작성해주세요"
                rows={isMobile ? 4 : 3}
                required
                className={isMobile ? "text-base" : ""}
                disabled={isSubmitting}
              />
            </div>

            <Button 
              type="submit" 
              className={`w-full ${isMobile ? "h-12 text-base" : ""}`}
              disabled={isSubmitting || availableVehicles.length === 0 || !startDate || !endDate || !startTime || !endTime}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  예약 중...
                </>
              ) : (
                '예약 신청하기'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}