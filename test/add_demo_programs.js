const BASE_URL = 'http://localhost:5000';

const programs = [
  {
    name: "웰빙건강심리센터",
    type: "진로체험활동",
    quota: 12,
    description: "심리검사 및 상담"
  },
  {
    name: "엘리펀트리(영어놀이학교)",
    type: "진로체험활동",
    quota: 8,
    description: "일일교사"
  },
  {
    name: "서울도봉경찰서",
    type: "진로체험활동",
    quota: 18,
    description: "경찰관"
  },
  {
    name: "서울창도초등학교",
    type: "진로체험활동",
    quota: 14,
    description: "초등교사"
  },
  {
    name: "서울자운초등학교",
    type: "진로체험활동",
    quota: 12,
    description: "초등교사"
  },
  {
    name: "유화유치원",
    type: "진로체험활동",
    quota: 5,
    description: "유아교육 - 체험 당일(09:30~15:30) : 봄 소풍 실시(선유도공원), 자신의 점심 도시락 준비"
  },
  {
    name: "Y&C 스포츠클럽(오전) / 현대 레포츠 스쿨(오후)",
    type: "진로체험활동",
    quota: 10,
    description: "운동 - 스포츠"
  },
  {
    name: "북서울신협",
    type: "진로체험활동",
    quota: 8,
    description: "은행원"
  },
  {
    name: "광고박물관",
    type: "진로체험활동",
    quota: 18,
    description: "광고기획자 (송파구)"
  },
  {
    name: "jc매직",
    type: "진로체험활동",
    quota: 15,
    description: "마술사"
  },
  {
    name: "덕성여대 의상학과",
    type: "진로체험활동",
    quota: 10,
    description: "패션디자이너"
  },
  {
    name: "hair doo",
    type: "진로체험활동",
    quota: 10,
    description: "헤어디자이너"
  },
  {
    name: "크리스챤쇼보 미용학원",
    type: "진로체험활동",
    quota: 20,
    description: "메이크업/네일아티스트"
  },
  {
    name: "하와이네일",
    type: "진로체험활동",
    quota: 10,
    description: "네일아티스트"
  },
  {
    name: "셰움카페",
    type: "진로체험활동",
    quota: 10,
    description: "바리스타 (12:00~17:00)"
  },
  {
    name: "창동 플랫폼 61 (일러스트레이터/웹툰작가)",
    type: "진로체험활동",
    quota: 15,
    description: "일러스트레이터/웹툰작가"
  },
  {
    name: "창동 플랫폼 61 (푸드스타일리스트)",
    type: "진로체험활동",
    quota: 15,
    description: "푸드스타일리스트"
  },
  {
    name: "창동 플랫폼 61 (가수/보컬트레이너)",
    type: "진로체험활동",
    quota: 10,
    description: "가수/보컬트레이너"
  }
];

async function addPrograms() {
  console.log('🚀 진로체험활동 프로그램 18개 추가 시작...\n');
  
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < programs.length; i++) {
    const program = programs[i];
    try {
      const response = await fetch(`${BASE_URL}/api/programs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(program)
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ [${i + 1}/18] ${program.name} (정원: ${program.quota}명) - ID: ${data.id}`);
        successCount++;
      } else {
        const error = await response.json();
        console.log(`❌ [${i + 1}/18] ${program.name} 실패: ${error.message}`);
        failCount++;
      }
    } catch (error) {
      console.log(`❌ [${i + 1}/18] ${program.name} 에러: ${error.message}`);
      failCount++;
    }
  }

  console.log('\n📊 결과 요약:');
  console.log(`   성공: ${successCount}개`);
  console.log(`   실패: ${failCount}개`);
  console.log(`   총합: ${programs.length}개`);
  
  if (successCount === programs.length) {
    console.log('\n🎉 모든 프로그램이 성공적으로 추가되었습니다!');
  }
}

addPrograms().catch(console.error);
