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
    mode: int  # 0 = add, 1 = subtract


class ArithmeticResponse(BaseModel):
    sum: str
    carry_out: int | None = None  # populated when mode=0
    borrow: int | None = None     # populated when mode=1


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


# --- /mux ---
class MuxRequest(BaseModel):
    select: str
    inputs: list[int]


class MuxResponse(BaseModel):
    select: str
    output: int
