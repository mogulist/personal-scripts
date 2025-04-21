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

    // 성별과 종목 추출
    const categoryElement = $(".M, .F");
    let gender = "";
    let event = "";

    if (categoryElement.length > 0) {
      gender = categoryElement.attr("class") || "";
      const eventText = categoryElement.text().trim();
      event = eventText.includes("그란폰도") ? "그란폰도" : "메디오폰도";
    }

    // 기록 추출
    const timeElement = $(".record");
    let time = "";
    if (timeElement.length > 0) {
      time = timeElement.text().trim();
      if (time.includes("DNF")) {
        time = "DNF";
      }
    }

    return { bibNo, gender, event, time };
  } catch (error) {
    console.error(`Error processing BIB #${bibNo}:`, error);
    return { bibNo, gender: "", event: "", time: "" };
  }
}

async function main() {
  const results: Record[] = [];
  const outputFile = path.join(__dirname, "results_2024.csv");

  // CSV 헤더 작성
  fs.writeFileSync(outputFile, "BIB_NO,Gender,Event,Time\n");

  for (let bibNo = 1; bibNo < 10000; bibNo++) {
    const record = await scrapeRecord(bibNo);

    // CSV 행 작성
    const csvLine = `${record.bibNo},${record.gender},${record.event},${record.time}\n`;
    fs.appendFileSync(outputFile, csvLine);

    // 진행상황 출력
    if (bibNo % 100 === 0) {
      console.log(`Processed ${bibNo} records...`);
    }

    // 서버 부하를 줄이기 위한 딜레이
    await delay(500);
  }

  console.log("Scraping completed!");
}

main().catch(console.error);
