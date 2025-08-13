using System.Threading.Tasks;
using FleetManagementSystem4.Shared.Models;

namespace FleetManagementSystem4.Shared.Services
{
    public class AuthService
    {
        private readonly SupabaseService _supabaseService;
        
        public bool IsAuthenticated { get; private set; } = false;
        public string? UserName { get; private set; }
        public User? CurrentUser { get; private set; }

        public AuthService(SupabaseService supabaseService)
        {
            _supabaseService = supabaseService;
        }

        public async Task<bool> SignInAsync(string email, string password)
        {
            try
            {
                // Admin 계정 체크
                if (email == "admin@company.com" && password == "admin123")
                {
                    IsAuthenticated = true;
                    UserName = "관리자";
                    CurrentUser = new User
                    {
                        Id = "admin_user",
                        Name = "관리자",
                        Email = email,
                        Department = "경영지원팀",
                        Role = "Admin"
                    };
                    return true;
                }

                // Supabase 인증 시도
                var authResult = await _supabaseService.SignInAsync(email, password);
                
                if (authResult)
                {
                    // 사용자 정보를 Supabase에서 가져오기
                    var user = await _supabaseService.GetUserByEmailAsync(email);
                    
                    if (user != null)
                    {
                        IsAuthenticated = true;
                        UserName = user.Name;
                        CurrentUser = user;
                        return true;
                    }
                }
                
                // 데모 계정 체크 (기존 호환성 유지)
                if (email == "demo@company.com" && password == "demo123")
                {
                    IsAuthenticated = true;
                    UserName = "김민수";
                    CurrentUser = new User
                    {
                        Id = "demo_user",
                        Name = "김민수",
                        Email = email,
                        Department = "프로젝트 1팀"
                    };
                    return true;
                }
                
                return false;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"로그인 오류: {ex.Message}");
                
                // 오류 시 Admin 계정으로 fallback
                if (email == "admin@company.com" && password == "admin123")
                {
                    IsAuthenticated = true;
                    UserName = "관리자";
                    CurrentUser = new User
                    {
                        Id = "admin_user",
                        Name = "관리자",
                        Email = email,
                        Department = "경영지원팀",
                        Role = "Admin"
                    };
                    return true;
                }
                
                // 데모 계정 fallback
                if (email == "demo@company.com" && password == "demo123")
                {
                    IsAuthenticated = true;
                    UserName = "김민수";
                    CurrentUser = new User
                    {
                        Id = "demo_user",
                        Name = "김민수",
                        Email = email,
                        Department = "프로젝트 1팀"
                    };
                    return true;
                }
                
                return false;
            }
        }

        public async Task<(bool Success, string Message)> SignUpAsync(string email, string password, string name, string department)
        {
            try
            {
                Console.WriteLine($"AuthService SignUp 시작: {email}, {name}, {department}");
                
                // Supabase Auth에 사용자 생성
                var authResult = await _supabaseService.SignUpAsync(email, password);
                Console.WriteLine($"Auth 결과: {authResult}");
                
                if (authResult)
                {
                    // Users 테이블에 프로필 정보 저장 (ID는 자동 생성되도록 빈 문자열로 설정)
                    var user = new User
                    {
                        Name = name,
                        Email = email,
                        Department = department,
                        Role = "User",
                        CreatedAt = DateTime.Now
                    };
                    
                    Console.WriteLine($"프로필 저장 시도 중...");
                    var profileResult = await _supabaseService.AddUserAsync(user);
                    Console.WriteLine($"프로필 저장 결과: {profileResult}");
                    
                    if (profileResult)
                    {
                        return (true, "회원가입이 완료되었습니다.");
                    }
                    else
                    {
                        return (false, "프로필 저장에 실패했습니다. Supabase 데이터베이스의 users 테이블을 확인해주세요.");
                    }
                }
                else
                {
                    return (false, "Supabase 인증 회원가입에 실패했습니다. 이메일 형식이나 비밀번호를 확인해주세요.");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"회원가입 오류: {ex.Message}");
                Console.WriteLine($"오류 타입: {ex.GetType().Name}");
                Console.WriteLine($"스택 트레이스: {ex.StackTrace}");
                return (false, $"회원가입 중 오류가 발생했습니다: {ex.Message}");
            }
        }

        public void SignOut()
        {
            IsAuthenticated = false;
            UserName = null;
            CurrentUser = null;
        }
    }
}
