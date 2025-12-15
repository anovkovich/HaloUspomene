from fastapi import APIRouter
from .v1 import login

router = APIRouter()

router.include_router(login.router, prefix="/login", tags=["login"])