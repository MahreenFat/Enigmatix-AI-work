from pydantic import BaseModel, EmailStr
from datetime import date

# ==========================
# Student Schemas
# ==========================

class StudentCreate(BaseModel):
    name: str
    email: EmailStr
    password: str


class StudentLogin(BaseModel):
    email: EmailStr
    password: str


class Student(BaseModel):
    id: int
    name: str
    email: EmailStr

    class Config:
        from_attributes = True


# ==========================
# Book Schemas
# ==========================

class BookCreate(BaseModel):
    title: str
    author: str
    category: str
    quantity: int


class Book(BaseModel):
    id: int
    title: str
    author: str
    category: str
    quantity: int

    class Config:
        from_attributes = True

        from datetime import date


class IssueBook(BaseModel):
    student_id: int
    book_id: int
    issue_date: date


class ReturnBook(BaseModel):
    return_date: date