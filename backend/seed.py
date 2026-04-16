"""Seed the database with sample data."""
import random
from database import SessionLocal, engine
import models
from auth import hash_password

models.Base.metadata.create_all(bind=engine)

PRODUCTS = [
    {
        "name": "Wireless Noise-Cancelling Headphones",
        "description": "Premium sound quality with 30-hour battery life and active noise cancellation.",
        "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
    },
    {
        "name": "Mechanical Gaming Keyboard",
        "description": "RGB backlit mechanical keyboard with tactile switches for the ultimate gaming experience.",
        "image_url": "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400",
    },
    {
        "name": "4K Ultra HD Monitor",
        "description": "27-inch 4K display with HDR support and 144Hz refresh rate.",
        "image_url": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400",
    },
    {
        "name": "Ergonomic Office Chair",
        "description": "Fully adjustable lumbar support chair designed for all-day comfort.",
        "image_url": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400",
    },
    {
        "name": "Smart Fitness Tracker",
        "description": "Track heart rate, sleep, steps, and more with 7-day battery life.",
        "image_url": "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400",
    },
    {
        "name": "Portable Bluetooth Speaker",
        "description": "360-degree surround sound with waterproof design, perfect for outdoors.",
        "image_url": "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400",
    },
    {
        "name": "Mirrorless Camera Kit",
        "description": "24MP full-frame sensor with interchangeable lenses and 4K video.",
        "image_url": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400",
    },
    {
        "name": "Standing Desk Converter",
        "description": "Easily switch between sitting and standing with smooth height adjustment.",
        "image_url": "https://images.unsplash.com/photo-1593642632846-62ee0e22a5ac?w=400",
    },
]

USERS = [
    {"name": "Alice Johnson", "email": "alice@example.com", "role": models.UserRole.customer},
    {"name": "Bob Smith", "email": "bob@example.com", "role": models.UserRole.customer},
    {"name": "Carol White", "email": "carol@example.com", "role": models.UserRole.customer},
    {"name": "Dave Mod", "email": "dave@example.com", "role": models.UserRole.moderator},
    {"name": "Eve Manager", "email": "eve@example.com", "role": models.UserRole.manager},
]

REVIEW_TEXTS = [
    "Absolutely love this product! Exceeded all my expectations.",
    "Great value for money. Would definitely recommend to a friend.",
    "Solid build quality. Works exactly as advertised.",
    "Good product but the packaging could be better.",
    "Outstanding performance. Best purchase I've made this year.",
    "Decent product overall, though took a while to arrive.",
    "Fantastic! The quality is incredible for the price.",
    "Works well but the instructions were a bit confusing.",
    "Highly recommend. Very happy with my purchase.",
    "A bit pricey but worth every penny.",
]


def seed():
    db = SessionLocal()
    try:
        if db.query(models.User).count() > 0:
            print("Database already seeded.")
            return

        # Create users
        users = []
        for u in USERS:
            user = models.User(
                name=u["name"],
                email=u["email"],
                hashed_password=hash_password("password123"),
                role=u["role"],
            )
            db.add(user)
            users.append(user)
        db.commit()
        for u in users:
            db.refresh(u)

        # Create products
        products = []
        for p in PRODUCTS:
            product = models.Product(**p)
            db.add(product)
            products.append(product)
        db.commit()
        for p in products:
            db.refresh(p)

        # Create approved reviews
        customers = [u for u in users if u.role == models.UserRole.customer]
        for product in products:
            for i, customer in enumerate(customers):
                import models as m
                review = models.Review(
                    product_id=product.id,
                    user_id=customer.id,
                    rating=random.randint(3, 5),
                    review_text=random.choice(REVIEW_TEXTS),
                    status=models.ReviewStatus.approved,
                    sentiment_score=round(random.uniform(0.5, 1.0), 2),
                )
                db.add(review)
        db.commit()

        # Add some pending reviews
        for product in products[:4]:
            review = models.Review(
                product_id=product.id,
                user_id=customers[0].id,
                rating=random.randint(1, 5),
                review_text="Pending review awaiting moderation - " + random.choice(REVIEW_TEXTS),
                status=models.ReviewStatus.pending,
                sentiment_score=round(random.uniform(0.1, 0.9), 2),
            )
            db.add(review)
        db.commit()

        # Recalculate product ratings
        for product in products:
            db.refresh(product)
            approved = [r for r in product.reviews if r.status == models.ReviewStatus.approved]
            if approved:
                product.average_rating = round(sum(r.rating for r in approved) / len(approved), 2)
                product.total_reviews = len(approved)
        db.commit()

        print("Database seeded successfully!")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
