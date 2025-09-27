from fastapi import APIRouter

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/")
async def get_users():
    """Get all users"""
    return {"message": "Users endpoint - not implemented yet"}
