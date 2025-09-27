from fastapi import APIRouter

router = APIRouter(prefix="/bounties", tags=["bounties"])

@router.get("/")
async def get_bounties():
    """Get all bounties"""
    return {"message": "Bounties endpoint - not implemented yet"}
