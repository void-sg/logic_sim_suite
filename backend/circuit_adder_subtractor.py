"""
backend/circuit_adder_subtractor.py — Layout generator and live simulation engine for the 4-Bit Adder / Subtractor
built from IC 74LS83 (4-bit binary full adder) + IC 74LS86 (quad 2-input XOR gate).
Reuses verified logic from adder_subtractor.py directly.
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
from adder_subtractor import add_subtract_4bit, ArithmeticError_


def build_adder_subtractor_4bit_circuit(
    a: str = "0000",
    b: str = "0000",
    mode: int = 0,
    cin: int | None = None,
) -> CircuitLayoutResponse:
    """
    Builds the schematic layout and computes live pin/wire states for the 4-bit Adder/Subtractor.
    a: 4-bit binary string 'A3A2A1A0'
    b: 4-bit binary string 'B3B2B1B0'
    mode: 0 = ADD, 1 = SUBTRACT
    cin: optional custom carry-in (defaults to mode)
    """
    if len(a) != 4 or any(c not in "01" for c in a):
        raise ValueError(f"a must be a 4-bit binary string, got '{a}'")
    if len(b) != 4 or any(c not in "01" for c in b):
        raise ValueError(f"b must be a 4-bit binary string, got '{b}'")
    if mode not in (0, 1):
        raise ValueError(f"mode must be 0 (add) or 1 (subtract), got {mode}")
    if cin is not None and cin not in (0, 1):
        raise ValueError(f"cin must be 0 or 1, got {cin}")

    effective_cin = mode if cin is None else cin

    # Reuse verified logic from adder_subtractor.py
    res = add_subtract_4bit(a, b, mode, cin=effective_cin)

    # In A and B strings: index 0 is MSB (bit 3), index 3 is LSB (bit 0)
    a_bits = [int(c) for c in a]  # [a3, a2, a1, a0]
    b_bits = [int(c) for c in b]  # [b3, b2, b1, b0]

    # Effective B bits (B XOR mode)
    b_eff_bits = [b_val ^ mode for b_val in b_bits]

    # Sum bits: res["sum"] is MSB-first string 'S3S2S1S0'
    s_bits = [int(c) for c in res["sum"]]  # [s3, s2, s1, s0]

    # Stages: list of stage dicts from LSB to MSB (stage 0 to stage 3)
    stages = res["stages"]
    final_cout = stages[3]["cout"]
    borrow_val = 1 - final_cout if mode == 1 else None

    components: list[CircuitComponent] = []

    # 1. Word A Input Ports (A0..A3) - Bit 0 at top, Bit 3 below
    # A0 is LSB (a_bits[3]), A1 is a_bits[2], A2 is a_bits[1], A3 is MSB (a_bits[0])
    a_meta = [
        ("A0", a_bits[3], 100, "10", "A1"),
        ("A1", a_bits[2], 140, "8",  "A2"),
        ("A2", a_bits[1], 180, "3",  "A3"),
        ("A3", a_bits[0], 220, "1",  "A4"),
    ]
    for port_name, val, y_pos, pin_num, ic_pin_name in a_meta:
        components.append(
            CircuitComponent(
                id=f"PORT_{port_name}",
                ref=port_name,
                value=str(val),
                type="port_input",
                x=70,
                y=y_pos - 10,
                width=50,
                height=20,
                pins={
                    "out": CircuitPin(
                        name=port_name,
                        pin_number="",
                        x=120,
                        y=y_pos,
                        dx=1.0,
                        dy=0.0,
                        value=val,
                        direction=PinDirection.OUTPUT,
                    )
                },
            )
        )

    # 2. Word B Input Ports (B0..B3) - Bit 0 at top, Bit 3 below
    # Feeds into XOR gates U1A..U1D
    b_meta = [
        ("B0", b_bits[3], b_eff_bits[3], 300, "U1A", "11", "B1"),
        ("B1", b_bits[2], b_eff_bits[2], 380, "U1B", "7",  "B2"),
        ("B2", b_bits[1], b_eff_bits[1], 460, "U1C", "4",  "B3"),
        ("B3", b_bits[0], b_eff_bits[0], 540, "U1D", "16", "B4"),
    ]
    for port_name, val, eff_val, y_pos, xor_ref, pin_num, ic_pin_name in b_meta:
        components.append(
            CircuitComponent(
                id=f"PORT_{port_name}",
                ref=port_name,
                value=str(val),
                type="port_input",
                x=70,
                y=y_pos - 10,
                width=50,
                height=20,
                pins={
                    "out": CircuitPin(
                        name=port_name,
                        pin_number="",
                        x=120,
                        y=y_pos,
                        dx=1.0,
                        dy=0.0,
                        value=val,
                        direction=PinDirection.OUTPUT,
                    )
                },
            )
        )

    # 3. Control Mode Port (M: 0=ADD, 1=SUB)
    components.append(
        CircuitComponent(
            id="PORT_MODE",
            ref="M (Mode)",
            value=str(mode),
            type="port_select",
            x=70,
            y=620,
            width=65,
            height=20,
            pins={
                "out": CircuitPin(
                    name="M",
                    pin_number="",
                    x=135,
                    y=630,
                    dx=1.0,
                    dy=0.0,
                    value=mode,
                    direction=PinDirection.OUTPUT,
                )
            },
        )
    )

    # 4. Quad 2-Input XOR Gate U1 (74LS86): U1A, U1B, U1C, U1D
    # Each gate XORs Bi with Mode M to produce Bi_eff
    for i, (port_name, val, eff_val, y_pos, xor_ref, pin_num, ic_pin_name) in enumerate(b_meta):
        components.append(
            CircuitComponent(
                id=xor_ref,
                ref=xor_ref,
                value="74LS86",
                type="xor_gate",
                x=260,
                y=y_pos - 20,
                width=65,
                height=40,
                pins={
                    "A": CircuitPin(
                        name=f"1A",
                        pin_number=str(i * 3 + 1),
                        x=260,
                        y=y_pos - 8,
                        dx=-1.0,
                        dy=0.0,
                        value=val,
                        direction=PinDirection.INPUT,
                    ),
                    "B": CircuitPin(
                        name=f"1B",
                        pin_number=str(i * 3 + 2),
                        x=260,
                        y=y_pos + 8,
                        dx=-1.0,
                        dy=0.0,
                        value=mode,
                        direction=PinDirection.INPUT,
                    ),
                    "Y": CircuitPin(
                        name=f"1Y",
                        pin_number=str(i * 3 + 3),
                        x=325,
                        y=y_pos,
                        dx=1.0,
                        dy=0.0,
                        value=eff_val,
                        direction=PinDirection.OUTPUT,
                    ),
                },
            )
        )

    # 5. IC U2: 74LS83 4-Bit Binary Full Adder
    # Bounding box anchor: (480, 70), width=220, height=540
    components.append(
        CircuitComponent(
            id="U2",
            ref="U2",
            value="74LS83",
            type="ic_block",
            x=480,
            y=70,
            width=220,
            height=540,
            pins={
                # Word A Pins
                "A1": CircuitPin(name="A1", pin_number="10", x=480, y=100, dx=-1.0, dy=0.0, value=a_bits[3], direction=PinDirection.INPUT),
                "A2": CircuitPin(name="A2", pin_number="8",  x=480, y=140, dx=-1.0, dy=0.0, value=a_bits[2], direction=PinDirection.INPUT),
                "A3": CircuitPin(name="A3", pin_number="3",  x=480, y=180, dx=-1.0, dy=0.0, value=a_bits[1], direction=PinDirection.INPUT),
                "A4": CircuitPin(name="A4", pin_number="1",  x=480, y=220, dx=-1.0, dy=0.0, value=a_bits[0], direction=PinDirection.INPUT),
                # Word B Pins (From XOR Outputs)
                "B1": CircuitPin(name="B1", pin_number="11", x=480, y=300, dx=-1.0, dy=0.0, value=b_eff_bits[3], direction=PinDirection.INPUT),
                "B2": CircuitPin(name="B2", pin_number="7",  x=480, y=380, dx=-1.0, dy=0.0, value=b_eff_bits[2], direction=PinDirection.INPUT),
                "B3": CircuitPin(name="B3", pin_number="4",  x=480, y=460, dx=-1.0, dy=0.0, value=b_eff_bits[1], direction=PinDirection.INPUT),
                "B4": CircuitPin(name="B4", pin_number="16", x=480, y=540, dx=-1.0, dy=0.0, value=b_eff_bits[0], direction=PinDirection.INPUT),
                # Carry In C0 (Connected to Mode M)
                "C0": CircuitPin(name="C0", pin_number="13", x=480, y=580, dx=-1.0, dy=0.0, value=effective_cin, direction=PinDirection.INPUT),
                # Sum Outputs (S0..S3)
                "S1": CircuitPin(name="Σ1", pin_number="9",  x=700, y=140, dx=1.0, dy=0.0, value=s_bits[3], direction=PinDirection.OUTPUT),
                "S2": CircuitPin(name="Σ2", pin_number="6",  x=700, y=200, dx=1.0, dy=0.0, value=s_bits[2], direction=PinDirection.OUTPUT),
                "S3": CircuitPin(name="Σ3", pin_number="2",  x=700, y=260, dx=1.0, dy=0.0, value=s_bits[1], direction=PinDirection.OUTPUT),
                "S4": CircuitPin(name="Σ4", pin_number="15", x=700, y=320, dx=1.0, dy=0.0, value=s_bits[0], direction=PinDirection.OUTPUT),
                # Carry Out C4
                "C4": CircuitPin(name="C4", pin_number="14", x=700, y=420, dx=1.0, dy=0.0, value=final_cout, direction=PinDirection.OUTPUT),
            },
        )
    )

    # 6. Sum Output Ports (S0..S3)
    s_meta = [
        ("S0", s_bits[3], 140, "S1"),
        ("S1", s_bits[2], 200, "S2"),
        ("S2", s_bits[1], 260, "S3"),
        ("S3", s_bits[0], 320, "S4"),
    ]
    for port_name, val, y_pos, ic_sum_pin in s_meta:
        components.append(
            CircuitComponent(
                id=f"PORT_{port_name}",
                ref=port_name,
                value=str(val),
                type="port_output",
                x=840,
                y=y_pos - 10,
                width=50,
                height=20,
                pins={
                    "in": CircuitPin(
                        name=port_name,
                        pin_number="",
                        x=840,
                        y=y_pos,
                        dx=-1.0,
                        dy=0.0,
                        value=val,
                        direction=PinDirection.INPUT,
                    )
                },
            )
        )

    # 7. Carry-Out / Borrow Output Port
    flag_label = "Cout" if mode == 0 else "Borrow"
    flag_val = final_cout if mode == 0 else borrow_val
    components.append(
        CircuitComponent(
            id="PORT_FLAG",
            ref=flag_label,
            value=str(flag_val),
            type="port_output",
            x=840,
            y=410,
            width=65,
            height=20,
            pins={
                "in": CircuitPin(
                    name=flag_label,
                    pin_number="",
                    x=840,
                    y=420,
                    dx=-1.0,
                    dy=0.0,
                    value=flag_val,
                    direction=PinDirection.INPUT,
                )
            },
        )
    )

    # -------------------------------------------------------------------------
    # WIRES & JUNCTIONS
    # -------------------------------------------------------------------------
    wires: list[CircuitWire] = []
    junctions: list[CircuitJunction] = []

    # Word A Wires: straight from ports to U2.A1..A4
    for port_name, val, y_pos, pin_num, ic_pin_name in a_meta:
        wires.append(
            CircuitWire(
                id=f"w_{port_name}",
                net=port_name,
                from_pin=f"PORT_{port_name}.out",
                to_pin=f"U2.{ic_pin_name}",
                path=f"M 120,{y_pos} L 480,{y_pos}",
                value=val,
            )
        )

    # Word B Wires: from ports into XOR gate pin A
    for port_name, val, eff_val, y_pos, xor_ref, pin_num, ic_pin_name in b_meta:
        wires.append(
            CircuitWire(
                id=f"w_{port_name}",
                net=port_name,
                from_pin=f"PORT_{port_name}.out",
                to_pin=f"{xor_ref}.A",
                path=f"M 120,{y_pos} L 210,{y_pos} L 210,{y_pos - 8} L 260,{y_pos - 8}",
                value=val,
            )
        )

    # Mode Bus M Routing:
    # From PORT_MODE (135, 630) -> vertical bus line along X=230 up to Y=308
    # Branches feed into pin B of each XOR gate at (260, y_pos + 8)
    # And extends into U2.C0 at (480, 580)
    wires.append(
        CircuitWire(
            id="w_mode_trunk",
            net="MODE",
            from_pin="PORT_MODE.out",
            to_pin="U1D.B",
            path="M 135,630 L 230,630 L 230,548 L 260,548",
            value=mode,
        )
    )
    # Mode branches to U1C, U1B, U1A
    xor_mode_y = [548, 468, 388, 308]
    wires.append(CircuitWire(id="w_mode_u1c", net="MODE", from_pin="PORT_MODE.out", to_pin="U1C.B", path="M 230,548 L 230,468 L 260,468", value=mode))
    junctions.append(CircuitJunction(x=230, y=548, value=mode))

    wires.append(CircuitWire(id="w_mode_u1b", net="MODE", from_pin="PORT_MODE.out", to_pin="U1B.B", path="M 230,468 L 230,388 L 260,388", value=mode))
    junctions.append(CircuitJunction(x=230, y=468, value=mode))

    wires.append(CircuitWire(id="w_mode_u1a", net="MODE", from_pin="PORT_MODE.out", to_pin="U1A.B", path="M 230,388 L 230,308 L 260,308", value=mode))
    junctions.append(CircuitJunction(x=230, y=388, value=mode))

    # Mode to C0 (Cin of 74LS83)
    wires.append(
        CircuitWire(
            id="w_mode_c0",
            net="C0",
            from_pin="PORT_MODE.out",
            to_pin="U2.C0",
            path="M 230,630 L 400,630 L 400,580 L 480,580",
            value=effective_cin,
        )
    )
    junctions.append(CircuitJunction(x=230, y=630, value=mode))

    # XOR outputs to U2.B1..B4
    for port_name, val, eff_val, y_pos, xor_ref, pin_num, ic_pin_name in b_meta:
        wires.append(
            CircuitWire(
                id=f"w_eff_{port_name}",
                net=f"{port_name}_EFF",
                from_pin=f"{xor_ref}.Y",
                to_pin=f"U2.{ic_pin_name}",
                path=f"M 325,{y_pos} L 480,{y_pos}",
                value=eff_val,
            )
        )

    # Sum Outputs (U2.S1..S4 -> PORT_S0..S3)
    for port_name, val, y_pos, ic_sum_pin in s_meta:
        wires.append(
            CircuitWire(
                id=f"w_{port_name}",
                net=port_name,
                from_pin=f"U2.{ic_sum_pin}",
                to_pin=f"PORT_{port_name}.in",
                path=f"M 700,{y_pos} L 840,{y_pos}",
                value=val,
            )
        )

    # Final Carry / Borrow Wire
    wires.append(
        CircuitWire(
            id="w_cout_borrow",
            net=flag_label,
            from_pin="U2.C4",
            to_pin="PORT_FLAG.in",
            path="M 700,420 L 840,420",
            value=flag_val,
        )
    )

    now_str = datetime.datetime.now().strftime("%Y-%m-%d")

    return CircuitLayoutResponse(
        circuit_id="adder_subtractor_4bit",
        title="4-Bit Adder / Subtractor (IC 74LS83 + 74LS86)",
        sheet_info={
            "sheet": "/",
            "file": "adder_subtractor_74ls83.kicad_sch",
            "title": "4-Bit Adder / Subtractor (IC 74LS83 + 74LS86)",
            "size": "A4",
            "date": now_str,
            "rev": "v1.0",
            "company": "Digital Logic Simulation Suite",
            "id": "1/1",
        },
        canvas={"width": 1100, "height": 680},
        components=components,
        wires=wires,
        junctions=junctions,
        state={
            "a": a,
            "b": b,
            "mode": mode,
            "cin": effective_cin,
            "sum": res["sum"],
            "carry_out": final_cout if mode == 0 else None,
            "borrow": borrow_val if mode == 1 else None,
            "output": int(res["sum"], 2),
            "details": {
                "operation": res["operation"],
                "a_decimal": res["a_decimal"],
                "b_decimal": res["b_decimal"],
                "result_decimal": res["result_decimal"],
                "c4_raw": final_cout,
                "stages": stages,
            },
        },
    )
