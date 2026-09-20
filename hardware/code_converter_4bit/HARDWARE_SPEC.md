# 4-Bit Universal Digital Logic Code Converter: Hardware Design Specification & KiCad EDA Guide

## Subsystem Overview: 4-Bit Binary to Gray Code Converter
**Project:** Digital Logic Simulation Suite (EDA Subsystem)  
**Document Version:** `1.0.0`  
**EDA Target:** KiCad 7.0 / 8.0 & SKiDL  
**Author:** Hardware & Digital Systems Architecture Group  

---

## 1. Architectural Overview & Boolean Derivation

The 4-bit Binary to Gray code converter converts an input vector $B = [B_3, B_2, B_1, B_0]$ into a reflected Gray code output vector $Y = [Y_3, Y_2, Y_1, Y_0]$. Gray codes ensure that adjacent numerical values differ by exactly one bit, eliminating transient switching errors and bus glitches in physical encoders and asynchronous state machines.

### 1.1 Karnaugh Map (K-Map) Derivations
Using the truth table across the $2^4 = 16$ input states ($0000_2$ to $1111_2$):
- **$Y_3$:** Identical to the MSB:
  $$Y_3 = B_3$$
- **$Y_2$:** SOP groups yield:
  $$Y_2 = B_3 \overline{B_2} + \overline{B_3} B_2 = B_3 \oplus B_2$$
- **$Y_1$:** SOP groups yield:
  $$Y_1 = B_2 \overline{B_1} + \overline{B_2} B_1 = B_2 \oplus B_1$$
- **$Y_0$:** SOP groups yield:
  $$Y_0 = B_1 \overline{B_0} + \overline{B_1} B_0 = B_1 \oplus B_0$$

### 1.2 Truth Table
| Decimal | Binary $(B_3 B_2 B_1 B_0)$ | Gray $(Y_3 Y_2 Y_1 Y_0)$ | Active Gates / Logic Path |
|:---:|:---:|:---:|:---|
| 0 | `0000` | `0000` | Direct Passthrough / All Gates Low |
| 1 | `0001` | `0001` | Gate C Active ($0 \oplus 1 = 1$) |
| 2 | `0010` | `0011` | Gate B ($0 \oplus 1 = 1$), Gate C ($1 \oplus 0 = 1$) |
| 3 | `0011` | `0010` | Gate B Active ($0 \oplus 1 = 1$) |
| 4 | `0100` | `0110` | Gate A ($0 \oplus 1 = 1$), Gate B ($1 \oplus 0 = 1$) |
| 5 | `0101` | `0111` | Gate A ($1$), Gate B ($1$), Gate C ($1$) |
| 6 | `0110` | `0101` | Gate A ($1$), Gate C ($1$) |
| 7 | `0111` | `0100` | Gate A Active ($0 \oplus 1 = 1$) |
| 8 | `1000` | `1100` | $Y_3=1$, Gate A ($1 \oplus 0 = 1$) |
| 9 | `1001` | `1101` | $Y_3=1$, Gate A ($1$), Gate C ($1$) |
| 10 | `1010` | `1111` | $Y_3=1$, Gate A ($1$), Gate B ($1$), Gate C ($1$) |
| 11 | `1011` | `1110` | $Y_3=1$, Gate A ($1$), Gate B ($1$) |
| 12 | `1100` | `1010` | $Y_3=1$, Gate B Active ($1 \oplus 0 = 1$) |
| 13 | `1101` | `1011` | $Y_3=1$, Gate B ($1$), Gate C ($1$) |
| 14 | `1110` | `1001` | $Y_3=1$, Gate C Active ($1 \oplus 0 = 1$) |
| 15 | `1111` | `1000` | $Y_3=1$, All XOR outputs $0$ |

---

## 2. Component Bill of Materials (BOM)

