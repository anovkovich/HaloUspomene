import os
from dotenv import load_dotenv  
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base

# 1. ASYNC URL (For FastAPI)
# Note the "postgresql+asyncpg" prefix
DATABASE_URL = "postgresql+asyncpg://admin:password123@localhost:5432/myapp_db"

load_dotenv()
database_url = os.getenv("DATABASE_URL")

if not database_url:
    raise ValueError("DATABASE_URL is not set in .env file")

if database_url.startswith("postgresql://"):
    database_url = database_url.replace("postgresql://", "postgresql+asyncpg://", 1)


engine = create_async_engine(database_url, echo=True)

async_session = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

Base = declarative_base()

async def get_db():
    async with async_session() as session:
        yield session