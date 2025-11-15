# 클라이언트 API 연동 가이드

## 기본 정보
- **Base URL**: `https://class-matching-server.replit.app`
- **Content-Type**: `application/json`
- **CORS**: 모든 origin 허용

---

## 1. 프로그램 관리 API

### 1.1 프로그램 목록 조회
```bash
GET /api/programs
```

**curl 예제:**
```bash
curl https://class-matching-server.replit.app/api/programs
```

**응답 예제:**
```json
[
  {
    "id": 1,
    "name": "소프트웨어 개발 체험",
    "type": "진로체험활동",
    "quota": 15,
    "description": "웹 개발과 앱 개발을 체험",
    "createdAt": "2025-01-15T01:30:00.000Z"
  }
]
```

---

### 1.2 프로그램 등록
```bash
POST /api/programs
```

**curl 예제:**
```bash
curl -X POST https://class-matching-server.replit.app/api/programs \
  -H "Content-Type: application/json" \
  -d '{
    "name": "소프트웨어 개발 체험",
    "type": "진로체험활동",
    "quota": 15,
    "description": "웹 개발과 앱 개발을 체험해볼 수 있는 프로그램입니다."
  }'
```

**요청 Body:**
```typescript
{
  name: string;        // 프로그램 이름
  type: string;        // "진로체험활동" | "동아리활동"
  quota: number;       // 정원
  description: string; // 설명
}
```

**응답 (201):**
```json
{
  "id": 1,
  "name": "소프트웨어 개발 체험",
  "type": "진로체험활동",
  "quota": 15,
  "description": "웹 개발과 앱 개발을 체험해볼 수 있는 프로그램입니다.",
  "createdAt": "2025-01-15T01:30:00.000Z"
}
```

---

### 1.3 프로그램 삭제
```bash
DELETE /api/programs/:id
```

**curl 예제:**
```bash
curl -X DELETE https://class-matching-server.replit.app/api/programs/1
```

**응답 (200):**
```json
{
  "message": "프로그램이 삭제되었습니다."
}
```

---

## 2. 학생 신청 API

### 2.1 신청 제출/재제출
```bash
POST /api/applications
```

**curl 예제 (최초 신청):**
```bash
curl -X POST https://class-matching-server.replit.app/api/applications \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "20240101",
    "name": "김철수",
    "choice1": 1,
    "choice2": 2,
    "choice3": 3
  }'
```

**curl 예제 (재제출 - phone/birthdate 필수):**
```bash
curl -X POST https://class-matching-server.replit.app/api/applications \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "20240101",
    "name": "김철수",
    "phone": "010-1234-5678",
    "birthdate": "2008-03-15",
    "choice1": 2,
    "choice2": 1,
    "choice3": 3
  }'
```

**요청 Body:**
```typescript
{
  studentId: string;     // 학번 (필수)
  name: string;          // 이름 (필수)
  phone?: string;        // 전화번호 (재제출 시 필수)
  birthdate?: string;    // 생년월일 (재제출 시 필수, YYYY-MM-DD)
  choice1: number;       // 1지망 프로그램 ID (필수)
  choice2: number;       // 2지망 프로그램 ID (필수)
  choice3: number;       // 3지망 프로그램 ID (필수)
}
```

**응답 (201 - 최초 제출):**
```json
{
  "message": "신청이 제출되었습니다.",
  "application": {
    "id": 1,
    "studentId": "20240101",
    "name": "김철수",
    "phone": null,
    "birthdate": null,
    "choice1": 1,
    "choice2": 2,
    "choice3": 3,
    "submissionCount": 1,
    "firstSubmittedAt": "2025-01-15T01:35:00.000Z",
    "lastSubmittedAt": "2025-01-15T01:35:00.000Z"
  }
}
```

**응답 (200 - 재제출):**
```json
{
  "message": "신청이 재제출되었습니다.",
  "application": {
    "id": 1,
    "studentId": "20240101",
    "name": "김철수",
    "phone": "010-1234-5678",
    "birthdate": "2008-03-15",
    "choice1": 2,
    "choice2": 1,
    "choice3": 3,
    "submissionCount": 2,
    "firstSubmittedAt": "2025-01-15T01:35:00.000Z",
    "lastSubmittedAt": "2025-01-15T01:36:00.000Z"
  }
}
```

**에러 응답 (400 - phone/birthdate 없이 재제출):**
```json
{
  "message": "이미 신청한 학번입니다. 재제출 시 전화번호와 생년월일을 입력해주세요.",
  "requiresAdditionalInfo": true
}
```

