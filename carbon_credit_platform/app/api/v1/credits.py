from fastapi import APIRouter

router = APIRouter(prefix="/credits", tags=["credits"])

@router.get("/")
async def get_credits():
    """Get all credits"""
    return {"message": "Credits endpoint - not implemented yet"}
