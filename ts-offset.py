#!/usr/bin/env python3
import os
import datetime
import subprocess
from pathlib import Path

def adjust_timestamp(file_path, offset_seconds):
    # 파일 이름에서 날짜와 시간 추출
    file_name = os.path.basename(file_path)
    try:
        # VID_YYYYMMDD_HHMMSS 형식 확인
        date_str = file_name.split('_')[1]
        time_str = file_name.split('_')[2][:6]  # HHMMSS 부분만 추출

        # 날짜와 시간 파싱
        date_time_str = f"{date_str}{time_str}"
        original_datetime = datetime.datetime.strptime(date_time_str, "%Y%m%d%H%M%S")

        # 오프셋 적용
        adjusted_datetime = original_datetime + datetime.timedelta(seconds=offset_seconds)

        # 타임스탬프 포맷 변환 (touch 명령어용)
        timestamp = adjusted_datetime.strftime("%Y%m%d%H%M.%S")

        # 원본 시간과 조정된 시간 출력
        print(f"\n원본 시간: {original_datetime.strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"조정된 시간: {adjusted_datetime.strftime('%Y-%m-%d %H:%M:%S')}")

        # 파일이 실제로 존재하는지 확인
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"파일을 찾을 수 없습니다: {file_path}")

        # macOS의 SetFile 명령어로 생성 시간 변경
        creation_time = adjusted_datetime.strftime("%m/%d/%Y %H:%M:%S")
        
        # 먼저 SetFile로 생성 시간 수정 시도
        try:
            subprocess.run(["SetFile", "-d", creation_time, file_path], check=True)
            print(f"생성 시간이 성공적으로 업데이트되었습니다: {file_path}")
        except subprocess.CalledProcessError as e:
            print(f"SetFile 명령어 실패: {str(e)}")

        # touch 명령어로 수정 시간 및 접근 시간도 설정
        try:
            subprocess.run(["touch", "-t", timestamp, file_path], check=True)
            print(f"수정 시간이 성공적으로 업데이트되었습니다: {file_path}")
        except subprocess.CalledProcessError as e:
            print(f"touch 명령어 실패: {str(e)}")

        # 확인을 위해 mdls 명령어로 메타데이터 출력
        print("\n업데이트된 메타데이터:")
        subprocess.run(["mdls", "-name", "kMDItemContentCreationDate", "-name", "kMDItemContentModificationDate", file_path])

    except IndexError:
        print("오류: 파일 이름이 올바른 형식이 아닙니다 (VID_YYYYMMDD_HHMMSS_XX_XXX.mp4)")
        return False
    except ValueError as e:
        print(f"오류: 날짜/시간 처리 중 문제가 발생했습니다 - {str(e)}")
        return False
    except subprocess.CalledProcessError as e:
        print(f"오류: 파일 시간 수정 중 문제가 발생했습니다 - {str(e)}")
        return False
    except Exception as e:
        print(f"오류: 예상치 못한 문제가 발생했습니다 - {str(e)}")
        return False

    return True

def main():
    # 파일 경로 입력 받기
    file_path = input("파일 이름과 경로를 입력하세요: ").strip()
    file_path = os.path.expanduser(file_path)  # ~ 확장

    # 오프셋 입력 받기
    while True:
        try:
            offset = int(input("offset을 초 단위로 입력하세요: "))
            break
        except ValueError:
            print("올바른 숫자를 입력해주세요.")

    # 타임스탬프 조정
    adjust_timestamp(file_path, offset)

if __name__ == "__main__":
    main()

