from sqlmodel import SQLModel, Field

class User(SQLModel, table=True):
    id: int = Field(default=None, nullable=False, primary_key=True, index=True)
    first_name: str = Field(default=None, nullable=False)

