/**
   Virtual IC Workbench & EDA Schematic Lab Engine
   Replicating KiCad Eeschema UI with Symbol Chooser, Orthogonal Manhattan Wires,
   and Real-Time Digital Logic Simulation for Lab Practicals
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
        { num: 3, name: "1Y", type: "out", side: "right", pos: 1 },
        { num: 4, name: "2A", type: "in", side: "left", pos: 3 },
        { num: 5, name: "2B", type: "in", side: "left", pos: 4 },
        { num: 6, name: "2Y", type: "out", side: "right", pos: 2 },
        { num: 7, name: "GND", type: "pwr", side: "bottom", pos: 1 },
        { num: 8, name: "3Y", type: "out", side: "right", pos: 3 },
        { num: 9, name: "3A", type: "in", side: "left", pos: 5 },
        { num: 10, name: "3B", type: "in", side: "left", pos: 6 },
        { num: 11, name: "4Y", type: "out", side: "right", pos: 4 },
        { num: 12, name: "4A", type: "in", side: "left", pos: 7 },
        { num: 13, name: "4B", type: "in", side: "left", pos: 8 },
        { num: 14, name: "VCC", type: "pwr", side: "top", pos: 1 }
      ],
      evaluate: (inputs) => {
        // Active low NAND output: 0 only if both inputs are 1. Default unconnected input = 1 (TTL float HIGH).
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
        { num: 3, name: "1Y", type: "out", side: "right", pos: 1 },
        { num: 4, name: "2A", type: "in", side: "left", pos: 3 },
        { num: 5, name: "2B", type: "in", side: "left", pos: 4 },
        { num: 6, name: "2Y", type: "out", side: "right", pos: 2 },
        { num: 7, name: "GND", type: "pwr", side: "bottom", pos: 1 },
        { num: 8, name: "3Y", type: "out", side: "right", pos: 3 },
        { num: 9, name: "3A", type: "in", side: "left", pos: 5 },
        { num: 10, name: "3B", type: "in", side: "left", pos: 6 },
        { num: 11, name: "4Y", type: "out", side: "right", pos: 4 },
        { num: 12, name: "4A", type: "in", side: "left", pos: 7 },
        { num: 13, name: "4B", type: "in", side: "left", pos: 8 },
        { num: 14, name: "VCC", type: "pwr", side: "top", pos: 1 }
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
        { num: 3, name: "1Y", type: "out", side: "right", pos: 1 },
        { num: 4, name: "2A", type: "in", side: "left", pos: 3 },
        { num: 5, name: "2B", type: "in", side: "left", pos: 4 },
        { num: 6, name: "2Y", type: "out", side: "right", pos: 2 },
        { num: 7, name: "GND", type: "pwr", side: "bottom", pos: 1 },
        { num: 8, name: "3Y", type: "out", side: "right", pos: 3 },
        { num: 9, name: "3A", type: "in", side: "left", pos: 5 },
        { num: 10, name: "3B", type: "in", side: "left", pos: 6 },
        { num: 11, name: "4Y", type: "out", side: "right", pos: 4 },
        { num: 12, name: "4A", type: "in", side: "left", pos: 7 },
        { num: 13, name: "4B", type: "in", side: "left", pos: 8 },
        { num: 14, name: "VCC", type: "pwr", side: "top", pos: 1 }
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
      desc: "Four independent 2-input Exclusive-OR gates. Core component for adders, subtractors, and parity generators.",
      datasheet: "VCC: Pin 14, GND: Pin 7. Gates: (1A,1B->1Y), (2A,2B->2Y), (3A,3B->3Y), (4A,4B->4Y).",
      pins: [
        { num: 1, name: "1A", type: "in", side: "left", pos: 1 },
        { num: 2, name: "1B", type: "in", side: "left", pos: 2 },
        { num: 3, name: "1Y", type: "out", side: "right", pos: 1 },
        { num: 4, name: "2A", type: "in", side: "left", pos: 3 },
        { num: 5, name: "2B", type: "in", side: "left", pos: 4 },
        { num: 6, name: "2Y", type: "out", side: "right", pos: 2 },
        { num: 7, name: "GND", type: "pwr", side: "bottom", pos: 1 },
        { num: 8, name: "3Y", type: "out", side: "right", pos: 3 },
        { num: 9, name: "3A", type: "in", side: "left", pos: 5 },
        { num: 10, name: "3B", type: "in", side: "left", pos: 6 },
        { num: 11, name: "4Y", type: "out", side: "right", pos: 4 },
        { num: 12, name: "4A", type: "in", side: "left", pos: 7 },
        { num: 13, name: "4B", type: "in", side: "left", pos: 8 },
        { num: 14, name: "VCC", type: "pwr", side: "top", pos: 1 }
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
        { num: 1, name: "1Y", type: "out", side: "right", pos: 1 },
        { num: 2, name: "1A", type: "in", side: "left", pos: 1 },
        { num: 3, name: "1B", type: "in", side: "left", pos: 2 },
        { num: 4, name: "2Y", type: "out", side: "right", pos: 2 },
        { num: 5, name: "2A", type: "in", side: "left", pos: 3 },
        { num: 6, name: "2B", type: "in", side: "left", pos: 4 },
        { num: 7, name: "GND", type: "pwr", side: "bottom", pos: 1 },
        { num: 8, name: "3A", type: "in", side: "left", pos: 5 },
        { num: 9, name: "3B", type: "in", side: "left", pos: 6 },
        { num: 10, name: "3Y", type: "out", side: "right", pos: 3 },
        { num: 11, name: "4A", type: "in", side: "left", pos: 7 },
        { num: 12, name: "4B", type: "in", side: "left", pos: 8 },
        { num: 13, name: "4Y", type: "out", side: "right", pos: 4 },
        { num: 14, name: "VCC", type: "pwr", side: "top", pos: 1 }
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
        { num: 2, name: "1Y", type: "out", side: "right", pos: 1 },
        { num: 3, name: "2A", type: "in", side: "left", pos: 2 },
        { num: 4, name: "2Y", type: "out", side: "right", pos: 2 },
        { num: 5, name: "3A", type: "in", side: "left", pos: 3 },
        { num: 6, name: "3Y", type: "out", side: "right", pos: 3 },
        { num: 7, name: "GND", type: "pwr", side: "bottom", pos: 1 },
        { num: 8, name: "4Y", type: "out", side: "right", pos: 4 },
        { num: 9, name: "4A", type: "in", side: "left", pos: 4 },
        { num: 10, name: "5Y", type: "out", side: "right", pos: 5 },
        { num: 11, name: "5A", type: "in", side: "left", pos: 5 },
        { num: 12, name: "6Y", type: "out", side: "right", pos: 6 },
        { num: 13, name: "6A", type: "in", side: "left", pos: 6 },
        { num: 14, name: "VCC", type: "pwr", side: "top", pos: 1 }
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
        { num: 1, name: "D3", type: "in", side: "left", pos: 4 },
        { num: 2, name: "D2", type: "in", side: "left", pos: 3 },
        { num: 3, name: "D1", type: "in", side: "left", pos: 2 },
        { num: 4, name: "D0", type: "in", side: "left", pos: 1 },
        { num: 5, name: "Y", type: "out", side: "right", pos: 1 },
        { num: 6, name: "W", type: "out", side: "right", pos: 2 },
        { num: 7, name: "~G", type: "in", side: "left", pos: 12 },
        { num: 8, name: "GND", type: "pwr", side: "bottom", pos: 1 },
        { num: 9, name: "C", type: "in", side: "left", pos: 11 },
        { num: 10, name: "B", type: "in", side: "left", pos: 10 },
        { num: 11, name: "A", type: "in", side: "left", pos: 9 },
        { num: 12, name: "D7", type: "in", side: "left", pos: 8 },
        { num: 13, name: "D6", type: "in", side: "left", pos: 7 },
        { num: 14, name: "D5", type: "in", side: "left", pos: 6 },
        { num: 15, name: "D4", type: "in", side: "left", pos: 5 },
        { num: 16, name: "VCC", type: "pwr", side: "top", pos: 1 }
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
        { num: 1, name: "B3", type: "in", side: "left", pos: 8 },
        { num: 2, name: "I_LT", type: "in", side: "left", pos: 11 },
        { num: 3, name: "I_EQ", type: "in", side: "left", pos: 10 },
        { num: 4, name: "I_GT", type: "in", side: "left", pos: 9 },
        { num: 5, name: "O_GT", type: "out", side: "right", pos: 1 },
        { num: 6, name: "O_EQ", type: "out", side: "right", pos: 2 },
        { num: 7, name: "O_LT", type: "out", side: "right", pos: 3 },
        { num: 8, name: "GND", type: "pwr", side: "bottom", pos: 1 },
        { num: 9, name: "B0", type: "in", side: "left", pos: 5 },
        { num: 10, name: "A0", type: "in", side: "left", pos: 1 },
        { num: 11, name: "B1", type: "in", side: "left", pos: 6 },
        { num: 12, name: "A1", type: "in", side: "left", pos: 2 },
        { num: 13, name: "A2", type: "in", side: "left", pos: 3 },
        { num: 14, name: "B2", type: "in", side: "left", pos: 7 },
        { num: 15, name: "A3", type: "in", side: "left", pos: 4 },
        { num: 16, name: "VCC", type: "pwr", side: "top", pos: 1 }
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
        { num: 1, name: "A4", type: "in", side: "left", pos: 4 },
        { num: 2, name: "S3", type: "out", side: "right", pos: 3 },
        { num: 3, name: "A3", type: "in", side: "left", pos: 3 },
        { num: 4, name: "B3", type: "in", side: "left", pos: 7 },
        { num: 5, name: "VCC", type: "pwr", side: "top", pos: 1 },
        { num: 6, name: "S2", type: "out", side: "right", pos: 2 },
        { num: 7, name: "B2", type: "in", side: "left", pos: 6 },
        { num: 8, name: "A2", type: "in", side: "left", pos: 2 },
        { num: 9, name: "S1", type: "out", side: "right", pos: 1 },
        { num: 10, name: "A1", type: "in", side: "left", pos: 1 },
        { num: 11, name: "B1", type: "in", side: "left", pos: 5 },
        { num: 12, name: "GND", type: "pwr", side: "bottom", pos: 1 },
        { num: 13, name: "C0", type: "in", side: "left", pos: 9 },
        { num: 14, name: "C4", type: "out", side: "right", pos: 5 },
        { num: 15, name: "S4", type: "out", side: "right", pos: 4 },
        { num: 16, name: "B4", type: "in", side: "left", pos: 8 }
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
    wires: [],        // { id, from: { compId, pinNum }, to: { compId, pinNum }, state: 0 }
    selectedItem: null,// { type: 'comp'|'wire', id }
    tool: "select",   // "select" | "wire" | "delete"
    isSimRunning: true,
    clockTick: 0,
    clockInterval: null,

    // Last computed voltages for seamless DOM re-renders: { "compId:pinNum": 0|1 }
    pinVoltages: {},

    // Wire drawing state
    activeWireStart: null, // { compId, pinNum, x, y }
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

    // Symbol Chooser Modal state
    selectedModalItem: "7400"
  };

  // Counter for unique reference IDs
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

    // Continuous simulation loop ensures clock, switches, and LEDs remain live
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
      } else if (e.key === "Delete" || e.key === "Backspace") {
        deleteSelectedItem();
      } else if (e.key === "Escape") {
        cancelActiveWire();
        closeModal();
      }
    });
  }

  function initToolbar() {
    // Tool buttons
    document.getElementById("btn-tool-select")?.addEventListener("click", () => setTool("select"));
    document.getElementById("btn-tool-wire")?.addEventListener("click", () => setTool("wire"));
    document.getElementById("btn-tool-delete")?.addEventListener("click", () => setTool("delete"));
    document.getElementById("btn-add-symbol")?.addEventListener("click", () => openModal());
    document.getElementById("btn-clear-canvas")?.addEventListener("click", () => clearCanvas());

    // Simulation toggle
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

    // Preset selector
    const presetSelect = document.getElementById("preset-select");
    presetSelect?.addEventListener("change", (e) => {
      if (e.target.value) {
        loadLabPreset(e.target.value);
        e.target.value = "";
      }
    });

    // Zoom buttons
    document.getElementById("btn-zoom-in")?.addEventListener("click", () => zoom(0.8));
    document.getElementById("btn-zoom-out")?.addEventListener("click", () => zoom(1.25));
    document.getElementById("btn-zoom-reset")?.addEventListener("click", () => resetZoom());

    // Quick palette items
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
        hint.textContent = "WIRE MODE: Click any red pin terminal to start a wire. Hover over another pin to snap and connect.";
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
        svg.appendChild(createSVGElement("line", { x1: 0, y1: 0, x2: 0, y2: -30, stroke: "#a00000", "stroke-width": 2 }));
        svg.appendChild(createSVGElement("line", { x1: -15, y1: -30, x2: 15, y2: -30, stroke: "#a00000", "stroke-width": 2.5 }));
        const t = createSVGElement("text", { x: 0, y: -40, "text-anchor": "middle", fill: "#a00000", "font-size": 13, "font-family": "DM Mono", "font-weight": "bold" });
        t.textContent = "+5V (VCC)";
        svg.appendChild(t);
      } else {
        svg.appendChild(createSVGElement("line", { x1: 0, y1: 0, x2: 0, y2: 30, stroke: "#a00000", "stroke-width": 2 }));
        svg.appendChild(createSVGElement("line", { x1: -20, y1: 30, x2: 20, y2: 30, stroke: "#a00000", "stroke-width": 2 }));
        svg.appendChild(createSVGElement("line", { x1: -12, y1: 38, x2: 12, y2: 38, stroke: "#a00000", "stroke-width": 2 }));
        svg.appendChild(createSVGElement("line", { x1: -4, y1: 46, x2: 4, y2: 46, stroke: "#a00000", "stroke-width": 2 }));
      }
      previewContainer.appendChild(svg);
      return;
    }

    if (spec.id === "DIODE") {
      svg.appendChild(createSVGElement("line", { x1: -50, y1: 0, x2: -15, y2: 0, stroke: "#1e293b", "stroke-width": 2 }));
      svg.appendChild(createSVGElement("polygon", { points: "-15,-20 -15,20 15,0", fill: "#e9bd4f", stroke: "#1e293b", "stroke-width": 2 }));
      svg.appendChild(createSVGElement("line", { x1: 15, y1: -20, x2: 15, y2: 20, stroke: "#1e293b", "stroke-width": 2.5 }));
      svg.appendChild(createSVGElement("line", { x1: 15, y1: 0, x2: 50, y2: 0, stroke: "#1e293b", "stroke-width": 2 }));
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

  function setSelectedItem(item) {
    // Remove previous selection classes without destroying DOM
    if (state.selectedItem) {
      if (state.selectedItem.type === "comp") {
        document.getElementById(`node-${state.selectedItem.id}`)?.classList.remove("selected");
      } else if (state.selectedItem.type === "wire") {
        document.getElementById(`wire-${state.selectedItem.id}`)?.classList.remove("selected");
      }
    }

    state.selectedItem = item;

    // Apply new selection class
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
  // 7. ROBUST PIN TERMINALS & ORTHOGONAL WIRING
  // =========================================================================
  function getPinWorldPos(comp, pinNum) {
    const spec = LIBRARY[comp.type];
    const pin = spec.pins.find((p) => p.num === pinNum);
    if (!pin) return { x: comp.x, y: comp.y };

    const dims = getComponentDims(comp.type);
    let px = comp.x;
    let py = comp.y;

    if (pin.side === "left") {
      px = comp.x - dims.w / 2 - 25;
      const leftPins = spec.pins.filter((p) => p.side === "left");
      const idx = leftPins.findIndex((p) => p.num === pinNum);
      py = comp.y - dims.h / 2 + 16 + idx * ((dims.h - 32) / Math.max(1, leftPins.length - 1));
    } else if (pin.side === "right") {
      px = comp.x + dims.w / 2 + 25;
      const rightPins = spec.pins.filter((p) => p.side === "right");
      const idx = rightPins.findIndex((p) => p.num === pinNum);
      py = comp.y - dims.h / 2 + 16 + idx * ((dims.h - 32) / Math.max(1, rightPins.length - 1));
    } else if (pin.side === "top") {
      px = comp.x;
      py = comp.y - dims.h / 2 - 25;
    } else if (pin.side === "bottom") {
      px = comp.x;
      py = comp.y + dims.h / 2 + 25;
    }

    return { x: px, y: py };
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
      h: Math.max(120, maxSidePins * 22 + 20)
    };
  }

  function startWireFromPin(compId, pinNum) {
    const comp = state.components.find((c) => c.id === compId);
    if (!comp) return;

    const pos = getPinWorldPos(comp, pinNum);
    state.activeWireStart = { compId, pinNum, x: pos.x, y: pos.y };

    // Clear previous start highlights
    document.querySelectorAll(".pin-terminal-group").forEach((el) => {
      el.classList.remove("active-start");
      el.classList.add("connect-target");
    });

    const activeEl = document.querySelector(`.pin-terminal-group[data-comp-id="${compId}"][data-pin-num="${pinNum}"]`);
    activeEl?.classList.add("active-start");

    const hint = document.getElementById("tool-hint-text");
    if (hint) {
      hint.textContent = `ROUTING WIRE from ${comp.ref} Pin ${pinNum}... Click another pin to connect. Right-click or Esc to cancel.`;
    }
  }

  function completeWireToPin(compId, pinNum) {
    if (!state.activeWireStart) return;

    // Cannot connect pin to itself on the same component
    if (state.activeWireStart.compId === compId && state.activeWireStart.pinNum === pinNum) {
      cancelActiveWire();
      return;
    }

    // Check if wire already exists
    const exists = state.wires.some(
      (w) =>
        (w.from.compId === state.activeWireStart.compId &&
          w.from.pinNum === state.activeWireStart.pinNum &&
          w.to.compId === compId &&
          w.to.pinNum === pinNum) ||
        (w.to.compId === state.activeWireStart.compId &&
          w.to.pinNum === state.activeWireStart.pinNum &&
          w.from.compId === compId &&
          w.from.pinNum === pinNum)
    );

    if (!exists) {
      const wire = {
        id: "wire_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
        from: { compId: state.activeWireStart.compId, pinNum: state.activeWireStart.pinNum },
        to: { compId, pinNum },
        state: 0
      };
      state.wires.push(wire);
      setSelectedItem({ type: "wire", id: wire.id });
    }

    cancelActiveWire();
    render();
  }

  function cancelActiveWire() {
    state.activeWireStart = null;
    state.hoveredTargetPin = null;
    if (tempWireLayer) tempWireLayer.innerHTML = "";
    document.querySelectorAll(".pin-terminal-group").forEach((el) => {
      el.classList.remove("connect-target", "active-start", "snap-hover");
    });

    const hint = document.getElementById("tool-hint-text");
    if (hint) {
      if (state.tool === "wire") {
        hint.textContent = "WIRE MODE: Click any red pin terminal to start a wire. Hover over another pin to snap and connect.";
      } else {
        hint.textContent = "SELECT MODE: Drag components to reposition. Click toggle switches to flip 0/1 logic.";
      }
    }
  }

  function calculateManhattanPath(x1, y1, x2, y2) {
    const midX = Math.round((x1 + x2) / 2 / 10) * 10;
    return `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;
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

    // 2. Propagate through Wires iteratively (up to 4 passes for cascading logic like 4-bit adders/comparators)
    for (let pass = 0; pass < 4; pass++) {
      // Propagate voltages across wires
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
    // Update Wires
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

    // Update Probes, LEDs, Switches
    state.components.forEach((c) => {
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
    runSimulation(); // Always maintain fresh simulation state
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
      const d = calculateManhattanPath(p1.x, p1.y, p2.x, p2.y);

      const wireG = createSVGElement("g", {
        id: `wire-${w.id}`,
        class: `wire-group ${state.selectedItem && state.selectedItem.id === w.id ? "selected" : ""}`
      });

      // Invisible wide hit path ensures clicking/deleting a wire is effortless
      const hitPath = createSVGElement("path", {
        d: d,
        class: "wire-hit-area"
      });

      // Visible schematic wire
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

      // Click to select or delete
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

      // Junction dots
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

      // Component dragging & selection
      g.addEventListener("mousedown", (e) => {
        // If clicking terminal or switch, let them handle it
        if (e.target.closest(".pin-terminal-group") || e.target.closest(".switch-control")) {
          return;
        }

        e.stopPropagation();

        if (state.tool === "delete") {
          setSelectedItem({ type: "comp", id: c.id });
          deleteSelectedItem();
          return;
        }

        setSelectedItem({ type: "comp", id: c.id });
        state.draggingComp = c;
        const coords = clientToSvgCoords(e.clientX, e.clientY);
        state.dragOffset = { x: coords.x - c.x, y: coords.y - c.y };
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

    // Default: Professional KiCad IC Package Box
    const boxX = c.x - dims.w / 2;
    const boxY = c.y - dims.h / 2;

    const rect = createSVGElement("rect", {
      x: boxX,
      y: boxY,
      width: dims.w,
      height: dims.h,
      fill: "#fffdf2",
      stroke: "#1e293b",
      "stroke-width": 2,
      class: "comp-body"
    });
    g.appendChild(rect);

    const refText = createSVGElement("text", {
      x: c.x,
      y: boxY - 8,
      "text-anchor": "middle",
      fill: "#cc0000",
      "font-family": "DM Mono",
      "font-weight": "bold",
      "font-size": 13
    });
    refText.textContent = c.ref;
    g.appendChild(refText);

    const nameText = createSVGElement("text", {
      x: c.x,
      y: c.y - 12,
      "text-anchor": "middle",
      fill: "#1e293b",
      "font-family": "DM Mono",
      "font-weight": "bold",
      "font-size": 15
    });
    nameText.textContent = spec.id;
    g.appendChild(nameText);

    const pkgText = createSVGElement("text", {
      x: c.x,
      y: c.y + 8,
      "text-anchor": "middle",
      fill: "#64748b",
      "font-family": "DM Mono",
      "font-size": 10
    });
    pkgText.textContent = spec.package;
    g.appendChild(pkgText);

    // Left and Right Pins
    const leftPins = spec.pins.filter((p) => p.side === "left");
    const rightPins = spec.pins.filter((p) => p.side === "right");

    leftPins.forEach((p, idx) => {
      const py = boxY + 16 + idx * ((dims.h - 32) / Math.max(1, leftPins.length - 1));
      const line = createSVGElement("line", { x1: boxX - 25, y1: py, x2: boxX, y2: py, stroke: "#a00000", "stroke-width": 1.5 });
      const pinNum = createSVGElement("text", { x: boxX - 12, y: py - 4, fill: "#718096", "font-family": "DM Mono", "font-size": 9, "text-anchor": "middle", "pointer-events": "none" });
      pinNum.textContent = p.num;
      const pinLbl = createSVGElement("text", { x: boxX + 6, y: py + 4, fill: "#1e293b", "font-family": "DM Mono", "font-weight": "600", "font-size": 10, "pointer-events": "none" });
      pinLbl.textContent = p.name;

      const term = createPinTerminalGroup(c.id, p.num, boxX - 25, py);
      g.appendChild(line);
      g.appendChild(pinNum);
      g.appendChild(pinLbl);
      g.appendChild(term);
    });

    rightPins.forEach((p, idx) => {
      const py = boxY + 16 + idx * ((dims.h - 32) / Math.max(1, rightPins.length - 1));
      const line = createSVGElement("line", { x1: boxX + dims.w, y1: py, x2: boxX + dims.w + 25, y2: py, stroke: "#a00000", "stroke-width": 1.5 });
      const pinNum = createSVGElement("text", { x: boxX + dims.w + 12, y: py - 4, fill: "#718096", "font-family": "DM Mono", "font-size": 9, "text-anchor": "middle", "pointer-events": "none" });
      pinNum.textContent = p.num;
      const pinLbl = createSVGElement("text", { x: boxX + dims.w - 6, y: py + 4, fill: "#1e293b", "font-family": "DM Mono", "font-weight": "600", "font-size": 10, "text-anchor": "end", "pointer-events": "none" });
      pinLbl.textContent = p.name;

      const term = createPinTerminalGroup(c.id, p.num, boxX + dims.w + 25, py);
      g.appendChild(line);
      g.appendChild(pinNum);
      g.appendChild(pinLbl);
      g.appendChild(term);
    });
  }

  function renderPowerSymbol(g, c, spec) {
    if (spec.id === "VCC") {
      g.appendChild(createSVGElement("line", { x1: c.x, y1: c.y, x2: c.x, y2: c.y - 25, stroke: "#a00000", "stroke-width": 2 }));
      g.appendChild(createSVGElement("line", { x1: c.x - 14, y1: c.y - 25, x2: c.x + 14, y2: c.y - 25, stroke: "#a00000", "stroke-width": 3 }));
      const t = createSVGElement("text", { x: c.x, y: c.y - 32, "text-anchor": "middle", fill: "#a00000", "font-family": "DM Mono", "font-weight": "bold", "font-size": 12, "pointer-events": "none" });
      t.textContent = "+5V";
      g.appendChild(t);
      g.appendChild(createPinTerminalGroup(c.id, 1, c.x, c.y));
    } else {
      g.appendChild(createSVGElement("line", { x1: c.x, y1: c.y, x2: c.x, y2: c.y + 20, stroke: "#a00000", "stroke-width": 2 }));
      g.appendChild(createSVGElement("line", { x1: c.x - 18, y1: c.y + 20, x2: c.x + 18, y2: c.y + 20, stroke: "#a00000", "stroke-width": 2 }));
      g.appendChild(createSVGElement("line", { x1: c.x - 11, y1: c.y + 26, x2: c.x + 11, y2: c.y + 26, stroke: "#a00000", "stroke-width": 2 }));
      g.appendChild(createSVGElement("line", { x1: c.x - 4, y1: c.y + 32, x2: c.x + 4, y2: c.y + 32, stroke: "#a00000", "stroke-width": 2 }));
      const t = createSVGElement("text", { x: c.x, y: c.y + 44, "text-anchor": "middle", fill: "#64748b", "font-family": "DM Mono", "font-size": 10, "pointer-events": "none" });
      t.textContent = "GND";
      g.appendChild(t);
      g.appendChild(createPinTerminalGroup(c.id, 1, c.x, c.y));
    }
  }

  function renderIoSymbol(g, c, spec, dims) {
    if (c.type === "SWITCH") {
      const boxW = 60;
      const boxH = 34;
      const swG = createSVGElement("g", { class: "switch-control" });

      swG.appendChild(createSVGElement("rect", {
        x: c.x - boxW / 2,
        y: c.y - boxH / 2,
        width: boxW,
        height: boxH,
        rx: 4,
        fill: "#1e293b",
        stroke: "#334155",
        "stroke-width": 1.5
      }));

      swG.appendChild(createSVGElement("rect", {
        id: `switch-knob-${c.id}`,
        x: c.state.value ? c.x + 4 : c.x - 24,
        y: c.y - 12,
        width: 20,
        height: 24,
        rx: 3,
        fill: c.state.value ? "#22c55e" : "#ef4444"
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

      swG.addEventListener("mousedown", (e) => {
        e.stopPropagation();
        c.state.value = c.state.value ? 0 : 1;
        runSimulation();
      });

      g.appendChild(swG);

      const termX = c.x + boxW / 2 + 25;
      g.appendChild(createSVGElement("line", { x1: c.x + boxW / 2, y1: c.y, x2: termX, y2: c.y, stroke: "#a00000", "stroke-width": 1.5 }));
      g.appendChild(createPinTerminalGroup(c.id, 1, termX, c.y));

      const refT = createSVGElement("text", { x: c.x, y: c.y - boxH / 2 - 6, "text-anchor": "middle", fill: "#cc0000", "font-family": "DM Mono", "font-weight": "bold", "font-size": 11, "pointer-events": "none" });
      refT.textContent = c.ref;
      g.appendChild(refT);

    } else if (c.type === "LED") {
      const ledR = 18;
      const termX = c.x - ledR - 25;
      const initialVal = state.pinVoltages[`${c.id}:1`] || 0;

      const glow = createSVGElement("circle", {
        id: `led-glow-${c.id}`,
        cx: c.x,
        cy: c.y,
        r: 28,
        fill: "#00ff66",
        opacity: initialVal === 1 ? "0.95" : "0.0",
        class: "led-glow",
        filter: "blur(6px)"
      });
      g.appendChild(glow);

      const bulb = createSVGElement("circle", {
        id: `led-core-${c.id}`,
        cx: c.x,
        cy: c.y,
        r: ledR,
        fill: initialVal === 1 ? "#00ff66" : "#1e3a24",
        stroke: "#0f172a",
        "stroke-width": 2
      });
      g.appendChild(bulb);

      g.appendChild(createSVGElement("line", { x1: termX, y1: c.y, x2: c.x - ledR, y2: c.y, stroke: "#a00000", "stroke-width": 1.5 }));
      g.appendChild(createPinTerminalGroup(c.id, 1, termX, c.y));

      const refT = createSVGElement("text", { x: c.x, y: c.y - ledR - 6, "text-anchor": "middle", fill: "#cc0000", "font-family": "DM Mono", "font-weight": "bold", "font-size": 11, "pointer-events": "none" });
      refT.textContent = c.ref;
      g.appendChild(refT);

    } else if (c.type === "PROBE") {
      const boxW = 46;
      const boxH = 34;
      const termX = c.x - boxW / 2 - 25;
      const initialVal = state.pinVoltages[`${c.id}:1`] !== undefined ? state.pinVoltages[`${c.id}:1`] : "-";

      g.appendChild(createSVGElement("rect", {
        x: c.x - boxW / 2,
        y: c.y - boxH / 2,
        width: boxW,
        height: boxH,
        rx: 4,
        fill: "#0f172a",
        stroke: "#38bdf8",
        "stroke-width": 1.5
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

      g.appendChild(createSVGElement("line", { x1: termX, y1: c.y, x2: c.x - boxW / 2, y2: c.y, stroke: "#a00000", "stroke-width": 1.5 }));
      g.appendChild(createPinTerminalGroup(c.id, 1, termX, c.y));

      const refT = createSVGElement("text", { x: c.x, y: c.y - boxH / 2 - 6, "text-anchor": "middle", fill: "#cc0000", "font-family": "DM Mono", "font-weight": "bold", "font-size": 11, "pointer-events": "none" });
      refT.textContent = c.ref;
      g.appendChild(refT);

    } else if (c.type === "CLOCK") {
      const boxW = 54;
      const boxH = 34;
      const termX = c.x + boxW / 2 + 25;

      g.appendChild(createSVGElement("rect", {
        x: c.x - boxW / 2,
        y: c.y - boxH / 2,
        width: boxW,
        height: boxH,
        rx: 4,
        fill: "#312e81",
        stroke: "#6366f1",
        "stroke-width": 1.5
      }));

      g.appendChild(createSVGElement("path", {
        d: `M ${c.x - 14} ${c.y + 6} L ${c.x - 14} ${c.y - 6} L ${c.x} ${c.y - 6} L ${c.x} ${c.y + 6} L ${c.x + 14} ${c.y + 6}`,
        fill: "none",
        stroke: "#a5b4fc",
        "stroke-width": 2,
        "pointer-events": "none"
      }));

      g.appendChild(createSVGElement("line", { x1: c.x + boxW / 2, y1: c.y, x2: termX, y2: c.y, stroke: "#a00000", "stroke-width": 1.5 }));
      g.appendChild(createPinTerminalGroup(c.id, 1, termX, c.y));

      const refT = createSVGElement("text", { x: c.x, y: c.y - boxH / 2 - 6, "text-anchor": "middle", fill: "#cc0000", "font-family": "DM Mono", "font-weight": "bold", "font-size": 11, "pointer-events": "none" });
      refT.textContent = c.ref;
      g.appendChild(refT);
    }
  }

  function renderDiodeSymbol(g, c, spec, dims) {
    const p1 = getPinWorldPos(c, 1);
    const p2 = getPinWorldPos(c, 2);

    g.appendChild(createSVGElement("line", { x1: p1.x, y1: c.y, x2: c.x - 14, y2: c.y, stroke: "#a00000", "stroke-width": 1.5 }));
    g.appendChild(createSVGElement("polygon", { points: `${c.x - 14},${c.y - 14} ${c.x - 14},${c.y + 14} ${c.x + 14},${c.y}`, fill: "#e9bd4f", stroke: "#1e293b", "stroke-width": 1.8 }));
    g.appendChild(createSVGElement("line", { x1: c.x + 14, y1: c.y - 14, x2: c.x + 14, y2: c.y + 14, stroke: "#1e293b", "stroke-width": 2.5 }));
    g.appendChild(createSVGElement("line", { x1: c.x + 14, y1: c.y, x2: p2.x, y2: c.y, stroke: "#a00000", "stroke-width": 1.5 }));

    g.appendChild(createPinTerminalGroup(c.id, 1, p1.x, c.y));
    g.appendChild(createPinTerminalGroup(c.id, 2, p2.x, c.y));

    const refT = createSVGElement("text", { x: c.x, y: c.y - 18, "text-anchor": "middle", fill: "#cc0000", "font-family": "DM Mono", "font-weight": "bold", "font-size": 11, "pointer-events": "none" });
    refT.textContent = c.ref + " 1N4148";
    g.appendChild(refT);
  }

  /**
   * Dual-layer pin terminal:
   * 1. Visual ring
   * 2. Wide, highly responsive hit target (r=15px) for effortless, 100% reliable mouse clicks
   */
  function createPinTerminalGroup(compId, pinNum, x, y) {
    const g = createSVGElement("g", {
      class: "pin-terminal-group",
      "data-comp-id": compId,
      "data-pin-num": pinNum
    });

    // Visual circular terminal ring
    const visual = createSVGElement("circle", {
      cx: x,
      cy: y,
      r: 4.5,
      fill: "#fffdf2",
      stroke: "#a00000",
      "stroke-width": 1.8,
      class: "pin-terminal-visual"
    });

    // Wide transparent hit target (radius 15px) for guaranteed click capture
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

      if (!state.activeWireStart) {
        startWireFromPin(compId, pinNum);
      } else {
        completeWireToPin(compId, pinNum);
      }
    };

    hitArea.addEventListener("mousedown", handlePinActivation);
    hitArea.addEventListener("click", handlePinActivation);

    return g;
  }

  // =========================================================================
  // 10. CANVAS MOUSE & WIRE DRAWING EVENTS
  // =========================================================================
  function onCanvasMouseMove(e) {
    const coords = clientToSvgCoords(e.clientX, e.clientY);
    state.mousePos = coords;

    // Component dragging
    if (state.draggingComp) {
      const gx = Math.round((coords.x - state.dragOffset.x) / 10) * 10;
      const gy = Math.round((coords.y - state.dragOffset.y) / 10) * 10;
      state.draggingComp.x = gx;
      state.draggingComp.y = gy;
      render();
      return;
    }

    // Active wire drawing with magnetic snapping
    if (state.activeWireStart) {
      tempWireLayer.innerHTML = "";

      let targetX = coords.x;
      let targetY = coords.y;

      // Magnetic snap check: Is mouse near any valid pin terminal?
      state.hoveredTargetPin = null;
      document.querySelectorAll(".pin-terminal-group").forEach((el) => {
        el.classList.remove("snap-hover");
      });

      for (const comp of state.components) {
        const spec = LIBRARY[comp.type];
        for (const p of spec.pins) {
          if (comp.id === state.activeWireStart.compId && p.num === state.activeWireStart.pinNum) continue;

          const pPos = getPinWorldPos(comp, p.num);
          const dist = Math.hypot(coords.x - pPos.x, coords.y - pPos.y);
          if (dist < 18) {
            targetX = pPos.x;
            targetY = pPos.y;
            state.hoveredTargetPin = { compId: comp.id, pinNum: p.num };

            const targetEl = document.querySelector(`.pin-terminal-group[data-comp-id="${comp.id}"][data-pin-num="${p.num}"]`);
            targetEl?.classList.add("snap-hover");
            break;
          }
        }
        if (state.hoveredTargetPin) break;
      }

      const pathD = calculateManhattanPath(
        state.activeWireStart.x,
        state.activeWireStart.y,
        targetX,
        targetY
      );

      const tempWire = createSVGElement("path", {
        d: pathD,
        fill: "none",
        stroke: state.hoveredTargetPin ? "#00ff55" : "#2563eb",
        "stroke-width": 3,
        "stroke-dasharray": "6 3",
        opacity: "0.9"
      });
      tempWireLayer.appendChild(tempWire);
    }
  }

  function onCanvasMouseDown(e) {
    if (e.target === svgRoot || e.target.id === "grid-layer") {
      if (state.activeWireStart) {
        // If clicking empty canvas during wire drawing, cancel the wire
        cancelActiveWire();
      } else {
        // Non-destructive deselect (preserves simulation visuals)
        setSelectedItem(null);
      }
    }
  }

  function onCanvasMouseUp() {
    if (state.draggingComp) {
      state.draggingComp = null;
      runSimulation();
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
      const swA = addComponentAt("SWITCH", 220, 260);
      const swB = addComponentAt("SWITCH", 220, 340);
      const ic = addComponentAt("7400", 440, 300);
      const led = addComponentAt("LED", 660, 260);
      const prb = addComponentAt("PROBE", 660, 340);

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
      const swA1 = addComponentAt("SWITCH", 200, 220);
      const swB1 = addComponentAt("SWITCH", 200, 300);
      const swCin = addComponentAt("SWITCH", 200, 380);
      const ic = addComponentAt("7483", 460, 300);
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
