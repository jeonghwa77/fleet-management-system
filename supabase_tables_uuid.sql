-- Fleet Management System Tables with UUID

-- vehicles 테이블 생성
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT DEFAULT 'Available',
  license_plate TEXT NOT NULL UNIQUE,
  capacity INTEGER DEFAULT 4,
  description TEXT DEFAULT '',
  fuel TEXT DEFAULT '',
  color TEXT DEFAULT '',
  year INTEGER DEFAULT 2020,
  mileage DECIMAL DEFAULT 0,
  last_maintenance TIMESTAMP WITH TIME ZONE,
  next_maintenance TIMESTAMP WITH TIME ZONE,
  insurance_expiry TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'user', -- admin, user, demo
    department TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Reservations Table  
CREATE TABLE IF NOT EXISTS reservations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id),
    vehicle_name TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id),
    user_name TEXT NOT NULL,
    department TEXT DEFAULT '',
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    purpose TEXT NOT NULL,
    status TEXT DEFAULT 'reserved', -- reserved, in_use, completed, cancelled
    description TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    -- 같은 차량에 대해 같은 날짜/시간 겹침 방지
    UNIQUE(vehicle_id, start_date, start_time)
);

-- Row Level Security 정책 삭제 (기존 정책이 있다면)
DROP POLICY IF EXISTS "Enable read access for all users" ON vehicles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON vehicles;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON vehicles;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON vehicles;

DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON users;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON users;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON users;

DROP POLICY IF EXISTS "Enable read access for all users" ON reservations;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON reservations;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON reservations;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON reservations;

-- Row Level Security 비활성화 (개발용)
ALTER TABLE vehicles DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE reservations DISABLE ROW LEVEL SECURITY;

-- 샘플 관리자 사용자 추가
INSERT INTO users (email, name, password_hash, role, department) 
VALUES (
    'admin@company.com', 
    '관리자', 
    'admin123', 
    'admin', 
    '관리팀'
) ON CONFLICT (email) DO NOTHING;

-- 실제 차량 데이터 삽입
INSERT INTO vehicles (name, type, license_plate, capacity, fuel, color, description, year, mileage, status) VALUES 
('스타리아', '승합차', '839루7772', 5, '휘발유', 'bg-blue-500', '승합차량, 단체 이동용', 2023, 15000, 'Available'),
('코나', '승용차', '264어7952', 5, '휘발유', 'bg-green-500', '소형 SUV, 시내 이동용', 2022, 25000, 'Available'),
('투싼', '승용차', '134너8690', 5, '휘발유', 'bg-red-500', '중형 SUV, 일반 업무용', 2023, 18000, 'Available')
ON CONFLICT (license_plate) DO NOTHING;

-- 샘플 예약 데이터는 현재 추가하지 않음 (런타임에 추가)
