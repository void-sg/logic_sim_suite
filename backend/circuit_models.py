"""
backend/circuit_models.py — Data models for the KiCad-styled Circuit Viewer.
"""
from enum import Enum
from pydantic import BaseModel


class PinDirection(str, Enum):
    INPUT = "input"
    OUTPUT = "output"
    POWER = "power"
    PASSIVE = "passive"


class CircuitPin(BaseModel):
    name: str              # e.g., "1C0", "1Y", "A", "B", "~{1G}"
    pin_number: str        # e.g., "1", "2", "6"
    x: float               # absolute pin terminal coordinate on canvas
    y: float
    dx: float = 0.0        # stub direction vector: -1 = left, +1 = right, 0 = none
    dy: float = 0.0        # stub direction vector: -1 = up, +1 = down, 0 = none
    value: int | None = None  # live computed logic level: 0, 1, or None
    direction: PinDirection = PinDirection.INPUT


class CircuitComponent(BaseModel):
    id: str                # e.g., "U1", "U2A", "U2B", "U3"
    ref: str               # Reference designator rendered in KiCad red: "U1", "U2A"
    value: str             # Component value rendered in dark text: "74LS04", "74LS153"
    type: str              # "ic_block", "not_gate", "or_gate", "port"
    x: float               # Top-left or bounding box anchor X
    y: float               # Top-left or bounding box anchor Y
    width: float
    height: float
    pins: dict[str, CircuitPin]


class CircuitWire(BaseModel):
    id: str                # e.g., "w_s2_inv"
    net: str               # e.g., "S2", "S2_INV", "1Y", "Y"
    from_pin: str          # e.g., "PORT_S2.out"
    to_pin: str            # e.g., "U1.A"
    path: str              # Manhattan SVG path string, e.g. "M 100,200 L 150,200 L 150,300"
    value: int | None = None  # live computed logic level: 0, 1, or None


class CircuitJunction(BaseModel):
    x: float
    y: float
    value: int | None = None


class CircuitLayoutResponse(BaseModel):
    circuit_id: str
    title: str
    sheet_info: dict       # sheet, file, date, rev, company, size
    canvas: dict           # width, height
    components: list[CircuitComponent]
    wires: list[CircuitWire]
    junctions: list[CircuitJunction]
    state: dict            # select, inputs, strobe, output, details
