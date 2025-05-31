#!/usr/bin/env node

import axios from "axios";
import * as fs from "fs";
import * as path from "path";
import { Command } from "commander";

type Record = {
  BIB_NO: number;
  Gender: string;
  Event: string;
  Time: string;
  Status: string;
  StartTime?: string;
  FinishTime?: string;
  Competition?: string;
  Name?: string;
  Pace?: string;
  Speed?: string;
  A_rank?: string;
  G_rank?: string;
  O_rank?: string;
  Sa?: string;
  KOM_NAME?: string;
  KOM_TIME?: string;
  DOWN_SPEED_NAME?: string;
  DOWN_SPEED_TIME?: string;
  CP_01_TOD?: string;
  CP_01_TIME?: string;
  CP_01_NAME?: string;
  CP_02_TOD?: string;
  CP_02_TIME?: string;
  CP_02_NAME?: string;
  CP_03_TOD?: string;
  CP_03_TIME?: string;
  CP_03_NAME?: string;
  CP_04_TOD?: string;
  CP_04_TIME?: string;
  CP_04_NAME?: string;
  CP_05_TOD?: string;
  CP_05_TIME?: string;
  CP_05_NAME?: string;
};

type MarazoneRecord = {
  Competition: string;
  Bib: string;
  Name: string;
  Division: string;
  Time: string;
  Sex: string;
  Net_start: string;
  Net_finish: string;
  Pace: string;
  Speed: string;
  A_rank: string;
  G_rank: string;
  O_rank: string;
  Sa: string;
  KOM_NAME: string;
  KOM_TIME: string;
  DOWN_SPEED_NAME: string;
  DOWN_SPEED_TIME: string;
  CP_01_TOD: string;
  CP_01_TIME: string;
  CP_01_NAME: string;
  CP_02_TOD: string;
  CP_02_TIME: string;
  CP_02_NAME: string;
  CP_03_TOD: string;
  CP_03_TIME: string;
  CP_03_NAME: string;
  CP_04_TOD: string;
  CP_04_TIME: string;
  CP_04_NAME: string;
  CP_05_TOD: string;
  CP_05_TIME: string;
  CP_05_NAME: string;
};

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function scrapeRecord(
  location: string,
  year: string,
  bibNo: number
): Promise<Record> {
  const url = "http://54.180.176.16/api/record-info";
  const headers = {
    Accept: "application/json, text/plain, */*",
    "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Content-Type": "application/json",
    Origin: "http://54.180.176.16",
    Pragma: "no-cache",
    Referer: "http://54.180.176.16/record",
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
  };

  try {
    const response = await axios.post(
      url,
      {
        comp_title: `${location}그란폰도`,
        bibNum: bibNo.toString(),
        name: "",
      },
      { headers }
    );

    const data = response.data as MarazoneRecord[];

    if (!data || data.length === 0) {
      return {
        BIB_NO: bibNo,
        Gender: "",
        Event: "",
        Time: "",
        Status: "",
      };
    }

    const record = data[0];
    const hasStartTime = record.Net_start && record.Net_start !== "-";
    const hasFinishTime = record.Net_finish && record.Net_finish !== "-";
    const hasTime = record.Time && record.Time !== "-";

    let status = "";
    if (!hasTime && !hasFinishTime) {
      status = hasStartTime ? "DNF" : "DNS";
    }

    return {
      BIB_NO: parseInt(record.Bib),
      Gender: record.Sex,
      Event: record.Division,
      Time: record.Time,
      Status: status,
      StartTime: record.Net_start,
      FinishTime: record.Net_finish,
      Competition: record.Competition,
      Name: record.Name,
      Pace: record.Pace,
      Speed: record.Speed,
      A_rank: record.A_rank,
      G_rank: record.G_rank,
      O_rank: record.O_rank,
      Sa: record.Sa,
      KOM_NAME: record.KOM_NAME,
      KOM_TIME: record.KOM_TIME,
      DOWN_SPEED_NAME: record.DOWN_SPEED_NAME,
      DOWN_SPEED_TIME: record.DOWN_SPEED_TIME,
      CP_01_TOD: record.CP_01_TOD,
      CP_01_TIME: record.CP_01_TIME,
      CP_01_NAME: record.CP_01_NAME,
      CP_02_TOD: record.CP_02_TOD,
      CP_02_TIME: record.CP_02_TIME,
      CP_02_NAME: record.CP_02_NAME,
      CP_03_TOD: record.CP_03_TOD,
      CP_03_TIME: record.CP_03_TIME,
      CP_03_NAME: record.CP_03_NAME,
      CP_04_TOD: record.CP_04_TOD,
      CP_04_TIME: record.CP_04_TIME,
      CP_04_NAME: record.CP_04_NAME,
      CP_05_TOD: record.CP_05_TOD,
      CP_05_TIME: record.CP_05_TIME,
      CP_05_NAME: record.CP_05_NAME,
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
  endBib: number = 9999,
  period: number = 200 // 1초에 5번 호출 = 200ms 간격
): Promise<void> {
  const outputFile = path.join(__dirname, `${location}_${year}.json`);
  const records: Record[] = [];

  console.log(
    `Starting to scrape ${location} Granfondo ${year} from bib #${startBib} to #${endBib}`
  );
  console.log(`Results will be saved to: ${outputFile}`);
  console.log(
    `API call period: ${period}ms (${1000 / period} calls per second)`
  );

  // Create initial empty file
  fs.writeFileSync(outputFile, JSON.stringify(records, null, 2));

  for (let bibNo = startBib; bibNo <= endBib; bibNo++) {
    const apiStart = Date.now();
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

    const fetchAndWriteFileDuration = Date.now() - apiStart;
    const delayMs = Math.max(0, period - fetchAndWriteFileDuration);
    await delay(delayMs);
  }

  console.log(`Scraping completed for ${location} ${year}!`);
}

async function main() {
  const program = new Command();

  program
    .name("marazone-crawler")
    .description("Crawl Marazone Granfondo results")
    .argument("<location>", "Location of the event (e.g., 트렉가평자라섬)")
    .argument("[year]", "Year of the event (e.g., 2024)")
    .argument("[startBib]", "Starting bib number", (val) => parseInt(val, 10))
    .argument("[endBib]", "Ending bib number", (val) => parseInt(val, 10))
    .option(
      "-p, --period <number>",
      "API call period in milliseconds (default: 200)",
      (val) => parseInt(val, 10),
      200
    );

  program.parse();

  const options = program.opts();
  const [location, year, startBib = 1, endBib = 9999] = program.args as [
    string,
    string | undefined,
    number,
    number
  ];

  if (year) {
    // If year is specified, scrape only that year
    await scrapeYear(location, year, startBib, endBib, options.period);
  } else {
    // If no year is specified, scrape current year
    const currentYear = new Date().getFullYear().toString();
    await scrapeYear(location, currentYear, startBib, endBib, options.period);
  }
}

if (require.main === module) {
  main().catch(console.error);
}
