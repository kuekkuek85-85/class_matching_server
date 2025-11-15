# API 테스트 계획서

## 📋 목차
1. [테스트 환경 설정](#테스트-환경-설정)
2. [프로그램 관리 API 테스트](#1-프로그램-관리-api-테스트)
3. [학생 신청 API 테스트](#2-학생-신청-api-테스트)
4. [배치 API 테스트](#3-배치-api-테스트)
5. [테스트 시나리오](#테스트-시나리오)

---

## 테스트 환경 설정

### 서버 URL
```
http://localhost:5000
```

### 테스트 도구
- **curl**: 터미널에서 직접 테스트
- **Postman/Thunder Client**: GUI 도구
- **REST Client (VS Code 확장)**: 이 문서의 예제 직접 실행 가능

---

## 1. 프로그램 관리 API 테스트

### 1.1 프로그램 등록 (POST /api/programs)

**요청:**
```bash
curl -X POST http://localhost:5000/api/programs \
  -H "Content-Type: application/json" \
  -d '{
    "name": "소프트웨어 개발 체험",
    "type": "진로체험활동",
    "quota": 15,
    "description": "웹 개발과 앱 개발을 체험해볼 수 있는 프로그램입니다."
  }'
```

**예상 응답 (201):**
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

### 1.2 프로그램 목록 조회 (GET /api/programs)

**요청:**
```bash
curl http://localhost:5000/api/programs
```

**예상 응답 (200):**
```json
[
  {
    "id": 1,
    "name": "소프트웨어 개발 체험",
    "type": "진로체험활동",
    "quota": 15,
    "description": "웹 개발과 앱 개발을 체험해볼 수 있는 프로그램입니다.",
    "createdAt": "2025-01-15T01:30:00.000Z"
  }
]
```

### 1.3 프로그램 삭제 (DELETE /api/programs/:id)

**요청:**
```bash
curl -X DELETE http://localhost:5000/api/programs/1
```

**예상 응답 (200):**
```json
{
  "message": "프로그램이 삭제되었습니다."
}
```

**에러 케이스 (존재하지 않는 ID):**
```bash
curl -X DELETE http://localhost:5000/api/programs/999
```
```json
{
  "message": "프로그램을 찾을 수 없습니다."
}
```

---

## 2. 학생 신청 API 테스트

### 2.1 최초 신청 (POST /api/applications)

**요청 (phone/birthdate 없이):**
```bash
curl -X POST http://localhost:5000/api/applications \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "20240101",
    "name": "김철수",
    "choice1": 1,
    "choice2": 2,
    "choice3": 3
  }'
```

**예상 응답 (201):**
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

### 2.2 재제출 - 전화번호/생년월일 없이 (에러)

**요청:**
```bash
curl -X POST http://localhost:5000/api/applications \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "20240101",
    "name": "김철수",
    "choice1": 2,
    "choice2": 1,
    "choice3": 3
  }'
```

**예상 응답 (400):**
```json
{
  "message": "이미 신청한 학번입니다. 재제출 시 전화번호와 생년월일을 입력해주세요.",
  "requiresAdditionalInfo": true
}
```

### 2.3 재제출 - 정상 케이스

**요청:**
```bash
curl -X POST http://localhost:5000/api/applications \
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

**예상 응답 (200):**
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

### 2.4 재제출 - 잘못된 전화번호 (본인 확인 실패)

**요청:**
```bash
curl -X POST http://localhost:5000/api/applications \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "20240101",
    "name": "김철수",
    "phone": "010-9999-9999",
    "birthdate": "2008-03-15",
    "choice1": 3,
    "choice2": 2,
    "choice3": 1
  }'
```

**예상 응답 (403):**
```json
{
  "message": "전화번호가 일치하지 않습니다. 본인 확인이 필요합니다."
}
```

### 2.5 신청 현황 조회 (GET /api/applications)

**요청:**
```bash
curl http://localhost:5000/api/applications
```

**예상 응답 (200):**
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

## 3. 배치 API 테스트

### 3.1 배치 실행 (POST /api/allocate)

**요청:**
```bash
curl -X POST http://localhost:5000/api/allocate \
  -H "Content-Type: application/json"
```

**예상 응답 (200):**
```json
{
  "message": "배치가 완료되었습니다.",
  "totalStudents": 10,
  "allocatedCount": 10,
  "unallocatedCount": 0,
  "allocations": [
    {
      "id": 1,
      "studentId": "20240101",
      "programId": 2,
      "choiceRank": 1,
      "allocationType": "자동배치",
      "allocatedAt": "2025-01-15T01:40:00.000Z"
    }
  ]
}
```

### 3.2 배치 결과 조회 (GET /api/allocate/results)

**요청:**
```bash
curl http://localhost:5000/api/allocate/results
```

**예상 응답 (200):**
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
      "programName": "AI 프로그래밍 체험"
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
  "totalAllocated": 10,
  "totalUnallocated": 0
}
```

### 3.3 CSV 다운로드 (GET /api/allocate/export)

**요청:**
```bash
curl http://localhost:5000/api/allocate/export -o allocation_results.csv
```

또는 브라우저에서:
```
http://localhost:5000/api/allocate/export
```

**예상 CSV 내용:**
```csv
학번,이름,배치된 프로그램,지망 순위
"20240101","김철수","AI 프로그래밍 체험","1"
"20240102","이영희","소프트웨어 개발 체험","2"
```

---

## 테스트 시나리오

### 시나리오 1: 완전한 신청-배치 플로우

```bash
# 1. 프로그램 3개 등록
curl -X POST http://localhost:5000/api/programs -H "Content-Type: application/json" -d '{"name":"소프트웨어 개발","type":"진로체험활동","quota":10,"description":"웹/앱 개발"}'
curl -X POST http://localhost:5000/api/programs -H "Content-Type: application/json" -d '{"name":"AI 프로그래밍","type":"진로체험활동","quota":8,"description":"AI 기초"}'
curl -X POST http://localhost:5000/api/programs -H "Content-Type: application/json" -d '{"name":"로봇 공학","type":"동아리활동","quota":12,"description":"로봇 제작"}'

# 2. 학생 5명 신청
curl -X POST http://localhost:5000/api/applications -H "Content-Type: application/json" -d '{"studentId":"20240101","name":"김철수","choice1":1,"choice2":2,"choice3":3}'
curl -X POST http://localhost:5000/api/applications -H "Content-Type: application/json" -d '{"studentId":"20240102","name":"이영희","choice1":1,"choice2":3,"choice3":2}'
curl -X POST http://localhost:5000/api/applications -H "Content-Type: application/json" -d '{"studentId":"20240103","name":"박민수","choice1":2,"choice2":1,"choice3":3}'
curl -X POST http://localhost:5000/api/applications -H "Content-Type: application/json" -d '{"studentId":"20240104","name":"최지우","choice1":2,"choice2":3,"choice3":1}'
curl -X POST http://localhost:5000/api/applications -H "Content-Type: application/json" -d '{"studentId":"20240105","name":"정수진","choice1":3,"choice2":1,"choice3":2}'

# 3. 신청 현황 확인
curl http://localhost:5000/api/applications

# 4. 배치 실행
curl -X POST http://localhost:5000/api/allocate

# 5. 배치 결과 확인
curl http://localhost:5000/api/allocate/results

# 6. CSV 다운로드
curl http://localhost:5000/api/allocate/export -o results.csv
```

### 시나리오 2: 재제출 보안 테스트

```bash
# 1. 최초 신청
curl -X POST http://localhost:5000/api/applications -H "Content-Type: application/json" -d '{"studentId":"20240999","name":"테스트","choice1":1,"choice2":2,"choice3":3}'

# 2. 전화번호/생년월일 없이 재제출 시도 (실패해야 함)
curl -X POST http://localhost:5000/api/applications -H "Content-Type: application/json" -d '{"studentId":"20240999","name":"테스트","choice1":2,"choice2":1,"choice3":3}'

# 3. 정상 재제출 (성공)
curl -X POST http://localhost:5000/api/applications -H "Content-Type: application/json" -d '{"studentId":"20240999","name":"테스트","phone":"010-1111-2222","birthdate":"2008-05-20","choice1":2,"choice2":1,"choice3":3}'

# 4. 잘못된 전화번호로 재제출 시도 (실패해야 함)
curl -X POST http://localhost:5000/api/applications -H "Content-Type: application/json" -d '{"studentId":"20240999","name":"테스트","phone":"010-9999-9999","birthdate":"2008-05-20","choice1":3,"choice2":2,"choice3":1}'

# 5. 올바른 정보로 재제출 (성공)
curl -X POST http://localhost:5000/api/applications -H "Content-Type: application/json" -d '{"studentId":"20240999","name":"테스트","phone":"010-1111-2222","birthdate":"2008-05-20","choice1":3,"choice2":2,"choice3":1}'
```

### 시나리오 3: 정원 초과 테스트

```bash
# 1. 정원 2명인 프로그램 등록
curl -X POST http://localhost:5000/api/programs -H "Content-Type: application/json" -d '{"name":"인기 프로그램","type":"진로체험활동","quota":2,"description":"정원 2명"}'

# 2. 5명 모두 같은 프로그램을 1지망으로 신청
curl -X POST http://localhost:5000/api/applications -H "Content-Type: application/json" -d '{"studentId":"S001","name":"학생1","choice1":1,"choice2":2,"choice3":3}'
curl -X POST http://localhost:5000/api/applications -H "Content-Type: application/json" -d '{"studentId":"S002","name":"학생2","choice1":1,"choice2":2,"choice3":3}'
curl -X POST http://localhost:5000/api/applications -H "Content-Type: application/json" -d '{"studentId":"S003","name":"학생3","choice1":1,"choice2":2,"choice3":3}'
curl -X POST http://localhost:5000/api/applications -H "Content-Type: application/json" -d '{"studentId":"S004","name":"학생4","choice1":1,"choice2":2,"choice3":3}'
curl -X POST http://localhost:5000/api/applications -H "Content-Type: application/json" -d '{"studentId":"S005","name":"학생5","choice1":1,"choice2":2,"choice3":3}'

# 3. 배치 실행 (2명만 1지망 배치, 나머지는 2지망 이하로)
curl -X POST http://localhost:5000/api/allocate

# 4. 결과 확인
curl http://localhost:5000/api/allocate/results
```

---

## 테스트 체크리스트

### ✅ 프로그램 관리
- [ ] 프로그램 등록 성공
- [ ] 프로그램 목록 조회 성공
- [ ] 프로그램 삭제 성공
- [ ] 존재하지 않는 프로그램 삭제 시 404 에러

### ✅ 학생 신청
- [ ] 최초 신청 성공 (phone/birthdate 없이)
- [ ] 재제출 시 phone/birthdate 필수 검증
- [ ] 재제출 시 본인 확인 (phone 일치 검증)
- [ ] 재제출 시 본인 확인 (birthdate 일치 검증)
- [ ] submission_count 자동 증가 확인
- [ ] 신청 현황 조회 + 통계 확인

### ✅ 배치
- [ ] 배치 실행 성공
- [ ] 1지망 우선 배치 확인
- [ ] 정원 초과 시 2/3지망 배치 확인
- [ ] 배치되지 않은 학생 수 계산 확인
- [ ] 배치 결과 조회 성공
- [ ] CSV 다운로드 성공 (한글 깨짐 없음)

---

## 유용한 팁

### JSON 응답 보기 좋게 출력
```bash
curl http://localhost:5000/api/programs | jq
```

### 응답 헤더 확인
```bash
curl -i http://localhost:5000/api/programs
```

### 상세 디버깅
```bash
curl -v http://localhost:5000/api/programs
```
