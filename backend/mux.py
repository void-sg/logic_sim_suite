"""
engine/mux.py — Multiplexer module

Mirrors IC 74LS153 (dual 4:1 MUX) composition: the 8:1 MUX is NOT built by
directly indexing into an 8-element list — it's built by combining two 4:1
MUX sections via enable/OR logic, exactly like the real IC, per the design
in PROJECT_LOGIC.md Section 4.
"""


class MuxError(Exception):
    pass


def mux_2to1(select: str, inputs: list[int]) -> int:
    """2:1 MUX. select is a 1-bit string 'S0'. inputs = [D0, D1]."""
    if len(select) != 1 or select not in ("0", "1"):
        raise MuxError(f"select must be a 1-bit string, got '{select}'")
    if len(inputs) != 2 or any(b not in (0, 1) for b in inputs):
        raise MuxError(f"inputs must be exactly 2 bits (0/1), got {inputs}")

    s0 = int(select[0])
    D0, D1 = inputs
    return ((1 - s0) & D0) | (s0 & D1)


def mux_4to1(select: str, inputs: list[int]) -> int:
    """4:1 MUX. select is a 2-bit string 'S1S0'. inputs = [D0, D1, D2, D3]."""
    if len(select) != 2 or any(b not in "01" for b in select):
        raise MuxError(f"select must be a 2-bit string, got '{select}'")
    if len(inputs) != 4 or any(b not in (0, 1) for b in inputs):
        raise MuxError(f"inputs must be exactly 4 bits (0/1), got {inputs}")

    s1, s0 = int(select[0]), int(select[1])
    D0, D1, D2, D3 = inputs

    Y = (
        ((1 - s1) & (1 - s0) & D0)
        | ((1 - s1) & s0 & D1)
        | (s1 & (1 - s0) & D2)
        | (s1 & s0 & D3)
    )
    return Y


def mux_8to1(select: str, inputs: list[int]) -> int:
    """8:1 MUX built from TWO 4:1 sections + enable/OR combining logic —
    this is the actual IC 74LS153-style composition, not direct indexing.
    select is a 3-bit string 'S2S1S0'. inputs = [D0..D7].
    """
    if len(select) != 3 or any(b not in "01" for b in select):
        raise MuxError(f"select must be a 3-bit string, got '{select}'")
    if len(inputs) != 8 or any(b not in (0, 1) for b in inputs):
        raise MuxError(f"inputs must be exactly 8 bits (0/1), got {inputs}")

    s2 = int(select[0])
    shared_select = select[1:]  # S1,S0 shared by both 4:1 sections

    Y1 = mux_4to1(shared_select, inputs[0:4])  # section 1 (D0-D3)
    Y2 = mux_4to1(shared_select, inputs[4:8])  # section 2 (D4-D7)

    # enable logic: only one section's output survives, other forced to 0
    Y1_gated = Y1 & (1 - s2)
    Y2_gated = Y2 & s2

    return Y1_gated | Y2_gated


def simulate_mux(select: str, inputs: list[int], strobe: int = 0) -> dict:
    """Unified MUX simulator supporting 2:1, 4:1, and 8:1 MUX with active-low strobe/enable.

    strobe=0: MUX enabled (normal operation)
    strobe=1: MUX disabled (output forced to 0, per IC 74LS153 active-low G pin)
    """
    if strobe not in (0, 1):
        raise MuxError(f"strobe must be 0 (active) or 1 (disabled), got {strobe}")

    if len(inputs) == 2 and len(select) == 1:
        out = mux_2to1(select, inputs)
        sel_idx = int(select, 2)
        output = 0 if strobe == 1 else out
        return {
            "select": select,
            "inputs": inputs,
            "output": output,
            "mux_type": "2:1",
            "selected_channel": f"D{sel_idx}",
            "selected_index": sel_idx,
            "details": {"s0": int(select[0]), "strobe": strobe, "raw_output": out}
        }
    elif len(inputs) == 4 and len(select) == 2:
        out = mux_4to1(select, inputs)
        sel_idx = int(select, 2)
        output = 0 if strobe == 1 else out
        return {
            "select": select,
            "inputs": inputs,
            "output": output,
            "mux_type": "4:1",
            "selected_channel": f"D{sel_idx}",
            "selected_index": sel_idx,
            "details": {"s1": int(select[0]), "s0": int(select[1]), "strobe": strobe, "raw_output": out}
        }
    elif len(inputs) == 8 and len(select) == 3:
        if any(b not in "01" for b in select):
            raise MuxError(f"select must contain only 0 and 1, got '{select}'")
        if any(b not in (0, 1) for b in inputs):
            raise MuxError(f"inputs must contain only 0 and 1, got {inputs}")

        s2 = int(select[0])
        shared_select = select[1:]
        Y1 = mux_4to1(shared_select, inputs[0:4])
        Y2 = mux_4to1(shared_select, inputs[4:8])
        Y1_gated = Y1 & (1 - s2)
        Y2_gated = Y2 & s2
        raw_out = Y1_gated | Y2_gated
        output = 0 if strobe == 1 else raw_out
        sel_idx = int(select, 2)

        return {
            "select": select,
            "inputs": inputs,
            "output": output,
            "mux_type": "8:1",
            "selected_channel": f"D{sel_idx}",
            "selected_index": sel_idx,
            "details": {
                "s2": s2,
                "s1": int(select[1]),
                "s0": int(select[2]),
                "strobe": strobe,
                "section1_out": Y1,
                "section2_out": Y2,
                "active_section": 2 if s2 == 1 else 1,
                "raw_output": raw_out
            }
        }
    else:
        raise MuxError(
            f"Unsupported configuration: select '{select}' (length {len(select)}) "
            f"with {len(inputs)} inputs. Expected 1 select bit for 2 inputs, "
            f"2 select bits for 4 inputs, or 3 select bits for 8 inputs."
        )


if __name__ == "__main__":
    # exhaustive verification: every select value routes the correct input,
    # checked with a basis-vector pattern (only one input=1 at a time) so
    # any wrong wiring shows up immediately, plus a mixed pattern
    fails = 0

    for sel_int in range(8):
        select = format(sel_int, "03b")
        for active in range(8):
            inputs = [1 if i == active else 0 for i in range(8)]
            result = mux_8to1(select, inputs)
            expected = 1 if active == sel_int else 0
            if result != expected:
                fails += 1
                print(f"MISMATCH select={select} active_input={active} got={result} expected={expected}")

    mixed = [1, 0, 1, 1, 0, 0, 1, 0]
    for sel_int in range(8):
        select = format(sel_int, "03b")
        result = mux_8to1(select, mixed)
        expected = mixed[sel_int]
        if result != expected:
            fails += 1
            print(f"MISMATCH (mixed pattern) select={select} got={result} expected={expected}")

    print(f"mux_8to1: {fails} mismatches out of {8*8 + 8} checks")
