interface EventInfo {
  eventNo: string;
  year: string;
  name: string;
}

export const EVENTS: { [key: string]: { [key: string]: EventInfo } } = {
  홍천: {
    "2022": {
      eventNo: "2022090403",
      year: "2022",
      name: "홍천그란폰도",
    },
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
  양양: {
    "2024": {
      eventNo: "2024042701",
      year: "2024",
      name: "양양그란폰도",
    },
    "2025": {
      eventNo: "2025042601",
      year: "2025",
      name: "양양그란폰도",
    },
  },
  설악: {
    "2022": {
      eventNo: "2022061801",
      year: "2022",
      name: "설악그란폰도",
    },
    "2023": {
      eventNo: "2023052001",
      year: "2023",
      name: "설악그란폰도",
    },
    "2024": {
      eventNo: "2024051801",
      year: "2024",
      name: "설악그란폰도",
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

  // 모든 이벤트에 대해 새로운 URL 형식 사용 (E와 B 파라미터)
  return `${protocol}://time.spct.kr/m2.php?E=${eventInfo.eventNo}&B=${bibStr}`;
}
