from typing import Any

from fastapi import APIRouter

from app.models import CategoriesPublic, JobCategory

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("/", response_model=CategoriesPublic)
def read_categories() -> Any:
    """
    Retrieve list of categories for job posts and freelancers.
    """
    categories = [category.value for category in JobCategory]
    return CategoriesPublic(data=categories, count=len(categories))
