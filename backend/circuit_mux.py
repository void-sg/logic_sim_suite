"""
backend/circuit_mux.py — Layout generator and live simulation engine for the 8:1 Multiplexer
built from IC 74LS153 (dual 4:1 MUX sections) + 74LS04 Inverter + 74LS32 OR Gate.
Reuses verified logic from mux.py directly.
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
from mux import mux_4to1, mux_8to1, simulate_mux


def build_mux_8to1_circuit(select: str = "000", inputs: list[int] | None = None, strobe: int = 0) -> CircuitLayoutResponse:
    """
    Builds the schematic layout and computes live pin/wire states for the 8:1 MUX.
    select: 3-bit string 'S2S1S0'
    inputs: list of 8 ints (0 or 1) [D0..D7]
    strobe: active-low enable (0 = enabled, 1 = disabled)
    """
    if inputs is None:
        inputs = [0, 0, 0, 0, 0, 0, 0, 0]

    # Normalize inputs
    if len(inputs) != 8:
        raise ValueError(f"inputs must contain exactly 8 elements, got {len(inputs)}")
    if len(select) != 3 or any(b not in "01" for b in select):
        raise ValueError(f"select must be a 3-bit binary string, got '{select}'")

    s2 = int(select[0])
    s1 = int(select[1])
    s0 = int(select[2])
    s2_inv = 1 - s2

    # Reuse verified logic from mux.py directly
    shared_select = select[1:]
    raw_y1 = mux_4to1(shared_select, inputs[0:4])
    raw_y2 = mux_4to1(shared_select, inputs[4:8])

    # In 74LS153:
    # Section 1 strobe 1G is active-low: when 1G=0 enabled; when 1G=1 disabled (output 0).
    # Since S2=0 selects Section 1, 1G connects to S2 (or OR with global strobe).
    # Section 2 strobe 2G is active-low: when S2=1, S2_inv=0, so 2G connects to S2_inv.
    g1_val = s2 | strobe
    g2_val = s2_inv | strobe

    y1_val = 0 if g1_val == 1 else raw_y1
    y2_val = 0 if g2_val == 1 else raw_y2
    final_y = y1_val | y2_val  # matches mux_8to1() when strobe==0

    # Verification cross-check
    expected_y = 0 if strobe == 1 else mux_8to1(select, inputs)
    assert final_y == expected_y, f"Logic mismatch: {final_y} != {expected_y}"

    # -------------------------------------------------------------------------
    # COMPONENT COORDINATES & PIN DEFINITIONS
    # Canvas size: 1200 x 740
    # -------------------------------------------------------------------------

    components: list[CircuitComponent] = []

    # 1. INPUT PORTS (D0..D7, S2..S0, STROBE G)
    # Data Inputs D0..D3 (Section 1)
    for i in range(4):
        y_pos = 130 + i * 35
        components.append(
            CircuitComponent(
                id=f"PORT_D{i}",
                ref=f"D{i}",
                value=str(inputs[i]),
                type="port_input",
                x=80,
                y=y_pos - 10,
                width=50,
                height=20,
                pins={
                    "out": CircuitPin(
                        name=f"D{i}",
                        pin_number="",
                        x=130,
                        y=y_pos,
                        dx=1.0,
                        dy=0.0,
                        value=inputs[i],
                        direction=PinDirection.OUTPUT,
                    )
                },
            )
        )

    # Data Inputs D4..D7 (Section 2)
    for i in range(4, 8):
        y_pos = 380 + (i - 4) * 35
        components.append(
            CircuitComponent(
                id=f"PORT_D{i}",
                ref=f"D{i}",
                value=str(inputs[i]),
                type="port_input",
                x=80,
                y=y_pos - 10,
                width=50,
                height=20,
                pins={
                    "out": CircuitPin(
                        name=f"D{i}",
                        pin_number="",
                        x=130,
                        y=y_pos,
                        dx=1.0,
                        dy=0.0,
                        value=inputs[i],
                        direction=PinDirection.OUTPUT,
                    )
                },
            )
        )

    # Select Inputs S2, S1, S0
    select_meta = [
        ("S2", s2, 290, "MSB"),
        ("S1", s1, 570, "Mid"),
        ("S0", s0, 610, "LSB"),
    ]
    for s_name, s_val, y_pos, role in select_meta:
        components.append(
            CircuitComponent(
                id=f"PORT_{s_name}",
                ref=s_name,
                value=str(s_val),
                type="port_select",
                x=80,
                y=y_pos - 10,
                width=50,
                height=20,
                pins={
                    "out": CircuitPin(
                        name=s_name,
                        pin_number="",
                        x=130,
                        y=y_pos,
                        dx=1.0,
                        dy=0.0,
                        value=s_val,
                        direction=PinDirection.OUTPUT,
                    )
                },
            )
        )

    # Strobe Input (~G)
    components.append(
        CircuitComponent(
            id="PORT_STROBE",
            ref="~{G}",
            value=str(strobe),
            type="port_select",
            x=80,
            y=70,
            width=50,
            height=20,
            pins={
                "out": CircuitPin(
                    name="~{G}",
                    pin_number="",
                    x=130,
                    y=80,
                    dx=1.0,
                    dy=0.0,
                    value=strobe,
                    direction=PinDirection.OUTPUT,
                )
            },
        )
    )

    # 2. INVERTER U1 (74LS04 NOT Gate) for S2 inversion
    components.append(
        CircuitComponent(
            id="U1",
            ref="U1",
            value="74LS04",
            type="not_gate",
            x=230,
            y=270,
            width=60,
            height=40,
            pins={
                "A": CircuitPin(
                    name="1A",
                    pin_number="1",
                    x=230,
                    y=290,
                    dx=-1.0,
                    dy=0.0,
                    value=s2,
                    direction=PinDirection.INPUT,
                ),
                "Y": CircuitPin(
                    name="1Y",
                    pin_number="2",
                    x=290,
                    y=290,
                    dx=1.0,
                    dy=0.0,
                    value=s2_inv,
                    direction=PinDirection.OUTPUT,
                ),
            },
        )
    )

    # 3. IC U2A: 74LS153 Section 1 (Dual 4:1 MUX Unit A)
    # Box anchor: (420, 110), width=160, height=210
    components.append(
        CircuitComponent(
            id="U2A",
            ref="U2A",
            value="74LS153",
            type="ic_block",
            x=420,
            y=110,
            width=160,
            height=210,
            pins={
                "1C0": CircuitPin(name="1C0", pin_number="6", x=420, y=130, dx=-1.0, dy=0.0, value=inputs[0], direction=PinDirection.INPUT),
                "1C1": CircuitPin(name="1C1", pin_number="5", x=420, y=165, dx=-1.0, dy=0.0, value=inputs[1], direction=PinDirection.INPUT),
                "1C2": CircuitPin(name="1C2", pin_number="4", x=420, y=200, dx=-1.0, dy=0.0, value=inputs[2], direction=PinDirection.INPUT),
                "1C3": CircuitPin(name="1C3", pin_number="3", x=420, y=235, dx=-1.0, dy=0.0, value=inputs[3], direction=PinDirection.INPUT),
                "1G":  CircuitPin(name="~{1G}", pin_number="1", x=420, y=270, dx=-1.0, dy=0.0, value=g1_val, direction=PinDirection.INPUT),
                "B":   CircuitPin(name="B", pin_number="2", x=420, y=295, dx=-1.0, dy=0.0, value=s1, direction=PinDirection.INPUT),
                "A":   CircuitPin(name="A", pin_number="14", x=420, y=310, dx=-1.0, dy=0.0, value=s0, direction=PinDirection.INPUT),
                "1Y":  CircuitPin(name="1Y", pin_number="7", x=580, y=170, dx=1.0, dy=0.0, value=y1_val, direction=PinDirection.OUTPUT),
            },
        )
    )

    # 4. IC U2B: 74LS153 Section 2 (Dual 4:1 MUX Unit B)
    # Box anchor: (420, 360), width=160, height=210
    components.append(
        CircuitComponent(
            id="U2B",
            ref="U2B",
            value="74LS153",
            type="ic_block",
            x=420,
            y=360,
            width=160,
            height=210,
            pins={
                "2C0": CircuitPin(name="2C0", pin_number="10", x=420, y=380, dx=-1.0, dy=0.0, value=inputs[4], direction=PinDirection.INPUT),
                "2C1": CircuitPin(name="2C1", pin_number="11", x=420, y=415, dx=-1.0, dy=0.0, value=inputs[5], direction=PinDirection.INPUT),
                "2C2": CircuitPin(name="2C2", pin_number="12", x=420, y=450, dx=-1.0, dy=0.0, value=inputs[6], direction=PinDirection.INPUT),
                "2C3": CircuitPin(name="2C3", pin_number="13", x=420, y=485, dx=-1.0, dy=0.0, value=inputs[7], direction=PinDirection.INPUT),
                "2G":  CircuitPin(name="~{2G}", pin_number="15", x=420, y=520, dx=-1.0, dy=0.0, value=g2_val, direction=PinDirection.INPUT),
                "B":   CircuitPin(name="B", pin_number="2", x=420, y=545, dx=-1.0, dy=0.0, value=s1, direction=PinDirection.INPUT),
                "A":   CircuitPin(name="A", pin_number="14", x=420, y=560, dx=-1.0, dy=0.0, value=s0, direction=PinDirection.INPUT),
                "2Y":  CircuitPin(name="2Y", pin_number="9", x=580, y=420, dx=1.0, dy=0.0, value=y2_val, direction=PinDirection.OUTPUT),
            },
        )
    )

    # 5. IC U3: 74LS32 OR Gate (combines 1Y and 2Y)
    # Box anchor: (720, 270), width=70, height=60
    components.append(
        CircuitComponent(
            id="U3",
            ref="U3",
            value="74LS32",
            type="or_gate",
            x=720,
            y=270,
            width=70,
            height=60,
            pins={
                "1A": CircuitPin(name="1A", pin_number="1", x=720, y=285, dx=-1.0, dy=0.0, value=y1_val, direction=PinDirection.INPUT),
                "1B": CircuitPin(name="1B", pin_number="2", x=720, y=315, dx=-1.0, dy=0.0, value=y2_val, direction=PinDirection.INPUT),
                "1Y": CircuitPin(name="1Y", pin_number="3", x=790, y=300, dx=1.0, dy=0.0, value=final_y, direction=PinDirection.OUTPUT),
            },
        )
    )

    # 6. OUTPUT PORT Y
    components.append(
        CircuitComponent(
            id="PORT_Y",
            ref="Y",
            value=str(final_y),
            type="port_output",
            x=880,
            y=290,
            width=60,
            height=20,
            pins={
                "in": CircuitPin(
                    name="Y",
                    pin_number="",
                    x=880,
                    y=300,
                    dx=-1.0,
                    dy=0.0,
                    value=final_y,
                    direction=PinDirection.INPUT,
                )
            },
        )
    )

    # -------------------------------------------------------------------------
    # MANHATTAN ORTHOGONAL WIRES
    # -------------------------------------------------------------------------
    wires: list[CircuitWire] = []
    junctions: list[CircuitJunction] = []

    # Wires for Data inputs D0..D3 -> U2A:1C0..1C3
    for i in range(4):
        y_pos = 130 + i * 35
        wires.append(
            CircuitWire(
                id=f"w_d{i}",
                net=f"D{i}",
                from_pin=f"PORT_D{i}.out",
                to_pin=f"U2A.1C{i}",
                path=f"M 130,{y_pos} L 420,{y_pos}",
                value=inputs[i],
            )
        )

    # Wires for Data inputs D4..D7 -> U2B:2C0..2C3
    for i in range(4, 8):
        y_pos = 380 + (i - 4) * 35
        wires.append(
            CircuitWire(
                id=f"w_d{i}",
                net=f"D{i}",
                from_pin=f"PORT_D{i}.out",
                to_pin=f"U2B.2C{i-4}",
                path=f"M 130,{y_pos} L 420,{y_pos}",
                value=inputs[i],
            )
        )

    # Wire S2 -> U1.A (Inverter input) and U2A.1G (Section 1 enable)
    # S2 port is at (130, 290)
    # Split point at (180, 290):
    #   - branch 1: straight to U1.A at (230, 290)
    #   - branch 2: up to (180, 270) then to U2A.1G at (420, 270)
    wires.append(
        CircuitWire(
            id="w_s2_main",
            net="S2",
            from_pin="PORT_S2.out",
            to_pin="U1.A",
            path="M 130,290 L 230,290",
            value=s2,
        )
    )
    wires.append(
        CircuitWire(
            id="w_s2_g1",
            net="S2",
            from_pin="PORT_S2.out",
            to_pin="U2A.1G",
            path="M 180,290 L 180,270 L 420,270",
            value=s2,
        )
    )
    junctions.append(CircuitJunction(x=180, y=290, value=s2))

    # Wire U1.Y (Inverter output) -> U2B.2G (Section 2 enable)
    # From (290, 290) -> (330, 290) -> (330, 520) -> (420, 520)
    wires.append(
        CircuitWire(
            id="w_s2_inv_g2",
            net="S2_INV",
            from_pin="U1.Y",
            to_pin="U2B.2G",
            path="M 290,290 L 330,290 L 330,520 L 420,520",
            value=s2_inv,
        )
    )

    # Wire S1 -> U2A.B and U2B.B
    # S1 port at (130, 570)
    # Route through bus X=360:
    # From (130, 570) -> (360, 570)
    #   - branch up to U2A.B at (420, 295): (360, 570) -> (360, 295) -> (420, 295)
    #   - branch to U2B.B at (420, 545): (360, 570) -> (360, 545) -> (420, 545)
    wires.append(
        CircuitWire(
            id="w_s1_bus",
            net="S1",
            from_pin="PORT_S1.out",
            to_pin="U2B.B",
            path="M 130,570 L 360,570 L 360,545 L 420,545",
            value=s1,
        )
    )
    wires.append(
        CircuitWire(
            id="w_s1_u2a",
            net="S1",
            from_pin="PORT_S1.out",
            to_pin="U2A.B",
            path="M 360,545 L 360,295 L 420,295",
            value=s1,
        )
    )
    junctions.append(CircuitJunction(x=360, y=545, value=s1))

    # Wire S0 -> U2A.A and U2B.A
    # S0 port at (130, 610)
    # Route through bus X=380:
    # From (130, 610) -> (380, 610)
    #   - branch up to U2A.A at (420, 310): (380, 610) -> (380, 310) -> (420, 310)
    #   - branch to U2B.A at (420, 560): (380, 610) -> (380, 560) -> (420, 560)
    wires.append(
        CircuitWire(
            id="w_s0_bus",
            net="S0",
            from_pin="PORT_S0.out",
            to_pin="U2B.A",
            path="M 130,610 L 380,610 L 380,560 L 420,560",
            value=s0,
        )
    )
    wires.append(
        CircuitWire(
            id="w_s0_u2a",
            net="S0",
            from_pin="PORT_S0.out",
            to_pin="U2A.A",
            path="M 380,560 L 380,310 L 420,310",
            value=s0,
        )
    )
    junctions.append(CircuitJunction(x=380, y=560, value=s0))

    # Output 1Y from U2A (580, 170) -> U3.1A at (720, 285)
    # Path: (580, 170) -> (660, 170) -> (660, 285) -> (720, 285)
    wires.append(
        CircuitWire(
            id="w_u2a_y1",
            net="1Y",
            from_pin="U2A.1Y",
            to_pin="U3.1A",
            path="M 580,170 L 660,170 L 660,285 L 720,285",
            value=y1_val,
        )
    )

    # Output 2Y from U2B (580, 420) -> U3.1B at (720, 315)
    # Path: (580, 420) -> (660, 420) -> (660, 315) -> (720, 315)
    wires.append(
        CircuitWire(
            id="w_u2b_y2",
            net="2Y",
            from_pin="U2B.2Y",
            to_pin="U3.1B",
            path="M 580,420 L 660,420 L 660,315 L 720,315",
            value=y2_val,
        )
    )

    # Final Output U3.1Y at (790, 300) -> PORT_Y.in at (880, 300)
    wires.append(
        CircuitWire(
            id="w_final_y",
            net="Y",
            from_pin="U3.1Y",
            to_pin="PORT_Y.in",
            path="M 790,300 L 880,300",
            value=final_y,
        )
    )

    now_str = datetime.datetime.now().strftime("%Y-%m-%d")

    return CircuitLayoutResponse(
        circuit_id="mux_8to1",
        title="8:1 Multiplexer (Dual 74LS153 + Inverter + OR)",
        sheet_info={
            "sheet": "/",
            "file": "mux_8to1.kicad_sch",
            "title": "8:1 Multiplexer (IC 74LS153 Composition)",
            "size": "A4",
            "date": now_str,
            "rev": "v1.0",
            "company": "Digital Logic Simulation Suite",
            "id": "1/1",
        },
        canvas={"width": 1200, "height": 740},
        components=components,
        wires=wires,
        junctions=junctions,
        state={
            "select": select,
            "inputs": inputs,
            "strobe": strobe,
            "output": final_y,
            "details": {
                "s2": s2,
                "s1": s1,
                "s0": s0,
                "s2_inv": s2_inv,
                "section1_out": raw_y1,
                "section2_out": raw_y2,
                "section1_gated": y1_val,
                "section2_gated": y2_val,
                "active_section": 0 if strobe == 1 else (2 if s2 == 1 else 1),
            },
        },
    )
