#!/usr/bin/env python
"""System health check for NeuroNex"""
import sqlite3
import os
import sys

print("\n" + "="*60)
print("🏥 NeuroNex System Health Check")
print("="*60)

# 1. Check Database
db_path = 'neuronex.db'
if os.path.exists(db_path):
    print(f"\n✅ Database exists: {db_path}")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;")
    tables = cursor.fetchall()
    print(f"✅ Tables found: {len(tables)}")
    for table in tables:
        print(f"   - {table[0]}")
    
    # Check users
    cursor.execute('SELECT COUNT(*) FROM users')
    user_count = cursor.fetchone()[0]
    print(f"\n✅ Users in database: {user_count}")
    
    if user_count > 0:
        cursor.execute('SELECT id, name, phone, role FROM users')
        users = cursor.fetchall()
        for user in users:
            print(f"   - ID {user[0]}: {user[1]} ({user[2]}) - Role: {user[3]}")
    
    # Check vitals
    cursor.execute('SELECT COUNT(*) FROM health_vitals')
    vitals_count = cursor.fetchone()[0]
    print(f"\n✅ Health Vitals in database: {vitals_count}")
    
    # Check caregiver links
    cursor.execute('SELECT COUNT(*) FROM caregiver_links')
    links_count = cursor.fetchone()[0]
    print(f"✅ Caregiver Links in database: {links_count}")
    
    if links_count > 0:
        cursor.execute('SELECT elder_id, caregiver_id FROM caregiver_links')
        links = cursor.fetchall()
        for link in links:
            cursor.execute('SELECT name FROM users WHERE id = ?', (link[0],))
            elder_name = cursor.fetchone()[0]
            cursor.execute('SELECT name FROM users WHERE id = ?', (link[1],))
            caregiver_name = cursor.fetchone()[0]
            print(f"   - {caregiver_name} → {elder_name}")
    
    conn.close()
else:
    print(f"\n❌ Database not found: {db_path}")
    sys.exit(1)

# 2. Check environment variables
print("\n" + "-"*60)
print("Environment Variables:")
print("-"*60)
env_vars = ['GEMINI_API_KEY', 'DATABASE_URL']
for var in env_vars:
    value = os.getenv(var)
    if value:
        masked = value[:10] + "***" if len(value) > 10 else value
        print(f"✅ {var}: {masked}")
    else:
        print(f"❌ {var}: NOT SET")

# 3. Check imports
print("\n" + "-"*60)
print("Python Dependencies:")
print("-"*60)
deps = {
    'fastapi': 'FastAPI',
    'sqlalchemy': 'SQLAlchemy',
    'whisper': 'Whisper (Speech-to-Text)',
    'google.generativeai': 'Google Generative AI',
    'gtts': 'gTTS (Text-to-Speech)',
    'bcrypt': 'bcrypt',
}

for module, name in deps.items():
    try:
        __import__(module)
        print(f"✅ {name}")
    except ImportError:
        print(f"❌ {name} - NOT INSTALLED")

print("\n" + "="*60)
print("✅ System Health Check Complete!")
print("="*60 + "\n")
