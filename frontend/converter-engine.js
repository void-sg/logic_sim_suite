/**
 * Universal Code Conversion Engine & API Client
 * Connects to the Python FastAPI backend (/convert) when running,
 * and seamlessly provides local client-side evaluation if the backend is paused/offline.
 */

const LOCAL_REGISTRY = {
  "Binary": {
    width: 4,
    min: 0,
    max: 15,
    encode: (n) => n.toString(2).padStart(4, "0"),
    decode: (b) => parseInt(b, 2)
  },
  "Gray": {
    width: 4,
    min: 0,
    max: 15,
    encode: (n) => (n ^ (n >> 1)).toString(2).padStart(4, "0"),
    decode: (b) => {
      let n = parseInt(b, 2);
      let mask = n;
      while (mask > 0) {
        mask >>= 1;
        n ^= mask;
      }
      return n;
    }
  },
  "BCD": {
    width: 4,
    min: 0,
    max: 9,
    encode: (n) => n.toString(2).padStart(4, "0"),
    decode: (b) => parseInt(b, 2)
  },
  "Excess-3": {
    width: 4,
    min: 0,
    max: 9,
    encode: (n) => (n + 3).toString(2).padStart(4, "0"),
    decode: (b) => parseInt(b, 2) - 3
  }
};

function localUniversalConvert(fromCode, toCode, bits) {
  const src = LOCAL_REGISTRY[fromCode];
  const dst = LOCAL_REGISTRY[toCode];

  if (!src || !dst) {
    return { ok: false, detail: `Unknown code: ${fromCode} or ${toCode}` };
  }

  if (bits.length !== src.width || /[^01]/.test(bits)) {
    return { ok: false, detail: `'${bits}' is not a valid ${src.width}-bit binary string.` };
  }

  const value = src.decode(bits);

  if (value < src.min || value > src.max) {
    return {
      ok: false,
      detail: `'${bits}' decodes to ${value}, which is outside ${fromCode}'s valid domain (${src.min}-${src.max}).`
    };
  }

  if (value < dst.min || value > dst.max) {
    return {
      ok: false,
      detail: `Decimal value ${value} has no valid ${toCode} representation (${toCode}'s domain is ${dst.min}-${dst.max}).`
    };
  }

  const resultBits = dst.encode(value);
  return {
    ok: true,
    data: {
      input_bits: bits,
      decimal_value: value,
      output_bits: resultBits,
      from_code: fromCode,
      to_code: toCode
    }
  };
}

