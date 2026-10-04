/**
   Virtual IC Workbench & EDA Schematic Lab Engine
   Replicating KiCad Eeschema UI with Symbol Chooser, Multi-Point Orthogonal Wiring,
   Effortless Component Dragging, and Real-Time Digital Logic Simulation
*/

(function () {
  "use strict";

  const SVG_NS = "http://www.w3.org/2000/svg";

  // =========================================================================
  // 1. COMPONENT LIBRARY SPECIFICATIONS (Pinouts & Logic Models)
  // =========================================================================
  const LIBRARY = {
    // --- Logic Gate ICs (DIP-14) ---
    "7400": {
      id: "7400",
      name: "7400 (Quad 2-Input NAND)",
      category: "gates",
      package: "DIP-14",
      pinsCount: 14,
      refPrefix: "U",
      desc: "Four independent 2-input NAND gates. Universal logic IC used in all fundamental logic synthesis.",
      datasheet: "VCC: Pin 14, GND: Pin 7. Gates: (1A,1B->1Y), (2A,2B->2Y), (3A,3B->3Y), (4A,4B->4Y).",
      vccPin: 14,
      gndPin: 7,
      pins: [
        { num: 1, name: "1A", type: "in", side: "left" },
        { num: 2, name: "1B", type: "in", side: "left" },
        { num: 3, name: "1Y", type: "out", side: "left" },
        { num: 4, name: "2A", type: "in", side: "left" },
        { num: 5, name: "2B", type: "in", side: "left" },
        { num: 6, name: "2Y", type: "out", side: "left" },
        { num: 7, name: "GND", type: "pwr", side: "left" },
        { num: 14, name: "VCC", type: "pwr", side: "right" },
        { num: 13, name: "4B", type: "in", side: "right" },
        { num: 12, name: "4A", type: "in", side: "right" },
        { num: 11, name: "4Y", type: "out", side: "right" },
        { num: 10, name: "3B", type: "in", side: "right" },
        { num: 9, name: "3A", type: "in", side: "right" },
        { num: 8, name: "3Y", type: "out", side: "right" }
      ],
      evaluate: (inputs) => {
        const in1 = inputs["1"] !== undefined ? inputs["1"] : 1;
        const in2 = inputs["2"] !== undefined ? inputs["2"] : 1;
        const in4 = inputs["4"] !== undefined ? inputs["4"] : 1;
        const in5 = inputs["5"] !== undefined ? inputs["5"] : 1;
        const in9 = inputs["9"] !== undefined ? inputs["9"] : 1;
        const in10 = inputs["10"] !== undefined ? inputs["10"] : 1;
        const in12 = inputs["12"] !== undefined ? inputs["12"] : 1;
        const in13 = inputs["13"] !== undefined ? inputs["13"] : 1;

        return {
          "3": (in1 === 1 && in2 === 1) ? 0 : 1,
          "6": (in4 === 1 && in5 === 1) ? 0 : 1,
          "8": (in9 === 1 && in10 === 1) ? 0 : 1,
          "11": (in12 === 1 && in13 === 1) ? 0 : 1
        };
      }
    },

    "7408": {
      id: "7408",
      name: "7408 (Quad 2-Input AND)",
      category: "gates",
      package: "DIP-14",
      pinsCount: 14,
      refPrefix: "U",
      desc: "Four independent 2-input positive AND gates.",
      datasheet: "VCC: Pin 14, GND: Pin 7. Gates: (1A,1B->1Y), (2A,2B->2Y), (3A,3B->3Y), (4A,4B->4Y).",
      vccPin: 14,
      gndPin: 7,
      pins: [
        { num: 1, name: "1A", type: "in", side: "left" },
        { num: 2, name: "1B", type: "in", side: "left" },
        { num: 3, name: "1Y", type: "out", side: "left" },
        { num: 4, name: "2A", type: "in", side: "left" },
        { num: 5, name: "2B", type: "in", side: "left" },
        { num: 6, name: "2Y", type: "out", side: "left" },
        { num: 7, name: "GND", type: "pwr", side: "left" },
        { num: 14, name: "VCC", type: "pwr", side: "right" },
        { num: 13, name: "4B", type: "in", side: "right" },
        { num: 12, name: "4A", type: "in", side: "right" },
        { num: 11, name: "4Y", type: "out", side: "right" },
        { num: 10, name: "3B", type: "in", side: "right" },
        { num: 9, name: "3A", type: "in", side: "right" },
        { num: 8, name: "3Y", type: "out", side: "right" }
      ],
      evaluate: (inputs) => {
        return {
          "3": ((inputs["1"] || 0) === 1 && (inputs["2"] || 0) === 1) ? 1 : 0,
          "6": ((inputs["4"] || 0) === 1 && (inputs["5"] || 0) === 1) ? 1 : 0,
          "8": ((inputs["9"] || 0) === 1 && (inputs["10"] || 0) === 1) ? 1 : 0,
          "11": ((inputs["12"] || 0) === 1 && (inputs["13"] || 0) === 1) ? 1 : 0
        };
      }
    },

    "7432": {
      id: "7432",
      name: "7432 (Quad 2-Input OR)",
      category: "gates",
      package: "DIP-14",
      pinsCount: 14,
      refPrefix: "U",
      desc: "Four independent 2-input positive OR gates.",
      datasheet: "VCC: Pin 14, GND: Pin 7. Gates: (1A,1B->1Y), (2A,2B->2Y), (3A,3B->3Y), (4A,4B->4Y).",
      vccPin: 14,
      gndPin: 7,
      pins: [
        { num: 1, name: "1A", type: "in", side: "left" },
        { num: 2, name: "1B", type: "in", side: "left" },
        { num: 3, name: "1Y", type: "out", side: "left" },
        { num: 4, name: "2A", type: "in", side: "left" },
        { num: 5, name: "2B", type: "in", side: "left" },
        { num: 6, name: "2Y", type: "out", side: "left" },
        { num: 7, name: "GND", type: "pwr", side: "left" },
        { num: 14, name: "VCC", type: "pwr", side: "right" },
        { num: 13, name: "4B", type: "in", side: "right" },
        { num: 12, name: "4A", type: "in", side: "right" },
        { num: 11, name: "4Y", type: "out", side: "right" },
        { num: 10, name: "3B", type: "in", side: "right" },
        { num: 9, name: "3A", type: "in", side: "right" },
        { num: 8, name: "3Y", type: "out", side: "right" }
      ],
      evaluate: (inputs) => {
        return {
          "3": ((inputs["1"] || 0) === 1 || (inputs["2"] || 0) === 1) ? 1 : 0,
          "6": ((inputs["4"] || 0) === 1 || (inputs["5"] || 0) === 1) ? 1 : 0,
          "8": ((inputs["9"] || 0) === 1 || (inputs["10"] || 0) === 1) ? 1 : 0,
          "11": ((inputs["12"] || 0) === 1 || (inputs["13"] || 0) === 1) ? 1 : 0
        };
      }
    },

    "7486": {
      id: "7486",
      name: "7486 (Quad 2-Input XOR)",
      category: "gates",
      package: "DIP-14",
      pinsCount: 14,
      refPrefix: "U",
      desc: "Four independent 2-input Exclusive-OR gates. Essential for adders, subtractors, and parity generators.",
      datasheet: "VCC: Pin 14, GND: Pin 7. Gates: (1A,1B->1Y), (2A,2B->2Y), (3A,3B->3Y), (4A,4B->4Y).",
      vccPin: 14,
      gndPin: 7,
      pins: [
        { num: 1, name: "1A", type: "in", side: "left" },
        { num: 2, name: "1B", type: "in", side: "left" },
        { num: 3, name: "1Y", type: "out", side: "left" },
        { num: 4, name: "2A", type: "in", side: "left" },
        { num: 5, name: "2B", type: "in", side: "left" },
        { num: 6, name: "2Y", type: "out", side: "left" },
        { num: 7, name: "GND", type: "pwr", side: "left" },
        { num: 14, name: "VCC", type: "pwr", side: "right" },
        { num: 13, name: "4B", type: "in", side: "right" },
        { num: 12, name: "4A", type: "in", side: "right" },
        { num: 11, name: "4Y", type: "out", side: "right" },
        { num: 10, name: "3B", type: "in", side: "right" },
        { num: 9, name: "3A", type: "in", side: "right" },
        { num: 8, name: "3Y", type: "out", side: "right" }
      ],
      evaluate: (inputs) => {
        return {
          "3": (((inputs["1"] || 0) ^ (inputs["2"] || 0)) === 1) ? 1 : 0,
          "6": (((inputs["4"] || 0) ^ (inputs["5"] || 0)) === 1) ? 1 : 0,
          "8": (((inputs["9"] || 0) ^ (inputs["10"] || 0)) === 1) ? 1 : 0,
          "11": (((inputs["12"] || 0) ^ (inputs["13"] || 0)) === 1) ? 1 : 0
        };
      }
    },

    "7402": {
      id: "7402",
      name: "7402 (Quad 2-Input NOR)",
      category: "gates",
      package: "DIP-14",
      pinsCount: 14,
      refPrefix: "U",
      desc: "Four independent 2-input positive NOR gates. Note: Pin 1 is output 1Y (opposite pinout from 7400/7408).",
      datasheet: "VCC: Pin 14, GND: Pin 7. Gates: (1A:2, 1B:3 -> 1Y:1), (2A:5, 2B:6 -> 2Y:4), (3A:8, 3B:9 -> 3Y:10), (4A:11, 4B:12 -> 4Y:13).",
      vccPin: 14,
      gndPin: 7,
      pins: [
        { num: 1, name: "1Y", type: "out", side: "left" },
        { num: 2, name: "1A", type: "in", side: "left" },
        { num: 3, name: "1B", type: "in", side: "left" },
        { num: 4, name: "2Y", type: "out", side: "left" },
        { num: 5, name: "2A", type: "in", side: "left" },
        { num: 6, name: "2B", type: "in", side: "left" },
        { num: 7, name: "GND", type: "pwr", side: "left" },
        { num: 14, name: "VCC", type: "pwr", side: "right" },
        { num: 13, name: "4Y", type: "out", side: "right" },
        { num: 12, name: "4B", type: "in", side: "right" },
        { num: 11, name: "4A", type: "in", side: "right" },
        { num: 10, name: "3Y", type: "out", side: "right" },
        { num: 9, name: "3B", type: "in", side: "right" },
        { num: 8, name: "3A", type: "in", side: "right" }
      ],
      evaluate: (inputs) => {
        return {
          "1": ((inputs["2"] || 0) === 1 || (inputs["3"] || 0) === 1) ? 0 : 1,
          "4": ((inputs["5"] || 0) === 1 || (inputs["6"] || 0) === 1) ? 0 : 1,
          "10": ((inputs["8"] || 0) === 1 || (inputs["9"] || 0) === 1) ? 0 : 1,
          "13": ((inputs["11"] || 0) === 1 || (inputs["12"] || 0) === 1) ? 0 : 1
        };
      }
    },

    "7404": {
      id: "7404",
      name: "7404 (Hex Inverter / NOT)",
      category: "gates",
      package: "DIP-14",
      pinsCount: 14,
      refPrefix: "U",
      desc: "Six independent inverters. Standard logic gate for complementary logic and oscillator generation.",
      datasheet: "VCC: Pin 14, GND: Pin 7. Inverters: (1A->1Y), (2A->2Y), (3A->3Y), (4A->4Y), (5A->5Y), (6A->6Y).",
      vccPin: 14,
      gndPin: 7,
      pins: [
        { num: 1, name: "1A", type: "in", side: "left" },
        { num: 2, name: "1Y", type: "out", side: "left" },
        { num: 3, name: "2A", type: "in", side: "left" },
        { num: 4, name: "2Y", type: "out", side: "left" },
        { num: 5, name: "3A", type: "in", side: "left" },
        { num: 6, name: "3Y", type: "out", side: "left" },
        { num: 7, name: "GND", type: "pwr", side: "left" },
        { num: 14, name: "VCC", type: "pwr", side: "right" },
        { num: 13, name: "6A", type: "in", side: "right" },
        { num: 12, name: "6Y", type: "out", side: "right" },
        { num: 11, name: "5A", type: "in", side: "right" },
        { num: 10, name: "5Y", type: "out", side: "right" },
        { num: 9, name: "4A", type: "in", side: "right" },
        { num: 8, name: "4Y", type: "out", side: "right" }
      ],
      evaluate: (inputs) => {
        return {
          "2": (inputs["1"] || 0) === 1 ? 0 : 1,
          "4": (inputs["3"] || 0) === 1 ? 0 : 1,
          "6": (inputs["5"] || 0) === 1 ? 0 : 1,
          "8": (inputs["9"] || 0) === 1 ? 0 : 1,
          "10": (inputs["11"] || 0) === 1 ? 0 : 1,
          "12": (inputs["13"] || 0) === 1 ? 0 : 1
        };
      }
    },

    // --- Discrete & Diode ---
    "DIODE": {
      id: "DIODE",
      name: "1N4148 (Silicon Diode)",
      category: "discrete",
      package: "DO-35",
      pinsCount: 2,
      refPrefix: "D",
      desc: "High-speed switching semiconductor diode. Conducts logic HIGH when forward biased (Anode -> Cathode). Used in diode OR gates.",
      datasheet: "Pin 1: Anode (A), Pin 2: Cathode (K). Standard forward bias conduction.",
      pins: [
        { num: 1, name: "A", type: "in", side: "left", pos: 1 },
        { num: 2, name: "K", type: "out", side: "right", pos: 1 }
      ],
      evaluate: (inputs) => {
        return {
          "2": (inputs["1"] || 0) === 1 ? 1 : 0
        };
      }
    },

    // --- Combinational MSI ICs (DIP-16) ---
    "74151": {
      id: "74151",
      name: "74151 (8:1 Multiplexer)",
      category: "msi",
      package: "DIP-16",
      pinsCount: 16,
      refPrefix: "U",
      desc: "8-to-1 Data Selector/Multiplexer with complementary outputs (Y and W = ~Y) and active-low Strobe (~G).",
      datasheet: "VCC: Pin 16, GND: Pin 8. Data D0-D7, Select A(11), B(10), C(9). Enable ~G(7). True Y(5), Inverted W(6).",
      vccPin: 16,
      gndPin: 8,
      pins: [
        { num: 1, name: "D3", type: "in", side: "left" },
        { num: 2, name: "D2", type: "in", side: "left" },
        { num: 3, name: "D1", type: "in", side: "left" },
        { num: 4, name: "D0", type: "in", side: "left" },
        { num: 5, name: "Y", type: "out", side: "left" },
        { num: 6, name: "W", type: "out", side: "left" },
        { num: 7, name: "~G", type: "in", side: "left" },
        { num: 8, name: "GND", type: "pwr", side: "left" },
        { num: 16, name: "VCC", type: "pwr", side: "right" },
        { num: 15, name: "D4", type: "in", side: "right" },
        { num: 14, name: "D5", type: "in", side: "right" },
        { num: 13, name: "D6", type: "in", side: "right" },
        { num: 12, name: "D7", type: "in", side: "right" },
        { num: 11, name: "A", type: "in", side: "right" },
        { num: 10, name: "B", type: "in", side: "right" },
        { num: 9, name: "C", type: "in", side: "right" }
      ],
      evaluate: (inputs) => {
        const strobe = inputs["7"] || 0; // ~G active low
        if (strobe === 1) {
          return { "5": 0, "6": 1 }; // Disabled
        }
        const sA = inputs["11"] || 0;
        const sB = inputs["10"] || 0;
        const sC = inputs["9"] || 0;
        const sel = (sC << 2) | (sB << 1) | sA;

        const dataMap = [
          inputs["4"] || 0,  // D0
          inputs["3"] || 0,  // D1
          inputs["2"] || 0,  // D2
          inputs["1"] || 0,  // D3
          inputs["15"] || 0, // D4
          inputs["14"] || 0, // D5
          inputs["13"] || 0, // D6
          inputs["12"] || 0  // D7
        ];
        const val = dataMap[sel] || 0;
        return {
          "5": val,
          "6": val === 1 ? 0 : 1
        };
      }
    },

    "74153": {
      id: "74153",
      name: "74153 (Dual 4:1 Multiplexer)",
      category: "msi",
      package: "DIP-16",
      pinsCount: 16,
      refPrefix: "U",
      desc: "Dual 4-line to 1-line data selectors/multiplexers. Contains two independent 4:1 MUX sections sharing common select lines (S0, S1) with separate active-low strobes (1~G, 2~G).",
      datasheet: "VCC: Pin 16, GND: Pin 8. Select: S1(2), S0(14). MUX 1: 1~G(1), 1D0(6), 1D1(5), 1D2(4), 1D3(3) -> 1Y(7). MUX 2: 2~G(15), 2D0(10), 2D1(11), 2D2(12), 2D3(13) -> 2Y(9).",
      vccPin: 16,
      gndPin: 8,
      pins: [
        { num: 1, name: "1~G", type: "in", side: "left" },
        { num: 2, name: "S1", type: "in", side: "left" },
        { num: 3, name: "1D3", type: "in", side: "left" },
        { num: 4, name: "1D2", type: "in", side: "left" },
        { num: 5, name: "1D1", type: "in", side: "left" },
        { num: 6, name: "1D0", type: "in", side: "left" },
        { num: 7, name: "1Y", type: "out", side: "left" },
        { num: 8, name: "GND", type: "pwr", side: "left" },
        { num: 16, name: "VCC", type: "pwr", side: "right" },
        { num: 15, name: "2~G", type: "in", side: "right" },
        { num: 14, name: "S0", type: "in", side: "right" },
        { num: 13, name: "2D3", type: "in", side: "right" },
        { num: 12, name: "2D2", type: "in", side: "right" },
        { num: 11, name: "2D1", type: "in", side: "right" },
        { num: 10, name: "2D0", type: "in", side: "right" },
        { num: 9, name: "2Y", type: "out", side: "right" }
      ],
      evaluate: (inputs) => {
        const s1 = inputs["2"] || 0;
        const s0 = inputs["14"] || 0;
        const sel = (s1 << 1) | s0;

        // Section 1: 1~G active low
        const strobe1 = inputs["1"] || 0;
        let y1 = 0;
        if (strobe1 === 0) {
          const data1 = [
            inputs["6"] || 0, // 1D0
            inputs["5"] || 0, // 1D1
            inputs["4"] || 0, // 1D2
            inputs["3"] || 0  // 1D3
          ];
          y1 = data1[sel] || 0;
        }

        // Section 2: 2~G active low
        const strobe2 = inputs["15"] || 0;
        let y2 = 0;
        if (strobe2 === 0) {
          const data2 = [
            inputs["10"] || 0, // 2D0
            inputs["11"] || 0, // 2D1
            inputs["12"] || 0, // 2D2
            inputs["13"] || 0  // 2D3
          ];
          y2 = data2[sel] || 0;
        }

        return {
          "7": y1,
          "9": y2
        };
      }
    },

    "7485": {
      id: "7485",
      name: "7485 (4-Bit Magnitude Comparator)",
      category: "msi",
      package: "DIP-16",
      pinsCount: 16,
      refPrefix: "U",
      desc: "4-bit magnitude comparator comparing two binary words A and B. Includes expansion cascading inputs.",
      datasheet: "VCC: Pin 16, GND: Pin 8. A inputs: A0(10), A1(12), A2(13), A3(15). B inputs: B0(9), B1(11), B2(14), B3(1). Outputs: A>B(5), A=B(6), A<B(7).",
      vccPin: 16,
      gndPin: 8,
      pins: [
        { num: 1, name: "B3", type: "in", side: "left" },
        { num: 2, name: "I_LT", type: "in", side: "left" },
        { num: 3, name: "I_EQ", type: "in", side: "left" },
        { num: 4, name: "I_GT", type: "in", side: "left" },
        { num: 5, name: "O_GT", type: "out", side: "left" },
        { num: 6, name: "O_EQ", type: "out", side: "left" },
        { num: 7, name: "O_LT", type: "out", side: "left" },
        { num: 8, name: "GND", type: "pwr", side: "left" },
        { num: 16, name: "VCC", type: "pwr", side: "right" },
        { num: 15, name: "A3", type: "in", side: "right" },
        { num: 14, name: "B2", type: "in", side: "right" },
        { num: 13, name: "A2", type: "in", side: "right" },
        { num: 12, name: "A1", type: "in", side: "right" },
        { num: 11, name: "B1", type: "in", side: "right" },
        { num: 10, name: "A0", type: "in", side: "right" },
        { num: 9, name: "B0", type: "in", side: "right" }
      ],
      evaluate: (inputs) => {
        const aVal = ((inputs["15"] || 0) << 3) | ((inputs["13"] || 0) << 2) | ((inputs["12"] || 0) << 1) | (inputs["10"] || 0);
        const bVal = ((inputs["1"] || 0) << 3) | ((inputs["14"] || 0) << 2) | ((inputs["11"] || 0) << 1) | (inputs["9"] || 0);

        const iEQ = inputs["3"] !== undefined ? inputs["3"] : 1;
        const iGT = inputs["4"] || 0;
        const iLT = inputs["2"] || 0;

        let oGT = 0, oEQ = 0, oLT = 0;
        if (aVal > bVal) {
          oGT = 1;
        } else if (aVal < bVal) {
          oLT = 1;
        } else {
          oEQ = iEQ;
          oGT = iGT;
          oLT = iLT;
        }

        return {
          "5": oGT,
          "6": oEQ,
          "7": oLT
        };
      }
    },

    "7483": {
      id: "7483",
      name: "7483 (4-Bit Binary Full Adder)",
      category: "msi",
      package: "DIP-16",
      pinsCount: 16,
      refPrefix: "U",
      desc: "4-bit binary full adder with fast internal look-ahead carry. Standard lab IC for adders and subtractors.",
      datasheet: "VCC: Pin 5, GND: Pin 12. A: (A1:10, A2:8, A3:3, A4:1). B: (B1:11, B2:7, B3:4, B4:16). Cin: C0(13). Sum: (S1:9, S2:6, S3:2, S4:15). Cout: C4(14).",
      vccPin: 5,
      gndPin: 12,
      pins: [
        { num: 1, name: "A4", type: "in", side: "left" },
        { num: 2, name: "S3", type: "out", side: "left" },
        { num: 3, name: "A3", type: "in", side: "left" },
        { num: 4, name: "B3", type: "in", side: "left" },
        { num: 5, name: "VCC", type: "pwr", side: "left" },
        { num: 6, name: "S2", type: "out", side: "left" },
        { num: 7, name: "B2", type: "in", side: "left" },
        { num: 8, name: "A2", type: "in", side: "left" },
        { num: 16, name: "B4", type: "in", side: "right" },
        { num: 15, name: "S4", type: "out", side: "right" },
        { num: 14, name: "C4", type: "out", side: "right" },
        { num: 13, name: "C0", type: "in", side: "right" },
        { num: 12, name: "GND", type: "pwr", side: "right" },
        { num: 11, name: "B1", type: "in", side: "right" },
        { num: 10, name: "A1", type: "in", side: "right" },
        { num: 9, name: "S1", type: "out", side: "right" }
      ],
      evaluate: (inputs) => {
        const aVal = ((inputs["1"] || 0) << 3) | ((inputs["3"] || 0) << 2) | ((inputs["8"] || 0) << 1) | (inputs["10"] || 0);
        const bVal = ((inputs["16"] || 0) << 3) | ((inputs["4"] || 0) << 2) | ((inputs["7"] || 0) << 1) | (inputs["11"] || 0);
        const c0 = inputs["13"] || 0;

        const sumTotal = aVal + bVal + c0;
        return {
          "9": (sumTotal & 1) ? 1 : 0,
          "6": (sumTotal & 2) ? 1 : 0,
          "2": (sumTotal & 4) ? 1 : 0,
          "15": (sumTotal & 8) ? 1 : 0,
          "14": (sumTotal & 16) ? 1 : 0
        };
      }
    },

    // --- Power & Logic Terminals ---
    "VCC": {
      id: "VCC",
      name: "+5V (VCC Power)",
      category: "power",
      package: "Terminal",
      pinsCount: 1,
      refPrefix: "PWR",
      desc: "Constant +5V DC power source. Drives logic HIGH (1) on connected net.",
      pins: [{ num: 1, name: "+5V", type: "out", side: "bottom", pos: 1 }],
      evaluate: () => ({ "1": 1 })
    },

    "GND": {
      id: "GND",
      name: "GND (Ground)",
      category: "power",
      package: "Terminal",
      pinsCount: 1,
      refPrefix: "GND",
      desc: "Ground reference point. Drives logic LOW (0) on connected net.",
      pins: [{ num: 1, name: "GND", type: "out", side: "top", pos: 1 }],
      evaluate: () => ({ "1": 0 })
    },

    "SWITCH": {
      id: "SWITCH",
      name: "Toggle Switch (Logic In)",
      category: "io",
      package: "SPST",
      pinsCount: 1,
      refPrefix: "SW",
      desc: "Manual interactive logic toggle switch. Click to flip between 0 (LOW) and 1 (HIGH).",
      pins: [{ num: 1, name: "OUT", type: "out", side: "right", pos: 1 }],
      customState: { value: 0 },
      evaluate: (inputs, comp) => ({ "1": comp.state ? (comp.state.value ? 1 : 0) : 0 })
    },

    "CLOCK": {
      id: "CLOCK",
      name: "Clock Pulse (1 Hz)",
      category: "io",
      package: "Oscillator",
      pinsCount: 1,
      refPrefix: "CLK",
      desc: "Automated clock pulse source oscillating at 1 Hz (0 and 1 alternating).",
      pins: [{ num: 1, name: "CLK", type: "out", side: "right", pos: 1 }],
      customState: { value: 0 },
      evaluate: (inputs, comp) => ({ "1": comp.state ? (comp.state.value ? 1 : 0) : 0 })
    },

    // --- Output Probes & Indicators ---
    "LED": {
      id: "LED",
      name: "Logic LED Indicator",
      category: "io",
      package: "LED-5mm",
      pinsCount: 1,
      refPrefix: "LED",
      desc: "Visual LED indicator. Lights up vibrant glowing green when signal is HIGH (1), turns off when LOW (0).",
      pins: [{ num: 1, name: "IN", type: "in", side: "left", pos: 1 }],
      evaluate: () => ({})
    },

    "PROBE": {
      id: "PROBE",
      name: "Digital Logic Probe",
      category: "io",
      package: "Probe",
      pinsCount: 1,
      refPrefix: "PR",
      desc: "Digital logic analyzer probe. Displays real-time binary state [0] or [1].",
      pins: [{ num: 1, name: "IN", type: "in", side: "left", pos: 1 }],
      evaluate: () => ({})
    }
  };

  // =========================================================================
  // 2. WORKBENCH STATE & DATA MODEL
  // =========================================================================
  const state = {
    components: [],   // { id, type, ref, x, y, state }
    wires: [],        // { id, from: { compId, pinNum }, to: { compId, pinNum }, waypoints: [], state: 0 }
    selectedItem: null,// { type: 'comp'|'wire', id }
    tool: "select",   // "select" | "wire" | "delete"
    isSimRunning: true,
    clockTick: 0,
    clockInterval: null,

    // Last computed voltages for seamless DOM re-renders: { "compId:pinNum": 0|1 }
    pinVoltages: {},

    // Active multi-point wire drawing state (KiCad style)
    activeWire: null, // { fromCompId, fromPinNum, waypoints: [{x, y}, ...], bendMode: "HV"|"VH" }
    hoveredTargetPin: null,// { compId, pinNum, x, y }
    mousePos: { x: 0, y: 0 },

    // Pan & Zoom
    viewBox: { x: 0, y: 0, w: 1400, h: 900 },
    initialViewBox: { x: 0, y: 0, w: 1400, h: 900 },
    isPanning: false,
    panStart: { x: 0, y: 0 },

    // Dragging components
    draggingComp: null,
    dragOffset: { x: 0, y: 0 },
    dragStartPos: { x: 0, y: 0 },
    hasDraggedFar: false,

    // Symbol Chooser Modal state
    selectedModalItem: "7400"
  };

  const refCounters = {};

  function getNextRef(prefix) {
    refCounters[prefix] = (refCounters[prefix] || 0) + 1;
    return `${prefix}${refCounters[prefix]}`;
  }

  // =========================================================================
  // 3. INITIALIZATION & DOM BINDING
  // =========================================================================
  let svgRoot, zoomGroup, gridLayer, wireLayer, junctionLayer, compLayer, tempWireLayer;

  document.addEventListener("DOMContentLoaded", () => {
    initDOM();
    initToolbar();
    initModal();
    initPanZoom();
    initClock();

    // Load default introductory lab circuit (Exp 1: 7400 NAND Verification)
    loadLabPreset("7400_nand");

    // Continuous simulation heartbeat
    setInterval(() => {
      if (state.isSimRunning) {
        runSimulation();
      }
    }, 100);
  });

  function initDOM() {
    svgRoot = document.getElementById("workbench-svg");
    if (!svgRoot) return;

    svgRoot.innerHTML = "";
    zoomGroup = createSVGElement("g", { id: "zoom-group" });
    svgRoot.appendChild(zoomGroup);

    gridLayer = createSVGElement("g", { id: "grid-layer" });
    wireLayer = createSVGElement("g", { id: "wire-layer" });
    junctionLayer = createSVGElement("g", { id: "junction-layer" });
    compLayer = createSVGElement("g", { id: "comp-layer" });
    tempWireLayer = createSVGElement("g", { id: "temp-wire-layer" });

    zoomGroup.appendChild(gridLayer);
    zoomGroup.appendChild(wireLayer);
    zoomGroup.appendChild(junctionLayer);
    zoomGroup.appendChild(compLayer);
    zoomGroup.appendChild(tempWireLayer);

    updateSvgViewBox();

    // Wire Action Pill Delete Button
    document.getElementById("btn-wire-pill-delete")?.addEventListener("click", () => {
      deleteSelectedItem();
    });

    // Global SVG mouse events
    svgRoot.addEventListener("mousemove", onCanvasMouseMove);
    svgRoot.addEventListener("mousedown", onCanvasMouseDown);
    svgRoot.addEventListener("contextmenu", (e) => {
      // If right clicking on empty canvas, cancel active wire and close context menu
      if (!e.target.closest(".pin-terminal-hit")) {
        e.preventDefault();
        cancelActiveWire();
        hideContextMenu();
      }
    });
    window.addEventListener("mouseup", onCanvasMouseUp);

    // Close context menu on external click
    window.addEventListener("click", (e) => {
      if (!e.target.closest("#wb-context-menu")) {
        hideContextMenu();
      }
    });

    // Keyboard shortcuts
    window.addEventListener("keydown", (e) => {
      if (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "SELECT") return;

      // Undo: Ctrl+Z / Cmd+Z
      if ((e.ctrlKey || e.metaKey) && (e.key === "z" || e.key === "Z")) {
        e.preventDefault();
        performUndo();
        return;
      }

      if (e.key === "a" || e.key === "A") {
        openModal();
      } else if (e.key === "w" || e.key === "W") {
        setTool("wire");
      } else if (e.key === "s" || e.key === "S") {
        setTool("select");
      } else if (e.key === "Delete") {
        deleteSelectedItem();
      } else if (e.key === "Backspace") {
        if (state.activeWire && state.activeWire.waypoints.length > 1) {
          // Remove last waypoint
          state.activeWire.waypoints.pop();
          updateTempWirePreview();
        } else {
          deleteSelectedItem();
        }
      } else if (e.key === " " || e.code === "Space") {
        if (state.activeWire) {
          e.preventDefault();
          // Toggle orthogonal bend mode (Horizontal-first vs Vertical-first)
          state.activeWire.bendMode = state.activeWire.bendMode === "HV" ? "VH" : "HV";
          updateTempWirePreview();
        }
      } else if (e.key === "Escape") {
        cancelActiveWire();
        closeModal();
        hideContextMenu();
      }
    });
  }

  function initToolbar() {
    document.getElementById("btn-tool-select")?.addEventListener("click", () => setTool("select"));
    document.getElementById("btn-tool-wire")?.addEventListener("click", () => setTool("wire"));
    document.getElementById("btn-tool-delete")?.addEventListener("click", () => setTool("delete"));
    document.getElementById("btn-add-symbol")?.addEventListener("click", () => openModal());
    document.getElementById("btn-clear-canvas")?.addEventListener("click", () => clearCanvas());

    document.getElementById("btn-sim-toggle")?.addEventListener("click", () => {
      state.isSimRunning = !state.isSimRunning;
      const btn = document.getElementById("btn-sim-toggle");
      const dot = document.getElementById("sim-status-dot");
      const text = document.getElementById("sim-status-text");
      if (state.isSimRunning) {
        btn.textContent = "⏸ Pause Sim";
        btn.classList.remove("wb-btn-accent");
        btn.classList.add("wb-btn-success");
        dot?.classList.remove("paused");
        if (text) text.textContent = "SIMULATION LIVE";
      } else {
        btn.textContent = "▶ Resume Sim";
        btn.classList.remove("wb-btn-success");
        btn.classList.add("wb-btn-accent");
        dot?.classList.add("paused");
        if (text) text.textContent = "SIMULATION PAUSED";
      }
      runSimulation();
    });

    const presetSelect = document.getElementById("preset-select");
    presetSelect?.addEventListener("change", (e) => {
      if (e.target.value) {
        loadLabPreset(e.target.value);
        e.target.value = "";
      }
    });

    document.getElementById("btn-zoom-in")?.addEventListener("click", () => zoom(0.8));
    document.getElementById("btn-zoom-out")?.addEventListener("click", () => zoom(1.25));
    document.getElementById("btn-zoom-reset")?.addEventListener("click", () => resetZoom());

    document.querySelectorAll(".wb-palette-item").forEach((item) => {
      item.addEventListener("click", () => {
        const type = item.getAttribute("data-type");
        if (type && LIBRARY[type]) {
          addComponentAt(type, 300 + Math.random() * 120, 200 + Math.random() * 120);
        }
      });
    });
  }

  function setTool(toolName) {
    state.tool = toolName;
    document.querySelectorAll(".tool-btn").forEach((btn) => btn.classList.remove("active"));
    document.getElementById(`btn-tool-${toolName}`)?.classList.add("active");

    const wrap = document.getElementById("canvas-wrap");
    wrap?.classList.remove("tool-select", "tool-wire", "tool-delete");
    wrap?.classList.add(`tool-${toolName}`);

    const hint = document.getElementById("tool-hint-text");
    if (hint) {
      if (toolName === "wire") {
        hint.textContent = "WIRE MODE: Click any red pin terminal to start. Click on empty space to add corners. Space to toggle bend direction. Click destination pin to finish.";
      } else if (toolName === "delete") {
        hint.textContent = "DELETE MODE: Click any component or wire to delete it.";
      } else {
        hint.textContent = "SELECT MODE: Drag components to reposition. Click toggle switches to flip 0/1 logic.";
      }
    }

    if (toolName !== "wire") {
      cancelActiveWire();
    }
  }

  function initClock() {
    state.clockInterval = setInterval(() => {
      if (!state.isSimRunning) return;
      state.clockTick = state.clockTick === 0 ? 1 : 0;
      let hasClock = false;
      state.components.forEach((c) => {
        if (c.type === "CLOCK") {
          c.state.value = state.clockTick;
          hasClock = true;
        }
      });
      if (hasClock) {
        runSimulation();
      }
    }, 1000);
  }

  // =========================================================================
  // 4. PAN & ZOOM
  // =========================================================================
  function initPanZoom() {
    const wrap = document.getElementById("canvas-wrap");
    if (!wrap) return;

    wrap.addEventListener("wheel", (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY > 0 ? 1.15 : 0.85;
      zoom(zoomFactor, e.clientX, e.clientY);
    }, { passive: false });

    wrap.addEventListener("mousedown", (e) => {
      if (e.button === 1 || (e.button === 0 && (e.altKey || e.spaceKey))) {
        e.preventDefault();
        state.isPanning = true;
        state.panStart = { x: e.clientX, y: e.clientY };
        wrap.classList.add("is-panning");
      }
    });

    window.addEventListener("mousemove", (e) => {
      if (state.isPanning) {
        const dx = (e.clientX - state.panStart.x) * (state.viewBox.w / wrap.clientWidth);
        const dy = (e.clientY - state.panStart.y) * (state.viewBox.h / wrap.clientHeight);
        state.viewBox.x -= dx;
        state.viewBox.y -= dy;
        state.panStart = { x: e.clientX, y: e.clientY };
        updateSvgViewBox();
      }
    });

    window.addEventListener("mouseup", () => {
      if (state.isPanning) {
        state.isPanning = false;
        wrap.classList.remove("is-panning");
      }
    });
  }

  function zoom(factor, clientX, clientY) {
    const wrap = document.getElementById("canvas-wrap");
    const rect = wrap.getBoundingClientRect();
    const cx = clientX !== undefined ? (clientX - rect.left) / rect.width : 0.5;
    const cy = clientY !== undefined ? (clientY - rect.top) / rect.height : 0.5;

    const oldW = state.viewBox.w;
    const oldH = state.viewBox.h;
    const newW = oldW * factor;
    const newH = oldH * factor;

    if (newW < 400 || newW > 4000) return;

    state.viewBox.x += (oldW - newW) * cx;
    state.viewBox.y += (oldH - newH) * cy;
    state.viewBox.w = newW;
    state.viewBox.h = newH;
    updateSvgViewBox();
  }

  function resetZoom() {
    state.viewBox = { ...state.initialViewBox };
    updateSvgViewBox();
  }

  function updateSvgViewBox() {
    if (svgRoot) {
      svgRoot.setAttribute("viewBox", `${state.viewBox.x} ${state.viewBox.y} ${state.viewBox.w} ${state.viewBox.h}`);
    }
  }

  function clientToSvgCoords(clientX, clientY) {
    const wrap = document.getElementById("canvas-wrap");
    const rect = wrap.getBoundingClientRect();
    const nx = (clientX - rect.left) / rect.width;
    const ny = (clientY - rect.top) / rect.height;
    return {
      x: state.viewBox.x + nx * state.viewBox.w,
      y: state.viewBox.y + ny * state.viewBox.h
    };
  }

  // =========================================================================
  // 5. KiCad "CHOOSE SYMBOL" MODAL
  // =========================================================================
  function initModal() {
    const backdrop = document.getElementById("kicad-modal");
    const closeBtn = document.getElementById("btn-modal-close");
    const cancelBtn = document.getElementById("btn-modal-cancel");
    const placeBtn = document.getElementById("btn-modal-place");
    const searchInput = document.getElementById("modal-search");

    closeBtn?.addEventListener("click", closeModal);
    cancelBtn?.addEventListener("click", closeModal);
    placeBtn?.addEventListener("click", () => {
      placeSelectedSymbol();
      closeModal();
    });

    searchInput?.addEventListener("input", (e) => {
      renderModalList(e.target.value.trim().toLowerCase());
    });

    renderModalList("");
  }

  function openModal() {
    const modal = document.getElementById("kicad-modal");
    modal?.classList.add("open");
    const searchInput = document.getElementById("modal-search");
    if (searchInput) {
      searchInput.value = "";
      searchInput.focus();
    }
    renderModalList("");
    selectModalItem("7400");
  }

  function closeModal() {
    const modal = document.getElementById("kicad-modal");
    modal?.classList.remove("open");
  }

  function renderModalList(filter) {
    const listContainer = document.getElementById("modal-tree-container");
    if (!listContainer) return;
    listContainer.innerHTML = "";

    const categories = [
      { id: "gates", title: "Logic Gate ICs (DIP-14)" },
      { id: "msi", title: "Combinational MSI ICs (DIP-16)" },
      { id: "discrete", title: "Diodes & Discrete" },
      { id: "power", title: "Power & Ground Symbols" },
      { id: "io", title: "Inputs, Switches & Probes" }
    ];

    categories.forEach((cat) => {
      const items = Object.values(LIBRARY).filter((lib) => {
        if (lib.category !== cat.id) return false;
        if (!filter) return true;
        return (
          lib.id.toLowerCase().includes(filter) ||
          lib.name.toLowerCase().includes(filter) ||
          lib.desc.toLowerCase().includes(filter)
        );
      });

      if (items.length === 0) return;

      const catEl = document.createElement("div");
      catEl.className = "tree-category";

      const catHeader = document.createElement("div");
      catHeader.className = "tree-category-name";
      catHeader.innerHTML = `<span>${cat.title}</span><span style="font-size:10px; color:#94a3b8;">${items.length}</span>`;
      catEl.appendChild(catHeader);

      items.forEach((item) => {
        const itemEl = document.createElement("div");
        itemEl.className = "tree-item" + (state.selectedModalItem === item.id ? " selected" : "");
        itemEl.setAttribute("data-id", item.id);
        itemEl.innerHTML = `
          <div class="tree-item-name">${item.id}</div>
          <div class="tree-item-desc">${item.name}</div>
        `;

        itemEl.addEventListener("click", () => {
          document.querySelectorAll(".tree-item").forEach((el) => el.classList.remove("selected"));
          itemEl.classList.add("selected");
          selectModalItem(item.id);
        });

        itemEl.addEventListener("dblclick", () => {
          selectModalItem(item.id);
          placeSelectedSymbol();
          closeModal();
        });

        catEl.appendChild(itemEl);
      });

      listContainer.appendChild(catEl);
    });
  }

  function selectModalItem(itemId) {
    state.selectedModalItem = itemId;
    const spec = LIBRARY[itemId];
    if (!spec) return;

    const descEl = document.getElementById("modal-desc-box");
    if (descEl) {
      descEl.innerHTML = `<strong>${spec.name} (${spec.package})</strong>: ${spec.desc} <em>${spec.datasheet || ""}</em>`;
    }

    renderSymbolPreview(spec);
    renderFootprintPreview(spec);
  }

  function renderSymbolPreview(spec) {
    const previewContainer = document.getElementById("preview-symbol-svg");
    if (!previewContainer) return;
    previewContainer.innerHTML = "";

    const svg = createSVGElement("svg", {
      viewBox: "-120 -100 240 200",
      width: "100%",
      height: "100%"
    });

    if (spec.category === "power") {
      if (spec.id === "VCC") {
        svg.appendChild(createSVGElement("line", { x1: 0, y1: 15, x2: 0, y2: -15, stroke: "#a00000", "stroke-width": 2 }));
        svg.appendChild(createSVGElement("line", { x1: -15, y1: -15, x2: 15, y2: -15, stroke: "#a00000", "stroke-width": 3 }));
        const t = createSVGElement("text", { x: 0, y: -25, "text-anchor": "middle", fill: "#a00000", "font-size": 13, "font-family": "DM Mono", "font-weight": "bold" });
        t.textContent = "+5V (VCC)";
        svg.appendChild(t);
        svg.appendChild(createSVGElement("circle", { cx: 0, cy: 15, r: 4, fill: "#fffdf2", stroke: "#a00000", "stroke-width": 1.5 }));
      } else {
        svg.appendChild(createSVGElement("line", { x1: 0, y1: -15, x2: 0, y2: 10, stroke: "#a00000", "stroke-width": 2 }));
        svg.appendChild(createSVGElement("line", { x1: -18, y1: 10, x2: 18, y2: 10, stroke: "#a00000", "stroke-width": 2 }));
        svg.appendChild(createSVGElement("line", { x1: -11, y1: 16, x2: 11, y2: 16, stroke: "#a00000", "stroke-width": 2 }));
        svg.appendChild(createSVGElement("line", { x1: -4, y1: 22, x2: 4, y2: 22, stroke: "#a00000", "stroke-width": 2 }));
        svg.appendChild(createSVGElement("circle", { cx: 0, cy: -15, r: 4, fill: "#fffdf2", stroke: "#a00000", "stroke-width": 1.5 }));
      }
      previewContainer.appendChild(svg);
      return;
    }

    if (spec.id === "DIODE") {
      svg.appendChild(createSVGElement("line", { x1: -40, y1: 0, x2: -14, y2: 0, stroke: "#1e293b", "stroke-width": 2 }));
      svg.appendChild(createSVGElement("polygon", { points: "-14,-14 -14,14 14,0", fill: "#e9bd4f", stroke: "#1e293b", "stroke-width": 2 }));
      svg.appendChild(createSVGElement("line", { x1: 14, y1: -14, x2: 14, y2: 14, stroke: "#1e293b", "stroke-width": 2.5 }));
      svg.appendChild(createSVGElement("line", { x1: 14, y1: 0, x2: 40, y2: 0, stroke: "#1e293b", "stroke-width": 2 }));
      previewContainer.appendChild(svg);
      return;
    }

    const boxW = 120;
    const boxH = Math.max(90, spec.pinsCount * 9);
    svg.appendChild(createSVGElement("rect", {
      x: -boxW / 2,
      y: -boxH / 2,
      width: boxW,
      height: boxH,
      fill: "#fffdf2",
      stroke: "#1e293b",
      "stroke-width": 2
    }));

    const refText = createSVGElement("text", {
      x: 0,
      y: -boxH / 2 - 8,
      "text-anchor": "middle",
      fill: "#cc0000",
      "font-family": "DM Mono",
      "font-weight": "bold",
      "font-size": 13
    });
    refText.textContent = spec.refPrefix + "1";
    svg.appendChild(refText);

    const nameText = createSVGElement("text", {
      x: 0,
      y: 0,
      "text-anchor": "middle",
      fill: "#1e293b",
      "font-family": "DM Mono",
      "font-weight": "bold",
      "font-size": 14
    });
    nameText.textContent = spec.id;
    svg.appendChild(nameText);

    const leftPins = spec.pins.filter((p) => p.side === "left");
    const rightPins = spec.pins.filter((p) => p.side === "right");

    leftPins.forEach((p, idx) => {
      const py = -boxH / 2 + 15 + idx * ((boxH - 30) / Math.max(1, leftPins.length - 1));
      svg.appendChild(createSVGElement("line", { x1: -boxW / 2 - 25, y1: py, x2: -boxW / 2, y2: py, stroke: "#a00000", "stroke-width": 1.5 }));
      svg.appendChild(createSVGElement("circle", { cx: -boxW / 2 - 25, cy: py, r: 3, fill: "#fffdf2", stroke: "#a00000", "stroke-width": 1.5 }));
      const lbl = createSVGElement("text", { x: -boxW / 2 + 4, y: py + 4, fill: "#1e293b", "font-family": "DM Mono", "font-size": 9 });
      lbl.textContent = p.name;
      svg.appendChild(lbl);
    });

    rightPins.forEach((p, idx) => {
      const py = -boxH / 2 + 15 + idx * ((boxH - 30) / Math.max(1, rightPins.length - 1));
      svg.appendChild(createSVGElement("line", { x1: boxW / 2, y1: py, x2: boxW / 2 + 25, y2: py, stroke: "#a00000", "stroke-width": 1.5 }));
      svg.appendChild(createSVGElement("circle", { cx: boxW / 2 + 25, cy: py, r: 3, fill: "#fffdf2", stroke: "#a00000", "stroke-width": 1.5 }));
      const lbl = createSVGElement("text", { x: boxW / 2 - 4, y: py + 4, "text-anchor": "end", fill: "#1e293b", "font-family": "DM Mono", "font-size": 9 });
      lbl.textContent = p.name;
      svg.appendChild(lbl);
    });

    previewContainer.appendChild(svg);
  }

  function renderFootprintPreview(spec) {
    const footprintContainer = document.getElementById("preview-footprint-svg");
    if (!footprintContainer) return;
    footprintContainer.innerHTML = "";

    const svg = createSVGElement("svg", {
      viewBox: "-100 -80 200 160",
      width: "100%",
      height: "100%"
    });

    const isDIP16 = spec.pinsCount === 16;
    const isDIP14 = spec.pinsCount === 14;
    const padsPerSide = isDIP16 ? 8 : (isDIP14 ? 7 : 1);

    const bodyW = 60;
    const bodyH = padsPerSide * 16 + 10;

    svg.appendChild(createSVGElement("rect", {
      x: -bodyW / 2,
      y: -bodyH / 2,
      width: bodyW,
      height: bodyH,
      fill: "none",
      stroke: "#cbd5e1",
      "stroke-width": 1.5
    }));

    svg.appendChild(createSVGElement("path", {
      d: `M -10 ${-bodyH / 2} A 10 10 0 0 0 10 ${-bodyH / 2}`,
      fill: "none",
      stroke: "#cbd5e1",
      "stroke-width": 1.5
    }));

    for (let i = 0; i < padsPerSide; i++) {
      const py = -bodyH / 2 + 12 + i * 16;
      svg.appendChild(createSVGElement("rect", {
        x: -bodyW / 2 - 12,
        y: py - 4,
        width: 12,
        height: 8,
        rx: 1,
        fill: i === 0 ? "#ea580c" : "#b45309",
        stroke: "#f97316",
        "stroke-width": 0.5
      }));
      svg.appendChild(createSVGElement("rect", {
        x: bodyW / 2,
        y: py - 4,
        width: 12,
        height: 8,
        rx: 1,
        fill: "#b45309",
        stroke: "#f97316",
        "stroke-width": 0.5
      }));
    }

    const t = createSVGElement("text", {
      x: 0,
      y: 0,
      "text-anchor": "middle",
      fill: "#94a3b8",
      "font-family": "DM Mono",
      "font-size": 11,
      "font-weight": "bold"
    });
    t.textContent = spec.package;
    svg.appendChild(t);

    footprintContainer.appendChild(svg);
  }

  function placeSelectedSymbol() {
    if (!state.selectedModalItem) return;
    const cx = state.viewBox.x + state.viewBox.w / 2;
    const cy = state.viewBox.y + state.viewBox.h / 2;
    addComponentAt(state.selectedModalItem, cx, cy);
  }

  // =========================================================================
  // 6. COMPONENT & SELECTION MANAGEMENT
  // =========================================================================
  function addComponentAt(type, x, y) {
    const spec = LIBRARY[type];
    if (!spec) return;

    const gx = Math.round(x / 20) * 20;
    const gy = Math.round(y / 20) * 20;

    const comp = {
      id: "comp_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      type: type,
      ref: getNextRef(spec.refPrefix),
      x: gx,
      y: gy,
      state: spec.customState ? { ...spec.customState } : {}
    };

    state.components.push(comp);
    setSelectedItem({ type: "comp", id: comp.id });
    render();
    return comp;
  }

  // Undo history stack
  const undoStack = [];
  function pushUndoState(action) {
    undoStack.push(action);
    if (undoStack.length > 50) undoStack.shift();
  }

  function performUndo() {
    if (undoStack.length === 0) return;
    const action = undoStack.pop();
    if (action.action === "add_wire") {
      state.wires = state.wires.filter((w) => w.id !== action.wire.id);
      if (state.selectedItem?.id === action.wire.id) setSelectedItem(null);
      render();
    } else if (action.action === "remove_wire") {
      state.wires.push(action.wire);
      render();
    } else if (action.action === "remove_wires") {
      action.wires.forEach((w) => state.wires.push(w));
      render();
    }
  }

  function setSelectedItem(item) {
    if (state.selectedItem) {
      if (state.selectedItem.type === "comp") {
        document.getElementById(`node-${state.selectedItem.id}`)?.classList.remove("selected");
      } else if (state.selectedItem.type === "wire") {
        document.getElementById(`wire-${state.selectedItem.id}`)?.classList.remove("selected");
      }
    }

    state.selectedItem = item;

    const pill = document.getElementById("wire-action-pill");
    document.querySelectorAll(".pin-endpoint-highlight").forEach((el) => el.classList.remove("pin-endpoint-highlight"));

    if (item) {
      if (item.type === "comp") {
        document.getElementById(`node-${item.id}`)?.classList.add("selected");
        if (pill) pill.style.display = "none";
      } else if (item.type === "wire") {
        document.getElementById(`wire-${item.id}`)?.classList.add("selected");
        const wire = state.wires.find((w) => w.id === item.id);
        if (wire) {
          highlightWireEndpoints(wire, true);
          if (pill) {
            const fromComp = state.components.find((c) => c.id === wire.from.compId);
            const toComp = state.components.find((c) => c.id === wire.to.compId);
            const fromSpec = fromComp ? LIBRARY[fromComp.type] : null;
            const toSpec = toComp ? LIBRARY[toComp.type] : null;
            const fromPin = fromSpec?.pins.find((p) => p.num === wire.from.pinNum);
            const toPin = toSpec?.pins.find((p) => p.num === wire.to.pinNum);

            const infoEl = document.getElementById("wire-pill-info");
            const stateEl = document.getElementById("wire-pill-state");
            if (infoEl) infoEl.textContent = `${fromComp ? fromComp.ref : ""}.${wire.from.pinNum} (${fromPin?.name || ""}) ➔ ${toComp ? toComp.ref : ""}.${wire.to.pinNum} (${toPin?.name || ""})`;
            if (stateEl) {
              stateEl.textContent = wire.state === 1 ? "[HIGH - 5V]" : "[LOW - 0V]";
              stateEl.style.color = wire.state === 1 ? "#22c55e" : "#94a3b8";
            }
            pill.style.display = "flex";
          }
        }
      }
    } else {
      if (pill) pill.style.display = "none";
    }
  }

  function deleteSelectedItem() {
    if (!state.selectedItem) return;

    if (state.selectedItem.type === "comp") {
      const compId = state.selectedItem.id;
      const removedWires = state.wires.filter(
        (w) => w.from.compId === compId || w.to.compId === compId
      );
      pushUndoState({ action: "remove_wires", wires: removedWires });
      state.wires = state.wires.filter(
        (w) => w.from.compId !== compId && w.to.compId !== compId
      );
      state.components = state.components.filter((c) => c.id !== compId);
    } else if (state.selectedItem.type === "wire") {
      const wireId = state.selectedItem.id;
      const removedWire = state.wires.find((w) => w.id === wireId);
      if (removedWire) {
        pushUndoState({ action: "remove_wire", wire: removedWire });
      }
      state.wires = state.wires.filter((w) => w.id !== wireId);
    }

    setSelectedItem(null);
    render();
    updateHintForCurrentTool();
  }

  function clearCanvas() {
    if (confirm("Clear all components and wires from the workbench?")) {
      state.components = [];
      state.wires = [];
      state.selectedItem = null;
      cancelActiveWire();
      render();
    }
  }

  function getConnectedWires(compId, pinNum) {
    return state.wires.filter(
      (w) =>
        (w.from.compId === compId && w.from.pinNum === pinNum) ||
        (w.to.compId === compId && w.to.pinNum === pinNum)
    );
  }

  function disconnectWiresFromPin(compId, pinNum) {
    const removed = state.wires.filter(
      (w) =>
        (w.from.compId === compId && w.from.pinNum === pinNum) ||
        (w.to.compId === compId && w.to.pinNum === pinNum)
    );
    if (removed.length > 0) {
      pushUndoState({ action: "remove_wires", wires: removed });
      state.wires = state.wires.filter(
        (w) =>
          !(w.from.compId === compId && w.from.pinNum === pinNum) &&
          !(w.to.compId === compId && w.to.pinNum === pinNum)
      );
      if (state.selectedItem?.type === "wire") setSelectedItem(null);
      render();
      const hint = document.getElementById("tool-hint-text");
      if (hint) {
        hint.textContent = `✓ Disconnected ${removed.length} wire(s) from Pin ${pinNum}.`;
      }
    }
  }

  function highlightWireEndpoints(wire, isHighlighted) {
    document.querySelectorAll(".pin-endpoint-highlight").forEach((el) => el.classList.remove("pin-endpoint-highlight"));
    if (!isHighlighted || !wire) return;
    const p1El = document.querySelector(`.pin-terminal-group[data-comp-id="${wire.from.compId}"][data-pin-num="${wire.from.pinNum}"]`);
    const p2El = document.querySelector(`.pin-terminal-group[data-comp-id="${wire.to.compId}"][data-pin-num="${wire.to.pinNum}"]`);
    p1El?.classList.add("pin-endpoint-highlight");
    p2El?.classList.add("pin-endpoint-highlight");
  }

  function highlightPinConnectedWires(compId, pinNum, isHighlighted) {
    const wires = getConnectedWires(compId, pinNum);
    wires.forEach((w) => {
      const wireG = document.getElementById(`wire-${w.id}`);
      if (wireG) {
        if (isHighlighted) wireG.classList.add("pin-wire-highlight");
        else wireG.classList.remove("pin-wire-highlight");
      }
    });
  }

  function showPinContextMenu(compId, pinNum, clientX, clientY) {
    const comp = state.components.find((c) => c.id === compId);
    if (!comp) return;
    const spec = LIBRARY[comp.type];
    const pin = spec?.pins.find((p) => p.num === pinNum);
    const wires = getConnectedWires(compId, pinNum);
    const volt = state.pinVoltages[`${compId}:${pinNum}`];
    const valStr = volt !== undefined ? (volt === 1 ? "HIGH (1)" : "LOW (0)") : "FLOATING";

    const menu = document.getElementById("wb-context-menu");
    if (!menu) return;

    const hdr = document.getElementById("ctx-header");
    const st = document.getElementById("ctx-status");
    if (hdr) hdr.textContent = `${comp.ref} Pin ${pinNum} (${pin ? pin.name : ""})`;
    if (st) st.textContent = `Signal: ${valStr} • ${wires.length} wire(s)`;

    const disconnBtn = document.getElementById("ctx-btn-disconnect");
    if (disconnBtn) {
      if (wires.length > 0) {
        disconnBtn.style.display = "flex";
        disconnBtn.textContent = `🗑 Disconnect Wires (${wires.length})`;
        disconnBtn.onclick = () => {
          disconnectWiresFromPin(compId, pinNum);
          hideContextMenu();
        };
      } else {
        disconnBtn.style.display = "none";
      }
    }

    const startBtn = document.getElementById("ctx-btn-start-wire");
    if (startBtn) {
      startBtn.onclick = () => {
        startWireFromPin(compId, pinNum);
        hideContextMenu();
      };
    }

    const wrap = document.getElementById("canvas-wrap");
    if (wrap) {
      const rect = wrap.getBoundingClientRect();
      const x = Math.min(clientX - rect.left, rect.width - 220);
      const y = Math.min(clientY - rect.top, rect.height - 180);
      menu.style.left = `${Math.max(10, x)}px`;
      menu.style.top = `${Math.max(10, y)}px`;
      menu.style.display = "block";
    }
  }

  function hideContextMenu() {
    const menu = document.getElementById("wb-context-menu");
    if (menu) menu.style.display = "none";
  }

  function triggerConnectionRipple(x, y) {
    if (!tempWireLayer) return;
    const ripple = createSVGElement("circle", {
      cx: x,
      cy: y,
      r: 6,
      class: "connection-ripple-anim"
    });
    tempWireLayer.appendChild(ripple);
    setTimeout(() => {
      ripple.remove();
    }, 550);
  }

  function updateHintForCurrentTool() {
    const hint = document.getElementById("tool-hint-text");
    if (!hint) return;
    if (state.activeWire) {
      hint.textContent = `ROUTING WIRE: Move near target pin to connect. [Space] to flip bend. Click board to add corner. [Esc] to cancel.`;
    } else if (state.tool === "wire") {
      hint.textContent = "WIRE MODE: Click any pin terminal to start routing. Click destination pin to connect.";
    } else if (state.tool === "delete") {
      hint.textContent = "DELETE MODE: Click any wire or component to delete it. Click pin to disconnect its wires.";
    } else {
      hint.textContent = "SELECT MODE: Drag components to move. Click switch to toggle 0/1. Click pin to route wire.";
    }
  }

  // =========================================================================
  // 7. SINGLE SOURCE OF TRUTH PIN POSITIONS & ORTHOGONAL WIRING
  // =========================================================================

  /**
   * The single source of truth for pin coordinates.
   * All wires, terminal circles, and hit targets use this exact coordinate.
   */
  function getPinWorldPos(comp, pinNum) {
    const spec = LIBRARY[comp.type];
    const pin = spec.pins.find((p) => p.num === pinNum);
    if (!pin) return { x: comp.x, y: comp.y };

    if (comp.type === "VCC") {
      // Terminal at the bottom of the VCC stem
      return { x: comp.x, y: comp.y + 12 };
    }

    if (comp.type === "GND") {
      // Terminal at the top of the GND stem
      return { x: comp.x, y: comp.y - 14 };
    }

    if (comp.type === "SWITCH") {
      // Terminal on the right of the switch box
      return { x: comp.x + 50, y: comp.y };
    }

    if (comp.type === "LED") {
      // Terminal on the left of the LED circle
      return { x: comp.x - 42, y: comp.y };
    }

    if (comp.type === "PROBE") {
      // Terminal on the left of the probe box
      return { x: comp.x - 46, y: comp.y };
    }

    if (comp.type === "CLOCK") {
      // Terminal on the right of the clock box
      return { x: comp.x + 48, y: comp.y };
    }

    if (comp.type === "DIODE") {
      // Pin 1 (Anode) on left, Pin 2 (Cathode) on right
      return { x: pinNum === 1 ? comp.x - 40 : comp.x + 40, y: comp.y };
    }

    // Standard Dual-In-Line IC Packages (DIP-14, DIP-16)
    const dims = getComponentDims(comp.type);
    const boxX = comp.x - dims.w / 2;
    const boxY = comp.y - dims.h / 2;

    const leftPins = spec.pins.filter((p) => p.side === "left");
    const rightPins = spec.pins.filter((p) => p.side === "right");

    if (pin.side === "left") {
      const idx = leftPins.findIndex((p) => p.num === pinNum);
      const py = boxY + 16 + idx * ((dims.h - 32) / Math.max(1, leftPins.length - 1));
      return { x: boxX - 25, y: py };
    } else {
      const idx = rightPins.findIndex((p) => p.num === pinNum);
      const py = boxY + 16 + idx * ((dims.h - 32) / Math.max(1, rightPins.length - 1));
      return { x: boxX + dims.w + 25, y: py };
    }
  }

  function getComponentDims(type) {
    const spec = LIBRARY[type];
    if (spec.category === "power" || spec.category === "io" || spec.id === "DIODE") {
      return { w: 70, h: 50 };
    }
    const maxSidePins = Math.max(
      spec.pins.filter((p) => p.side === "left").length,
      spec.pins.filter((p) => p.side === "right").length
    );
    return {
      w: 130,
      h: Math.max(130, maxSidePins * 22 + 20)
    };
  }

  /**
   * Start multi-point orthogonal wire routing (as shown in wire.mp4)
   */
  function startWireFromPin(compId, pinNum) {
    const comp = state.components.find((c) => c.id === compId);
    if (!comp) return;

    hideContextMenu();
    const startPos = getPinWorldPos(comp, pinNum);
    state.activeWire = {
      fromCompId: compId,
      fromPinNum: pinNum,
      waypoints: [{ x: startPos.x, y: startPos.y }],
      bendMode: "HV" // default bend posture: Horizontal-first
    };

    document.querySelectorAll(".pin-terminal-group").forEach((el) => {
      el.classList.remove("active-start", "snap-hover");
      const cId = el.getAttribute("data-comp-id");
      const pNum = parseInt(el.getAttribute("data-pin-num"), 10);
      if (cId === compId && pNum === pinNum) {
        el.classList.add("active-start");
      } else {
        el.classList.add("connect-target");
      }
    });

    const spec = LIBRARY[comp.type];
    const pin = spec?.pins.find((p) => p.num === pinNum);
    const hint = document.getElementById("tool-hint-text");
    if (hint) {
      hint.textContent = `ROUTING WIRE from ${comp.ref} Pin ${pinNum} (${pin?.name || ""}). Move to destination pin to connect. [Space] flips bend. Click board to add corner.`;
    }
  }

  /**
   * Complete the wire to destination pin
   */
  function completeWireToPin(compId, pinNum) {
    if (!state.activeWire) return;

    if (state.activeWire.fromCompId === compId && state.activeWire.fromPinNum === pinNum) {
      cancelActiveWire();
      return;
    }

    const fromComp = state.components.find((c) => c.id === state.activeWire.fromCompId);
    const toComp = state.components.find((c) => c.id === compId);
    if (!fromComp || !toComp) {
      cancelActiveWire();
      return;
    }

    // Check duplicate
    const duplicate = state.wires.find(
      (w) =>
        (w.from.compId === state.activeWire.fromCompId && w.from.pinNum === state.activeWire.fromPinNum && w.to.compId === compId && w.to.pinNum === pinNum) ||
        (w.to.compId === state.activeWire.fromCompId && w.to.pinNum === state.activeWire.fromPinNum && w.from.compId === compId && w.from.pinNum === pinNum)
    );
    if (duplicate) {
      setSelectedItem({ type: "wire", id: duplicate.id });
      cancelActiveWire();
      return;
    }

    const endPos = getPinWorldPos(toComp, pinNum);
    const lastPt = state.activeWire.waypoints[state.activeWire.waypoints.length - 1];

    // Build the final orthogonal bend to the destination pin
    const finalBend = getOrthogonalSegment(lastPt, endPos, state.activeWire.bendMode);
    
    // Combine all waypoints
    const allPoints = [...state.activeWire.waypoints];
    finalBend.forEach((pt) => {
      // Avoid duplicate consecutive points
      const prev = allPoints[allPoints.length - 1];
      if (!prev || prev.x !== pt.x || prev.y !== pt.y) {
        allPoints.push({ x: pt.x, y: pt.y });
      }
    });

    const wire = {
      id: "wire_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      from: { compId: state.activeWire.fromCompId, pinNum: state.activeWire.fromPinNum },
      to: { compId, pinNum },
      waypoints: allPoints,
      state: 0
    };

    state.wires.push(wire);
    pushUndoState({ action: "add_wire", wire });

    triggerConnectionRipple(endPos.x, endPos.y);

    const fromSpec = LIBRARY[fromComp.type];
    const toSpec = LIBRARY[toComp.type];
    const fromPin = fromSpec?.pins.find((p) => p.num === state.activeWire.fromPinNum);
    const toPin = toSpec?.pins.find((p) => p.num === pinNum);
    const fromStr = `${fromComp.ref}.${state.activeWire.fromPinNum} (${fromPin?.name || ""})`;
    const toStr = `${toComp.ref}.${pinNum} (${toPin?.name || ""})`;

    cancelActiveWire();
    setSelectedItem({ type: "wire", id: wire.id });
    render();

    const hint = document.getElementById("tool-hint-text");
    if (hint) {
      hint.textContent = `✓ Connected ${fromStr} ➔ ${toStr}. Click wire to inspect or press [Delete] to disconnect.`;
    }
  }

  function cancelActiveWire() {
    state.activeWire = null;
    state.hoveredTargetPin = null;
    if (tempWireLayer) tempWireLayer.innerHTML = "";
    document.querySelectorAll(".pin-terminal-group").forEach((el) => {
      el.classList.remove("connect-target", "active-start", "snap-hover");
    });

    updateHintForCurrentTool();
  }

  /**
   * Computes orthogonal points between P1 and P2 based on mode ("HV" or "VH")
   */
  function getOrthogonalSegment(p1, p2, mode) {
    if (p1.x === p2.x || p1.y === p2.y) {
      return [{ x: p2.x, y: p2.y }];
    }
    if (mode === "HV") {
      return [
        { x: p2.x, y: p1.y },
        { x: p2.x, y: p2.y }
      ];
    } else {
      return [
        { x: p1.x, y: p2.y },
        { x: p2.x, y: p2.y }
      ];
    }
  }

  function calculateManhattanPath(x1, y1, x2, y2) {
    const midX = Math.round((x1 + x2) / 2 / 10) * 10;
    return `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;
  }

  function updateTempWirePreview() {
    if (!state.activeWire || !tempWireLayer) return;

    tempWireLayer.innerHTML = "";
    const waypoints = state.activeWire.waypoints;
    const lastPt = waypoints[waypoints.length - 1];
    const targetPt = state.hoveredTargetPin || state.mousePos;

    // Draw fixed waypoints path
    if (waypoints.length > 1) {
      let fixedD = `M ${waypoints[0].x} ${waypoints[0].y}`;
      for (let i = 1; i < waypoints.length; i++) {
        fixedD += ` L ${waypoints[i].x} ${waypoints[i].y}`;
      }
      tempWireLayer.appendChild(createSVGElement("path", {
        d: fixedD,
        class: "active-wire-fixed"
      }));

      // Render dots at each corner
      for (let i = 1; i < waypoints.length; i++) {
        tempWireLayer.appendChild(createSVGElement("circle", {
          cx: waypoints[i].x,
          cy: waypoints[i].y,
          r: 3.5,
          class: "wire-waypoint-dot"
        }));
      }
    }

    // Draw active segment to cursor / snap target
    const bendPts = getOrthogonalSegment(lastPt, targetPt, state.activeWire.bendMode);
    let previewD = `M ${lastPt.x} ${lastPt.y}`;
    bendPts.forEach((pt) => {
      previewD += ` L ${pt.x} ${pt.y}`;
    });

    const previewPath = createSVGElement("path", {
      d: previewD,
      class: `active-wire-preview ${state.hoveredTargetPin ? "snapped" : ""}`
    });
    tempWireLayer.appendChild(previewPath);

    // If corner exists in bend, draw subtle preview corner dot
    if (bendPts.length > 1) {
      tempWireLayer.appendChild(createSVGElement("circle", {
        cx: bendPts[0].x,
        cy: bendPts[0].y,
        r: 3,
        fill: state.hoveredTargetPin ? "#00ff55" : "#2563eb",
        opacity: "0.8"
      }));
    }

    // If magnetic snapping is active, render magnetic target reticle & badge
    if (state.hoveredTargetPin) {
      tempWireLayer.appendChild(createSVGElement("circle", {
        cx: state.hoveredTargetPin.x,
        cy: state.hoveredTargetPin.y,
        r: 16,
        class: "snap-target-ring"
      }));

      const snapComp = state.components.find((c) => c.id === state.hoveredTargetPin.compId);
      const snapSpec = snapComp ? LIBRARY[snapComp.type] : null;
      const snapPin = snapSpec ? snapSpec.pins.find((p) => p.num === state.hoveredTargetPin.pinNum) : null;
      const pinName = snapPin ? snapPin.name : `Pin ${state.hoveredTargetPin.pinNum}`;

      const badge = createSVGElement("text", {
        x: state.hoveredTargetPin.x,
        y: state.hoveredTargetPin.y - 18,
        "text-anchor": "middle",
        class: "snap-badge-text"
      });
      badge.textContent = `⚡ Connect: ${snapComp ? snapComp.ref : ""}.${pinName}`;
      tempWireLayer.appendChild(badge);
    }
  }

  // =========================================================================
  // 8. LIVE LOGIC SIMULATION SOLVER (Deterministic Event Graph)
  // =========================================================================
  function runSimulation() {
    if (!state.isSimRunning) return;

    const pinVoltages = {};

    // 1. Evaluate Drivers (Power, GND, Switches, Clock)
    state.components.forEach((c) => {
      const spec = LIBRARY[c.type];
      if (spec.category === "power" || spec.category === "io") {
        const out = spec.evaluate({}, c);
        for (const [pinNum, val] of Object.entries(out)) {
          pinVoltages[`${c.id}:${pinNum}`] = val;
        }
      }
    });

    // 2. Propagate through Wires iteratively (up to 6 passes for cascading logic like 4-bit adders/comparators)
    for (let pass = 0; pass < 6; pass++) {
      state.wires.forEach((w) => {
        const keyFrom = `${w.from.compId}:${w.from.pinNum}`;
        const keyTo = `${w.to.compId}:${w.to.pinNum}`;

        const vFrom = pinVoltages[keyFrom];
        const vTo = pinVoltages[keyTo];

        if (vFrom !== undefined && vTo === undefined) {
          pinVoltages[keyTo] = vFrom;
          w.state = vFrom;
        } else if (vTo !== undefined && vFrom === undefined) {
          pinVoltages[keyFrom] = vTo;
          w.state = vTo;
        } else if (vFrom !== undefined) {
          w.state = vFrom;
        }
      });

      // Evaluate Complex ICs (7400, 7408, 7432, 7486, 7402, 7404, 74151, 7485, 7483, DIODE)
      state.components.forEach((c) => {
        const spec = LIBRARY[c.type];
        if (spec.category === "gates" || spec.category === "msi" || spec.id === "DIODE") {
          // Check VCC and GND power supply requirement
          if (spec.vccPin && spec.gndPin) {
            const vccVal = pinVoltages[`${c.id}:${spec.vccPin}`];
            const gndVal = pinVoltages[`${c.id}:${spec.gndPin}`];
            const isPowered = (vccVal === 1) && (gndVal === 0);
            c.isPowered = isPowered;

            if (!isPowered) {
              // IC is unpowered! All output pins must produce 0 logic
              spec.pins.forEach((p) => {
                if (p.type === "out") {
                  pinVoltages[`${c.id}:${p.num}`] = 0;
                }
              });
              return;
            }
          }

          const inputValues = {};
          spec.pins.forEach((p) => {
            const val = pinVoltages[`${c.id}:${p.num}`];
            if (val !== undefined) {
              inputValues[p.num.toString()] = val;
            }
          });

          const outputs = spec.evaluate(inputValues, c);
          for (const [pinNum, val] of Object.entries(outputs)) {
            pinVoltages[`${c.id}:${pinNum}`] = val;
          }
        }
      });
    }

    state.pinVoltages = pinVoltages;
    updateVisualSimulation(pinVoltages);
  }

  function updateVisualSimulation(pinVoltages) {
    state.wires.forEach((w) => {
      const wirePath = document.getElementById(`wire-path-${w.id}`);
      if (wirePath) {
        if (w.state === 1) {
          wirePath.classList.add("state-high");
          wirePath.classList.remove("state-low");
        } else {
          wirePath.classList.add("state-low");
          wirePath.classList.remove("state-high");
        }
      }
    });

    state.components.forEach((c) => {
      const spec = LIBRARY[c.type];
      if (!spec) return;

      // Update Power Badges on ICs
      if (spec.vccPin && spec.gndPin) {
        const pwrG = document.getElementById(`ic-pwr-badge-${c.id}`);
        const pill = document.getElementById(`ic-pwr-pill-${c.id}`);
        const dot = document.getElementById(`ic-pwr-dot-${c.id}`);
        const txt = document.getElementById(`ic-pwr-text-${c.id}`);
        if (pwrG && pill && dot && txt) {
          if (c.isPowered) {
            pwrG.classList.add("powered");
            pwrG.classList.remove("unpowered");
            pill.setAttribute("fill", "#ecfdf5");
            pill.setAttribute("stroke", "#10b981");
            dot.setAttribute("fill", "#10b981");
            txt.setAttribute("fill", "#065f46");
            txt.textContent = "⚡ PWR OK";
          } else {
            pwrG.classList.add("unpowered");
            pwrG.classList.remove("powered");
            pill.setAttribute("fill", "#fef2f2");
            pill.setAttribute("stroke", "#ef4444");
            dot.setAttribute("fill", "#ef4444");
            txt.setAttribute("fill", "#b91c1c");
            txt.textContent = "⚠️ NO PWR";
          }
        }
      }

      if (c.type === "LED") {
        const inVal = pinVoltages[`${c.id}:1`] || 0;
        const ledGlow = document.getElementById(`led-glow-${c.id}`);
        const ledCore = document.getElementById(`led-core-${c.id}`);
        if (ledGlow && ledCore) {
          if (inVal === 1) {
            ledGlow.setAttribute("opacity", "0.95");
            ledCore.setAttribute("fill", "#00ff66");
          } else {
            ledGlow.setAttribute("opacity", "0.0");
            ledCore.setAttribute("fill", "#1e3a24");
          }
        }
      } else if (c.type === "PROBE") {
        const inVal = pinVoltages[`${c.id}:1`] !== undefined ? pinVoltages[`${c.id}:1`] : "-";
        const probeText = document.getElementById(`probe-val-${c.id}`);
        if (probeText) {
          probeText.textContent = inVal;
          probeText.setAttribute("fill", inVal === 1 ? "#00ff66" : (inVal === 0 ? "#94a3b8" : "#cbd5e1"));
        }
      } else if (c.type === "SWITCH") {
        const swVal = c.state.value ? "1" : "0";
        const swText = document.getElementById(`switch-val-${c.id}`);
        const swKnob = document.getElementById(`switch-knob-${c.id}`);
        if (swText && swKnob) {
          swText.textContent = swVal;
          swKnob.setAttribute("x", c.state.value ? c.x + 4 : c.x - 24);
          swKnob.setAttribute("fill", c.state.value ? "#22c55e" : "#ef4444");
        }
      }
    });
  }

  // =========================================================================
  // 9. SVG RENDERING PIPELINE
  // =========================================================================
  function render() {
    renderWires();
    renderComponents();
    runSimulation();
  }

  function renderWires() {
    wireLayer.innerHTML = "";
    junctionLayer.innerHTML = "";

    state.wires.forEach((w) => {
      const fromComp = state.components.find((c) => c.id === w.from.compId);
      const toComp = state.components.find((c) => c.id === w.to.compId);
      if (!fromComp || !toComp) return;

      const p1 = getPinWorldPos(fromComp, w.from.pinNum);
      const p2 = getPinWorldPos(toComp, w.to.pinNum);

      let d = "";
      if (w.waypoints && w.waypoints.length > 1) {
        // Multi-point custom wire
        d = `M ${p1.x} ${p1.y}`;
        for (let i = 1; i < w.waypoints.length - 1; i++) {
          d += ` L ${w.waypoints[i].x} ${w.waypoints[i].y}`;
        }
        d += ` L ${p2.x} ${p2.y}`;
      } else {
        d = calculateManhattanPath(p1.x, p1.y, p2.x, p2.y);
      }

      const wireG = createSVGElement("g", {
        id: `wire-${w.id}`,
        class: `wire-group ${state.selectedItem && state.selectedItem.id === w.id ? "selected" : ""}`
      });

      const hitPath = createSVGElement("path", {
        d: d,
        class: "wire-hit-area"
      });

      const wirePath = createSVGElement("path", {
        id: `wire-path-${w.id}`,
        d: d,
        fill: "none",
        stroke: w.state === 1 ? "#00e650" : "#0a8c2f",
        "stroke-width": 2.5,
        class: `schematic-wire ${w.state === 1 ? "state-high" : "state-low"}`
      });

      wireG.appendChild(hitPath);
      wireG.appendChild(wirePath);

      wireG.addEventListener("mousedown", (e) => {
        // If actively drawing a wire, don't intercept click
        if (state.activeWire) return;
        e.stopPropagation();
        hideContextMenu();
        if (state.tool === "delete") {
          const removedWire = state.wires.find((item) => item.id === w.id);
          if (removedWire) pushUndoState({ action: "remove_wire", wire: removedWire });
          state.wires = state.wires.filter((item) => item.id !== w.id);
          setSelectedItem(null);
          render();
        } else {
          setSelectedItem({ type: "wire", id: w.id });
        }
      });

      wireG.addEventListener("mouseenter", () => {
        if (state.activeWire) return;
        highlightWireEndpoints(w, true);
        const fromComp = state.components.find((c) => c.id === w.from.compId);
        const toComp = state.components.find((c) => c.id === w.to.compId);
        const fromSpec = fromComp ? LIBRARY[fromComp.type] : null;
        const toSpec = toComp ? LIBRARY[toComp.type] : null;
        const fromPin = fromSpec?.pins.find((p) => p.num === w.from.pinNum);
        const toPin = toSpec?.pins.find((p) => p.num === w.to.pinNum);
        const hint = document.getElementById("tool-hint-text");
        if (hint && fromComp && toComp) {
          const voltStr = w.state === 1 ? "HIGH (1)" : "LOW (0)";
          hint.textContent = `WIRE: ${fromComp.ref}.${w.from.pinNum} (${fromPin?.name || ""}) ➔ ${toComp.ref}.${w.to.pinNum} (${toPin?.name || ""}) | Logic: ${voltStr} | Click to select, [Del] to disconnect.`;
        }
      });

      wireG.addEventListener("mouseleave", () => {
        if (state.activeWire) return;
        if (!state.selectedItem || state.selectedItem.id !== w.id) {
          highlightWireEndpoints(w, false);
        }
        updateHintForCurrentTool();
      });

      wireLayer.appendChild(wireG);

      const dot1 = createSVGElement("circle", { cx: p1.x, cy: p1.y, r: 3.5, class: `junction-dot ${w.state === 1 ? "state-high" : ""}` });
      const dot2 = createSVGElement("circle", { cx: p2.x, cy: p2.y, r: 3.5, class: `junction-dot ${w.state === 1 ? "state-high" : ""}` });
      junctionLayer.appendChild(dot1);
      junctionLayer.appendChild(dot2);
    });
  }

  function renderComponents() {
    compLayer.innerHTML = "";

    state.components.forEach((c) => {
      const g = createSVGElement("g", {
        id: `node-${c.id}`,
        class: `component-node ${state.selectedItem && state.selectedItem.id === c.id ? "selected" : ""}`
      });

      renderSingleComponent(g, c);

      // Intelligent drag handler
      g.addEventListener("mousedown", (e) => {
        if (e.target.closest(".pin-terminal-hit")) return;

        // If routing a wire, completely disallow dragging components!
        if (state.activeWire) {
          if (state.hoveredTargetPin) {
            e.stopPropagation();
            e.preventDefault();
            completeWireToPin(state.hoveredTargetPin.compId, state.hoveredTargetPin.pinNum);
          }
          return;
        }

        if (state.tool === "delete") {
          setSelectedItem({ type: "comp", id: c.id });
          deleteSelectedItem();
          return;
        }

        e.stopPropagation();
        hideContextMenu();
        setSelectedItem({ type: "comp", id: c.id });
        state.draggingComp = c;
        const coords = clientToSvgCoords(e.clientX, e.clientY);
        state.dragOffset = { x: coords.x - c.x, y: coords.y - c.y };
        state.dragStartPos = { x: e.clientX, y: e.clientY };
        state.hasDraggedFar = false;
      });

      compLayer.appendChild(g);
    });
  }

  function renderSingleComponent(g, c) {
    const spec = LIBRARY[c.type];
    const dims = getComponentDims(c.type);

    if (spec.category === "power") {
      renderPowerSymbol(g, c, spec);
      return;
    }

    if (spec.category === "io") {
      renderIoSymbol(g, c, spec, dims);
      return;
    }

    if (spec.id === "DIODE") {
      renderDiodeSymbol(g, c, spec, dims);
      return;
    }

    // Default: Professional KiCad IC Package Box (DIP)
    const boxX = c.x - dims.w / 2;
    const boxY = c.y - dims.h / 2;

    // Generous grab area
    g.appendChild(createSVGElement("rect", {
      x: boxX - 10,
      y: boxY - 10,
      width: dims.w + 20,
      height: dims.h + 20,
      class: "comp-grab-area"
    }));

    // Body
    g.appendChild(createSVGElement("rect", {
      x: boxX,
      y: boxY,
      width: dims.w,
      height: dims.h,
      fill: "#fffdf2",
      stroke: "#1e293b",
      "stroke-width": 2,
      class: "comp-body",
      "pointer-events": "none"
    }));

    // Reference
    const refText = createSVGElement("text", {
      x: c.x,
      y: boxY - 8,
      "text-anchor": "middle",
      fill: "#cc0000",
      "font-family": "DM Mono",
      "font-weight": "bold",
      "font-size": 13,
      "pointer-events": "none"
    });
    refText.textContent = c.ref;
    g.appendChild(refText);

    // IC Model Name
    const nameText = createSVGElement("text", {
      x: c.x,
      y: c.y - 12,
      "text-anchor": "middle",
      fill: "#1e293b",
      "font-family": "DM Mono",
      "font-weight": "bold",
      "font-size": 15,
      "pointer-events": "none"
    });
    nameText.textContent = spec.id;
    g.appendChild(nameText);

    // Package subtitle
    const pkgText = createSVGElement("text", {
      x: c.x,
      y: c.y + 8,
      "text-anchor": "middle",
      fill: "#64748b",
      "font-family": "DM Mono",
      "font-size": 10,
      "pointer-events": "none"
    });
    pkgText.textContent = spec.package;
    g.appendChild(pkgText);

    // Power Status Badge (for ICs requiring VCC and GND)
    if (spec.vccPin && spec.gndPin) {
      const isPwr = !!c.isPowered;
      const pwrG = createSVGElement("g", {
        id: `ic-pwr-badge-${c.id}`,
        class: `ic-power-badge ${isPwr ? "powered" : "unpowered"}`,
        "pointer-events": "none"
      });

      const pillY = c.y + 20;
      const pillW = 86;
      const pillH = 18;

      const pill = createSVGElement("rect", {
        id: `ic-pwr-pill-${c.id}`,
        x: c.x - pillW / 2,
        y: pillY,
        width: pillW,
        height: pillH,
        rx: 9,
        fill: isPwr ? "#ecfdf5" : "#fef2f2",
        stroke: isPwr ? "#10b981" : "#ef4444",
        "stroke-width": 1.2
      });

      const dot = createSVGElement("circle", {
        id: `ic-pwr-dot-${c.id}`,
        cx: c.x - pillW / 2 + 10,
        cy: pillY + pillH / 2,
        r: 3.5,
        fill: isPwr ? "#10b981" : "#ef4444"
      });

      const txt = createSVGElement("text", {
        id: `ic-pwr-text-${c.id}`,
        x: c.x + 4,
        y: pillY + pillH / 2 + 3.5,
        "text-anchor": "middle",
        fill: isPwr ? "#065f46" : "#b91c1c",
        "font-family": "DM Mono",
        "font-weight": "bold",
        "font-size": 9.5
      });
      txt.textContent = isPwr ? "⚡ PWR OK" : "⚠️ NO PWR";

      pwrG.appendChild(pill);
      pwrG.appendChild(dot);
      pwrG.appendChild(txt);
      g.appendChild(pwrG);
    }

    // Render Pins & Terminals (All pins use single source of truth getPinWorldPos)
    spec.pins.forEach((p) => {
      const pinPos = getPinWorldPos(c, p.num);
      const isLeft = p.side === "left";
      const lineX2 = isLeft ? boxX : boxX + dims.w;

      // Pin stub line
      const line = createSVGElement("line", {
        x1: pinPos.x,
        y1: pinPos.y,
        x2: lineX2,
        y2: pinPos.y,
        stroke: "#a00000",
        "stroke-width": 1.5,
        "pointer-events": "none"
      });

      // Pin number
      const pinNum = createSVGElement("text", {
        x: isLeft ? boxX - 12 : boxX + dims.w + 12,
        y: pinPos.y - 4,
        fill: "#718096",
        "font-family": "DM Mono",
        "font-size": 9,
        "text-anchor": "middle",
        "pointer-events": "none"
      });
      pinNum.textContent = p.num;

      // Pin name
      const pinLbl = createSVGElement("text", {
        x: isLeft ? boxX + 6 : boxX + dims.w - 6,
        y: pinPos.y + 4,
        fill: "#1e293b",
        "font-family": "DM Mono",
        "font-weight": "600",
        "font-size": 10,
        "text-anchor": isLeft ? "start" : "end",
        "pointer-events": "none"
      });
      pinLbl.textContent = p.name;

      const term = createPinTerminalGroup(c.id, p.num, pinPos.x, pinPos.y);

      g.appendChild(line);
      g.appendChild(pinNum);
      g.appendChild(pinLbl);
      g.appendChild(term);
    });
  }

  function renderPowerSymbol(g, c, spec) {
    if (spec.id === "VCC") {
      const pPos = getPinWorldPos(c, 1); // Exact terminal at c.x, c.y + 12

      // Generous 70x70 transparent grab area
      g.appendChild(createSVGElement("rect", {
        x: c.x - 35,
        y: c.y - 35,
        width: 70,
        height: 70,
        class: "comp-grab-area"
      }));

      // VCC Stem from terminal up to arrow/bar
      g.appendChild(createSVGElement("line", {
        x1: pPos.x,
        y1: pPos.y,
        x2: c.x,
        y2: c.y - 16,
        stroke: "#a00000",
        "stroke-width": 2,
        "pointer-events": "none"
      }));

      // VCC Top Arrow / Bar
      g.appendChild(createSVGElement("line", {
        x1: c.x - 14,
        y1: c.y - 16,
        x2: c.x + 14,
        y2: c.y - 16,
        stroke: "#a00000",
        "stroke-width": 3,
        "pointer-events": "none"
      }));

      const t = createSVGElement("text", {
        x: c.x,
        y: c.y - 24,
        "text-anchor": "middle",
        fill: "#a00000",
        "font-family": "DM Mono",
        "font-weight": "bold",
        "font-size": 12,
        "pointer-events": "none"
      });
      t.textContent = "+5V";
      g.appendChild(t);

      // Terminal circle placed exactly at pPos
      g.appendChild(createPinTerminalGroup(c.id, 1, pPos.x, pPos.y));

    } else {
      // GND symbol
      const pPos = getPinWorldPos(c, 1); // Exact terminal at c.x, c.y - 14

      // Generous 70x70 transparent grab area
      g.appendChild(createSVGElement("rect", {
        x: c.x - 35,
        y: c.y - 25,
        width: 70,
        height: 70,
        class: "comp-grab-area"
      }));

      // GND Stem from terminal down to horizontal plates
      g.appendChild(createSVGElement("line", {
        x1: pPos.x,
        y1: pPos.y,
        x2: c.x,
        y2: c.y + 6,
        stroke: "#a00000",
        "stroke-width": 2,
        "pointer-events": "none"
      }));

      // 3 Ground horizontal bars
      g.appendChild(createSVGElement("line", { x1: c.x - 18, y1: c.y + 6, x2: c.x + 18, y2: c.y + 6, stroke: "#a00000", "stroke-width": 2.5, "pointer-events": "none" }));
      g.appendChild(createSVGElement("line", { x1: c.x - 11, y1: c.y + 12, x2: c.x + 11, y2: c.y + 12, stroke: "#a00000", "stroke-width": 2, "pointer-events": "none" }));
      g.appendChild(createSVGElement("line", { x1: c.x - 4, y1: c.y + 18, x2: c.x + 4, y2: c.y + 18, stroke: "#a00000", "stroke-width": 2, "pointer-events": "none" }));

      const t = createSVGElement("text", {
        x: c.x,
        y: c.y + 32,
        "text-anchor": "middle",
        fill: "#64748b",
        "font-family": "DM Mono",
        "font-size": 10,
        "pointer-events": "none"
      });
      t.textContent = "GND";
      g.appendChild(t);

      // Terminal circle placed exactly at pPos
      g.appendChild(createPinTerminalGroup(c.id, 1, pPos.x, pPos.y));
    }
  }

  function renderIoSymbol(g, c, spec, dims) {
    if (c.type === "SWITCH") {
      const boxW = 60;
      const boxH = 34;
      const pPos = getPinWorldPos(c, 1);

      // Generous grab area (80x60)
      g.appendChild(createSVGElement("rect", {
        x: c.x - boxW / 2 - 10,
        y: c.y - boxH / 2 - 10,
        width: boxW + 40,
        height: boxH + 20,
        class: "comp-grab-area"
      }));

      const swG = createSVGElement("g", { class: "switch-control" });

      swG.appendChild(createSVGElement("rect", {
        x: c.x - boxW / 2,
        y: c.y - boxH / 2,
        width: boxW,
        height: boxH,
        rx: 4,
        fill: "#1e293b",
        stroke: "#334155",
        "stroke-width": 1.5,
        "pointer-events": "none"
      }));

      swG.appendChild(createSVGElement("rect", {
        id: `switch-knob-${c.id}`,
        x: c.state.value ? c.x + 4 : c.x - 24,
        y: c.y - 12,
        width: 20,
        height: 24,
        rx: 3,
        fill: c.state.value ? "#22c55e" : "#ef4444",
        "pointer-events": "none"
      }));

      const swText = createSVGElement("text", {
        id: `switch-val-${c.id}`,
        x: c.state.value ? c.x - 12 : c.x + 14,
        y: c.y + 5,
        "text-anchor": "middle",
        fill: "#ffffff",
        "font-family": "DM Mono",
        "font-weight": "bold",
        "font-size": 13,
        "pointer-events": "none"
      });
      swText.textContent = c.state.value ? "1" : "0";
      swG.appendChild(swText);

      g.appendChild(swG);

      // Terminal stem line
      g.appendChild(createSVGElement("line", {
        x1: c.x + boxW / 2,
        y1: c.y,
        x2: pPos.x,
        y2: pPos.y,
        stroke: "#a00000",
        "stroke-width": 1.5,
        "pointer-events": "none"
      }));

      // Terminal group
      g.appendChild(createPinTerminalGroup(c.id, 1, pPos.x, pPos.y));

      const refT = createSVGElement("text", {
        x: c.x,
        y: c.y - boxH / 2 - 6,
        "text-anchor": "middle",
        fill: "#cc0000",
        "font-family": "DM Mono",
        "font-weight": "bold",
        "font-size": 11,
        "pointer-events": "none"
      });
      refT.textContent = c.ref;
      g.appendChild(refT);

    } else if (c.type === "LED") {
      const ledR = 18;
      const pPos = getPinWorldPos(c, 1);
      const initialVal = state.pinVoltages[`${c.id}:1`] || 0;

      // Generous grab area
      g.appendChild(createSVGElement("rect", {
        x: c.x - ledR - 25,
        y: c.y - ledR - 10,
        width: ledR * 2 + 50,
        height: ledR * 2 + 20,
        class: "comp-grab-area"
      }));

      const glow = createSVGElement("circle", {
        id: `led-glow-${c.id}`,
        cx: c.x,
        cy: c.y,
        r: 28,
        fill: "#00ff66",
        opacity: initialVal === 1 ? "0.95" : "0.0",
        class: "led-glow",
        filter: "blur(6px)",
        "pointer-events": "none"
      });
      g.appendChild(glow);

      const bulb = createSVGElement("circle", {
        id: `led-core-${c.id}`,
        cx: c.x,
        cy: c.y,
        r: ledR,
        fill: initialVal === 1 ? "#00ff66" : "#1e3a24",
        stroke: "#0f172a",
        "stroke-width": 2,
        "pointer-events": "none"
      });
      g.appendChild(bulb);

      g.appendChild(createSVGElement("line", {
        x1: pPos.x,
        y1: pPos.y,
        x2: c.x - ledR,
        y2: c.y,
        stroke: "#a00000",
        "stroke-width": 1.5,
        "pointer-events": "none"
      }));

      g.appendChild(createPinTerminalGroup(c.id, 1, pPos.x, pPos.y));

      const refT = createSVGElement("text", {
        x: c.x,
        y: c.y - ledR - 6,
        "text-anchor": "middle",
        fill: "#cc0000",
        "font-family": "DM Mono",
        "font-weight": "bold",
        "font-size": 11,
        "pointer-events": "none"
      });
      refT.textContent = c.ref;
      g.appendChild(refT);

    } else if (c.type === "PROBE") {
      const boxW = 46;
      const boxH = 34;
      const pPos = getPinWorldPos(c, 1);
      const initialVal = state.pinVoltages[`${c.id}:1`] !== undefined ? state.pinVoltages[`${c.id}:1`] : "-";

      g.appendChild(createSVGElement("rect", {
        x: c.x - boxW / 2 - 25,
        y: c.y - boxH / 2 - 10,
        width: boxW + 40,
        height: boxH + 20,
        class: "comp-grab-area"
      }));

      g.appendChild(createSVGElement("rect", {
        x: c.x - boxW / 2,
        y: c.y - boxH / 2,
        width: boxW,
        height: boxH,
        rx: 4,
        fill: "#0f172a",
        stroke: "#38bdf8",
        "stroke-width": 1.5,
        "pointer-events": "none"
      }));

      const valText = createSVGElement("text", {
        id: `probe-val-${c.id}`,
        x: c.x,
        y: c.y + 6,
        "text-anchor": "middle",
        fill: initialVal === 1 ? "#00ff66" : (initialVal === 0 ? "#94a3b8" : "#cbd5e1"),
        "font-family": "DM Mono",
        "font-weight": "bold",
        "font-size": 18,
        "pointer-events": "none"
      });
      valText.textContent = initialVal;
      g.appendChild(valText);

      g.appendChild(createSVGElement("line", {
        x1: pPos.x,
        y1: pPos.y,
        x2: c.x - boxW / 2,
        y2: c.y,
        stroke: "#a00000",
        "stroke-width": 1.5,
        "pointer-events": "none"
      }));

      g.appendChild(createPinTerminalGroup(c.id, 1, pPos.x, pPos.y));

      const refT = createSVGElement("text", {
        x: c.x,
        y: c.y - boxH / 2 - 6,
        "text-anchor": "middle",
        fill: "#cc0000",
        "font-family": "DM Mono",
        "font-weight": "bold",
        "font-size": 11,
        "pointer-events": "none"
      });
      refT.textContent = c.ref;
      g.appendChild(refT);

    } else if (c.type === "CLOCK") {
      const boxW = 54;
      const boxH = 34;
      const pPos = getPinWorldPos(c, 1);

      g.appendChild(createSVGElement("rect", {
        x: c.x - boxW / 2 - 10,
        y: c.y - boxH / 2 - 10,
        width: boxW + 40,
        height: boxH + 20,
        class: "comp-grab-area"
      }));

      g.appendChild(createSVGElement("rect", {
        x: c.x - boxW / 2,
        y: c.y - boxH / 2,
        width: boxW,
        height: boxH,
        rx: 4,
        fill: "#312e81",
        stroke: "#6366f1",
        "stroke-width": 1.5,
        "pointer-events": "none"
      }));

      g.appendChild(createSVGElement("path", {
        d: `M ${c.x - 14} ${c.y + 6} L ${c.x - 14} ${c.y - 6} L ${c.x} ${c.y - 6} L ${c.x} ${c.y + 6} L ${c.x + 14} ${c.y + 6}`,
        fill: "none",
        stroke: "#a5b4fc",
        "stroke-width": 2,
        "pointer-events": "none"
      }));

      g.appendChild(createSVGElement("line", {
        x1: c.x + boxW / 2,
        y1: c.y,
        x2: pPos.x,
        y2: pPos.y,
        stroke: "#a00000",
        "stroke-width": 1.5,
        "pointer-events": "none"
      }));

      g.appendChild(createPinTerminalGroup(c.id, 1, pPos.x, pPos.y));

      const refT = createSVGElement("text", {
        x: c.x,
        y: c.y - boxH / 2 - 6,
        "text-anchor": "middle",
        fill: "#cc0000",
        "font-family": "DM Mono",
        "font-weight": "bold",
        "font-size": 11,
        "pointer-events": "none"
      });
      refT.textContent = c.ref;
      g.appendChild(refT);
    }
  }

  function renderDiodeSymbol(g, c, spec, dims) {
    const p1 = getPinWorldPos(c, 1);
    const p2 = getPinWorldPos(c, 2);

    g.appendChild(createSVGElement("rect", {
      x: c.x - 45,
      y: c.y - 25,
      width: 90,
      height: 50,
      class: "comp-grab-area"
    }));

    g.appendChild(createSVGElement("line", { x1: p1.x, y1: c.y, x2: c.x - 14, y2: c.y, stroke: "#a00000", "stroke-width": 1.5, "pointer-events": "none" }));
    g.appendChild(createSVGElement("polygon", { points: `${c.x - 14},${c.y - 14} ${c.x - 14},${c.y + 14} ${c.x + 14},${c.y}`, fill: "#e9bd4f", stroke: "#1e293b", "stroke-width": 1.8, "pointer-events": "none" }));
    g.appendChild(createSVGElement("line", { x1: c.x + 14, y1: c.y - 14, x2: c.x + 14, y2: c.y + 14, stroke: "#1e293b", "stroke-width": 2.5, "pointer-events": "none" }));
    g.appendChild(createSVGElement("line", { x1: c.x + 14, y1: c.y, x2: p2.x, y2: c.y, stroke: "#a00000", "stroke-width": 1.5, "pointer-events": "none" }));

    g.appendChild(createPinTerminalGroup(c.id, 1, p1.x, c.y));
    g.appendChild(createPinTerminalGroup(c.id, 2, p2.x, c.y));

    const refT = createSVGElement("text", {
      x: c.x,
      y: c.y - 18,
      "text-anchor": "middle",
      fill: "#cc0000",
      "font-family": "DM Mono",
      "font-weight": "bold",
      "font-size": 11,
      "pointer-events": "none"
    });
    refT.textContent = c.ref + " 1N4148";
    g.appendChild(refT);
  }

  function createPinTerminalGroup(compId, pinNum, x, y) {
    const g = createSVGElement("g", {
      class: "pin-terminal-group",
      "data-comp-id": compId,
      "data-pin-num": pinNum
    });

    const wires = getConnectedWires(compId, pinNum);
    const isConnected = wires.length > 0;
    const isJunction = wires.length >= 2;
    const volt = state.pinVoltages[`${compId}:${pinNum}`];
    const isHigh = volt === 1;

    let visualClass = "pin-terminal-visual";
    let r = 4.5;
    let fill = "#fffdf2";
    let stroke = "#a00000";
    let strokeWidth = 1.8;

    if (!isConnected) {
      visualClass += " unconnected";
      r = 4.0;
      fill = "#fffdf2";
      stroke = "#a00000";
      strokeWidth = 1.8;
    } else if (isJunction) {
      visualClass += ` junction ${isHigh ? "state-high" : "state-low"}`;
      r = 6.0;
      fill = isHigh ? "#00ff66" : "#0a8c2f";
      stroke = isHigh ? "#ffffff" : "#064e3b";
      strokeWidth = 2.0;
    } else {
      visualClass += ` connected ${isHigh ? "state-high" : "state-low"}`;
      r = 4.8;
      fill = isHigh ? "#00ff66" : "#0a8c2f";
      stroke = isHigh ? "#009933" : "#064e3b";
      strokeWidth = 1.5;
    }

    const visual = createSVGElement("circle", {
      cx: x,
      cy: y,
      r: r,
      fill: fill,
      stroke: stroke,
      "stroke-width": strokeWidth,
      class: visualClass
    });

    // Generous 36px touch hit-target
    const hitArea = createSVGElement("circle", {
      cx: x,
      cy: y,
      r: 18,
      class: "pin-terminal-hit"
    });

    g.appendChild(visual);
    g.appendChild(hitArea);

    hitArea.addEventListener("mousedown", (e) => {
      e.stopPropagation();
      e.preventDefault();
      hideContextMenu();

      if (state.tool === "delete") {
        disconnectWiresFromPin(compId, pinNum);
        return;
      }

      if (!state.activeWire) {
        startWireFromPin(compId, pinNum);
      } else {
        completeWireToPin(compId, pinNum);
      }
    });

    hitArea.addEventListener("mouseup", (e) => {
      if (state.activeWire && state.activeWire.fromCompId !== compId) {
        e.stopPropagation();
        e.preventDefault();
        completeWireToPin(compId, pinNum);
      }
    });

    hitArea.addEventListener("mouseenter", () => {
      highlightPinConnectedWires(compId, pinNum, true);

      if (state.activeWire && !(state.activeWire.fromCompId === compId && state.activeWire.fromPinNum === pinNum)) {
        state.hoveredTargetPin = { compId, pinNum, x, y };
        g.classList.add("snap-hover");
        updateTempWirePreview();
      } else if (!state.activeWire) {
        const comp = state.components.find((c) => c.id === compId);
        const spec = comp ? LIBRARY[comp.type] : null;
        const pin = spec?.pins.find((p) => p.num === pinNum);
        const wCount = wires.length;
        const vStr = volt !== undefined ? (volt === 1 ? "HIGH (1)" : "LOW (0)") : "FLOATING";
        const hint = document.getElementById("tool-hint-text");
        if (hint && comp) {
          if (spec && spec.vccPin && spec.gndPin && !comp.isPowered) {
            hint.textContent = `Pin ${pinNum} [${pin ? pin.name : ""}] of ${comp.ref} (${comp.type}) | ⚠️ UNPOWERED: Connect Pin ${spec.vccPin} to +5V & Pin ${spec.gndPin} to GND | Signal: ${vStr}`;
          } else {
            hint.textContent = `Pin ${pinNum} [${pin ? pin.name : ""}] of ${comp.ref} (${comp.type}) | Signal: ${vStr} | Connected: ${wCount} wire(s). Click to route wire, right-click for options.`;
          }
        }
      }
    });

    hitArea.addEventListener("mouseleave", () => {
      highlightPinConnectedWires(compId, pinNum, false);
      if (!state.activeWire) {
        updateHintForCurrentTool();
      }
    });

    hitArea.addEventListener("contextmenu", (e) => {
      e.stopPropagation();
      e.preventDefault();
      showPinContextMenu(compId, pinNum, e.clientX, e.clientY);
    });

    return g;
  }

  // =========================================================================
  // 10. CANVAS MOUSE & WIRE DRAWING EVENTS
  // =========================================================================
  function onCanvasMouseMove(e) {
    const coords = clientToSvgCoords(e.clientX, e.clientY);
    state.mousePos = coords;

    // Detect if mouse moved significantly during drag
    if (state.draggingComp) {
      const dist = Math.hypot(e.clientX - state.dragStartPos.x, e.clientY - state.dragStartPos.y);
      if (dist > 4) {
        state.hasDraggedFar = true;
      }
      const gx = Math.round((coords.x - state.dragOffset.x) / 10) * 10;
      const gy = Math.round((coords.y - state.dragOffset.y) / 10) * 10;
      state.draggingComp.x = gx;
      state.draggingComp.y = gy;
      render();
      return;
    }

    // Active multi-point wire drawing with generous magnetic snapping (28px)
    if (state.activeWire) {
      state.hoveredTargetPin = null;
      document.querySelectorAll(".pin-terminal-group").forEach((el) => {
        el.classList.remove("snap-hover");
      });

      const SNAP_RADIUS = 28;
      let bestDist = SNAP_RADIUS;
      let bestPin = null;

      for (const comp of state.components) {
        const spec = LIBRARY[comp.type];
        for (const p of spec.pins) {
          if (comp.id === state.activeWire.fromCompId && p.num === state.activeWire.fromPinNum) continue;

          const pPos = getPinWorldPos(comp, p.num);
          const dist = Math.hypot(coords.x - pPos.x, coords.y - pPos.y);
          if (dist < bestDist) {
            bestDist = dist;
            bestPin = { compId: comp.id, pinNum: p.num, x: pPos.x, y: pPos.y };
          }
        }
      }

      if (bestPin) {
        state.hoveredTargetPin = bestPin;
        const targetEl = document.querySelector(`.pin-terminal-group[data-comp-id="${bestPin.compId}"][data-pin-num="${bestPin.pinNum}"]`);
        targetEl?.classList.add("snap-hover");
      }

      updateTempWirePreview();
    }
  }

  function onCanvasMouseDown(e) {
    // If context menu is open, clicking canvas hides it
    if (!e.target.closest("#wb-context-menu")) {
      hideContextMenu();
    }

    // If active wire routing is in progress
    if (state.activeWire) {
      e.stopPropagation();
      e.preventDefault();

      // 1. Check if snapped, or clicked near ANY pin (within 28px)
      let target = state.hoveredTargetPin;
      if (!target) {
        const coords = clientToSvgCoords(e.clientX, e.clientY);
        const SNAP_RADIUS = 28;
        let bestDist = SNAP_RADIUS;
        for (const comp of state.components) {
          const spec = LIBRARY[comp.type];
          for (const p of spec.pins) {
            if (comp.id === state.activeWire.fromCompId && p.num === state.activeWire.fromPinNum) continue;
            const pPos = getPinWorldPos(comp, p.num);
            const dist = Math.hypot(coords.x - pPos.x, coords.y - pPos.y);
            if (dist < bestDist) {
              bestDist = dist;
              target = { compId: comp.id, pinNum: p.num, x: pPos.x, y: pPos.y };
            }
          }
        }
      }

      if (target) {
        completeWireToPin(target.compId, target.pinNum);
        return;
      }

      // 2. Check if clicked near the start pin -> cancel
      const startPos = state.activeWire.waypoints[0];
      const coords = clientToSvgCoords(e.clientX, e.clientY);
      if (Math.hypot(coords.x - startPos.x, coords.y - startPos.y) < 20) {
        cancelActiveWire();
        return;
      }

      // 3. Otherwise add intermediate right-angle corner and click point to waypoints
      const lastPt = state.activeWire.waypoints[state.activeWire.waypoints.length - 1];
      const targetPt = state.mousePos;
      const bendPts = getOrthogonalSegment(lastPt, targetPt, state.activeWire.bendMode);
      bendPts.forEach((pt) => {
        const prev = state.activeWire.waypoints[state.activeWire.waypoints.length - 1];
        if (!prev || prev.x !== pt.x || prev.y !== pt.y) {
          state.activeWire.waypoints.push({ x: pt.x, y: pt.y });
        }
      });

      updateTempWirePreview();
      return;
    }

    // If clicking on background
    if (e.target === svgRoot || e.target.id === "grid-layer") {
      setSelectedItem(null);
    }
  }

  function onCanvasMouseUp(e) {
    if (state.draggingComp) {
      const comp = state.draggingComp;
      state.draggingComp = null;

      // If user simply clicked a SWITCH without dragging it, flip value!
      if (comp.type === "SWITCH" && !state.hasDraggedFar) {
        comp.state.value = comp.state.value ? 0 : 1;
        runSimulation();
      }
      return;
    }

    // Drag-to-connect support for wires
    if (state.activeWire && state.hoveredTargetPin && state.activeWire.waypoints.length === 1) {
      const startPos = state.activeWire.waypoints[0];
      const coords = clientToSvgCoords(e.clientX, e.clientY);
      const distFromStart = Math.hypot(coords.x - startPos.x, coords.y - startPos.y);
      if (distFromStart > 20) {
        completeWireToPin(state.hoveredTargetPin.compId, state.hoveredTargetPin.pinNum);
      }
    }
  }

  // =========================================================================
  // 11. LAB PRESET CIRCUITS FOR CAMPUS PRACTICALS
  // =========================================================================
  function loadLabPreset(presetKey) {
    state.components = [];
    state.wires = [];
    state.selectedItem = null;
    cancelActiveWire();

    if (presetKey === "7400_nand") {
      // Preset 1: 7400 NAND Gate Truth Table Verification
      const vcc = addComponentAt("VCC", 530, 130);
      const gnd = addComponentAt("GND", 350, 440);
      const swA = addComponentAt("SWITCH", 180, 210);
      const swB = addComponentAt("SWITCH", 180, 240);
      const ic = addComponentAt("7400", 440, 280);
      const led = addComponentAt("LED", 700, 250);
      const prb = addComponentAt("PROBE", 700, 330);

      // Power Connections (Required for IC gate operation)
      state.wires.push({ id: "w_vcc", from: { compId: vcc.id, pinNum: 1 }, to: { compId: ic.id, pinNum: 14 }, state: 1 });
      state.wires.push({ id: "w_gnd", from: { compId: ic.id, pinNum: 7 }, to: { compId: gnd.id, pinNum: 1 }, state: 0 });

      // Signal Connections: SW A -> Pin 1 (1A), SW B -> Pin 2 (1B), Pin 3 (1Y) -> LED & Probe
      state.wires.push({ id: "w1", from: { compId: swA.id, pinNum: 1 }, to: { compId: ic.id, pinNum: 1 }, state: 0 });
      state.wires.push({ id: "w2", from: { compId: swB.id, pinNum: 1 }, to: { compId: ic.id, pinNum: 2 }, state: 0 });
      state.wires.push({ id: "w3", from: { compId: ic.id, pinNum: 3 }, to: { compId: led.id, pinNum: 1 }, state: 1 });
      state.wires.push({ id: "w4", from: { compId: ic.id, pinNum: 3 }, to: { compId: prb.id, pinNum: 1 }, state: 1 });

    } else if (presetKey === "7483_adder") {
      // Preset 2: 7483 4-Bit Binary Full Adder Test
      const vcc = addComponentAt("VCC", 370, 130);
      const gnd = addComponentAt("GND", 550, 450);
      const swA1 = addComponentAt("SWITCH", 180, 200);
      const swB1 = addComponentAt("SWITCH", 180, 270);
      const swCin = addComponentAt("SWITCH", 180, 340);
      const ic = addComponentAt("7483", 460, 280);
      const ledS1 = addComponentAt("LED", 720, 240);
      const ledC4 = addComponentAt("LED", 720, 330);

      // Power Connections: Pin 5: VCC, Pin 12: GND
      state.wires.push({ id: "w_vcc", from: { compId: vcc.id, pinNum: 1 }, to: { compId: ic.id, pinNum: 5 }, state: 1 });
      state.wires.push({ id: "w_gnd", from: { compId: ic.id, pinNum: 12 }, to: { compId: gnd.id, pinNum: 1 }, state: 0 });

      // Signal Connections: A1 (Pin 10), B1 (Pin 11), Cin (Pin 13), Sum S1 (Pin 9), Cout C4 (Pin 14)
      state.wires.push({ id: "w1", from: { compId: swA1.id, pinNum: 1 }, to: { compId: ic.id, pinNum: 10 }, state: 0 });
      state.wires.push({ id: "w2", from: { compId: swB1.id, pinNum: 1 }, to: { compId: ic.id, pinNum: 11 }, state: 0 });
      state.wires.push({ id: "w3", from: { compId: swCin.id, pinNum: 1 }, to: { compId: ic.id, pinNum: 13 }, state: 0 });
      state.wires.push({ id: "w4", from: { compId: ic.id, pinNum: 9 }, to: { compId: ledS1.id, pinNum: 1 }, state: 0 });
      state.wires.push({ id: "w5", from: { compId: ic.id, pinNum: 14 }, to: { compId: ledC4.id, pinNum: 1 }, state: 0 });

    } else if (presetKey === "7485_comparator") {
      // Preset 3: 7485 4-Bit Magnitude Comparator Test
      const vcc = addComponentAt("VCC", 550, 130);
      const gnd = addComponentAt("GND", 370, 450);
      const swA0 = addComponentAt("SWITCH", 180, 230);
      const swB0 = addComponentAt("SWITCH", 180, 330);
      const ic = addComponentAt("7485", 460, 280);
      const ledGT = addComponentAt("LED", 720, 210);
      const ledEQ = addComponentAt("LED", 720, 270);
      const ledLT = addComponentAt("LED", 720, 330);

      // Power & Cascade Connections: Pin 16: VCC, Pin 8: GND, Pin 3: I_EQ (Tie to VCC for standard comparison)
      state.wires.push({ id: "w_vcc", from: { compId: vcc.id, pinNum: 1 }, to: { compId: ic.id, pinNum: 16 }, state: 1 });
      state.wires.push({ id: "w_gnd", from: { compId: ic.id, pinNum: 8 }, to: { compId: gnd.id, pinNum: 1 }, state: 0 });
      state.wires.push({ id: "w_ieq", from: { compId: vcc.id, pinNum: 1 }, to: { compId: ic.id, pinNum: 3 }, state: 1 });

      // Signal Connections: A0 (Pin 10), B0 (Pin 9), Outputs: A>B (Pin 5), A=B (Pin 6), A<B (Pin 7)
      state.wires.push({ id: "w1", from: { compId: swA0.id, pinNum: 1 }, to: { compId: ic.id, pinNum: 10 }, state: 0 });
      state.wires.push({ id: "w2", from: { compId: swB0.id, pinNum: 1 }, to: { compId: ic.id, pinNum: 9 }, state: 0 });
      state.wires.push({ id: "w3", from: { compId: ic.id, pinNum: 5 }, to: { compId: ledGT.id, pinNum: 1 }, state: 0 });
      state.wires.push({ id: "w4", from: { compId: ic.id, pinNum: 6 }, to: { compId: ledEQ.id, pinNum: 1 }, state: 1 });
      state.wires.push({ id: "w5", from: { compId: ic.id, pinNum: 7 }, to: { compId: ledLT.id, pinNum: 1 }, state: 0 });

    } else if (presetKey === "74151_mux") {
      // Preset 4: 74151 8:1 Multiplexer
      const vcc = addComponentAt("VCC", 550, 130);
      const gnd = addComponentAt("GND", 370, 450);
      const swD0 = addComponentAt("SWITCH", 180, 200);
      const swD1 = addComponentAt("SWITCH", 180, 260);
      const swS0 = addComponentAt("SWITCH", 180, 340);
      const ic = addComponentAt("74151", 460, 280);
      const ledY = addComponentAt("LED", 720, 240);
      const ledW = addComponentAt("LED", 720, 320);

      // Power & Enable: Pin 16: VCC, Pin 8: GND, Pin 7: ~G (Active-low Strobe tied to GND to enable)
      state.wires.push({ id: "w_vcc", from: { compId: vcc.id, pinNum: 1 }, to: { compId: ic.id, pinNum: 16 }, state: 1 });
      state.wires.push({ id: "w_gnd", from: { compId: ic.id, pinNum: 8 }, to: { compId: gnd.id, pinNum: 1 }, state: 0 });
      state.wires.push({ id: "w_strobe", from: { compId: ic.id, pinNum: 7 }, to: { compId: gnd.id, pinNum: 1 }, state: 0 });

      // Signal Connections: D0 (Pin 4), D1 (Pin 3), Select A (Pin 11), True Y (Pin 5), Inverted W (Pin 6)
      state.wires.push({ id: "w1", from: { compId: swD0.id, pinNum: 1 }, to: { compId: ic.id, pinNum: 4 }, state: 0 });
      state.wires.push({ id: "w2", from: { compId: swD1.id, pinNum: 1 }, to: { compId: ic.id, pinNum: 3 }, state: 0 });
      state.wires.push({ id: "w3", from: { compId: swS0.id, pinNum: 1 }, to: { compId: ic.id, pinNum: 11 }, state: 0 });
      state.wires.push({ id: "w4", from: { compId: ic.id, pinNum: 5 }, to: { compId: ledY.id, pinNum: 1 }, state: 0 });
      state.wires.push({ id: "w5", from: { compId: ic.id, pinNum: 6 }, to: { compId: ledW.id, pinNum: 1 }, state: 1 });

    } else if (presetKey === "74153_mux") {
      // Preset 5: 74153 Dual 4:1 Multiplexer Experiment
      const vcc = addComponentAt("VCC", 550, 130);
      const gnd = addComponentAt("GND", 370, 450);
      const swD0 = addComponentAt("SWITCH", 180, 180);
      swD0.state.value = 1; // Default HIGH so channel 00 output is immediately active
      const swD1 = addComponentAt("SWITCH", 180, 230);
      const swD2 = addComponentAt("SWITCH", 180, 280);
      swD2.state.value = 1;
      const swD3 = addComponentAt("SWITCH", 180, 330);
      const swS0 = addComponentAt("SWITCH", 180, 390);
      const swS1 = addComponentAt("SWITCH", 180, 450);
      const ic = addComponentAt("74153", 460, 280);
      const led1Y = addComponentAt("LED", 720, 260);
      const prb1Y = addComponentAt("PROBE", 720, 330);

      // Power & Enable: Pin 16: VCC, Pin 8: GND, Pin 1: 1~G (Active-low Strobe tied to GND to enable MUX 1)
      state.wires.push({ id: "w_vcc", from: { compId: vcc.id, pinNum: 1 }, to: { compId: ic.id, pinNum: 16 }, state: 1 });
      state.wires.push({ id: "w_gnd", from: { compId: ic.id, pinNum: 8 }, to: { compId: gnd.id, pinNum: 1 }, state: 0 });
      state.wires.push({ id: "w_strobe1", from: { compId: ic.id, pinNum: 1 }, to: { compId: gnd.id, pinNum: 1 }, state: 0 });

      // Signal Connections for MUX 1: 1D0 (Pin 6), 1D1 (Pin 5), 1D2 (Pin 4), 1D3 (Pin 3), S0 (Pin 14), S1 (Pin 2), Output 1Y (Pin 7)
      state.wires.push({ id: "w1", from: { compId: swD0.id, pinNum: 1 }, to: { compId: ic.id, pinNum: 6 }, state: 1 });
      state.wires.push({ id: "w2", from: { compId: swD1.id, pinNum: 1 }, to: { compId: ic.id, pinNum: 5 }, state: 0 });
      state.wires.push({ id: "w3", from: { compId: swD2.id, pinNum: 1 }, to: { compId: ic.id, pinNum: 4 }, state: 1 });
      state.wires.push({ id: "w4", from: { compId: swD3.id, pinNum: 1 }, to: { compId: ic.id, pinNum: 3 }, state: 0 });
      state.wires.push({ id: "w5", from: { compId: swS0.id, pinNum: 1 }, to: { compId: ic.id, pinNum: 14 }, state: 0 });
      state.wires.push({ id: "w6", from: { compId: swS1.id, pinNum: 1 }, to: { compId: ic.id, pinNum: 2 }, state: 0 });
      state.wires.push({ id: "w7", from: { compId: ic.id, pinNum: 7 }, to: { compId: led1Y.id, pinNum: 1 }, state: 1 });
      state.wires.push({ id: "w8", from: { compId: ic.id, pinNum: 7 }, to: { compId: prb1Y.id, pinNum: 1 }, state: 1 });

    } else if (presetKey === "diode_or") {
      // Preset 5: Diode OR Gate
      const swA = addComponentAt("SWITCH", 220, 240);
      const swB = addComponentAt("SWITCH", 220, 320);
      const d1 = addComponentAt("DIODE", 420, 240);
      const d2 = addComponentAt("DIODE", 420, 320);
      const led = addComponentAt("LED", 640, 280);

      state.wires.push({ id: "w1", from: { compId: swA.id, pinNum: 1 }, to: { compId: d1.id, pinNum: 1 }, state: 0 });
      state.wires.push({ id: "w2", from: { compId: swB.id, pinNum: 1 }, to: { compId: d2.id, pinNum: 1 }, state: 0 });
      state.wires.push({ id: "w3", from: { compId: d1.id, pinNum: 2 }, to: { compId: led.id, pinNum: 1 }, state: 0 });
      state.wires.push({ id: "w4", from: { compId: d2.id, pinNum: 2 }, to: { compId: led.id, pinNum: 1 }, state: 0 });
    }

    render();
  }

  // =========================================================================
  // 12. HELPER FUNCTIONS
  // =========================================================================
  function createSVGElement(tag, attrs) {
    const el = document.createElementNS(SVG_NS, tag);
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        el.setAttribute(k, v);
      }
    }
    return el;
  }

})();
