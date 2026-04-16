import random
from typing import List, Optional

from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func

from database import engine, get_db
import models
import schemas
from auth import (
    hash_password, verify_password, create_access_token,
    get_current_user, get_optional_user,
)

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Review & Rating API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Auth ──────────────────────────────────────────────────────────────────────

@app.post("/api/auth/register", response_model=schemas.TokenResponse, status_code=201)
def register(payload: schemas.RegisterRequest, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = models.User(
        name=payload.name,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        role=payload.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "user": user}


@app.post("/api/auth/login", response_model=schemas.TokenResponse)
def login(payload: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "user": user}


@app.get("/api/auth/me", response_model=schemas.UserOut)
def me(current_user: models.User = Depends(get_current_user)):
    return current_user


# ── Products ──────────────────────────────────────────────────────────────────

@app.get("/api/products", response_model=List[schemas.ProductOut])
def list_products(
    sort: Optional[str] = Query("highest_rated", description="highest_rated | most_reviewed | newest"),
    min_rating: Optional[float] = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(models.Product)
    if min_rating is not None:
        q = q.filter(models.Product.average_rating >= min_rating)
    if sort == "most_reviewed":
        q = q.order_by(models.Product.total_reviews.desc())
    else:
        q = q.order_by(models.Product.average_rating.desc())
    return q.all()


@app.get("/api/products/{product_id}", response_model=schemas.ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


# ── Reviews ───────────────────────────────────────────────────────────────────

def _mock_sentiment(text: str) -> float:
    """Very simple mock sentiment: longer positive-sounding text → higher score."""
    positive_words = {"great", "love", "excellent", "amazing", "fantastic", "good",
                      "best", "outstanding", "recommend", "happy", "perfect", "incredible"}
    negative_words = {"bad", "terrible", "awful", "horrible", "worst", "poor",
                      "disappointing", "broken", "useless", "hate", "waste"}
    words = (text or "").lower().split()
    pos = sum(1 for w in words if w in positive_words)
    neg = sum(1 for w in words if w in negative_words)
    total = pos + neg
    if total == 0:
        return round(random.uniform(0.45, 0.65), 2)
    score = pos / total
    # Add slight noise
    score = min(1.0, max(0.0, score + random.uniform(-0.1, 0.1)))
    return round(score, 2)


@app.post("/api/reviews", response_model=schemas.ReviewOut, status_code=201)
def create_review(
    payload: schemas.ReviewCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if not (1 <= payload.rating <= 5):
        raise HTTPException(status_code=422, detail="Rating must be between 1 and 5")
    product = db.query(models.Product).filter(models.Product.id == payload.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    review = models.Review(
        product_id=payload.product_id,
        user_id=current_user.id,
        rating=payload.rating,
        review_text=payload.review_text,
        status=models.ReviewStatus.pending,
        sentiment_score=_mock_sentiment(payload.review_text or ""),
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    # Eagerly load user
    db.refresh(review)
    review.user  # trigger lazy load
    return review


@app.get("/api/products/{product_id}/reviews", response_model=List[schemas.ReviewOut])
def get_product_reviews(product_id: int, db: Session = Depends(get_db)):
    reviews = (
        db.query(models.Review)
        .options(joinedload(models.Review.user))
        .filter(
            models.Review.product_id == product_id,
            models.Review.status == models.ReviewStatus.approved,
        )
        .order_by(models.Review.created_at.desc())
        .all()
    )
    return reviews


# ── Moderation ────────────────────────────────────────────────────────────────

def _require_moderator(current_user: models.User = Depends(get_current_user)):
    if current_user.role not in (models.UserRole.moderator, models.UserRole.manager):
        raise HTTPException(status_code=403, detail="Moderator access required")
    return current_user


@app.get("/api/moderation/pending", response_model=List[schemas.ReviewOut])
def get_pending_reviews(
    db: Session = Depends(get_db),
    _: models.User = Depends(_require_moderator),
):
    reviews = (
        db.query(models.Review)
        .options(joinedload(models.Review.user), joinedload(models.Review.product))
        .filter(models.Review.status == models.ReviewStatus.pending)
        .order_by(models.Review.created_at.asc())
        .all()
    )
    return reviews


@app.patch("/api/moderation/reviews/{review_id}", response_model=schemas.ReviewOut)
def update_review_status(
    review_id: int,
    payload: schemas.ReviewStatusUpdate,
    db: Session = Depends(get_db),
    _: models.User = Depends(_require_moderator),
):
    review = (
        db.query(models.Review)
        .options(joinedload(models.Review.user))
        .filter(models.Review.id == review_id)
        .first()
    )
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    review.status = payload.status
    db.commit()

    # Recalculate product stats when a review is approved or rejected
    if payload.status in (models.ReviewStatus.approved, models.ReviewStatus.rejected):
        product = db.query(models.Product).filter(models.Product.id == review.product_id).first()
        approved_reviews = (
            db.query(models.Review)
            .filter(
                models.Review.product_id == review.product_id,
                models.Review.status == models.ReviewStatus.approved,
            )
            .all()
        )
        if approved_reviews:
            product.average_rating = round(
                sum(r.rating for r in approved_reviews) / len(approved_reviews), 2
            )
            product.total_reviews = len(approved_reviews)
        else:
            product.average_rating = 0.0
            product.total_reviews = 0
        db.commit()

    db.refresh(review)
    return review


# ── User Profile ──────────────────────────────────────────────────────────────

@app.get("/api/users/me/reviews", response_model=List[schemas.ReviewOut])
def my_reviews(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    reviews = (
        db.query(models.Review)
        .options(joinedload(models.Review.user))
        .filter(models.Review.user_id == current_user.id)
        .order_by(models.Review.created_at.desc())
        .all()
    )
    return reviews


# ── Analytics (Manager) ───────────────────────────────────────────────────────

def _require_manager(current_user: models.User = Depends(get_current_user)):
    if current_user.role != models.UserRole.manager:
        raise HTTPException(status_code=403, detail="Manager access required")
    return current_user


@app.get("/api/analytics/top-products", response_model=List[schemas.ProductOut])
def top_products(
    limit: int = Query(5),
    db: Session = Depends(get_db),
    _: models.User = Depends(_require_manager),
):
    return (
        db.query(models.Product)
        .order_by(models.Product.average_rating.desc())
        .limit(limit)
        .all()
    )


@app.get("/api/analytics/sentiment")
def sentiment_summary(
    db: Session = Depends(get_db),
    _: models.User = Depends(_require_manager),
):
    result = db.query(func.avg(models.Review.sentiment_score)).scalar()
    avg_sentiment = round(float(result or 0), 2)
    total_reviews = db.query(models.Review).count()
    pending = db.query(models.Review).filter(models.Review.status == models.ReviewStatus.pending).count()
    approved = db.query(models.Review).filter(models.Review.status == models.ReviewStatus.approved).count()
    rejected = db.query(models.Review).filter(models.Review.status == models.ReviewStatus.rejected).count()
    return {
        "avg_sentiment": avg_sentiment,
        "total_reviews": total_reviews,
        "pending": pending,
        "approved": approved,
        "rejected": rejected,
    }
