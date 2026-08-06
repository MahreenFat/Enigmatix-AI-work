from datetime import date
from app.database import SessionLocal, Base, engine
from app import crud, schemas

# Ensure tables exist
Base.metadata.create_all(bind=engine)

def seed_books():
    db = SessionLocal()
    try:
        books = [
            {"title": f"Sample Book {i}", "author": f"Author {i%10 + 1}", "category": f"Category {i%5 + 1}", "quantity": (i % 10) + 1}
            for i in range(1, 101)
        ]

        for book in books:
            crud.create_book(db, schemas.BookCreate(**book))

        print("Seeded 100 books")
    finally:
        db.close()


def seed_students():
    db = SessionLocal()
    try:
        students = [
            {"name": f"Student {i}", "email": f"student{i}@example.com", "password": "password123"}
            for i in range(1, 21)
        ]

        for student in students:
            if not crud.get_student_by_email(db, student["email"]):
                crud.create_student(db, schemas.StudentCreate(**student))

        print("Seeded 20 students")
    finally:
        db.close()


if __name__ == "__main__":
    seed_books()
    seed_students()
