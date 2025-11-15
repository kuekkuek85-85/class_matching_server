const BASE_URL = 'http://localhost:5000';

async function clearData() {
  console.log('🧹 기존 데이터 초기화 중...\n');
  
  // 배치 초기화는 배치 실행 시 자동으로 됨
  
  // 기존 프로그램 삭제 (1-30번)
  for (let i = 1; i <= 30; i++) {
    try {
      await fetch(`${BASE_URL}/api/programs/${i}`, { method: 'DELETE' });
    } catch (e) {}
  }
}

async function setupTestData() {
  console.log('📝 테스트 데이터 생성 중...\n');
  
  // 1. 프로그램 3개 생성 (정원: 5, 3, 2)
  const programs = [
    { name: "인기프로그램A", type: "진로체험활동", quota: 5, description: "많은 학생이 선호" },
    { name: "보통프로그램B", type: "진로체험활동", quota: 3, description: "중간 인기" },
    { name: "적은프로그램C", type: "진로체험활동", quota: 2, description: "적은 인기" },
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

  console.log('\n');

  // 2. 학생 15명 신청
  // - 10명: 모두 프로그램A(id=1) 1지망 → 5명 성공, 5명 실패
  // - 3명: 프로그램B 1지망 → 모두 성공
  // - 2명: 프로그램C 1지망 → 모두 성공
  
  const students = [];
  
  // 프로그램A 지망자 10명 (1지망: A, 2지망: B, 3지망: C)
  for (let i = 1; i <= 10; i++) {
    students.push({
      studentId: `A${String(i).padStart(3, '0')}`,
      name: `학생A${i}`,
      choice1: createdPrograms[0].id,
      choice2: createdPrograms[1].id,
      choice3: createdPrograms[2].id
    });
  }

  // 프로그램B 지망자 3명
  for (let i = 1; i <= 3; i++) {
    students.push({
      studentId: `B${String(i).padStart(3, '0')}`,
      name: `학생B${i}`,
      choice1: createdPrograms[1].id,
      choice2: createdPrograms[0].id,
      choice3: createdPrograms[2].id
    });
  }

  // 프로그램C 지망자 2명
  for (let i = 1; i <= 2; i++) {
    students.push({
      studentId: `C${String(i).padStart(3, '0')}`,
      name: `학생C${i}`,
      choice1: createdPrograms[2].id,
      choice2: createdPrograms[0].id,
      choice3: createdPrograms[1].id
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
  console.log(`   배치 성공: ${result.allocatedCount}명`);
  console.log(`   배치 실패: ${result.unallocatedCount}명\n`);
  
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
  console.log(`   지망 외: ${others.length}명 (${((others.length / results.totalAllocated) * 100).toFixed(1)}%)\n`);
  
  console.log('💬 학생별 메시지 샘플 (처음 5명):');
  console.log('─'.repeat(80));
  results.allocations.slice(0, 5).forEach((allocation, idx) => {
    console.log(`${idx + 1}. ${allocation.studentName} (${allocation.studentId})`);
    console.log(`   배치: ${allocation.programName} (${allocation.choiceRankText})`);
    console.log(`   메시지: ${allocation.message}`);
    console.log(`   성공률: ${allocation.successRate}\n`);
  });
  
  // 지망 외 배치된 학생이 있으면 표시
  if (others.length > 0) {
    console.log('⚠️  지망 외 배치된 학생들:');
    console.log('─'.repeat(80));
    others.forEach((allocation, idx) => {
      console.log(`${idx + 1}. ${allocation.studentName} → ${allocation.programName}`);
      console.log(`   메시지: ${allocation.message}\n`);
    });
  }
}

async function main() {
  console.log('🚀 개선된 배치 알고리즘 테스트 시작\n');
  console.log('='.repeat(80) + '\n');
  
  try {
    await clearData();
    await setupTestData();
    await runAllocation();
    await showResults();
    
    console.log('='.repeat(80));
    console.log('\n✅ 테스트 완료!\n');
  } catch (error) {
    console.error('❌ 에러 발생:', error.message);
  }
}

main();
