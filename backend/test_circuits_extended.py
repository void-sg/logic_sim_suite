"""
backend/test_circuits_extended.py — Automated tests for the 3 extended KiCad circuit endpoints:
- Standalone 4:1 Multiplexer (/circuit/mux-4to1)
- 4-Bit Magnitude Comparator (/circuit/comparator-4bit)
- 4-Bit Adder / Subtractor (/circuit/adder-subtractor-4bit)
"""
import pytest
from fastapi.testclient import TestClient
from main import app
from circuit_standalone_mux import build_mux_4to1_circuit
from circuit_comparator import build_comparator_4bit_circuit
from circuit_adder_subtractor import build_adder_subtractor_4bit_circuit
from mux import mux_4to1
from comparator import compare_4bit
from adder_subtractor import add_subtract_4bit

client = TestClient(app)


# =============================================================================
# 1. STANDALONE 4:1 MUX TESTS
# =============================================================================
def test_mux_4to1_all_selects():
    """Verify 4:1 MUX circuit layout outputs strictly match mux_4to1 for all 4 select channels."""
    for i in range(4):
        select = f"{i:02b}"
        inputs = [1 if j == i else 0 for j in range(4)]
        resp = build_mux_4to1_circuit(select=select, inputs=inputs, strobe=0)
        expected = mux_4to1(select, inputs)
        assert resp.state["output"] == 1
        assert resp.state["output"] == expected
        assert resp.state["details"]["selected_channel"] == f"D{i}"


def test_mux_4to1_strobe_disable():
    """When strobe=1, output must be forced to 0."""
    resp = build_mux_4to1_circuit(select="11", inputs=[0, 0, 0, 1], strobe=1)
    assert resp.state["output"] == 0
    assert resp.state["details"]["strobe_disabled"] is True


def test_mux_4to1_api_get_and_post():
    """Verify GET and POST endpoints for /circuit/mux-4to1."""
    # GET
    res_get = client.get("/circuit/mux-4to1?select=10&inputs=0,0,1,0&strobe=0")
    assert res_get.status_code == 200
    data_get = res_get.json()
    assert data_get["circuit_id"] == "mux_4to1"
    assert data_get["state"]["output"] == 1

    # POST
    payload = {"select": "01", "inputs": [0, 1, 0, 0], "strobe": 0}
    res_post = client.post("/circuit/mux-4to1", json=payload)
    assert res_post.status_code == 200
    data_post = res_post.json()
    assert data_post["state"]["output"] == 1


# =============================================================================
# 2. 4-BIT MAGNITUDE COMPARATOR TESTS
# =============================================================================
def test_comparator_4bit_logic_equivalence():
    """Verify comparator circuit pin & wire states match compare_4bit for GT, LT, and EQ cases."""
    test_cases = [
        ("1010", "0101", 0, 0, 1),  # 10 > 5
        ("0011", "1100", 0, 0, 1),  # 3 < 12
        ("0111", "0111", 0, 0, 1),  # 7 == 7 (cascade_eq=1)
        ("1000", "1000", 1, 0, 0),  # equal bits, but cascade IA>B = 1 -> resolved to A > B
        ("1000", "1000", 0, 1, 0),  # equal bits, but cascade IA<B = 1 -> resolved to A < B
    ]
    for a, b, cas_gt, cas_lt, cas_eq in test_cases:
        resp = build_comparator_4bit_circuit(a=a, b=b, cascade_gt=cas_gt, cascade_lt=cas_lt, cascade_eq=cas_eq)
        expected = compare_4bit(a, b, cascade_in={"gt": cas_gt, "lt": cas_lt, "eq": cas_eq})

        assert resp.state["details"]["a_gt_b"] == expected["a_gt_b"]
        assert resp.state["details"]["a_lt_b"] == expected["a_lt_b"]
        assert resp.state["details"]["a_eq_b"] == expected["a_eq_b"]

        # Check IC U1 pin values
        u1 = next(c for c in resp.components if c.id == "U1")
        assert u1.pins["OA_GT"].value == expected["a_gt_b"]
        assert u1.pins["OA_LT"].value == expected["a_lt_b"]
        assert u1.pins["OA_EQ"].value == expected["a_eq_b"]


