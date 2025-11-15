/**
 * 자동 테스트 실행 스크립트
 * 1. 데이터 생성
 * 2. 배치 실행
 * 3. 결과 검증
 * 4. CSV 다운로드
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'http://localhost:5000';

// API 호출 함수
async function apiCall(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();
    return { success: response.ok, status: response.status, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// CSV 다운로드
async function downloadCSV() {
  try {
    const response = await fetch(`${BASE_URL}/api/allocate/export`);
    const text = await response.text();
    
    const csvPath = path.join(__dirname, 'auto_test_results.csv');
    fs.writeFileSync(csvPath, text, 'utf8');
    
    return { success: true, path: csvPath, size: text.length };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// 테스트 결과 저장
function saveTestResults(results) {
  const timestamp = new Date().toISOString();
  const report = `# 자동 테스트 결과 보고서

## 테스트 정보
- **실행 시간**: ${timestamp}
- **테스트 대상**: 학생 프로그램 신청 및 배치 시스템

---

## 1. 데이터 생성 결과

### 프로그램
- 생성된 프로그램 수: ${results.programs.total}개
- 총 정원: ${results.programs.totalQuota}명

### 학생 신청
- 총 신청자: ${results.applications.total}명
- 재제출 건수: ${results.applications.resubmissions}건

---

## 2. 배치 실행 결과

### 배치 통계
- 배치된 학생: ${results.allocation.allocatedCount}명
- 미배치 학생: ${results.allocation.unallocatedCount}명
- 배치율: ${results.allocation.allocationRate}%

### 지망별 배치 현황
- 1지망 배치: ${results.allocation.choice1Count}명
- 2지망 배치: ${results.allocation.choice2Count}명
- 3지망 배치: ${results.allocation.choice3Count}명

---

## 3. 프로그램별 배치 결과

| 프로그램명 | 정원 | 배치 인원 | 잔여 정원 | 1지망 | 2지망 | 3지망 |
|-----------|------|----------|---------|------|------|------|
${results.programStats.map(p => 
  `| ${p.programName} | ${p.quota} | ${p.allocatedCount} | ${p.remainingQuota} | ${p.choice1Count} | ${p.choice2Count} | ${p.choice3Count} |`
).join('\n')}

---

## 4. CSV 다운로드 결과

- 파일 생성: ${results.csv.success ? '✅ 성공' : '❌ 실패'}
- 파일 경로: \`${results.csv.path}\`
- 파일 크기: ${results.csv.size} bytes
- 예상 행 수: 약 ${Math.floor(results.csv.size / 50)}행

---

## 5. 테스트 검증

### ✅ 통과한 테스트
${results.validations.passed.map(v => `- ${v}`).join('\n')}

### ${results.validations.failed.length > 0 ? '❌' : '✅'} 실패한 테스트
${results.validations.failed.length > 0 ? results.validations.failed.map(v => `- ${v}`).join('\n') : '- 없음'}

---

## 6. 종합 평가

- **전체 테스트**: ${results.validations.passed.length + results.validations.failed.length}개
- **통과**: ${results.validations.passed.length}개
- **실패**: ${results.validations.failed.length}개
- **성공률**: ${((results.validations.passed.length / (results.validations.passed.length + results.validations.failed.length)) * 100).toFixed(2)}%

${results.validations.failed.length === 0 ? '✨ **모든 테스트를 통과했습니다!**' : '⚠️ 일부 테스트가 실패했습니다. 위의 실패 항목을 확인해주세요.'}
`;

  const reportPath = path.join(__dirname, 'AUTO_TEST_RESULTS.md');
  fs.writeFileSync(reportPath, report, 'utf8');
  
  return reportPath;
}

// 메인 테스트 실행
async function runTests() {
  console.log('🧪 자동 테스트 시작\n');
  console.log('='.repeat(80));
  console.log('\n');
  
  const results = {
    programs: { total: 0, totalQuota: 0 },
    applications: { total: 0, resubmissions: 0 },
    allocation: { allocatedCount: 0, unallocatedCount: 0, allocationRate: 0, choice1Count: 0, choice2Count: 0, choice3Count: 0 },
    programStats: [],
    csv: { success: false, path: '', size: 0 },
    validations: { passed: [], failed: [] }
  };
  
  // 1. 프로그램 조회
  console.log('📌 1. 프로그램 조회...');
  const programsResult = await apiCall('/api/programs');
  if (programsResult.success) {
    results.programs.total = programsResult.data.length;
    results.programs.totalQuota = programsResult.data.reduce((sum, p) => sum + p.quota, 0);
    console.log(`✅ ${results.programs.total}개 프로그램 확인 (총 정원: ${results.programs.totalQuota}명)\n`);
  } else {
    console.log('❌ 프로그램 조회 실패\n');
    results.validations.failed.push('프로그램 조회 실패');
  }
  
  // 2. 신청 현황 조회
  console.log('📌 2. 신청 현황 조회...');
  const appsResult = await apiCall('/api/applications');
  if (appsResult.success) {
    results.applications.total = appsResult.data.totalApplications;
    // 재제출 건수 계산 (submissionCount > 1)
    results.applications.resubmissions = appsResult.data.applications.filter(a => a.submissionCount > 1).length;
    console.log(`✅ ${results.applications.total}명 신청 확인 (재제출: ${results.applications.resubmissions}건)\n`);
  } else {
    console.log('❌ 신청 현황 조회 실패\n');
    results.validations.failed.push('신청 현황 조회 실패');
  }
  
  // 3. 배치 실행
  console.log('📌 3. 배치 실행...');
  const allocateResult = await apiCall('/api/allocate', 'POST');
  if (allocateResult.success) {
    results.allocation.allocatedCount = allocateResult.data.allocatedCount;
    results.allocation.unallocatedCount = allocateResult.data.unallocatedCount;
    results.allocation.allocationRate = ((results.allocation.allocatedCount / results.applications.total) * 100).toFixed(2);
    
    // 지망별 배치 카운트
    results.allocation.choice1Count = allocateResult.data.allocations.filter(a => a.choiceRank === 1).length;
    results.allocation.choice2Count = allocateResult.data.allocations.filter(a => a.choiceRank === 2).length;
    results.allocation.choice3Count = allocateResult.data.allocations.filter(a => a.choiceRank === 3).length;
    
    console.log(`✅ 배치 완료 - 배치: ${results.allocation.allocatedCount}명, 미배치: ${results.allocation.unallocatedCount}명\n`);
    results.validations.passed.push('배치 실행 성공');
  } else {
    console.log('❌ 배치 실행 실패\n');
    results.validations.failed.push('배치 실행 실패');
  }
  
  // 4. 배치 결과 조회
  console.log('📌 4. 배치 결과 조회...');
  const resultsData = await apiCall('/api/allocate/results');
  if (resultsData.success) {
    results.programStats = resultsData.data.programStats;
    console.log(`✅ 배치 결과 조회 성공\n`);
    results.validations.passed.push('배치 결과 조회 성공');
  } else {
    console.log('❌ 배치 결과 조회 실패\n');
    results.validations.failed.push('배치 결과 조회 실패');
  }
  
  // 5. CSV 다운로드
  console.log('📌 5. CSV 다운로드...');
  const csvResult = await downloadCSV();
  results.csv = csvResult;
  if (csvResult.success) {
    console.log(`✅ CSV 다운로드 성공 (${csvResult.size} bytes)\n`);
    results.validations.passed.push('CSV 다운로드 성공');
  } else {
    console.log('❌ CSV 다운로드 실패\n');
    results.validations.failed.push('CSV 다운로드 실패');
  }
  
  // 6. 검증
  console.log('📌 6. 데이터 검증...\n');
  
  // 검증 1: 프로그램 수
  if (results.programs.total === 10) {
    results.validations.passed.push('프로그램 10개 생성 확인');
  } else {
    results.validations.failed.push(`프로그램 수 불일치 (기대: 10, 실제: ${results.programs.total})`);
  }
  
  // 검증 2: 신청자 수
  if (results.applications.total === 200) {
    results.validations.passed.push('학생 200명 신청 확인');
  } else {
    results.validations.failed.push(`신청자 수 불일치 (기대: 200, 실제: ${results.applications.total})`);
  }
  
  // 검증 3: 배치율 (정원이 충분하므로 대부분 배치되어야 함)
  if (results.allocation.allocationRate >= 95) {
    results.validations.passed.push(`높은 배치율 달성 (${results.allocation.allocationRate}%)`);
  } else {
    results.validations.failed.push(`낮은 배치율 (${results.allocation.allocationRate}%)`);
  }
  
  // 검증 4: 배치 총합 = 배치된 학생 수
  const totalAllocated = results.allocation.choice1Count + results.allocation.choice2Count + results.allocation.choice3Count;
  if (totalAllocated === results.allocation.allocatedCount) {
    results.validations.passed.push('지망별 배치 수 일치');
  } else {
    results.validations.failed.push(`지망별 배치 수 불일치 (총합: ${totalAllocated}, 배치: ${results.allocation.allocatedCount})`);
  }
  
  // 검증 5: 정원 초과 확인
  const overQuota = results.programStats.filter(p => p.allocatedCount > p.quota);
  if (overQuota.length === 0) {
    results.validations.passed.push('모든 프로그램 정원 준수');
  } else {
    results.validations.failed.push(`정원 초과 프로그램 발견: ${overQuota.map(p => p.programName).join(', ')}`);
  }
  
  // 7. 결과 저장
  console.log('📌 7. 결과 저장...');
  const reportPath = saveTestResults(results);
  console.log(`✅ 결과 저장 완료: ${reportPath}\n`);
  
  console.log('='.repeat(80));
  console.log('\n📊 테스트 요약\n');
  console.log(`총 테스트: ${results.validations.passed.length + results.validations.failed.length}개`);
  console.log(`✅ 통과: ${results.validations.passed.length}개`);
  console.log(`❌ 실패: ${results.validations.failed.length}개`);
  console.log(`성공률: ${((results.validations.passed.length / (results.validations.passed.length + results.validations.failed.length)) * 100).toFixed(2)}%\n`);
  
  if (results.validations.failed.length === 0) {
    console.log('✨ 모든 테스트를 통과했습니다!\n');
  } else {
    console.log('⚠️  일부 테스트가 실패했습니다:\n');
    results.validations.failed.forEach(f => console.log(`   - ${f}`));
    console.log('');
  }
}

runTests().catch(console.error);
