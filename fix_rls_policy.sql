-- RLS 정책 확인 및 수정
-- 1. 현재 RLS 정책 확인
SELECT * FROM pg_policies WHERE tablename = 'vehicles';

-- 2. 기존 RLS 정책 삭제 (있다면)
DROP POLICY IF EXISTS "Enable all operations for all users" ON vehicles;
DROP POLICY IF EXISTS "Enable read access for all users" ON vehicles;
DROP POLICY IF EXISTS "Enable insert access for all users" ON vehicles;
DROP POLICY IF EXISTS "Enable update access for all users" ON vehicles;
DROP POLICY IF EXISTS "Enable delete access for all users" ON vehicles;

-- 3. 새로운 포괄적인 RLS 정책 생성
CREATE POLICY "Enable all operations for authenticated users" ON vehicles
FOR ALL USING (true) WITH CHECK (true);

-- 4. 또는 RLS를 완전히 비활성화 (개발 중에만)
ALTER TABLE vehicles DISABLE ROW LEVEL SECURITY;

-- 5. 현재 vehicles 테이블 구조 확인
\d vehicles;

-- 6. 샘플 데이터 확인
SELECT id, name, type, license_plate, updated_at FROM vehicles LIMIT 5;
