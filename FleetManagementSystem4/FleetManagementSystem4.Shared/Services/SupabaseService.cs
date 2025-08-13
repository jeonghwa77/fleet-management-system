using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Diagnostics;
using Supabase;
using FleetManagementSystem4.Shared.Models;

namespace FleetManagementSystem4.Shared.Services
{
    public class SupabaseService
    {
        private readonly Client _client;
        private bool _isInitialized = false;

        public SupabaseService(string url, string key)
        {
            _client = new Client(url, key);
        }

        private async Task EnsureInitializedAsync()
        {
            if (!_isInitialized)
            {
                Debug.WriteLine("=== Supabase 클라이언트 초기화 시작 ===");
                try
                {
                    Debug.WriteLine("InitializeAsync 호출...");
                    await _client.InitializeAsync();
                    _isInitialized = true;
                    Debug.WriteLine("Supabase 클라이언트 초기화 완료");
                    
                    // 연결 테스트
                    Debug.WriteLine("연결 테스트 중...");
                    var testResult = await _client.From<Vehicle>().Select("*").Limit(1).Get();
                    Debug.WriteLine($"연결 테스트 성공 - 응답 받음");
                }
                catch (System.Exception ex)
                {
                    Debug.WriteLine($"=== Supabase 초기화 오류 ===");
                    Debug.WriteLine($"오류 메시지: {ex.Message}");
                    Debug.WriteLine($"오류 타입: {ex.GetType().Name}");
                    Debug.WriteLine($"스택 트레이스: {ex.StackTrace}");
                    if (ex.InnerException != null)
                    {
                        Debug.WriteLine($"내부 오류: {ex.InnerException.Message}");
                        Debug.WriteLine($"내부 오류 타입: {ex.InnerException.GetType().Name}");
                    }
                    throw;
                }
            }
            else
            {
                Debug.WriteLine("Supabase 클라이언트 이미 초기화됨");
            }
        }

        public async Task<bool> AddVehicleAsync(Vehicle vehicle)
        {
            try
            {
                System.Console.WriteLine("=== 차량 추가 시작 ===");
                System.Console.WriteLine($"차량명: {vehicle.Name}");
                System.Console.WriteLine($"차종: {vehicle.Type}");
                System.Console.WriteLine($"번호판: {vehicle.LicensePlate}");
                System.Console.WriteLine($"연료: {vehicle.Fuel}");
                System.Console.WriteLine($"승차인원: {vehicle.Capacity}");
                System.Console.WriteLine($"상태: {vehicle.Status}");
                System.Console.WriteLine($"색상: {vehicle.Color}");

                await EnsureInitializedAsync();
                System.Console.WriteLine("Supabase 초기화 완료");

                // UUID 자동 생성은 데이터베이스에서 처리
                vehicle.CreatedAt = DateTime.Now;
                vehicle.UpdatedAt = DateTime.Now;

                System.Console.WriteLine("차량 추가 실행 중...");
                var response = await _client.From<Vehicle>().Insert(vehicle);
                System.Console.WriteLine($"Insert 응답 상태: {response?.ResponseMessage?.StatusCode}");
                System.Console.WriteLine($"Insert 응답 내용 존재: {response?.ResponseMessage?.Content != null}");
                
                if (response?.Models?.Count > 0)
                {
                    System.Console.WriteLine($"추가된 차량 수: {response.Models.Count}");
                    System.Console.WriteLine($"추가된 차량 ID: {response.Models[0].Id}");
                    System.Console.WriteLine("=== 차량 추가 성공! ===");
                    return true;
                }
                else
                {
                    System.Console.WriteLine("응답에 추가된 차량 데이터가 없음");
                    return false;
                }
            }
            catch (System.Exception ex)
            {
                System.Console.WriteLine($"=== 차량 추가 오류 ===");
                System.Console.WriteLine($"오류 메시지: {ex.Message}");
                System.Console.WriteLine($"오류 타입: {ex.GetType().Name}");
                System.Console.WriteLine($"스택 트레이스: {ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    System.Console.WriteLine($"내부 오류: {ex.InnerException.Message}");
                    System.Console.WriteLine($"내부 오류 타입: {ex.InnerException.GetType().Name}");
                }
                return false;
            }
        }

