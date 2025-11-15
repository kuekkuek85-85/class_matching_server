# SRD_SERVER.md (해커톤용 요약 버전)

## 🧱 기술 스택
- Node.js + Express
- PostgreSQL (Supabase/Neon/Replit DB)
- 선택: Upstage AI

---

## 📌 DB 구조

### programs
- id, name, type, quota, description, created_at

### applications
- id, student_id(UNIQUE), name
- phone, birthdate
- choice_1/2/3
- submission_count
- first_submitted_at, last_submitted_at

### allocations
- id, student_id, program_id, choice_rank, allocation_type, allocated_at

---

## 📡 API 목록

### 프로그램 관리
- GET `/api/programs`
- POST `/api/programs`
- DELETE `/api/programs/:id`

### 학생 신청
- POST `/api/applications`
- GET `/api/applications`

### 배치
- POST `/api/allocate`
- GET `/api/allocate/results`
- GET `/api/allocate/export`

---

## 🔑 핵심 로직

### 중복 제출 처리
1. 최초 제출 → phone/birthdate 없어도 OK  
2. 기존 기록 존재 → phone + birthdate 없으면 400 에러  
3. 재제출 시 submission_count++, last_submitted_at 업데이트

### 기본 배치 알고리즘
- 학생 무작위 섞기
- 1지망 → 2지망 → 3지망 순으로 정원 채워 넣기
- allocations 테이블 초기화 후 다시 저장

---

## 🟥 P0 (필수)
- CRUD, 신청 API, 배치, CSV

## 🟨 P1 (선택)
- AI 배치
- 제출 히스토리 로그