async function universalConvert(fromCode, toCode, bits) {
  const hosts = [
    window.location.hostname ? `http://${window.location.hostname}:8000` : null,
    "http://127.0.0.1:8000",
    "http://localhost:8000"
  ].filter((v, i, a) => v && a.indexOf(v) === i);

  // 1. Try Python backend first
  for (const host of hosts) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);

      const res = await fetch(`${host}/convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from_code: fromCode, to_code: toCode, bits: bits }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const data = await res.json();
      return {
        ok: res.ok,
        data: data,
        source: "Python Backend (FastAPI)"
      };
    } catch (err) {
      // Backend not running or paused on this host
    }
  }

  // 2. Fallback to client-side engine if backend is paused or stopped
  const local = localUniversalConvert(fromCode, toCode, bits);
  if (!local.ok) {
    return {
      ok: false,
      data: { detail: local.detail },
      source: "Local Engine (Backend Paused)"
    };
  }

  return {
    ok: true,
    data: local.data,
    source: "Local Engine (Backend Paused)"
  };
}

// ==========================================
// 2. ADDER / SUBTRACTOR ENGINE (IC 74LS83)
// ==========================================

function localUniversalAddSubtract(a, b, mode = 0, cin = null) {
  if (typeof a !== "string" || a.length !== 4 || /[^01]/.test(a)) {
    return { ok: false, detail: `A must be a 4-bit binary string, got '${a}'` };
  }
  if (typeof b !== "string" || b.length !== 4 || /[^01]/.test(b)) {
    return { ok: false, detail: `B must be a 4-bit binary string, got '${b}'` };
  }
  if (mode !== 0 && mode !== 1) {
    return { ok: false, detail: `mode must be 0 (add) or 1 (subtract), got ${mode}` };
  }

  const effectiveCin = (cin === null || cin === undefined) ? mode : parseInt(cin, 10);
  const aBits = a.split("").map(Number).reverse(); // LSB first
  const bOrig = b.split("").map(Number).reverse();
  const bBits = bOrig.map(bit => bit ^ mode); // Inverted if mode=1 (2's complement trick)

  const sumBits = [];
  const stages = [];
  let carry = effectiveCin;

  for (let i = 0; i < 4; i++) {
    const aBit = aBits[i];
    const bBit = bBits[i];
    const cinStage = carry;
    const sum = aBit ^ bBit ^ cinStage;
    carry = (aBit & bBit) | (cinStage & (aBit ^ bBit));

    sumBits.push(sum);
    stages.push({
      stage: i,
      a: aBit,
      b: bBit,
      b_orig: bOrig[i],
      mode: mode,
      cin: cinStage,
      sum: sum,
      cout: carry
    });
  }

  sumBits.reverse(); // back to MSB first
  const sumStr = sumBits.join("");
  const aDec = parseInt(a, 2);
  const bDec = parseInt(b, 2);

  const res = {
    sum: sumStr,
    a: a,
    b: b,
    mode: mode,
    operation: mode === 0 ? "ADD" : "SUBTRACT",
    a_decimal: aDec,
    b_decimal: bDec,
    result_decimal: mode === 0 ? (aDec + bDec + (effectiveCin ? 1 : 0)) : (aDec - bDec),
    stages: stages
  };

  if (mode === 0) {
    res.carry_out = carry;
    res.borrow = null;
  } else {
    res.carry_out = null;
    res.borrow = 1 - carry; // 0 if A >= B, 1 if borrow needed
  }

  return { ok: true, data: res };
}

async function universalAddSubtract(a, b, mode = 0, cin = null) {
  const hosts = [
    window.location.hostname ? `http://${window.location.hostname}:8000` : null,
    "http://127.0.0.1:8000",
    "http://localhost:8000"
  ].filter((v, i, a) => v && a.indexOf(v) === i);

  for (const host of hosts) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);

      const payload = { a: a, b: b, mode: mode };
      if (cin !== null && cin !== undefined) payload.cin = cin;

      const res = await fetch(`${host}/add-subtract`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const data = await res.json();
      return {
        ok: res.ok,
        data: data,
        source: "Python Backend (FastAPI)"
      };
    } catch (err) {
      // Backend not running on this host
    }
  }

  // Fallback to local evaluation
  const local = localUniversalAddSubtract(a, b, mode, cin);
  return {
    ok: local.ok,
    data: local.ok ? local.data : { detail: local.detail },
    source: "Local Engine (Backend Paused)"
  };
}

// ==========================================
// 3. COMPARATOR ENGINE (IC 74LS85)
// ==========================================

