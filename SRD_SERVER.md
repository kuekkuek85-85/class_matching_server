# SRD - 서버 기술 명세서

## 🧱 기술 스택

### Backend
- **런타임**: Node.js 20+
- **프레임워크**: Express
- **언어**: TypeScript
- **ORM**: Drizzle ORM

### Database
- **데이터베이스**: PostgreSQL (Replit 제공)
- **마이그레이션**: Drizzle Kit

### 배포
- **플랫폼**: Replit
- **Production URL**: https://class-matching-server.replit.app
- **환경변수**: DATABASE_URL, SESSION_SECRET

---

## 📌 데이터베이스 스키마

### programs
```sql
CREATE TABLE programs (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  type VARCHAR NOT NULL,
  quota INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### applications
```sql
CREATE TABLE applications (
  id SERIAL PRIMARY KEY,
  student_id VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  phone VARCHAR,
  birthdate VARCHAR,
  choice_1 INTEGER NOT NULL REFERENCES programs(id),
  choice_2 INTEGER NOT NULL REFERENCES programs(id),
  choice_3 INTEGER NOT NULL REFERENCES programs(id),
  submission_count INTEGER DEFAULT 1,
  first_submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### allocations
```sql
CREATE TABLE allocations (
  id SERIAL PRIMARY KEY,
  student_id VARCHAR NOT NULL REFERENCES applications(student_id),
  program_id INTEGER NOT NULL REFERENCES programs(id),
  choice_rank INTEGER NOT NULL,  -- 0: 지망 외, 1: 1지망, 2: 2지망, 3: 3지망
  allocation_type VARCHAR NOT NULL,  -- "자동배치" | "수동배치"
  allocated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 📡 API 엔드포인트

### 프로그램 관리

#### GET `/api/programs`
프로그램 목록 조회

**응답:**
```json
[
  {
    "id": 1,
    "name": "소프트웨어 개발 체험",
    "type": "진로체험",
    "quota": 15,
    "description": "웹 개발 기초",
    "createdAt": "2025-01-15T00:00:00.000Z"
  }
]
```

#### POST `/api/programs`
프로그램 등록

**요청:**
```json
{
  "name": "AI 프로그래밍 체험",
  "type": "진로체험",
  "quota": 20,
  "description": "인공지능 기초"
}
```

#### DELETE `/api/programs/:id`
프로그램 삭제

---

### 학생 신청

#### POST `/api/applications`
신청 제출/재제출

**요청 (최초 제출):**
```json
{
  "studentId": "20240101",
  "name": "김철수",
  "choice1": 1,
  "choice2": 2,
  "choice3": 3
}
```

**요청 (재제출):**
```json
{
  "studentId": "20240101",
  "name": "김철수",
  "phone": "010-1234-5678",
  "birthdate": "2007-03-15",
  "choice1": 2,
  "choice2": 3,
  "choice3": 1
}
```

**응답:**
```json
{
  "message": "신청이 완료되었습니다.",
  "application": {
    "id": 1,
    "studentId": "20240101",
    "name": "김철수",
    "submissionCount": 1
  }
}
```

#### GET `/api/applications`
신청 현황 조회

**응답:**
```json
{
  "applications": [...],
  "programStats": [...],
  "totalApplications": 80
}
```

---

### 배치

#### POST `/api/allocate`
배치 실행

**알고리즘:**
1. 학생 무작위 섞기
2. 1지망부터 순서대로 정원이 있는 학생 배치
3. 2지망, 3지망 순서로 미배치 학생 배치
4. 3지망까지 실패 시 남은 정원 프로그램에 랜덤 배치 (choiceRank: 0)
5. 모든 학생 100% 배치 보장 (총 정원 충분 시)

**응답:**
```json
{
  "message": "배치가 완료되었습니다.",
  "totalStudents": 80,
  "allocatedCount": 80,
  "unallocatedCount": 0,
  "allocations": [...]
}
```

#### GET `/api/allocate/results`
배치 결과 조회

**응답:**
```json
{
  "allocations": [
    {
      "id": 1,
      "studentId": "20240101",
      "programId": 2,
      "choiceRank": 1,
      "allocationType": "자동배치",
      "allocatedAt": "2025-01-15T01:40:00.000Z",
      "studentName": "김철수",
      "programName": "AI 프로그래밍 체험",
      "choiceRankText": "1지망",
      "message": "축하합니다! 1지망에 배치되었습니다.",
      "successRate": "66.7%"
    }
  ],
  "programStats": [...],
  "totalAllocated": 80,
  "totalUnallocated": 0
}
```

#### PATCH `/api/allocate/:id`
개별 배치 수정 (정원 무시)

**요청:**
```json
{
  "programId": 5
}
```

**응답:**
```json
{
  "message": "배치가 수정되었습니다.",
  "allocation": {...},
  "changes": {
    "from": {"programId": 2, "programName": "..."},
    "to": {"programId": 5, "programName": "..."}
  }
}
```

#### GET `/api/allocate/export`
CSV 다운로드

**응답:** CSV 파일 (UTF-8 BOM 포함)
```csv
학번,이름,배치된 프로그램,지망 순위
"20240101","김철수","AI 프로그래밍 체험","1"
```

---

## 🔑 핵심 로직

### 1. 중복 제출 검증
```typescript
// 최초 제출
if (!existingApplication) {
  // phone, birthdate 없어도 OK
  await storage.createApplication({ studentId, name, choice1, choice2, choice3 });
}

// 재제출
if (existingApplication) {
  // phone, birthdate 필수
  if (!phone || !birthdate) {
    return res.status(400).json({ message: "재제출 시 필수 입력" });
  }
  await storage.updateApplication({
    studentId,
    phone,
    birthdate,
    choice1,
    choice2,
    choice3,
    submissionCount: existingApplication.submissionCount + 1
  });
}
```

### 2. 개선된 배치 알고리즘
```typescript
// 1. 학생 무작위 섞기
const shuffled = applications.sort(() => Math.random() - 0.5);

// 2. 1지망 배치
for (const app of shuffled) {
  if (programCapacity[app.choice1] > 0) {
    allocate(app.studentId, app.choice1, 1);
    programCapacity[app.choice1]--;
  }
}

// 3. 2지망 배치 (1지망 실패자만)
// 4. 3지망 배치 (2지망 실패자만)

// 5. 지망 외 랜덤 배치 (3지망 실패자)
const remainingPrograms = programs.filter(p => programCapacity[p.id] > 0);
for (const app of unallocatedStudents) {
  const randomProgram = remainingPrograms[Math.floor(Math.random() * remainingPrograms.length)];
  allocate(app.studentId, randomProgram.id, 0);  // choiceRank: 0
  programCapacity[randomProgram.id]--;
}
```

### 3. 학생별 메시지 생성
```typescript
function generateMessage(choiceRank: number, successRate: string): string {
  switch (choiceRank) {
    case 1:
      return "축하합니다! 1지망에 배치되었습니다.";
    case 2:
      return `2지망에 배치되었습니다. 1지망 프로그램의 경쟁률이 높아 양해 부탁드립니다. (전체 학생 중 ${successRate}가 2지망에 배치됨)`;
    case 3:
      return `3지망에 배치되었습니다. 1-2지망 프로그램의 경쟁률이 높아 양해 부탁드립니다. (전체 학생 중 ${successRate}가 3지망에 배치됨)`;
    case 0:
      return `지망하신 프로그램(1-3지망)의 정원이 모두 마감되어 다른 프로그램에 배치되었습니다. 양해 부탁드립니다. (전체 학생 중 ${successRate}가 지망 외 프로그램에 배치됨)`;
  }
}
```

---

## 🔒 CORS 설정
```typescript
// 모든 origin 허용 (클라이언트 분리 구조)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});
```

---

## 📁 프로젝트 구조
```
├── server/
│   ├── index.ts          # Express 서버 진입점
│   ├── routes.ts         # API 라우트
│   ├── storage.ts        # PostgreSQL 저장소
│   └── db.ts             # Drizzle 데이터베이스 설정
├── shared/
│   └── schema.ts         # Drizzle 스키마 정의
├── test/
│   ├── CLIENT_API_REFERENCE.md  # API 문서
│   ├── add_demo_programs.js     # 샘플 데이터 생성
│   └── generate_student_data.js # 테스트 데이터 생성
├── PRD.md                # 제품 요구사항 명세서
├── SRD_SERVER.md         # 서버 기술 명세서
└── replit.md             # 프로젝트 문서
```

---

## 🧪 테스트 데이터
```bash
# 18개 프로그램 등록 (총 정원 220명)
node test/add_demo_programs.js

# 80명 학생 신청 데이터 생성
node test/generate_student_data.js
```

---

## 🚀 배포 및 실행

### 로컬 개발
```bash
npm install
npm run dev
```

### Replit 배포
- 자동 배포: git push 시 자동 반영
- Production URL: https://class-matching-server.replit.app
- 환경변수: Replit Secrets에서 관리

---

## 📊 성능 목표
- API 응답 시간: < 500ms
- 배치 처리 시간: 100명 기준 < 2초
- 동시 접속: 최대 50명 (해커톤 규모)

---

## 🔍 참고 문서
- API 가이드: `test/CLIENT_API_REFERENCE.md`
- 프로젝트 개요: `replit.md`
- 제품 요구사항: `PRD.md`
