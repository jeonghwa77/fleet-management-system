import { User } from '../types';

export const DEMO_USERS = [
  { id: '1', email: 'demo@company.com', password: 'demo123', name: '김민수', department: '프로젝트 1팀' },
  { id: '2', email: 'admin@company.com', password: 'admin123', name: '관리자', department: '경영지원팀' },
  { id: '3', email: 'user@company.com', password: 'user123', name: '이영희', department: '연구개발팀' }
];

export const DEMO_EMAILS = DEMO_USERS.map(u => u.email);

export const STORAGE_KEYS = {
  USER: 'vehicleApp_user',
  USERS: 'vehicleApp_users'
} as const;

export const TAB_TITLES = {
  dashboard: '대시보드',
  vehicles: '차량 목록',
  reservation: '예약 신청',
  management: '예약 관리'
} as const;

// 기존 부서명을 새로운 부서명으로 매핑
export const DEPARTMENT_MAPPING = {
  '영업부': '프로젝트 1팀',
  '인사부': '경영지원팀', 
  '개발부': '연구개발팀',
  '마케팅부': '프로젝트 2팀',
  '총무부': '경영지원팀',
  '기타': '기타'
} as const;

// 부서명 업데이트 함수
export const updateDepartmentName = (oldDepartment: string): string => {
  return DEPARTMENT_MAPPING[oldDepartment as keyof typeof DEPARTMENT_MAPPING] || oldDepartment;
};