function localUniversalCompare(a, b, cascadeIn = null) {
  if (typeof a !== "string" || a.length !== 4 || /[^01]/.test(a)) {
    return { ok: false, detail: `A must be a 4-bit binary string, got '${a}'` };
  }
  if (typeof b !== "string" || b.length !== 4 || /[^01]/.test(b)) {
    return { ok: false, detail: `B must be a 4-bit binary string, got '${b}'` };
  }

  const cascade = cascadeIn || { gt: 0, lt: 0, eq: 1 };
  const [a3, a2, a1, a0] = a.split("").map(Number);
  const [b3, b2, b1, b0] = b.split("").map(Number);

  const xnor = (x, y) => 1 - (x ^ y);
  const eq3 = xnor(a3, b3);
  const eq2 = xnor(a2, b2);
  const eq1 = xnor(a1, b1);
  const eq0 = xnor(a0, b0);

  const own_gt =
    (a3 & (1 - b3)) |
    (eq3 & a2 & (1 - b2)) |
    (eq3 & eq2 & a1 & (1 - b1)) |
    (eq3 & eq2 & eq1 & a0 & (1 - b0));

  const own_lt =
    ((1 - a3) & b3) |
    (eq3 & (1 - a2) & b2) |
    (eq3 & eq2 & (1 - a1) & b1) |
    (eq3 & eq2 & eq1 & (1 - a0) & b0);

  const own_eq = eq3 & eq2 & eq1 & eq0;

  const out_gt = own_gt | (own_eq & (cascade.gt || 0));
  const out_lt = own_lt | (own_eq & (cascade.lt || 0));
  const out_eq = own_eq & (cascade.eq !== undefined ? cascade.eq : 1);

  let decisionStage = "All 4 bits equal (A = B)";
  if (a3 !== b3) decisionStage = "Determined at Bit 3 (MSB)";
  else if (a2 !== b2) decisionStage = "Determined at Bit 2";
  else if (a1 !== b1) decisionStage = "Determined at Bit 1";
  else if (a0 !== b0) decisionStage = "Determined at Bit 0 (LSB)";
  else if (cascade.gt) decisionStage = "Bits are equal; resolved to A > B by cascade input (IA>B)";
  else if (cascade.lt) decisionStage = "Bits are equal; resolved to A < B by cascade input (IA<B)";

  const relation = out_gt ? "A > B" : (out_lt ? "A < B" : "A = B");

  return {
    ok: true,
    data: {
      a: a,
      b: b,
      a_decimal: parseInt(a, 2),
      b_decimal: parseInt(b, 2),
      a_gt_b: out_gt,
      a_lt_b: out_lt,
      a_eq_b: out_eq,
      relation: relation,
      decision_stage: decisionStage,
      bit_comparisons: [
        { bit: 3, a: a3, b: b3, eq: eq3, gt: a3 & (1 - b3), lt: (1 - a3) & b3 },
        { bit: 2, a: a2, b: b2, eq: eq2, gt: a2 & (1 - b2), lt: (1 - a2) & b2 },
        { bit: 1, a: a1, b: b1, eq: eq1, gt: a1 & (1 - b1), lt: (1 - a1) & b1 },
        { bit: 0, a: a0, b: b0, eq: eq0, gt: a0 & (1 - b0), lt: (1 - a0) & b0 }
      ]
    }
  };
}

async function universalCompare(a, b, cascadeIn = null) {
  const hosts = [
    window.location.hostname ? `http://${window.location.hostname}:8000` : null,
    "http://127.0.0.1:8000",
    "http://localhost:8000"
  ].filter((v, i, a) => v && a.indexOf(v) === i);

  for (const host of hosts) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);

      const cascade = cascadeIn || { gt: 0, lt: 0, eq: 1 };
      const payload = {
        a: a,
        b: b,
        cascade_gt: cascade.gt || 0,
        cascade_lt: cascade.lt || 0,
        cascade_eq: cascade.eq !== undefined ? cascade.eq : 1
      };

      const res = await fetch(`${host}/compare`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const data = await res.json();
      return {
        ok: res.ok,
        data: data,
        source: "Python Backend (FastAPI)"
      };
    } catch (err) {
      // Backend not running on this host
    }
  }

  // Fallback to local evaluation
  const local = localUniversalCompare(a, b, cascadeIn);
  return {
    ok: local.ok,
    data: local.ok ? local.data : { detail: local.detail },
    source: "Local Engine (Backend Paused)"
  };
}

// ==========================================
// 4. MULTIPLEXER ENGINE (IC 74LS153)
// ==========================================

