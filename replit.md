# 학생 프로그램 신청 및 배치 시스템 - 백엔드 API 서버

## 프로젝트 개요
해커톤용 학생 프로그램 신청 및 배치 시스템의 백엔드 API 서버입니다.
- 클라이언트는 별도 프로젝트로 분리되어 있으며, 이 프로젝트는 API만 제공합니다.
- 구글 폼 없이 웹에서 바로 프로그램 신청/배치를 처리합니다.

## 기술 스택
- **백엔드**: Node.js + Express
- **데이터베이스**: PostgreSQL (Replit 제공)
- **ORM**: Drizzle ORM
- **언어**: TypeScript

## 주요 기능
1. **프로그램 관리 API**
   - 프로그램 등록/조회/삭제
   
2. **학생 신청 API**
   - 최초 제출: 학번 + 이름만 필수
   - 중복 제출: 전화번호 + 생년월일 추가 필수
   - submission_count 자동 업데이트

3. **배치 API**
   - 기본 배치 알고리즘 (무작위 섞기 후 1~3지망 순으로 정원 채우기)
   - 배치 결과 조회
   - CSV 다운로드

## 데이터베이스 스키마
### programs
- id, name, type, quota, description, created_at

### applications
- id, student_id (UNIQUE), name, phone, birthdate
- choice_1, choice_2, choice_3
- submission_count, first_submitted_at, last_submitted_at

### allocations
- id, student_id, program_id, choice_rank, allocation_type, allocated_at

## API 엔드포인트
### 프로그램 관리
- `GET /api/programs` - 프로그램 목록 조회
- `POST /api/programs` - 프로그램 등록
- `DELETE /api/programs/:id` - 프로그램 삭제

### 학생 신청
- `POST /api/applications` - 신청 제출/재제출
- `GET /api/applications` - 신청 현황 조회

### 배치
- `POST /api/allocate` - 배치 실행
- `GET /api/allocate/results` - 배치 결과 조회
- `GET /api/allocate/export` - CSV 다운로드

## 개발 가이드라인
- **인증 없음**: MVP에서는 별도 로그인/인증 시스템 없이 구현
- **AI 배치 제외**: 기본 배치 알고리즘만 구현 (AI는 선택 사항)
- **클라이언트 분리**: 이 프로젝트는 API만 제공, 클라이언트는 별도 프로젝트

## 최근 변경사항
- 2025-01-15: 프로젝트 초기 설정 및 문서 작성
