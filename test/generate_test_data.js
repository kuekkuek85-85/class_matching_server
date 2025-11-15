/**
 * 대량 테스트 데이터 생성 스크립트
 * 프로그램 10개, 학생 200명 생성
 */

const BASE_URL = 'http://localhost:5000';

// 한국식 성씨와 이름 조합
const lastNames = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임', '한', '오', '서', '신', '권', '황', '안', '송', '류', '전'];
const firstNames = ['민준', '서준', '예준', '도윤', '시우', '주원', '하준', '지호', '지후', '준서', '준우', '현우', '도현', '건우', '우진', '선우', '서진', '민재', '현준', '연우',
                    '지우', '서연', '서현', '민서', '하은', '하윤', '윤서', '지민', '지유', '채원', '지안', '수아', '소율', '다은', '예은', '소윤', '예린', '아린', '채은', '수빈'];

// 프로그램 데이터
const programs = [
  { name: '소프트웨어 개발 체험', type: '진로체험활동', quota: 20, description: '웹 개발과 앱 개발을 체험해볼 수 있는 프로그램입니다.' },
  { name: 'AI 프로그래밍 체험', type: '진로체험활동', quota: 18, description: '인공지능 기초와 머신러닝을 배우는 프로그램입니다.' },
  { name: '로봇 공학 동아리', type: '동아리활동', quota: 15, description: '로봇 제작과 프로그래밍을 배우는 동아리입니다.' },
  { name: '게임 개발 동아리', type: '동아리활동', quota: 22, description: 'Unity와 Unreal Engine을 활용한 게임 제작 동아리입니다.' },
  { name: '웹 디자인 체험', type: '진로체험활동', quota: 16, description: 'UI/UX 디자인과 프론트엔드 개발을 배웁니다.' },
  { name: '데이터 과학 체험', type: '진로체험활동', quota: 19, description: '빅데이터 분석과 시각화를 체험하는 프로그램입니다.' },
  { name: '사이버 보안 체험', type: '진로체험활동', quota: 14, description: '정보보안과 해킹 방어 기술을 배웁니다.' },
  { name: '모바일 앱 개발', type: '진로체험활동', quota: 21, description: 'Android와 iOS 앱 개발을 체험합니다.' },
  { name: '3D 모델링 동아리', type: '동아리활동', quota: 17, description: 'Blender와 3D 프린팅을 활용한 창작 동아리입니다.' },
  { name: '창업 아이디어 체험', type: '진로체험활동', quota: 23, description: '스타트업 창업과 비즈니스 모델 개발을 배웁니다.' }
];

// 랜덤 이름 생성
function generateRandomName() {
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  return lastName + firstName;
}

// 랜덤 전화번호 생성
function generateRandomPhone() {
  const middle = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  const last = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  return `010-${middle}-${last}`;
}

// 랜덤 생년월일 생성 (2006~2010년생)
function generateRandomBirthdate() {
  const year = 2006 + Math.floor(Math.random() * 5);
  const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
  const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 랜덤 지망 생성 (1~10 중 중복 없이 3개)
function generateRandomChoices() {
  const choices = [];
  while (choices.length < 3) {
    const choice = Math.floor(Math.random() * 10) + 1;
    if (!choices.includes(choice)) {
      choices.push(choice);
    }
  }
  return { choice1: choices[0], choice2: choices[1], choice3: choices[2] };
}

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

// 프로그램 생성
async function createPrograms() {
  console.log('📌 프로그램 10개 생성 중...\n');
  
  for (let i = 0; i < programs.length; i++) {
    const result = await apiCall('/api/programs', 'POST', programs[i]);
    if (result.success) {
      console.log(`✅ [${i+1}/10] ${programs[i].name} (정원: ${programs[i].quota}명)`);
    } else {
      console.log(`❌ [${i+1}/10] ${programs[i].name} - 실패`);
    }
  }
  
  console.log('\n');
}

// 학생 신청 생성
async function createApplications() {
  console.log('📌 학생 200명 신청 생성 중...\n');
  
  let successCount = 0;
  let resubmissionCount = 0;
  
  for (let i = 1; i <= 200; i++) {
    const studentId = `2024${String(i).padStart(4, '0')}`;
    const name = generateRandomName();
    const choices = generateRandomChoices();
    
    // 최초 신청
    const applicationData = {
      studentId,
      name,
      ...choices
    };
    
    const result = await apiCall('/api/applications', 'POST', applicationData);
    
    if (result.success) {
      successCount++;
      
      // 30% 확률로 재제출 (phone/birthdate 추가)
      if (Math.random() < 0.3) {
        const resubmitData = {
          studentId,
          name,
          phone: generateRandomPhone(),
          birthdate: generateRandomBirthdate(),
          ...generateRandomChoices() // 다른 지망으로 재제출
        };
        
        const resubmitResult = await apiCall('/api/applications', 'POST', resubmitData);
        if (resubmitResult.success) {
          resubmissionCount++;
        }
      }
      
      if (i % 20 === 0) {
        console.log(`✅ [${i}/200] ${name} (${studentId})`);
      }
    } else {
      console.log(`❌ [${i}/200] ${name} - 실패`);
    }
  }
  
  console.log(`\n✅ 총 ${successCount}명 신청 완료`);
  console.log(`🔄 재제출: ${resubmissionCount}명\n`);
}

// 통계 조회
async function getStats() {
  console.log('📊 현황 조회 중...\n');
  
  const result = await apiCall('/api/applications');
  if (result.success) {
    const { totalApplications, programStats } = result.data;
    
    console.log(`총 신청자: ${totalApplications}명\n`);
    console.log('프로그램별 지망 현황:');
    console.log('─'.repeat(80));
    console.log('프로그램명'.padEnd(30) + '정원'.padEnd(8) + '1지망'.padEnd(8) + '2지망'.padEnd(8) + '3지망'.padEnd(8) + '총합');
    console.log('─'.repeat(80));
    
    programStats.forEach(stat => {
      console.log(
        stat.programName.padEnd(30) +
        String(stat.quota).padEnd(8) +
        String(stat.choice1Count).padEnd(8) +
        String(stat.choice2Count).padEnd(8) +
        String(stat.choice3Count).padEnd(8) +
        String(stat.totalCount)
      );
    });
    console.log('─'.repeat(80));
    console.log('\n');
  }
}

// 메인 실행
async function main() {
  console.log('🚀 대량 테스트 데이터 생성 시작\n');
  console.log('='.repeat(80));
  console.log('\n');
  
  await createPrograms();
  await createApplications();
  await getStats();
  
  console.log('='.repeat(80));
  console.log('✨ 데이터 생성 완료!\n');
}

main().catch(console.error);
