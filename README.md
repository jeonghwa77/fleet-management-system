# Fleet Management System

.NET 9 MAUI Blazor 기반의 차량 예약 관리 시스템입니다.

## 기능

- 차량 목록 관리
- 예약 생성 및 관리
- 사용자 인증 (Supabase)
- 실시간 데이터 동기화
- 모바일 지원 (Android, iOS)

## 기술 스택

- .NET 9 MAUI
- Blazor Server/WebAssembly
- Supabase (데이터베이스 & 인증)
- Tailwind CSS

## 프로젝트 구조

- `FleetManagementSystem4/` - MAUI 메인 프로젝트
- `FleetManagementSystem4.Web/` - Blazor Server 웹 프로젝트
- `FleetManagementSystem4.Shared/` - 공유 컴포넌트 및 서비스

## 실행 방법

### 웹 버전
```bash
dotnet run --project FleetManagementSystem4/FleetManagementSystem4.Web/
```

### 모바일 (Android)
```bash
dotnet build FleetManagementSystem4/FleetManagementSystem4/FleetManagementSystem4.csproj -f net9.0-android
```

## 환경 변수

Supabase 설정을 위해 다음 환경 변수가 필요합니다:
- SUPABASE_URL
- SUPABASE_ANON_KEY
