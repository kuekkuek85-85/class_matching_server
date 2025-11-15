const BASE_URL = 'http://localhost:5000';

// 학생 이름 샘플 (성씨 + 이름)
const lastNames = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임', '한', '오', '서', '신', '권', '황', '안', '송', '류', '홍'];
const firstNames = ['서연', '민준', '하은', '지우', '서준', '수빈', '예은', '도윤', '시우', '하준', '은우', '채원', '지호', '유나', '준서', '지안', '윤서', '현우', '소율', '지율'];

function generateRandomName() {
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  return lastName + firstName;
}

async function getPrograms() {
  const response = await fetch(`${BASE_URL}/api/programs`);
  return await response.json();
}

async function generateStudents(count) {
  console.log(`\n📚 학생 ${count}명 더미 데이터 생성 중...\n`);
  
  // 프로그램 목록 가져오기
  const programs = await getPrograms();
  console.log(`✅ 프로그램 ${programs.length}개 확인 (총 정원: ${programs.reduce((sum, p) => sum + p.quota, 0)}명)\n`);
  
  const students = [];
  const usedStudentIds = new Set();
  
  for (let i = 1; i <= count; i++) {
    // 중복되지 않는 학번 생성
    let studentId;
    do {
      studentId = `2024${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
    } while (usedStudentIds.has(studentId));
    usedStudentIds.add(studentId);
    
    // 랜덤 이름 생성
    const name = generateRandomName();
    
    // 랜덤하게 3개의 서로 다른 프로그램 선택 (1-3지망)
    const shuffledPrograms = [...programs].sort(() => Math.random() - 0.5);
    const choice1 = shuffledPrograms[0].id;
    const choice2 = shuffledPrograms[1].id;
    const choice3 = shuffledPrograms[2].id;
    
    const student = {
      studentId,
      name,
      choice1,
      choice2,
      choice3
    };
    
    students.push(student);
    
    // 진행 상황 표시 (10명마다)
    if (i % 10 === 0) {
      console.log(`   ${i}/${count}명 생성 완료...`);
    }
  }
  
  console.log(`\n✅ 학생 데이터 ${students.length}개 생성 완료\n`);
  return students;
}

async function submitApplications(students) {
  console.log(`📤 학생 신청 데이터 제출 중...\n`);
  
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < students.length; i++) {
    const student = students[i];
    
    try {
      const response = await fetch(`${BASE_URL}/api/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(student)
      });
      
      if (response.ok) {
        successCount++;
        if ((i + 1) % 10 === 0) {
          console.log(`   ${i + 1}/${students.length}명 제출 완료...`);
        }
      } else {
        failCount++;
        const error = await response.json();
        console.log(`   ❌ ${student.studentId} 실패: ${error.message}`);
      }
    } catch (error) {
      failCount++;
      console.log(`   ❌ ${student.studentId} 에러: ${error.message}`);
    }
  }
  
  console.log(`\n📊 제출 결과:`);
  console.log(`   성공: ${successCount}명`);
  console.log(`   실패: ${failCount}명\n`);
}

async function runAllocation() {
  console.log(`🎯 배치 실행 중...\n`);
  
  const response = await fetch(`${BASE_URL}/api/allocate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  
  const result = await response.json();
  
  console.log(`📊 배치 결과:`);
  console.log(`   총 학생: ${result.totalStudents}명`);
  console.log(`   배치 성공: ${result.allocatedCount}명 ✅`);
  console.log(`   배치 실패: ${result.unallocatedCount}명 ${result.unallocatedCount > 0 ? '⚠️' : ''}\n`);
  
  return result;
}

async function showStatistics() {
  console.log(`📈 배치 통계 조회 중...\n`);
  
  const response = await fetch(`${BASE_URL}/api/allocate/results`);
  const results = await response.json();
  
  const choice1 = results.allocations.filter(a => a.choiceRank === 1);
  const choice2 = results.allocations.filter(a => a.choiceRank === 2);
  const choice3 = results.allocations.filter(a => a.choiceRank === 3);
  const others = results.allocations.filter(a => a.choiceRank === 0);
  
  console.log(`📊 지망별 배치 현황:`);
  console.log(`   1지망: ${choice1.length}명 (${((choice1.length / results.totalAllocated) * 100).toFixed(1)}%)`);
  console.log(`   2지망: ${choice2.length}명 (${((choice2.length / results.totalAllocated) * 100).toFixed(1)}%)`);
  console.log(`   3지망: ${choice3.length}명 (${((choice3.length / results.totalAllocated) * 100).toFixed(1)}%)`);
  console.log(`   지망 외: ${others.length}명 (${((others.length / results.totalAllocated) * 100).toFixed(1)}%)\n`);
  
  console.log(`🏫 프로그램별 배치 현황 (상위 5개):`);
  console.log('─'.repeat(80));
  
  // 배치 인원이 많은 순으로 정렬
  const sortedPrograms = results.programStats
    .sort((a, b) => b.allocatedCount - a.allocatedCount)
    .slice(0, 5);
  
  sortedPrograms.forEach(stat => {
    const rate = stat.quota > 0 ? ((stat.allocatedCount / stat.quota) * 100).toFixed(0) : 0;
    const bar = '█'.repeat(Math.min(20, Math.floor(stat.allocatedCount / stat.quota * 20)));
    console.log(`${stat.programName.padEnd(35)} [${bar.padEnd(20)}] ${stat.allocatedCount}/${stat.quota}명 (${rate}%)`);
  });
  
  console.log('\n');
}

async function main() {
  console.log('🚀 학생 더미 데이터 생성 및 배치 시스템 테스트');
  console.log('='.repeat(80));
  
  // 학생 수 설정 (기본값: 80명)
  const studentCount = process.argv[2] ? parseInt(process.argv[2]) : 80;
  
  try {
    const students = await generateStudents(studentCount);
    await submitApplications(students);
    await runAllocation();
    await showStatistics();
    
    console.log('='.repeat(80));
    console.log('\n✅ 모든 작업이 완료되었습니다!\n');
    console.log('💡 배치 결과 전체 조회: curl http://localhost:5000/api/allocate/results');
    console.log('💡 CSV 다운로드: curl http://localhost:5000/api/allocate/export -o results.csv\n');
    
  } catch (error) {
    console.error('\n❌ 에러 발생:', error.message);
  }
}

main();
