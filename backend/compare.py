from fastapi import APIRouter, HTTPException
from schemas import CompareRequest, CompareResponse
from comparator import compare_4bit, ComparatorError

router = APIRouter()


@router.post("/compare", response_model=CompareResponse)
def compare(req: CompareRequest):
    cascade_in = {"gt": req.cascade_gt, "lt": req.cascade_lt, "eq": req.cascade_eq}
    try:
        result = compare_4bit(req.a, req.b, cascade_in=cascade_in)
    except ComparatorError as e:
        raise HTTPException(status_code=422, detail=str(e))
    return result