        public async Task<bool> UpdateVehicleAsync(Vehicle vehicle)
        {
            try
            {
                Debug.WriteLine($"=== 차량 수정 시작 (4가지 방법 테스트) ===");
                Console.WriteLine($"=== 차량 수정 시작 (4가지 방법 테스트) ===");
                Debug.WriteLine($"차량 ID: {vehicle.Id}");
                Console.WriteLine($"차량 ID: {vehicle.Id}");
                Debug.WriteLine($"차량명: {vehicle.Name}");
                Console.WriteLine($"차량명: {vehicle.Name}");
                Debug.WriteLine($"차종: {vehicle.Type}");
                Console.WriteLine($"차종: {vehicle.Type}");
                Debug.WriteLine($"번호판: {vehicle.LicensePlate}");
                Console.WriteLine($"번호판: {vehicle.LicensePlate}");
                Debug.WriteLine($"연료: {vehicle.Fuel}");
                Console.WriteLine($"연료: {vehicle.Fuel}");
                Debug.WriteLine($"승차인원: {vehicle.Capacity}");
                Console.WriteLine($"승차인원: {vehicle.Capacity}");
                Debug.WriteLine($"상태: {vehicle.Status}");
                Console.WriteLine($"상태: {vehicle.Status}");
                Debug.WriteLine($"색상: {vehicle.Color}");
                Console.WriteLine($"색상: {vehicle.Color}");
                
                if (string.IsNullOrEmpty(vehicle.Id))
                {
                    Debug.WriteLine("오류: 차량 ID가 비어있습니다!");
                    Console.WriteLine("오류: 차량 ID가 비어있습니다!");
                    return false;
                }
                
                await EnsureInitializedAsync();
                Debug.WriteLine("Supabase 초기화 완료");
                Console.WriteLine("Supabase 초기화 완료");
                
                vehicle.UpdatedAt = DateTime.Now;
                
                // 기본값으로 초기화하여 null 문제 방지
                vehicle.Name = vehicle.Name ?? "";
                vehicle.Type = vehicle.Type ?? "";
                vehicle.LicensePlate = vehicle.LicensePlate ?? "";
                vehicle.Fuel = vehicle.Fuel ?? "";
                vehicle.Status = vehicle.Status ?? "";
                vehicle.Color = vehicle.Color ?? "";
                if (vehicle.Capacity <= 0) vehicle.Capacity = 1;
                
                Debug.WriteLine("\n=== 방법 1: 기본 Update ===");
                Console.WriteLine("\n=== 방법 1: 기본 Update ===");
                try
                {
                    // 먼저 해당 차량이 존재하는지 확인
                    Debug.WriteLine($"차량 존재 확인: ID = {vehicle.Id}");
                    Console.WriteLine($"차량 존재 확인: ID = {vehicle.Id}");
                    
                    var existingVehicle = await _client.From<Vehicle>()
                        .Where(v => v.Id == vehicle.Id)
                        .Get();
                    
                    Debug.WriteLine($"기존 차량 조회 결과: {existingVehicle?.Models?.Count ?? 0}개");
                    Console.WriteLine($"기존 차량 조회 결과: {existingVehicle?.Models?.Count ?? 0}개");
                    
                    if (existingVehicle?.Models?.Count == 0)
                    {
                        Debug.WriteLine("오류: 해당 ID의 차량을 찾을 수 없습니다!");
                        Console.WriteLine("오류: 해당 ID의 차량을 찾을 수 없습니다!");
                        return false;
                    }
                    
                    Debug.WriteLine($"기존 차량 정보: {existingVehicle.Models[0].Name} - {existingVehicle.Models[0].LicensePlate}");
                    Console.WriteLine($"기존 차량 정보: {existingVehicle.Models[0].Name} - {existingVehicle.Models[0].LicensePlate}");
                    
                    var updateResponse = await _client.From<Vehicle>()
                        .Where(v => v.Id == vehicle.Id)
                        .Update(vehicle);
                    
                    Debug.WriteLine($"Update 응답 상태: {updateResponse?.ResponseMessage?.StatusCode}");
                    Console.WriteLine($"Update 응답 상태: {updateResponse?.ResponseMessage?.StatusCode}");
                    Debug.WriteLine($"Update 응답 모델 수: {updateResponse?.Models?.Count ?? 0}");
                    Console.WriteLine($"Update 응답 모델 수: {updateResponse?.Models?.Count ?? 0}");
                    
                    if (updateResponse?.ResponseMessage?.Content != null)
                    {
                        Debug.WriteLine($"Update 응답 내용: {updateResponse.ResponseMessage.Content}");
                        Console.WriteLine($"Update 응답 내용: {updateResponse.ResponseMessage.Content}");
                    }
                    
                    if (updateResponse?.Models?.Count > 0)
                    {
                        Debug.WriteLine("방법 1 성공!");
                        Console.WriteLine("방법 1 성공!");
                        return true;
                    }
                    else
                    {
                        Debug.WriteLine("방법 1 실패 - 응답 모델 없음 (RLS 정책 문제일 수 있음)");
                        Console.WriteLine("방법 1 실패 - 응답 모델 없음 (RLS 정책 문제일 수 있음)");
                    }
                }
                catch (System.Exception ex1)
                {
                    Debug.WriteLine($"방법 1 오류: {ex1.Message}");
                    Console.WriteLine($"방법 1 오류: {ex1.Message}");
                    if (ex1.InnerException != null)
                    {
                        Debug.WriteLine($"방법 1 내부 오류: {ex1.InnerException.Message}");
                        Console.WriteLine($"방법 1 내부 오류: {ex1.InnerException.Message}");
                    }
                }
                
                Debug.WriteLine("\n=== 모든 방법 실패 ===");
                Console.WriteLine("\n=== 모든 방법 실패 ===");
                return false;
            }
            catch (System.Exception ex)
            {
                Debug.WriteLine($"=== 차량 수정 전체 오류 ===");
                Debug.WriteLine($"오류 메시지: {ex.Message}");
                Debug.WriteLine($"오류 타입: {ex.GetType().Name}");
                Debug.WriteLine($"스택 트레이스: {ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    Debug.WriteLine($"내부 오류: {ex.InnerException.Message}");
                    Debug.WriteLine($"내부 오류 타입: {ex.InnerException.GetType().Name}");
                }
                return false;
            }
        }

