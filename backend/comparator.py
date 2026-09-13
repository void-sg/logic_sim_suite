"""
engine/comparator.py — Magnitude Comparator module

Equations per PROJECT_LOGIC.md Section 3 — already verified against all 256
possible 4-bit input pairs before being written there. Re-verified here as
part of this module's own test.
"""


class ComparatorError(Exception):
    pass


def xnor(a: int, b: int) -> int:
    return 1 - (a ^ b)


def compare_1bit(a: int, b: int) -> dict:
    """Base case: single-bit comparison."""
    if a not in (0, 1) or b not in (0, 1):
        raise ComparatorError(f"compare_1bit expects single bits, got a={a}, b={b}")

    return {
        "a_gt_b": a & (1 - b),
        "a_lt_b": (1 - a) & b,
        "a_eq_b": xnor(a, b),
    }


def compare_4bit(A: str, B: str, cascade_in: dict | None = None) -> dict:
    """4-bit magnitude comparator with IC 74LS85-style cascade input/output.

    A, B: 4-bit strings, e.g. "1010"
    cascade_in: {"gt": 0/1, "lt": 0/1, "eq": 0/1} from a lower-priority stage.
                Defaults to the IC's documented tie-off for a standalone
                (non-cascaded) comparator: gt=0, lt=0, eq=1.
    """
    if len(A) != 4 or any(b not in "01" for b in A):
        raise ComparatorError(f"A must be a 4-bit string, got '{A}'")
    if len(B) != 4 or any(b not in "01" for b in B):
        raise ComparatorError(f"B must be a 4-bit string, got '{B}'")

    if cascade_in is None:
        cascade_in = {"gt": 0, "lt": 0, "eq": 1}

    a3, a2, a1, a0 = (int(x) for x in A)
    b3, b2, b1, b0 = (int(x) for x in B)

    eq3, eq2, eq1, eq0 = xnor(a3, b3), xnor(a2, b2), xnor(a1, b1), xnor(a0, b0)

    own_gt = (
        (a3 & (1 - b3))
        | (eq3 & a2 & (1 - b2))
        | (eq3 & eq2 & a1 & (1 - b1))
        | (eq3 & eq2 & eq1 & a0 & (1 - b0))
    )
    own_lt = (
        ((1 - a3) & b3)
        | (eq3 & (1 - a2) & b2)
        | (eq3 & eq2 & (1 - a1) & b1)
        | (eq3 & eq2 & eq1 & (1 - a0) & b0)
    )
    own_eq = eq3 & eq2 & eq1 & eq0

    out_gt = own_gt | (own_eq & cascade_in["gt"])
    out_lt = own_lt | (own_eq & cascade_in["lt"])
    out_eq = own_eq & cascade_in["eq"]

    return {"a_gt_b": out_gt, "a_lt_b": out_lt, "a_eq_b": out_eq}


if __name__ == "__main__":
    fails = 0
    for a in range(16):
        for b in range(16):
            A, B = format(a, "04b"), format(b, "04b")
            result = compare_4bit(A, B)
            expected = {
                "a_gt_b": int(a > b),
                "a_lt_b": int(a < b),
                "a_eq_b": int(a == b),
            }
            if result != expected:
                fails += 1
                print(f"MISMATCH A={A} B={B} got={result} expected={expected}")
    print(f"compare_4bit: {fails} mismatches out of 256 pairs")

    # sanity check the 1-bit base case too
    for a in (0, 1):
        for b in (0, 1):
            r = compare_1bit(a, b)
            assert r["a_gt_b"] == int(a > b)
            assert r["a_lt_b"] == int(a < b)
            assert r["a_eq_b"] == int(a == b)
    print("compare_1bit: all 4 cases correct")
