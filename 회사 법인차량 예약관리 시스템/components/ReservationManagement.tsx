import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Eye, ChevronRight, Ban } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Reservation, User } from '../types';

interface ReservationManagementProps {
  reservations: Reservation[];
  currentUser: User;
  onCancel: (id: string) => void;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  isMobile?: boolean;
}

export default function ReservationManagement({ reservations, currentUser, onCancel, onComplete, onDelete, isMobile = false }: ReservationManagementProps) {
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const getStatusBadge = (status: Reservation['status']) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-blue-500">예약 중</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-green-500">완료됨</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">취소됨</Badge>;
      default:
        return <Badge variant="secondary">알 수 없음</Badge>;
    }
  };

  // 현재 사용자의 예약만 필터링
  const userReservations = reservations.filter(reservation => 
    reservation.employeeName === currentUser.name && 
    reservation.department === currentUser.department
  );

  const filteredReservations = userReservations.filter(reservation => {
    if (statusFilter === 'all') return true;
    return reservation.status === statusFilter;
  });

  const handleViewDetail = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setShowDetailDialog(true);
  };

  const handleCancelClick = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setShowCancelDialog(true);
  };

  const handleConfirmCancel = () => {
    if (selectedReservation) {
      onCancel(selectedReservation.id);
      setShowCancelDialog(false);
      setSelectedReservation(null);
    }
  };

  const formatDateTime = (dateStr: string, timeStr: string) => {
    const date = new Date(dateStr);
    return `${format(date, 'MM월 dd일 (E)', { locale: ko })} ${timeStr}`;
  };

  if (isMobile) {
    return (
      <div className="space-y-4">
        {/* 모바일용 헤더 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">내 예약 관리</CardTitle>
            <CardDescription>
              총 {filteredReservations.length}건의 내 예약이 있습니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="상태로 필터링" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="approved">예약 중</SelectItem>
                <SelectItem value="completed">완료됨</SelectItem>
                <SelectItem value="cancelled">취소됨</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* 모바일용 예약 리스트 */}
        <div className="space-y-3">
          {filteredReservations.map((reservation) => (
            <Card key={reservation.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{reservation.vehicleName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {reservation.employeeName} · {reservation.department}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDateTime(reservation.startDate, reservation.startTime)}
                    </p>
                  </div>
                  {getStatusBadge(reservation.status)}
                </div>

                <div className="mb-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {reservation.purpose}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewDetail(reservation)}
                    className="text-blue-600 p-0 h-auto"
                  >
                    자세히 보기
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>

                  <div className="flex space-x-2">
                    {reservation.status === 'approved' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelClick(reservation)}
                        className="text-orange-600 border-orange-600 hover:bg-orange-50 h-8 px-3"
                      >
                        <Ban className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredReservations.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Eye className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {userReservations.length === 0 
                  ? "아직 예약한 차량이 없습니다." 
                  : "조건에 맞는 예약이 없습니다."
                }
              </p>
              {userReservations.length === 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  예약 신청 탭에서 새로운 예약을 만들어보세요.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* 상세 정보 다이얼로그 */}
        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <DialogContent className="max-w-sm mx-4">
            <DialogHeader>
              <DialogTitle>예약 상세 정보</DialogTitle>
            </DialogHeader>
            {selectedReservation && (
              <div className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div>
                    <strong>신청자:</strong>
                    <div>{selectedReservation.employeeName} ({selectedReservation.department})</div>
                  </div>
                  <div>
                    <strong>차량:</strong>
                    <div>{selectedReservation.vehicleName}</div>
                  </div>
                  <div>
                    <strong>상태:</strong>
                    <div className="mt-1">{getStatusBadge(selectedReservation.status)}</div>
                  </div>
                  <div>
                    <strong>사용 기간:</strong>
                    <div className="mt-1">
                      {formatDateTime(selectedReservation.startDate, selectedReservation.startTime)}
                      <br />
                      ~ {formatDateTime(selectedReservation.endDate, selectedReservation.endTime)}
                    </div>
                  </div>
                  <div>
                    <strong>사용 목적:</strong>
                    <div className="mt-1 p-3 bg-muted rounded">
                      {selectedReservation.purpose}
                    </div>
                  </div>
                  <div>
                    <strong>신청일시:</strong>
                    <div className="mt-1 text-muted-foreground">
                      {format(new Date(selectedReservation.createdAt), 'yyyy년 MM월 dd일 HH:mm', { locale: ko })}
                    </div>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDetailDialog(false)} className="w-full h-12">
                닫기
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 예약 취소 확인 다이얼로그 */}
        <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <DialogContent className="max-w-sm mx-4">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Ban className="h-5 w-5 text-orange-500" />
                <span>예약 취소 확인</span>
              </DialogTitle>
              <DialogDescription>
                이 예약을 취소하시겠습니까? 취소된 예약은 다시 활성화할 수 없습니다.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-col space-y-2">
              <Button variant="outline" onClick={handleConfirmCancel} className="w-full h-12 text-orange-600 border-orange-600 hover:bg-orange-50">
                취소
              </Button>
              <Button variant="outline" onClick={() => setShowCancelDialog(false)} className="w-full h-12">
                돌아가기
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // 데스크톱 버전
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>내 예약 관리</CardTitle>
              <CardDescription>
                나의 차량 예약을 확인하고 관리할 수 있습니다.
              </CardDescription>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="상태로 필터링" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="approved">예약 중</SelectItem>
                <SelectItem value="completed">완료됨</SelectItem>
                <SelectItem value="cancelled">취소됨</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>신청자</TableHead>
                  <TableHead>차량</TableHead>
                  <TableHead>사용 기간</TableHead>
                  <TableHead>목적</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReservations.map((reservation) => (
                  <TableRow key={reservation.id}>
                    <TableCell>
                      <div>
                        <div>{reservation.employeeName}</div>
                        <div className="text-sm text-muted-foreground">{reservation.department}</div>
                      </div>
                    </TableCell>
                    <TableCell>{reservation.vehicleName}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{formatDateTime(reservation.startDate, reservation.startTime)}</div>
                        <div className="text-muted-foreground">
                          ~ {formatDateTime(reservation.endDate, reservation.endTime)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-48">
                      <div className="truncate" title={reservation.purpose}>
                        {reservation.purpose}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(reservation.status)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetail(reservation)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {reservation.status === 'approved' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelClick(reservation)}
                            className="text-orange-600 border-orange-600 hover:bg-orange-50"
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredReservations.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              {userReservations.length === 0 
                ? "아직 예약한 차량이 없습니다. 예약 신청 탭에서 새로운 예약을 만들어보세요." 
                : "조건에 맞는 예약이 없습니다."
              }
            </div>
          )}
        </CardContent>
      </Card>

      {/* 상세 정보 다이얼로그 */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>예약 상세 정보</DialogTitle>
          </DialogHeader>
          {selectedReservation && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>신청자:</strong>
                  <div>{selectedReservation.employeeName}</div>
                </div>
                <div>
                  <strong>부서:</strong>
                  <div>{selectedReservation.department}</div>
                </div>
                <div>
                  <strong>차량:</strong>
                  <div>{selectedReservation.vehicleName}</div>
                </div>
                <div>
                  <strong>상태:</strong>
                  <div>{getStatusBadge(selectedReservation.status)}</div>
                </div>
              </div>
              <div>
                <strong className="text-sm">사용 기간:</strong>
                <div className="text-sm mt-1">
                  {formatDateTime(selectedReservation.startDate, selectedReservation.startTime)}
                  <br />
                  ~ {formatDateTime(selectedReservation.endDate, selectedReservation.endTime)}
                </div>
              </div>
              <div>
                <strong className="text-sm">사용 목적:</strong>
                <div className="text-sm mt-1 p-2 bg-muted rounded">
                  {selectedReservation.purpose}
                </div>
              </div>
              <div>
                <strong className="text-sm">신청일시:</strong>
                <div className="text-sm mt-1 text-muted-foreground">
                  {format(new Date(selectedReservation.createdAt), 'yyyy년 MM월 dd일 HH:mm', { locale: ko })}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 예약 취소 확인 다이얼로그 */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Ban className="h-5 w-5 text-orange-500" />
              <span>예약 취소 확인</span>
            </DialogTitle>
            <DialogDescription>
              이 예약을 취소하시겠습니까? 취소된 예약은 다시 활성화할 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              돌아가기
            </Button>
            <Button 
              variant="outline" 
              onClick={handleConfirmCancel}
              className="text-orange-600 border-orange-600 hover:bg-orange-50"
            >
              취소
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}