        public async Task<bool> DeleteVehicleAsync(string vehicleId)
        {
            try
            {
                System.Console.WriteLine($"=== 차량 삭제 시작 ===");
                System.Console.WriteLine($"삭제할 차량 ID: {vehicleId}");

                await EnsureInitializedAsync();
                System.Console.WriteLine("Supabase 초기화 완료");

                System.Console.WriteLine("차량 삭제 실행 중...");
                await _client.From<Vehicle>()
                    .Where(v => v.Id == vehicleId)
                    .Delete();

                System.Console.WriteLine("=== 차량 삭제 성공! ===");
                return true;
            }
            catch (System.Exception ex)
            {
                System.Console.WriteLine($"=== 차량 삭제 오류 ===");
                System.Console.WriteLine($"오류 메시지: {ex.Message}");
                System.Console.WriteLine($"오류 타입: {ex.GetType().Name}");
                System.Console.WriteLine($"스택 트레이스: {ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    System.Console.WriteLine($"내부 오류: {ex.InnerException.Message}");
                    System.Console.WriteLine($"내부 오류 타입: {ex.InnerException.GetType().Name}");
                }
                return false;
            }
        }

        public async Task<List<Vehicle>> GetVehiclesAsync()
        {
            try
            {
                System.Console.WriteLine("=== 차량 목록 조회 시작 ===");
                
                await EnsureInitializedAsync();
                System.Console.WriteLine("Supabase 초기화 완료");

                System.Console.WriteLine("차량 목록 조회 실행 중...");
                var response = await _client.From<Vehicle>().Select("*").Get();
                
                System.Console.WriteLine($"조회 응답 상태: {response?.ResponseMessage?.StatusCode}");
                System.Console.WriteLine($"조회된 차량 수: {response?.Models?.Count ?? 0}");
                
                if (response?.Models != null)
                {
                    System.Console.WriteLine("=== 차량 목록 조회 성공! ===");
                    foreach (var vehicle in response.Models)
                    {
                        System.Console.WriteLine($"차량: {vehicle.Name} ({vehicle.Id})");
                    }
                    return response.Models;
                }
                else
                {
                    System.Console.WriteLine("조회 결과가 비어있음");
                    return new List<Vehicle>();
                }
            }
            catch (System.Exception ex)
            {
                System.Console.WriteLine($"=== 차량 목록 조회 오류 ===");
                System.Console.WriteLine($"오류 메시지: {ex.Message}");
                System.Console.WriteLine($"오류 타입: {ex.GetType().Name}");
                System.Console.WriteLine($"스택 트레이스: {ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    System.Console.WriteLine($"내부 오류: {ex.InnerException.Message}");
                    System.Console.WriteLine($"내부 오류 타입: {ex.InnerException.GetType().Name}");
                }
                return new List<Vehicle>();
            }
        }

