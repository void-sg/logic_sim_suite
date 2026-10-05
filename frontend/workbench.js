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
      pins: [
        { num: 1, name: "1A", type: "in", side: "left", pos: 1 },
        { num: 2, name: "1B", type: "in", side: "left", pos: 2 },
        { num: 3, name: "1Y", type: "out", side: "left", pos: 3 },
        { num: 4, name: "2A", type: "in", side: "left", pos: 4 },
        { num: 5, name: "2B", type: "in", side: "left", pos: 5 },
        { num: 6, name: "2Y", type: "out", side: "left", pos: 6 },
        { num: 7, name: "GND", type: "pwr", side: "left", pos: 7 },
        { num: 8, name: "3Y", type: "out", side: "right", pos: 7 },
        { num: 9, name: "3A", type: "in", side: "right", pos: 6 },
        { num: 10, name: "3B", type: "in", side: "right", pos: 5 },
        { num: 11, name: "4Y", type: "out", side: "right", pos: 4 },
        { num: 12, name: "4A", type: "in", side: "right", pos: 3 },
        { num: 13, name: "4B", type: "in", side: "right", pos: 2 },
        { num: 14, name: "VCC", type: "pwr", side: "right", pos: 1 }
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
      pins: [
        { num: 1, name: "1A", type: "in", side: "left", pos: 1 },
        { num: 2, name: "1B", type: "in", side: "left", pos: 2 },
        { num: 3, name: "1Y", type: "out", side: "left", pos: 3 },
        { num: 4, name: "2A", type: "in", side: "left", pos: 4 },
        { num: 5, name: "2B", type: "in", side: "left", pos: 5 },
        { num: 6, name: "2Y", type: "out", side: "left", pos: 6 },
        { num: 7, name: "GND", type: "pwr", side: "left", pos: 7 },
        { num: 8, name: "3Y", type: "out", side: "right", pos: 7 },
        { num: 9, name: "3A", type: "in", side: "right", pos: 6 },
        { num: 10, name: "3B", type: "in", side: "right", pos: 5 },
        { num: 11, name: "4Y", type: "out", side: "right", pos: 4 },
        { num: 12, name: "4A", type: "in", side: "right", pos: 3 },
        { num: 13, name: "4B", type: "in", side: "right", pos: 2 },
        { num: 14, name: "VCC", type: "pwr", side: "right", pos: 1 }
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
      pins: [
        { num: 1, name: "1A", type: "in", side: "left", pos: 1 },
        { num: 2, name: "1B", type: "in", side: "left", pos: 2 },
        { num: 3, name: "1Y", type: "out", side: "left", pos: 3 },
        { num: 4, name: "2A", type: "in", side: "left", pos: 4 },
        { num: 5, name: "2B", type: "in", side: "left", pos: 5 },
        { num: 6, name: "2Y", type: "out", side: "left", pos: 6 },
        { num: 7, name: "GND", type: "pwr", side: "left", pos: 7 },
        { num: 8, name: "3Y", type: "out", side: "right", pos: 7 },
        { num: 9, name: "3A", type: "in", side: "right", pos: 6 },
        { num: 10, name: "3B", type: "in", side: "right", pos: 5 },
        { num: 11, name: "4Y", type: "out", side: "right", pos: 4 },
        { num: 12, name: "4A", type: "in", side: "right", pos: 3 },
        { num: 13, name: "4B", type: "in", side: "right", pos: 2 },
        { num: 14, name: "VCC", type: "pwr", side: "right", pos: 1 }
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
      pins: [
        { num: 1, name: "1A", type: "in", side: "left", pos: 1 },
        { num: 2, name: "1B", type: "in", side: "left", pos: 2 },
        { num: 3, name: "1Y", type: "out", side: "left", pos: 3 },
        { num: 4, name: "2A", type: "in", side: "left", pos: 4 },
        { num: 5, name: "2B", type: "in", side: "left", pos: 5 },
        { num: 6, name: "2Y", type: "out", side: "left", pos: 6 },
        { num: 7, name: "GND", type: "pwr", side: "left", pos: 7 },
        { num: 8, name: "3Y", type: "out", side: "right", pos: 7 },
        { num: 9, name: "3A", type: "in", side: "right", pos: 6 },
        { num: 10, name: "3B", type: "in", side: "right", pos: 5 },
        { num: 11, name: "4Y", type: "out", side: "right", pos: 4 },
        { num: 12, name: "4A", type: "in", side: "right", pos: 3 },
        { num: 13, name: "4B", type: "in", side: "right", pos: 2 },
        { num: 14, name: "VCC", type: "pwr", side: "right", pos: 1 }
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
      pins: [
        { num: 1, name: "1Y", type: "out", side: "left", pos: 1 },
        { num: 2, name: "1A", type: "in", side: "left", pos: 2 },
        { num: 3, name: "1B", type: "in", side: "left", pos: 3 },
        { num: 4, name: "2Y", type: "out", side: "left", pos: 4 },
        { num: 5, name: "2A", type: "in", side: "left", pos: 5 },
        { num: 6, name: "2B", type: "in", side: "left", pos: 6 },
        { num: 7, name: "GND", type: "pwr", side: "left", pos: 7 },
        { num: 8, name: "3A", type: "in", side: "right", pos: 7 },
        { num: 9, name: "3B", type: "in", side: "right", pos: 6 },
        { num: 10, name: "3Y", type: "out", side: "right", pos: 5 },
        { num: 11, name: "4A", type: "in", side: "right", pos: 4 },
        { num: 12, name: "4B", type: "in", side: "right", pos: 3 },
        { num: 13, name: "4Y", type: "out", side: "right", pos: 2 },
        { num: 14, name: "VCC", type: "pwr", side: "right", pos: 1 }
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
      pins: [
        { num: 1, name: "1A", type: "in", side: "left", pos: 1 },
        { num: 2, name: "1Y", type: "out", side: "left", pos: 2 },
        { num: 3, name: "2A", type: "in", side: "left", pos: 3 },
        { num: 4, name: "2Y", type: "out", side: "left", pos: 4 },
        { num: 5, name: "3A", type: "in", side: "left", pos: 5 },
        { num: 6, name: "3Y", type: "out", side: "left", pos: 6 },
        { num: 7, name: "GND", type: "pwr", side: "left", pos: 7 },
        { num: 8, name: "4Y", type: "out", side: "right", pos: 7 },
        { num: 9, name: "4A", type: "in", side: "right", pos: 6 },
        { num: 10, name: "5Y", type: "out", side: "right", pos: 5 },
        { num: 11, name: "5A", type: "in", side: "right", pos: 4 },
        { num: 12, name: "6Y", type: "out", side: "right", pos: 3 },
        { num: 13, name: "6A", type: "in", side: "right", pos: 2 },
        { num: 14, name: "VCC", type: "pwr", side: "right", pos: 1 }
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
      pins: [
        { num: 1, name: "D3", type: "in", side: "left", pos: 1 },
        { num: 2, name: "D2", type: "in", side: "left", pos: 2 },
        { num: 3, name: "D1", type: "in", side: "left", pos: 3 },
        { num: 4, name: "D0", type: "in", side: "left", pos: 4 },
        { num: 5, name: "Y", type: "out", side: "left", pos: 5 },
        { num: 6, name: "W", type: "out", side: "left", pos: 6 },
        { num: 7, name: "~G", type: "in", side: "left", pos: 7 },
        { num: 8, name: "GND", type: "pwr", side: "left", pos: 8 },
        { num: 9, name: "C", type: "in", side: "right", pos: 8 },
        { num: 10, name: "B", type: "in", side: "right", pos: 7 },
        { num: 11, name: "A", type: "in", side: "right", pos: 6 },
        { num: 12, name: "D7", type: "in", side: "right", pos: 5 },
        { num: 13, name: "D6", type: "in", side: "right", pos: 4 },
        { num: 14, name: "D5", type: "in", side: "right", pos: 3 },
        { num: 15, name: "D4", type: "in", side: "right", pos: 2 },
        { num: 16, name: "VCC", type: "pwr", side: "right", pos: 1 }
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

    "7485": {
      id: "7485",
      name: "7485 (4-Bit Magnitude Comparator)",
      category: "msi",
      package: "DIP-16",
      pinsCount: 16,
      refPrefix: "U",
      desc: "4-bit magnitude comparator comparing two binary words A and B. Includes expansion cascading inputs.",
      datasheet: "VCC: Pin 16, GND: Pin 8. A inputs: A0(10), A1(12), A2(13), A3(15). B inputs: B0(9), B1(11), B2(14), B3(1). Outputs: A>B(5), A=B(6), A<B(7).",
      pins: [
        { num: 1, name: "B3", type: "in", side: "left", pos: 1 },
        { num: 2, name: "I_LT", type: "in", side: "left", pos: 2 },
        { num: 3, name: "I_EQ", type: "in", side: "left", pos: 3 },
        { num: 4, name: "I_GT", type: "in", side: "left", pos: 4 },
        { num: 5, name: "O_GT", type: "out", side: "left", pos: 5 },
        { num: 6, name: "O_EQ", type: "out", side: "left", pos: 6 },
        { num: 7, name: "O_LT", type: "out", side: "left", pos: 7 },
        { num: 8, name: "GND", type: "pwr", side: "left", pos: 8 },
        { num: 9, name: "B0", type: "in", side: "right", pos: 8 },
        { num: 10, name: "A0", type: "in", side: "right", pos: 7 },
        { num: 11, name: "B1", type: "in", side: "right", pos: 6 },
        { num: 12, name: "A1", type: "in", side: "right", pos: 5 },
        { num: 13, name: "A2", type: "in", side: "right", pos: 4 },
        { num: 14, name: "B2", type: "in", side: "right", pos: 3 },
        { num: 15, name: "A3", type: "in", side: "right", pos: 2 },
        { num: 16, name: "VCC", type: "pwr", side: "right", pos: 1 }
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
      pins: [
        { num: 1, name: "A4", type: "in", side: "left", pos: 1 },
        { num: 2, name: "S3", type: "out", side: "left", pos: 2 },
        { num: 3, name: "A3", type: "in", side: "left", pos: 3 },
        { num: 4, name: "B3", type: "in", side: "left", pos: 4 },
        { num: 5, name: "VCC", type: "pwr", side: "left", pos: 5 },
        { num: 6, name: "S2", type: "out", side: "left", pos: 6 },
        { num: 7, name: "B2", type: "in", side: "left", pos: 7 },
        { num: 8, name: "A2", type: "in", side: "left", pos: 8 },
        { num: 9, name: "S1", type: "out", side: "right", pos: 8 },
        { num: 10, name: "A1", type: "in", side: "right", pos: 7 },
        { num: 11, name: "B1", type: "in", side: "right", pos: 6 },
        { num: 12, name: "GND", type: "pwr", side: "right", pos: 5 },
        { num: 13, name: "C0", type: "in", side: "right", pos: 4 },
        { num: 14, name: "C4", type: "out", side: "right", pos: 3 },
        { num: 15, name: "S4", type: "out", side: "right", pos: 2 },
        { num: 16, name: "B4", type: "in", side: "right", pos: 1 }
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

    // --- Sequential & Counter ICs (DIP-14) ---
    "7490": {
      id: "7490",
      name: "7490 (Decade / BCD Counter)",
      category: "counters",
      package: "DIP-14",
      pinsCount: 14,
      refPrefix: "U",
      desc: "4-bit ripple decade counter containing a divide-by-two section (CP0 -> QA) and a divide-by-five section (CP1 -> QB, QC, QD). Gated zero reset (R0_1·R0_2) and gated preset-9 (R9_1·R9_2).",
      datasheet: "VCC: Pin 5, GND: Pin 10. Clocks: CP0(14), CP1(1). Resets: R0(2,3), R9(6,7). Outputs: QA(12), QB(9), QC(8), QD(11).",
      vccPin: 5,
      gndPin: 10,
      pins: [
        { num: 1, name: "CP1", type: "in", side: "left" },
        { num: 2, name: "R0(1)", type: "in", side: "left" },
        { num: 3, name: "R0(2)", type: "in", side: "left" },
        { num: 4, name: "NC", type: "pwr", side: "left" },
        { num: 5, name: "VCC", type: "pwr", side: "left" },
        { num: 6, name: "R9(1)", type: "in", side: "left" },
        { num: 7, name: "R9(2)", type: "in", side: "left" },
        { num: 14, name: "CP0", type: "in", side: "right" },
        { num: 13, name: "NC", type: "pwr", side: "right" },
        { num: 12, name: "QA", type: "out", side: "right" },
        { num: 11, name: "QD", type: "out", side: "right" },
        { num: 10, name: "GND", type: "pwr", side: "right" },
        { num: 9, name: "QB", type: "out", side: "right" },
        { num: 8, name: "QC", type: "out", side: "right" }
      ],
      customState: { qa: 0, qb: 0, qc: 0, qd: 0, lastClkA: 1, lastClkB: 1 },
      evaluate: (inputs, comp) => {
        if (!comp.state) {
          comp.state = { qa: 0, qb: 0, qc: 0, qd: 0, lastClkA: 1, lastClkB: 1 };
        }
        const s = comp.state;

        const r0_1 = inputs["2"] || 0;
        const r0_2 = inputs["3"] || 0;
        const r9_1 = inputs["6"] || 0;
        const r9_2 = inputs["7"] || 0;

        const isReset0 = (r0_1 === 1 && r0_2 === 1);
        const isSet9 = (r9_1 === 1 && r9_2 === 1);

        if (isSet9) {
          s.qa = 1; s.qb = 0; s.qc = 0; s.qd = 1;
        } else if (isReset0) {
          s.qa = 0; s.qb = 0; s.qc = 0; s.qd = 0;
        } else {
          // Clock A: Pin 14 (Falling edge triggers QA toggle)
          const clkA = inputs["14"] !== undefined ? inputs["14"] : 1;
          const lastClkA = s.lastClkA !== undefined ? s.lastClkA : 1;
          if (lastClkA === 1 && clkA === 0) {
            s.qa = 1 - s.qa;
          }
          s.lastClkA = clkA;

          // Clock B: Pin 1 (Falling edge triggers ÷5 advance)
          const clkB = inputs["1"] !== undefined ? inputs["1"] : 1;
          const lastClkB = s.lastClkB !== undefined ? s.lastClkB : 1;
          if (lastClkB === 1 && clkB === 0) {
            if (s.qd === 0 && s.qc === 0 && s.qb === 0) {
              s.qb = 1; s.qc = 0; s.qd = 0;
            } else if (s.qd === 0 && s.qc === 0 && s.qb === 1) {
              s.qb = 0; s.qc = 1; s.qd = 0;
            } else if (s.qd === 0 && s.qc === 1 && s.qb === 0) {
              s.qb = 1; s.qc = 1; s.qd = 0;
            } else if (s.qd === 0 && s.qc === 1 && s.qb === 1) {
              s.qb = 0; s.qc = 0; s.qd = 1;
            } else {
              s.qb = 0; s.qc = 0; s.qd = 0;
            }
          }
          s.lastClkB = clkB;
        }

        return {
          "12": s.qa,
          "9": s.qb,
          "8": s.qc,
          "11": s.qd
        };
      }
    },

    "7493": {
      id: "7493",
      name: "7493 (4-Bit Binary Counter)",
      category: "counters",
      package: "DIP-14",
      pinsCount: 14,
      refPrefix: "U",
      desc: "4-bit binary ripple counter containing a divide-by-two section (CP0 -> QA) and a divide-by-eight section (CP1 -> QB, QC, QD). Gated master reset (R0_1·R0_2).",
      datasheet: "VCC: Pin 5, GND: Pin 10. Clocks: CP0(14), CP1(1). Resets: R0(2,3). Outputs: QA(12), QB(9), QC(8), QD(11).",
      vccPin: 5,
      gndPin: 10,
      pins: [
        { num: 1, name: "CP1", type: "in", side: "left" },
        { num: 2, name: "R0(1)", type: "in", side: "left" },
        { num: 3, name: "R0(2)", type: "in", side: "left" },
        { num: 4, name: "NC", type: "pwr", side: "left" },
        { num: 5, name: "VCC", type: "pwr", side: "left" },
        { num: 6, name: "NC", type: "pwr", side: "left" },
        { num: 7, name: "NC", type: "pwr", side: "left" },
        { num: 14, name: "CP0", type: "in", side: "right" },
        { num: 13, name: "NC", type: "pwr", side: "right" },
        { num: 12, name: "QA", type: "out", side: "right" },
        { num: 11, name: "QD", type: "out", side: "right" },
        { num: 10, name: "GND", type: "pwr", side: "right" },
        { num: 9, name: "QB", type: "out", side: "right" },
        { num: 8, name: "QC", type: "out", side: "right" }
      ],
      customState: { qa: 0, qb: 0, qc: 0, qd: 0, lastClkA: 1, lastClkB: 1 },
      evaluate: (inputs, comp) => {
        if (!comp.state) {
          comp.state = { qa: 0, qb: 0, qc: 0, qd: 0, lastClkA: 1, lastClkB: 1 };
        }
        const s = comp.state;

        const r0_1 = inputs["2"] || 0;
        const r0_2 = inputs["3"] || 0;
        const isReset0 = (r0_1 === 1 && r0_2 === 1);

        if (isReset0) {
          s.qa = 0; s.qb = 0; s.qc = 0; s.qd = 0;
        } else {
          // Clock A: Pin 14 (Falling edge triggers QA toggle)
          const clkA = inputs["14"] !== undefined ? inputs["14"] : 1;
          const lastClkA = s.lastClkA !== undefined ? s.lastClkA : 1;
          if (lastClkA === 1 && clkA === 0) {
            s.qa = 1 - s.qa;
          }
          s.lastClkA = clkA;

          // Clock B: Pin 1 (Falling edge triggers 3-bit binary increment)
          const clkB = inputs["1"] !== undefined ? inputs["1"] : 1;
          const lastClkB = s.lastClkB !== undefined ? s.lastClkB : 1;
          if (lastClkB === 1 && clkB === 0) {
            const curVal = (s.qd << 2) | (s.qc << 1) | s.qb;
            const nextVal = (curVal + 1) % 8;
            s.qb = nextVal & 1;
            s.qc = (nextVal >> 1) & 1;
            s.qd = (nextVal >> 2) & 1;
          }
          s.lastClkB = clkB;
        }

        return {
          "12": s.qa,
          "9": s.qb,
          "8": s.qc,
          "11": s.qd
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

    "POWER_RAIL": {
      id: "POWER_RAIL",
      name: "VCC & GND Power Bus Rail",
      category: "power",
      package: "Power Rail (8-Pin)",
      pinsCount: 8,
      refPrefix: "PWR_RAIL",
      desc: "Dual VCC (+5V) and GND (0V) power distribution rail. 4 top red terminals supply +5V, 4 bottom blue terminals supply Ground.",
      pins: [
        { num: 1, name: "+5V", type: "out", side: "top", pos: 1 },
        { num: 2, name: "+5V", type: "out", side: "top", pos: 2 },
        { num: 3, name: "+5V", type: "out", side: "top", pos: 3 },
        { num: 4, name: "+5V", type: "out", side: "top", pos: 4 },
        { num: 5, name: "GND", type: "out", side: "bottom", pos: 1 },
        { num: 6, name: "GND", type: "out", side: "bottom", pos: 2 },
        { num: 7, name: "GND", type: "out", side: "bottom", pos: 3 },
        { num: 8, name: "GND", type: "out", side: "bottom", pos: 4 }
      ],
      evaluate: () => ({
        "1": 1, "2": 1, "3": 1, "4": 1,
        "5": 0, "6": 0, "7": 0, "8": 0
      })
    },

    "SW_RAIL_8": {
      id: "SW_RAIL_8",
      name: "8-Bit Logic Input Switch Rail",
      category: "io",
      package: "Trainer Rail (8x IN)",
      pinsCount: 8,
      refPrefix: "SW_BANK",
      desc: "8-channel trainer-kit toggle switch bank. Provides 8 independent interactive binary logic outputs (SW0 to SW7).",
      pins: [
        { num: 1, name: "SW0", type: "out", side: "bottom", pos: 1 },
        { num: 2, name: "SW1", type: "out", side: "bottom", pos: 2 },
        { num: 3, name: "SW2", type: "out", side: "bottom", pos: 3 },
        { num: 4, name: "SW3", type: "out", side: "bottom", pos: 4 },
        { num: 5, name: "SW4", type: "out", side: "bottom", pos: 5 },
        { num: 6, name: "SW5", type: "out", side: "bottom", pos: 6 },
        { num: 7, name: "SW6", type: "out", side: "bottom", pos: 7 },
        { num: 8, name: "SW7", type: "out", side: "bottom", pos: 8 }
      ],
      customState: { values: [0, 0, 0, 0, 0, 0, 0, 0] },
      evaluate: (inputs, comp) => {
        const vals = comp.state?.values || [0, 0, 0, 0, 0, 0, 0, 0];
        const res = {};
        for (let i = 0; i < 8; i++) {
          res[(i + 1).toString()] = vals[i] ? 1 : 0;
        }
        return res;
      }
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
      pinsCount: 2,
      refPrefix: "LED",
      desc: "Visual LED indicator. Lights up vibrant glowing green when signal is HIGH (1), turns off when LOW (0). Connect to either Left (Pin 1) or Right (Pin 2) terminal.",
      pins: [
        { num: 1, name: "IN_L", type: "in", side: "left", pos: 1 },
        { num: 2, name: "IN_R", type: "in", side: "right", pos: 1 }
      ],
      evaluate: () => ({})
    },

    "PROBE": {
      id: "PROBE",
      name: "Digital Logic Probe",
      category: "io",
      package: "Probe",
      pinsCount: 2,
      refPrefix: "PR",
      desc: "Digital logic analyzer probe. Displays real-time binary state [0] or [1]. Connect to either Left (Pin 1) or Right (Pin 2) terminal.",
      pins: [
        { num: 1, name: "IN_L", type: "in", side: "left", pos: 1 },
        { num: 2, name: "IN_R", type: "in", side: "right", pos: 1 }
      ],
      evaluate: () => ({})
    },

    "LED_RAIL_8": {
      id: "LED_RAIL_8",
      name: "8-Bit Logic Output LED Rail",
      category: "io",
      package: "Trainer Rail (8x LED)",
      pinsCount: 8,
      refPrefix: "LED_BANK",
      desc: "8-channel trainer-kit LED display bank. 8 indicator LEDs (L0 to L7) with real-time glow and digital status readouts.",
      pins: [
        { num: 1, name: "L0", type: "in", side: "top", pos: 1 },
        { num: 2, name: "L1", type: "in", side: "top", pos: 2 },
        { num: 3, name: "L2", type: "in", side: "top", pos: 3 },
        { num: 4, name: "L3", type: "in", side: "top", pos: 4 },
        { num: 5, name: "L4", type: "in", side: "top", pos: 5 },
        { num: 6, name: "L5", type: "in", side: "top", pos: 6 },
        { num: 7, name: "L6", type: "in", side: "top", pos: 7 },
        { num: 8, name: "L7", type: "in", side: "top", pos: 8 }
      ],
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

    // Global SVG mouse events
    svgRoot.addEventListener("mousemove", onCanvasMouseMove);
    svgRoot.addEventListener("mousedown", onCanvasMouseDown);
    svgRoot.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      cancelActiveWire();
    });
    window.addEventListener("mouseup", onCanvasMouseUp);

    // Keyboard shortcuts
    window.addEventListener("keydown", (e) => {
      if (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "SELECT") return;

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
      } else if (e.key === "p" || e.key === "P") {
        togglePalette();
      } else if (e.key === "Escape") {
        cancelActiveWire();
        closeModal();
      }
    });
  }

  function togglePalette(forceState) {
    const sidebar = document.getElementById("palette-sidebar");
    const sliderTab = document.getElementById("palette-slider-tab");
    const iconBtn = document.getElementById("btn-palette-icon");
    const iconTab = document.getElementById("palette-tab-icon");
    const collapseBtn = document.getElementById("btn-collapse-palette");

    if (!sidebar) return;
    const isCurrentlyCollapsed = sidebar.classList.contains("collapsed");
    const shouldCollapse = forceState !== undefined ? forceState : !isCurrentlyCollapsed;

    if (shouldCollapse) {
      sidebar.classList.add("collapsed");
      sliderTab?.classList.add("collapsed");
      if (iconBtn) iconBtn.textContent = "▶";
      if (iconTab) iconTab.textContent = "▶";
      if (collapseBtn) collapseBtn.textContent = "▶";
    } else {
      sidebar.classList.remove("collapsed");
      sliderTab?.classList.remove("collapsed");
      if (iconBtn) iconBtn.textContent = "◀";
      if (iconTab) iconTab.textContent = "◀";
      if (collapseBtn) collapseBtn.textContent = "◀";
    }
  }

  function initToolbar() {
    document.getElementById("btn-tool-select")?.addEventListener("click", () => setTool("select"));
    document.getElementById("btn-tool-wire")?.addEventListener("click", () => setTool("wire"));
    document.getElementById("btn-tool-delete")?.addEventListener("click", () => setTool("delete"));
    document.getElementById("btn-add-symbol")?.addEventListener("click", () => openModal());
    document.getElementById("btn-clear-canvas")?.addEventListener("click", () => clearCanvas());

    // Component Palette Slide / Collapse Controls
    document.getElementById("btn-toggle-palette")?.addEventListener("click", () => togglePalette());
    document.getElementById("btn-collapse-palette")?.addEventListener("click", () => togglePalette());
    document.getElementById("palette-slider-tab")?.addEventListener("click", () => togglePalette());

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
      { id: "counters", title: "Sequential & Counters (DIP-14)" },
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

    if (spec.id === "POWER_RAIL") {
      svg.appendChild(createSVGElement("rect", { x: -90, y: -42, width: 180, height: 84, rx: 5, fill: "#f8fafc", stroke: "#334155", "stroke-width": 1.5 }));
      svg.appendChild(createSVGElement("rect", { x: -84, y: -36, width: 168, height: 32, rx: 3, fill: "#fee2e2", stroke: "#ef4444", "stroke-width": 1 }));
      const tVcc = createSVGElement("text", { x: -76, y: -16, fill: "#b91c1c", "font-family": "DM Mono", "font-weight": "bold", "font-size": 10 });
      tVcc.textContent = "+5V (VCC BUS)";
      svg.appendChild(tVcc);
      svg.appendChild(createSVGElement("rect", { x: -84, y: 4, width: 168, height: 32, rx: 3, fill: "#e0f2fe", stroke: "#0284c7", "stroke-width": 1 }));
      const tGnd = createSVGElement("text", { x: -76, y: 24, fill: "#0369a1", "font-family": "DM Mono", "font-weight": "bold", "font-size": 10 });
      tGnd.textContent = "GND (0V BUS)";
      svg.appendChild(tGnd);
      previewContainer.appendChild(svg);
      return;
    }

    if (spec.id === "SW_RAIL_8") {
      svg.appendChild(createSVGElement("rect", { x: -110, y: -36, width: 220, height: 72, rx: 5, fill: "#0f172a", stroke: "#334155", "stroke-width": 1.5 }));
      const tHdr = createSVGElement("text", { x: 0, y: -20, "text-anchor": "middle", fill: "#38bdf8", "font-family": "DM Mono", "font-weight": "bold", "font-size": 10 });
      tHdr.textContent = "8-BIT SWITCH RAIL (SW0-7)";
      svg.appendChild(tHdr);
      for (let i = 0; i < 8; i++) {
        const sx = -96 + i * 27;
        svg.appendChild(createSVGElement("rect", { x: sx, y: -6, width: 22, height: 16, rx: 2, fill: "#1e293b", stroke: "#475569", "stroke-width": 1 }));
        svg.appendChild(createSVGElement("rect", { x: sx + 2, y: -4, width: 9, height: 12, rx: 1.5, fill: "#ef4444" }));
        svg.appendChild(createSVGElement("circle", { cx: sx + 11, cy: 22, r: 2.5, fill: "#fffdf2", stroke: "#a00000", "stroke-width": 1 }));
      }
      previewContainer.appendChild(svg);
      return;
    }

    if (spec.id === "LED_RAIL_8") {
      svg.appendChild(createSVGElement("rect", { x: -110, y: -36, width: 220, height: 72, rx: 5, fill: "#0f172a", stroke: "#334155", "stroke-width": 1.5 }));
      const tHdr = createSVGElement("text", { x: 0, y: -20, "text-anchor": "middle", fill: "#10b981", "font-family": "DM Mono", "font-weight": "bold", "font-size": 10 });
      tHdr.textContent = "8-BIT LED RAIL (L0-7)";
      svg.appendChild(tHdr);
      for (let i = 0; i < 8; i++) {
        const sx = -96 + i * 27;
        svg.appendChild(createSVGElement("circle", { cx: sx + 11, cy: -6, r: 2.5, fill: "#fffdf2", stroke: "#a00000", "stroke-width": 1 }));
        svg.appendChild(createSVGElement("circle", { cx: sx + 11, cy: 12, r: 6.5, fill: "#1e3a24", stroke: "#0f172a", "stroke-width": 1 }));
      }
      previewContainer.appendChild(svg);
      return;
    }

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
      state: spec.customState ? JSON.parse(JSON.stringify(spec.customState)) : {}
    };

    state.components.push(comp);
    setSelectedItem({ type: "comp", id: comp.id });
    render();
    return comp;
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

    if (item) {
      if (item.type === "comp") {
        document.getElementById(`node-${item.id}`)?.classList.add("selected");
      } else if (item.type === "wire") {
        document.getElementById(`wire-${item.id}`)?.classList.add("selected");
      }
    }
  }

  function deleteSelectedItem() {
    if (!state.selectedItem) return;

    if (state.selectedItem.type === "comp") {
      const compId = state.selectedItem.id;
      state.wires = state.wires.filter(
        (w) => w.from.compId !== compId && w.to.compId !== compId
      );
      state.components = state.components.filter((c) => c.id !== compId);
    } else if (state.selectedItem.type === "wire") {
      const wireId = state.selectedItem.id;
      state.wires = state.wires.filter((w) => w.id !== wireId);
    }

    state.selectedItem = null;
    render();
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
      // Pin 1 on left, Pin 2 on right
      return { x: pinNum === 2 ? comp.x + 40 : comp.x - 40, y: comp.y };
    }

    if (comp.type === "PROBE") {
      // Pin 1 on left, Pin 2 on right
      return { x: pinNum === 2 ? comp.x + 44 : comp.x - 44, y: comp.y };
    }

    if (comp.type === "CLOCK") {
      // Terminal on the right of the clock box
      return { x: comp.x + 48, y: comp.y };
    }

    if (comp.type === "DIODE") {
      // Pin 1 (Anode) on left, Pin 2 (Cathode) on right
      return { x: pinNum === 1 ? comp.x - 40 : comp.x + 40, y: comp.y };
    }

    if (comp.type === "POWER_RAIL") {
      // Dual power bus: Pins 1..4 (+5V top), Pins 5..8 (GND bottom)
      if (pinNum <= 4) {
        return { x: comp.x - 75 + (pinNum - 1) * 50, y: comp.y - 20 };
      } else {
        return { x: comp.x - 75 + (pinNum - 5) * 50, y: comp.y + 20 };
      }
    }

    if (comp.type === "SW_RAIL_8") {
      // 8-Bit Switch Rail: Pins 1..8 (SW0..SW7 outputs at bottom)
      return { x: comp.x - 192 + (pinNum - 1) * 55, y: comp.y + 36 };
    }

    if (comp.type === "LED_RAIL_8") {
      // 8-Bit LED Rail: Pins 1..8 (L0..L7 inputs at top)
      return { x: comp.x - 192 + (pinNum - 1) * 55, y: comp.y - 34 };
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
    if (type === "POWER_RAIL") return { w: 260, h: 72 };
    if (type === "SW_RAIL_8") return { w: 480, h: 84 };
    if (type === "LED_RAIL_8") return { w: 480, h: 84 };

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

    const startPos = getPinWorldPos(comp, pinNum);
    state.activeWire = {
      fromCompId: compId,
      fromPinNum: pinNum,
      waypoints: [{ x: startPos.x, y: startPos.y }],
      bendMode: "HV" // default bend posture: Horizontal-first
    };

    document.querySelectorAll(".pin-terminal-group").forEach((el) => {
      el.classList.remove("active-start");
      el.classList.add("connect-target");
    });

    const activeEl = document.querySelector(`.pin-terminal-group[data-comp-id="${compId}"][data-pin-num="${pinNum}"]`);
    activeEl?.classList.add("active-start");

    const hint = document.getElementById("tool-hint-text");
    if (hint) {
      hint.textContent = `ROUTING WIRE from ${comp.ref} Pin ${pinNum}. Click on empty space to drop corners. Press [Space] to flip bend. Click destination pin to finish.`;
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

    const toComp = state.components.find((c) => c.id === compId);
    if (!toComp) return;

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
    setSelectedItem({ type: "wire", id: wire.id });

    cancelActiveWire();
    render();
  }

  function cancelActiveWire() {
    state.activeWire = null;
    state.hoveredTargetPin = null;
    if (tempWireLayer) tempWireLayer.innerHTML = "";
    document.querySelectorAll(".pin-terminal-group").forEach((el) => {
      el.classList.remove("connect-target", "active-start", "snap-hover");
    });

    const hint = document.getElementById("tool-hint-text");
    if (hint) {
      if (state.tool === "wire") {
        hint.textContent = "WIRE MODE: Click any red pin terminal to start. Click on empty space to add corners. Space to toggle bend direction. Click destination pin to finish.";
      } else {
        hint.textContent = "SELECT MODE: Drag components to reposition. Click toggle switches to flip 0/1 logic.";
      }
    }
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
        fill: "#2563eb",
        opacity: "0.6"
      }));
    }
  }

  // =========================================================================
  // 8. LIVE LOGIC SIMULATION SOLVER (Deterministic Event Graph)
  // =========================================================================
  function runSimulation() {
    if (!state.isSimRunning) return;

    // 1. Build Equipotential Nets (Connected Pin Graph via Wires)
    const pinToNet = new Map();
    const netMembers = []; // array of Set<string (pinKey)>

    function getOrCreateNet(pinKey) {
      if (pinToNet.has(pinKey)) return pinToNet.get(pinKey);
      const netId = netMembers.length;
      netMembers.push(new Set([pinKey]));
      pinToNet.set(pinKey, netId);
      return netId;
    }

    function unionNets(pinKey1, pinKey2) {
      let net1 = getOrCreateNet(pinKey1);
      let net2 = getOrCreateNet(pinKey2);
      if (net1 === net2) return net1;
      if (netMembers[net1].size < netMembers[net2].size) {
        const tmp = net1; net1 = net2; net2 = tmp;
      }
      for (const pk of netMembers[net2]) {
        netMembers[net1].add(pk);
        pinToNet.set(pk, net1);
      }
      netMembers[net2] = null;
      return net1;
    }

    // Connect all pins joined by wires into equipotential nets
    state.wires.forEach((w) => {
      const kFrom = `${w.from.compId}:${w.from.pinNum}`;
      const kTo = `${w.to.compId}:${w.to.pinNum}`;
      unionNets(kFrom, kTo);
    });

    // Voltages for all pins: { "compId:pinNum": 0 | 1 }
    const pinVoltages = {};
    const icOutputVoltages = {};

    // 2. Iterative Relaxation (up to 8 passes for cascaded deep MSI/gate chains)
    for (let pass = 0; pass < 8; pass++) {
      let changed = false;

      // A. Determine driver voltage for each equipotential net
      netMembers.forEach((members) => {
        if (!members) return;
        let netVal = undefined;

        for (const pk of members) {
          const [compId, pinStr] = pk.split(":");
          const pinNum = parseInt(pinStr, 10);
          const comp = state.components.find((c) => c.id === compId);
          if (!comp) continue;

          // Primary drivers: VCC, GND, SWITCH, CLOCK, POWER_RAIL, SW_RAIL_8
          if (comp.type === "VCC") {
            netVal = 1;
            break;
          } else if (comp.type === "GND") {
            netVal = 0;
            break;
          } else if (comp.type === "SWITCH") {
            netVal = comp.state?.value ? 1 : 0;
            break;
          } else if (comp.type === "CLOCK") {
            netVal = comp.state?.value ? 1 : 0;
            break;
          } else if (comp.type === "POWER_RAIL") {
            netVal = pinNum <= 4 ? 1 : 0;
            break;
          } else if (comp.type === "SW_RAIL_8") {
            const vals = comp.state?.values || [0, 0, 0, 0, 0, 0, 0, 0];
            netVal = vals[pinNum - 1] ? 1 : 0;
            break;
          } else if (icOutputVoltages[pk] !== undefined) {
            // IC output pin driving this net
            netVal = icOutputVoltages[pk];
          }
        }

        // Apply netVal to all pins on this net
        if (netVal !== undefined) {
          for (const pk of members) {
            if (pinVoltages[pk] !== netVal) {
              pinVoltages[pk] = netVal;
              changed = true;
            }
          }
        }
      });

      // Evaluate Complex ICs (7400, 7408, 7432, 7486, 7402, 7404, 74151, 7485, 7483, 7490, 7493, DIODE)
      state.components.forEach((c) => {
        const spec = LIBRARY[c.type];
        if (spec.category === "gates" || spec.category === "msi" || spec.category === "counters" || spec.id === "DIODE") {
          // Check power rails (VCC and GND)
          if (spec.vccPin && spec.gndPin) {
            const vccVal = pinVoltages[`${c.id}:${spec.vccPin}`];
            const gndVal = pinVoltages[`${c.id}:${spec.gndPin}`];
            const isPowered = (vccVal === 1) && (gndVal === 0);
            c.isPowered = isPowered;

            if (!isPowered) {
              spec.pins.forEach((p) => {
                if (p.type === "out") {
                  const pk = `${c.id}:${p.num}`;
                  pinVoltages[pk] = 0;
                  if (icOutputVoltages[pk] !== 0) {
                    icOutputVoltages[pk] = 0;
                    changed = true;
                  }
                }
              });
              return;
            }
          }

          // Gather input values from current pinVoltages
          const inputValues = {};
          spec.pins.forEach((p) => {
            const val = pinVoltages[`${c.id}:${p.num}`];
            if (val !== undefined) {
              inputValues[p.num.toString()] = val;
            }
          });

          const outputs = spec.evaluate(inputValues, c);
          for (const [pinNum, val] of Object.entries(outputs)) {
            const pk = `${c.id}:${pinNum}`;
            pinVoltages[pk] = val;
            if (icOutputVoltages[pk] !== val) {
              icOutputVoltages[pk] = val;
              changed = true;
            }
          }
        }
      });

      // Stop once network has converged
      if (!changed && pass >= 2) break;
    }

    // Standalone driver voltages for un-wired pins inspection
    state.components.forEach((c) => {
      if (c.type === "VCC") {
        if (pinVoltages[`${c.id}:1`] === undefined) pinVoltages[`${c.id}:1`] = 1;
      } else if (c.type === "GND") {
        if (pinVoltages[`${c.id}:1`] === undefined) pinVoltages[`${c.id}:1`] = 0;
      } else if (c.type === "SWITCH") {
        if (pinVoltages[`${c.id}:1`] === undefined) pinVoltages[`${c.id}:1`] = c.state?.value ? 1 : 0;
      } else if (c.type === "CLOCK") {
        if (pinVoltages[`${c.id}:1`] === undefined) pinVoltages[`${c.id}:1`] = c.state?.value ? 1 : 0;
      } else if (c.type === "POWER_RAIL") {
        for (let i = 1; i <= 4; i++) {
          if (pinVoltages[`${c.id}:${i}`] === undefined) pinVoltages[`${c.id}:${i}`] = 1;
        }
        for (let i = 5; i <= 8; i++) {
          if (pinVoltages[`${c.id}:${i}`] === undefined) pinVoltages[`${c.id}:${i}`] = 0;
        }
      } else if (c.type === "SW_RAIL_8") {
        const vals = c.state?.values || [0, 0, 0, 0, 0, 0, 0, 0];
        for (let i = 0; i < 8; i++) {
          if (pinVoltages[`${c.id}:${i + 1}`] === undefined) pinVoltages[`${c.id}:${i + 1}`] = vals[i] ? 1 : 0;
        }
      }
    });

    // 3. Final Wire States (Equipotential wire logic levels)
    state.wires.forEach((w) => {
      const kFrom = `${w.from.compId}:${w.from.pinNum}`;
      const kTo = `${w.to.compId}:${w.to.pinNum}`;
      const vFrom = pinVoltages[kFrom];
      const vTo = pinVoltages[kTo];
      w.state = vFrom !== undefined ? vFrom : (vTo !== undefined ? vTo : 0);
    });

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

    // Update terminal visual dots in real time
    document.querySelectorAll(".pin-terminal-visual").forEach((vis) => {
      const g = vis.parentElement;
      if (!g) return;
      const compId = g.getAttribute("data-comp-id");
      const pinNum = g.getAttribute("data-pin-num");
      if (!compId || !pinNum) return;
      const volt = pinVoltages[`${compId}:${pinNum}`];
      if (volt === 1) {
        vis.classList.add("state-high");
        vis.classList.remove("state-low");
        vis.setAttribute("fill", "#00ff66");
      } else if (volt === 0) {
        vis.classList.add("state-low");
        vis.classList.remove("state-high");
        vis.setAttribute("fill", vis.classList.contains("unconnected") ? "#fffdf2" : "#0a8c2f");
      }
    });

    state.components.forEach((c) => {
      if (c.type === "LED") {
        const v1 = pinVoltages[`${c.id}:1`];
        const v2 = pinVoltages[`${c.id}:2`];
        let isLit = false;
        if (v1 === 1 && v2 === 0) isLit = true;
        else if (v2 === 1 && v1 === 0) isLit = true;
        else if (v1 === 1 && (v2 === undefined || v2 === null)) isLit = true;
        else if (v2 === 1 && (v1 === undefined || v1 === null)) isLit = true;
        else if (v1 === 1 || v2 === 1) isLit = true;

        const ledGlow = document.getElementById(`led-glow-${c.id}`);
        const ledCore = document.getElementById(`led-core-${c.id}`);
        if (ledGlow && ledCore) {
          if (isLit) {
            ledGlow.setAttribute("opacity", "0.95");
            ledCore.setAttribute("fill", "#00ff66");
          } else {
            ledGlow.setAttribute("opacity", "0.0");
            ledCore.setAttribute("fill", "#1e3a24");
          }
        }
      } else if (c.type === "PROBE") {
        const v1 = pinVoltages[`${c.id}:1`];
        const v2 = pinVoltages[`${c.id}:2`];
        const inVal = v1 !== undefined ? v1 : (v2 !== undefined ? v2 : "-");
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
      } else if (c.type === "SW_RAIL_8") {
        const vals = c.state?.values || [0, 0, 0, 0, 0, 0, 0, 0];
        for (let i = 0; i < 8; i++) {
          const val = vals[i] ? 1 : 0;
          const knob = document.getElementById(`sw8-knob-${c.id}-${i}`);
          const txt = document.getElementById(`sw8-val-${c.id}-${i}`);
          const swCenterX = c.x - 192 + i * 55;
          if (knob) {
            knob.setAttribute("x", val === 1 ? (swCenterX + 2).toString() : (swCenterX - 18).toString());
            knob.setAttribute("fill", val === 1 ? "#22c55e" : "#ef4444");
          }
          if (txt) {
            txt.textContent = val.toString();
            txt.setAttribute("x", val === 1 ? (swCenterX - 8).toString() : (swCenterX + 9).toString());
          }
        }
      } else if (c.type === "LED_RAIL_8") {
        for (let i = 0; i < 8; i++) {
          const val = pinVoltages[`${c.id}:${i + 1}`] || 0;
          const glow = document.getElementById(`led8-glow-${c.id}-${i}`);
          const core = document.getElementById(`led8-core-${c.id}-${i}`);
          const txt = document.getElementById(`led8-val-${c.id}-${i}`);
          if (glow) {
            glow.setAttribute("opacity", val === 1 ? "0.95" : "0.0");
          }
          if (core) {
            core.setAttribute("fill", val === 1 ? "#00ff66" : "#1e3a24");
          }
          if (txt) {
            txt.textContent = `[${val}]`;
            txt.setAttribute("fill", val === 1 ? "#22c55e" : "#64748b");
          }
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
        e.stopPropagation();
        if (state.tool === "delete") {
          state.wires = state.wires.filter((item) => item.id !== w.id);
          render();
        } else {
          setSelectedItem({ type: "wire", id: w.id });
        }
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

        if (state.tool === "delete") {
          setSelectedItem({ type: "comp", id: c.id });
          deleteSelectedItem();
          return;
        }

        // If in wire mode and currently routing, auto-connect to the nearest pin on this component
        if (state.activeWire) {
          e.stopPropagation();
          const coords = clientToSvgCoords(e.clientX, e.clientY);
          const spec = LIBRARY[c.type];
          if (spec && spec.pins && spec.pins.length > 0) {
            let closestPin = spec.pins[0];
            let minDist = Infinity;
            spec.pins.forEach((p) => {
              const pos = getPinWorldPos(c, p.num);
              const dist = Math.hypot(coords.x - pos.x, coords.y - pos.y);
              if (dist < minDist) {
                minDist = dist;
                closestPin = p;
              }
            });
            completeWireToPin(c.id, closestPin.num);
          }
          return;
        }

        e.stopPropagation();
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

    if (c.type === "POWER_RAIL") {
      renderPowerRail(g, c, spec, dims);
      return;
    }

    if (c.type === "SW_RAIL_8") {
      renderSwitchRail8(g, c, spec, dims);
      return;
    }

    if (c.type === "LED_RAIL_8") {
      renderLedRail8(g, c, spec, dims);
      return;
    }

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
      const pPos1 = getPinWorldPos(c, 1);
      const pPos2 = getPinWorldPos(c, 2);
      const v1 = state.pinVoltages[`${c.id}:1`];
      const v2 = state.pinVoltages[`${c.id}:2`];
      const isLit = (v1 === 1 || v2 === 1);

      // Generous grab area
      g.appendChild(createSVGElement("rect", {
        x: c.x - 50,
        y: c.y - ledR - 10,
        width: 100,
        height: ledR * 2 + 20,
        class: "comp-grab-area"
      }));

      const glow = createSVGElement("circle", {
        id: `led-glow-${c.id}`,
        cx: c.x,
        cy: c.y,
        r: 28,
        fill: "#00ff66",
        opacity: isLit ? "0.95" : "0.0",
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
        fill: isLit ? "#00ff66" : "#1e3a24",
        stroke: "#0f172a",
        "stroke-width": 2,
        "pointer-events": "none"
      });
      g.appendChild(bulb);

      // Left lead line
      g.appendChild(createSVGElement("line", {
        x1: pPos1.x,
        y1: pPos1.y,
        x2: c.x - ledR,
        y2: c.y,
        stroke: "#a00000",
        "stroke-width": 1.5,
        "pointer-events": "none"
      }));

      // Right lead line
      g.appendChild(createSVGElement("line", {
        x1: c.x + ledR,
        y1: c.y,
        x2: pPos2.x,
        y2: pPos2.y,
        stroke: "#a00000",
        "stroke-width": 1.5,
        "pointer-events": "none"
      }));

      // Left terminal pin (Pin 1)
      g.appendChild(createPinTerminalGroup(c.id, 1, pPos1.x, pPos1.y));

      // Right terminal pin (Pin 2)
      g.appendChild(createPinTerminalGroup(c.id, 2, pPos2.x, pPos2.y));

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
      const pPos1 = getPinWorldPos(c, 1);
      const pPos2 = getPinWorldPos(c, 2);
      const v1 = state.pinVoltages[`${c.id}:1`];
      const v2 = state.pinVoltages[`${c.id}:2`];
      const initialVal = v1 !== undefined ? v1 : (v2 !== undefined ? v2 : "-");

      g.appendChild(createSVGElement("rect", {
        x: c.x - 55,
        y: c.y - boxH / 2 - 10,
        width: 110,
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

      // Left lead line
      g.appendChild(createSVGElement("line", {
        x1: pPos1.x,
        y1: pPos1.y,
        x2: c.x - boxW / 2,
        y2: c.y,
        stroke: "#a00000",
        "stroke-width": 1.5,
        "pointer-events": "none"
      }));

      // Right lead line
      g.appendChild(createSVGElement("line", {
        x1: c.x + boxW / 2,
        y1: c.y,
        x2: pPos2.x,
        y2: pPos2.y,
        stroke: "#a00000",
        "stroke-width": 1.5,
        "pointer-events": "none"
      }));

      // Left terminal pin (Pin 1)
      g.appendChild(createPinTerminalGroup(c.id, 1, pPos1.x, pPos1.y));

      // Right terminal pin (Pin 2)
      g.appendChild(createPinTerminalGroup(c.id, 2, pPos2.x, pPos2.y));

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

  function renderPowerRail(g, c, spec, dims) {
    const boxX = c.x - dims.w / 2;
    const boxY = c.y - dims.h / 2;

    // Grab area for dragging
    g.appendChild(createSVGElement("rect", {
      x: boxX - 10,
      y: boxY - 10,
      width: dims.w + 20,
      height: dims.h + 20,
      class: "comp-grab-area"
    }));

    // Main carrier body
    g.appendChild(createSVGElement("rect", {
      x: boxX,
      y: boxY,
      width: dims.w,
      height: dims.h,
      rx: 6,
      fill: "#f8fafc",
      stroke: "#334155",
      "stroke-width": 2,
      class: "comp-body",
      "pointer-events": "none"
    }));

    // Top Label / Title
    const refT = createSVGElement("text", {
      x: c.x,
      y: boxY - 8,
      "text-anchor": "middle",
      fill: "#cc0000",
      "font-family": "DM Mono",
      "font-weight": "bold",
      "font-size": 12,
      "pointer-events": "none"
    });
    refT.textContent = `${c.ref} • POWER BUS RAIL`;
    g.appendChild(refT);

    // --- TOP +5V BUS BAR ---
    g.appendChild(createSVGElement("rect", {
      x: boxX + 8,
      y: boxY + 6,
      width: dims.w - 16,
      height: 26,
      rx: 4,
      fill: "#fee2e2",
      stroke: "#ef4444",
      "stroke-width": 1.2,
      "pointer-events": "none"
    }));

    const vccBusLbl = createSVGElement("text", {
      x: boxX + 16,
      y: boxY + 23,
      fill: "#b91c1c",
      "font-family": "DM Mono",
      "font-weight": "bold",
      "font-size": 11,
      "pointer-events": "none"
    });
    vccBusLbl.textContent = "+5V (VCC)";
    g.appendChild(vccBusLbl);

    // Pins 1..4 (+5V Terminals)
    for (let pNum = 1; pNum <= 4; pNum++) {
      const pPos = getPinWorldPos(c, pNum);

      // Pin Number Label
      const pLbl = createSVGElement("text", {
        x: pPos.x,
        y: pPos.y - 8,
        "text-anchor": "middle",
        fill: "#991b1b",
        "font-family": "DM Mono",
        "font-size": 8,
        "font-weight": "bold",
        "pointer-events": "none"
      });
      pLbl.textContent = `P${pNum}`;
      g.appendChild(pLbl);

      g.appendChild(createPinTerminalGroup(c.id, pNum, pPos.x, pPos.y));
    }

    // --- BOTTOM GND BUS BAR ---
    g.appendChild(createSVGElement("rect", {
      x: boxX + 8,
      y: boxY + 40,
      width: dims.w - 16,
      height: 26,
      rx: 4,
      fill: "#e0f2fe",
      stroke: "#0284c7",
      "stroke-width": 1.2,
      "pointer-events": "none"
    }));

    const gndBusLbl = createSVGElement("text", {
      x: boxX + 16,
      y: boxY + 57,
      fill: "#0369a1",
      "font-family": "DM Mono",
      "font-weight": "bold",
      "font-size": 11,
      "pointer-events": "none"
    });
    gndBusLbl.textContent = "GND (0V)";
    g.appendChild(gndBusLbl);

    // Pins 5..8 (GND Terminals)
    for (let pNum = 5; pNum <= 8; pNum++) {
      const pPos = getPinWorldPos(c, pNum);

      // Pin Number Label
      const pLbl = createSVGElement("text", {
        x: pPos.x,
        y: pPos.y + 14,
        "text-anchor": "middle",
        fill: "#075985",
        "font-family": "DM Mono",
        "font-size": 8,
        "font-weight": "bold",
        "pointer-events": "none"
      });
      pLbl.textContent = `P${pNum}`;
      g.appendChild(pLbl);

      g.appendChild(createPinTerminalGroup(c.id, pNum, pPos.x, pPos.y));
    }
  }

  function renderSwitchRail8(g, c, spec, dims) {
    const boxX = c.x - dims.w / 2;
    const boxY = c.y - dims.h / 2;

    // Grab area for moving the component
    g.appendChild(createSVGElement("rect", {
      x: boxX - 10,
      y: boxY - 10,
      width: dims.w + 20,
      height: dims.h + 20,
      class: "comp-grab-area"
    }));

    // Industrial Dark Trainer Chassis
    g.appendChild(createSVGElement("rect", {
      x: boxX,
      y: boxY,
      width: dims.w,
      height: dims.h,
      rx: 6,
      fill: "#0f172a",
      stroke: "#334155",
      "stroke-width": 2,
      class: "comp-body",
      "pointer-events": "none"
    }));

    // Title label
    const title = createSVGElement("text", {
      x: c.x,
      y: boxY - 8,
      "text-anchor": "middle",
      fill: "#cc0000",
      "font-family": "DM Mono",
      "font-weight": "bold",
      "font-size": 12,
      "pointer-events": "none"
    });
    title.textContent = `${c.ref} • 8-BIT LOGIC INPUT SWITCH BANK (SW0 - SW7)`;
    g.appendChild(title);

    // Channel label subtitle on chassis
    const sub = createSVGElement("text", {
      x: boxX + 14,
      y: boxY + 16,
      fill: "#38bdf8",
      "font-family": "DM Mono",
      "font-weight": "bold",
      "font-size": 9,
      "pointer-events": "none"
    });
    sub.textContent = "LOGIC INPUTS (0/1)";
    g.appendChild(sub);

    const vals = c.state?.values || [0, 0, 0, 0, 0, 0, 0, 0];

    for (let i = 0; i < 8; i++) {
      const pinNum = i + 1;
      const swCenterX = c.x - 192 + i * 55;
      const swCenterY = c.y - 4;
      const val = vals[i] ? 1 : 0;
      const pPos = getPinWorldPos(c, pinNum);

      // Switch Channel Name Label
      const swName = createSVGElement("text", {
        x: swCenterX,
        y: boxY + 16,
        "text-anchor": "middle",
        fill: "#94a3b8",
        "font-family": "DM Mono",
        "font-size": 10,
        "font-weight": "bold",
        "pointer-events": "none"
      });
      swName.textContent = `SW${i}`;
      g.appendChild(swName);

      // Switch Track / Bezel
      g.appendChild(createSVGElement("rect", {
        x: swCenterX - 18,
        y: swCenterY - 10,
        width: 36,
        height: 20,
        rx: 4,
        fill: "#1e293b",
        stroke: "#475569",
        "stroke-width": 1.5,
        "pointer-events": "none"
      }));

      // Sliding Knob
      const knob = createSVGElement("rect", {
        id: `sw8-knob-${c.id}-${i}`,
        x: val === 1 ? swCenterX + 2 : swCenterX - 18,
        y: swCenterY - 8,
        width: 16,
        height: 16,
        rx: 3,
        fill: val === 1 ? "#22c55e" : "#ef4444",
        "pointer-events": "none"
      });
      g.appendChild(knob);

      // Digital readout text inside bezel
      const valTxt = createSVGElement("text", {
        id: `sw8-val-${c.id}-${i}`,
        x: val === 1 ? swCenterX - 8 : swCenterX + 9,
        y: swCenterY + 4,
        "text-anchor": "middle",
        fill: "#ffffff",
        "font-family": "DM Mono",
        "font-weight": "bold",
        "font-size": 10,
        "pointer-events": "none"
      });
      valTxt.textContent = val.toString();
      g.appendChild(valTxt);

      // Terminal stem line down to terminal
      g.appendChild(createSVGElement("line", {
        x1: swCenterX,
        y1: swCenterY + 10,
        x2: swCenterX,
        y2: pPos.y,
        stroke: "#a00000",
        "stroke-width": 1.5,
        "pointer-events": "none"
      }));

      // Output Terminal Group
      g.appendChild(createPinTerminalGroup(c.id, pinNum, pPos.x, pPos.y));

      // Transparent interactive hit area to toggle this individual switch
      const hitRect = createSVGElement("rect", {
        x: swCenterX - 20,
        y: swCenterY - 12,
        width: 40,
        height: 24,
        rx: 4,
        fill: "transparent",
        style: "cursor: pointer;"
      });

      hitRect.addEventListener("mousedown", (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (!c.state.values) c.state.values = [0, 0, 0, 0, 0, 0, 0, 0];
        c.state.values[i] = c.state.values[i] ? 0 : 1;
        runSimulation();
      });

      g.appendChild(hitRect);
    }
  }

  function renderLedRail8(g, c, spec, dims) {
    const boxX = c.x - dims.w / 2;
    const boxY = c.y - dims.h / 2;

    // Grab area for moving the component
    g.appendChild(createSVGElement("rect", {
      x: boxX - 10,
      y: boxY - 10,
      width: dims.w + 20,
      height: dims.h + 20,
      class: "comp-grab-area"
    }));

    // Industrial Dark Trainer Chassis
    g.appendChild(createSVGElement("rect", {
      x: boxX,
      y: boxY,
      width: dims.w,
      height: dims.h,
      rx: 6,
      fill: "#0f172a",
      stroke: "#334155",
      "stroke-width": 2,
      class: "comp-body",
      "pointer-events": "none"
    }));

    // Title label
    const title = createSVGElement("text", {
      x: c.x,
      y: boxY - 8,
      "text-anchor": "middle",
      fill: "#cc0000",
      "font-family": "DM Mono",
      "font-weight": "bold",
      "font-size": 12,
      "pointer-events": "none"
    });
    title.textContent = `${c.ref} • 8-BIT LOGIC OUTPUT LED DISPLAY (L0 - L7)`;
    g.appendChild(title);

    // Channel label subtitle on chassis
    const sub = createSVGElement("text", {
      x: boxX + 14,
      y: boxY + 74,
      fill: "#10b981",
      "font-family": "DM Mono",
      "font-weight": "bold",
      "font-size": 9,
      "pointer-events": "none"
    });
    sub.textContent = "LOGIC MONITORS (L0 - L7)";
    g.appendChild(sub);

    for (let i = 0; i < 8; i++) {
      const pinNum = i + 1;
      const ledCenterX = c.x - 192 + i * 55;
      const bulbCenterY = c.y + 4;
      const pPos = getPinWorldPos(c, pinNum);
      const initialVal = state.pinVoltages ? (state.pinVoltages[`${c.id}:${pinNum}`] || 0) : 0;

      // Stem line from top input terminal down to bulb
      g.appendChild(createSVGElement("line", {
        x1: ledCenterX,
        y1: pPos.y,
        x2: ledCenterX,
        y2: bulbCenterY - 12,
        stroke: "#a00000",
        "stroke-width": 1.5,
        "pointer-events": "none"
      }));

      // Input Terminal Group at top
      g.appendChild(createPinTerminalGroup(c.id, pinNum, pPos.x, pPos.y));

      // Outer bezel ring
      g.appendChild(createSVGElement("circle", {
        cx: ledCenterX,
        cy: bulbCenterY,
        r: 13,
        fill: "#1e293b",
        stroke: "#475569",
        "stroke-width": 1.5,
        "pointer-events": "none"
      }));

      // Glow filter circle
      const glow = createSVGElement("circle", {
        id: `led8-glow-${c.id}-${i}`,
        cx: ledCenterX,
        cy: bulbCenterY,
        r: 18,
        fill: "#00ff66",
        opacity: initialVal === 1 ? "0.95" : "0.0",
        class: "led-glow",
        filter: "blur(6px)",
        "pointer-events": "none"
      });
      g.appendChild(glow);

      // Core bulb
      const core = createSVGElement("circle", {
        id: `led8-core-${c.id}-${i}`,
        cx: ledCenterX,
        cy: bulbCenterY,
        r: 10,
        fill: initialVal === 1 ? "#00ff66" : "#1e3a24",
        stroke: "#0f172a",
        "stroke-width": 1.5,
        "pointer-events": "none"
      });
      g.appendChild(core);

      // Channel name below bulb
      const ledName = createSVGElement("text", {
        x: ledCenterX,
        y: bulbCenterY + 24,
        "text-anchor": "middle",
        fill: "#94a3b8",
        "font-family": "DM Mono",
        "font-size": 10,
        "font-weight": "bold",
        "pointer-events": "none"
      });
      ledName.textContent = `L${i}`;
      g.appendChild(ledName);

      // Binary readout badge
      const valTxt = createSVGElement("text", {
        id: `led8-val-${c.id}-${i}`,
        x: ledCenterX,
        y: bulbCenterY + 34,
        "text-anchor": "middle",
        fill: initialVal === 1 ? "#22c55e" : "#64748b",
        "font-family": "DM Mono",
        "font-size": 9,
        "font-weight": "bold",
        "pointer-events": "none"
      });
      valTxt.textContent = `[${initialVal}]`;
      g.appendChild(valTxt);
    }
  }

  function createPinTerminalGroup(compId, pinNum, x, y) {
    const g = createSVGElement("g", {
      class: "pin-terminal-group",
      "data-comp-id": compId,
      "data-pin-num": pinNum
    });

    const visual = createSVGElement("circle", {
      cx: x,
      cy: y,
      r: 4.5,
      fill: "#fffdf2",
      stroke: "#a00000",
      "stroke-width": 1.8,
      class: "pin-terminal-visual"
    });

    // Generous 30px touch hit-target
    const hitArea = createSVGElement("circle", {
      cx: x,
      cy: y,
      r: 15,
      class: "pin-terminal-hit"
    });

    g.appendChild(visual);
    g.appendChild(hitArea);

    const handlePinActivation = (e) => {
      e.stopPropagation();
      e.preventDefault();

      if (!state.activeWire) {
        startWireFromPin(compId, pinNum);
      } else {
        completeWireToPin(compId, pinNum);
      }
    };

    hitArea.addEventListener("mousedown", handlePinActivation);

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

    // Active multi-point wire drawing with magnetic snapping
    if (state.activeWire) {
      state.hoveredTargetPin = null;
      document.querySelectorAll(".pin-terminal-group").forEach((el) => {
        el.classList.remove("snap-hover");
      });

      // Check if mouse is near any valid pin
      for (const comp of state.components) {
        const spec = LIBRARY[comp.type];
        for (const p of spec.pins) {
          if (comp.id === state.activeWire.fromCompId && p.num === state.activeWire.fromPinNum) continue;

          const pPos = getPinWorldPos(comp, p.num);
          const dist = Math.hypot(coords.x - pPos.x, coords.y - pPos.y);
          if (dist < 18) {
            state.hoveredTargetPin = { compId: comp.id, pinNum: p.num, x: pPos.x, y: pPos.y };
            const targetEl = document.querySelector(`.pin-terminal-group[data-comp-id="${comp.id}"][data-pin-num="${p.num}"]`);
            targetEl?.classList.add("snap-hover");
            break;
          }
        }
        if (state.hoveredTargetPin) break;
      }

      updateTempWirePreview();
    }
  }

  function onCanvasMouseDown(e) {
    // If active wire routing is in progress, clicking empty board adds a locked corner (waypoint)!
    if (state.activeWire) {
      if (e.target.closest(".pin-terminal-hit")) {
        return; // Terminal click handles connection
      }
      e.stopPropagation();

      const lastPt = state.activeWire.waypoints[state.activeWire.waypoints.length - 1];
      const targetPt = state.mousePos;

      // Add intermediate right-angle corner and click point to waypoints
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
      const swA = addComponentAt("SWITCH", 200, 240);
      const swB = addComponentAt("SWITCH", 200, 320);
      const ic = addComponentAt("7400", 420, 280);
      const led = addComponentAt("LED", 660, 240);
      const prb = addComponentAt("PROBE", 660, 320);

      // Connect SW A -> Pin 1 (1A)
      state.wires.push({ id: "w1", from: { compId: swA.id, pinNum: 1 }, to: { compId: ic.id, pinNum: 1 }, state: 0 });
      // Connect SW B -> Pin 2 (1B)
      state.wires.push({ id: "w2", from: { compId: swB.id, pinNum: 1 }, to: { compId: ic.id, pinNum: 2 }, state: 0 });
      // Connect Pin 3 (1Y) -> LED
      state.wires.push({ id: "w3", from: { compId: ic.id, pinNum: 3 }, to: { compId: led.id, pinNum: 1 }, state: 1 });
      // Connect Pin 3 (1Y) -> Probe
      state.wires.push({ id: "w4", from: { compId: ic.id, pinNum: 3 }, to: { compId: prb.id, pinNum: 1 }, state: 1 });

    } else if (presetKey === "7483_adder") {
      // Preset 2: 7483 4-Bit Binary Full Adder Test
      const swA1 = addComponentAt("SWITCH", 200, 200);
      const swB1 = addComponentAt("SWITCH", 200, 280);
      const swCin = addComponentAt("SWITCH", 200, 360);
      const ic = addComponentAt("7483", 460, 280);
      const ledS1 = addComponentAt("LED", 700, 240);
      const ledC4 = addComponentAt("LED", 700, 340);

      state.wires.push({ id: "w1", from: { compId: swA1.id, pinNum: 1 }, to: { compId: ic.id, pinNum: 10 }, state: 0 });
      state.wires.push({ id: "w2", from: { compId: swB1.id, pinNum: 1 }, to: { compId: ic.id, pinNum: 11 }, state: 0 });
      state.wires.push({ id: "w3", from: { compId: swCin.id, pinNum: 1 }, to: { compId: ic.id, pinNum: 13 }, state: 0 });
      state.wires.push({ id: "w4", from: { compId: ic.id, pinNum: 9 }, to: { compId: ledS1.id, pinNum: 1 }, state: 0 });
      state.wires.push({ id: "w5", from: { compId: ic.id, pinNum: 14 }, to: { compId: ledC4.id, pinNum: 1 }, state: 0 });

    } else if (presetKey === "7485_comparator") {
      // Preset 3: 7485 4-Bit Magnitude Comparator Test
      const swA0 = addComponentAt("SWITCH", 200, 220);
      const swB0 = addComponentAt("SWITCH", 200, 320);
      const ic = addComponentAt("7485", 460, 280);
      const ledGT = addComponentAt("LED", 700, 220);
      const ledEQ = addComponentAt("LED", 700, 280);
      const ledLT = addComponentAt("LED", 700, 340);

      state.wires.push({ id: "w1", from: { compId: swA0.id, pinNum: 1 }, to: { compId: ic.id, pinNum: 10 }, state: 0 });
      state.wires.push({ id: "w2", from: { compId: swB0.id, pinNum: 1 }, to: { compId: ic.id, pinNum: 9 }, state: 0 });
      state.wires.push({ id: "w3", from: { compId: ic.id, pinNum: 5 }, to: { compId: ledGT.id, pinNum: 1 }, state: 0 });
      state.wires.push({ id: "w4", from: { compId: ic.id, pinNum: 6 }, to: { compId: ledEQ.id, pinNum: 1 }, state: 1 });
      state.wires.push({ id: "w5", from: { compId: ic.id, pinNum: 7 }, to: { compId: ledLT.id, pinNum: 1 }, state: 0 });

    } else if (presetKey === "74151_mux") {
      // Preset 4: 74151 8:1 Multiplexer
      const swD0 = addComponentAt("SWITCH", 200, 200);
      const swD1 = addComponentAt("SWITCH", 200, 260);
      const swS0 = addComponentAt("SWITCH", 200, 340);
      const ic = addComponentAt("74151", 460, 280);
      const ledY = addComponentAt("LED", 700, 240);
      const ledW = addComponentAt("LED", 700, 320);

      state.wires.push({ id: "w1", from: { compId: swD0.id, pinNum: 1 }, to: { compId: ic.id, pinNum: 4 }, state: 0 });
      state.wires.push({ id: "w2", from: { compId: swD1.id, pinNum: 1 }, to: { compId: ic.id, pinNum: 3 }, state: 0 });
      state.wires.push({ id: "w3", from: { compId: swS0.id, pinNum: 1 }, to: { compId: ic.id, pinNum: 11 }, state: 0 });
      state.wires.push({ id: "w4", from: { compId: ic.id, pinNum: 5 }, to: { compId: ledY.id, pinNum: 1 }, state: 0 });
      state.wires.push({ id: "w5", from: { compId: ic.id, pinNum: 6 }, to: { compId: ledW.id, pinNum: 1 }, state: 1 });

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

    } else if (presetKey === "7490_decade") {
      // Preset 9: 7490 BCD Decade Counter (Mod-10, 0..9)
      const pwrRail = addComponentAt("POWER_RAIL", 460, 100);
      const clk = addComponentAt("CLOCK", 160, 360);
      const ic = addComponentAt("7490", 460, 360);
      const ledRail = addComponentAt("LED_RAIL_8", 780, 360);

      // Power: VCC to Pin 5, GND to Pin 10
      state.wires.push({ id: "w_pwr_vcc", from: { compId: pwrRail.id, pinNum: 1 }, to: { compId: ic.id, pinNum: 5 }, state: 1 });
      state.wires.push({ id: "w_pwr_gnd", from: { compId: pwrRail.id, pinNum: 5 }, to: { compId: ic.id, pinNum: 10 }, state: 0 });

      // Inactive Resets: R0(1)[Pin 2], R0(2)[Pin 3], R9(1)[Pin 6], R9(2)[Pin 7] tied to GND
      state.wires.push({ id: "w_r0_1", from: { compId: pwrRail.id, pinNum: 6 }, to: { compId: ic.id, pinNum: 2 }, state: 0 });
      state.wires.push({ id: "w_r0_2", from: { compId: pwrRail.id, pinNum: 7 }, to: { compId: ic.id, pinNum: 3 }, state: 0 });
      state.wires.push({ id: "w_r9_1", from: { compId: pwrRail.id, pinNum: 8 }, to: { compId: ic.id, pinNum: 6 }, state: 0 });
      state.wires.push({ id: "w_r9_2", from: { compId: pwrRail.id, pinNum: 8 }, to: { compId: ic.id, pinNum: 7 }, state: 0 });

      // Clock Input: CLOCK Pin 1 -> Pin 14 (CP0)
      state.wires.push({ id: "w_clk", from: { compId: clk.id, pinNum: 1 }, to: { compId: ic.id, pinNum: 14 }, state: 0 });

      // Cascade Jumper: QA (Pin 12) -> CP1 (Pin 1)
      state.wires.push({
        id: "w_cascade",
        from: { compId: ic.id, pinNum: 12 },
        to: { compId: ic.id, pinNum: 1 },
        waypoints: [{ x: 570, y: 310 }, { x: 570, y: 220 }, { x: 350, y: 220 }, { x: 350, y: 310 }],
        state: 0
      });

      // Output Readouts to LED Rail (L0..L3)
      state.wires.push({ id: "w_out_qa", from: { compId: ic.id, pinNum: 12 }, to: { compId: ledRail.id, pinNum: 1 }, state: 0 });
      state.wires.push({ id: "w_out_qb", from: { compId: ic.id, pinNum: 9 },  to: { compId: ledRail.id, pinNum: 2 }, state: 0 });
      state.wires.push({ id: "w_out_qc", from: { compId: ic.id, pinNum: 8 },  to: { compId: ledRail.id, pinNum: 3 }, state: 0 });
      state.wires.push({ id: "w_out_qd", from: { compId: ic.id, pinNum: 11 }, to: { compId: ledRail.id, pinNum: 4 }, state: 0 });

    } else if (presetKey === "7490_mod6") {
      // Preset 10: 7490 Mod-6 Counter (QC·QB Feedback Reset)
      const pwrRail = addComponentAt("POWER_RAIL", 460, 100);
      const clk = addComponentAt("CLOCK", 160, 360);
      const ic = addComponentAt("7490", 460, 360);
      const ledRail = addComponentAt("LED_RAIL_8", 780, 360);

      // Power
      state.wires.push({ id: "w_pwr_vcc", from: { compId: pwrRail.id, pinNum: 1 }, to: { compId: ic.id, pinNum: 5 }, state: 1 });
      state.wires.push({ id: "w_pwr_gnd", from: { compId: pwrRail.id, pinNum: 5 }, to: { compId: ic.id, pinNum: 10 }, state: 0 });

      // R9 tied to GND
      state.wires.push({ id: "w_r9_1", from: { compId: pwrRail.id, pinNum: 8 }, to: { compId: ic.id, pinNum: 6 }, state: 0 });
      state.wires.push({ id: "w_r9_2", from: { compId: pwrRail.id, pinNum: 8 }, to: { compId: ic.id, pinNum: 7 }, state: 0 });

      // Mod-6 Feedback: QC (Pin 8) -> R0(1) (Pin 2), QB (Pin 9) -> R0(2) (Pin 3)
      state.wires.push({
        id: "w_fb_qc",
        from: { compId: ic.id, pinNum: 8 },
        to: { compId: ic.id, pinNum: 2 },
        waypoints: [{ x: 570, y: 410 }, { x: 570, y: 490 }, { x: 350, y: 490 }, { x: 350, y: 330 }],
        state: 0
      });
      state.wires.push({
        id: "w_fb_qb",
        from: { compId: ic.id, pinNum: 9 },
        to: { compId: ic.id, pinNum: 3 },
        waypoints: [{ x: 560, y: 390 }, { x: 560, y: 480 }, { x: 360, y: 480 }, { x: 360, y: 350 }],
        state: 0
      });

      // Clock Input: CLOCK Pin 1 -> Pin 14 (CP0)
      state.wires.push({ id: "w_clk", from: { compId: clk.id, pinNum: 1 }, to: { compId: ic.id, pinNum: 14 }, state: 0 });

      // Cascade Jumper: QA (Pin 12) -> CP1 (Pin 1)
      state.wires.push({
        id: "w_cascade",
        from: { compId: ic.id, pinNum: 12 },
        to: { compId: ic.id, pinNum: 1 },
        waypoints: [{ x: 570, y: 310 }, { x: 570, y: 220 }, { x: 350, y: 220 }, { x: 350, y: 310 }],
        state: 0
      });

      // Output Readouts to LED Rail
      state.wires.push({ id: "w_out_qa", from: { compId: ic.id, pinNum: 12 }, to: { compId: ledRail.id, pinNum: 1 }, state: 0 });
      state.wires.push({ id: "w_out_qb", from: { compId: ic.id, pinNum: 9 },  to: { compId: ledRail.id, pinNum: 2 }, state: 0 });
      state.wires.push({ id: "w_out_qc", from: { compId: ic.id, pinNum: 8 },  to: { compId: ledRail.id, pinNum: 3 }, state: 0 });
      state.wires.push({ id: "w_out_qd", from: { compId: ic.id, pinNum: 11 }, to: { compId: ledRail.id, pinNum: 4 }, state: 0 });

    } else if (presetKey === "7493_mod16") {
      // Preset 11: 7493 4-Bit Binary Counter (Mod-16, 0..15)
      const pwrRail = addComponentAt("POWER_RAIL", 460, 100);
      const clk = addComponentAt("CLOCK", 160, 360);
      const ic = addComponentAt("7493", 460, 360);
      const ledRail = addComponentAt("LED_RAIL_8", 780, 360);

      // Power: VCC to Pin 5, GND to Pin 10
      state.wires.push({ id: "w_pwr_vcc", from: { compId: pwrRail.id, pinNum: 1 }, to: { compId: ic.id, pinNum: 5 }, state: 1 });
      state.wires.push({ id: "w_pwr_gnd", from: { compId: pwrRail.id, pinNum: 5 }, to: { compId: ic.id, pinNum: 10 }, state: 0 });

      // Inactive Resets: R0(1)[Pin 2], R0(2)[Pin 3] tied to GND
      state.wires.push({ id: "w_r0_1", from: { compId: pwrRail.id, pinNum: 6 }, to: { compId: ic.id, pinNum: 2 }, state: 0 });
      state.wires.push({ id: "w_r0_2", from: { compId: pwrRail.id, pinNum: 7 }, to: { compId: ic.id, pinNum: 3 }, state: 0 });

      // Clock Input: CLOCK Pin 1 -> Pin 14 (CP0)
      state.wires.push({ id: "w_clk", from: { compId: clk.id, pinNum: 1 }, to: { compId: ic.id, pinNum: 14 }, state: 0 });

      // Cascade Jumper: QA (Pin 12) -> CP1 (Pin 1)
      state.wires.push({
        id: "w_cascade",
        from: { compId: ic.id, pinNum: 12 },
        to: { compId: ic.id, pinNum: 1 },
        waypoints: [{ x: 570, y: 310 }, { x: 570, y: 220 }, { x: 350, y: 220 }, { x: 350, y: 310 }],
        state: 0
      });

      // Output Readouts to LED Rail (L0..L3)
      state.wires.push({ id: "w_out_qa", from: { compId: ic.id, pinNum: 12 }, to: { compId: ledRail.id, pinNum: 1 }, state: 0 });
      state.wires.push({ id: "w_out_qb", from: { compId: ic.id, pinNum: 9 },  to: { compId: ledRail.id, pinNum: 2 }, state: 0 });
      state.wires.push({ id: "w_out_qc", from: { compId: ic.id, pinNum: 8 },  to: { compId: ledRail.id, pinNum: 3 }, state: 0 });
      state.wires.push({ id: "w_out_qd", from: { compId: ic.id, pinNum: 11 }, to: { compId: ledRail.id, pinNum: 4 }, state: 0 });

    } else if (presetKey === "7493_mod12") {
      // Preset 12: 7493 Mod-12 Counter (QD·QC Feedback Reset)
      const pwrRail = addComponentAt("POWER_RAIL", 460, 100);
      const clk = addComponentAt("CLOCK", 160, 360);
      const ic = addComponentAt("7493", 460, 360);
      const ledRail = addComponentAt("LED_RAIL_8", 780, 360);

      // Power
      state.wires.push({ id: "w_pwr_vcc", from: { compId: pwrRail.id, pinNum: 1 }, to: { compId: ic.id, pinNum: 5 }, state: 1 });
      state.wires.push({ id: "w_pwr_gnd", from: { compId: pwrRail.id, pinNum: 5 }, to: { compId: ic.id, pinNum: 10 }, state: 0 });

      // Mod-12 Feedback: QD (Pin 11) -> R0(1) (Pin 2), QC (Pin 8) -> R0(2) (Pin 3)
      state.wires.push({
        id: "w_fb_qd",
        from: { compId: ic.id, pinNum: 11 },
        to: { compId: ic.id, pinNum: 2 },
        waypoints: [{ x: 570, y: 340 }, { x: 570, y: 490 }, { x: 350, y: 490 }, { x: 350, y: 330 }],
        state: 0
      });
      state.wires.push({
        id: "w_fb_qc",
        from: { compId: ic.id, pinNum: 8 },
        to: { compId: ic.id, pinNum: 3 },
        waypoints: [{ x: 560, y: 410 }, { x: 560, y: 480 }, { x: 360, y: 480 }, { x: 360, y: 350 }],
        state: 0
      });

      // Clock Input: CLOCK Pin 1 -> Pin 14 (CP0)
      state.wires.push({ id: "w_clk", from: { compId: clk.id, pinNum: 1 }, to: { compId: ic.id, pinNum: 14 }, state: 0 });

      // Cascade Jumper: QA (Pin 12) -> CP1 (Pin 1)
      state.wires.push({
        id: "w_cascade",
        from: { compId: ic.id, pinNum: 12 },
        to: { compId: ic.id, pinNum: 1 },
        waypoints: [{ x: 570, y: 310 }, { x: 570, y: 220 }, { x: 350, y: 220 }, { x: 350, y: 310 }],
        state: 0
      });

      // Output Readouts to LED Rail
      state.wires.push({ id: "w_out_qa", from: { compId: ic.id, pinNum: 12 }, to: { compId: ledRail.id, pinNum: 1 }, state: 0 });
      state.wires.push({ id: "w_out_qb", from: { compId: ic.id, pinNum: 9 },  to: { compId: ledRail.id, pinNum: 2 }, state: 0 });
      state.wires.push({ id: "w_out_qc", from: { compId: ic.id, pinNum: 8 },  to: { compId: ledRail.id, pinNum: 3 }, state: 0 });
      state.wires.push({ id: "w_out_qd", from: { compId: ic.id, pinNum: 11 }, to: { compId: ledRail.id, pinNum: 4 }, state: 0 });
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
