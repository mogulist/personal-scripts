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
  영산강: {
    "2025": {
      eventNo: "2025042604",
      year: "2025",
      name: "영산강그란폰도",
    },
    "2024": {
      eventNo: "2024051103",
      year: "2024",
      name: "영산강그란폰도",
    },
    "2023": {
      eventNo: "2023052801",
      year: "2023",
      name: "영산강그란폰도",
    },
  },
  공룡: {
    "2025": {
      eventNo: "2025032901",
      year: "2025",
      name: "공룡나라 그란폰도",
    },
    "2024": {
      eventNo: "2024033001",
      year: "2024",
      name: "공룡나라 그란폰도",
    },
  },
  화천: {
    "2024": {
      eventNo: "2024051204",
      year: "2024",
      name: "화천DMZ 렐리",
    },
  },
  정읍내장산: {
    "2024": {
      eventNo: "2024052601",
      year: "2024",
      name: "정읍내장산 그란폰도",
    },
    "2023": {
      eventNo: "2023062502",
      year: "2023",
      name: "정읍내장산 그란폰도",
    },
  },
  섬섬영수: {
    "2023": {
      eventNo: "2023111802",
      year: "2023",
      name: "섬섬여수 그란폰도",
    },
    "2022": {
      eventNo: "2022112003",
      year: "2022",
      name: "섬섬여수 그란폰도",
    },
  },
  삼척: {
    "2024": {
      eventNo: "2024060902",
      year: "2024",
      name: "삼척 그란폰도",
    },
  },
  문경새재: {
    "2024": {
      eventNo: "2024090102",
      year: "2024",
      name: "문경새재 그란폰도",
    },
    "2023": {
      eventNo: "2023090303",
      year: "2023",
      name: "문경새재 그란폰도",
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
