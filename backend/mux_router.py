from fastapi import APIRouter, HTTPException
from schemas import MuxRequest, MuxResponse
from mux import mux_8to1, MuxError

router = APIRouter()


@router.post("/mux", response_model=MuxResponse)
def mux(req: MuxRequest):
    try:
        output = mux_8to1(req.select, req.inputs)
    except MuxError as e:
        raise HTTPException(status_code=422, detail=str(e))
    return {"select": req.select, "output": output}
