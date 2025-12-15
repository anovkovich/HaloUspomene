from sqlmodel import SQLModel

class User(SQLModel):

    class Config:
        from_attributes = True

