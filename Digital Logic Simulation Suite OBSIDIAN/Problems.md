
1. **What does "a code" mean in our system? Binary, Gray, BCD, Excess-3 — how do we represent one of these as a piece of Python? A class? A dict of functions? Something else?**
A `Code` needs exactly 4 things: a **name**, a **domain** (which decimal values it can legally represent — this is where Binary(0-15) differs from BCD(0-9)), an **encode** function (decimal → bit string), and a **decode** function (bit string → decimal).

**Class vs. dict** — go with a class (or a `dataclass`, which is a class with less boilerplate). Here's the concrete failure case you were looking for: with a dict, nothing stops you from writing `{"encod": fn}` (typo) or forgetting `"domain"` entirely — Python won't complain until something tries to _use_ the missing key, possibly much later and far from the actual mistake. A dataclass with named fields fails immediately, at the point of construction, if you get a field wrong. That's the concrete "confusion" you sensed but couldn't pin down.

python

```python
@dataclass
class Code:
    name: str
    domain: range
    encode: Callable[[int], str]
    decode: Callable[[str], int]
```
  



2. **How do we avoid writing a function for every pair? With 5 codes, naive = 20 functions. What's the trick that lets us adding a 6th code give us conversions to/from everything else for free?**
Avoiding N² functions.
Binary `0101`, Gray `0111`, and BCD `0101` are three _different bit patterns_ representing the exact same underlying thing — **the decimal number 5**. That decimal value is the hub everything routes through.

So conversion isn't "translate bits directly to other bits" — it's **decode to decimal, then re-encode in the target code**:

python

```python
def universal_convert(from_code, to_code, bits):
    decimal_value = from_code.decode(bits)
    return to_code.encode(decimal_value)
```

That's it. 5 codes × 2 functions each (encode, decode) = 10 functions total, and every pair converts through this one function — not 20 hand-written pair functions,




3. **The domain problem. Binary/Gray go 0-15, BCD/Excess-3 only go 0-9. What should happen if someone asks to convert Binary 1010 → Excess-3? Where does that check live?**

Right after decoding, before encoding, check the value against **both** codes' domains:

python

```python
if decimal_value not in from_code.domain:
    raise ConversionError(f"{bits} is invalid for {from_code.name}")
if decimal_value not in to_code.domain:
    raise ConversionError(f"{decimal_value} has no valid {to_code.name} representation")
```

This is why Binary `1010` (decimal 10) correctly fails when converting to Excess-3 — 10 is valid Binary, but outside Excess-3's 0-9 domain.
  

4. **What's the contract of our convert function? What does it return on success? On failure? What would a junior calling it six months from now need to know?**

**On success:** don't just return the bits — return the bits _and_ the intermediate decimal value, so whoever's calling this (your JS friend's UI, or a junior debugging) can see what happened, not just the final answer.  
**On failure:** raise a specific, custom exception (`ConversionError`, not a bare `Exception`) with a message that says exactly what was wrong and why — "10 has no valid Excess-3 representation (domain is 0-9)" tells a junior something actionable; `return None` or `return False` tells them nothing.
  

5. **How do we prove it's correct? Once written, how do you know it works for every valid input, not just the 2-3 you tried by hand?**
Since Binary/Gray only have 16 possible values and BCD/Excess-3 only have 10, **test all of them, exhaustively** — not 2-3 hand-picked cases. For every pair of codes: loop through every value in their shared domain, check it converts correctly, and check converting forward-then-backward returns the original input. Also explicitly test the failure cases (Q3) — a test suite that only checks success paths hasn't actually proven the error handling works.