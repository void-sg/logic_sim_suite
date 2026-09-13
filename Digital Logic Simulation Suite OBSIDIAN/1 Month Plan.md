# 1-Month Team Roadmap — Digital Logic Simulation Suite

**Team:** You (Leader — architecture, backend, code review), JS friend (frontend), Learner (staged: data entry → tests → real feature)

**Guiding principle:** contract-first. Once the `/convert` JSON shape is decided (even on paper), all three of you work in parallel — nobody waits on anybody.

**Honest scope note up front:** this plan covers Phases 1-3 of your 8-phase roadmap (Universal Engine, FastAPI backend, SOP/POS module) plus the IC library. Comparator, MUX, and the ML/visual stretch goals are **month 2** — trying to rush all 8 phases into one month means nobody actually learns anything, they just copy-paste to hit a deadline. Two features done well and understood by the whole team beats five features nobody can explain.

---

## Week 1 — Foundations + Parallel Kickoff

**You (Leader)**

- Finish answering the 5 Universal Engine design questions; lock the `Code` representation and the `/convert` request/response JSON shape
- Set up the GitHub repo: branch protection on `main`, one Issue per phase
- Stand up a bare FastAPI skeleton with CORS enabled — even with fake/empty endpoints, this unblocks the other two immediately
- **Learn:** FastAPI basics, git branching workflow, HLD vs LLD (you've already got this from our diagram — now write it into `LLD.md` as you decide it)

**JS friend**

- Build the frontend page skeleton (HTML/CSS layout for the converter UI)
- Write the `fetch()` call against a **mocked** response — hardcode JSON matching the contract you gave them, don't wait for the real backend
- **Learn:** `fetch()` + async/await, JSON, what CORS is (even before hitting it)

**Learner**

- Build the IC library as a Python dict/JSON (your 14-row table) + a simple `GET /ic-library` endpoint, reviewed by you
- Start reading `converter.py` / `bcd_converters.py` closely and write pytest tests against them — this is deliberately a _reading_ task before a _writing_ task
- **Learn:** pytest basics, how to read someone else's code with intent

**Sync:** 15 min × 2 this week. Friday: quick demo of whatever exists, even if ugly.

---

## Week 2 — Real Engine, Real Wiring

**You**

- Finish the Universal Engine, pytest-verified against known values
- Wrap it in FastAPI, make `/convert` actually live
- Review the learner's Week 1 tests — are they testing behavior, or just re-stating what the code does?

**JS friend**

- Swap the mocked `fetch()` for the real backend URL
- Handle the error case in the UI — what happens when the backend returns a 422 for a domain mismatch (e.g. Binary 1010 → Excess-3)? Don't let this be an unhandled crash in the browser
- **Learn:** HTTP status codes in practice, reading the Network tab in DevTools

**Learner**

- Finish the IC library endpoint end-to-end
- Add edge-case tests: invalid bit strings, domain mismatches, unknown code names
- **Learn:** Pydantic request validation, what "edge case" actually means in testing

**Friday demo (real one this time):** toggle an input in the browser → real FastAPI backend → real computed output. This is the first fully-wired loop — worth treating as a milestone, not just another Friday.

---

## Week 3 — SOP/POS Module + Leveling Up the Learner

**You**

- Design the SOP/POS module: what's the input contract (list of minterms? a boolean expression string?), how do you represent don't-cares in the API, how do you communicate the K-map grouping back to the frontend
- Scaffold the module's structure, then hand implementation to the learner with your design as their guide — this is their first real feature, not just data entry

**Learner**

- Implement the SOP/POS module against your scaffolded design
- Open a real PR — you review it like any teammate's code, not "good enough because they're new"
- **Learn:** sympy's boolean simplification API, what a code review actually checks for

**JS friend**

- Build the SOP/POS frontend page, reusing patterns from the converter page
- Start on K-map SVG rendering — backend sends the grid data, JS draws the SVG (this is groundwork for the "visualize like KiCAD" goal later)
- **Learn:** generating SVG dynamically from JS, structuring reusable frontend code

---

## Week 4 — Polish, Integration, HOD Demo Prep

**You**

- If time allows: start designing the comparator module's questions (cascade behavior, 74LS85) as a head start into month 2 — don't fully build it yet
- Full-project code review pass: are the Week 1-3 contracts still consistent?
- Write up `LLD.md` properly — this should now cover the Engine, FastAPI layer, and SOP/POS module for real, not as a placeholder

**JS friend**

- Visual/UX polish pass across both pages — consistent styling, clear error states
- Fix whatever CORS/edge-case rough edges surfaced during real usage

**Learner**

- Polish and document the SOP/POS module — writing the explanation for juniors is itself a strong way to cement their own understanding
- Pair with you on scoping the comparator module for month 2

**Team**

- Full walkthrough rehearsal for your HOD: Universal Converter + SOP/POS, end-to-end, live — including the frontend, not just backend `/docs`
- Retro: what blocked people this month? Where did the contract-first approach actually save time, and where did it not?

---

## End-of-month success criteria

- [ ] Universal Converter and SOP/POS solver both working end-to-end in the browser
- [ ] Full pytest suite passing for both modules
- [ ] Git workflow (branches + PR review) actually used by all three of you, not just you
- [ ] The learner can explain and defend the SOP/POS module in front of your HOD — not just "I copied this part"
- [ ] `LLD.md` exists and is accurate for everything built so far

## Explicitly deferred to month 2

Comparator module, MUX module, visual auto-drawn schematic layer, CV-based digitization, junior mistake-tracking analytics.