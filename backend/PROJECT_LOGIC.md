# Digital Logic Simulation Suite — Core Logic Reference

This file consolidates the DESIGN and LOGIC (equations, truth tables,
algorithms, contracts) for every module discussed so far. It is deliberately
NOT full working code — you're implementing each module yourself. Treat this
as the reference you'd hand a teammate (or your future self) so nobody has
to re-derive what's already been worked out.

Status key: [FINALIZED] = design locked, ready to implement.
            [DERIVED, NOT YET DESIGNED AS A CONTRACT] = logic is correct and
            verified, but the function signatures/error handling/API shape
            still need the same hard-question treatment as the Engine got.

---

## 1. Universal Conversion Engine — [FINALIZED]

### Core insight
Every code (Binary, Gray, BCD, Excess-3, 2's Complement) is a different bit
pattern representing the SAME underlying decimal value. Conversion routes
through that decimal value as a hub:

```
universal_convert(from_code, to_code, bits):
    decimal_value = from_code.decode(bits)
    validate decimal_value against BOTH from_code.domain and to_code.domain
    return to_code.encode(decimal_value)
```

### Code representation
A `Code` needs exactly 4 fields: `name`, `domain` (a `range` — which decimal
values are valid), `encode` (decimal -> bit string), `decode` (bit string ->
decimal). Implemented as a dataclass, not a dict — typos in dict keys fail
silently at USE time; dataclass field typos fail immediately at construction.

### Registered codes and their domains
| Code | Domain | Encode formula |
|---|---|---|
| Binary | 0-15 | `format(n, '04b')` |
| Gray | 0-15 | `n ^ (n >> 1)` |
| BCD | 0-9 | same as Binary, just restricted domain |
| Excess-3 | 0-9 | `n + 3` |
| 2's Complement | 0-15 | `(16 - n) % 16` |

### Error contract
Custom `ConversionError` exception (not bare `Exception`), raised with a
message stating exactly what failed and why — e.g. "10 has no valid
Excess-3 representation (domain is 0-9)". Never return `None`/`False` on
failure — that tells a caller nothing actionable.

### Domain mismatch example that must be caught
Binary `1010` (decimal 10) -> Excess-3: decimal 10 is valid Binary but
outside Excess-3's 0-9 domain. Must raise `ConversionError`, not silently
compute garbage.

---

## 2. BCD ↔ Gray and BCD ↔ Excess-3 — K-map derived equations [FINALIZED]

These are special cases of the Universal Engine (BCD's domain is just a
restriction of Binary's), but the underlying gate-level equations were
derived separately using K-maps WITH DON'T-CARES for the 6 unused patterns
(10-15), which is why some of these are simpler than the plain XOR chain.

### BCD -> Gray
```
G3 = B3
G2 = B2 + B3          <- simpler than XOR, only possible due to don't-cares
G1 = B1 ⊕ B2
G0 = B0 ⊕ B1
```

### Gray -> BCD
```
B3 = G3
B2 = G2 · G3'
B1 = (G1 · G2') + (G1' · G2 · G3')
B0 = (ripples on previous output bit — messier SOP, see derivation)
```

### BCD -> Excess-3
```
X3 = B3 + (B0·B2) + (B1·B2)
X2 = (B0·B2') + (B1·B2') + (B2·B0'·B1')
X1 = B0 ⊕ B1  (XNOR form)
X0 = B0'                    <- literally just an inverter
```

### Excess-3 -> BCD
```
B3 = (X2·X3) + (X0·X1·X3)
B2 = (X0·X1·X2) + (X0'·X2') + (X1'·X2')
B1 = X0 ⊕ X1
B0 = X0'                     <- literally just an inverter
```

**Key property**: Excess-3 is self-complementing — the 9's complement of a
digit equals the bitwise NOT of its Excess-3 code. This is WHY X0=B0' and
B0=X0' fall out as pure inverters.

---

## 3. Comparator Module — [DERIVED, NOT YET DESIGNED AS A CONTRACT]

Verified against all 256 possible 4-bit input pairs (0 mismatches) before
being written here — this logic is correct, but you still need to design
the function signatures/API contract yourself, same as the Engine.

### 1-bit comparator (the base case)
For single bits A, B:
```
A=B  ->  XNOR(A, B)
A>B  ->  A AND (NOT B)
A<B  ->  (NOT A) AND B
```

### 4-bit comparator (priority MSB -> LSB)
Let EQi = XNOR(Ai, Bi) for each bit position. The idea: check the MSB pair
first; only if they're equal does the comparison "fall through" to check
the next bit down.

```
A>B = (A3·B3') + (EQ3·A2·B2') + (EQ3·EQ2·A1·B1') + (EQ3·EQ2·EQ1·A0·B0')
A<B = (A3'·B3) + (EQ3·A2'·B2) + (EQ3·EQ2·A1'·B1) + (EQ3·EQ2·EQ1·A0'·B0)
A=B = EQ3 · EQ2 · EQ1 · EQ0
```

### Cascading (matches real IC 74LS85 pin behavior)
The 74LS85 has 3 cascade INPUTS (IA>B, IA<B, IA=B) so multiple chips can be
chained for 8-bit, 12-bit, etc. comparisons. Formula for combining a 4-bit
stage's own comparison with the cascade-in from a lower-order stage:

```
OA>B = (A>B) + ((A=B) · IA>B)
OA<B = (A<B) + ((A=B) · IA<B)
OA=B = (A=B) · IA=B
```

For the LOWEST-order 4-bit stage (nothing below it), tie cascade inputs to:
`IA>B=0, IA<B=0, IA=B=1` — this makes the lowest stage's equality output
depend only on its own bits, matching the real IC's datasheet-specified
tie-off values for a single-stage (non-cascaded) comparator.

### To build 1-bit / 2-bit / 3-bit comparators
Same equations, just fewer terms (drop the lower-priority AND-chains). A
1-bit comparator is literally just the 3 base equations above with no
cascade logic needed.

### Design questions still open (answer these before implementing)
1. What's the function signature — does it take two bit-strings and return
   a 3-tuple, or something richer (like the Engine's dict-with-intermediate-
   values pattern)?
2. How do you represent "which stage this is" for cascading — a class with
   cascade-in/cascade-out as instance state, or a pure function taking
   cascade values as explicit arguments?
3. How do you test this exhaustively given 256 input pairs for 4-bit alone,
   and more once cascading is involved?

---

## 4. MUX Module (IC 74LS153) — [DERIVED, NOT YET DESIGNED AS A CONTRACT]

### The IC
74LS153 = Dual 4-input multiplexer. Two independent 4:1 MUX sections in one
package, each with its own active-low Strobe/Enable pin, but SHARED select
lines (A, B).

### Building 8:1 from one 74LS153
- D0-D3 -> section 1 (1C0-1C3); D4-D7 -> section 2 (2C0-2C3)
- Select lines S1,S0 -> shared A,B pins (drives both sections identically)
- S2 (the "which half" bit) -> drives 2G directly, and drives 1G through a
  NOT gate
  - S2=0: section 1 enabled (1G=0), section 2 disabled (2G=1, forces output 0)
  - S2=1: section 1 disabled, section 2 enabled
- Combine: OR the two section outputs (1Y OR 2Y) — disabled section always
  outputs 0, so OR-ing is safe and gives the correct final Y

### Truth table
| S2 S1 S0 | Y |
|---|---|
| 000 | D0 |
| 001 | D1 |
| 010 | D2 |
| 011 | D3 |
| 100 | D4 |
| 101 | D5 |
| 110 | D6 |
| 111 | D7 |

### Boolean expression
```
Y = S2'S1'S0'D0 + S2'S1'S0 D1 + S2'S1S0'D2 + S2'S1S0 D3
  + S2 S1'S0'D4 + S2 S1'S0 D5 + S2 S1S0'D6 + S2 S1S0 D7
```

### Extending the hybrid pattern (for your "16:1 from two 8:1" idea)
Same technique one level up: build two 8:1 MUXes (each from one 74LS153 as
above), then combine their outputs the same way — a 4th select bit chooses
which 8:1 block is active (via enable/NOT-enable), OR the two block outputs
together. The pattern is self-similar at every level: enable one half,
disable the other, OR the results.

### Design questions still open
1. Do you model the 74LS153 as a class with enable-pin state, or a pure
   function taking select bits + 8 data bits and returning Y directly?
2. How do you represent "hybrid" combinations generically — hardcode the
   8:1-from-dual-4:1 case, or write something that generalizes to N:1 from
   two (N/2):1 blocks?

---

## 5. IC Gate/Part Library — reference data (not logic, just needs entry)

| Gate Type | Part Number | Internal Configuration |
|---|---|---|
| AND | 74LS08 | Quad 2-Input AND Gate |
| AND | 74LS11 | Triple 3-Input AND Gate |
| AND | 74LS21 | Dual 4-Input AND Gate |
| OR | 74LS32 | Quad 2-Input OR Gate |
| NOT | 74LS04 | Hex Inverter (6 NOT Gates) |
| NOT | 74LS14 | Hex Inverter with Schmitt Trigger Inputs |
| NAND | 74LS00 | Quad 2-Input NAND Gate |
| NAND | 74LS10 | Triple 3-Input NAND Gate |
| NAND | 74LS20 | Dual 4-Input NAND Gate |
| NAND | 74LS30 | Single 8-Input NAND Gate |
| NOR | 74LS02 | Quad 2-Input NOR Gate |
| NOR | 74LS27 | Triple 3-Input NOR Gate |
| XOR | 74LS86 | Quad 2-Input Exclusive-OR Gate |
| XNOR | 74LS266 | Quad 2-Input Exclusive-NOR Gate |

Plus: 74LS85 (4-bit magnitude comparator, see Section 3) and 74LS153 (dual
4:1 MUX, see Section 4).

---

## 6. SOP/POS Solver — approach only, design not yet started

Technique already proven out in Section 2's derivations: `sympy.logic.
boolalg.SOPform(variables, minterms, dontcares)` gives a minimized SOP
expression automatically. The module design (input contract — minterm list?
raw boolean expression string? — and how don't-cares get specified by the
user) still needs its own hard-question design pass, same as every other
module here.

---

## What still needs a design-question session before implementation
- Comparator module's function contract (3 open questions above)
- MUX module's function contract (2 open questions above)
- SOP/POS module's entire API shape (not started)
- IC library's storage format (dict vs JSON vs SQLite — leaning dict, see
  earlier database discussion: 14 static rows don't need a real database)
