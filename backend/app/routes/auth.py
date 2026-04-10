from fastapi import APIRouter
from app.schemas.user import UserSignup, UserLogin
from app.models.user import create_user, get_user_by_username
import bcrypt

router = APIRouter()

@router.post("/signup")
def signup(user: UserSignup):
    # Check if user already exists
    existing_user = get_user_by_username(user.username)
    if existing_user:
        return {"success": False, "message": "Account already exists. Please log in."}
    
    # Hash the password
    password_hash = bcrypt.hashpw(
        user.password.encode('utf-8'), 
        bcrypt.gensalt()
    ).decode('utf-8')
    
    # Save to database
    result = create_user(user.username, user.email, password_hash)
    return result

@router.post("/login")
def login(user: UserLogin):
    # Find user in database
    existing_user = get_user_by_username(user.username)
    if not existing_user:
        return {"success": False, "message": "Invalid username or password."}
    
    # Check password
    password_match = bcrypt.checkpw(
        user.password.encode('utf-8'),
        existing_user['password_hash'].encode('utf-8')
    )
    
    if not password_match:
        return {"success": False, "message": "Invalid username or password."}
    
    return {
        "success": True,
        "message": "Login successful!",
        "user": {
            "id": existing_user['id'],
            "username": existing_user['username'],
            "email": existing_user['email']
        }
    }