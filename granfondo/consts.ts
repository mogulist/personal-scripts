interface EventInfo {
  eventNo: string;
  year: string;
  name: string;
}

export const EVENTS: { [key: string]: { [key: string]: EventInfo } } = {
  홍천: {
    "2023": {
      eventNo: "2023041602",
      year: "2023",
      name: "홍천그란폰도",
    },
    "2024": {
      eventNo: "2024042803",
      year: "2024",
      name: "홍천그란폰도",
    },
    "2025": {
      eventNo: "2025041903",
      year: "2025",
      name: "홍천그란폰도",
    },
  },
};

export function getEventInfo(location: string, year: string): EventInfo | null {
  return EVENTS[location]?.[year] || null;
}

export function generateUrl(eventInfo: EventInfo, bibNo: number): string {
  const bibStr = bibNo.toString().padStart(6, "0");
  // 2025년은 https를 사용
  const protocol = eventInfo.year === "2025" ? "https" : "http";
  return `${protocol}://time.spct.kr/m2.php?EVENT_NO=${eventInfo.eventNo}&TargetYear=${eventInfo.year}&currentPage=1&BIB_NO=${bibStr}`;
}