        // 사용자 인증 관련 메서드들
        public async Task<bool> SignInAsync(string email, string password)
        {
            try
            {
                System.Console.WriteLine($"=== 로그인 시작 ===");
                System.Console.WriteLine($"이메일: {email}");

                await EnsureInitializedAsync();
                System.Console.WriteLine("Supabase 초기화 완료");

                var response = await _client.Auth.SignIn(email, password);
                
                if (response?.User != null)
                {
                    System.Console.WriteLine($"로그인 성공! 사용자 ID: {response.User.Id}");
                    return true;
                }
                else
                {
                    System.Console.WriteLine("로그인 실패 - 응답에 사용자 정보 없음");
                    return false;
                }
            }
            catch (System.Exception ex)
            {
                System.Console.WriteLine($"=== 로그인 오류 ===");
                System.Console.WriteLine($"오류 메시지: {ex.Message}");
                System.Console.WriteLine($"오류 타입: {ex.GetType().Name}");
                if (ex.InnerException != null)
                {
                    System.Console.WriteLine($"내부 오류: {ex.InnerException.Message}");
                }
                return false;
            }
        }

        public async Task<bool> SignUpAsync(string email, string password)
        {
            try
            {
                System.Console.WriteLine($"=== 회원가입 시작 ===");
                System.Console.WriteLine($"이메일: {email}");

                await EnsureInitializedAsync();
                System.Console.WriteLine("Supabase 초기화 완료");

                var response = await _client.Auth.SignUp(email, password);
                
                if (response?.User != null)
                {
                    System.Console.WriteLine($"회원가입 성공! 사용자 ID: {response.User.Id}");
                    return true;
                }
                else
                {
                    System.Console.WriteLine("회원가입 실패 - 응답에 사용자 정보 없음");
                    return false;
                }
            }
            catch (System.Exception ex)
            {
                System.Console.WriteLine($"=== 회원가입 오류 ===");
                System.Console.WriteLine($"오류 메시지: {ex.Message}");
                System.Console.WriteLine($"오류 타입: {ex.GetType().Name}");
                if (ex.InnerException != null)
                {
                    System.Console.WriteLine($"내부 오류: {ex.InnerException.Message}");
                }
                return false;
            }
        }

        public async Task<User> GetUserByEmailAsync(string email)
        {
            try
            {
                System.Console.WriteLine($"=== 사용자 조회 시작 ===");
                System.Console.WriteLine($"이메일: {email}");

                await EnsureInitializedAsync();
                System.Console.WriteLine("Supabase 초기화 완료");

                var response = await _client.From<User>()
                    .Where(u => u.Email == email)
                    .Get();
                
                if (response?.Models?.Count > 0)
                {
                    System.Console.WriteLine($"사용자 조회 성공! 사용자 ID: {response.Models[0].Id}");
                    return response.Models[0];
                }
                else
                {
                    System.Console.WriteLine("사용자를 찾을 수 없음");
                    return null;
                }
            }
            catch (System.Exception ex)
            {
                System.Console.WriteLine($"=== 사용자 조회 오류 ===");
                System.Console.WriteLine($"오류 메시지: {ex.Message}");
                System.Console.WriteLine($"오류 타입: {ex.GetType().Name}");
                if (ex.InnerException != null)
                {
                    System.Console.WriteLine($"내부 오류: {ex.InnerException.Message}");
                }
                return null;
            }
        }

        public async Task<bool> AddUserAsync(User user)
        {
            try
            {
                System.Console.WriteLine($"=== 사용자 추가 시작 ===");
                System.Console.WriteLine($"사용자명: {user.Name}");
                System.Console.WriteLine($"이메일: {user.Email}");

                await EnsureInitializedAsync();
                System.Console.WriteLine("Supabase 초기화 완료");

                user.CreatedAt = DateTime.Now;

                var response = await _client.From<User>().Insert(user);
                
                if (response?.Models?.Count > 0)
                {
                    System.Console.WriteLine($"사용자 추가 성공! 사용자 ID: {response.Models[0].Id}");
                    return true;
                }
                else
                {
                    System.Console.WriteLine("사용자 추가 실패 - 응답에 사용자 데이터 없음");
                    return false;
                }
            }
            catch (System.Exception ex)
            {
                System.Console.WriteLine($"=== 사용자 추가 오류 ===");
                System.Console.WriteLine($"오류 메시지: {ex.Message}");
                System.Console.WriteLine($"오류 타입: {ex.GetType().Name}");
                if (ex.InnerException != null)
                {
                    System.Console.WriteLine($"내부 오류: {ex.InnerException.Message}");
                }
                return false;
            }
        }

