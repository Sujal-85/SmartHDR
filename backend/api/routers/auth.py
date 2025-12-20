from fastapi import APIRouter, HTTPException, Depends, Response, Request
from pydantic import BaseModel, EmailStr
from modules.database import get_database
from modules.auth import get_password_hash, verify_password, create_access_token, decode_access_token
from datetime import datetime
import json
import uuid
import os

router = APIRouter()

class UserSignup(BaseModel):
    email: EmailStr
    password: str
    fullName: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserGoogleLogin(BaseModel):
    token: str
    email: EmailStr
    fullName: str
    avatar: str = None

class UpdateAvatar(BaseModel):
    avatar: str  # Base64 encoded image

@router.post("/signup")
async def signup(user: UserSignup):
    db = get_database()
    # Check if user exists
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="User already registered")
    
    user_dict = {
        "userId": str(uuid.uuid4()),
        "email": user.email,
        "password": get_password_hash(user.password),
        "fullName": user.fullName,
        "createdAt": datetime.utcnow()
    }
    await db.users.insert_one(user_dict)
    return {"message": "User created successfully"}

@router.post("/login")
async def login(response: Response, user: UserLogin):
    db = get_database()
    db_user = await db.users.find_one({"email": user.email})
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token({"sub": db_user["userId"], "email": db_user["email"]})
    
    # User data for frontend hydration (non-sensitive)
    user_data = {
        "userId": db_user["userId"],
        "email": db_user["email"],
        "fullName": db_user.get("fullName"),
        "avatar": db_user.get("avatar")
    }
    import json
    user_data_str = json.dumps(user_data)

    # Production cookie settings
    is_prod = os.getenv("RENDER") is not None or os.getenv("NODE_ENV") == "production"
    
    # Set HTTP-only cookie for auth
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        max_age=3600 * 24 * 7, # 1 week
        samesite="none" if is_prod else "lax",
        secure=is_prod,
        margin="0" # Not a standard arg, removing
    )


    # Set readable cookie for user data
    response.set_cookie(
        key="user_data",
        value=user_data_str,
        httponly=False,
        max_age=3600 * 24 * 7,
        samesite="none" if is_prod else "lax",
        secure=is_prod
    )
    
    return {
        "user": user_data
    }

@router.post("/google")
async def google_login(response: Response, user: UserGoogleLogin):
    db = get_database()
    print(f"DEBUG: Processing Google Login for {user.email}")
    
    db_user = await db.users.find_one({"email": user.email})
    
    if not db_user:
        print(f"DEBUG: Creating new Google user: {user.email}")
        db_user = {
            "userId": str(uuid.uuid4()),
            "email": user.email,
            "fullName": user.fullName,
            "avatar": user.avatar,
            "provider": "google",
            "createdAt": datetime.utcnow()
        }
        await db.users.insert_one(db_user)
    else:
        print(f"DEBUG: Existing Google user found: {user.email}")
        await db.users.update_one(
            {"email": user.email},
            {"$set": {"fullName": user.fullName, "avatar": user.avatar, "lastLogin": datetime.utcnow()}}
        )
    
    token = create_access_token({"sub": db_user["userId"], "email": db_user["email"]})
    print(f"DEBUG: Created token for {db_user['userId']}")
    
    user_data = {
        "userId": db_user["userId"],
        "email": db_user["email"],
        "fullName": db_user.get("fullName"),
        "avatar": db_user.get("avatar")
    }
    user_data_str = json.dumps(user_data)

    # Production cookie settings
    is_prod = os.getenv("RENDER") is not None or os.getenv("NODE_ENV") == "production"

    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        max_age=3600 * 24 * 7,
        samesite="none" if is_prod else "lax",
        secure=is_prod
    )

    response.set_cookie(
        key="user_data",
        value=user_data_str,
        httponly=False,
        max_age=3600 * 24 * 7,
        samesite="none" if is_prod else "lax",
        secure=is_prod
    )
    
    return {
        "user": user_data
    }

@router.post("/logout")
async def logout(response: Response):
    print("DEBUG: Processing Logout")
    response.delete_cookie("access_token")
    response.delete_cookie("user_data")
    return {"message": "Logged out"}

@router.get("/me")
async def get_me(request: Request):
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    db = get_database()
    db_user = await db.users.find_one({"userId": payload["sub"]})
    if not db_user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return {
        "userId": db_user["userId"],
        "email": db_user["email"],
        "fullName": db_user.get("fullName"),
        "avatar": db_user.get("avatar")
    }

@router.post("/update-avatar")
async def update_avatar(request: Request, data: UpdateAvatar):
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    db = get_database()
    result = await db.users.update_one(
        {"userId": payload["sub"]},
        {"$set": {"avatar": data.avatar, "updatedAt": datetime.utcnow()}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "Avatar updated successfully", "avatar": data.avatar}
