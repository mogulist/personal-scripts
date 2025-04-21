import axios from "axios";
import * as cheerio from "cheerio";
import * as fs from "fs";
import * as path from "path";

interface Record {
  bibNo: number;
  gender: string;
  event: string;
  time: string;
}

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function scrapeRecord(bibNo: number): Promise<Record> {
  const bibStr = bibNo.toString().padStart(6, "0");
  const url = `http://time.spct.co.kr/m2.php?EVENT_NO=2024042803&TargetYear=2024&currentPage=1&BIB_NO=${bibStr}`;

  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    // 결과가 없는 경우 체크
    if (response.data.includes("자료가 없습니다")) {
      return { bibNo, gender: "", event: "", time: "" };
    }

    // 선수 정보가 있는 요소 찾기 (p.name span)
    const playerInfoElement = $("p.name span");
    const playerInfoText = playerInfoElement.text().trim();

    // 성별과 종목 추출 (예: "M 메디오폰도78.5km" 또는 "M 그란폰도121.52km")
    const categoryMatch = playerInfoText.match(/([MF]) (그란폰도|메디오폰도)/);

    const gender = categoryMatch ? categoryMatch[1] : "";
    const event = categoryMatch ? categoryMatch[2] : "";

    // 기록 추출 - div.record div.time 요소에서 직접 추출
    let time = "";
    const timeElement = $("div.record div.time");
    if (timeElement.length > 0) {
      time = timeElement.text().trim();
    }

    return { bibNo, gender, event, time };
  } catch (error) {
    console.error(`Error processing BIB #${bibNo}:`, error);
    return { bibNo, gender: "", event: "", time: "" };
  }
}

async function main() {
  const startBib = parseInt(process.argv[2]) || 105;
  const endBib = parseInt(process.argv[3]) || 106;

  const outputFile = path.join(__dirname, "results_2024.csv");
  fs.writeFileSync(outputFile, "BIB_NO,Gender,Event,Time\n");

  for (let bibNo = startBib; bibNo <= endBib; bibNo++) {
    const record = await scrapeRecord(bibNo);

    const csvLine = `${record.bibNo},${record.gender},${record.event},${record.time}\n`;
    fs.appendFileSync(outputFile, csvLine);
    console.log(csvLine.trim());

    await delay(500);
  }

  console.log("Scraping completed!");
}

main().catch(console.error);
