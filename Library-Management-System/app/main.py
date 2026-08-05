from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .database import Base, engine, SessionLocal
from . import schemas, crud


# Create Database Tables
Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Library Management System",
    version="1.0"
)


# =============================
# CORS Configuration
# =============================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =============================
# Database Connection
# =============================
def get_db():
    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


# =============================
# Home
# =============================
@app.get("/")
def home():
    return {
        "message": "Library Management System API is Running!"
    }


# =============================
# Student Registration
# =============================
@app.post("/students/register")
def register_student(
    student: schemas.StudentCreate,
    db: Session = Depends(get_db)
):

    existing_student = crud.get_student_by_email(
        db,
        student.email
    )

    if existing_student:
        raise HTTPException(
            status_code=400,
            detail="Email already registered."
        )

    return crud.create_student(db, student)



# =============================
# Student Login
# =============================
@app.post("/students/login")
def login_student(
    student: schemas.StudentLogin,
    db: Session = Depends(get_db)
):

    user = crud.login_student(
        db,
        student.email,
        student.password
    )


    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid Email or Password"
        )


    return {
        "message": "Login Successful",
        "student": {
            "id": user.id,
            "name": user.name,
            "email": user.email
        }
    }



# =============================
# Add Book
# =============================
@app.post("/books")
def add_book(
    book: schemas.BookCreate,
    db: Session = Depends(get_db)
):

    return crud.create_book(db, book)



# =============================
# View All Books
# =============================
@app.get("/books")
def get_all_books(
    db: Session = Depends(get_db)
):

    return crud.get_books(db)



# =============================
# Update Book
# =============================
@app.put("/books/{book_id}")
def update_book(
    book_id: int,
    book: schemas.BookCreate,
    db: Session = Depends(get_db)
):

    updated_book = crud.update_book(
        db,
        book_id,
        book
    )


    if not updated_book:
        raise HTTPException(
            status_code=404,
            detail="Book not found"
        )


    return {
        "message": "Book Updated Successfully",
        "book": updated_book
    }



# =============================
# Delete Book
# =============================
@app.delete("/books/{book_id}")
def delete_book(
    book_id: int,
    db: Session = Depends(get_db)
):

    deleted_book = crud.delete_book(
        db,
        book_id
    )


    if not deleted_book:
        raise HTTPException(
            status_code=404,
            detail="Book not found"
        )


    return {
        "message": "Book Deleted Successfully"
    }



# =============================
# Search Books
# =============================
@app.get("/books/search/{keyword}")
def search_book(
    keyword: str,
    db: Session = Depends(get_db)
):

    return crud.search_books(
        db,
        keyword
    )



# =============================
# Issue Book
# =============================
@app.post("/issue-book")
def issue_book(
    issue: schemas.IssueBook,
    db: Session = Depends(get_db)
):

    result = crud.issue_book(
        db,
        issue
    )


    if isinstance(result, dict) and "error" in result:
        raise HTTPException(
            status_code=400,
            detail=result["error"]
        )


    return {
        "message": "Book Issued Successfully",
        "data": result
    }



# =============================
# Return Book
# =============================
@app.put("/return-book/{issue_id}")
def return_book(
    issue_id: int,
    book: schemas.ReturnBook,
    db: Session = Depends(get_db)
):

    result = crud.return_book(
        db,
        issue_id,
        book.return_date
    )


    if not result:
        raise HTTPException(
            status_code=404,
            detail="Issue record not found"
        )


    return {
        "message": "Book Returned Successfully",
        "data": result
    }