"""
backend/circuit_comparator.py — Layout generator and live simulation engine for the 4-Bit Magnitude Comparator (IC 74LS85).
Reuses verified logic from comparator.py directly.
"""
import datetime
from circuit_models import (
    CircuitComponent,
    CircuitPin,
    CircuitWire,
    CircuitJunction,
    CircuitLayoutResponse,
    PinDirection,
)
from comparator import compare_4bit, ComparatorError


def build_comparator_4bit_circuit(
    a: str = "0000",
    b: str = "0000",
    cascade_gt: int = 0,
    cascade_lt: int = 0,
    cascade_eq: int = 1,
) -> CircuitLayoutResponse:
    """
    Builds the schematic layout and computes live pin/wire states for the 4-bit Magnitude Comparator (74LS85).
    a: 4-bit binary string 'A3A2A1A0'
    b: 4-bit binary string 'B3B2B1B0'
    cascade_gt: IA>B input (default 0)
    cascade_lt: IA<B input (default 0)
    cascade_eq: IA=B input (default 1, standalone tie-off)
    """
    if len(a) != 4 or any(c not in "01" for c in a):
        raise ValueError(f"a must be a 4-bit binary string, got '{a}'")
    if len(b) != 4 or any(c not in "01" for c in b):
        raise ValueError(f"b must be a 4-bit binary string, got '{b}'")
    if cascade_gt not in (0, 1) or cascade_lt not in (0, 1) or cascade_eq not in (0, 1):
        raise ValueError("cascade inputs must be binary 0 or 1")

    # Reuse verified logic from comparator.py
    cascade_in = {"gt": cascade_gt, "lt": cascade_lt, "eq": cascade_eq}
    res = compare_4bit(a, b, cascade_in=cascade_in)

    a_bits = [int(c) for c in a]
    b_bits = [int(c) for c in b]

    out_gt = res["a_gt_b"]
    out_lt = res["a_lt_b"]
    out_eq = res["a_eq_b"]

    components: list[CircuitComponent] = []

    # 1. Word A Input Ports (A3..A0)
    a_meta = [
        ("A3", a_bits[0], 100, "15"),
        ("A2", a_bits[1], 135, "13"),
        ("A1", a_bits[2], 170, "12"),
        ("A0", a_bits[3], 205, "10"),
    ]
    for pin_name, val, y_pos, pin_num in a_meta:
        components.append(
            CircuitComponent(
                id=f"PORT_{pin_name}",
                ref=pin_name,
                value=str(val),
                type="port_input",
                x=80,
                y=y_pos - 10,
                width=50,
                height=20,
                pins={
                    "out": CircuitPin(
                        name=pin_name,
                        pin_number="",
                        x=130,
                        y=y_pos,
                        dx=1.0,
                        dy=0.0,
                        value=val,
                        direction=PinDirection.OUTPUT,
                    )
                },
            )
        )

    # 2. Word B Input Ports (B3..B0)
    b_meta = [
        ("B3", b_bits[0], 255, "1"),
        ("B2", b_bits[1], 290, "14"),
        ("B1", b_bits[2], 325, "11"),
        ("B0", b_bits[3], 360, "9"),
    ]
    for pin_name, val, y_pos, pin_num in b_meta:
        components.append(
            CircuitComponent(
                id=f"PORT_{pin_name}",
                ref=pin_name,
                value=str(val),
                type="port_input",
                x=80,
                y=y_pos - 10,
                width=50,
                height=20,
                pins={
                    "out": CircuitPin(
                        name=pin_name,
                        pin_number="",
                        x=130,
                        y=y_pos,
                        dx=1.0,
                        dy=0.0,
                        value=val,
                        direction=PinDirection.OUTPUT,
                    )
                },
            )
        )

    # 3. Cascade Expansion Inputs (IA>B, IA=B, IA<B)
    cas_meta = [
        ("IA_GT", "I_A>B", cascade_gt, 410, "4"),
        ("IA_EQ", "I_A=B", cascade_eq, 450, "3"),
        ("IA_LT", "I_A<B", cascade_lt, 490, "2"),
    ]
    for port_id, label, val, y_pos, pin_num in cas_meta:
        components.append(
            CircuitComponent(
                id=f"PORT_{port_id}",
                ref=label,
                value=str(val),
                type="port_select",
                x=80,
                y=y_pos - 10,
                width=65,
                height=20,
                pins={
                    "out": CircuitPin(
                        name=label,
                        pin_number="",
                        x=145,
                        y=y_pos,
                        dx=1.0,
                        dy=0.0,
                        value=val,
                        direction=PinDirection.OUTPUT,
                    )
                },
            )
        )

    # 4. IC U1: 74LS85 4-Bit Magnitude Comparator
    # Bounding box anchor: (440, 70), width=220, height=450
    ic_pins = {
        # Word A
        "A3": CircuitPin(name="A3", pin_number="15", x=440, y=100, dx=-1.0, dy=0.0, value=a_bits[0], direction=PinDirection.INPUT),
        "A2": CircuitPin(name="A2", pin_number="13", x=440, y=135, dx=-1.0, dy=0.0, value=a_bits[1], direction=PinDirection.INPUT),
        "A1": CircuitPin(name="A1", pin_number="12", x=440, y=170, dx=-1.0, dy=0.0, value=a_bits[2], direction=PinDirection.INPUT),
        "A0": CircuitPin(name="A0", pin_number="10", x=440, y=205, dx=-1.0, dy=0.0, value=a_bits[3], direction=PinDirection.INPUT),
        # Word B
        "B3": CircuitPin(name="B3", pin_number="1",  x=440, y=255, dx=-1.0, dy=0.0, value=b_bits[0], direction=PinDirection.INPUT),
        "B2": CircuitPin(name="B2", pin_number="14", x=440, y=290, dx=-1.0, dy=0.0, value=b_bits[1], direction=PinDirection.INPUT),
        "B1": CircuitPin(name="B1", pin_number="11", x=440, y=325, dx=-1.0, dy=0.0, value=b_bits[2], direction=PinDirection.INPUT),
        "B0": CircuitPin(name="B0", pin_number="9",  x=440, y=360, dx=-1.0, dy=0.0, value=b_bits[3], direction=PinDirection.INPUT),
        # Cascade Inputs
        "IA_GT": CircuitPin(name="IA>B", pin_number="4", x=440, y=410, dx=-1.0, dy=0.0, value=cascade_gt, direction=PinDirection.INPUT),
        "IA_EQ": CircuitPin(name="IA=B", pin_number="3", x=440, y=450, dx=-1.0, dy=0.0, value=cascade_eq, direction=PinDirection.INPUT),
        "IA_LT": CircuitPin(name="IA<B", pin_number="2", x=440, y=490, dx=-1.0, dy=0.0, value=cascade_lt, direction=PinDirection.INPUT),
        # Outputs
        "OA_GT": CircuitPin(name="OA>B", pin_number="5", x=660, y=200, dx=1.0, dy=0.0, value=out_gt, direction=PinDirection.OUTPUT),
        "OA_EQ": CircuitPin(name="OA=B", pin_number="6", x=660, y=275, dx=1.0, dy=0.0, value=out_eq, direction=PinDirection.OUTPUT),
        "OA_LT": CircuitPin(name="OA<B", pin_number="7", x=660, y=350, dx=1.0, dy=0.0, value=out_lt, direction=PinDirection.OUTPUT),
    }

    components.append(
        CircuitComponent(
            id="U1",
            ref="U1",
            value="74LS85",
            type="ic_block",
            x=440,
            y=70,
            width=220,
            height=450,
            pins=ic_pins,
        )
    )

    # 5. Output Ports (OA>B, OA=B, OA<B)
    out_meta = [
        ("OA_GT", "OA>B", out_gt, 200),
        ("OA_EQ", "OA=B", out_eq, 275),
        ("OA_LT", "OA<B", out_lt, 350),
    ]
    for port_id, label, val, y_pos in out_meta:
        components.append(
            CircuitComponent(
                id=f"PORT_{port_id}",
                ref=label,
                value=str(val),
                type="port_output",
                x=800,
                y=y_pos - 10,
                width=65,
                height=20,
                pins={
                    "in": CircuitPin(
                        name=label,
                        pin_number="",
                        x=800,
                        y=y_pos,
                        dx=-1.0,
                        dy=0.0,
                        value=val,
                        direction=PinDirection.INPUT,
                    )
                },
            )
        )

    # Wires
    wires: list[CircuitWire] = []

    # Word A wires
    for pin_name, val, y_pos, _ in a_meta:
        wires.append(
            CircuitWire(
                id=f"w_{pin_name}",
                net=pin_name,
                from_pin=f"PORT_{pin_name}.out",
                to_pin=f"U1.{pin_name}",
                path=f"M 130,{y_pos} L 440,{y_pos}",
                value=val,
            )
        )

    # Word B wires
    for pin_name, val, y_pos, _ in b_meta:
        wires.append(
            CircuitWire(
                id=f"w_{pin_name}",
                net=pin_name,
                from_pin=f"PORT_{pin_name}.out",
                to_pin=f"U1.{pin_name}",
                path=f"M 130,{y_pos} L 440,{y_pos}",
                value=val,
            )
        )

    # Cascade input wires
    for port_id, label, val, y_pos, _ in cas_meta:
        wires.append(
            CircuitWire(
                id=f"w_{port_id}",
                net=label,
                from_pin=f"PORT_{port_id}.out",
                to_pin=f"U1.{port_id}",
                path=f"M 145,{y_pos} L 440,{y_pos}",
                value=val,
            )
        )

    # Output wires
    for port_id, label, val, y_pos in out_meta:
        wires.append(
            CircuitWire(
                id=f"w_{port_id}",
                net=label,
                from_pin=f"U1.{port_id}",
                to_pin=f"PORT_{port_id}.in",
                path=f"M 660,{y_pos} L 800,{y_pos}",
                value=val,
            )
        )

    now_str = datetime.datetime.now().strftime("%Y-%m-%d")

    return CircuitLayoutResponse(
        circuit_id="comparator_4bit",
        title="4-Bit Magnitude Comparator (IC 74LS85)",
        sheet_info={
            "sheet": "/",
            "file": "comparator_74ls85.kicad_sch",
            "title": "4-Bit Magnitude Comparator (IC 74LS85)",
            "size": "A4",
            "date": now_str,
            "rev": "v1.0",
            "company": "Digital Logic Simulation Suite",
            "id": "1/1",
        },
        canvas={"width": 1050, "height": 620},
        components=components,
        wires=wires,
        junctions=[],
        state={
            "a": a,
            "b": b,
            "cascade_gt": cascade_gt,
            "cascade_lt": cascade_lt,
            "cascade_eq": cascade_eq,
            "output": 1 if out_gt else (2 if out_lt else 0),  # 1: GT, 2: LT, 0: EQ
            "details": {
                "a_decimal": res["a_decimal"],
                "b_decimal": res["b_decimal"],
                "relation": res["relation"],
                "decision_stage": res["decision_stage"],
                "a_gt_b": out_gt,
                "a_lt_b": out_lt,
                "a_eq_b": out_eq,
                "bit_comparisons": res["bit_comparisons"],
            },
        },
    )
