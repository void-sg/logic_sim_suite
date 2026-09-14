"""
backend/schemas.py — Pydantic request/response models.
These ARE the contract. Update VARIABLES.md the moment any field here changes.
"""
from pydantic import BaseModel


# --- /convert ---
class ConvertRequest(BaseModel):
    from_code: str
    to_code: str
    bits: str


class ConvertResponse(BaseModel):
    input_bits: str
    decimal_value: int
    output_bits: str
    from_code: str
    to_code: str


# --- /add-subtract ---
class ArithmeticRequest(BaseModel):
    a: str
    b: str
    mode: int = 0  # 0 = add, 1 = subtract
    cin: int | None = None  # optional custom carry-in (defaults to 0 for add, 1 for sub)


class ArithmeticResponse(BaseModel):
    sum: str
    carry_out: int | None = None  # populated when mode=0
    borrow: int | None = None     # populated when mode=1
    a: str | None = None
    b: str | None = None
    mode: int | None = None
    operation: str | None = None
    a_decimal: int | None = None
    b_decimal: int | None = None
    result_decimal: int | None = None
    stages: list[dict] | None = None


# --- /compare ---
class CompareRequest(BaseModel):
    a: str
    b: str
    cascade_gt: int = 0
    cascade_lt: int = 0
    cascade_eq: int = 1  # IC 74LS85's documented standalone tie-off


class CompareResponse(BaseModel):
    a_gt_b: int
    a_lt_b: int
    a_eq_b: int
    a: str | None = None
    b: str | None = None
    a_decimal: int | None = None
    b_decimal: int | None = None
    relation: str | None = None
    decision_stage: str | None = None
    bit_comparisons: list[dict] | None = None


# --- /mux ---
class MuxRequest(BaseModel):
    select: str
    inputs: list[int]
    strobe: int = 0  # active-low strobe / enable (0 = enabled, 1 = disabled)


class MuxResponse(BaseModel):
    select: str
    output: int
    mux_type: str | None = None
    inputs: list[int] | None = None
    selected_channel: str | None = None
    selected_index: int | None = None
    details: dict | None = None

