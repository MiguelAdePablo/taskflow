import sqlite3
import os

# Ruta correcta de la base de datos
db_path = 'instance/taskflow.db'

if os.path.exists(db_path):
    print(f"✅ Base de datos encontrada en: {db_path}")
    print(f"📏 Tamaño: {os.path.getsize(db_path)} bytes\n")
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Listar todas las tablas
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    
    print(f"📊 Tablas encontradas: {len(tables)}")
    for table in tables:
        print(f"  - {table[0]}")
    
    # Contar registros en cada tabla
    print("\n📈 Registros por tabla:")
    for table in tables:
        table_name = table[0]
        if table_name != 'alembic_version':  # Esta es interna de Flask-Migrate
            cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
            count = cursor.fetchone()[0]
            print(f"  {table_name}: {count} registros")
    
    conn.close()
else:
    print(f"❌ No se encontró la base de datos en: {db_path}")