from fastapi import APIRouter, HTTPException
from schemas import ArithmeticRequest, ArithmeticResponse
from adder_subtractor import add_subtract_4bit, ArithmeticError_

router = APIRouter()


@router.post("/add-subtract", response_model=ArithmeticResponse)
def add_subtract(req: ArithmeticRequest):
    try:
        result = add_subtract_4bit(req.a, req.b, req.mode, cin=req.cin)
    except ArithmeticError_ as e:
        raise HTTPException(status_code=422, detail=str(e))
    return result
