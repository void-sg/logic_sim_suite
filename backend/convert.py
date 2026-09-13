from fastapi import APIRouter, HTTPException
from schemas import ConvertRequest, ConvertResponse
from code_conversions import universal_convert, ConversionError

router = APIRouter()


@router.post("/convert", response_model=ConvertResponse)
def convert(req: ConvertRequest):
    try:
        result = universal_convert(req.from_code, req.to_code, req.bits)
    except ConversionError as e:
        raise HTTPException(status_code=422, detail=str(e))
    return result
