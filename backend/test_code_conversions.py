import pytest
from code_conversions import universal_convert, ConversionError, REGISTRY

BIN_GRAY = {
    0: ("0000", "0000"), 1: ("0001", "0001"), 2: ("0010", "0011"), 3: ("0011", "0010"),
    4: ("0100", "0110"), 5: ("0101", "0111"), 6: ("0110", "0101"), 7: ("0111", "0100"),
    8: ("1000", "1100"), 9: ("1001", "1101"), 10: ("1010", "1111"), 11: ("1011", "1110"),
    12: ("1100", "1010"), 13: ("1101", "1011"), 14: ("1110", "1001"), 15: ("1111", "1000"),
}
BCD_XS3 = {n: format(n + 3, "04b") for n in range(10)}


@pytest.mark.parametrize("n,binary,gray", [(n, b, g) for n, (b, g) in BIN_GRAY.items()])
def test_binary_to_gray_all_16(n, binary, gray):
    result = universal_convert("Binary", "Gray", binary)
    assert result["output_bits"] == gray
    assert result["decimal_value"] == n


@pytest.mark.parametrize("n,binary,gray", [(n, b, g) for n, (b, g) in BIN_GRAY.items()])
def test_gray_to_binary_all_16(n, binary, gray):
    assert universal_convert("Gray", "Binary", gray)["output_bits"] == binary


@pytest.mark.parametrize("n,binary,gray", [(n, b, g) for n, (b, g) in BIN_GRAY.items() if n <= 9])
def test_bcd_to_gray_matches_binary_gray(n, binary, gray):
    assert universal_convert("BCD", "Gray", binary)["output_bits"] == gray


@pytest.mark.parametrize("n,xs3", list(BCD_XS3.items()))
def test_bcd_to_excess3_all_10(n, xs3):
    assert universal_convert("BCD", "Excess-3", format(n, "04b"))["output_bits"] == xs3


@pytest.mark.parametrize("n,xs3", list(BCD_XS3.items()))
def test_excess3_to_bcd_all_10(n, xs3):
    assert universal_convert("Excess-3", "BCD", xs3)["output_bits"] == format(n, "04b")


def test_bcd_rejects_values_above_9():
    with pytest.raises(ConversionError):
        universal_convert("BCD", "Gray", "1010")


def test_binary_to_excess3_out_of_domain_raises():
    with pytest.raises(ConversionError):
        universal_convert("Binary", "Excess-3", "1010")


def test_invalid_bit_string_raises():
    with pytest.raises(ConversionError):
        universal_convert("Binary", "Gray", "10x")


def test_unknown_code_raises():
    with pytest.raises(ConversionError):
        universal_convert("Octal", "Gray", "1010")


def test_round_trip_every_registered_code_pair():
    codes = list(REGISTRY.keys())
    for c1 in codes:
        for c2 in codes:
            if c1 == c2:
                continue
            shared = range(
                max(REGISTRY[c1].domain.start, REGISTRY[c2].domain.start),
                min(REGISTRY[c1].domain.stop, REGISTRY[c2].domain.stop),
            )
            for n in shared:
                bits1 = REGISTRY[c1].encode(n)
                forward = universal_convert(c1, c2, bits1)
                backward = universal_convert(c2, c1, forward["output_bits"])
                assert backward["output_bits"] == bits1
