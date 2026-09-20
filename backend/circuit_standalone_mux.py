"""
backend/circuit_standalone_mux.py — Layout generator and live simulation engine for the Standalone 4:1 Multiplexer
built from a single 74LS153 section.
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
from mux import mux_4to1, simulate_mux


def build_mux_4to1_circuit(select: str = "00", inputs: list[int] | None = None, strobe: int = 0) -> CircuitLayoutResponse:
    """
    Builds the schematic layout and computes live pin/wire states for the standalone 4:1 MUX.
    select: 2-bit string 'S1S0'
    inputs: list of 4 ints (0 or 1) [D0..D3]
    strobe: active-low enable (0 = enabled, 1 = disabled)
    """
    if inputs is None:
        inputs = [0, 0, 0, 0]

    if len(inputs) != 4:
        raise ValueError(f"inputs must contain exactly 4 elements, got {len(inputs)}")
    if len(select) != 2 or any(b not in "01" for b in select):
        raise ValueError(f"select must be a 2-bit binary string, got '{select}'")

    s1 = int(select[0])
    s0 = int(select[1])

    # Reuse verified logic from mux.py
    raw_y = mux_4to1(select, inputs)
    final_y = 0 if strobe == 1 else raw_y

    components: list[CircuitComponent] = []

    # 1. Data Input Ports D0..D3
    for i in range(4):
        y_pos = 110 + i * 40
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

    # 2. Strobe Port ~{1G}
    components.append(
        CircuitComponent(
            id="PORT_STROBE",
            ref="~{1G}",
            value=str(strobe),
            type="port_select",
            x=80,
            y=260,
            width=50,
            height=20,
            pins={
                "out": CircuitPin(
                    name="~{1G}",
                    pin_number="",
                    x=130,
                    y=270,
                    dx=1.0,
                    dy=0.0,
                    value=strobe,
                    direction=PinDirection.OUTPUT,
                )
            },
        )
    )

    # 3. Select Ports S1 (B) and S0 (A)
    components.append(
        CircuitComponent(
            id="PORT_S1",
            ref="S1 (B)",
            value=str(s1),
            type="port_select",
            x=80,
            y=300,
            width=50,
            height=20,
            pins={
                "out": CircuitPin(
                    name="S1",
                    pin_number="",
                    x=130,
                    y=310,
                    dx=1.0,
                    dy=0.0,
                    value=s1,
                    direction=PinDirection.OUTPUT,
                )
            },
        )
    )
    components.append(
        CircuitComponent(
            id="PORT_S0",
            ref="S0 (A)",
            value=str(s0),
            type="port_select",
            x=80,
            y=340,
            width=50,
            height=20,
            pins={
                "out": CircuitPin(
                    name="S0",
                    pin_number="",
                    x=130,
                    y=350,
                    dx=1.0,
                    dy=0.0,
                    value=s0,
                    direction=PinDirection.OUTPUT,
                )
            },
        )
    )

    # 4. IC U1A: 74LS153 Section 1
    # Bounding box anchor: (400, 75), width=180, height=310
    components.append(
        CircuitComponent(
            id="U1A",
            ref="U1A",
            value="74LS153",
            type="ic_block",
            x=400,
            y=75,
            width=180,
            height=310,
            pins={
                "1C0": CircuitPin(name="1C0", pin_number="6", x=400, y=110, dx=-1.0, dy=0.0, value=inputs[0], direction=PinDirection.INPUT),
                "1C1": CircuitPin(name="1C1", pin_number="5", x=400, y=150, dx=-1.0, dy=0.0, value=inputs[1], direction=PinDirection.INPUT),
                "1C2": CircuitPin(name="1C2", pin_number="4", x=400, y=190, dx=-1.0, dy=0.0, value=inputs[2], direction=PinDirection.INPUT),
                "1C3": CircuitPin(name="1C3", pin_number="3", x=400, y=230, dx=-1.0, dy=0.0, value=inputs[3], direction=PinDirection.INPUT),
                "1G":  CircuitPin(name="~{1G}", pin_number="1", x=400, y=270, dx=-1.0, dy=0.0, value=strobe, direction=PinDirection.INPUT),
                "B":   CircuitPin(name="B", pin_number="2", x=400, y=310, dx=-1.0, dy=0.0, value=s1, direction=PinDirection.INPUT),
                "A":   CircuitPin(name="A", pin_number="14", x=400, y=350, dx=-1.0, dy=0.0, value=s0, direction=PinDirection.INPUT),
                "1Y":  CircuitPin(name="1Y", pin_number="7", x=580, y=210, dx=1.0, dy=0.0, value=final_y, direction=PinDirection.OUTPUT),
            },
        )
    )

    # 5. Output Port Y
    components.append(
        CircuitComponent(
            id="PORT_Y",
            ref="Y",
            value=str(final_y),
            type="port_output",
            x=730,
            y=200,
            width=60,
            height=20,
            pins={
                "in": CircuitPin(
                    name="Y",
                    pin_number="",
                    x=730,
                    y=210,
                    dx=-1.0,
                    dy=0.0,
                    value=final_y,
                    direction=PinDirection.INPUT,
                )
            },
        )
    )

    # Wires
    wires: list[CircuitWire] = []
    # D0..D3 straight wires
    for i in range(4):
        y_pos = 110 + i * 40
        wires.append(
            CircuitWire(
                id=f"w_d{i}",
                net=f"D{i}",
                from_pin=f"PORT_D{i}.out",
                to_pin=f"U1A.1C{i}",
                path=f"M 130,{y_pos} L 400,{y_pos}",
                value=inputs[i],
            )
        )

    # Strobe wire
    wires.append(
        CircuitWire(
            id="w_strobe",
            net="STROBE",
            from_pin="PORT_STROBE.out",
            to_pin="U1A.1G",
            path="M 130,270 L 400,270",
            value=strobe,
        )
    )

    # S1 wire
    wires.append(
        CircuitWire(
            id="w_s1",
            net="S1",
            from_pin="PORT_S1.out",
            to_pin="U1A.B",
            path="M 130,310 L 400,310",
            value=s1,
        )
    )

    # S0 wire
    wires.append(
        CircuitWire(
            id="w_s0",
            net="S0",
            from_pin="PORT_S0.out",
            to_pin="U1A.A",
            path="M 130,350 L 400,350",
            value=s0,
        )
    )

    # Output wire
    wires.append(
        CircuitWire(
            id="w_y",
            net="1Y",
            from_pin="U1A.1Y",
            to_pin="PORT_Y.in",
            path="M 580,210 L 730,210",
            value=final_y,
        )
    )

    now_str = datetime.datetime.now().strftime("%Y-%m-%d")

    return CircuitLayoutResponse(
        circuit_id="mux_4to1",
        title="4:1 Multiplexer (Single 74LS153 Section)",
        sheet_info={
            "sheet": "/",
            "file": "mux_4to1.kicad_sch",
            "title": "4:1 Multiplexer (Single 74LS153 Section)",
            "size": "A4",
            "date": now_str,
            "rev": "v1.0",
            "company": "Digital Logic Simulation Suite",
            "id": "1/1",
        },
        canvas={"width": 1000, "height": 560},
        components=components,
        wires=wires,
        junctions=[],
        state={
            "select": select,
            "inputs": inputs,
            "strobe": strobe,
            "output": final_y,
            "details": {
                "s1": s1,
                "s0": s0,
                "raw_output": raw_y,
                "selected_channel": f"D{int(select, 2)}",
                "strobe_disabled": strobe == 1,
            },
        },
    )
