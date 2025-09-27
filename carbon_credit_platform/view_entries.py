import sqlite3
import os

# Connect to the SQLite database
db_path = os.path.join(os.path.dirname(__file__), "carbon_credits.db")
conn = sqlite3.connect(db_path)
conn.row_factory = sqlite3.Row  # This enables column access by name
cursor = conn.cursor()

def view_table(table_name):
    """Display all entries in a table"""
    print(f"\n=== {table_name.upper()} ===")
    try:
        cursor.execute(f"SELECT * FROM {table_name}")
        rows = cursor.fetchall()
        
        if not rows:
            print(f"No entries found in {table_name}")
            return
            
        # Print column names
        columns = [description[0] for description in cursor.description]
        print(" | ".join(columns))
        print("-" * (sum(len(col) for col in columns) + 3 * len(columns)))
        
        # Print rows
        for row in rows:
            row_values = [str(row[col]) for col in columns]
            print(" | ".join(row_values))
            
    except sqlite3.Error as e:
        print(f"Error accessing {table_name}: {e}")

# View forestation applications
view_table("forestation_applications")

# View solar panel applications
view_table("solar_panel_applications")

# View users
view_table("users")

# Close the connection
conn.close()

print("\nTo run this script again, use: python view_entries.py")