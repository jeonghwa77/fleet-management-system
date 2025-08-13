import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Car, LayoutDashboard, List, Plus, Settings, Loader2, LogOut, RefreshCw } from 'lucide-react';
import VehicleList from './components/VehicleList';
import ReservationForm from './components/ReservationForm';
import ReservationManagement from './components/ReservationManagement';
import Dashboard from './components/Dashboard';
import MobileNavigation from './components/MobileNavigation';
import AuthScreen from './components/AuthScreen';
import { StatisticsCards } from './components/StatisticsCards';
import { 
  ConnectionBadge, 
  OfflineModeAlert, 
  ErrorAlert, 
  InitializeDataAlert 
} from './components/ConnectionStatus';
import { useData } from './hooks/useData';
import { authUtils } from './utils/auth';
import { connectionUtils } from './utils/connection';
import { TAB_TITLES } from './utils/constants';
import { User, ConnectionStatus } from './types';

export default function App() {
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('checking');
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  
  // 인증 관련 상태
  const [user, setUser] = useState<User | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // 데이터 관리 훅
  const {
    vehicles,
    reservations,
    loading,
    error,
    isInitialized,
    loadData,
    initializeData,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    addReservation,
    cancelReservation,
    completeReservation,
    deleteReservation
  } = useData();

  // 모바일 감지
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 인증 상태 확인
  useEffect(() => {
    const checkAuth = () => {
      const savedUser = authUtils.loadUser();
      if (savedUser) {
        setUser(savedUser);
      }
      setIsAuthChecking(false);
    };

    checkAuth();
  }, []);

  // 연결 상태 확인
  const checkConnection = async () => {
    try {
      setConnectionStatus('checking');
      const { connected, isUsingMockData } = await connectionUtils.checkConnection();
      setConnectionStatus(connected ? 'online' : 'offline');
      setIsUsingMockData(isUsingMockData);
      return connected;
    } catch (error) {
      setConnectionStatus('offline');
      setIsUsingMockData(true);
      return false;
    }
  };

  // 서버 연결 재시도
  const retryConnection = async () => {
    try {
      setConnectionStatus('checking');
      const result = await connectionUtils.retryConnection();
      if (result.connected) {
        await loadDataWithConnection();
      } else {
        setConnectionStatus('offline');
      }
    } catch (error) {
      setConnectionStatus('offline');
    }
  };

  // 연결 상태와 함께 데이터 로드
  const loadDataWithConnection = async () => {
    await checkConnection();
    await loadData();
  };

  // 컴포넌트 마운트 시 데이터 로드 (로그인된 경우에만)
  useEffect(() => {
    if (user && !isAuthChecking) {
      loadDataWithConnection();
    }
  }, [user, isAuthChecking]);

  // 인증 핸들러들
  const handleSignIn = async (email: string, password: string) => {
    const result = await authUtils.signIn(email, password);
    if (result.success && result.user) {
      setUser(result.user);
    }
    return result;
  };

  const handleSignUp = async (email: string, password: string, name: string, department: string) => {
    return await authUtils.signUp(email, password, name, department);
  };

  const handleSignOut = () => {
    setUser(null);
    authUtils.clearUser();
    setActiveTab('dashboard');
  };

  // 계산된 값들 (현재 사용자의 활성 예약만)
  const activeReservations = reservations.filter(r => 
    r.status === 'approved' && 
    r.employeeName === user?.name && 
    r.department === user?.department
  ).length;

  const getTabTitle = (tab: string) => {
    return TAB_TITLES[tab as keyof typeof TAB_TITLES] || '';
  };

  // 인증 확인 중
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">인증 상태를 확인하는 중...</p>
        </div>
      </div>
    );
  }

  // 로그인되지 않은 경우 인증 화면 표시
  if (!user) {
    return (
      <AuthScreen 
        onSignIn={handleSignIn}
        onSignUp={handleSignUp}
        isMobile={isMobile}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">시스템을 초기화하는 중...</p>
          <p className="text-sm text-muted-foreground mt-2">서버 연결을 확인하고 있습니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* PWA 스타일 헤더 */}
      <div className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-14 md:h-16">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
                <Car className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg md:text-xl">{isMobile ? getTabTitle(activeTab) : '법인차량 예약관리'}</h1>
                {!isMobile && (
                  <p className="text-sm text-muted-foreground">회사 차량을 효율적으로 관리하고 예약하세요</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {!isMobile && (
                <>
                  <span className="text-sm text-muted-foreground hidden md:block">
                    {user.name} ({user.department})
                  </span>
                  <ConnectionBadge status={connectionStatus} isUsingMockData={isUsingMockData} />
                </>
              )}
              {activeReservations > 0 && (
                <Badge variant="default" className="md:hidden bg-blue-500">
                  {activeReservations}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="h-8 w-8 p-0"
                title="로그아웃"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className={`container mx-auto px-4 md:px-6 ${isMobile ? 'pb-20' : 'py-6'} max-w-6xl`}>
        {/* 연결 상태 알림 (모바일) */}
        {isMobile && (
          <div className="flex items-center justify-between mb-4 p-3 bg-muted rounded-lg">
            <div className="flex items-center space-x-2">
              <ConnectionBadge status={connectionStatus} isUsingMockData={isUsingMockData} />
              <span className="text-sm">
                {isUsingMockData ? '로컬 데이터 사용중' : '서버 연결됨'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                {user.name}
              </span>
              {connectionStatus === 'offline' && (
                <Button variant="outline" size="sm" onClick={retryConnection}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        )}

        {/* 알림들 */}
        <OfflineModeAlert 
          isUsingMockData={isUsingMockData}
          status={connectionStatus}
          onRetry={retryConnection}
        />

        <ErrorAlert 
          error={error}
          isUsingMockData={isUsingMockData}
          onRetry={loadData}
        />

        <InitializeDataAlert 
          isInitialized={isInitialized}
          loading={loading}
          isUsingMockData={isUsingMockData}
          onInitialize={initializeData}
        />

        {/* 데스크톱용 통계 카드 */}
        {!isMobile && (
          <StatisticsCards 
            vehicles={vehicles}
            reservations={reservations}
            connectionStatus={connectionStatus}
            isUsingMockData={isUsingMockData}
          />
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          {/* 데스크톱용 탭 */}
          {!isMobile && (
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="dashboard">대시보드</TabsTrigger>
              <TabsTrigger value="vehicles">차량 목록</TabsTrigger>
              <TabsTrigger value="reservation">예약 신청</TabsTrigger>
              <TabsTrigger value="management">예약 관리</TabsTrigger>
            </TabsList>
          )}

          <div className={isMobile ? 'pt-4' : ''}>
            <TabsContent value="dashboard">
              <Dashboard 
                vehicles={vehicles} 
                reservations={reservations} 
                isMobile={isMobile}
                onRefresh={loadData}
              />
            </TabsContent>

            <TabsContent value="vehicles">
              <VehicleList 
                vehicles={vehicles} 
                isMobile={isMobile}
                onRefresh={loadData}
                onAdd={addVehicle}
                onUpdate={updateVehicle}
                onDelete={deleteVehicle}
              />
            </TabsContent>

            <TabsContent value="reservation">
              <ReservationForm 
                vehicles={vehicles} 
                onSubmit={addReservation}
                existingReservations={reservations}
                currentUser={user}
                isMobile={isMobile}
              />
            </TabsContent>

            <TabsContent value="management">
              <ReservationManagement 
                reservations={reservations}
                currentUser={user}
                onCancel={cancelReservation}
                onComplete={completeReservation}
                onDelete={deleteReservation}
                isMobile={isMobile}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* 모바일용 하단 네비게이션 */}
      {isMobile && (
        <MobileNavigation 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          pendingCount={activeReservations}
        />
      )}
    </div>
  );
}