import React from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Wifi, WifiOff, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { ConnectionStatus as ConnectionStatusType } from '../types';

interface ConnectionBadgeProps {
  status: ConnectionStatusType;
  isUsingMockData: boolean;
}

export const ConnectionBadge: React.FC<ConnectionBadgeProps> = ({ status, isUsingMockData }) => {
  if (status === 'checking') {
    return (
      <Badge variant="outline" className="text-xs">
        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
        확인중
      </Badge>
    );
  }
  
  if (status === 'offline' || isUsingMockData) {
    return (
      <Badge variant="secondary" className="text-xs">
        <WifiOff className="w-3 h-3 mr-1" />
        오프라인
      </Badge>
    );
  }
  
  return (
    <Badge variant="default" className="text-xs bg-green-500">
      <Wifi className="w-3 h-3 mr-1" />
      온라인
    </Badge>
  );
};

interface OfflineModeAlertProps {
  isUsingMockData: boolean;
  status: ConnectionStatusType;
  onRetry: () => void;
}

export const OfflineModeAlert: React.FC<OfflineModeAlertProps> = ({ 
  isUsingMockData, 
  status, 
  onRetry 
}) => {
  if (!isUsingMockData) return null;

  return (
    <Alert className="mb-4 border-blue-200 bg-blue-50">
      <WifiOff className="h-4 w-4 text-blue-600" />
      <AlertDescription className="text-blue-800">
        현재 오프라인 모드로 실행 중입니다. 로컬 데이터를 사용하며 변경사항은 저장되지 않습니다.
        {status === 'offline' && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRetry}
            className="ml-2"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            재연결 시도
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};

interface ErrorAlertProps {
  error: string | null;
  isUsingMockData: boolean;
  onRetry: () => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ error, isUsingMockData, onRetry }) => {
  if (!error || isUsingMockData) return null;

  return (
    <Alert className="mb-4 border-red-200 bg-red-50">
      <AlertCircle className="h-4 w-4 text-red-600" />
      <AlertDescription className="text-red-800">
        {error}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRetry}
          className="ml-2"
        >
          다시 시도
        </Button>
      </AlertDescription>
    </Alert>
  );
};

interface InitializeDataAlertProps {
  isInitialized: boolean;
  loading: boolean;
  isUsingMockData: boolean;
  onInitialize: () => void;
}

export const InitializeDataAlert: React.FC<InitializeDataAlertProps> = ({ 
  isInitialized, 
  loading, 
  isUsingMockData, 
  onInitialize 
}) => {
  if (isInitialized || loading || isUsingMockData) return null;

  return (
    <Alert className="mb-4 border-blue-200 bg-blue-50">
      <AlertCircle className="h-4 w-4 text-blue-600" />
      <AlertDescription className="text-blue-800">
        시스템을 처음 사용하시는군요! 기본 차량 데이터를 설정하시겠습니까?
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onInitialize}
          className="ml-2"
          disabled={loading}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          초기 데이터 설정
        </Button>
      </AlertDescription>
    </Alert>
  );
};