function localUniversalMux(select, inputs, strobe = 0) {
  if (typeof select !== "string" || /[^01]/.test(select)) {
    return { ok: false, detail: `select must be a binary string, got '${select}'` };
  }
  if (!Array.isArray(inputs) || inputs.some(x => x !== 0 && x !== 1)) {
    return { ok: false, detail: `inputs must be an array of 0s and 1s, got ${inputs}` };
  }

  const selIdx = parseInt(select, 2);

  if (select.length === 1 && inputs.length === 2) {
    const s0 = parseInt(select[0], 10);
    const rawOut = ((1 - s0) & inputs[0]) | (s0 & inputs[1]);
    const output = strobe === 1 ? 0 : rawOut;
    return {
      ok: true,
      data: {
        select: select,
        inputs: inputs,
        output: output,
        mux_type: "2:1",
        selected_channel: `D${selIdx}`,
        selected_index: selIdx,
        details: { s0: s0, strobe: strobe, raw_output: rawOut }
      }
    };
  } else if (select.length === 2 && inputs.length === 4) {
    const s1 = parseInt(select[0], 10);
    const s0 = parseInt(select[1], 10);
    const rawOut =
      ((1 - s1) & (1 - s0) & inputs[0]) |
      ((1 - s1) & s0 & inputs[1]) |
      (s1 & (1 - s0) & inputs[2]) |
      (s1 & s0 & inputs[3]);
    const output = strobe === 1 ? 0 : rawOut;
    return {
      ok: true,
      data: {
        select: select,
        inputs: inputs,
        output: output,
        mux_type: "4:1",
        selected_channel: `D${selIdx}`,
        selected_index: selIdx,
        details: { s1: s1, s0: s0, strobe: strobe, raw_output: rawOut }
      }
    };
  } else if (select.length === 3 && inputs.length === 8) {
    const s2 = parseInt(select[0], 10);
    const s1 = parseInt(select[1], 10);
    const s0 = parseInt(select[2], 10);

    // Section 1 (D0-D3)
    const y1 =
      ((1 - s1) & (1 - s0) & inputs[0]) |
      ((1 - s1) & s0 & inputs[1]) |
      (s1 & (1 - s0) & inputs[2]) |
      (s1 & s0 & inputs[3]);

    // Section 2 (D4-D7)
    const y2 =
      ((1 - s1) & (1 - s0) & inputs[4]) |
      ((1 - s1) & s0 & inputs[5]) |
      (s1 & (1 - s0) & inputs[6]) |
      (s1 & s0 & inputs[7]);

    // Dual 74LS153 gating
    const y1_gated = y1 & (1 - s2);
    const y2_gated = y2 & s2;
    const rawOut = y1_gated | y2_gated;
    const output = strobe === 1 ? 0 : rawOut;

    return {
      ok: true,
      data: {
        select: select,
        inputs: inputs,
        output: output,
        mux_type: "8:1",
        selected_channel: `D${selIdx}`,
        selected_index: selIdx,
        details: {
          s2: s2,
          s1: s1,
          s0: s0,
          strobe: strobe,
          section1_out: y1,
          section2_out: y2,
          active_section: s2 === 1 ? 2 : 1,
          raw_output: rawOut
        }
      }
    };
  } else {
    return {
      ok: false,
      detail: `Unsupported configuration: select length ${select.length} with ${inputs.length} inputs.`
    };
  }
}

async function universalMux(select, inputs, strobe = 0) {
  const hosts = [
    window.location.hostname ? `http://${window.location.hostname}:8000` : null,
    "http://127.0.0.1:8000",
    "http://localhost:8000"
  ].filter((v, i, a) => v && a.indexOf(v) === i);

  for (const host of hosts) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);

      const payload = { select: select, inputs: inputs, strobe: strobe };
      const res = await fetch(`${host}/mux`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const data = await res.json();
      return {
        ok: res.ok,
        data: data,
        source: "Python Backend (FastAPI)"
      };
    } catch (err) {
      // Backend not running on this host
    }
  }

  // Fallback to local evaluation
  const local = localUniversalMux(select, inputs, strobe);
  return {
    ok: local.ok,
    data: local.ok ? local.data : { detail: local.detail },
    source: "Local Engine (Backend Paused)"
  };
}

