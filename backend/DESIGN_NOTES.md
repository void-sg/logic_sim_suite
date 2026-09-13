1. What does "a code" mean in our system? 
Binary, Gray, BCD, Excess-3 — how do we represent one of these as a piece of Python? A class? A dict of functions? Something else?

2. How do we avoid writing a function for every pair? With 5 codes, naive = 20 functions. What's the trick that lets us adding a 6th code give us conversions to/from everything else for free?

3. The domain problem. Binary/Gray go 0-15, BCD/Excess-3 only go 0-9. What should happen if someone asks to convert Binary 1010 → Excess-3? Where does that check live?

4. What's the contract of our convert function? What does it return on success? On failure? What would a junior calling it six months from now need to know?

5. How do we prove it's correct? Once written, how do you know it works for every valid input, not just the 2-3 you tried by hand?