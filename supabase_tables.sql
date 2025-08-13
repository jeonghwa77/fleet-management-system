-- Fleet Management System Tables

-- vehicles 테이블 생성 (UUID 사용)
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT DEFAULT 'Available',
  license_plate TEXT NOT NULL,
  capacity INTEGER DEFAULT 4,
  description TEXT DEFAULT '',
  fuel TEXT DEFAULT '',
  color TEXT DEFAULT 'bg-blue-500',
  year INTEGER DEFAULT 2024,
  mileage DECIMAL DEFAULT 0,
  last_maintenance TIMESTAMP WITH TIME ZONE,
  next_maintenance TIMESTAMP WITH TIME ZONE,
  insurance_expiry TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Row Level Security 활성화
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON vehicles FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON vehicles FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON vehicles FOR UPDATE WITH CHECK (true);
CREATE POLICY "Enable delete for all users" ON vehicles FOR DELETE USING (true);

-- users 테이블 생성
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  department TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- users 테이블 RLS 설정
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON users FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON users FOR UPDATE WITH CHECK (true);
CREATE POLICY "Enable delete for all users" ON users FOR DELETE USING (true);

-- reservations 테이블 생성
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
  status TEXT DEFAULT 'reserved',
  description TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- reservations 테이블 RLS 설정
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON reservations FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON reservations FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON reservations FOR UPDATE WITH CHECK (true);
CREATE POLICY "Enable delete for all users" ON reservations FOR DELETE USING (true);

-- 실제 차량 데이터 삽입 (UUID는 자동 생성됨)
INSERT INTO vehicles (name, type, license_plate, capacity, fuel, color, description, year, mileage, status) VALUES 
('스타리아', '승합차', '839루7772', 5, '휘발유', 'bg-blue-500', '승합차량, 단체 이동용', 2023, 15000, 'Available'),
('코나', '승용차', '264어7952', 5, '휘발유', 'bg-green-500', '소형 SUV, 시내 이동용', 2022, 25000, 'Available'),
('투싼', '승용차', '134너8690', 5, '휘발유', 'bg-red-500', '중형 SUV, 일반 업무용', 2023, 18000, 'Available'),
('봉고', '트럭', '567마1234', 3, '경유', 'bg-orange-500', '화물 운송용 트럭', 2023, 20000, 'Available')
ON CONFLICT (license_plate) DO NOTHING;

-- 관리자 계정 추가
INSERT INTO users (email, name, password_hash, role, department) VALUES 
('admin@company.com', '관리자', 'admin123', 'admin', '관리팀')
ON CONFLICT (email) DO NOTHING;
