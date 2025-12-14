from pydantic import BaseModel, EmailStr

# What we receive for Signup
class UserCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str

# What we receive for Login
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# What we return (The User without the password)
class UserResponse(BaseModel):
    id: int
    email: str
    first_name: str
    last_name: str
    is_active: bool

    class Config:
        from_attributes = True # Allows SQLAlchemy models to be converted to Pydantic

# Token Response
class Token(BaseModel):
    access_token: str
    token_type: str