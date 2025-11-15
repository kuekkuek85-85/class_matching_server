#!/bin/bash

# 전체 자동 테스트 실행 스크립트
# 1. 데이터 생성
# 2. 자동 테스트 실행

echo "🚀 전체 자동 테스트 시작"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 1: 데이터 생성
echo "📦 Step 1: 테스트 데이터 생성 중..."
echo ""
node test/generate_test_data.js
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 2: 자동 테스트
echo "🧪 Step 2: 자동 테스트 실행 중..."
echo ""
node test/run_auto_test.js
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "✨ 테스트 완료!"
echo ""
echo "📄 생성된 파일:"
echo "   - test/AUTO_TEST_RESULTS.md (테스트 결과 보고서)"
echo "   - test/auto_test_results.csv (배치 결과 CSV)"
echo ""
