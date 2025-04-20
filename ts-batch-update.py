import os
import datetime
import subprocess
from pathlib import Path

def update_file_timestamp(file_path):
    # 파일 이름에서 날짜와 시간 추출
    file_name = os.path.basename(file_path)
    
    # 파일명에서 날짜/시간 부분 추출 (PRO_VID_ 또는 VID_ 이후 부분)
    if file_name.startswith('PRO_VID_'):
        parts = file_name.split('PRO_VID_')[1].split('_')
    else:  # VID_ 로 시작하는 경우
        parts = file_name.split('VID_')[1].split('_')
    
    date_time_str = parts[0] + parts[1]  # YYYYMMDDHHMMSS 형식으로 조합
    date_time_obj = datetime.datetime.strptime(date_time_str, "%Y%m%d%H%M%S")
    
    # 타임스탬프 포맷 변환
    timestamp = date_time_obj.strftime("%Y%m%d%H%M.%S")
    
    # touch 명령어를 사용하여 파일 타임스탬프 업데이트 (접근 시간, 수정 시간, 생성 시간)
    subprocess.run(["touch", "-a", "-m", "-t", timestamp, file_path])
    subprocess.run(["SetFile", "-d", date_time_obj.strftime("%m/%d/%Y %H:%M:%S"), file_path])
    print(f"Updated timestamp for {file_path}")

def process_directory(directory):
    expanded_path = os.path.expanduser(directory)
    # 대소문자 구분 없이 VID_ 와 PRO_VID_ 파일 검색
    for file_path in Path(expanded_path).glob("*VID_*.[mM][pP]4"):
        update_file_timestamp(str(file_path))

if __name__ == "__main__":
    directory = input("Enter the directory path containing the video files: ")
    process_directory(directory)
    print("Timestamp update process completed.")