**에러 응답 (403 - 본인 확인 실패):**
```json
{
  "message": "전화번호가 일치하지 않습니다. 본인 확인이 필요합니다."
}
```

---

### 2.2 신청 현황 조회
```bash
GET /api/applications
```

**curl 예제:**
```bash
curl https://class-matching-server.replit.app/api/applications
```

**응답 (200):**
```json
{
  "applications": [
    {
      "id": 1,
      "studentId": "20240101",
      "name": "김철수",
      "phone": "010-1234-5678",
      "birthdate": "2008-03-15",
      "choice1": 2,
      "choice2": 1,
      "choice3": 3,
      "submissionCount": 2,
      "firstSubmittedAt": "2025-01-15T01:35:00.000Z",
      "lastSubmittedAt": "2025-01-15T01:36:00.000Z"
    }
  ],
  "programStats": [
    {
      "programId": 1,
      "programName": "소프트웨어 개발 체험",
      "quota": 15,
      "choice1Count": 0,
      "choice2Count": 1,
      "choice3Count": 0,
      "totalCount": 1
    }
  ],
  "totalApplications": 1
}
```

---

## 3. 배치 API

### 3.1 배치 실행
```bash
POST /api/allocate
```

**배치 알고리즘:**
1. 학생을 무작위로 섞기
2. 1지망부터 순서대로 정원이 있는 학생 배치
3. 2지망, 3지망 순서로 미배치 학생 배치
4. **3지망까지 실패한 학생은 남은 정원이 있는 프로그램에 랜덤 배치** (choiceRank: 0)
5. 모든 학생 100% 배치 보장 (총 정원이 학생 수보다 많을 경우)

**curl 예제:**
```bash
curl -X POST https://class-matching-server.replit.app/api/allocate \
  -H "Content-Type: application/json"
```

**응답 (200):**
```json
{
  "message": "배치가 완료되었습니다.",
  "totalStudents": 15,
  "allocatedCount": 15,
  "unallocatedCount": 0,
  "allocations": [
    {
      "id": 1,
      "studentId": "20240101",
      "programId": 2,
      "choiceRank": 1,
      "allocationType": "자동배치",
      "allocatedAt": "2025-01-15T01:40:00.000Z"
    },
    {
      "id": 2,
      "studentId": "20240102",
      "programId": 5,
      "choiceRank": 0,
      "allocationType": "자동배치",
      "allocatedAt": "2025-01-15T01:40:01.000Z"
    }
  ]
}
```

**참고:**
- `choiceRank`: 1(1지망), 2(2지망), 3(3지망), 0(지망 외 랜덤 배치)
- `unallocatedCount`: 총 정원이 부족한 경우에만 0보다 큼

---

### 3.2 배치 결과 수정
```bash
PATCH /api/allocate/:id
```

**curl 예제:**
```bash
curl -X PATCH https://class-matching-server.replit.app/api/allocate/1 \
  -H "Content-Type: application/json" \
  -d '{
    "programId": 3
  }'
```

**요청 Body:**
```typescript
{
  programId: number;  // 새로운 프로그램 ID
}
```

**응답 (200):**
```json
{
  "message": "배치가 수정되었습니다.",
  "allocation": {
    "id": 1,
    "studentId": "20240101",
    "programId": 3,
    "choiceRank": 2,
    "allocationType": "수동배치",
    "allocatedAt": "2025-01-15T01:40:00.000Z"
  },
  "changes": {
    "from": {
      "programId": 2,
      "programName": "AI 프로그래밍 체험"
    },
    "to": {
      "programId": 3,
      "programName": "로봇 공학 동아리"
    }
  }
}
```

**에러 응답 (404 - 배치 없음):**
```json
{
  "message": "배치를 찾을 수 없습니다."
}
```

**참고:**
- 정원 체크가 제거되어 정원 초과 시에도 배치 변경 가능

---

### 3.3 배치 결과 조회
```bash
GET /api/allocate/results
```

**curl 예제:**
```bash
curl https://class-matching-server.replit.app/api/allocate/results
```

