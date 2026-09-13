import pytest
from mux import mux_4to1, mux_8to1, MuxError
from comparator import compare_1bit, compare_4bit, ComparatorError
from adder_subtractor import add_4bit, add_subtract_4bit, full_adder, ArithmeticError_


# --- MUX ---
@pytest.mark.parametrize("sel_int", range(8))
def test_mux_8to1_routes_correctly(sel_int):
    select = format(sel_int, "03b")
    for active in range(8):
        inputs = [1 if i == active else 0 for i in range(8)]
        assert mux_8to1(select, inputs) == (1 if active == sel_int else 0)


def test_mux_invalid_select_length_raises():
    with pytest.raises(MuxError):
        mux_8to1("01", [0]*8)


def test_mux_invalid_input_count_raises():
    with pytest.raises(MuxError):
        mux_8to1("000", [0]*7)


# --- Comparator ---
@pytest.mark.parametrize("a,b", [(a, b) for a in range(16) for b in range(16)])
def test_compare_4bit_all_pairs(a, b):
    A, B = format(a, "04b"), format(b, "04b")
    result = compare_4bit(A, B)
    assert result["a_gt_b"] == int(a > b)
    assert result["a_lt_b"] == int(a < b)
    assert result["a_eq_b"] == int(a == b)


def test_compare_invalid_length_raises():
    with pytest.raises(ComparatorError):
        compare_4bit("101", "0000")


# --- Adder / Subtractor ---
@pytest.mark.parametrize("a,b,cin", [(a, b, cin) for a in range(16) for b in range(16) for cin in (0, 1)])
def test_add_4bit_all_combinations(a, b, cin):
    A, B = format(a, "04b"), format(b, "04b")
    result = add_4bit(A, B, cin=cin)
    total = a + b + cin
    assert result["sum"] == format(total % 16, "04b")
    assert result["carry_out"] == (1 if total >= 16 else 0)


@pytest.mark.parametrize("a,b", [(a, b) for a in range(16) for b in range(16)])
def test_subtract_all_pairs(a, b):
    A, B = format(a, "04b"), format(b, "04b")
    result = add_subtract_4bit(A, B, mode=1)
    diff = a - b
    assert result["sum"] == format(diff % 16, "04b")
    assert result["borrow"] == (1 if diff < 0 else 0)


def test_invalid_mode_raises():
    with pytest.raises(ArithmeticError_):
        add_subtract_4bit("0000", "0000", mode=2)
