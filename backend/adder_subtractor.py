"""
engine/adder_subtractor.py — 4-bit Adder / Subtractor module

Built from a ripple-carry chain of full adders. Subtraction reuses the
SAME adder hardware — this is the real ALU trick: A - B = A + (2's
complement of B), and 2's complement = invert B, then add with Cin=1.
A single "mode" bit controls both the inversion (via XOR) and the initial
carry-in, so add and subtract share one circuit instead of needing two.
"""


class ArithmeticError_(Exception):
    pass


def half_adder(a: int, b: int) -> dict:
    return {"sum": a ^ b, "carry": a & b}


def full_adder(a: int, b: int, cin: int) -> dict:
    s = a ^ b ^ cin
    carry = (a & b) | (cin & (a ^ b))
    return {"sum": s, "carry": carry}


def add_4bit(A: str, B: str, cin: int = 0) -> dict:
    """Ripple-carry 4-bit adder. Returns 4-bit sum string + final carry-out."""
    if len(A) != 4 or any(b not in "01" for b in A):
        raise ArithmeticError_(f"A must be a 4-bit string, got '{A}'")
    if len(B) != 4 or any(b not in "01" for b in B):
        raise ArithmeticError_(f"B must be a 4-bit string, got '{B}'")

    a_bits = [int(x) for x in A][::-1]  # LSB first for the ripple chain
    b_bits = [int(x) for x in B][::-1]

    sum_bits = []
    carry = cin
    for a_bit, b_bit in zip(a_bits, b_bits):
        result = full_adder(a_bit, b_bit, carry)
        sum_bits.append(result["sum"])
        carry = result["carry"]

    sum_bits.reverse()  # back to MSB-first
    return {"sum": "".join(str(b) for b in sum_bits), "carry_out": carry}


def add_subtract_4bit(A: str, B: str, mode: int) -> dict:
    """mode=0: A+B (addition). mode=1: A-B (subtraction via 2's complement).

    The trick: XOR every bit of B with `mode`. mode=0 -> B unchanged.
    mode=1 -> B fully inverted (that's the 'invert' half of 2's complement).
    Then feed `mode` itself in as the carry-in (the '+1' half of 2's
    complement). One shared adder, one control bit, both operations.
    """
    if mode not in (0, 1):
        raise ArithmeticError_(f"mode must be 0 (add) or 1 (subtract), got {mode}")

    b_bits = [int(x) for x in B]
    b_used = "".join(str(bit ^ mode) for bit in b_bits)

    result = add_4bit(A, b_used, cin=mode)

    if mode == 1:
        # for subtraction, the adder's carry-out is the NOT-borrow flag:
        # carry_out=1 means no borrow occurred (A >= B), 0 means a borrow did
        result["borrow"] = 1 - result["carry_out"]
        del result["carry_out"]

    return result


if __name__ == "__main__":
    fails = 0

    # verify addition against plain Python arithmetic, all 16x16 pairs,
    # for every possible carry-in
    for cin in (0, 1):
        for a in range(16):
            for b in range(16):
                A, B = format(a, "04b"), format(b, "04b")
                result = add_4bit(A, B, cin=cin)
                total = a + b + cin
                expected_sum = format(total % 16, "04b")
                expected_carry = 1 if total >= 16 else 0
                if result["sum"] != expected_sum or result["carry_out"] != expected_carry:
                    fails += 1
                    print(f"ADD MISMATCH A={A} B={B} cin={cin} got={result} "
                          f"expected sum={expected_sum} carry={expected_carry}")
    print(f"add_4bit: {fails} mismatches out of {16*16*2} checks")

    # verify subtraction (mode=1) against plain Python, including negative results
    fails2 = 0
    for a in range(16):
        for b in range(16):
            A, B = format(a, "04b"), format(b, "04b")
            result = add_subtract_4bit(A, B, mode=1)
            diff = a - b
            expected_sum = format(diff % 16, "04b")  # 2's complement wraparound
            expected_borrow = 1 if diff < 0 else 0
            if result["sum"] != expected_sum or result["borrow"] != expected_borrow:
                fails2 += 1
                print(f"SUB MISMATCH A={A} B={B} got={result} "
                      f"expected sum={expected_sum} borrow={expected_borrow}")
    print(f"add_subtract_4bit (mode=1): {fails2} mismatches out of {16*16} checks")
