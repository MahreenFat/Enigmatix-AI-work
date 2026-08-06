from datetime import date
from sqlalchemy.orm import Session

from . import models, schemas


# ======================================
# STUDENT CRUD
# ======================================

def create_student(db: Session, student: schemas.StudentCreate):

    new_student = models.Student(
        name=student.name,
        email=student.email,
        password=student.password
    )

    db.add(new_student)
    db.commit()
    db.refresh(new_student)

    return new_student


def get_student_by_email(db: Session, email: str):

    return db.query(models.Student).filter(
        models.Student.email == email
    ).first()


def get_student(db: Session, student_id: int):

    return db.query(models.Student).filter(
        models.Student.id == student_id
    ).first()


def get_students(db: Session):

    return db.query(models.Student).all()


def login_student(db: Session, email: str, password: str):

    student = db.query(models.Student).filter(
        models.Student.email == email
    ).first()

    if student and student.password == password:
        return student

    return None


# ======================================
# BOOK CRUD
# ======================================

def create_book(db: Session, book: schemas.BookCreate):

    new_book = models.Book(
        title=book.title,
        author=book.author,
        category=book.category,
        quantity=book.quantity
    )

    db.add(new_book)
    db.commit()
    db.refresh(new_book)

    return new_book


def get_books(db: Session):

    return db.query(models.Book).all()


def update_book(db: Session, book_id: int, book: schemas.BookCreate):

    existing_book = db.query(models.Book).filter(
        models.Book.id == book_id
    ).first()

    if existing_book is None:
        return None

    existing_book.title = book.title
    existing_book.author = book.author
    existing_book.category = book.category
    existing_book.quantity = book.quantity

    db.commit()
    db.refresh(existing_book)

    return existing_book


def delete_book(db: Session, book_id: int):

    book = db.query(models.Book).filter(
        models.Book.id == book_id
    ).first()

    if book is None:
        return None

    db.delete(book)
    db.commit()

    return book


def search_books(db: Session, keyword: str):

    return db.query(models.Book).filter(
        models.Book.title.contains(keyword)
    ).all()


# ======================================
# ISSUE BOOK
# ======================================

def issue_book(db: Session, issue: schemas.IssueBook):

    student = db.query(models.Student).filter(
        models.Student.id == issue.student_id
    ).first()

    if student is None:
        return {"error": "Student not found"}

    book = db.query(models.Book).filter(
        models.Book.id == issue.book_id
    ).first()

    if book is None:
        return {"error": "Book not found"}

    if book.quantity <= 0:
        return {"error": "Book is Out of Stock"}

    issued_book = models.IssuedBook(
        student_id=issue.student_id,
        book_id=issue.book_id,
        issue_date=issue.issue_date
    )

    book.quantity -= 1

    db.add(issued_book)
    db.commit()
    db.refresh(issued_book)

    return issued_book


# ======================================
# RETURN BOOK
# ======================================

def return_book(db: Session, issue_id: int, return_date: date):

    issue = db.query(models.IssuedBook).filter(
        models.IssuedBook.id == issue_id
    ).first()

    if issue is None:
        return None

    issue.return_date = return_date

    book = db.query(models.Book).filter(
        models.Book.id == issue.book_id
    ).first()

    if book:
        book.quantity += 1

    db.commit()
    db.refresh(issue)

    return issue