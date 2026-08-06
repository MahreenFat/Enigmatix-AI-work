from fastapi import APIRouter

router = APIRouter(prefix="/books", tags=["Books"])

@router.get("/")
def get_books():
    return [
        {
            "id": 1,
            "title": "Python Programming",
            "author": "John Doe"
        }
    ]