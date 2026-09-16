import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy.engine import make_url

BASE_DIR = Path(__file__).resolve().parent

env_path = BASE_DIR / ".env"

print("ENV file exists:", env_path.exists())

load_dotenv(env_path, override=True)

database_url = os.getenv("DATABASE_URL")

if not database_url:
    print("DATABASE_URL NOT FOUND")
else:
    try:
        url = make_url(database_url)

        print("Driver:", url.drivername)
        print("Username:", url.username)
        print("Host:", url.host)
        print("Port:", url.port)
        print("Database:", url.database)

    except Exception as error:
        print("URL FORMAT ERROR:", error)