| Item | Reference | Component Name | Description / Logic Role | Package / Footprint | Quantity |
|:---:|:---|:---|:---|:---|:---:|
| 1 | **IC1** | `74HC86` | Quad 2-Input Exclusive-OR Gate (High-Speed CMOS) | DIP-14 (`Package_DIP:DIP-14_W7.62mm`) | 1 |
| 2 | **SW1** | `SW_DIP_x04` | 4-Position Single Pole Single Throw (SPST) Slide Switch | DIP-8 (`Button_Switch_THT:SW_DIP_SPSTx04_Slide_9.78x11.96mm_W7.62mm_P2.54mm`) | 1 |
| 3 | **RN1** | `R_Pack04_SIP` | $4 \times 10\text{k}\Omega$ Resistor Network, Bussed (Star Topology), Pull-down | SIP-5 (`Resistor_THT:R_Array_SIP5`) | 1 |
| 4 | **RN2** | `R_Pack04_SIP` | $4 \times 330\Omega$ Resistor Network, Isolated Topology, LED Current Limiter | SIP-8 (`Resistor_THT:R_Array_SIP8`) | 1 |
| 5 | **D1 - D4** | `LED_Green` | 3mm Green Diffused LEDs ($V_f \approx 2.1\text{V}, I_f \approx 8.8\text{mA}$) | THT Radial (`LED_THT:LED_D3.0mm`) | 4 |
| 6 | **C1, C2** | `0.1uF / 50V` | Multi-Layer Ceramic Decoupling Capacitor (MLCC, X7R) | 0805 SMD / 2.54mm THT (`Capacitor_SMD:C_0805_2012Metric`) | 2 |
| 7 | **J1** | `Screw_Terminal_01x02` | 2-Pin 5.08mm Terminal Block (+5V, GND Power Input) | P5.08mm (`TerminalBlock:TerminalBlock_bornier-2_P5.08mm`) | 1 |
| *(Alt)* | **IC2** | `74HC125` | *(Optional)* Quad Non-Inverting Buffer for $B_3 \rightarrow Y_3$ matched delay | DIP-14 | *(Alt)* |

---

## SECTION A: Netlist & Schematic Pin Mapping Matrix

Below is the complete hardware pin connection matrix for physical assembly, schematic capture, and PCB layout verification.

| Net Name | Origin Pin (Source) | Destination Pin(s) (Load) | Net Function & Electrical State |
|:---|:---|:---|:---|
| **`+5V`** | `J1` Pin 1 (VCC In) | - `SW1` Pin 1 (Pole 1)<br>- `SW1` Pin 2 (Pole 2)<br>- `SW1` Pin 3 (Pole 3)<br>- `SW1` Pin 4 (Pole 4)<br>- `IC1` Pin 14 (VCC)<br>- `C1` Pin 1<br>- `C2` Pin 1 | Main +5.0V DC Power Bus |
| **`GND`** | `J1` Pin 2 (GND In) | - `IC1` Pin 7 (GND)<br>- `IC1` Pin 12 (Gate 4 Input 4A)<br>- `IC1` Pin 13 (Gate 4 Input 4B)<br>- `RN1` Pin 1 (Common Pull-down Return)<br>- `D1` Pin 1 (Cathode - Y0)<br>- `D2` Pin 1 (Cathode - Y1)<br>- `D3` Pin 1 (Cathode - Y2)<br>- `D4` Pin 1 (Cathode - Y3)<br>- `C1` Pin 2<br>- `C2` Pin 2 | System Ground Reference Plane (0V) |
| **`Net-B3`** | `SW1` Pin 5 (Output 4) | - `RN1` Pin 5 (10k Pull-down)<br>- `IC1` Pin 1 (Gate 1 Input 1A)<br>- `RN2` Pin 7 (Resistor 4 In for $Y_3$) | Input Bit 3 (MSB). High when SW1-4 closed. |
| **`Net-B2`** | `SW1` Pin 6 (Output 3) | - `RN1` Pin 4 (10k Pull-down)<br>- `IC1` Pin 2 (Gate 1 Input 1B)<br>- `IC1` Pin 4 (Gate 2 Input 2A) | Input Bit 2. Feeds Gate 1 ($Y_2$) and Gate 2 ($Y_1$). |
| **`Net-B1`** | `SW1` Pin 7 (Output 2) | - `RN1` Pin 3 (10k Pull-down)<br>- `IC1` Pin 5 (Gate 2 Input 2B)<br>- `IC1` Pin 9 (Gate 3 Input 3A) | Input Bit 1. Feeds Gate 2 ($Y_1$) and Gate 3 ($Y_0$). |
| **`Net-B0`** | `SW1` Pin 8 (Output 1) | - `RN1` Pin 2 (10k Pull-down)<br>- `IC1` Pin 10 (Gate 3 Input 3B) | Input Bit 0 (LSB). Feeds Gate 3 ($Y_0$). |
| **`Net-Y2`** | `IC1` Pin 3 (Gate 1 Output 1Y) | - `RN2` Pin 5 (Resistor 3 In) | Gray Bit 2 Result: $B_3 \oplus B_2$ |
| **`Net-Y1`** | `IC1` Pin 6 (Gate 2 Output 2Y) | - `RN2` Pin 3 (Resistor 2 In) | Gray Bit 1 Result: $B_2 \oplus B_1$ |
| **`Net-Y0`** | `IC1` Pin 8 (Gate 3 Output 3Y) | - `RN2` Pin 1 (Resistor 1 In) | Gray Bit 0 Result: $B_1 \oplus B_0$ |
| **`Net-D4-A`**| `RN2` Pin 8 (Resistor 4 Out) | - `D4` Pin 2 (Anode) | Current-limited drive for $Y_3$ LED |
| **`Net-D3-A`**| `RN2` Pin 6 (Resistor 3 Out) | - `D3` Pin 2 (Anode) | Current-limited drive for $Y_2$ LED |
| **`Net-D2-A`**| `RN2` Pin 4 (Resistor 2 Out) | - `D2` Pin 2 (Anode) | Current-limited drive for $Y_1$ LED |
| **`Net-D1-A`**| `RN2` Pin 2 (Resistor 1 Out) | - `D1` Pin 2 (Anode) | Current-limited drive for $Y_0$ LED |
| **`NC`** | `IC1` Pin 11 (Gate 4 Output 4Y) | *Unconnected* | Gate 4 Unused Output (No-Connect) |

