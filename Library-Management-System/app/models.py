from sqlalchemy import Column, Integer, String, Date
from .database import Base


# -------------------------
# Books Table
# -------------------------
class Book(Base):
    __tablename__ = "books"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    author = Column(String, nullable=False)
    category = Column(String, nullable=False)
    quantity = Column(Integer, default=1)


# -------------------------
# Students Table
# -------------------------
class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)


# -------------------------
# Issued Books Table
# -------------------------
class IssuedBook(Base):
    __tablename__ = "issued_books"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, nullable=False)
    book_id = Column(Integer, nullable=False)
    issue_date = Column(Date)
    return_date = Column(Date)