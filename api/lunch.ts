export default async function handler(req: any, res: any) {
  const { officeCode, schoolCode, date } = req.query;
  if (!officeCode || !schoolCode || !date) {
    return res.status(400).json({ error: "officeCode, schoolCode, and date (YYYYMMDD) are required" });
  }
  try {
    const url = `https://open.neis.go.kr/hub/mealServiceDietInfo?Type=json&pIndex=1&pSize=20&ATPT_OFCDC_SC_CODE=${officeCode}&SD_SCHUL_CODE=${schoolCode}&MLSV_YMD=${date}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.RESULT && data.RESULT.CODE !== "INFO-000") {
      return res.json({ meals: [] });
    }

    if (data.mealServiceDietInfo && data.mealServiceDietInfo[1] && data.mealServiceDietInfo[1].row) {
      const meals = data.mealServiceDietInfo[1].row.map((item: any) => {
        const rawDish = item.DDISH_NM || "";
        
        // Clean the dishes for neat display and prompt processing
        const dishes = rawDish
          .replace(/<br\s*\/?>/g, "\n")
          .split("\n")
          .map((dish: string) => {
            // Remove anything in parentheses (allergy numbers like (1.2.5.6.10))
            return dish.replace(/\s*\([^)]*\)/g, "").trim();
          })
          .filter((dish: string) => dish.length > 0);

        return {
          mealCode: item.MMEAL_SC_CODE,
          mealName: item.MMEAL_SC_NM,
          date: item.MLSV_YMD,
          dishes,
          rawDish,
          calories: item.CAL_INFO,
          nutrition: item.NTR_INFO,
          origin: item.ORPLC_INFO,
        };
      });
      return res.json({ meals });
    }

    return res.json({ meals: [] });
  } catch (error: any) {
    console.error("Lunch fetch error:", error);
    return res.status(500).json({ error: "Failed to fetch meal info" });
  }
}