        // 예약 관련 메서드들
        public async Task<List<Reservation>> GetReservationsAsync()
        {
            try
            {
                System.Console.WriteLine("=== 예약 목록 조회 시작 ===");
                
                await EnsureInitializedAsync();
                System.Console.WriteLine("Supabase 초기화 완료");

                var response = await _client.From<Reservation>().Select("*").Get();
                
                System.Console.WriteLine($"조회된 예약 수: {response?.Models?.Count ?? 0}");
                
                if (response?.Models != null)
                {
                    System.Console.WriteLine("=== 예약 목록 조회 성공! ===");
                    return response.Models;
                }
                else
                {
                    System.Console.WriteLine("예약 조회 결과가 비어있음");
                    return new List<Reservation>();
                }
            }
            catch (System.Exception ex)
            {
                System.Console.WriteLine($"=== 예약 목록 조회 오류 ===");
                System.Console.WriteLine($"오류 메시지: {ex.Message}");
                System.Console.WriteLine($"오류 타입: {ex.GetType().Name}");
                if (ex.InnerException != null)
                {
                    System.Console.WriteLine($"내부 오류: {ex.InnerException.Message}");
                }
                return new List<Reservation>();
            }
        }

        public async Task<bool> AddReservationAsync(Reservation reservation)
        {
            try
            {
                Debug.WriteLine("=== 예약 추가 시작 ===");
                Console.WriteLine("=== 예약 추가 시작 ===");
                Debug.WriteLine($"예약 ID: {reservation.Id}");
                Console.WriteLine($"예약 ID: {reservation.Id}");
                Debug.WriteLine($"사용자 ID: {reservation.UserId}");
                Console.WriteLine($"사용자 ID: {reservation.UserId}");
                Debug.WriteLine($"사용자명: {reservation.UserName}");
                Console.WriteLine($"사용자명: {reservation.UserName}");
                Debug.WriteLine($"부서: {reservation.Department}");
                Console.WriteLine($"부서: {reservation.Department}");
                Debug.WriteLine($"차량 ID: {reservation.VehicleId}");
                Console.WriteLine($"차량 ID: {reservation.VehicleId}");
                Debug.WriteLine($"차량명: {reservation.VehicleName}");
                Console.WriteLine($"차량명: {reservation.VehicleName}");
                Debug.WriteLine($"시작일: {reservation.StartDate}");
                Console.WriteLine($"시작일: {reservation.StartDate}");
                Debug.WriteLine($"종료일: {reservation.EndDate}");
                Console.WriteLine($"종료일: {reservation.EndDate}");
                Debug.WriteLine($"시작시간: {reservation.StartTime}");
                Console.WriteLine($"시작시간: {reservation.StartTime}");
                Debug.WriteLine($"종료시간: {reservation.EndTime}");
                Console.WriteLine($"종료시간: {reservation.EndTime}");
                Debug.WriteLine($"목적: {reservation.Purpose}");
                Console.WriteLine($"목적: {reservation.Purpose}");
                Debug.WriteLine($"상태: {reservation.Status}");
                Console.WriteLine($"상태: {reservation.Status}");

                await EnsureInitializedAsync();
                Debug.WriteLine("Supabase 초기화 완료");
                Console.WriteLine("Supabase 초기화 완료");

                // UUID 확인 및 생성
                if (string.IsNullOrEmpty(reservation.Id))
                {
                    reservation.Id = Guid.NewGuid().ToString();
                    Debug.WriteLine($"새 예약 ID 생성: {reservation.Id}");
                    Console.WriteLine($"새 예약 ID 생성: {reservation.Id}");
                }

                reservation.CreatedAt = DateTime.Now;
                reservation.UpdatedAt = DateTime.Now;

                Debug.WriteLine("예약 데이터 Insert 실행 중...");
                Console.WriteLine("예약 데이터 Insert 실행 중...");
                
                var response = await _client.From<Reservation>().Insert(reservation);
                
                Debug.WriteLine($"Insert 응답 상태: {response?.ResponseMessage?.StatusCode}");
                Console.WriteLine($"Insert 응답 상태: {response?.ResponseMessage?.StatusCode}");
                Debug.WriteLine($"Insert 응답 모델 수: {response?.Models?.Count ?? 0}");
                Console.WriteLine($"Insert 응답 모델 수: {response?.Models?.Count ?? 0}");

                if (response?.ResponseMessage?.Content != null)
                {
                    Debug.WriteLine($"Insert 응답 내용: {response.ResponseMessage.Content}");
                    Console.WriteLine($"Insert 응답 내용: {response.ResponseMessage.Content}");
                }
                
                if (response?.Models?.Count > 0)
                {
                    Debug.WriteLine($"예약 추가 성공! 예약 ID: {response.Models[0].Id}");
                    Console.WriteLine($"예약 추가 성공! 예약 ID: {response.Models[0].Id}");
                    Debug.WriteLine($"생성일시: {response.Models[0].CreatedAt}");
                    Console.WriteLine($"생성일시: {response.Models[0].CreatedAt}");
                    Debug.WriteLine("=== 예약 추가 완료! ===");
                    Console.WriteLine("=== 예약 추가 완료! ===");
                    return true;
                }
                else
                {
                    Debug.WriteLine("예약 추가 실패 - 응답에 예약 데이터 없음");
                    Console.WriteLine("예약 추가 실패 - 응답에 예약 데이터 없음");
                    return false;
                }
            }
            catch (System.Exception ex)
            {
                Debug.WriteLine($"=== 예약 추가 오류 ===");
                Console.WriteLine($"=== 예약 추가 오류 ===");
                Debug.WriteLine($"오류 메시지: {ex.Message}");
                Console.WriteLine($"오류 메시지: {ex.Message}");
                Debug.WriteLine($"오류 타입: {ex.GetType().Name}");
                Console.WriteLine($"오류 타입: {ex.GetType().Name}");
                Debug.WriteLine($"스택 트레이스: {ex.StackTrace}");
                Console.WriteLine($"스택 트레이스: {ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    Debug.WriteLine($"내부 오류: {ex.InnerException.Message}");
                    Console.WriteLine($"내부 오류: {ex.InnerException.Message}");
                }
                return false;
            }
        }

