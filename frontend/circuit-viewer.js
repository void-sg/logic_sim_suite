/**
 * KiCad-Style Live Schematic Viewer Engine
 * Renders data-driven 8:1 MUX schematic with KiCad aesthetics,
 * Manhattan orthogonal wiring, live binary states, and interactive pan/zoom.
 */

(function () {
  const API_BASE = "http://127.0.0.1:8000";
  const SVG_NS = "http://www.w3.org/2000/svg";

  // Application State
  const state = {
    select: "000",
    inputs: [0, 0, 0, 0, 0, 0, 0, 0],
    strobe: 0,
    circuitData: null,
    apiOnline: false,

    // Pan & Zoom
    viewBox: { x: 0, y: 0, w: 1200, h: 740 },
    initialViewBox: { x: 0, y: 0, w: 1200, h: 740 },
    isPanning: false,
    panStart: { x: 0, y: 0 },
  };

  // DOM Elements
  let svgRoot = null;
  let zoomGroup = null;
  let wireLayer = null;
  let junctionLayer = null;
  let componentLayer = null;

  // Initialize
  document.addEventListener("DOMContentLoaded", () => {
    initDOM();
    initPanZoom();
    updateCircuit();
  });

  function initDOM() {
    svgRoot = document.getElementById("schematic-svg");
    if (!svgRoot) return;

    // SVG Layers
    svgRoot.innerHTML = "";
    zoomGroup = createSVGElement("g", { id: "zoom-group" });
    svgRoot.appendChild(zoomGroup);

    // Grid dots & border background
    drawKiCadFrameAndGrid(zoomGroup);

    wireLayer = createSVGElement("g", { id: "wire-layer" });
    junctionLayer = createSVGElement("g", { id: "junction-layer" });
    componentLayer = createSVGElement("g", { id: "component-layer" });

    zoomGroup.appendChild(wireLayer);
    zoomGroup.appendChild(junctionLayer);
    zoomGroup.appendChild(componentLayer);

    // Bind bit toggle buttons
    document.querySelectorAll(".bit-toggle-btn[data-type]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const type = btn.getAttribute("data-type");
        const idx = parseInt(btn.getAttribute("data-index"), 10);

        if (type === "select") {
          const sArr = state.select.split("");
          sArr[idx] = sArr[idx] === "1" ? "0" : "1";
          state.select = sArr.join("");
        } else if (type === "input") {
          state.inputs[idx] = state.inputs[idx] === 1 ? 0 : 1;
        } else if (type === "strobe") {
          state.strobe = state.strobe === 0 ? 1 : 0;
        }
        updateCircuit();
      });
    });

    // Preset buttons
    document.querySelectorAll("[data-preset]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const preset = btn.getAttribute("data-preset");
        applyPreset(preset);
      });
    });

    // Zoom buttons
    document.getElementById("btn-zoom-in")?.addEventListener("click", () => zoom(0.8));
    document.getElementById("btn-zoom-out")?.addEventListener("click", () => zoom(1.25));
    document.getElementById("btn-zoom-reset")?.addEventListener("click", () => resetZoom());
  }

  function applyPreset(preset) {
    if (preset === "d3-active") {
      state.select = "011";
      state.inputs = [0, 0, 0, 1, 0, 0, 0, 0];
      state.strobe = 0;
    } else if (preset === "d6-active") {
      state.select = "110";
      state.inputs = [0, 0, 0, 0, 0, 0, 1, 0];
      state.strobe = 0;
    } else if (preset === "all-ones") {
      state.inputs = [1, 1, 1, 1, 1, 1, 1, 1];
    } else if (preset === "strobe-disabled") {
      state.strobe = 1;
    } else if (preset === "reset") {
      state.select = "000";
      state.inputs = [0, 0, 0, 0, 0, 0, 0, 0];
      state.strobe = 0;
    }
    updateCircuit();
  }

  // Fetch or simulate circuit data
  async function updateCircuit() {
    updateButtonStates();

    const url = `${API_BASE}/circuit/mux-8to1?select=${state.select}&inputs=${state.inputs.join(",")}&strobe=${state.strobe}`;
    let data = null;

    try {
      const resp = await fetch(url, { signal: AbortSignal.timeout(1200) });
      if (resp.ok) {
        data = await resp.json();
        setApiStatus(true);
      } else {
        throw new Error("API error " + resp.status);
      }
    } catch (e) {
      // Backend unavailable: compute offline logic with full fidelity
      data = generateClientSideCircuit(state.select, state.inputs, state.strobe);
      setApiStatus(false);
    }

    state.circuitData = data;
    renderCircuit(data);
    renderInfoPanels(data);
  }

  function setApiStatus(online) {
    state.apiOnline = online;
    const dot = document.getElementById("api-status-dot");
    const text = document.getElementById("api-status-text");
    if (dot && text) {
      if (online) {
        dot.className = "status-dot";
        text.textContent = "Live API (FastAPI)";
      } else {
        dot.className = "status-dot offline";
        text.textContent = "Client Simulator (Standby)";
      }
    }
  }

  function updateButtonStates() {
    // Select buttons: S2 (idx 0), S1 (idx 1), S0 (idx 2)
    for (let i = 0; i < 3; i++) {
      const btn = document.querySelector(`.bit-toggle-btn[data-type="select"][data-index="${i}"]`);
      if (btn) {
        const val = state.select[i];
        btn.classList.toggle("active", val === "1");
        btn.querySelector(".bit-val").textContent = val;
      }
    }

    // Input buttons: D0..D7
    for (let i = 0; i < 8; i++) {
      const btn = document.querySelector(`.bit-toggle-btn[data-type="input"][data-index="${i}"]`);
      if (btn) {
        const val = state.inputs[i];
        btn.classList.toggle("active", val === 1);
        btn.querySelector(".bit-val").textContent = val;
      }
    }

    // Strobe button
    const strobeBtn = document.querySelector(`.bit-toggle-btn[data-type="strobe"]`);
    if (strobeBtn) {
      strobeBtn.classList.toggle("active", state.strobe === 1);
      strobeBtn.querySelector(".bit-val").textContent = state.strobe;
    }
  }

  // Main Render Function
  function renderCircuit(data) {
    if (!data) return;

    // Render Wires
    wireLayer.innerHTML = "";
    data.wires.forEach((wire) => {
      const isHigh = wire.value === 1;
      const wirePath = createSVGElement("path", {
        d: wire.path,
        class: `kicad-wire ${isHigh ? "wire-high" : "wire-low"}`,
        id: wire.id,
        "data-net": wire.net,
      });
      wireLayer.appendChild(wirePath);
    });

    // Render Junctions
    junctionLayer.innerHTML = "";
    data.junctions.forEach((junc, idx) => {
      const isHigh = junc.value === 1;
      const circle = createSVGElement("circle", {
        cx: junc.x,
        cy: junc.y,
        class: `kicad-junction ${isHigh ? "junc-high" : "junc-low"}`,
      });
      junctionLayer.appendChild(circle);
    });

    // Render Components
    componentLayer.innerHTML = "";
    data.components.forEach((comp) => {
      renderComponent(comp, componentLayer);
    });
  }

  // Component Renderer
  function renderComponent(comp, parent) {
    const g = createSVGElement("g", { id: comp.id, class: "kicad-component" });

    if (comp.type === "ic_block") {
      renderICBlock(comp, g);
    } else if (comp.type === "not_gate") {
      renderNotGate(comp, g);
    } else if (comp.type === "or_gate") {
      renderOrGate(comp, g);
    } else if (comp.type.startsWith("port_")) {
      renderPort(comp, g);
    }

    parent.appendChild(g);
  }

  // 1. IC Block Renderer (74LS153 Section)
  function renderICBlock(comp, parent) {
    const { x, y, width, height, ref, value, pins } = comp;

    // Main IC Body Rect
    const rect = createSVGElement("rect", {
      x: x,
      y: y,
      width: width,
      height: height,
      rx: 2,
      ry: 2,
      class: "kicad-component-body",
    });
    parent.appendChild(rect);

    // Ref Designator (Red KiCad font)
    const refText = createSVGElement("text", {
      x: x + 10,
      y: y - 10,
      class: "kicad-ref-des",
    });
    refText.textContent = ref;
    parent.appendChild(refText);

    // Component Value (74LS153)
    const valText = createSVGElement("text", {
      x: x + width / 2,
      y: y + height - 12,
      class: "kicad-comp-value",
      "text-anchor": "middle",
    });
    valText.textContent = value;
    parent.appendChild(valText);

    // Render Pins
    Object.keys(pins).forEach((pinKey) => {
      const pin = pins[pinKey];
      renderPin(pin, parent);
    });
  }

  // Pin Renderer
  function renderPin(pin, parent) {
    const isInput = pin.direction === "input";
    const stubLen = 22;
    const stubEndX = pin.x + pin.dx * stubLen;
    const stubEndY = pin.y + pin.dy * stubLen;

    // Pin Stub Line
    const line = createSVGElement("line", {
      x1: pin.x,
      y1: pin.y,
      x2: stubEndX,
      y2: stubEndY,
      class: "kicad-pin-stub",
    });
    parent.appendChild(line);

    // Inversion bubble if active-low name like ~{1G}
    if (pin.name.startsWith("~")) {
      const bubble = createSVGElement("circle", {
        cx: pin.x + pin.dx * 5,
        cy: pin.y,
        r: 3.5,
        class: "kicad-inversion-bubble",
      });
      parent.appendChild(bubble);
    }

    // Pin Number (KiCad Grey/Red outside)
    if (pin.pin_number) {
      const pNum = createSVGElement("text", {
        x: pin.x + pin.dx * 12,
        y: pin.y - 4,
        class: "kicad-pin-number",
        "text-anchor": pin.dx < 0 ? "end" : "start",
      });
      pNum.textContent = pin.pin_number;
      parent.appendChild(pNum);
    }

    // Pin Name (Inside IC box)
    const cleanName = pin.name.replace(/[~{}]/g, "");
    const pName = createSVGElement("text", {
      x: pin.x - pin.dx * 8,
      y: pin.y + 4,
      class: "kicad-pin-name",
      "text-anchor": pin.dx < 0 ? "start" : "end",
    });
    pName.textContent = cleanName;
    if (pin.name.startsWith("~")) {
      pName.setAttribute("text-decoration", "overline");
    }
    parent.appendChild(pName);

    // Small live logic indicator pill on pin terminal
    if (pin.value !== null && pin.value !== undefined) {
      const isHigh = pin.value === 1;
      const badgeX = pin.x;
      const badgeY = pin.y;

      const badgeBg = createSVGElement("circle", {
        cx: badgeX,
        cy: badgeY,
        r: 6,
        fill: isHigh ? "#10b981" : "#1e293b",
        stroke: isHigh ? "#34d399" : "#64748b",
        "stroke-width": 1,
      });
      const badgeText = createSVGElement("text", {
        x: badgeX,
        y: badgeY,
        class: "kicad-pin-val-badge",
        fill: "#ffffff",
      });
      badgeText.textContent = pin.value;

      parent.appendChild(badgeBg);
      parent.appendChild(badgeText);
    }
  }

  // 2. NOT Gate (Inverter U1 74LS04)
  function renderNotGate(comp, parent) {
    const { x, y, width, height, ref, value, pins } = comp;

    // Ref Des & Value
    const refText = createSVGElement("text", { x: x + 5, y: y - 8, class: "kicad-ref-des" });
    refText.textContent = ref;
    parent.appendChild(refText);

    const valText = createSVGElement("text", { x: x + width / 2, y: y + height + 14, class: "kicad-comp-value", "text-anchor": "middle" });
    valText.textContent = value;
    parent.appendChild(valText);

    // Triangle body
    const p1 = `${x + 10},${y + 4}`;
    const p2 = `${x + 10},${y + height - 4}`;
    const p3 = `${x + width - 14},${y + height / 2}`;
    const triangle = createSVGElement("polygon", {
      points: `${p1} ${p2} ${p3}`,
      class: "kicad-gate-symbol",
    });
    parent.appendChild(triangle);

    // Inversion circle at apex
    const circle = createSVGElement("circle", {
      cx: x + width - 8,
      cy: y + height / 2,
      r: 4.5,
      class: "kicad-inversion-bubble",
    });
    parent.appendChild(circle);

    // Pins (1A and 1Y)
    Object.keys(pins).forEach((pKey) => {
      renderPin(pins[pKey], parent);
    });
  }

  // 3. OR Gate (U3 74LS32)
  function renderOrGate(comp, parent) {
    const { x, y, width, height, ref, value, pins } = comp;

    const refText = createSVGElement("text", { x: x + 10, y: y - 8, class: "kicad-ref-des" });
    refText.textContent = ref;
    parent.appendChild(refText);

    const valText = createSVGElement("text", { x: x + width / 2, y: y + height + 14, class: "kicad-comp-value", "text-anchor": "middle" });
    valText.textContent = value;
    parent.appendChild(valText);

    // Standard KiCad Curved OR Gate outline
    const leftX = x + 10;
    const rightX = x + width - 6;
    const topY = y + 4;
    const botY = y + height - 4;
    const midY = y + height / 2;

    const d = `M ${leftX},${topY} 
               Q ${leftX + 16},${midY} ${leftX},${botY} 
               Q ${leftX + 35},${botY} ${rightX},${midY} 
               Q ${leftX + 35},${topY} ${leftX},${topY} Z`;

    const orShape = createSVGElement("path", {
      d: d,
      class: "kicad-gate-symbol",
    });
    parent.appendChild(orShape);

    // Pins
    Object.keys(pins).forEach((pKey) => {
      renderPin(pins[pKey], parent);
    });
  }

  // 4. Port Symbol (Inputs, Selects, Output)
  function renderPort(comp, parent) {
    const { x, y, width, height, ref, value, pins, type } = comp;
    const isHigh = value === "1";
    const isOutput = type === "port_output";

    // Port chevron shape
    let d = "";
    if (isOutput) {
      // Output chevron pointing right
      d = `M ${x},${y} L ${x + width - 12},${y} L ${x + width},${y + height / 2} L ${x + width - 12},${y + height} L ${x},${y + height} Z`;
    } else {
      // Input chevron pointing right into circuit
      d = `M ${x},${y} L ${x + width - 10},${y} L ${x + width},${y + height / 2} L ${x + width - 10},${y + height} L ${x},${y + height} Z`;
    }

    const portShape = createSVGElement("path", {
      d: d,
      class: "kicad-port-shape",
      fill: isHigh ? "#10b981" : "#e2e8f0",
      stroke: isHigh ? "#059669" : "#64748b",
    });
    parent.appendChild(portShape);

    const text = createSVGElement("text", {
      x: x + width / 2 - 4,
      y: y + height / 2,
      class: "kicad-port-text",
      fill: isHigh ? "#ffffff" : "#1e293b",
    });
    text.textContent = `${ref}=${value}`;
    parent.appendChild(text);

    // Pins
    Object.keys(pins).forEach((pKey) => {
      renderPin(pins[pKey], parent);
    });
  }

  // KiCad Border Frame & Title Block
  function drawKiCadFrameAndGrid(parent) {
    const w = 1200;
    const h = 740;

    // Grid dots
    const gridG = createSVGElement("g", { id: "kicad-grid" });
    for (let gx = 40; gx <= w - 40; gx += 20) {
      for (let gy = 40; gy <= h - 40; gy += 20) {
        const dot = createSVGElement("circle", {
          cx: gx,
          cy: gy,
          r: 0.75,
          fill: "var(--kicad-grid-dot)",
        });
        gridG.appendChild(dot);
      }
    }
    parent.appendChild(gridG);

    // Outer & Inner Red Borders
    const frameG = createSVGElement("g", { id: "kicad-border-frame" });

    // Outer line
    frameG.appendChild(createSVGElement("rect", {
      x: 18, y: 18, width: w - 36, height: h - 36,
      class: "kicad-frame-line",
    }));

    // Inner line
    frameG.appendChild(createSVGElement("rect", {
      x: 32, y: 32, width: w - 64, height: h - 64,
      class: "kicad-frame-line-thin",
    }));

    // Zone reference marks (1..6 on top/bottom, A..D on left/right)
    const xZones = ["1", "2", "3", "4", "5", "6"];
    const colStep = (w - 64) / xZones.length;
    xZones.forEach((zone, idx) => {
      const zX = 32 + (idx + 0.5) * colStep;
      // top label
      const t = createSVGElement("text", { x: zX, y: 25, class: "kicad-zone-label" });
      t.textContent = zone;
      frameG.appendChild(t);

      // bottom label
      const b = createSVGElement("text", { x: zX, y: h - 23, class: "kicad-zone-label" });
      b.textContent = zone;
      frameG.appendChild(b);
    });

    const yZones = ["A", "B", "C", "D"];
    const rowStep = (h - 64) / yZones.length;
    yZones.forEach((zone, idx) => {
      const zY = 32 + (idx + 0.5) * rowStep;
      // left label
      const l = createSVGElement("text", { x: 25, y: zY, class: "kicad-zone-label" });
      l.textContent = zone;
      frameG.appendChild(l);

      // right label
      const r = createSVGElement("text", { x: w - 23, y: zY, class: "kicad-zone-label" });
      r.textContent = zone;
      frameG.appendChild(r);
    });

    // KiCad Bottom-Right Title Block
    const tbW = 320;
    const tbH = 95;
    const tbX = w - 32 - tbW;
    const tbY = h - 32 - tbH;

    const tbG = createSVGElement("g", { id: "kicad-title-block" });

    // Block background & frame
    tbG.appendChild(createSVGElement("rect", {
      x: tbX, y: tbY, width: tbW, height: tbH,
      class: "kicad-title-block-bg",
    }));

    // Horizontal dividers
    tbG.appendChild(createSVGElement("line", { x1: tbX, y1: tbY + 28, x2: tbX + tbW, y2: tbY + 28, class: "kicad-title-block-divider" }));
    tbG.appendChild(createSVGElement("line", { x1: tbX, y1: tbY + 54, x2: tbX + tbW, y2: tbY + 54, class: "kicad-title-block-divider" }));
    tbG.appendChild(createSVGElement("line", { x1: tbX, y1: tbY + 74, x2: tbX + tbW, y2: tbY + 74, class: "kicad-title-block-divider" }));

    // Vertical dividers
    tbG.appendChild(createSVGElement("line", { x1: tbX + 160, y1: tbY + 54, x2: tbX + 160, y2: tbY + tbH, class: "kicad-title-block-divider" }));
    tbG.appendChild(createSVGElement("line", { x1: tbX + 240, y1: tbY + 54, x2: tbX + 240, y2: tbY + 74, class: "kicad-title-block-divider" }));

    // Text in Title Block
    const today = new Date().toISOString().slice(0, 10);

    addTBText(tbG, tbX + 10, tbY + 12, "TITLE:", "kicad-title-label");
    addTBText(tbG, tbX + 50, tbY + 18, "8:1 MULTIPLEXER (IC 74LS153)", "kicad-title-heading");

    addTBText(tbG, tbX + 10, tbY + 38, "FILE:", "kicad-title-label");
    addTBText(tbG, tbX + 45, tbY + 44, "mux_8to1.kicad_sch", "kicad-title-val");

    addTBText(tbG, tbX + 10, tbY + 63, "DATE:", "kicad-title-label");
    addTBText(tbG, tbX + 45, tbY + 66, today, "kicad-title-val");

    addTBText(tbG, tbX + 168, tbY + 63, "REV:", "kicad-title-label");
    addTBText(tbG, tbX + 198, tbY + 66, "v1.0", "kicad-title-val");

    addTBText(tbG, tbX + 248, tbY + 63, "SIZE:", "kicad-title-label");
    addTBText(tbG, tbX + 280, tbY + 66, "A4", "kicad-title-val");

    addTBText(tbG, tbX + 10, tbY + 83, "COMPANY:", "kicad-title-label");
    addTBText(tbG, tbX + 65, tbY + 86, "Logic Sim Suite | KiCad E.D.A.", "kicad-title-val");

    addTBText(tbG, tbX + 252, tbY + 83, "SHEET:", "kicad-title-label");
    addTBText(tbG, tbX + 292, tbY + 86, "1/1", "kicad-title-val");

    frameG.appendChild(tbG);
    parent.appendChild(frameG);
  }

  function addTBText(parent, x, y, content, className) {
    const text = createSVGElement("text", { x: x, y: y, class: className });
    text.textContent = content;
    parent.appendChild(text);
  }

  // Render info box and flow steps
  function renderInfoPanels(data) {
    const finalY = data.state.output;
    const details = data.state.details || {};

    const led = document.getElementById("output-led");
    if (led) {
      led.className = `output-led ${finalY === 1 ? "on" : ""}`;
      led.textContent = finalY;
    }

    const pathDesc = document.getElementById("active-path-desc");
    if (pathDesc) {
      if (data.state.strobe === 1) {
        pathDesc.textContent = "Disabled (Strobe ~G = 1 -> Output Forced 0)";
      } else {
        const sec = details.active_section === 1 ? "Section 1 (U2A)" : "Section 2 (U2B)";
        const selIdx = parseInt(data.state.select, 2);
        pathDesc.textContent = `${sec} active | Channel D${selIdx} routed to Y`;
      }
    }

    // Step cards
    const elS2 = document.getElementById("flow-s2-val");
    const elS10 = document.getElementById("flow-s10-val");
    const elU2A = document.getElementById("flow-u2a-val");
    const elU2B = document.getElementById("flow-u2b-val");
    const elU3 = document.getElementById("flow-u3-val");

    if (elS2) elS2.textContent = `S2 = ${details.s2 ?? state.select[0]} (~S2 = ${details.s2_inv ?? (1 - parseInt(state.select[0]))})`;
    if (elS10) elS10.textContent = `B = ${details.s1 ?? state.select[1]}, A = ${details.s0 ?? state.select[2]}`;
    if (elU2A) elU2A.textContent = `1Y = ${details.section1_gated ?? 0} (Raw: ${details.section1_out ?? 0})`;
    if (elU2B) elU2B.textContent = `2Y = ${details.section2_gated ?? 0} (Raw: ${details.section2_out ?? 0})`;
    if (elU3) elU3.textContent = `Y = 1Y OR 2Y = ${finalY}`;
  }

  // Pure Client Simulation Fallback (Mirrors backend/circuit_mux.py)
  function generateClientSideCircuit(select, inputs, strobe) {
    const s2 = parseInt(select[0], 10);
    const s1 = parseInt(select[1], 10);
    const s0 = parseInt(select[2], 10);
    const s2_inv = 1 - s2;

    const selSub = select.slice(1);
    const subIdx = parseInt(selSub, 2);

    const raw_y1 = inputs[subIdx];
    const raw_y2 = inputs[4 + subIdx];

    const g1_val = s2 | strobe;
    const g2_val = s2_inv | strobe;

    const y1_val = g1_val === 1 ? 0 : raw_y1;
    const y2_val = g2_val === 1 ? 0 : raw_y2;
    const final_y = y1_val | y2_val;

    // Components coordinates
    const components = [];

    // Inputs D0..D3
    for (let i = 0; i < 4; i++) {
      const yPos = 130 + i * 35;
      components.push({
        id: `PORT_D${i}`, ref: `D${i}`, value: String(inputs[i]), type: "port_input",
        x: 80, y: yPos - 10, width: 50, height: 20,
        pins: { out: { name: `D${i}`, pin_number: "", x: 130, y: yPos, dx: 1.0, dy: 0.0, value: inputs[i], direction: "output" } },
      });
    }

    // Inputs D4..D7
    for (let i = 4; i < 8; i++) {
      const yPos = 380 + (i - 4) * 35;
      components.push({
        id: `PORT_D${i}`, ref: `D${i}`, value: String(inputs[i]), type: "port_input",
        x: 80, y: yPos - 10, width: 50, height: 20,
        pins: { out: { name: `D${i}`, pin_number: "", x: 130, y: yPos, dx: 1.0, dy: 0.0, value: inputs[i], direction: "output" } },
      });
    }

    // Selects S2, S1, S0
    const selMeta = [["S2", s2, 290], ["S1", s1, 570], ["S0", s0, 610]];
    selMeta.forEach(([sName, sVal, yPos]) => {
      components.push({
        id: `PORT_${sName}`, ref: sName, value: String(sVal), type: "port_select",
        x: 80, y: yPos - 10, width: 50, height: 20,
        pins: { out: { name: sName, pin_number: "", x: 130, y: yPos, dx: 1.0, dy: 0.0, value: sVal, direction: "output" } },
      });
    });

    // Strobe ~G
    components.push({
      id: "PORT_STROBE", ref: "~{G}", value: String(strobe), type: "port_select",
      x: 80, y: 70, width: 50, height: 20,
      pins: { out: { name: "~{G}", pin_number: "", x: 130, y: 80, dx: 1.0, dy: 0.0, value: strobe, direction: "output" } },
    });

    // Inverter U1 (74LS04)
    components.push({
      id: "U1", ref: "U1", value: "74LS04", type: "not_gate",
      x: 230, y: 270, width: 60, height: 40,
      pins: {
        A: { name: "1A", pin_number: "1", x: 230, y: 290, dx: -1.0, dy: 0.0, value: s2, direction: "input" },
        Y: { name: "1Y", pin_number: "2", x: 290, y: 290, dx: 1.0, dy: 0.0, value: s2_inv, direction: "output" },
      },
    });

    // IC U2A (74LS153)
    components.push({
      id: "U2A", ref: "U2A", value: "74LS153", type: "ic_block",
      x: 420, y: 110, width: 160, height: 210,
      pins: {
        "1C0": { name: "1C0", pin_number: "6", x: 420, y: 130, dx: -1.0, dy: 0.0, value: inputs[0], direction: "input" },
        "1C1": { name: "1C1", pin_number: "5", x: 420, y: 165, dx: -1.0, dy: 0.0, value: inputs[1], direction: "input" },
        "1C2": { name: "1C2", pin_number: "4", x: 420, y: 200, dx: -1.0, dy: 0.0, value: inputs[2], direction: "input" },
        "1C3": { name: "1C3", pin_number: "3", x: 420, y: 235, dx: -1.0, dy: 0.0, value: inputs[3], direction: "input" },
        "1G":  { name: "~{1G}", pin_number: "1", x: 420, y: 270, dx: -1.0, dy: 0.0, value: g1_val, direction: "input" },
        "B":   { name: "B", pin_number: "2", x: 420, y: 295, dx: -1.0, dy: 0.0, value: s1, direction: "input" },
        "A":   { name: "A", pin_number: "14", x: 420, y: 310, dx: -1.0, dy: 0.0, value: s0, direction: "input" },
        "1Y":  { name: "1Y", pin_number: "7", x: 580, y: 170, dx: 1.0, dy: 0.0, value: y1_val, direction: "output" },
      },
    });

    // IC U2B (74LS153)
    components.push({
      id: "U2B", ref: "U2B", value: "74LS153", type: "ic_block",
      x: 420, y: 360, width: 160, height: 210,
      pins: {
        "2C0": { name: "2C0", pin_number: "10", x: 420, y: 380, dx: -1.0, dy: 0.0, value: inputs[4], direction: "input" },
        "2C1": { name: "2C1", pin_number: "11", x: 420, y: 415, dx: -1.0, dy: 0.0, value: inputs[5], direction: "input" },
        "2C2": { name: "2C2", pin_number: "12", x: 420, y: 450, dx: -1.0, dy: 0.0, value: inputs[6], direction: "input" },
        "2C3": { name: "2C3", pin_number: "13", x: 420, y: 485, dx: -1.0, dy: 0.0, value: inputs[7], direction: "input" },
        "2G":  { name: "~{2G}", pin_number: "15", x: 420, y: 520, dx: -1.0, dy: 0.0, value: g2_val, direction: "input" },
        "B":   { name: "B", pin_number: "2", x: 420, y: 545, dx: -1.0, dy: 0.0, value: s1, direction: "input" },
        "A":   { name: "A", pin_number: "14", x: 420, y: 560, dx: -1.0, dy: 0.0, value: s0, direction: "input" },
        "2Y":  { name: "2Y", pin_number: "9", x: 580, y: 420, dx: 1.0, dy: 0.0, value: y2_val, direction: "output" },
      },
    });

    // U3 (74LS32)
    components.push({
      id: "U3", ref: "U3", value: "74LS32", type: "or_gate",
      x: 720, y: 270, width: 70, height: 60,
      pins: {
        "1A": { name: "1A", pin_number: "1", x: 720, y: 285, dx: -1.0, dy: 0.0, value: y1_val, direction: "input" },
        "1B": { name: "1B", pin_number: "2", x: 720, y: 315, dx: -1.0, dy: 0.0, value: y2_val, direction: "input" },
        "1Y": { name: "1Y", pin_number: "3", x: 790, y: 300, dx: 1.0, dy: 0.0, value: final_y, direction: "output" },
      },
    });

    // Output Port Y
    components.push({
      id: "PORT_Y", ref: "Y", value: String(final_y), type: "port_output",
      x: 880, y: 290, width: 60, height: 20,
      pins: { in: { name: "Y", pin_number: "", x: 880, y: 300, dx: -1.0, dy: 0.0, value: final_y, direction: "input" } },
    });

    // Wires
    const wires = [];
    for (let i = 0; i < 4; i++) {
      wires.push({ id: `w_d${i}`, net: `D${i}`, path: `M 130,${130 + i * 35} L 420,${130 + i * 35}`, value: inputs[i] });
    }
    for (let i = 4; i < 8; i++) {
      wires.push({ id: `w_d${i}`, net: `D${i}`, path: `M 130,${380 + (i - 4) * 35} L 420,${380 + (i - 4) * 35}`, value: inputs[i] });
    }
    wires.push({ id: "w_s2_main", net: "S2", path: "M 130,290 L 230,290", value: s2 });
    wires.push({ id: "w_s2_g1", net: "S2", path: "M 180,290 L 180,270 L 420,270", value: s2 });
    wires.push({ id: "w_s2_inv_g2", net: "S2_INV", path: "M 290,290 L 330,290 L 330,520 L 420,520", value: s2_inv });
    wires.push({ id: "w_s1_bus", net: "S1", path: "M 130,570 L 360,570 L 360,545 L 420,545", value: s1 });
    wires.push({ id: "w_s1_u2a", net: "S1", path: "M 360,545 L 360,295 L 420,295", value: s1 });
    wires.push({ id: "w_s0_bus", net: "S0", path: "M 130,610 L 380,610 L 380,560 L 420,560", value: s0 });
    wires.push({ id: "w_s0_u2a", net: "S0", path: "M 380,560 L 380,310 L 420,310", value: s0 });
    wires.push({ id: "w_u2a_y1", net: "1Y", path: "M 580,170 L 660,170 L 660,285 L 720,285", value: y1_val });
    wires.push({ id: "w_u2b_y2", net: "2Y", path: "M 580,420 L 660,420 L 660,315 L 720,315", value: y2_val });
    wires.push({ id: "w_final_y", net: "Y", path: "M 790,300 L 880,300", value: final_y });

    // Junctions
    const junctions = [
      { x: 180, y: 290, value: s2 },
      { x: 360, y: 545, value: s1 },
      { x: 380, y: 560, value: s0 },
    ];

    return {
      circuit_id: "mux_8to1",
      title: "8:1 Multiplexer (Dual 74LS153 + Inverter + OR)",
      sheet_info: { title: "8:1 Multiplexer (IC 74LS153 Composition)", file: "mux_8to1.kicad_sch", size: "A4", rev: "v1.0" },
      canvas: { width: 1200, height: 740 },
      components,
      wires,
      junctions,
      state: {
        select,
        inputs,
        strobe,
        output: final_y,
        details: {
          s2, s1, s0, s2_inv,
          section1_out: raw_y1, section2_out: raw_y2,
          section1_gated: y1_val, section2_gated: y2_val,
          active_section: strobe === 1 ? 0 : (s2 === 1 ? 2 : 1),
        },
      },
    };
  }

  // Pan and Zoom Controller
  function initPanZoom() {
    const viewport = document.querySelector(".schematic-viewport");
    if (!viewport || !svgRoot) return;

    // Wheel zoom
    viewport.addEventListener("wheel", (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY > 0 ? 1.15 : 0.85;
      zoom(zoomFactor, e.offsetX, e.offsetY);
    }, { passive: false });

    // Mouse drag pan
    viewport.addEventListener("mousedown", (e) => {
      if (e.button !== 0) return; // Left button only
      state.isPanning = true;
      state.panStart = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener("mousemove", (e) => {
      if (!state.isPanning) return;
      const dx = e.clientX - state.panStart.x;
      const dy = e.clientY - state.panStart.y;
      state.panStart = { x: e.clientX, y: e.clientY };

      const rect = svgRoot.getBoundingClientRect();
      const scaleX = state.viewBox.w / rect.width;
      const scaleY = state.viewBox.h / rect.height;

      state.viewBox.x -= dx * scaleX;
      state.viewBox.y -= dy * scaleY;
      applyViewBox();
    });

    window.addEventListener("mouseup", () => {
      state.isPanning = false;
    });
  }

  function zoom(factor, mouseX, mouseY) {
    const rect = svgRoot.getBoundingClientRect();
    const mx = mouseX !== undefined ? mouseX : rect.width / 2;
    const my = mouseY !== undefined ? mouseY : rect.height / 2;

    const svgX = state.viewBox.x + (mx / rect.width) * state.viewBox.w;
    const svgY = state.viewBox.y + (my / rect.height) * state.viewBox.h;

    const newW = state.viewBox.w * factor;
    const newH = state.viewBox.h * factor;

    // Constrain zoom levels (0.2x to 5x)
    if (newW < 240 || newW > 6000) return;

    state.viewBox.x = svgX - (mx / rect.width) * newW;
    state.viewBox.y = svgY - (my / rect.height) * newH;
    state.viewBox.w = newW;
    state.viewBox.h = newH;

    applyViewBox();
  }

  function resetZoom() {
    state.viewBox = { ...state.initialViewBox };
    applyViewBox();
  }

  function applyViewBox() {
    svgRoot.setAttribute(
      "viewBox",
      `${state.viewBox.x} ${state.viewBox.y} ${state.viewBox.w} ${state.viewBox.h}`
    );
  }

  // Utility helper for SVG elements
  function createSVGElement(tag, attrs = {}) {
    const el = document.createElementNS(SVG_NS, tag);
    Object.keys(attrs).forEach((k) => el.setAttribute(k, attrs[k]));
    return el;
  }
})();
