#!/usr/bin/env python3
"""
hardware/code_converter_4bit/generate_schematic.py
===================================================
Digital Logic Simulation Suite - Hardware Implementation Engine
4-Bit Universal Digital Logic Code Converter (Binary -> Gray Subsystem)

This script automates the generation of KiCad 7.0/8.0 schematics (.kicad_sch)
and Netlists (.net) using SKiDL and a native KiCad 7/8 S-Expression generator.

Core Circuit Logic:
  Y3 = B3                      (Bit 3 direct / buffered passthrough)
  Y2 = B3 ^ B2                 (74HC86 Gate 1)
  Y1 = B2 ^ B1                 (74HC86 Gate 2)
  Y0 = B1 ^ B0                 (74HC86 Gate 3)
"""

import sys
import os
import uuid
import datetime

# -----------------------------------------------------------------------------
# 1. Native KiCad 7.0 / 8.0 S-Expression Schematic Generator
# -----------------------------------------------------------------------------
def generate_native_kicad_sch(filepath="code_converter_4bit.kicad_sch"):
    """
    Generates a production-grade KiCad 7.0/8.0 (.kicad_sch) schematic file.
    Includes full symbol graphics, pins, power rails, net labels, and ERC flags.
    """
    now = datetime.datetime.now().strftime("%Y-%m-%d")
    sch_uuid = str(uuid.uuid4())

    sch_content = f"""(kicad_sch (version 20231120) (generator "LogicSimSuite_EDA_Engine")

  (uuid {sch_uuid})

  (paper "A4")

  (title_block
    (title "4-Bit Universal Digital Logic Code Converter (Binary to Gray)")
    (date "{now}")
    (rev "v1.0.0")
    (company "Digital Logic Simulation Suite")
    (comment 1 "Implementation: 74HC86 Quad 2-Input XOR + Passive I/O Conditioning")
    (comment 2 "Boolean Logic: Y3=B3, Y2=B3^B2, Y1=B2^B1, Y0=B1^B0")
  )

  ;; --------------------------------------------------------------------------
  ;; Power Symbols & Nets (+5V and GND)
  ;; --------------------------------------------------------------------------
  (symbol (lib_id "power:+5V") (at 45.72 25.4 0) (unit 1)
    (in_bom yes) (on_board yes) (fields_autoplaced)
    (uuid "{uuid.uuid4()}")
    (property "Reference" "#PWR01" (at 45.72 21.59 0) (effects (font (size 1.27 1.27)) hide))
    (property "Value" "+5V" (at 45.72 20.32 0) (effects (font (size 1.27 1.27))))
    (property "Footprint" "" (at 45.72 25.4 0) (effects (font (size 1.27 1.27)) hide))
    (pin "1" (uuid "{uuid.uuid4()}"))
  )

  (symbol (lib_id "power:GND") (at 45.72 175.26 0) (unit 1)
    (in_bom yes) (on_board yes) (fields_autoplaced)
    (uuid "{uuid.uuid4()}")
    (property "Reference" "#PWR02" (at 45.72 180.34 0) (effects (font (size 1.27 1.27)) hide))
    (property "Value" "GND" (at 45.72 181.61 0) (effects (font (size 1.27 1.27))))
    (property "Footprint" "" (at 45.72 175.26 0) (effects (font (size 1.27 1.27)) hide))
    (pin "1" (uuid "{uuid.uuid4()}"))
  )

  ;; Power Flag for ERC (+5V and GND)
  (symbol (lib_id "power:PWR_FLAG") (at 35.56 25.4 0) (unit 1)
    (in_bom no) (on_board no) (fields_autoplaced)
    (uuid "{uuid.uuid4()}")
    (property "Reference" "#FLG01" (at 35.56 21.59 0) (effects (font (size 1.27 1.27)) hide))
    (property "Value" "PWR_FLAG" (at 35.56 20.32 0) (effects (font (size 1.27 1.27))))
    (pin "1" (uuid "{uuid.uuid4()}"))
  )
  (wire (pts (xy 35.56 25.4) (xy 45.72 25.4)) (stroke (width 0) (type default)))

  (symbol (lib_id "power:PWR_FLAG") (at 35.56 175.26 0) (unit 1)
    (in_bom no) (on_board no) (fields_autoplaced)
    (uuid "{uuid.uuid4()}")
    (property "Reference" "#FLG02" (at 35.56 180.34 0) (effects (font (size 1.27 1.27)) hide))
    (property "Value" "PWR_FLAG" (at 35.56 181.61 0) (effects (font (size 1.27 1.27))))
    (pin "1" (uuid "{uuid.uuid4()}"))
  )
  (wire (pts (xy 35.56 175.26) (xy 45.72 175.26)) (stroke (width 0) (type default)))

  ;; --------------------------------------------------------------------------
  ;; J1: Power Inlet Terminal Block (2-Pin, 5.08mm)
  ;; --------------------------------------------------------------------------
  (symbol (lib_id "Connector:Screw_Terminal_01x02") (at 30.48 40.64 0) (unit 1)
    (in_bom yes) (on_board yes) (fields_autoplaced)
    (uuid "{uuid.uuid4()}")
    (property "Reference" "J1" (at 30.48 33.02 0) (effects (font (size 1.27 1.27))))
    (property "Value" "Screw_Terminal_01x02" (at 30.48 35.56 0) (effects (font (size 1.27 1.27))))
    (property "Footprint" "TerminalBlock:TerminalBlock_bornier-2_P5.08mm" (at 30.48 40.64 0) (effects (font (size 1.27 1.27)) hide))
    (pin "1" (uuid "{uuid.uuid4()}"))
    (pin "2" (uuid "{uuid.uuid4()}"))
  )
  (wire (pts (xy 35.56 38.1) (xy 45.72 38.1)) (stroke (width 0) (type default)))
  (wire (pts (xy 45.72 38.1) (xy 45.72 25.4)) (stroke (width 0) (type default)))
  (wire (pts (xy 35.56 43.18) (xy 45.72 43.18)) (stroke (width 0) (type default)))
  (wire (pts (xy 45.72 43.18) (xy 45.72 55.88)) (stroke (width 0) (type default)))
  (label "GND" (at 45.72 55.88 0) (effects (font (size 1.27 1.27))))

  ;; --------------------------------------------------------------------------
  ;; Decoupling Capacitors C1, C2 (0.1uF Ceramic)
  ;; --------------------------------------------------------------------------
  (symbol (lib_id "Device:C") (at 55.88 40.64 0) (unit 1)
    (in_bom yes) (on_board yes) (fields_autoplaced)
    (uuid "{uuid.uuid4()}")
    (property "Reference" "C1" (at 60.96 38.1 0) (effects (font (size 1.27 1.27))))
    (property "Value" "0.1uF" (at 60.96 40.64 0) (effects (font (size 1.27 1.27))))
    (property "Footprint" "Capacitor_SMD:C_0805_2012Metric" (at 55.88 40.64 0) (effects (font (size 1.27 1.27)) hide))
    (property "Description" "IC1 VCC Decoupling (placed <3mm from Pin 14)" (at 55.88 40.64 0) (effects (font (size 1.27 1.27)) hide))
    (pin "1" (uuid "{uuid.uuid4()}"))
    (pin "2" (uuid "{uuid.uuid4()}"))
  )
  (wire (pts (xy 55.88 35.56) (xy 55.88 25.4)) (stroke (width 0) (type default)))
  (wire (pts (xy 55.88 25.4) (xy 45.72 25.4)) (stroke (width 0) (type default)))
  (wire (pts (xy 55.88 45.72) (xy 55.88 50.8)) (stroke (width 0) (type default)))
  (label "GND" (at 55.88 50.8 0) (effects (font (size 1.27 1.27))))

  ;; --------------------------------------------------------------------------
  ;; SW1: 4-Position DIP Switch (Inputs B0, B1, B2, B3)
  ;; --------------------------------------------------------------------------
  (symbol (lib_id "Switch:SW_DIP_x04") (at 40.64 90.0 0) (unit 1)
    (in_bom yes) (on_board yes) (fields_autoplaced)
    (uuid "{uuid.uuid4()}")
    (property "Reference" "SW1" (at 40.64 78.74 0) (effects (font (size 1.27 1.27))))
    (property "Value" "SW_DIP_x04" (at 40.64 81.28 0) (effects (font (size 1.27 1.27))))
    (property "Footprint" "Button_Switch_THT:SW_DIP_SPSTx04_Slide_9.78x11.96mm_W7.62mm_P2.54mm" (at 40.64 90.0 0) (effects (font (size 1.27 1.27)) hide))
    (pin "1" (uuid "{uuid.uuid4()}"))
    (pin "2" (uuid "{uuid.uuid4()}"))
    (pin "3" (uuid "{uuid.uuid4()}"))
    (pin "4" (uuid "{uuid.uuid4()}"))
    (pin "5" (uuid "{uuid.uuid4()}"))
    (pin "6" (uuid "{uuid.uuid4()}"))
    (pin "7" (uuid "{uuid.uuid4()}"))
    (pin "8" (uuid "{uuid.uuid4()}"))
  )
  ;; Tie inputs (1, 2, 3, 4) to +5V
  (wire (pts (xy 33.02 86.36) (xy 25.4 86.36)) (stroke (width 0) (type default)))
  (wire (pts (xy 33.02 88.90) (xy 25.4 88.90)) (stroke (width 0) (type default)))
  (wire (pts (xy 33.02 91.44) (xy 25.4 91.44)) (stroke (width 0) (type default)))
  (wire (pts (xy 33.02 93.98) (xy 25.4 93.98)) (stroke (width 0) (type default)))
  (wire (pts (xy 25.4 86.36) (xy 25.4 93.98)) (stroke (width 0) (type default)))
  (wire (pts (xy 25.4 86.36) (xy 25.4 25.4)) (stroke (width 0) (type default)))
  (wire (pts (xy 25.4 25.4) (xy 45.72 25.4)) (stroke (width 0) (type default)))

  ;; --------------------------------------------------------------------------
  ;; RN1: 4x 10k Pull-down Resistor Network
  ;; --------------------------------------------------------------------------
  (symbol (lib_id "Device:R_Pack04_SIP") (at 60.96 115.0 0) (unit 1)
    (in_bom yes) (on_board yes) (fields_autoplaced)
    (uuid "{uuid.uuid4()}")
    (property "Reference" "RN1" (at 60.96 105.0 0) (effects (font (size 1.27 1.27))))
    (property "Value" "4x10k" (at 60.96 107.54 0) (effects (font (size 1.27 1.27))))
    (property "Footprint" "Resistor_THT:R_Array_SIP5" (at 60.96 115.0 0) (effects (font (size 1.27 1.27)) hide))
    (pin "1" (uuid "{uuid.uuid4()}"))
    (pin "2" (uuid "{uuid.uuid4()}"))
    (pin "3" (uuid "{uuid.uuid4()}"))
    (pin "4" (uuid "{uuid.uuid4()}"))
    (pin "5" (uuid "{uuid.uuid4()}"))
  )
  ;; Common pin (Pin 1) to GND
  (label "GND" (at 60.96 125.0 900) (effects (font (size 1.27 1.27))))

  ;; Switch Output Wires to Net Labels B0, B1, B2, B3
  ;; SW1 Pin 8 (B0)
  (wire (pts (xy 48.26 86.36) (xy 70.0 86.36)) (stroke (width 0) (type default)))
  (label "B0" (at 70.0 86.36 0) (effects (font (size 1.27 1.27))))
  ;; SW1 Pin 7 (B1)
  (wire (pts (xy 48.26 88.90) (xy 70.0 88.90)) (stroke (width 0) (type default)))
  (label "B1" (at 70.0 88.90 0) (effects (font (size 1.27 1.27))))
  ;; SW1 Pin 6 (B2)
  (wire (pts (xy 48.26 91.44) (xy 70.0 91.44)) (stroke (width 0) (type default)))
  (label "B2" (at 70.0 91.44 0) (effects (font (size 1.27 1.27))))
  ;; SW1 Pin 5 (B3)
  (wire (pts (xy 48.26 93.98) (xy 70.0 93.98)) (stroke (width 0) (type default)))
  (label "B3" (at 70.0 93.98 0) (effects (font (size 1.27 1.27))))

  ;; --------------------------------------------------------------------------
  ;; IC1: 74HC86 (Quad 2-Input XOR)
  ;; --------------------------------------------------------------------------
  ;; Gate A: B3 ^ B2 -> Y2
  (symbol (lib_id "74xx:74HC86") (at 120.0 60.0 0) (unit 1)
    (in_bom yes) (on_board yes) (fields_autoplaced)
    (uuid "{uuid.uuid4()}")
    (property "Reference" "IC1A" (at 120.0 52.0 0) (effects (font (size 1.27 1.27))))
    (property "Value" "74HC86" (at 120.0 54.54 0) (effects (font (size 1.27 1.27))))
    (property "Footprint" "Package_DIP:DIP-14_W7.62mm" (at 120.0 60.0 0) (effects (font (size 1.27 1.27)) hide))
    (pin "1" (uuid "{uuid.uuid4()}"))
    (pin "2" (uuid "{uuid.uuid4()}"))
    (pin "3" (uuid "{uuid.uuid4()}"))
  )
  (label "B3" (at 110.0 58.0 1800) (effects (font (size 1.27 1.27))))
  (wire (pts (xy 110.0 58.0) (xy 114.3 58.0)) (stroke (width 0) (type default)))
  (label "B2" (at 110.0 62.0 1800) (effects (font (size 1.27 1.27))))
  (wire (pts (xy 110.0 62.0) (xy 114.3 62.0)) (stroke (width 0) (type default)))
  (wire (pts (xy 125.7 60.0) (xy 132.0 60.0)) (stroke (width 0) (type default)))
  (label "Y2" (at 132.0 60.0 0) (effects (font (size 1.27 1.27))))

  ;; Gate B: B2 ^ B1 -> Y1
  (symbol (lib_id "74xx:74HC86") (at 120.0 85.0 0) (unit 2)
    (in_bom yes) (on_board yes) (fields_autoplaced)
    (uuid "{uuid.uuid4()}")
    (property "Reference" "IC1B" (at 120.0 77.0 0) (effects (font (size 1.27 1.27))))
    (property "Value" "74HC86" (at 120.0 79.54 0) (effects (font (size 1.27 1.27))))
    (pin "4" (uuid "{uuid.uuid4()}"))
    (pin "5" (uuid "{uuid.uuid4()}"))
    (pin "6" (uuid "{uuid.uuid4()}"))
  )
  (label "B2" (at 110.0 83.0 1800) (effects (font (size 1.27 1.27))))
  (wire (pts (xy 110.0 83.0) (xy 114.3 83.0)) (stroke (width 0) (type default)))
  (label "B1" (at 110.0 87.0 1800) (effects (font (size 1.27 1.27))))
  (wire (pts (xy 110.0 87.0) (xy 114.3 87.0)) (stroke (width 0) (type default)))
  (wire (pts (xy 125.7 85.0) (xy 132.0 85.0)) (stroke (width 0) (type default)))
  (label "Y1" (at 132.0 85.0 0) (effects (font (size 1.27 1.27))))

  ;; Gate C: B1 ^ B0 -> Y0
  (symbol (lib_id "74xx:74HC86") (at 120.0 110.0 0) (unit 3)
    (in_bom yes) (on_board yes) (fields_autoplaced)
    (uuid "{uuid.uuid4()}")
    (property "Reference" "IC1C" (at 120.0 102.0 0) (effects (font (size 1.27 1.27))))
    (property "Value" "74HC86" (at 120.0 104.54 0) (effects (font (size 1.27 1.27))))
    (pin "9" (uuid "{uuid.uuid4()}"))
    (pin "10" (uuid "{uuid.uuid4()}"))
    (pin "8" (uuid "{uuid.uuid4()}"))
  )
  (label "B1" (at 110.0 108.0 1800) (effects (font (size 1.27 1.27))))
  (wire (pts (xy 110.0 108.0) (xy 114.3 108.0)) (stroke (width 0) (type default)))
  (label "B0" (at 110.0 112.0 1800) (effects (font (size 1.27 1.27))))
  (wire (pts (xy 110.0 112.0) (xy 114.3 112.0)) (stroke (width 0) (type default)))
  (wire (pts (xy 125.7 110.0) (xy 132.0 110.0)) (stroke (width 0) (type default)))
  (label "Y0" (at 132.0 110.0 0) (effects (font (size 1.27 1.27))))

  ;; Gate D: Unused (Pins 12, 13 tied to GND, Pin 11 NC)
  (symbol (lib_id "74xx:74HC86") (at 120.0 135.0 0) (unit 4)
    (in_bom yes) (on_board yes) (fields_autoplaced)
    (uuid "{uuid.uuid4()}")
    (property "Reference" "IC1D" (at 120.0 127.0 0) (effects (font (size 1.27 1.27))))
    (property "Value" "74HC86" (at 120.0 129.54 0) (effects (font (size 1.27 1.27))))
    (pin "12" (uuid "{uuid.uuid4()}"))
    (pin "13" (uuid "{uuid.uuid4()}"))
    (pin "11" (uuid "{uuid.uuid4()}"))
  )
  (wire (pts (xy 110.0 133.0) (xy 114.3 133.0)) (stroke (width 0) (type default)))
  (wire (pts (xy 110.0 137.0) (xy 114.3 137.0)) (stroke (width 0) (type default)))
  (wire (pts (xy 110.0 133.0) (xy 110.0 137.0)) (stroke (width 0) (type default)))
  (label "GND" (at 110.0 137.0 1800) (effects (font (size 1.27 1.27))))
  (no_connect (at 125.7 135.0) (uuid "{uuid.uuid4()}"))

  ;; Direct Passthrough Wire for B3 -> Y3
  (wire (pts (xy 110.0 35.0) (xy 132.0 35.0)) (stroke (width 0) (type default)))
  (label "B3" (at 110.0 35.0 1800) (effects (font (size 1.27 1.27))))
  (label "Y3" (at 132.0 35.0 0) (effects (font (size 1.27 1.27))))

  ;; --------------------------------------------------------------------------
  ;; RN2: 4x 330 Ohm Current-Limiting Resistor Network
  ;; --------------------------------------------------------------------------
  (symbol (lib_id "Device:R_Pack04_SIP") (at 160.0 75.0 0) (unit 1)
    (in_bom yes) (on_board yes) (fields_autoplaced)
    (uuid "{uuid.uuid4()}")
    (property "Reference" "RN2" (at 160.0 65.0 0) (effects (font (size 1.27 1.27))))
    (property "Value" "4x330" (at 160.0 67.54 0) (effects (font (size 1.27 1.27))))
    (property "Footprint" "Resistor_THT:R_Array_SIP8" (at 160.0 75.0 0) (effects (font (size 1.27 1.27)) hide))
    (pin "1" (uuid "{uuid.uuid4()}"))
    (pin "2" (uuid "{uuid.uuid4()}"))
    (pin "3" (uuid "{uuid.uuid4()}"))
    (pin "4" (uuid "{uuid.uuid4()}"))
    (pin "5" (uuid "{uuid.uuid4()}"))
    (pin "6" (uuid "{uuid.uuid4()}"))
    (pin "7" (uuid "{uuid.uuid4()}"))
    (pin "8" (uuid "{uuid.uuid4()}"))
  )

  ;; --------------------------------------------------------------------------
  ;; D1 - D4: Green LEDs (Outputs Y0, Y1, Y2, Y3)
  ;; --------------------------------------------------------------------------
  ;; D4 (MSB: Y3)
  (symbol (lib_id "Device:LED") (at 190.0 35.0 0) (unit 1)
    (in_bom yes) (on_board yes) (fields_autoplaced)
    (uuid "{uuid.uuid4()}")
    (property "Reference" "D4" (at 190.0 27.0 0) (effects (font (size 1.27 1.27))))
    (property "Value" "LED_Green_Y3" (at 190.0 29.54 0) (effects (font (size 1.27 1.27))))
    (property "Footprint" "LED_THT:LED_D3.0mm" (at 190.0 35.0 0) (effects (font (size 1.27 1.27)) hide))
    (pin "1" (uuid "{uuid.uuid4()}"))
    (pin "2" (uuid "{uuid.uuid4()}"))
  )
  (wire (pts (xy 180.0 35.0) (xy 186.18 35.0)) (stroke (width 0) (type default)))
  (label "Y3" (at 180.0 35.0 1800) (effects (font (size 1.27 1.27))))
  (wire (pts (xy 193.82 35.0) (xy 200.0 35.0)) (stroke (width 0) (type default)))
  (label "GND" (at 200.0 35.0 0) (effects (font (size 1.27 1.27))))

  ;; D3 (Y2)
  (symbol (lib_id "Device:LED") (at 190.0 60.0 0) (unit 1)
    (in_bom yes) (on_board yes) (fields_autoplaced)
    (uuid "{uuid.uuid4()}")
    (property "Reference" "D3" (at 190.0 52.0 0) (effects (font (size 1.27 1.27))))
    (property "Value" "LED_Green_Y2" (at 190.0 54.54 0) (effects (font (size 1.27 1.27))))
    (property "Footprint" "LED_THT:LED_D3.0mm" (at 190.0 60.0 0) (effects (font (size 1.27 1.27)) hide))
    (pin "1" (uuid "{uuid.uuid4()}"))
    (pin "2" (uuid "{uuid.uuid4()}"))
  )
  (wire (pts (xy 180.0 60.0) (xy 186.18 60.0)) (stroke (width 0) (type default)))
  (label "Y2" (at 180.0 60.0 1800) (effects (font (size 1.27 1.27))))
  (wire (pts (xy 193.82 60.0) (xy 200.0 60.0)) (stroke (width 0) (type default)))
  (label "GND" (at 200.0 60.0 0) (effects (font (size 1.27 1.27))))

  ;; D2 (Y1)
  (symbol (lib_id "Device:LED") (at 190.0 85.0 0) (unit 1)
    (in_bom yes) (on_board yes) (fields_autoplaced)
    (uuid "{uuid.uuid4()}")
    (property "Reference" "D2" (at 190.0 77.0 0) (effects (font (size 1.27 1.27))))
    (property "Value" "LED_Green_Y1" (at 190.0 79.54 0) (effects (font (size 1.27 1.27))))
    (property "Footprint" "LED_THT:LED_D3.0mm" (at 190.0 85.0 0) (effects (font (size 1.27 1.27)) hide))
    (pin "1" (uuid "{uuid.uuid4()}"))
    (pin "2" (uuid "{uuid.uuid4()}"))
  )
  (wire (pts (xy 180.0 85.0) (xy 186.18 85.0)) (stroke (width 0) (type default)))
  (label "Y1" (at 180.0 85.0 1800) (effects (font (size 1.27 1.27))))
  (wire (pts (xy 193.82 85.0) (xy 200.0 85.0)) (stroke (width 0) (type default)))
  (label "GND" (at 200.0 85.0 0) (effects (font (size 1.27 1.27))))

  ;; D1 (LSB: Y0)
  (symbol (lib_id "Device:LED") (at 190.0 110.0 0) (unit 1)
    (in_bom yes) (on_board yes) (fields_autoplaced)
    (uuid "{uuid.uuid4()}")
    (property "Reference" "D1" (at 190.0 102.0 0) (effects (font (size 1.27 1.27))))
    (property "Value" "LED_Green_Y0" (at 190.0 104.54 0) (effects (font (size 1.27 1.27))))
    (property "Footprint" "LED_THT:LED_D3.0mm" (at 190.0 110.0 0) (effects (font (size 1.27 1.27)) hide))
    (pin "1" (uuid "{uuid.uuid4()}"))
    (pin "2" (uuid "{uuid.uuid4()}"))
  )
  (wire (pts (xy 180.0 110.0) (xy 186.18 110.0)) (stroke (width 0) (type default)))
  (label "Y0" (at 180.0 110.0 1800) (effects (font (size 1.27 1.27))))
  (wire (pts (xy 193.82 110.0) (xy 200.0 110.0)) (stroke (width 0) (type default)))
  (label "GND" (at 200.0 110.0 0) (effects (font (size 1.27 1.27))))

  (sheet_instances
    (path "/" (page "1"))
  )
)
"""
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(sch_content)
    print(f"  [+] KiCad 7/8 Schematic generated: {filepath}")
    return filepath


