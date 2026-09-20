"""
backend/circuit_router.py — Circuit schematic layout and live simulation API endpoints.
Provides endpoints for:
- 8:1 Multiplexer (IC 74LS153 Dual Composite + Inverter + OR)
- 4:1 Multiplexer (Single IC 74LS153 Section)
- 4-Bit Magnitude Comparator (IC 74LS85)
- 4-Bit Adder / Subtractor (IC 74LS83 + 74LS86)
"""
from fastapi import APIRouter, HTTPException, Query
from circuit_models import CircuitLayoutResponse
from circuit_mux import build_mux_8to1_circuit
from circuit_standalone_mux import build_mux_4to1_circuit
from circuit_comparator import build_comparator_4bit_circuit
from circuit_adder_subtractor import build_adder_subtractor_4bit_circuit
from schemas import MuxRequest, CompareRequest, ArithmeticRequest

router = APIRouter(prefix="/circuit", tags=["circuit"])


def parse_inputs_param_8(inputs_param: str) -> list[int]:
    """Helper to parse 8-bit inputs parameter from '0,1,0,...' or '01010010'."""
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


def parse_inputs_param_4(inputs_param: str) -> list[int]:
    """Helper to parse 4-bit inputs parameter from '0,1,0,1' or '0101'."""
    cleaned = inputs_param.strip()
    if "," in cleaned:
        raw_list = [x.strip() for x in cleaned.split(",") if x.strip()]
        if len(raw_list) != 4 or any(x not in ("0", "1") for x in raw_list):
            raise ValueError(f"inputs must contain exactly 4 binary values, got '{inputs_param}'")
        return [int(x) for x in raw_list]
    else:
        if len(cleaned) != 4 or any(c not in ("0", "1") for c in cleaned):
            raise ValueError(f"inputs string must be 4 binary digits, got '{inputs_param}'")
        return [int(c) for c in cleaned]


# -----------------------------------------------------------------------------
# 1. 8:1 MULTIPLEXER
# -----------------------------------------------------------------------------
@router.get("/mux-8to1", response_model=CircuitLayoutResponse)
def get_mux_8to1_circuit(
    select: str = Query("000", description="3-bit binary string 'S2S1S0'"),
    inputs: str = Query("0,0,0,0,0,0,0,0", description="8 data bits, e.g. '0,1,0,0,1,0,0,0' or '01001000'"),
    strobe: int = Query(0, description="Active-low strobe (0 = enabled, 1 = disabled)"),
):
    try:
        input_bits = parse_inputs_param_8(inputs)
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


# -----------------------------------------------------------------------------
# 2. STANDALONE 4:1 MULTIPLEXER
# -----------------------------------------------------------------------------
@router.get("/mux-4to1", response_model=CircuitLayoutResponse)
def get_mux_4to1_circuit(
    select: str = Query("00", description="2-bit binary string 'S1S0'"),
    inputs: str = Query("0,0,0,0", description="4 data bits, e.g. '0,1,0,0' or '0100'"),
    strobe: int = Query(0, description="Active-low strobe (0 = enabled, 1 = disabled)"),
):
    try:
        input_bits = parse_inputs_param_4(inputs)
        return build_mux_4to1_circuit(select=select, inputs=input_bits, strobe=strobe)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/mux-4to1", response_model=CircuitLayoutResponse)
def post_mux_4to1_circuit(req: MuxRequest):
    try:
        return build_mux_4to1_circuit(select=req.select, inputs=req.inputs, strobe=req.strobe)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# -----------------------------------------------------------------------------
# 3. 4-BIT MAGNITUDE COMPARATOR
# -----------------------------------------------------------------------------
@router.get("/comparator-4bit", response_model=CircuitLayoutResponse)
def get_comparator_4bit_circuit(
    a: str = Query("0000", description="4-bit binary string 'A3A2A1A0'"),
    b: str = Query("0000", description="4-bit binary string 'B3B2B1B0'"),
    cascade_gt: int = Query(0, description="Cascade IA>B input (default 0)"),
    cascade_lt: int = Query(0, description="Cascade IA<B input (default 0)"),
    cascade_eq: int = Query(1, description="Cascade IA=B input (default 1 tie-off)"),
):
    try:
        return build_comparator_4bit_circuit(
            a=a, b=b, cascade_gt=cascade_gt, cascade_lt=cascade_lt, cascade_eq=cascade_eq
        )
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/comparator-4bit", response_model=CircuitLayoutResponse)
def post_comparator_4bit_circuit(req: CompareRequest):
    try:
        return build_comparator_4bit_circuit(
            a=req.a,
            b=req.b,
            cascade_gt=req.cascade_gt,
            cascade_lt=req.cascade_lt,
            cascade_eq=req.cascade_eq,
        )
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# -----------------------------------------------------------------------------
# 4. 4-BIT ADDER / SUBTRACTOR
# -----------------------------------------------------------------------------
@router.get("/adder-subtractor-4bit", response_model=CircuitLayoutResponse)
def get_adder_subtractor_4bit_circuit(
    a: str = Query("0000", description="4-bit binary string 'A3A2A1A0'"),
    b: str = Query("0000", description="4-bit binary string 'B3B2B1B0'"),
    mode: int = Query(0, description="Mode: 0 = ADD, 1 = SUBTRACT"),
    cin: int | None = Query(None, description="Optional carry-in (defaults to mode)"),
):
    try:
        return build_adder_subtractor_4bit_circuit(a=a, b=b, mode=mode, cin=cin)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/adder-subtractor-4bit", response_model=CircuitLayoutResponse)
def post_adder_subtractor_4bit_circuit(req: ArithmeticRequest):
    try:
        return build_adder_subtractor_4bit_circuit(a=req.a, b=req.b, mode=req.mode, cin=req.cin)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
