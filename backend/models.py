import enum
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Text, ForeignKey,
    DateTime, Enum as SAEnum
)
from sqlalchemy.orm import relationship
from database import Base


class UserRole(str, enum.Enum):
    customer = "customer"
    moderator = "moderator"
    manager = "manager"


class ReviewStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(200), unique=True, index=True, nullable=False)
    hashed_password = Column(String(256), nullable=False)
    role = Column(SAEnum(UserRole), default=UserRole.customer, nullable=False)

    reviews = relationship("Review", back_populates="user")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    image_url = Column(String(500))
    average_rating = Column(Float, default=0.0)
    total_reviews = Column(Integer, default=0)

    reviews = relationship("Review", back_populates="product")


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    rating = Column(Integer, nullable=False)  # 1-5
    review_text = Column(Text)
    status = Column(SAEnum(ReviewStatus), default=ReviewStatus.pending, nullable=False)
    sentiment_score = Column(Float, default=0.5)  # 0-1, mock
    created_at = Column(DateTime, default=datetime.utcnow)

    product = relationship("Product", back_populates="reviews")
    user = relationship("User", back_populates="reviews")
