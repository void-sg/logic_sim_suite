"""
backend/circuit_router.py — Circuit schematic layout and live simulation API endpoints.
"""
from fastapi import APIRouter, HTTPException, Query
from circuit_models import CircuitLayoutResponse
from circuit_mux import build_mux_8to1_circuit
from schemas import MuxRequest

router = APIRouter(prefix="/circuit", tags=["circuit"])


def parse_inputs_param(inputs_param: str) -> list[int]:
    """Helper to parse inputs parameter from '0,1,0,...' or '01010010'."""
    cleaned = inputs_param.strip()
    if "," in cleaned:
        raw_list = [x.strip() for x in cleaned.split(",") if x.strip()]
        if len(raw_list) != 8 or any(x not in ("0", "1") for x in raw_list):
            raise ValueError(f"inputs must contain exactly 8 binary values, got '{inputs_param}'")
        return [int(x) for x in raw_list]
    else:
        if len(cleaned) != 8 or any(c not in ("0", "1") for c in cleaned):
            raise ValueError(f"inputs string must be 8 binary digits, got '{inputs_param}'")
        return [int(c) for c in cleaned]


@router.get("/mux-8to1", response_model=CircuitLayoutResponse)
def get_mux_8to1_circuit(
    select: str = Query("000", description="3-bit binary string 'S2S1S0'"),
    inputs: str = Query("0,0,0,0,0,0,0,0", description="8 data bits, e.g. '0,1,0,0,1,0,0,0' or '01001000'"),
    strobe: int = Query(0, description="Active-low strobe (0 = enabled, 1 = disabled)"),
):
    try:
        input_bits = parse_inputs_param(inputs)
        return build_mux_8to1_circuit(select=select, inputs=input_bits, strobe=strobe)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/mux-8to1", response_model=CircuitLayoutResponse)
def post_mux_8to1_circuit(req: MuxRequest):
    try:
        return build_mux_8to1_circuit(select=req.select, inputs=req.inputs, strobe=req.strobe)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
