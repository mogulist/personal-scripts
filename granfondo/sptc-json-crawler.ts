#!/usr/bin/env node

import { getEventInfo, EVENTS, generateUrl } from "./consts";
import axios from "axios";
import * as cheerio from "cheerio";
import * as fs from "fs";
import * as path from "path";

interface Record {
  BIB_NO: number;
  Gender: string;
  Event: string;
  Time: string;
  Status: string;
}

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatTime(timeStr: string): string {
  if (!timeStr) return "";
  return timeStr.split(".")[0];
}

async function scrapeRecord(
  location: string,
  year: string,
  bibNo: number
): Promise<Record> {
  const eventInfo = getEventInfo(location, year);
  if (!eventInfo) {
    throw new Error(`Invalid location or year: ${location} ${year}`);
  }

  const url = generateUrl(eventInfo, bibNo);

  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    // 데이터가 없는 경우 빈 레코드 반환 (콘솔에 표시하기 위해)
    if (
      response.data.includes("데이터가 없습니다") ||
      response.data.includes("No Results")
    ) {
      return {
        BIB_NO: bibNo,
        Gender: "",
        Event: "",
        Time: "",
        Status: "",
      };
    }

    const playerInfoElement = $("p.name span");
    const playerInfoText = playerInfoElement.text().trim();

    const categoryMatch = playerInfoText.match(/([MF]) (그란폰도|메디오폰도)/);

    const gender = categoryMatch ? categoryMatch[1] : "";
    const event = categoryMatch ? categoryMatch[2] : "";

    let time = "";
    let status = "";

    // 먼저 기록이 있는지 확인
    const timeElement = $("div.record div.time");
    if (timeElement.length > 0) {
      const recordTime = timeElement.text().trim();
      if (recordTime && recordTime !== "") {
        time = formatTime(recordTime);
      }
    }

    // 기록이 없는 경우 Start Time을 확인하여 DNS/DNF 구분
    if (!time) {
      const startTimeText = $("div.record p")
        .filter((_, el) => $(el).text().includes("Start Time"))
        .text()
        .trim();

      // Start Time이 있는지 확인 (실제 시간 값이 있는지 체크)
      const hasStartTime =
        startTimeText.includes(":") && startTimeText.split(":").length > 1;

      if (hasStartTime) {
        // Start Time은 있지만 기록이 없으면 DNF
        status = "DNF";
      } else {
        // Start Time도 없으면 DNS
        status = "DNS";
      }
    }

    return {
      BIB_NO: bibNo,
      Gender: gender,
      Event: event,
      Time: time,
      Status: status,
    };
  } catch (error) {
    console.error(`Error processing BIB #${bibNo}:`, error);
    return {
      BIB_NO: bibNo,
      Gender: "",
      Event: "",
      Time: "",
      Status: "",
    };
  }
}

async function scrapeYear(
  location: string,
  year: string,
  startBib: number = 1,
  endBib: number = 9999
): Promise<void> {
  const eventInfo = getEventInfo(location, year);
  if (!eventInfo) {
    console.error(`Invalid location or year: ${location} ${year}`);
    return;
  }

  const outputFile = path.join(__dirname, `${location}_${year}.json`);
  const records: Record[] = [];

  console.log(
    `Starting to scrape ${location} Granfondo ${year} from bib #${startBib} to #${endBib}`
  );
  console.log(`Results will be saved to: ${outputFile}`);

  // Create initial empty file
  fs.writeFileSync(outputFile, JSON.stringify(records, null, 2));

  for (let bibNo = startBib; bibNo <= endBib; bibNo++) {
    const record = await scrapeRecord(location, year, bibNo);

    // 항상 콘솔에 표시
    console.log(
      `${record.BIB_NO},${record.Gender},${record.Event},${record.Time},${record.Status}`
    );

    // 파일에는 조건을 만족하는 레코드만 저장
    if (record.Time || record.Status) {
      records.push(record);
      // Save to file after each record
      fs.writeFileSync(outputFile, JSON.stringify(records, null, 2));
    }

    await delay(500);
  }

  console.log(`Scraping completed for ${location} ${year}!`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error(
      "Usage: npx ts-node sptc-json-crawler.ts <location> [year] [start_bib] [end_bib]"
    );
    console.error("Example: npx ts-node sptc-json-crawler.ts 영산강");
    console.error("Example: npx ts-node sptc-json-crawler.ts 영산강 2024");
    console.error(
      "Example: npx ts-node sptc-json-crawler.ts 영산강 2024 1 2000"
    );
    process.exit(1);
  }

  const location = args[0];
  const year = args[1];
  const startBib = args[2] ? parseInt(args[2]) : 1;
  const endBib = args[3] ? parseInt(args[3]) : 9999;

  if (!EVENTS[location]) {
    console.error(`Invalid location: ${location}`);
    process.exit(1);
  }

  if (year) {
    // If year is specified, scrape only that year
    await scrapeYear(location, year, startBib, endBib);
  } else {
    // If no year is specified, scrape all available years
    const years = Object.keys(EVENTS[location]);
    for (const year of years) {
      await scrapeYear(location, year);
    }
  }
}

main().catch(console.error);
