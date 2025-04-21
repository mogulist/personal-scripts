import axios from "axios";
import * as cheerio from "cheerio";
import * as fs from "fs";
import * as path from "path";

interface Record {
  bibNo: number;
  gender: string;
  event: string;
  time: string;
  status: string; // DNF 상태를 저장할 필드 추가
  shouldSave: boolean;
}

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatTime(timeStr: string): string {
  if (!timeStr) return "";
  return timeStr.split(".")[0];
}

async function scrapeRecord(bibNo: number): Promise<Record> {
  const bibStr = bibNo.toString().padStart(6, "0");
  const url = `http://time.spct.co.kr/m2.php?EVENT_NO=2024042803&TargetYear=2024&currentPage=1&BIB_NO=${bibStr}`;

  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    if (
      response.data.includes("데이터가 없습니다") ||
      response.data.includes("No Results")
    ) {
      return {
        bibNo,
        gender: "",
        event: "",
        time: "",
        status: "",
        shouldSave: false,
      };
    }

    const playerInfoElement = $("p.name span");
    const playerInfoText = playerInfoElement.text().trim();

    const categoryMatch = playerInfoText.match(/([MF]) (그란폰도|메디오폰도)/);

    const gender = categoryMatch ? categoryMatch[1] : "";
    const event = categoryMatch ? categoryMatch[2] : "";

    let time = "";
    let status = "";
    const timeElement = $("div.record div.time");
    if (timeElement.length > 0) {
      time = formatTime(timeElement.text().trim());
    }

    const startTimeElement = $("div.record p").filter((_, el) =>
      $(el).text().includes("Start Time")
    );
    if (startTimeElement.length > 0 && !time) {
      time = ""; // 시간 필드는 비우고
      status = "DNF"; // 상태 필드에 DNF 표시
    }

    return {
      bibNo,
      gender,
      event,
      time,
      status,
      shouldSave: true,
    };
  } catch (error) {
    console.error(`Error processing BIB #${bibNo}:`, error);
    return {
      bibNo,
      gender: "",
      event: "",
      time: "",
      status: "",
      shouldSave: false,
    };
  }
}

async function main() {
  const startBib = parseInt(process.argv[2]) || 105;
  const endBib = parseInt(process.argv[3]) || 106;

  const outputFile = path.join(__dirname, "results_2024.csv");
  fs.writeFileSync(outputFile, "BIB_NO,Gender,Event,Time,Status\n");

  for (let bibNo = startBib; bibNo <= endBib; bibNo++) {
    const record = await scrapeRecord(bibNo);

    // 항상 콘솔에는 출력
    console.log(
      `${record.bibNo},${record.gender},${record.event},${record.time},${record.status}`
    );

    // shouldSave가 true인 경우에만 CSV에 기록
    if (record.shouldSave) {
      const csvLine = `${record.bibNo},${record.gender},${record.event},${record.time},${record.status}\n`;
      fs.appendFileSync(outputFile, csvLine);
    }

    await delay(500);
  }

  console.log("Scraping completed!");
}

main().catch(console.error);
