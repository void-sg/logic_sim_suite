"""
backend/test_circuit_mux.py — Automated tests for KiCad 8:1 MUX circuit layout & live simulation.
"""
import pytest
from fastapi.testclient import TestClient
from main import app
from circuit_mux import build_mux_8to1_circuit
from mux import mux_8to1

client = TestClient(app)


def test_circuit_logic_all_selects():
    """Verify circuit output strictly matches mux_8to1 across all select lines and single-hot inputs."""
    for i in range(8):
        inputs = [1 if j == i else 0 for j in range(8)]
        select = f"{i:03b}"
        resp = build_mux_8to1_circuit(select=select, inputs=inputs, strobe=0)
        expected = mux_8to1(select, inputs)
        assert resp.state["output"] == 1
        assert resp.state["output"] == expected


def test_circuit_strobe_disable():
    """When strobe is active-high (disabled, strobe=1), output must be 0 regardless of selected input."""
    for i in range(8):
        inputs = [1 if j == i else 0 for j in range(8)]
        select = f"{i:03b}"
        resp = build_mux_8to1_circuit(select=select, inputs=inputs, strobe=1)
        assert resp.state["output"] == 0
        assert resp.state["details"]["section1_gated"] == 0
        assert resp.state["details"]["section2_gated"] == 0


def test_circuit_components_and_pins():
    """Verify component coordinates, pin definitions, and binary logic values."""
    inputs = [1, 0, 1, 0, 0, 1, 0, 1]
    select = "101"
    resp = build_mux_8to1_circuit(select=select, inputs=inputs, strobe=0)

    comp_ids = {c.id for c in resp.components}
    expected_ids = {
        "PORT_D0", "PORT_D1", "PORT_D2", "PORT_D3",
        "PORT_D4", "PORT_D5", "PORT_D6", "PORT_D7",
        "PORT_S2", "PORT_S1", "PORT_S0", "PORT_STROBE",
        "U1", "U2A", "U2B", "U3", "PORT_Y"
    }
    assert expected_ids.issubset(comp_ids)

    # All pins should have valid 0 or 1 value
    for comp in resp.components:
        for pin_name, pin in comp.pins.items():
            assert pin.value in (0, 1), f"Pin {comp.id}.{pin_name} had invalid value {pin.value}"

    # Verify wire paths
    assert len(resp.wires) > 0
    for wire in resp.wires:
        assert wire.path.startswith("M ")
        assert " L " in wire.path or " " in wire.path
        assert wire.value in (0, 1)

    # Junctions
    assert len(resp.junctions) >= 3


def test_api_endpoint_get():
    """Verify GET /circuit/mux-8to1 query params."""
    response = client.get("/circuit/mux-8to1?select=011&inputs=0,0,0,1,0,0,0,0&strobe=0")
    assert response.status_code == 200
    data = response.json()
    assert data["circuit_id"] == "mux_8to1"
    assert data["state"]["output"] == 1
    assert data["state"]["select"] == "011"
    assert data["sheet_info"]["title"] == "8:1 Multiplexer (IC 74LS153 Composition)"


def test_api_endpoint_post():
    """Verify POST /circuit/mux-8to1 request body."""
    payload = {
        "select": "110",
        "inputs": [0, 0, 0, 0, 0, 0, 1, 0],
        "strobe": 0
    }
    response = client.post("/circuit/mux-8to1", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["circuit_id"] == "mux_8to1"
    assert data["state"]["output"] == 1
    assert data["state"]["details"]["s2"] == 1


def test_api_invalid_params():
    """Verify 422 on invalid parameters."""
    # invalid select length
    resp = client.get("/circuit/mux-8to1?select=01&inputs=0,0,0,0,0,0,0,0")
    assert resp.status_code == 422

    # invalid inputs count
    resp = client.get("/circuit/mux-8to1?select=000&inputs=0,1,0")
    assert resp.status_code == 422
