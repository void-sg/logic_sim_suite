"""
engine/code_conversions.py — Universal Code Conversion Engine

Core idea: every code (Binary, Gray, BCD, Excess-3, 2's Complement) is a
different bit pattern representing the SAME underlying decimal value.
Conversion between ANY two codes routes through that decimal value:

    universal_convert(from_code, to_code, bits):
        decimal_value = from_code.decode(bits)
        validate decimal_value against BOTH codes' domains
        return to_code.encode(decimal_value)

This means adding a 6th code later only means registering one new entry —
every existing code can already convert to/from it for free.
"""
from dataclasses import dataclass
from typing import Callable


@dataclass
class Code:
    name: str
    width: int
    domain: range  # which decimal values this code can legally represent
    encode: Callable[[int], str]  # decimal -> bit string
    decode: Callable[[str], int]  # bit string -> decimal
    description: str


class ConversionError(Exception):
    pass


# --- encode/decode implementations ---

def _bin_encode(n: int, width: int = 4) -> str:
    return format(n, f"0{width}b")


def _bin_decode(bits: str) -> int:
    return int(bits, 2)


def _gray_encode(n: int, width: int = 4) -> str:
    return format(n ^ (n >> 1), f"0{width}b")


def _gray_decode(bits: str) -> int:
    n = int(bits, 2)
    mask = n
    while mask:
        mask >>= 1
        n ^= mask
    return n


def _xs3_encode(n: int) -> str:
    return format(n + 3, "04b")


def _xs3_decode(bits: str) -> int:
    return int(bits, 2) - 3


def _twos_complement_encode(n: int) -> str:
    return format((16 - n) % 16, "04b")


def _twos_complement_decode(bits: str) -> int:
    n = int(bits, 2)
    return (16 - n) % 16


# --- registry: every code the engine knows about ---
# Binary and Gray span the full 4-bit range (0-15).
# BCD and Excess-3 only span valid decimal digits (0-9) — BCD's encode/decode
# are literally the same as Binary's; what makes it "BCD" is the restricted
# domain, not different bit logic.

REGISTRY: dict[str, Code] = {
    "Binary": Code("Binary", 4, range(0, 16), _bin_encode, _bin_decode,
                    "Standard 4-bit binary, full range 0-15"),
    "Gray": Code("Gray", 4, range(0, 16), _gray_encode, _gray_decode,
                 "Reflected binary code, full range 0-15"),
    "2's Complement": Code("2's Complement", 4, range(0, 16),
                            _twos_complement_encode, _twos_complement_decode,
                            "4-bit two's complement, full range 0-15"),
    "BCD": Code("BCD", 4, range(0, 10), _bin_encode, _bin_decode,
                "Binary-Coded Decimal, digits 0-9 only"),
    "Excess-3": Code("Excess-3", 4, range(0, 10), _xs3_encode, _xs3_decode,
                      "BCD digit + 3, digits 0-9 only"),
}


def universal_convert(from_code: str, to_code: str, bits: str) -> dict:
    """Converts `bits` from `from_code` to `to_code`.

    Returns a dict with the result AND the intermediate decimal value.
    Raises ConversionError (never returns None/False) on any invalid input,
    unknown code name, or domain mismatch between the two codes.
    """
    if from_code not in REGISTRY:
        raise ConversionError(f"Unknown code: {from_code}")
    if to_code not in REGISTRY:
        raise ConversionError(f"Unknown code: {to_code}")

    src = REGISTRY[from_code]
    dst = REGISTRY[to_code]

    if len(bits) != src.width or any(b not in "01" for b in bits):
        raise ConversionError(f"'{bits}' is not a valid {src.width}-bit binary string")

    value = src.decode(bits)

    if value not in src.domain:
        raise ConversionError(
            f"'{bits}' decodes to {value}, which is outside {from_code}'s "
            f"valid domain ({src.domain.start}-{src.domain.stop - 1})"
        )

    if value not in dst.domain:
        raise ConversionError(
            f"Decimal value {value} has no valid {to_code} representation "
            f"({to_code}'s domain is {dst.domain.start}-{dst.domain.stop - 1})."
        )

    result_bits = dst.encode(value)
    return {
        "input_bits": bits,
        "decimal_value": value,
        "output_bits": result_bits,
        "from_code": from_code,
        "to_code": to_code,
    }


if __name__ == "__main__":
    print(universal_convert("Binary", "Gray", "1000"))
    print(universal_convert("BCD", "Excess-3", "0101"))
    print(universal_convert("Gray", "BCD", "1100"))
    try:
        universal_convert("Binary", "Excess-3", "1010")  # decimal 10, invalid for XS3
    except ConversionError as e:
        print("Expected error:", e)
