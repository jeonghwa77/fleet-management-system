import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { 
  Car, 
  Plus, 
  Settings, 
  MoreVertical, 
  Edit, 
  Trash2, 
  AlertCircle, 
  Check, 
  X,
  RefreshCw,
  Palette,
  Fuel,
  Users
} from 'lucide-react';
import { Vehicle } from '../App';

interface VehicleListProps {
  vehicles: Vehicle[];
  isMobile?: boolean;
  onRefresh?: () => void;
  onAdd?: (vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Vehicle>;
  onUpdate?: (id: string, updates: Partial<Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<Vehicle>;
  onDelete?: (id: string) => Promise<void>;
}

const DEFAULT_COLORS = [
  { value: 'bg-blue-500', label: '파란색', color: '#3b82f6' },
  { value: 'bg-green-500', label: '초록색', color: '#10b981' },
  { value: 'bg-yellow-500', label: '노란색', color: '#eab308' },
  { value: 'bg-purple-500', label: '보라색', color: '#8b5cf6' },
  { value: 'bg-pink-500', label: '분홍색', color: '#ec4899' },
  { value: 'bg-indigo-500', label: '남색', color: '#6366f1' },
  { value: 'bg-red-500', label: '빨간색', color: '#ef4444' },
  { value: 'bg-orange-500', label: '주황색', color: '#f97316' },
  { value: 'bg-teal-500', label: '청록색', color: '#14b8a6' },
  { value: 'bg-cyan-500', label: '하늘색', color: '#06b6d4' },
  { value: 'bg-lime-500', label: '라임색', color: '#84cc16' },
  { value: 'bg-emerald-500', label: '에메랄드색', color: '#10b981' }
];

const VEHICLE_TYPES = ['승용차', 'SUV', '승합차', '트럭', '버스', '기타'];
const FUEL_TYPES = ['휘발유', '경유', '하이브리드', '전기', 'LPG'];

export default function VehicleList({ 
  vehicles, 
  isMobile = false, 
  onRefresh, 
  onAdd, 
  onUpdate, 
  onDelete 
}: VehicleListProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adminPassword, setAdminPassword] = useState('');

  // 새 차량 추가 폼 상태
  const [newVehicle, setNewVehicle] = useState({
    name: '',
    type: '',
    plateNumber: '',
    capacity: 4,
    status: 'available' as const,
    fuelType: '',
    color: DEFAULT_COLORS[0].value
  });

  // 차량 수정 폼 상태
  const [editVehicle, setEditVehicle] = useState({
    name: '',
    type: '',
    plateNumber: '',
    capacity: 4,
    status: 'available' as const,
    fuelType: '',
    color: DEFAULT_COLORS[0].value
  });

  // 기본 색상 할당 함수 (color가 없는 경우)
  const getVehicleColor = (vehicleId: string, customColor?: string) => {
    if (customColor) return customColor;
    
    let hash = 0;
    for (let i = 0; i < vehicleId.length; i++) {
      hash = vehicleId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return DEFAULT_COLORS[Math.abs(hash) % DEFAULT_COLORS.length].value;
  };

  // 색상 표시명 가져오기
  const getColorLabel = (colorValue: string) => {
    const color = DEFAULT_COLORS.find(c => c.value === colorValue);
    return color ? color.label : '사용자 정의';
  };

  // 상태 뱃지 표시
  const getStatusBadge = (status: Vehicle['status']) => {
    switch (status) {
      case 'available':
        return <Badge variant="default" className="bg-green-500">사용 가능</Badge>;
      case 'reserved':
        return <Badge variant="default" className="bg-blue-500">예약중</Badge>;
      case 'maintenance':
        return <Badge variant="destructive">정비중</Badge>;
    }
  };

  // 폼 초기화
  const resetForm = () => {
    setNewVehicle({
      name: '',
      type: '',
      plateNumber: '',
      capacity: 4,
      status: 'available',
      fuelType: '',
      color: DEFAULT_COLORS[0].value
    });
    setEditVehicle({
      name: '',
      type: '',
      plateNumber: '',
      capacity: 4,
      status: 'available',
      fuelType: '',
      color: DEFAULT_COLORS[0].value
    });
    setAdminPassword('');
    setError(null);
  };

  // 차량 추가
  const handleAdd = async () => {
    if (!newVehicle.name || !newVehicle.type || !newVehicle.plateNumber || !newVehicle.fuelType) {
      setError('모든 필수 항목을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (onAdd) {
        await onAdd(newVehicle);
        setShowAddDialog(false);
        resetForm();
      }
    } catch (err) {
      console.error('차량 추가 실패:', err);
      setError(err instanceof Error ? err.message : '차량 추가에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 차량 수정 다이얼로그 열기
  const openEditDialog = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setEditVehicle({
      name: vehicle.name,
      type: vehicle.type,
      plateNumber: vehicle.plateNumber,
      capacity: vehicle.capacity,
      status: vehicle.status,
      fuelType: vehicle.fuelType,
      color: vehicle.color || getVehicleColor(vehicle.id)
    });
    setShowEditDialog(true);
    setError(null);
  };

  // 차량 수정
  const handleUpdate = async () => {
    if (!editVehicle.name || !editVehicle.type || !editVehicle.plateNumber || !editVehicle.fuelType) {
      setError('모든 필수 항목을 입력해주세요.');
      return;
    }

    if (!selectedVehicle) return;

    setIsSubmitting(true);
    setError(null);

    try {
      if (onUpdate) {
        await onUpdate(selectedVehicle.id, editVehicle);
        setShowEditDialog(false);
        setSelectedVehicle(null);
        resetForm();
      }
    } catch (err) {
      console.error('차량 수정 실패:', err);
      setError(err instanceof Error ? err.message : '차량 수정에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 차량 삭제 다이얼로그 열기 (먼저 비밀번호 확인)
  const openDeleteDialog = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setShowPasswordDialog(true);
    setAdminPassword('');
    setError(null);
  };

  // 관리자 비밀번호 확인
  const verifyPassword = () => {
    if (adminPassword !== 'psylogic') {
      setError('관리자 비밀번호가 올바르지 않습니다.');
      return;
    }
    
    setShowPasswordDialog(false);
    setShowDeleteDialog(true);
    setAdminPassword('');
    setError(null);
  };

  // 차량 삭제
  const handleDelete = async () => {
    if (!selectedVehicle) return;

    setIsSubmitting(true);
    setError(null);

    try {
      if (onDelete) {
        await onDelete(selectedVehicle.id);
        setShowDeleteDialog(false);
        setSelectedVehicle(null);
      }
    } catch (err) {
      console.error('차량 삭제 실패:', err);
      setError(err instanceof Error ? err.message : '차량 삭제에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Car className="h-5 w-5" />
              <CardTitle>차량 목록</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              {onRefresh && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRefresh}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  새로고침
                </Button>
              )}
              {onAdd && (
                <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm" onClick={resetForm}>
                      <Plus className="w-4 h-4 mr-2" />
                      차량 추가
                    </Button>
                  </DialogTrigger>
                </Dialog>
              )}
            </div>
          </div>
          <CardDescription>
            회사 차량을 관리하고 각 차량의 정보와 색상을 설정하세요.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* 차량 목록 */}
      <div className={isMobile ? "space-y-3" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"}>
        {vehicles.map(vehicle => (
          <Card key={vehicle.id} className="relative overflow-visible">
            <CardHeader className="pb-3 overflow-visible">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div 
                    className={`w-4 h-4 rounded ${getVehicleColor(vehicle.id, vehicle.color)}`}
                    title={`캘린더 색상: ${getColorLabel(vehicle.color || getVehicleColor(vehicle.id))}`}
                  />
                  <CardTitle className="text-lg">{vehicle.name}</CardTitle>
                </div>
{(onUpdate || onDelete) && (
                  <div className="flex space-x-1">
                    {onUpdate && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => openEditDialog(vehicle)}
                        title="차량 정보 수정"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => openDeleteDialog(vehicle)}
                        title="차량 삭제"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">상태</span>
                  {getStatusBadge(vehicle.status)}
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">차종</span>
                    <span>{vehicle.type}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">번호판</span>
                    <span className="font-mono">{vehicle.plateNumber}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center">
                      <Users className="w-3 h-3 mr-1" />
                      승차인원
                    </span>
                    <span>{vehicle.capacity}명</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center">
                      <Fuel className="w-3 h-3 mr-1" />
                      연료
                    </span>
                    <span>{vehicle.fuelType}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {vehicles.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Car className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">등록된 차량이 없습니다.</p>
            {onAdd && (
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm}>
                    <Plus className="w-4 h-4 mr-2" />
                    첫 번째 차량 추가하기
                  </Button>
                </DialogTrigger>
              </Dialog>
            )}
          </CardContent>
        </Card>
      )}

      {/* 차량 추가 다이얼로그 */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>새 차량 추가</DialogTitle>
            <DialogDescription>
              새로운 차량의 정보를 입력해주세요.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="add-name">차량명 *</Label>
              <Input
                id="add-name"
                value={newVehicle.name}
                onChange={(e) => setNewVehicle(prev => ({ ...prev, name: e.target.value }))}
                placeholder="예: 아반떼"
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-type">차종 *</Label>
                <Select 
                  value={newVehicle.type} 
                  onValueChange={(value) => setNewVehicle(prev => ({ ...prev, type: value }))}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {VEHICLE_TYPES.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="add-capacity">승차인원 *</Label>
                <Select 
                  value={newVehicle.capacity.toString()} 
                  onValueChange={(value) => setNewVehicle(prev => ({ ...prev, capacity: parseInt(value) }))}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[2, 4, 5, 7, 8, 9, 10, 11, 12, 15, 20, 25, 30].map(num => (
                      <SelectItem key={num} value={num.toString()}>{num}명</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-plate">번호판 *</Label>
              <Input
                id="add-plate"
                value={newVehicle.plateNumber}
                onChange={(e) => setNewVehicle(prev => ({ ...prev, plateNumber: e.target.value }))}
                placeholder="예: 12가 3456"
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-fuel">연료 *</Label>
                <Select 
                  value={newVehicle.fuelType} 
                  onValueChange={(value) => setNewVehicle(prev => ({ ...prev, fuelType: value }))}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {FUEL_TYPES.map(fuel => (
                      <SelectItem key={fuel} value={fuel}>{fuel}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="add-status">상태</Label>
                <Select 
                  value={newVehicle.status} 
                  onValueChange={(value: 'available' | 'maintenance') => setNewVehicle(prev => ({ ...prev, status: value }))}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">사용 가능</SelectItem>
                    <SelectItem value="maintenance">정비중</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-color">색상</Label>
              <Select 
                value={newVehicle.color} 
                onValueChange={(value) => setNewVehicle(prev => ({ ...prev, color: value }))}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEFAULT_COLORS.map(color => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center space-x-2">
                        <div className={`w-4 h-4 rounded ${color.value}`} />
                        <span>{color.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex space-x-2 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowAddDialog(false)}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button
              className="flex-1"
              onClick={handleAdd}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  추가 중...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  추가
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 차량 수정 다이얼로그 */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>차량 정보 수정</DialogTitle>
            <DialogDescription>
              {selectedVehicle?.name}의 정보를 수정합니다.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">차량명 *</Label>
              <Input
                id="edit-name"
                value={editVehicle.name}
                onChange={(e) => setEditVehicle(prev => ({ ...prev, name: e.target.value }))}
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-type">차종 *</Label>
                <Select 
                  value={editVehicle.type} 
                  onValueChange={(value) => setEditVehicle(prev => ({ ...prev, type: value }))}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VEHICLE_TYPES.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-capacity">승차인원 *</Label>
                <Select 
                  value={editVehicle.capacity.toString()} 
                  onValueChange={(value) => setEditVehicle(prev => ({ ...prev, capacity: parseInt(value) }))}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[2, 4, 5, 7, 8, 9, 10, 11, 12, 15, 20, 25, 30].map(num => (
                      <SelectItem key={num} value={num.toString()}>{num}명</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-plate">번호판 *</Label>
              <Input
                id="edit-plate"
                value={editVehicle.plateNumber}
                onChange={(e) => setEditVehicle(prev => ({ ...prev, plateNumber: e.target.value }))}
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-fuel">연료 *</Label>
                <Select 
                  value={editVehicle.fuelType} 
                  onValueChange={(value) => setEditVehicle(prev => ({ ...prev, fuelType: value }))}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FUEL_TYPES.map(fuel => (
                      <SelectItem key={fuel} value={fuel}>{fuel}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-status">상태</Label>
                <Select 
                  value={editVehicle.status} 
                  onValueChange={(value: 'available' | 'maintenance') => setEditVehicle(prev => ({ ...prev, status: value }))}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">사용 가능</SelectItem>
                    <SelectItem value="maintenance">정비중</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-color">색상</Label>
              <Select 
                value={editVehicle.color} 
                onValueChange={(value) => setEditVehicle(prev => ({ ...prev, color: value }))}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEFAULT_COLORS.map(color => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center space-x-2">
                        <div className={`w-4 h-4 rounded ${color.value}`} />
                        <span>{color.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex space-x-2 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowEditDialog(false)}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button
              className="flex-1"
              onClick={handleUpdate}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  수정 중...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  수정
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 관리자 비밀번호 확인 다이얼로그 */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>관리자 인증 필요</DialogTitle>
            <DialogDescription>
              차량 삭제를 위해 관리자 비밀번호를 입력해주세요.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-password">관리자 비밀번호</Label>
              <Input
                id="admin-password"
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    verifyPassword();
                  }
                }}
                autoFocus
              />
            </div>
          </div>

          <div className="flex space-x-2 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setShowPasswordDialog(false);
                setAdminPassword('');
                setError(null);
              }}
            >
              취소
            </Button>
            <Button
              className="flex-1"
              onClick={verifyPassword}
              disabled={!adminPassword}
            >
              확인
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 차량 삭제 확인 다이얼로그 */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>차량 삭제 확인</DialogTitle>
            <DialogDescription>
              정말로 "{selectedVehicle?.name}"을(를) 삭제하시겠습니까?
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-red-800">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">⚠️ 최종 확인</span>
            </div>
            <p className="text-sm text-red-700 mt-2">
              관리자 인증이 완료되었습니다. 삭제된 차량은 복구할 수 없으며, 해당 차량에 활성 예약이 있으면 삭제할 수 없습니다.
            </p>
          </div>

          <div className="flex space-x-2 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  삭제 중...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  삭제
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}