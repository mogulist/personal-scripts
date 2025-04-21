# 비디오 파일 타임스탬프 조정 스크립트

이 디렉토리에는 macOS에서 비디오 파일의 타임스탬프를 조정하는 스크립트가 포함되어 있습니다.

## 파일 설명

### ts-offset.py

- 단일 파일의 타임스탬프를 조정하는 스크립트
- `SetFile`과 `touch` 명령어를 모두 사용하여 파일의 생성 시간과 수정 시간을 조정
- 파일 이름이 `VID_YYYYMMDD_HHMMSS_XX_XXX.mp4` 형식이어야 함
- 사용자가 지정한 초 단위의 오프셋만큼 타임스탬프를 조정
- 예: 30초 앞으로 이동, 1시간 뒤로 이동 등

### ts-batch-update.py

- 디렉토리 내의 모든 비디오 파일(`VID_*.mp4`)의 타임스탬프를 한 번에 업데이트
- 파일 이름의 날짜와 시간 정보를 그대로 타임스탬프로 설정
- `touch`와 `SetFile` 명령어를 모두 사용
- 오프셋 없이 파일 이름의 시간을 그대로 타임스탬프로 설정

### sptc-crawler.ts

- SPTC(스포츠타이밍) 웹사이트에서 그란폰도 대회 결과를 크롤링하는 스크립트
- 대회 위치, 연도, 시작 번호, 끝 번호를 지정하여 특정 범위의 참가자 기록을 수집
- 결과는 CSV 파일로 저장되며, BIB_NO, Gender, Event, Time, Status 정보를 포함
- DNF(미완주) 상태를 별도 컬럼으로 관리하여 시간 데이터 처리 용이성 향상
- 2025년 홍천 그란폰도 등 다양한 대회 정보를 `consts.ts`에서 관리

## 사용 방법

각 스크립트는 다음과 같이 실행할 수 있습니다:

```bash
python3 ts-offset.py  # 단일 파일 타임스탬프 조정 (오프셋 적용)
python3 ts-batch-update.py  # 디렉토리 내 모든 파일 타임스탬프 업데이트 (파일 이름 기준)
npx ts-node sptc-crawler.ts <location> <year> <start_bib> <end_bib>  # 그란폰도 결과 크롤링
```

### sptc-crawler.ts 사용 예시

```bash
# 2025년 홍천 그란폰도 1~9999번 크롤링
npx ts-node sptc-crawler.ts 홍천 2025 1 9999

# 2023년 홍천 그란폰도 8000~8100번 크롤링
npx ts-node sptc-crawler.ts 홍천 2023 8000 8100
```

결과는 `results_홍천_2025.csv`와 같은 형식의 파일명으로 저장됩니다.

## 요구사항

- macOS 운영체제
- Python 3
- `SetFile` 명령어 (macOS 기본 제공)
- Node.js 및 TypeScript (sptc-crawler.ts 실행 시)
