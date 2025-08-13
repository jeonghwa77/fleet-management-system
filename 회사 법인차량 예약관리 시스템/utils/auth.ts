import { User } from '../types';
import { DEMO_USERS, DEMO_EMAILS, STORAGE_KEYS, updateDepartmentName } from './constants';

interface AuthResult {
  success: boolean;
  error?: string;
}

export const authUtils = {
  // 사용자 정보 로드
  loadUser: (): User | null => {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
      if (savedUser) {
        const user = JSON.parse(savedUser);
        // 부서명이 이전 부서명인 경우 자동으로 업데이트
        const updatedUser = {
          ...user,
          department: updateDepartmentName(user.department)
        };
        
        // 부서명이 변경되었다면 저장
        if (user.department !== updatedUser.department) {
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
        }
        
        return updatedUser;
      }
      return null;
    } catch (error) {
      console.error('사용자 정보 로드 실패:', error);
      localStorage.removeItem(STORAGE_KEYS.USER);
      return null;
    }
  },

  // 사용자 정보 저장
  saveUser: (user: User): void => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  // 사용자 정보 삭제
  clearUser: (): void => {
    localStorage.removeItem(STORAGE_KEYS.USER);
  },

  // 로그인 처리
  signIn: async (email: string, password: string): Promise<AuthResult & { user?: User }> => {
    try {
      // 로컬에 저장된 사용자들도 확인
      const savedUsers = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      const allUsers = [...DEMO_USERS, ...savedUsers];

      const foundUser = allUsers.find(u => u.email === email && u.password === password);
      
      if (foundUser) {
        const userInfo: User = {
          id: foundUser.id,
          email: foundUser.email,
          name: foundUser.name,
          department: updateDepartmentName(foundUser.department),
          createdAt: foundUser.createdAt || new Date().toISOString()
        };
        
        authUtils.saveUser(userInfo);
        return { success: true, user: userInfo };
      } else {
        return { success: false, error: '이메일 또는 비밀번호가 올바르지 않습니다.' };
      }
    } catch (error) {
      return { success: false, error: '로그인 중 오류가 발생했습니다.' };
    }
  },

  // 회원가입 처리
  signUp: async (email: string, password: string, name: string, department: string): Promise<AuthResult> => {
    try {
      const existingUsers = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      const allEmails = [...DEMO_EMAILS, ...existingUsers.map((u: any) => u.email)];
      
      if (allEmails.includes(email)) {
        return { success: false, error: '이미 존재하는 이메일입니다.' };
      }

      // 새 사용자 추가
      const newUser = {
        id: Date.now().toString(),
        email,
        name,
        department,
        password,
        createdAt: new Date().toISOString()
      };

      existingUsers.push(newUser);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(existingUsers));
      
      return { success: true };
    } catch (error) {
      return { success: false, error: '회원가입 중 오류가 발생했습니다.' };
    }
  }
};