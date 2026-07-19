import { IncomingMessage, ServerResponse } from "http";

export default async function handler(req: any, res: any) {
  const schoolName = req.query.name as string;
  if (!schoolName) {
    return res.status(400).json({ error: "School name is required" });
  }
  try {
    const url = `https://open.neis.go.kr/hub/schoolInfo?Type=json&pIndex=1&pSize=50&SCHUL_NM=${encodeURIComponent(schoolName)}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.RESULT && data.RESULT.CODE !== "INFO-000") {
      return res.json({ schools: [] });
    }

    if (data.schoolInfo && data.schoolInfo[1] && data.schoolInfo[1].row) {
      const schools = data.schoolInfo[1].row.map((item: any) => ({
        officeCode: item.ATPT_OFCDC_SC_CODE,
        officeName: item.ATPT_OFCDC_SC_NM,
        schoolCode: item.SD_SCHUL_CODE,
        schoolName: item.SCHUL_NM,
        engSchoolName: item.ENG_SCHUL_NM,
        schoolKind: item.SCHUL_KND_SC_NM,
        location: item.LCTN_SC_NM,
        address: item.ORG_RDNMA,
      }));
      return res.json({ schools });
    }

    return res.json({ schools: [] });
  } catch (error: any) {
    console.error("School search error:", error);
    return res.status(500).json({ error: "Failed to search school" });
  }
}
