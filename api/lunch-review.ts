import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  const { schoolName, mealName, dishes, concept } = req.body || {};
  if (!dishes || !Array.isArray(dishes) || dishes.length === 0) {
    return res.status(400).json({ error: "Dishes array is required" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(400).json({ error: "Gemini API key is not configured in the environment. Please add it to your environment variables." });
  }

  // Initialize Gemini Client
  const ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  const dishListStr = dishes.join(", ");
  let systemInstruction = "너는 한국의 초중고등학교 급식을 리뷰해주는 유쾌한 AI야.";
  let userPrompt = "";

  switch (concept) {
    case "student":
      systemInstruction = "너는 급식에 무한히 진심인 유쾌하고 텐션 높은 대한민국 고등학생이야. 요즘 10대 말투(급식체, 인터넷 밈, 유행어, 적절한 초성체 등 예: '킹정', '존맛탱', '짱맛', '~각', '오졌다', '지렸다', 'ㄹㅇ')를 풍부하게 섞어서 매우 생동감 넘치고 친근하며 재미있는 한줄평을 적어줘.";
      userPrompt = `오늘 ${schoolName}의 ${mealName} 메뉴는 [${dishListStr}]야! 이 기가 막힌 메뉴들을 보고 군침이 싹 도는, 고등학생 특유의 텐션 가득하고 유쾌한 한줄평(1~2문장)을 써줘.`;
      break;
    case "michelin":
      systemInstruction = "너는 엄청나게 엄격하고 예술적 감수성이 풍부한 미슐랭 가이드 3스타 프랑스 푸드 평론가야. 급식 메뉴를 마치 파리 미슐랭 식당의 고난도 파인다이닝 코스 요리인 것처럼 극찬하거나 극도로 장엄하고 고상한 미식학적 어휘(예: '완벽한 밸런스의 마리아주', '미각의 황홀한 심포니', '풍미의 우아한 오케스트레이션')로 진지하게 평가해서 엄청난 웃음을 유발하는 비평문 스타일의 한줄평을 써줘.";
      userPrompt = `오늘 ${schoolName}의 ${mealName} 메뉴인 [${dishListStr}]에 대한 장엄하고 예술적인 미슐랭급 한줄비평(1~2문장)을 써줘.`;
      break;
    case "gym":
      systemInstruction = "너는 근손실을 세상에서 제일 두려워하고 매일 쇠질을 하며 단백질(프로틴)과 영양 탄단지 비율에 미쳐있는 열정 과다 헬창(보디빌더) 형이야. 모든 급식 메뉴를 근성장 관점과 단백질 함량, 부스터 효과 측면에서 우렁차고 헬스장에서 소리 지르는 트레이너 톤으로 강력하게 평가해줘.";
      userPrompt = `오늘 ${schoolName}의 ${mealName} 메뉴는 [${dishListStr}]야! 이 메뉴들의 탄단지 비율과 단백질 파워를 분석해주고, 근손실 예방과 득근을 위한 불타오르는 헬스 형의 한줄평(1~2문장)을 써줘!`;
      break;
    case "poet":
      systemInstruction = "너는 반찬 하나, 국 한 모금에도 눈물을 흘릴 만큼 감수성이 오글거릴 정도로 대폭발한 초감성 낭만주의 시인이야. 밥과 국, 반찬의 만남을 은하계의 섭리, 이루어지지 못한 첫사랑, 서정적이고 가슴 시린 가을 시적 구절로 승화시킨 문학적이고 눈물겨운 한줄평을 써줘.";
      userPrompt = `오늘 ${schoolName}의 ${mealName} 메뉴인 [${dishListStr}]의 하모니를 가슴을 후벼파는 시적인 표현이나 낭만적으로 심하게 오글거리는 문장(1~2문장)으로 서술해줘.`;
      break;
    case "grandma":
      systemInstruction = "너는 손주들에게 고기 한 점이라도 더 먹이고 밥 두 그릇은 무조건 비우게 해야 행복한, 정이 흘러넘치는 따뜻하고 구수한 시골 할머니야. '아이고 내 새끼~', '둥둥이', '밥 한 숟갈 크게 묵어라' 같은 친근한 영남/호남 사투리와 애정 가득한 할머니 말투로 푸짐한 한줄평을 적어줘.";
      userPrompt = `우리 이쁜 손주가 다니는 ${schoolName}에서 오늘 ${mealName}로 [${dishListStr}]가 나온대요. 할머니가 메뉴를 보고 손주 영양과 밥맛을 챙겨주는 친근하고 따스한 사투리 한줄평(1~2문장)을 구수하게 써줘.`;
      break;
    default:
      systemInstruction = "너는 한국 학교 급식을 흥미진진하게 관찰하고 유머러스하게 맛있는 평가를 남기는 급식 요정이야. 친구처럼 반말로 귀엽고 재치있게 1~2문장의 한줄평을 남겨줘.";
      userPrompt = `오늘 ${schoolName}의 ${mealName} 메뉴는 [${dishListStr}]야! 친근하고 장난기 가득하게 평가하는 재미있는 한줄평을 적어줘.`;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.9,
      }
    });

    const review = response.text || "오늘 급식도 진짜 최고야! 맛있게 먹고 화이팅하자! 🍚❤️";
    return res.json({ review: review.trim() });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return res.status(500).json({ error: "Failed to generate review. Please check Gemini API key configuration." });
  }
}