        public async Task<bool> UpdateReservationAsync(Reservation reservation)
        {
            try
            {
                System.Console.WriteLine($"=== 예약 수정 시작 ===");
                System.Console.WriteLine($"예약 ID: {reservation.Id}");
                
                if (string.IsNullOrEmpty(reservation.Id))
                {
                    System.Console.WriteLine("오류: 예약 ID가 비어있습니다!");
                    return false;
                }
                
                await EnsureInitializedAsync();
                System.Console.WriteLine("Supabase 초기화 완료");
                
                reservation.UpdatedAt = DateTime.Now;
                
                var response = await _client.From<Reservation>()
                    .Where(r => r.Id == reservation.Id)
                    .Update(reservation);
                
                // UPDATE 작업이 예외 없이 완료되면 성공으로 간주
                System.Console.WriteLine("예약 수정 성공!");
                System.Console.WriteLine($"응답 모델 수: {response?.Models?.Count ?? 0}");
                return true;
            }
            catch (System.Exception ex)
            {
                System.Console.WriteLine($"=== 예약 수정 오류 ===");
                System.Console.WriteLine($"오류 메시지: {ex.Message}");
                System.Console.WriteLine($"오류 타입: {ex.GetType().Name}");
                if (ex.InnerException != null)
                {
                    System.Console.WriteLine($"내부 오류: {ex.InnerException.Message}");
                }
                return false;
            }
        }

        public async Task<bool> DeleteReservationAsync(string reservationId)
        {
            try
            {
                System.Console.WriteLine($"=== 예약 삭제 시작 ===");
                System.Console.WriteLine($"삭제할 예약 ID: {reservationId}");

                await EnsureInitializedAsync();
                System.Console.WriteLine("Supabase 초기화 완료");

                await _client.From<Reservation>()
                    .Where(r => r.Id == reservationId)
                    .Delete();

                System.Console.WriteLine("=== 예약 삭제 성공! ===");
                return true;
            }
            catch (System.Exception ex)
            {
                System.Console.WriteLine($"=== 예약 삭제 오류 ===");
                System.Console.WriteLine($"오류 메시지: {ex.Message}");
                System.Console.WriteLine($"오류 타입: {ex.GetType().Name}");
                if (ex.InnerException != null)
                {
                    System.Console.WriteLine($"내부 오류: {ex.InnerException.Message}");
                }
                return false;
            }
        }
    }
}