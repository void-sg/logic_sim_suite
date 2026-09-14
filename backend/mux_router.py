from fastapi import APIRouter, HTTPException
from schemas import MuxRequest, MuxResponse
from mux import simulate_mux, MuxError

router = APIRouter()


@router.post("/mux", response_model=MuxResponse)
def mux(req: MuxRequest):
    try:
        result = simulate_mux(req.select, req.inputs, strobe=req.strobe)
    except MuxError as e:
        raise HTTPException(status_code=422, detail=str(e))
    return result
