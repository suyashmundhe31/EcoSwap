from fastapi import APIRouter

router = APIRouter(prefix="/projects", tags=["projects"])

@router.get("/")
async def get_projects():
    """Get all projects"""
    return {"message": "Projects endpoint - not implemented yet"}