def test_comparator_api_get_and_post():
    """Verify GET and POST endpoints for /circuit/comparator-4bit."""
    res_get = client.get("/circuit/comparator-4bit?a=1100&b=0011&cascade_gt=0&cascade_lt=0&cascade_eq=1")
    assert res_get.status_code == 200
    data_get = res_get.json()
    assert data_get["circuit_id"] == "comparator_4bit"
    assert data_get["state"]["details"]["a_gt_b"] == 1

    payload = {"a": "0100", "b": "0100", "cascade_gt": 0, "cascade_lt": 0, "cascade_eq": 1}
    res_post = client.post("/circuit/comparator-4bit", json=payload)
    assert res_post.status_code == 200
    data_post = res_post.json()
    assert data_post["state"]["details"]["a_eq_b"] == 1


# =============================================================================
# 3. 4-BIT ADDER / SUBTRACTOR TESTS
# =============================================================================
def test_adder_subtractor_4bit_addition():
    """Verify addition mode (M=0) across multiple values including carry generation."""
    # 5 + 3 = 8 (0101 + 0011 = 1000, Cout=0)
    resp = build_adder_subtractor_4bit_circuit(a="0101", b="0011", mode=0)
    expected = add_subtract_4bit("0101", "0011", mode=0)
    assert resp.state["sum"] == expected["sum"]
    assert resp.state["carry_out"] == expected["carry_out"]
    assert resp.state["borrow"] is None

    # 12 + 6 = 18 -> 4-bit sum 2 (0010), Cout=1
    resp_carry = build_adder_subtractor_4bit_circuit(a="1100", b="0110", mode=0)
    expected_carry = add_subtract_4bit("1100", "0110", mode=0)
    assert resp_carry.state["sum"] == expected_carry["sum"]
    assert resp_carry.state["carry_out"] == 1


def test_adder_subtractor_4bit_subtraction():
    """Verify subtraction mode (M=1) with and without borrow."""
    # 9 - 4 = 5 (1001 - 0100): A >= B, so no borrow (C4=1, borrow=0)
    resp_no_borrow = build_adder_subtractor_4bit_circuit(a="1001", b="0100", mode=1)
    expected_no_borrow = add_subtract_4bit("1001", "0100", mode=1)
    assert resp_no_borrow.state["sum"] == expected_no_borrow["sum"]
    assert resp_no_borrow.state["borrow"] == 0
    assert resp_no_borrow.state["carry_out"] is None

    # 3 - 7 = -4 (0011 - 0111): A < B, so borrow occurred (C4=0, borrow=1)
    resp_borrow = build_adder_subtractor_4bit_circuit(a="0011", b="0111", mode=1)
    expected_borrow = add_subtract_4bit("0011", "0111", mode=1)
    assert resp_borrow.state["sum"] == expected_borrow["sum"]
    assert resp_borrow.state["borrow"] == 1
    assert resp_borrow.state["carry_out"] is None


def test_adder_subtractor_api_get_and_post():
    """Verify GET and POST endpoints for /circuit/adder-subtractor-4bit."""
    res_get = client.get("/circuit/adder-subtractor-4bit?a=0110&b=0010&mode=0")
    assert res_get.status_code == 200
    data_get = res_get.json()
    assert data_get["circuit_id"] == "adder_subtractor_4bit"
    assert data_get["state"]["sum"] == "1000"

    payload = {"a": "1000", "b": "0011", "mode": 1}
    res_post = client.post("/circuit/adder-subtractor-4bit", json=payload)
    assert res_post.status_code == 200
    data_post = res_post.json()
    assert data_post["state"]["sum"] == "0101"
    assert data_post["state"]["borrow"] == 0
