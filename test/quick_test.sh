#!/bin/bash

# 빠른 API 테스트 스크립트
# 사용법: ./test/quick_test.sh

BASE_URL="http://localhost:5000"

echo "🚀 API 테스트 시작..."
echo ""

# 1. 프로그램 등록
echo "📌 1. 프로그램 등록 중..."
curl -s -X POST $BASE_URL/api/programs \
  -H "Content-Type: application/json" \
  -d '{
    "name": "소프트웨어 개발 체험",
    "type": "진로체험활동",
    "quota": 15,
    "description": "웹 개발과 앱 개발을 체험해볼 수 있는 프로그램입니다."
  }'

echo ""
echo ""

curl -s -X POST $BASE_URL/api/programs \
  -H "Content-Type: application/json" \
  -d '{
    "name": "AI 프로그래밍 체험",
    "type": "진로체험활동",
    "quota": 10,
    "description": "인공지능 기초와 머신러닝을 배웁니다."
  }'

echo ""
echo ""

curl -s -X POST $BASE_URL/api/programs \
  -H "Content-Type: application/json" \
  -d '{
    "name": "로봇 공학 동아리",
    "type": "동아리활동",
    "quota": 12,
    "description": "로봇 제작과 프로그래밍을 배웁니다."
  }'

echo ""
echo ""

# 2. 프로그램 목록 조회
echo "📌 2. 프로그램 목록 조회..."
curl -s $BASE_URL/api/programs

echo ""
echo ""

# 3. 학생 신청
echo "📌 3. 학생 신청 중..."
curl -s -X POST $BASE_URL/api/applications \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "20240101",
    "name": "김철수",
    "choice1": 1,
    "choice2": 2,
    "choice3": 3
  }'

echo ""
echo ""

curl -s -X POST $BASE_URL/api/applications \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "20240102",
    "name": "이영희",
    "choice1": 2,
    "choice2": 1,
    "choice3": 3
  }'

echo ""
echo ""

curl -s -X POST $BASE_URL/api/applications \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "20240103",
    "name": "박민수",
    "choice1": 1,
    "choice2": 3,
    "choice3": 2
  }'

echo ""
echo ""

# 4. 재제출 테스트 (전화번호/생년월일 없이 - 실패해야 함)
echo "📌 4. 재제출 테스트 (phone/birthdate 없이 - 에러 예상)..."
curl -s -X POST $BASE_URL/api/applications \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "20240101",
    "name": "김철수",
    "choice1": 2,
    "choice2": 1,
    "choice3": 3
  }'

echo ""
echo ""

# 5. 재제출 (정상)
echo "📌 5. 재제출 (정상)..."
curl -s -X POST $BASE_URL/api/applications \
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

echo ""
echo ""

# 6. 신청 현황 조회
echo "📌 6. 신청 현황 조회..."
curl -s $BASE_URL/api/applications

echo ""
echo ""

# 7. 배치 실행
echo "📌 7. 배치 실행 중..."
curl -s -X POST $BASE_URL/api/allocate

echo ""
echo ""

# 8. 배치 결과 조회
echo "📌 8. 배치 결과 조회..."
curl -s $BASE_URL/api/allocate/results

echo ""
echo ""

# 9. CSV 다운로드
echo "📌 9. CSV 다운로드..."
curl -s $BASE_URL/api/allocate/export -o test/allocation_results.csv
echo "✅ CSV 파일 저장 완료: test/allocation_results.csv"
echo ""
cat test/allocation_results.csv

echo ""
echo "✨ 테스트 완료!"
