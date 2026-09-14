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


def test_add_subtract_enriched_fields():
    res_add = add_subtract_4bit("0101", "0011", mode=0)
    assert res_add["operation"] == "ADD"
    assert res_add["a_decimal"] == 5
    assert res_add["b_decimal"] == 3
    assert res_add["result_decimal"] == 8
    assert len(res_add["stages"]) == 4

    res_sub = add_subtract_4bit("0101", "0011", mode=1)
    assert res_sub["operation"] == "SUBTRACT"
    assert res_sub["borrow"] == 0
    assert res_sub["result_decimal"] == 2

    # Addition with custom cin
    res_cin = add_subtract_4bit("0101", "0011", mode=0, cin=1)
    assert res_cin["sum"] == "1001"
    assert res_cin["result_decimal"] == 9


# --- Mux 2:1 & Simulate Mux ---
from mux import mux_2to1, simulate_mux


def test_mux_2to1():
    assert mux_2to1("0", [1, 0]) == 1
    assert mux_2to1("1", [1, 0]) == 0
    with pytest.raises(MuxError):
        mux_2to1("00", [1, 0])


def test_simulate_mux_all_sizes():
    # 2:1
    sim2 = simulate_mux("1", [0, 1])
    assert sim2["output"] == 1
    assert sim2["mux_type"] == "2:1"

    # 4:1
    sim4 = simulate_mux("10", [0, 0, 1, 0])
    assert sim4["output"] == 1
    assert sim4["mux_type"] == "4:1"
    assert sim4["selected_channel"] == "D2"

    # 8:1
    sim8 = simulate_mux("101", [0, 0, 0, 0, 0, 1, 0, 0])
    assert sim8["output"] == 1
    assert sim8["mux_type"] == "8:1"
    assert sim8["selected_channel"] == "D5"
    assert sim8["details"]["active_section"] == 2

    # Strobe disabled
    strobe_disabled = simulate_mux("101", [0, 0, 0, 0, 0, 1, 0, 0], strobe=1)
    assert strobe_disabled["output"] == 0


def test_compare_enriched_fields():
    res_gt = compare_4bit("1010", "0101")
    assert res_gt["relation"] == "A > B"
    assert res_gt["a_decimal"] == 10
    assert res_gt["b_decimal"] == 5
    assert len(res_gt["bit_comparisons"]) == 4

