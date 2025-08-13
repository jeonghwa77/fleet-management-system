import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Car, Loader2, AlertCircle } from 'lucide-react';

interface AuthScreenProps {
  onSignIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  onSignUp: (email: string, password: string, name: string, department: string) => Promise<{ success: boolean; error?: string }>;
  isMobile?: boolean;
}

export default function AuthScreen({ onSignIn, onSignUp, isMobile = false }: AuthScreenProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 로그인 폼 상태
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // 회원가입 폼 상태
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpName, setSignUpName] = useState('');
  const [signUpDepartment, setSignUpDepartment] = useState('');

  const departments = ['프로젝트 1팀', '프로젝트 2팀', '연구개발팀', '경영지원팀', '기타'];

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await onSignIn(signInEmail, signInPassword);
      if (!result.success) {
        setError(result.error || '로그인에 실패했습니다.');
      }
    } catch (error: any) {
      setError('로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await onSignUp(signUpEmail, signUpPassword, signUpName, signUpDepartment);
      if (result.success) {
        setSuccess('회원가입이 완료되었습니다. 로그인해주세요.');
        // 폼 초기화
        setSignUpEmail('');
        setSignUpPassword('');
        setSignUpName('');
        setSignUpDepartment('');
      } else {
        setError(result.error || '회원가입에 실패했습니다.');
      }
    } catch (error: any) {
      setError('회원가입 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 로고 및 제목 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 bg-primary rounded-xl mx-auto mb-4">
            <Car className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl mb-2">법인차량 예약관리</h1>
          <p className="text-muted-foreground">회사 차량을 효율적으로 관리하고 예약하세요</p>
        </div>

        {/* 에러/성공 메시지 */}
        {error && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">
              {success}
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardContent className="p-6">
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin">로그인</TabsTrigger>
                <TabsTrigger value="signup">회원가입</TabsTrigger>
              </TabsList>

              {/* 로그인 탭 */}
              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">이메일</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      placeholder="이메일을 입력하세요"
                      required
                      className={isMobile ? "h-12" : ""}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password">비밀번호</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      placeholder="비밀번호를 입력하세요"
                      required
                      className={isMobile ? "h-12" : ""}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className={`w-full ${isMobile ? "h-12" : ""}`}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        로그인 중...
                      </>
                    ) : (
                      '로그인'
                    )}
                  </Button>
                </form>

                {/* 데모 계정 안내 */}
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">데모 계정:</p>
                  <p className="text-sm">이메일: demo@company.com</p>
                  <p className="text-sm">비밀번호: demo123 (김민수 - 프로젝트 1팀)</p>
                  <p className="text-sm mt-1">admin@company.com / admin123 (관리자 - 경영지원팀)</p>
                  <p className="text-sm">user@company.com / user123 (이영희 - 연구개발팀)</p>
                </div>
              </TabsContent>

              {/* 회원가입 탭 */}
              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">이름</Label>
                    <Input
                      id="signup-name"
                      value={signUpName}
                      onChange={(e) => setSignUpName(e.target.value)}
                      placeholder="이름을 입력하세요"
                      required
                      className={isMobile ? "h-12" : ""}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-department">부서</Label>
                    <Select value={signUpDepartment} onValueChange={setSignUpDepartment} required>
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

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">이메일</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      placeholder="이메일을 입력하세요"
                      required
                      className={isMobile ? "h-12" : ""}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">비밀번호</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      placeholder="비밀번호를 입력하세요 (최소 6자)"
                      required
                      minLength={6}
                      className={isMobile ? "h-12" : ""}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className={`w-full ${isMobile ? "h-12" : ""}`}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        가입 중...
                      </>
                    ) : (
                      '회원가입'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          법인차량 예약관리 시스템 v1.0
        </p>
      </div>
    </div>
  );
}