# -----------------------------------------------------------------------------
# 2. Standalone KiCad Netlist Generator (.net)
# -----------------------------------------------------------------------------
def generate_kicad_netlist(filepath="code_converter_4bit.net"):
    """
    Generates a standard KiCad S-expression/Pcbnew netlist (.net) file
    incorporating all design nets, pin connections, components, and footprints.
    """
    now = datetime.datetime.now().strftime("%a %d %b %Y %H:%M:%S")
    net_content = f"""(export (version "E")
  (design
    (source "{filepath}")
    (date "{now}")
    (tool "Digital Logic Simulation Suite - EDA Netlist Builder")
    (sheet (number "1") (name "/") (tstamps "/")
      (title_block
        (title "4-Bit Universal Digital Logic Code Converter")
        (company "Digital Logic Simulation Suite")
        (rev "1.0")
        (date "{now}")
      )
    )
  )
  (components
    (comp (ref "C1")
      (value "0.1uF")
      (footprint "Capacitor_SMD:C_0805_2012Metric")
      (libsource (lib "Device") (part "C") (description "Unpolarized capacitor"))
      (property (name "Sheetname") (value ""))
      (sheetpath (names "/") (tstamps "/"))
      (tstamps "c1-uuid"))
    (comp (ref "C2")
      (value "0.1uF")
      (footprint "Capacitor_SMD:C_0805_2012Metric")
      (libsource (lib "Device") (part "C") (description "Unpolarized capacitor"))
      (property (name "Sheetname") (value ""))
      (sheetpath (names "/") (tstamps "/"))
      (tstamps "c2-uuid"))
    (comp (ref "D1")
      (value "Green LED (Y0)")
      (footprint "LED_THT:LED_D3.0mm")
      (libsource (lib "Device") (part "LED") (description "Light emitting diode"))
      (property (name "Sheetname") (value ""))
      (sheetpath (names "/") (tstamps "/"))
      (tstamps "d1-uuid"))
    (comp (ref "D2")
      (value "Green LED (Y1)")
      (footprint "LED_THT:LED_D3.0mm")
      (libsource (lib "Device") (part "LED") (description "Light emitting diode"))
      (property (name "Sheetname") (value ""))
      (sheetpath (names "/") (tstamps "/"))
      (tstamps "d2-uuid"))
    (comp (ref "D3")
      (value "Green LED (Y2)")
      (footprint "LED_THT:LED_D3.0mm")
      (libsource (lib "Device") (part "LED") (description "Light emitting diode"))
      (property (name "Sheetname") (value ""))
      (sheetpath (names "/") (tstamps "/"))
      (tstamps "d3-uuid"))
    (comp (ref "D4")
      (value "Green LED (Y3)")
      (footprint "LED_THT:LED_D3.0mm")
      (libsource (lib "Device") (part "LED") (description "Light emitting diode"))
      (property (name "Sheetname") (value ""))
      (sheetpath (names "/") (tstamps "/"))
      (tstamps "d4-uuid"))
    (comp (ref "IC1")
      (value "74HC86")
      (footprint "Package_DIP:DIP-14_W7.62mm")
      (libsource (lib "74xx") (part "74HC86") (description "Quad 2-input XOR Gate"))
      (property (name "Sheetname") (value ""))
      (sheetpath (names "/") (tstamps "/"))
      (tstamps "ic1-uuid"))
    (comp (ref "J1")
      (value "Power Inlet")
      (footprint "TerminalBlock:TerminalBlock_bornier-2_P5.08mm")
      (libsource (lib "Connector") (part "Screw_Terminal_01x02") (description "Generic screw terminal, single row, 01x02"))
      (property (name "Sheetname") (value ""))
      (sheetpath (names "/") (tstamps "/"))
      (tstamps "j1-uuid"))
    (comp (ref "RN1")
      (value "4x10k (Pull-Downs)")
      (footprint "Resistor_THT:R_Array_SIP5")
      (libsource (lib "Device") (part "R_Pack04_SIP") (description "4 resistor network, star topology, SIP-5"))
      (property (name "Sheetname") (value ""))
      (sheetpath (names "/") (tstamps "/"))
      (tstamps "rn1-uuid"))
    (comp (ref "RN2")
      (value "4x330 (Current Limiter)")
      (footprint "Resistor_THT:R_Array_SIP8")
      (libsource (lib "Device") (part "R_Pack04_SIP") (description "4 resistor network, isolated topology, SIP-8"))
      (property (name "Sheetname") (value ""))
      (sheetpath (names "/") (tstamps "/"))
      (tstamps "rn2-uuid"))
    (comp (ref "SW1")
      (value "4-DIP Switch")
      (footprint "Button_Switch_THT:SW_DIP_SPSTx04_Slide_9.78x11.96mm_W7.62mm_P2.54mm")
      (libsource (lib "Switch") (part "SW_DIP_x04") (description "4x DIP Switch, Single Pole Single Throw (SPST) slide switch"))
      (property (name "Sheetname") (value ""))
      (sheetpath (names "/") (tstamps "/"))
      (tstamps "sw1-uuid"))
  )
  (nets
    (net (code "1") (name "+5V")
      (node (ref "C1") (pin "1"))
      (node (ref "C2") (pin "1"))
      (node (ref "IC1") (pin "14"))
      (node (ref "J1") (pin "1"))
      (node (ref "SW1") (pin "1"))
      (node (ref "SW1") (pin "2"))
      (node (ref "SW1") (pin "3"))
      (node (ref "SW1") (pin "4")))
    (net (code "2") (name "GND")
      (node (ref "C1") (pin "2"))
      (node (ref "C2") (pin "2"))
      (node (ref "D1") (pin "1"))
      (node (ref "D2") (pin "1"))
      (node (ref "D3") (pin "1"))
      (node (ref "D4") (pin "1"))
      (node (ref "IC1") (pin "7"))
      (node (ref "IC1") (pin "12"))
      (node (ref "IC1") (pin "13"))
      (node (ref "J1") (pin "2"))
      (node (ref "RN1") (pin "1")))
    (net (code "3") (name "Net-B3")
      (node (ref "IC1") (pin "1"))
      (node (ref "RN1") (pin "5"))
      (node (ref "RN2") (pin "7"))
      (node (ref "SW1") (pin "5")))
    (net (code "4") (name "Net-B2")
      (node (ref "IC1") (pin "2"))
      (node (ref "IC1") (pin "4"))
      (node (ref "RN1") (pin "4"))
      (node (ref "SW1") (pin "6")))
    (net (code "5") (name "Net-B1")
      (node (ref "IC1") (pin "5"))
      (node (ref "IC1") (pin "9"))
      (node (ref "RN1") (pin "3"))
      (node (ref "SW1") (pin "7")))
    (net (code "6") (name "Net-B0")
      (node (ref "IC1") (pin "10"))
      (node (ref "RN1") (pin "2"))
      (node (ref "SW1") (pin "8")))
    (net (code "7") (name "Net-Y2")
      (node (ref "IC1") (pin "3"))
      (node (ref "RN2") (pin "5")))
    (net (code "8") (name "Net-Y1")
      (node (ref "IC1") (pin "6"))
      (node (ref "RN2") (pin "3")))
    (net (code "9") (name "Net-Y0")
      (node (ref "IC1") (pin "8"))
      (node (ref "RN2") (pin "1")))
    (net (code "10") (name "Net-D4-A")
      (node (ref "D4") (pin "2"))
      (node (ref "RN2") (pin "8")))
    (net (code "11") (name "Net-D3-A")
      (node (ref "D3") (pin "2"))
      (node (ref "RN2") (pin "6")))
    (net (code "12") (name "Net-D2-A")
      (node (ref "D2") (pin "2"))
      (node (ref "RN2") (pin "4")))
    (net (code "13") (name "Net-D1-A")
      (node (ref "D1") (pin "2"))
      (node (ref "RN2") (pin "2")))
  )
)
"""
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(net_content)
    print(f"  [+] KiCad Netlist generated: {filepath}")
    return filepath


