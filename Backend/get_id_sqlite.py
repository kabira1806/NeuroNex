import sqlite3

db_path = r"c:\Users\Divyam Gulgulia\.gemini\antigravity\scratch\NeuroNex\Backend\neuronex.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    cursor.execute("SELECT elder_id, caregiver_id FROM caregiver_links;")
    links = cursor.fetchall()
    for elder, care in links:
        print(f"Elder ID: {elder} -> Caretaker ID: {care}")
except Exception as e:
    print(e)
    
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    print("Tables:", cursor.fetchall())