**응답 (200):**
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
    },
    {
      "id": 2,
      "studentId": "20240102",
      "programId": 5,
      "choiceRank": 2,
      "allocationType": "자동배치",
      "allocatedAt": "2025-01-15T01:40:01.000Z",
      "studentName": "이영희",
      "programName": "웹 디자인 체험",
      "choiceRankText": "2지망",
      "message": "2지망에 배치되었습니다. 1지망 프로그램의 경쟁률이 높아 양해 부탁드립니다. (전체 학생 중 13.3%가 2지망에 배치됨)",
      "successRate": "13.3%"
    },
    {
      "id": 3,
      "studentId": "20240103",
      "programId": 8,
      "choiceRank": 0,
      "allocationType": "자동배치",
      "allocatedAt": "2025-01-15T01:40:02.000Z",
      "studentName": "박민수",
      "programName": "로봇 공학 동아리",
      "choiceRankText": "지망 외",
      "message": "지망하신 프로그램(1-3지망)의 정원이 모두 마감되어 다른 프로그램에 배치되었습니다. 양해 부탁드립니다. (전체 학생 중 5.0%가 지망 외 프로그램에 배치됨)",
      "successRate": "5.0%"
    }
  ],
  "programStats": [
    {
      "programId": 1,
      "programName": "소프트웨어 개발 체험",
      "quota": 15,
      "allocatedCount": 5,
      "remainingQuota": 10,
      "choice1Count": 3,
      "choice2Count": 2,
      "choice3Count": 0
    }
  ],
  "totalAllocated": 15,
  "totalUnallocated": 0
}
```

**응답 필드 설명:**
- `choiceRankText`: "1지망", "2지망", "3지망", "지망 외"
- `message`: 교사가 학생에게 전달할 메시지 (배치 결과 안내)
- `successRate`: 해당 지망 배치 성공률 (전체 학생 대비 비율)

---

### 3.4 CSV 다운로드
```bash
GET /api/allocate/export
```

**curl 예제:**
```bash
curl https://class-matching-server.replit.app/api/allocate/export -o allocation_results.csv
```

**브라우저에서:**
```
https://class-matching-server.replit.app/api/allocate/export
```

**CSV 형식:**
```csv
학번,이름,배치된 프로그램,지망 순위
"20240101","김철수","AI 프로그래밍 체험","1"
"20240102","이영희","소프트웨어 개발 체험","2"
```

---

## TypeScript 타입 정의

```typescript
// Program
interface Program {
  id: number;
  name: string;
  type: string;
  quota: number;
  description: string;
  createdAt: string;
}

// Application
interface Application {
  id: number;
  studentId: string;
  name: string;
  phone: string | null;
  birthdate: string | null;
  choice1: number;
  choice2: number;
  choice3: number;
  submissionCount: number;
  firstSubmittedAt: string;
  lastSubmittedAt: string;
}

// Allocation
interface Allocation {
  id: number;
  studentId: string;
  programId: number;
  choiceRank: number;        // 0: 지망 외, 1: 1지망, 2: 2지망, 3: 3지망
  allocationType: string;    // "자동배치" | "수동배치"
  allocatedAt: string;
}

// Enriched Allocation (배치 결과 조회 시)
interface EnrichedAllocation extends Allocation {
  studentName: string;
  programName: string;
  choiceRankText: string;    // "1지망" | "2지망" | "3지망" | "지망 외"
  message: string;           // 학생에게 전달할 메시지
  successRate: string;       // 해당 지망 배치 성공률 (예: "66.7%")
}
```

---

## 클라이언트 연동 예제 (Fetch API)

```javascript
const BASE_URL = 'https://class-matching-server.replit.app';

// 프로그램 목록 조회
async function getPrograms() {
  const response = await fetch(`${BASE_URL}/api/programs`);
  return await response.json();
}

// 프로그램 등록
async function createProgram(data) {
  const response = await fetch(`${BASE_URL}/api/programs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return await response.json();
}

// 신청 제출
async function submitApplication(data) {
  const response = await fetch(`${BASE_URL}/api/applications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return await response.json();
}

// 배치 실행
async function runAllocation() {
  const response = await fetch(`${BASE_URL}/api/allocate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  return await response.json();
}

// 배치 결과 조회
async function getAllocationResults() {
  const response = await fetch(`${BASE_URL}/api/allocate/results`);
  return await response.json();
}

// 배치 결과 수정
async function updateAllocation(allocationId, newProgramId) {
  const response = await fetch(`${BASE_URL}/api/allocate/${allocationId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ programId: newProgramId })
  });
  return await response.json();
}
```

---

## 에러 처리

모든 API는 에러 발생 시 다음 형식으로 응답합니다:

```json
{
  "message": "에러 메시지"
}
```

**HTTP 상태 코드:**
- `200`: 성공
- `201`: 생성 성공
- `400`: 잘못된 요청
- `403`: 본인 확인 실패
- `404`: 리소스를 찾을 수 없음
- `500`: 서버 에러
