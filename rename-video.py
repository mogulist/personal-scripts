#!/usr/bin/env python3
import os
import re
from pathlib import Path

def rename_video_files(directory):
    # 디렉토리 경로 확장
    expanded_path = os.path.expanduser(directory)
    
    # VID_*.mp4 패턴의 파일 찾기
    video_files = list(Path(expanded_path).glob("VID_*.mp4"))
    
    if not video_files:
        print(f"'{directory}' 디렉토리에서 VID_*.mp4 파일을 찾을 수 없습니다.")
        return
    
    print(f"총 {len(video_files)}개의 파일을 찾았습니다.")
    
    # 각 파일에 대해 이름 변경
    for file_path in video_files:
        old_name = file_path.name
        
        # VID_YYYYMMDD_ 패턴 제거
        new_name = re.sub(r'^VID_\d{8}_', '', old_name)
        
        if new_name == old_name:
            print(f"'{old_name}' 파일은 이미 올바른 형식입니다.")
            continue
            
        new_path = file_path.parent / new_name
        
        try:
            file_path.rename(new_path)
            print(f"변경 완료: {old_name} -> {new_name}")
        except Exception as e:
            print(f"'{old_name}' 파일 이름 변경 중 오류 발생: {str(e)}")
    
    print("\n모든 파일 이름 변경이 완료되었습니다.")

def main():
    # 디렉토리 경로 입력 받기
    directory = input("비디오 파일이 있는 디렉토리 경로를 입력하세요: ").strip()
    
    # 디렉토리가 존재하는지 확인
    if not os.path.exists(directory):
        print(f"오류: '{directory}' 디렉토리를 찾을 수 없습니다.")
        return
    
    # 사용자 확인
    print(f"\n'{directory}' 디렉토리의 모든 VID_*.mp4 파일의 이름을 변경합니다.")
    print("예: VID_20250329_192104_00_022_1.mp4 -> 192104_00_022_1.mp4")
    confirm = input("계속하시겠습니까? (y/n): ").strip().lower()
    
    if confirm == 'y':
        rename_video_files(directory)
    else:
        print("작업이 취소되었습니다.")

if __name__ == "__main__":
    main() 