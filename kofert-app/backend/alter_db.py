from sqlalchemy import create_engine, text

# Uses the same connection string as the .env
DATABASE_URL = "mysql+pymysql://root:%40123Aa123%40@localhost:3306/kofert_db"
engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    try:
        conn.execute(text("ALTER TABLE resultats ADD COLUMN photo_url TEXT;"))
        conn.commit()
        print("Column photo_url added successfully!")
    except Exception as e:
        print(f"Error (column might already exist): {e}")