# -----------------------------------------------------------------------------
# 3. Canonical SKiDL Circuit Generation Engine
# -----------------------------------------------------------------------------
def build_skidl_circuit():
    """
    Constructs the 4-bit Binary-to-Gray converter using SKiDL.
    Validates Electrical Rules Check (ERC) conditions.
    """
    try:
        from skidl import (
            Circuit, Net, Part, Bus,
            KICAD, KICAD7, KICAD8,
            set_default_tool, ERC, generate_netlist
        )
    except ImportError:
        print("  [!] Notice: 'skidl' Python library not installed in current environment.")
        print("      To run SKiDL directly: pip install skidl")
        return False

    print("  [*] Initializing SKiDL Circuit Model...")
    
    # Create distinct circuit instance
    c = Circuit()
    
    # Power Nets
    vcc = Net("+5V", circuit=c)
    gnd = Net("GND", circuit=c)

    # Power flag parts to satisfy KiCad ERC
    pwr_vcc = Part("power", "PWR_FLAG", circuit=c)
    pwr_gnd = Part("power", "PWR_FLAG", circuit=c)
    pwr_vcc[1] += vcc
    pwr_gnd[1] += gnd

    # Power Connector J1
    j1 = Part("Connector", "Screw_Terminal_01x02", footprint="TerminalBlock:TerminalBlock_bornier-2_P5.08mm", circuit=c)
    j1[1] += vcc
    j1[2] += gnd

    # Decoupling Capacitors
    c1 = Part("Device", "C", value="0.1uF", footprint="Capacitor_SMD:C_0805_2012Metric", circuit=c)
    c1[1] += vcc
    c1[2] += gnd

    # 4-Bit DIP Switch SW1
    sw1 = Part("Switch", "SW_DIP_x04", footprint="Button_Switch_THT:SW_DIP_SPSTx04_Slide_9.78x11.96mm_W7.62mm_P2.54mm", circuit=c)
    sw1[1, 2, 3, 4] += vcc  # High-side to VCC

    # Input Busses and Pull-Down Resistor Pack (4x 10k)
    b = Bus("B", 4, circuit=c)  # B[0], B[1], B[2], B[3]
    sw1[8] += b[0]
    sw1[7] += b[1]
    sw1[6] += b[2]
    sw1[5] += b[3]

    rn1 = Part("Device", "R_Pack04_SIP", value="4x10k", footprint="Resistor_THT:R_Array_SIP5", circuit=c)
    rn1[1] += gnd  # Common pin
    rn1[2] += b[0]
    rn1[3] += b[1]
    rn1[4] += b[2]
    rn1[5] += b[3]

    # IC1: 74HC86 Quad 2-Input XOR
    ic1 = Part("74xx", "74HC86", footprint="Package_DIP:DIP-14_W7.62mm", circuit=c)
    # Power Pins
    ic1[14] += vcc
    ic1[7] += gnd

    # Gray Output Nets
    y = Bus("Y", 4, circuit=c)

    # Gate A: Y2 = B3 ^ B2
    ic1[1] += b[3]  # 1A
    ic1[2] += b[2]  # 1B
    ic1[3] += y[2]  # 1Y

    # Gate B: Y1 = B2 ^ B1
    ic1[4] += b[2]  # 2A
    ic1[5] += b[1]  # 2B
    ic1[6] += y[1]  # 2Y

    # Gate C: Y0 = B1 ^ B0
    ic1[9] += b[1]  # 3A
    ic1[10] += b[0] # 3B
    ic1[8] += y[0]  # 3Y

    # Gate D: Unused CMOS inputs tied to GND to prevent oscillations
    ic1[12] += gnd  # 4A
    ic1[13] += gnd  # 4B
    # Pin 11 (4Y) left open / NC

    # Direct passthrough for Y3 = B3
    y[3] += b[3]

    # Output Resistor Network (4x 330 ohm isolated resistors)
    rn2 = Part("Device", "R_Pack04_SIP", value="4x330", footprint="Resistor_THT:R_Array_SIP8", circuit=c)
    rn2[1] += y[0]
    rn2[3] += y[1]
    rn2[5] += y[2]
    rn2[7] += y[3]

    # Output LEDs (D1..D4)
    leds = [
        Part("Device", "LED", value=f"LED_Green_Y{i}", footprint="LED_THT:LED_D3.0mm", circuit=c)
        for i in range(4)
    ]
    # D1 (Y0)
    leds[0][2] += rn2[2]
    leds[0][1] += gnd
    # D2 (Y1)
    leds[1][2] += rn2[4]
    leds[1][1] += gnd
    # D3 (Y2)
    leds[2][2] += rn2[6]
    leds[2][1] += gnd
    # D4 (Y3)
    leds[3][2] += rn2[8]
    leds[3][1] += gnd

    # Perform Electrical Rules Check (ERC)
    print("  [*] Running SKiDL ERC (Electrical Rules Check)...")
    erc_errors = c.ERC()
    if erc_errors == 0:
        print("  [+] ERC Passed: 0 Errors, Clean Connectivity Verified.")
    else:
        print(f"  [!] ERC Reported {erc_errors} warnings/errors.")

    # Export Netlist
    c.generate_netlist(file_="skidl_output.net")
    print("  [+] SKiDL Netlist exported: skidl_output.net")
    return True


