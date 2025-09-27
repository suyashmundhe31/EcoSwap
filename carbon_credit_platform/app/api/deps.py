from fastapi import HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User

def get_current_user(db: Session = Depends(get_db)) -> User:
    """
    Mock authentication dependency that returns a default user.
    In a real application, this would validate JWT tokens and return the authenticated user.
    """
    # For now, return a mock user with ID 1
    # In production, this should:
    # 1. Extract JWT token from Authorization header
    # 2. Validate the token
    # 3. Get user from database based on token payload
    # 4. Return the user or raise HTTPException if invalid
    
    user = db.query(User).filter(User.id == 1).first()
    if not user:
        # Create a default user if none exists
        user = User(
            id=1,
            email="admin@example.com",
            username="admin",
            hashed_password="hashed_password_placeholder",
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    
    return user
