import os
import datetime
import subprocess
from pathlib import Path

def update_file_timestamp(file_path):
    # 파일 이름에서 날짜와 시간 추출
    file_name = os.path.basename(file_path)
    date_time_str = file_name.split('_')[1] + file_name.split('_')[2]
    
    # 날짜와 시간 파싱
    date_time_obj = datetime.datetime.strptime(date_time_str, "%Y%m%d%H%M%S")
    
    # 타임스탬프 포맷 변환
    timestamp = date_time_obj.strftime("%Y%m%d%H%M.%S")
    
    # touch 명령어를 사용하여 파일 타임스탬프 업데이트 (접근 시간, 수정 시간, 생성 시간)
    subprocess.run(["touch", "-a", "-m", "-t", timestamp, file_path])
    subprocess.run(["SetFile", "-d", date_time_obj.strftime("%m/%d/%Y %H:%M:%S"), file_path])
    print(f"Updated timestamp for {file_path}")

def process_directory(directory):
    expanded_path = os.path.expanduser(directory)
    for file_path in Path(expanded_path).glob("VID_*.mp4"):
        update_file_timestamp(str(file_path))

if __name__ == "__main__":
    directory = input("Enter the directory path containing the video files: ")
    process_directory(directory)
    print("Timestamp update process completed.")