# -----------------------------------------------------------------------------
# 4. Main Execution Routine
# -----------------------------------------------------------------------------
def main():
    print("=" * 72)
    print("Digital Logic Simulation Suite: KiCad Schematic & EDA Generator")
    print("Target: 4-Bit Binary to Gray Universal Code Converter")
    print("=" * 72)

    script_dir = os.path.dirname(os.path.abspath(__file__))
    sch_path = os.path.join(script_dir, "code_converter_4bit.kicad_sch")
    net_path = os.path.join(script_dir, "code_converter_4bit.net")

    print("\n[Phase 1] Synthesizing Native KiCad 7.0/8.0 Schematic...")
    generate_native_kicad_sch(sch_path)

    print("\n[Phase 2] Generating EDA Netlist Matrix...")
    generate_kicad_netlist(net_path)

    print("\n[Phase 3] Attempting SKiDL Python Engine Execution...")
    skidl_success = build_skidl_circuit()
    if not skidl_success:
        print("  [i] Standalone KiCad files (.kicad_sch & .net) are fully generated")
        print("      and ready to open immediately in KiCad 7.0 / 8.0.")

    print("\n" + "=" * 72)
    print("GENERATION COMPLETE:")
    print(f"  - KiCad Schematic: {sch_path}")
    print(f"  - KiCad Netlist:   {net_path}")
    print("=" * 72)


if __name__ == "__main__":
    main()
