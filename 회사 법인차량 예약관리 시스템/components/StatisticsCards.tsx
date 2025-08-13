import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Car, Calendar, Clock, Users } from 'lucide-react';
import { Vehicle, Reservation } from '../types';
import { ConnectionBadge } from './ConnectionStatus';
import { ConnectionStatus } from '../types';

interface StatisticsCardsProps {
  vehicles: Vehicle[];
  reservations: Reservation[];
  connectionStatus: ConnectionStatus;
  isUsingMockData: boolean;
}

export const StatisticsCards: React.FC<StatisticsCardsProps> = ({
  vehicles,
  reservations,
  connectionStatus,
  isUsingMockData
}) => {
  const availableVehicles = vehicles.filter(v => v.status === 'available');
  const totalReservations = reservations.length;
  const activeReservations = reservations.filter(r => r.status === 'approved').length;
  const utilizationRate = vehicles.length > 0 
    ? Math.round((vehicles.filter(v => v.status === 'reserved').length / vehicles.length) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm">전체 차량</CardTitle>
          <Car className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl">{vehicles.length}</div>
          <p className="text-xs text-muted-foreground">
            사용 가능: {availableVehicles.length}대
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm">총 예약</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl">{totalReservations}</div>
          <p className="text-xs text-muted-foreground">
            전체 예약 건수
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm">활성 예약</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl">{activeReservations}</div>
          <p className="text-xs text-muted-foreground">
            사용중인 예약
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm flex items-center">
            <span>시스템 상태</span>
            <div className="ml-2">
              <ConnectionBadge status={connectionStatus} isUsingMockData={isUsingMockData} />
            </div>
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl">{utilizationRate}%</div>
          <p className="text-xs text-muted-foreground">
            차량 이용률
          </p>
        </CardContent>
      </Card>
    </div>
  );
};