> [!IMPORTANT]
> **CMOS Input Termination Rule:** Pins 12 (4A) and 13 (4B) of `IC1` **MUST** be connected to `GND`. Leaving CMOS high-impedance inputs floating will cause high $dI/dt$ parasitic switching, shoot-through supply current, and internal thermal runaway. Pin 11 (output) is left floating.

---

## SECTION B: SKiDL / Python Automation Script

The automated EDA schematic generation script is located at:
[`hardware/code_converter_4bit/generate_schematic.py`](file:///c:/Users/Shardul/OneDrive/Documents/GitHub/logic_sim_suite/hardware/code_converter_4bit/generate_schematic.py)

### Running the Generator:
```bash
# Run standalone (synthesizes native KiCad 7/8 .kicad_sch & .net)
python hardware/code_converter_4bit/generate_schematic.py

# Or with SKiDL installed:
pip install skidl
python hardware/code_converter_4bit/generate_schematic.py
```

### Key Electrical Rules Check (ERC) Protections Implemented:
1. **Power Rail Definition (`PWR_FLAG`):** In KiCad and SKiDL, terminal blocks and passive connectors output passive pins. Attaching `PWR_FLAG` informs the ERC compiler that `+5V` and `GND` are externally supplied, preventing *Pin not driven* errors.
2. **Drive Contention Prevention:** Each output node ($Y_3, Y_2, Y_1, Y_0$) is strictly driven by one source (either a gate output or input pole), preventing multi-driver bus contention.
3. **Floating Pin Elimination:** All unused input pins on multi-unit ICs are properly tied to `GND`.

---

## SECTION C: KiCad Design Rules & PCB Layout Guidelines

### 1. Design Rules & Clearance Constraints
Configure the following in KiCad **Board Setup -> Design Rules -> Net Classes**:

| Constraint Parameter | Net Class: Default (Signal) | Net Class: Power (`+5V`, `GND`) | Rationale / Standard |
|:---|:---:|:---:|:---|
| **Conductor Width** | $0.254\text{ mm}$ ($10\text{ mil}$) | $0.508\text{ mm}$ ($20\text{ mil}$) | Power rail impedance reduction; $0.5\text{mm}$ handles up to $1.2\text{A}$ at $10^\circ\text{C}$ rise (IPC-2152). |
| **Clearance (Trace-to-Trace)** | $0.200\text{ mm}$ ($8\text{ mil}$) | $0.254\text{ mm}$ ($10\text{ mil}$) | Prevents solder bridging during reflow/wave soldering. Standard low-cost fab capable. |
| **Clearance (Trace-to-Pad)** | $0.200\text{ mm}$ ($8\text{ mil}$) | $0.254\text{ mm}$ ($10\text{ mil}$) | High manufacturing yield margin. |
| **Via Diameter / Hole Size** | $0.80\text{ mm} / 0.40\text{ mm}$ | $1.00\text{ mm} / 0.60\text{ mm}$ | Low parasitic inductance via transitions. |
| **Board Edge Clearance** | $0.500\text{ mm}$ ($20\text{ mil}$) | $0.500\text{ mm}$ ($20\text{ mil}$) | Prevents copper exposure during V-scoring or routing. |

---

### 2. Recommended 2-Layer PCB Stackup & Layout Hierarchy

```
+-------------------------------------------------------------------------+
| Layer 1 (Top / F.Cu): Component Placement, Horizontal Signal Routing    |
| FR-4 Dielectric Core: 1.6 mm Thickness, Er = 4.5, 1.0 oz Copper (35 um) |
| Layer 2 (Bottom / B.Cu): Continuous, Unbroken Solid GND Copper Zone     |
+-------------------------------------------------------------------------+
```

#### Layer Assignment Strategy:
- **Top Layer (`F.Cu`):**
  - Place all active and passive components (`IC1`, `SW1`, `RN1`, `RN2`, `D1-D4`, `J1`, `C1`, `C2`).
  - Route digital input buses $B_3 \dots B_0$ and output buses $Y_3 \dots Y_0$.
  - Keep signal traces short, direct, and orthogonal to avoid crosstalk.
- **Bottom Layer (`B.Cu`):**
  - Devoted entirely as a **Solid Ground Plane (`GND`)**.
  - No signal routing on `B.Cu` unless strictly necessary for brief jumpers (< 5mm). Every track cut through the ground plane breaks return current paths and elevates loop inductance.

---

### 3. Critical Component Placement & Routing Directives

#### A. Decoupling Capacitor Strategy
- Place capacitor `C1` directly adjacent to Pin 14 of `IC1` (< 3mm distance).
- Connect `C1` Pin 1 (VCC) directly to IC1 Pin 14 before routing to the main 5V rail.
- Ground pad of `C1` must drop immediately into the bottom ground plane with a dedicated via placed as close as possible to the pad.
- **Loop Inductance Formula:** $V_{noise} = L \cdot \frac{di}{dt}$. Minimizing the trace loop area between Pin 14, `C1`, and Pin 7 suppresses high-frequency rail bounce during simultaneous output switching.

#### B. Component Layout Flow
Arrange the PCB in a left-to-right logical flow matching schematic signal progression:
1. **Left Edge:** Power Terminal `J1` & DIP Switch `SW1`.
2. **Left-Center:** Resistor Network `RN1` (Pull-downs).
3. **Center:** Logic IC `IC1` (`74HC86`) with decoupling cap `C1` nested above Pin 14.
4. **Right-Center:** Current Limiting Resistor Network `RN2`.
5. **Right Edge:** Output Indicator LEDs `D4 (Y3)`, `D3 (Y2)`, `D2 (Y1)`, `D1 (Y0)`.

#### C. Silkscreen & DFM Guidelines
- Clearly label DIP switch positions: `1: B0`, `2: B1`, `3: B2`, `4: B3`.
- Clearly label Output LEDs: `Y3 (MSB)`, `Y2`, `Y1`, `Y0 (LSB)`.
- Mark polarity clearly: `+5V` / `GND` at terminal block `J1`, and cathode flat edge/bar for `D1-D4`.
- Provide at least 4x M3 mounting holes ($3.2\text{mm}$ unplated or plated with ground pads) at board corners.
