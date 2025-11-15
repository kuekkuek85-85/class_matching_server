const BASE_URL = 'http://localhost:5000';

async function setupTestData() {
  console.log('📝 테스트 데이터 생성 중...\n');
  
  // 1. 프로그램 4개 생성 (총 정원: 20명)
  const programs = [
    { name: "인기프로그램A", type: "진로체험활동", quota: 5, description: "많은 학생이 선호" },
    { name: "보통프로그램B", type: "진로체험활동", quota: 5, description: "중간 인기" },
    { name: "적은프로그램C", type: "진로체험활동", quota: 5, description: "적은 인기" },
    { name: "여유프로그램D", type: "진로체험활동", quota: 5, description: "여유 있음" },
  ];

  const createdPrograms = [];
  for (const prog of programs) {
    const res = await fetch(`${BASE_URL}/api/programs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prog)
    });
    const data = await res.json();
    createdPrograms.push(data);
    console.log(`✅ ${data.name} 생성 (정원: ${data.quota}명) - ID: ${data.id}`);
  }

  console.log(`   총 정원: ${programs.reduce((sum, p) => sum + p.quota, 0)}명\n`);

  // 2. 학생 15명 신청
  // - 10명: 모두 프로그램A 1지망 (정원 5명) → 5명만 성공, 나머지는 2-3지망 시도
  // - 5명: 다양한 지망 (B, C를 1지망)
  
  const students = [];
  
  // 프로그램A 집중 지망자 10명 (1:A, 2:B, 3:C) → 5명 실패 예상
  for (let i = 1; i <= 10; i++) {
    students.push({
      studentId: `A${String(i).padStart(3, '0')}`,
      name: `학생A${i}`,
      choice1: createdPrograms[0].id, // A
      choice2: createdPrograms[1].id, // B  
      choice3: createdPrograms[2].id  // C
    });
  }

  // 프로그램B 지망자 3명 (1:B, 2:C, 3:D)
  for (let i = 1; i <= 3; i++) {
    students.push({
      studentId: `B${String(i).padStart(3, '0')}`,
      name: `학생B${i}`,
      choice1: createdPrograms[1].id, // B
      choice2: createdPrograms[2].id, // C
      choice3: createdPrograms[3].id  // D
    });
  }

  // 프로그램C 지망자 2명 (1:C, 2:D, 3:A)
  for (let i = 1; i <= 2; i++) {
    students.push({
      studentId: `C${String(i).padStart(3, '0')}`,
      name: `학생C${i}`,
      choice1: createdPrograms[2].id, // C
      choice2: createdPrograms[3].id, // D
      choice3: createdPrograms[0].id  // A
    });
  }

  console.log(`📚 학생 ${students.length}명 신청 중...`);
  for (const student of students) {
    await fetch(`${BASE_URL}/api/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(student)
    });
  }
  console.log(`✅ 학생 ${students.length}명 신청 완료\n`);

  return createdPrograms;
}

async function runAllocation() {
  console.log('🎯 배치 실행 중...\n');
  
  const res = await fetch(`${BASE_URL}/api/allocate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  
  const result = await res.json();
  console.log('📊 배치 결과:');
  console.log(`   총 학생: ${result.totalStudents}명`);
  console.log(`   배치 성공: ${result.allocatedCount}명 ✅`);
  console.log(`   배치 실패: ${result.unallocatedCount}명 ${result.unallocatedCount > 0 ? '⚠️' : ''}\n`);
  
  return result;
}

async function showResults() {
  console.log('📋 상세 결과 조회 중...\n');
  
  const res = await fetch(`${BASE_URL}/api/allocate/results`);
  const results = await res.json();
  
  // 지망별 통계
  const choice1 = results.allocations.filter(a => a.choiceRank === 1);
  const choice2 = results.allocations.filter(a => a.choiceRank === 2);
  const choice3 = results.allocations.filter(a => a.choiceRank === 3);
  const others = results.allocations.filter(a => a.choiceRank === 0);
  
  console.log('📈 지망별 배치 통계:');
  console.log(`   1지망: ${choice1.length}명 (${((choice1.length / results.totalAllocated) * 100).toFixed(1)}%)`);
  console.log(`   2지망: ${choice2.length}명 (${((choice2.length / results.totalAllocated) * 100).toFixed(1)}%)`);
  console.log(`   3지망: ${choice3.length}명 (${((choice3.length / results.totalAllocated) * 100).toFixed(1)}%)`);
  console.log(`   지망 외: ${others.length}명 (${((others.length / results.totalAllocated) * 100).toFixed(1)}%) ${others.length > 0 ? '🎲' : ''}\n`);
  
  console.log('💬 학생별 메시지 샘플:');
  console.log('─'.repeat(100));
  
  // 각 지망별로 하나씩 샘플
  if (choice1.length > 0) {
    const sample = choice1[0];
    console.log(`✅ 1지망 성공 - ${sample.studentName} (${sample.studentId})`);
    console.log(`   배치: ${sample.programName}`);
    console.log(`   메시지: ${sample.message}\n`);
  }
  
  if (choice2.length > 0) {
    const sample = choice2[0];
    console.log(`⚠️  2지망 배치 - ${sample.studentName} (${sample.studentId})`);
    console.log(`   배치: ${sample.programName}`);
    console.log(`   메시지: ${sample.message}\n`);
  }
  
  if (choice3.length > 0) {
    const sample = choice3[0];
    console.log(`⚠️  3지망 배치 - ${sample.studentName} (${sample.studentId})`);
    console.log(`   배치: ${sample.programName}`);
    console.log(`   메시지: ${sample.message}\n`);
  }
  
  if (others.length > 0) {
    console.log(`🎲 지망 외 배치된 학생들 (총 ${others.length}명):`);
    console.log('─'.repeat(100));
    others.forEach((allocation, idx) => {
      console.log(`${idx + 1}. ${allocation.studentName} (${allocation.studentId}) → ${allocation.programName}`);
      console.log(`   메시지: ${allocation.message}\n`);
    });
  }
  
  // 프로그램별 통계
  console.log('🏫 프로그램별 배치 현황:');
  console.log('─'.repeat(100));
  results.programStats.forEach(stat => {
    const rate = ((stat.allocatedCount / stat.quota) * 100).toFixed(0);
    const bar = '█'.repeat(Math.floor(stat.allocatedCount / stat.quota * 20));
    console.log(`${stat.programName.padEnd(20)} [${bar.padEnd(20)}] ${stat.allocatedCount}/${stat.quota}명 (${rate}%)`);
    console.log(`   1지망: ${stat.choice1Count}명, 2지망: ${stat.choice2Count}명, 3지망: ${stat.choice3Count}명`);
  });
}

async function main() {
  console.log('🚀 개선된 배치 알고리즘 테스트\n');
  console.log('='.repeat(100) + '\n');
  
  try {
    await setupTestData();
    await runAllocation();
    await showResults();
    
    console.log('\n' + '='.repeat(100));
    console.log('\n✅ 테스트 완료!\n');
  } catch (error) {
    console.error('❌ 에러 발생:', error.message);
  }
}

main();
