import json

def convert_data():
    # Read the JSON file
    with open('설악_2025.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Process each record
    for record in data:
        if record['Event'] == '코스제외자':
            record['Comment'] = '코스제외자'
            record['Event'] = '그란폰도'
            record['Status'] = 'DNF'
    
    # Write back to the file
    with open('설악_2025.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

if __name__ == '__main__':
    convert_data() 