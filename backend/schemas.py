from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr
from models import UserRole, ReviewStatus


# ── Auth ──────────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: UserRole = UserRole.customer


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: UserRole

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ── Products ──────────────────────────────────────────────────────────────────

class ProductOut(BaseModel):
    id: int
    name: str
    description: Optional[str]
    image_url: Optional[str]
    average_rating: float
    total_reviews: int

    class Config:
        from_attributes = True


# ── Reviews ───────────────────────────────────────────────────────────────────

class ReviewCreate(BaseModel):
    product_id: int
    rating: int          # 1-5
    review_text: Optional[str] = None


class ReviewOut(BaseModel):
    id: int
    product_id: int
    user_id: int
    rating: int
    review_text: Optional[str]
    status: ReviewStatus
    sentiment_score: float
    created_at: datetime
    user: UserOut

    class Config:
        from_attributes = True


class ReviewStatusUpdate(BaseModel):
    status: ReviewStatus
