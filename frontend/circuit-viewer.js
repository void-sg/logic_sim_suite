/**
 * KiCad-Style Live Schematic Viewer Engine
 * Unified renderer for:
 * 1. 8:1 Multiplexer (IC 74LS153 Composite)
 * 2. 4:1 Multiplexer (IC 74LS153 Single Section)
 * 3. 4-Bit Magnitude Comparator (IC 74LS85)
 * 4. 4-Bit Adder / Subtractor (IC 74LS83 + 74LS86)
 */

(function () {
  const API_BASE = "http://127.0.0.1:8000";
  const SVG_NS = "http://www.w3.org/2000/svg";

  // Application State
  const state = {
    activeCircuit: "mux_8to1",
    apiOnline: false,

    // Circuit 1: 8:1 MUX
    mux8: {
      select: "000",
      inputs: [0, 0, 0, 0, 0, 0, 0, 0],
      strobe: 0,
    },

    // Circuit 2: 4:1 MUX
    mux4: {
      select: "00",
      inputs: [0, 0, 0, 0],
      strobe: 0,
    },

    // Circuit 3: 4-Bit Comparator
    comp4: {
      a: "0000",
      b: "0000",
      cascade_gt: 0,
      cascade_lt: 0,
      cascade_eq: 1,
    },

    // Circuit 4: 4-Bit Adder/Subtractor
    addSub4: {
      a: "0000",
      b: "0000",
      mode: 0, // 0 = ADD, 1 = SUB
      cin: null,
    },

    // Pan & Zoom
    viewBox: { x: 0, y: 0, w: 1200, h: 740 },
    initialViewBox: { x: 0, y: 0, w: 1200, h: 740 },
    isPanning: false,
    panStart: { x: 0, y: 0 },
  };

  // DOM Elements
  let svgRoot = null;
  let zoomGroup = null;
  let frameLayer = null;
  let wireLayer = null;
  let junctionLayer = null;
  let componentLayer = null;

  document.addEventListener("DOMContentLoaded", () => {
    initDOM();
    initPanZoom();
    bindEvents();
    switchCircuit("mux_8to1");
  });

  function initDOM() {
    svgRoot = document.getElementById("schematic-svg");
    if (!svgRoot) return;

    svgRoot.innerHTML = "";
    zoomGroup = createSVGElement("g", { id: "zoom-group" });
    svgRoot.appendChild(zoomGroup);

    frameLayer = createSVGElement("g", { id: "frame-layer" });
    wireLayer = createSVGElement("g", { id: "wire-layer" });
    junctionLayer = createSVGElement("g", { id: "junction-layer" });
    componentLayer = createSVGElement("g", { id: "component-layer" });

    zoomGroup.appendChild(frameLayer);
    zoomGroup.appendChild(wireLayer);
    zoomGroup.appendChild(junctionLayer);
    zoomGroup.appendChild(componentLayer);

    // Zoom buttons
    document.getElementById("btn-zoom-in")?.addEventListener("click", () => zoom(0.8));
    document.getElementById("btn-zoom-out")?.addEventListener("click", () => zoom(1.25));
    document.getElementById("btn-zoom-reset")?.addEventListener("click", () => resetZoom());
  }

  function bindEvents() {
    // Circuit selector tabs
    document.querySelectorAll(".circuit-tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const cId = btn.getAttribute("data-circuit");
        switchCircuit(cId);
      });
    });

    // 8:1 MUX bit buttons
    document.querySelectorAll("#deck-mux8 .bit-toggle-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const type = btn.getAttribute("data-type");
        const idx = parseInt(btn.getAttribute("data-index"), 10);
        if (type === "select") {
          const sArr = state.mux8.select.split("");
          sArr[idx] = sArr[idx] === "1" ? "0" : "1";
          state.mux8.select = sArr.join("");
        } else if (type === "input") {
          state.mux8.inputs[idx] = state.mux8.inputs[idx] === 1 ? 0 : 1;
        } else if (type === "strobe") {
          state.mux8.strobe = state.mux8.strobe === 0 ? 1 : 0;
        }
        updateCircuit();
      });
    });

    // 4:1 MUX bit buttons
    document.querySelectorAll("#deck-mux4 .bit-toggle-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const type = btn.getAttribute("data-type");
        const idx = parseInt(btn.getAttribute("data-index"), 10);
        if (type === "select") {
          const sArr = state.mux4.select.split("");
          sArr[idx] = sArr[idx] === "1" ? "0" : "1";
          state.mux4.select = sArr.join("");
        } else if (type === "input") {
          state.mux4.inputs[idx] = state.mux4.inputs[idx] === 1 ? 0 : 1;
        } else if (type === "strobe") {
          state.mux4.strobe = state.mux4.strobe === 0 ? 1 : 0;
        }
        updateCircuit();
      });
    });

    // 4-bit Comparator bit buttons
    document.querySelectorAll("#deck-comp4 .bit-toggle-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const group = btn.getAttribute("data-group");
        const idx = parseInt(btn.getAttribute("data-index"), 10);
        if (group === "a") {
          const aArr = state.comp4.a.split("");
          aArr[idx] = aArr[idx] === "1" ? "0" : "1";
          state.comp4.a = aArr.join("");
        } else if (group === "b") {
          const bArr = state.comp4.b.split("");
          bArr[idx] = bArr[idx] === "1" ? "0" : "1";
          state.comp4.b = bArr.join("");
        } else if (group === "cascade") {
          const casType = btn.getAttribute("data-cas");
          if (casType === "gt") state.comp4.cascade_gt = 1 - state.comp4.cascade_gt;
          if (casType === "eq") state.comp4.cascade_eq = 1 - state.comp4.cascade_eq;
          if (casType === "lt") state.comp4.cascade_lt = 1 - state.comp4.cascade_lt;
        }
        updateCircuit();
      });
    });

    // 4-bit Adder/Subtractor bit buttons
    document.querySelectorAll("#deck-addsub .bit-toggle-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const group = btn.getAttribute("data-group");
        const idx = parseInt(btn.getAttribute("data-index"), 10);
        if (group === "a") {
          const aArr = state.addSub4.a.split("");
          aArr[idx] = aArr[idx] === "1" ? "0" : "1";
          state.addSub4.a = aArr.join("");
        } else if (group === "b") {
          const bArr = state.addSub4.b.split("");
          bArr[idx] = bArr[idx] === "1" ? "0" : "1";
          state.addSub4.b = bArr.join("");
        } else if (group === "mode") {
          state.addSub4.mode = 1 - state.addSub4.mode;
        }
        updateCircuit();
      });
    });

    // Mode buttons inside adder/subtractor deck
    document.getElementById("btn-sub-add")?.addEventListener("click", () => {
      state.addSub4.mode = 0;
      updateCircuit();
    });
    document.getElementById("btn-sub-sub")?.addEventListener("click", () => {
      state.addSub4.mode = 1;
      updateCircuit();
    });

    // Presets
    document.querySelectorAll("[data-preset]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const preset = btn.getAttribute("data-preset");
        applyPreset(preset);
      });
    });
  }

  function switchCircuit(circuitId) {
    state.activeCircuit = circuitId;

    // Update tabs UI
    document.querySelectorAll(".circuit-tab-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-circuit") === circuitId);
    });

    // Toggle control decks
    document.querySelectorAll(".circuit-deck-section").forEach((deck) => {
      deck.style.display = deck.id === `deck-${getDeckSuffix(circuitId)}` ? "block" : "none";
    });

    // Toggle flow explainer cards
    document.querySelectorAll(".circuit-flow-card").forEach((card) => {
      card.style.display = card.id === `flow-${getDeckSuffix(circuitId)}` ? "block" : "none";
    });

    updateCircuit();
  }

  function getDeckSuffix(circuitId) {
    if (circuitId === "mux_8to1") return "mux8";
    if (circuitId === "mux_4to1") return "mux4";
    if (circuitId === "comparator_4bit") return "comp4";
    if (circuitId === "adder_subtractor_4bit") return "addsub";
    return "mux8";
  }

  function applyPreset(preset) {
    const c = state.activeCircuit;
    if (c === "mux_8to1") {
      if (preset === "d3-active") { state.mux8.select = "011"; state.mux8.inputs = [0,0,0,1,0,0,0,0]; state.mux8.strobe = 0; }
      else if (preset === "d6-active") { state.mux8.select = "110"; state.mux8.inputs = [0,0,0,0,0,0,1,0]; state.mux8.strobe = 0; }
      else if (preset === "all-ones") { state.mux8.inputs = [1,1,1,1,1,1,1,1]; }
      else if (preset === "strobe-disabled") { state.mux8.strobe = 1; }
      else if (preset === "reset") { state.mux8.select = "000"; state.mux8.inputs = [0,0,0,0,0,0,0,0]; state.mux8.strobe = 0; }
    } else if (c === "mux_4to1") {
      if (preset === "d2-active") { state.mux4.select = "10"; state.mux4.inputs = [0,0,1,0]; state.mux4.strobe = 0; }
      else if (preset === "d3-active") { state.mux4.select = "11"; state.mux4.inputs = [0,0,0,1]; state.mux4.strobe = 0; }
      else if (preset === "all-ones") { state.mux4.inputs = [1,1,1,1]; }
      else if (preset === "strobe-disabled") { state.mux4.strobe = 1; }
      else if (preset === "reset") { state.mux4.select = "00"; state.mux4.inputs = [0,0,0,0]; state.mux4.strobe = 0; }
    } else if (c === "comparator_4bit") {
      if (preset === "a-gt-b") { state.comp4.a = "1010"; state.comp4.b = "0101"; state.comp4.cascade_gt = 0; state.comp4.cascade_lt = 0; state.comp4.cascade_eq = 1; }
      else if (preset === "a-lt-b") { state.comp4.a = "0011"; state.comp4.b = "1100"; state.comp4.cascade_gt = 0; state.comp4.cascade_lt = 0; state.comp4.cascade_eq = 1; }
      else if (preset === "a-eq-b") { state.comp4.a = "1001"; state.comp4.b = "1001"; state.comp4.cascade_gt = 0; state.comp4.cascade_lt = 0; state.comp4.cascade_eq = 1; }
      else if (preset === "cas-gt") { state.comp4.a = "0110"; state.comp4.b = "0110"; state.comp4.cascade_gt = 1; state.comp4.cascade_lt = 0; state.comp4.cascade_eq = 0; }
      else if (preset === "reset") { state.comp4.a = "0000"; state.comp4.b = "0000"; state.comp4.cascade_gt = 0; state.comp4.cascade_lt = 0; state.comp4.cascade_eq = 1; }
    } else if (c === "adder_subtractor_4bit") {
      if (preset === "add-basic") { state.addSub4.mode = 0; state.addSub4.a = "0101"; state.addSub4.b = "0011"; }
      else if (preset === "add-carry") { state.addSub4.mode = 0; state.addSub4.a = "1100"; state.addSub4.b = "0110"; }
      else if (preset === "sub-pos") { state.addSub4.mode = 1; state.addSub4.a = "1001"; state.addSub4.b = "0100"; }
      else if (preset === "sub-borrow") { state.addSub4.mode = 1; state.addSub4.a = "0011"; state.addSub4.b = "0111"; }
      else if (preset === "reset") { state.addSub4.mode = 0; state.addSub4.a = "0000"; state.addSub4.b = "0000"; }
    }
    updateCircuit();
  }

  // Fetch or simulate
  async function updateCircuit() {
    updateButtonStates();

    const c = state.activeCircuit;
    let url = "";

    if (c === "mux_8to1") {
      url = `${API_BASE}/circuit/mux-8to1?select=${state.mux8.select}&inputs=${state.mux8.inputs.join(",")}&strobe=${state.mux8.strobe}`;
    } else if (c === "mux_4to1") {
      url = `${API_BASE}/circuit/mux-4to1?select=${state.mux4.select}&inputs=${state.mux4.inputs.join(",")}&strobe=${state.mux4.strobe}`;
    } else if (c === "comparator_4bit") {
      url = `${API_BASE}/circuit/comparator-4bit?a=${state.comp4.a}&b=${state.comp4.b}&cascade_gt=${state.comp4.cascade_gt}&cascade_lt=${state.comp4.cascade_lt}&cascade_eq=${state.comp4.cascade_eq}`;
    } else if (c === "adder_subtractor_4bit") {
      url = `${API_BASE}/circuit/adder-subtractor-4bit?a=${state.addSub4.a}&b=${state.addSub4.b}&mode=${state.addSub4.mode}`;
    }

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
      data = generateClientSideFallback(c);
      setApiStatus(false);
    }

    // Set canvas dimensions
    const cWidth = data.canvas?.width || 1200;
    const cHeight = data.canvas?.height || 740;
    state.initialViewBox = { x: 0, y: 0, w: cWidth, h: cHeight };
    state.viewBox = { ...state.initialViewBox };
    applyViewBox();

    // Render frame & grid
    drawKiCadFrameAndGrid(frameLayer, cWidth, cHeight, data.sheet_info || {});

    // Render wires, junctions, and components
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
    const c = state.activeCircuit;

    if (c === "mux_8to1") {
      for (let i = 0; i < 3; i++) {
        const btn = document.querySelector(`#deck-mux8 .bit-toggle-btn[data-type="select"][data-index="${i}"]`);
        if (btn) {
          const val = state.mux8.select[i];
          btn.classList.toggle("active", val === "1");
          btn.querySelector(".bit-val").textContent = val;
        }
      }
      for (let i = 0; i < 8; i++) {
        const btn = document.querySelector(`#deck-mux8 .bit-toggle-btn[data-type="input"][data-index="${i}"]`);
        if (btn) {
          const val = state.mux8.inputs[i];
          btn.classList.toggle("active", val === 1);
          btn.querySelector(".bit-val").textContent = val;
        }
      }
      const strobeBtn = document.querySelector(`#deck-mux8 .bit-toggle-btn[data-type="strobe"]`);
      if (strobeBtn) {
        strobeBtn.classList.toggle("active", state.mux8.strobe === 1);
        strobeBtn.querySelector(".bit-val").textContent = state.mux8.strobe;
      }
    } else if (c === "mux_4to1") {
      for (let i = 0; i < 2; i++) {
        const btn = document.querySelector(`#deck-mux4 .bit-toggle-btn[data-type="select"][data-index="${i}"]`);
        if (btn) {
          const val = state.mux4.select[i];
          btn.classList.toggle("active", val === "1");
          btn.querySelector(".bit-val").textContent = val;
        }
      }
      for (let i = 0; i < 4; i++) {
        const btn = document.querySelector(`#deck-mux4 .bit-toggle-btn[data-type="input"][data-index="${i}"]`);
        if (btn) {
          const val = state.mux4.inputs[i];
          btn.classList.toggle("active", val === 1);
          btn.querySelector(".bit-val").textContent = val;
        }
      }
      const strobeBtn = document.querySelector(`#deck-mux4 .bit-toggle-btn[data-type="strobe"]`);
      if (strobeBtn) {
        strobeBtn.classList.toggle("active", state.mux4.strobe === 1);
        strobeBtn.querySelector(".bit-val").textContent = state.mux4.strobe;
      }
    } else if (c === "comparator_4bit") {
      for (let i = 0; i < 4; i++) {
        const btnA = document.querySelector(`#deck-comp4 .bit-toggle-btn[data-group="a"][data-index="${i}"]`);
        if (btnA) {
          const val = state.comp4.a[i];
          btnA.classList.toggle("active", val === "1");
          btnA.querySelector(".bit-val").textContent = val;
        }
        const btnB = document.querySelector(`#deck-comp4 .bit-toggle-btn[data-group="b"][data-index="${i}"]`);
        if (btnB) {
          const val = state.comp4.b[i];
          btnB.classList.toggle("active", val === "1");
          btnB.querySelector(".bit-val").textContent = val;
        }
      }
      const casGt = document.querySelector(`#deck-comp4 .bit-toggle-btn[data-cas="gt"]`);
      if (casGt) { casGt.classList.toggle("active", state.comp4.cascade_gt === 1); casGt.querySelector(".bit-val").textContent = state.comp4.cascade_gt; }
      const casEq = document.querySelector(`#deck-comp4 .bit-toggle-btn[data-cas="eq"]`);
      if (casEq) { casEq.classList.toggle("active", state.comp4.cascade_eq === 1); casEq.querySelector(".bit-val").textContent = state.comp4.cascade_eq; }
      const casLt = document.querySelector(`#deck-comp4 .bit-toggle-btn[data-cas="lt"]`);
      if (casLt) { casLt.classList.toggle("active", state.comp4.cascade_lt === 1); casLt.querySelector(".bit-val").textContent = state.comp4.cascade_lt; }
    } else if (c === "adder_subtractor_4bit") {
      for (let i = 0; i < 4; i++) {
        const btnA = document.querySelector(`#deck-addsub .bit-toggle-btn[data-group="a"][data-index="${i}"]`);
        if (btnA) {
          const val = state.addSub4.a[i];
          btnA.classList.toggle("active", val === "1");
          btnA.querySelector(".bit-val").textContent = val;
        }
        const btnB = document.querySelector(`#deck-addsub .bit-toggle-btn[data-group="b"][data-index="${i}"]`);
        if (btnB) {
          const val = state.addSub4.b[i];
          btnB.classList.toggle("active", val === "1");
          btnB.querySelector(".bit-val").textContent = val;
        }
      }
      const modeBtn = document.querySelector(`#deck-addsub .bit-toggle-btn[data-group="mode"]`);
      if (modeBtn) {
        modeBtn.classList.toggle("active", state.addSub4.mode === 1);
        modeBtn.querySelector(".bit-val").textContent = state.addSub4.mode;
      }
      document.getElementById("btn-sub-add")?.classList.toggle("active", state.addSub4.mode === 0);
      document.getElementById("btn-sub-sub")?.classList.toggle("active", state.addSub4.mode === 1);
    }
  }

  // Render SVG Layers
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
    data.junctions.forEach((junc) => {
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
    } else if (comp.type === "xor_gate") {
      renderXorGate(comp, g);
    } else if (comp.type.startsWith("port_")) {
      renderPort(comp, g);
    }

    parent.appendChild(g);
  }

  // 1. IC Block
  function renderICBlock(comp, parent) {
    const { x, y, width, height, ref, value, pins } = comp;

    const rect = createSVGElement("rect", {
      x: x, y: y, width: width, height: height,
      rx: 2, ry: 2, class: "kicad-component-body",
    });
    parent.appendChild(rect);

    const refText = createSVGElement("text", { x: x + 10, y: y - 10, class: "kicad-ref-des" });
    refText.textContent = ref;
    parent.appendChild(refText);

    const valText = createSVGElement("text", {
      x: x + width / 2, y: y + height - 12, class: "kicad-comp-value", "text-anchor": "middle",
    });
    valText.textContent = value;
    parent.appendChild(valText);

    Object.keys(pins).forEach((pinKey) => {
      renderPin(pins[pinKey], parent);
    });
  }

  // Pin Renderer
  function renderPin(pin, parent) {
    const stubLen = 22;
    const stubEndX = pin.x + pin.dx * stubLen;
    const stubEndY = pin.y + pin.dy * stubLen;

    const line = createSVGElement("line", {
      x1: pin.x, y1: pin.y, x2: stubEndX, y2: stubEndY, class: "kicad-pin-stub",
    });
    parent.appendChild(line);

    if (pin.name.startsWith("~")) {
      const bubble = createSVGElement("circle", {
        cx: pin.x + pin.dx * 5, cy: pin.y, r: 3.5, class: "kicad-inversion-bubble",
      });
      parent.appendChild(bubble);
    }

    if (pin.pin_number) {
      const pNum = createSVGElement("text", {
        x: pin.x + pin.dx * 12, y: pin.y - 4, class: "kicad-pin-number",
        "text-anchor": pin.dx < 0 ? "end" : "start",
      });
      pNum.textContent = pin.pin_number;
      parent.appendChild(pNum);
    }

    const cleanName = pin.name.replace(/[~{}]/g, "");
    const pName = createSVGElement("text", {
      x: pin.x - pin.dx * 8, y: pin.y + 4, class: "kicad-pin-name",
      "text-anchor": pin.dx < 0 ? "start" : "end",
    });
    pName.textContent = cleanName;
    if (pin.name.startsWith("~")) {
      pName.setAttribute("text-decoration", "overline");
    }
    parent.appendChild(pName);

    if (pin.value !== null && pin.value !== undefined) {
      const isHigh = pin.value === 1;
      const badgeX = pin.x;
      const badgeY = pin.y;

      const badgeBg = createSVGElement("circle", {
        cx: badgeX, cy: badgeY, r: 6,
        fill: isHigh ? "#10b981" : "#1e293b",
        stroke: isHigh ? "#34d399" : "#64748b",
        "stroke-width": 1,
      });
      const badgeText = createSVGElement("text", {
        x: badgeX, y: badgeY, class: "kicad-pin-val-badge", fill: "#ffffff",
      });
      badgeText.textContent = pin.value;

      parent.appendChild(badgeBg);
      parent.appendChild(badgeText);
    }
  }

  // 2. NOT Gate
  function renderNotGate(comp, parent) {
    const { x, y, width, height, ref, value, pins } = comp;

    const refText = createSVGElement("text", { x: x + 5, y: y - 8, class: "kicad-ref-des" });
    refText.textContent = ref;
    parent.appendChild(refText);

    const valText = createSVGElement("text", { x: x + width / 2, y: y + height + 14, class: "kicad-comp-value", "text-anchor": "middle" });
    valText.textContent = value;
    parent.appendChild(valText);

    const p1 = `${x + 10},${y + 4}`;
    const p2 = `${x + 10},${y + height - 4}`;
    const p3 = `${x + width - 14},${y + height / 2}`;
    parent.appendChild(createSVGElement("polygon", { points: `${p1} ${p2} ${p3}`, class: "kicad-gate-symbol" }));

    parent.appendChild(createSVGElement("circle", {
      cx: x + width - 8, cy: y + height / 2, r: 4.5, class: "kicad-inversion-bubble",
    }));

    Object.keys(pins).forEach((pKey) => renderPin(pins[pKey], parent));
  }

  // 3. OR Gate
  function renderOrGate(comp, parent) {
    const { x, y, width, height, ref, value, pins } = comp;

    const refText = createSVGElement("text", { x: x + 10, y: y - 8, class: "kicad-ref-des" });
    refText.textContent = ref;
    parent.appendChild(refText);

    const valText = createSVGElement("text", { x: x + width / 2, y: y + height + 14, class: "kicad-comp-value", "text-anchor": "middle" });
    valText.textContent = value;
    parent.appendChild(valText);

    const leftX = x + 10;
    const rightX = x + width - 6;
    const topY = y + 4;
    const botY = y + height - 4;
    const midY = y + height / 2;

    const d = `M ${leftX},${topY} Q ${leftX + 16},${midY} ${leftX},${botY} Q ${leftX + 35},${botY} ${rightX},${midY} Q ${leftX + 35},${topY} ${leftX},${topY} Z`;
    parent.appendChild(createSVGElement("path", { d: d, class: "kicad-gate-symbol" }));

    Object.keys(pins).forEach((pKey) => renderPin(pins[pKey], parent));
  }

  // 4. XOR Gate (Authentic KiCad double-arc symbol)
  function renderXorGate(comp, parent) {
    const { x, y, width, height, ref, value, pins } = comp;

    const refText = createSVGElement("text", { x: x + 8, y: y - 8, class: "kicad-ref-des" });
    refText.textContent = ref;
    parent.appendChild(refText);

    const valText = createSVGElement("text", { x: x + width / 2, y: y + height + 14, class: "kicad-comp-value", "text-anchor": "middle" });
    valText.textContent = value;
    parent.appendChild(valText);

    const leftX = x + 14;
    const rightX = x + width - 6;
    const topY = y + 4;
    const botY = y + height - 4;
    const midY = y + height / 2;

    // Back isolated arc
    const backArcD = `M ${leftX - 6},${topY} Q ${leftX + 8},${midY} ${leftX - 6},${botY}`;
    const backArc = createSVGElement("path", {
      d: backArcD,
      fill: "none",
      stroke: "var(--kicad-component-outline)",
      "stroke-width": 1.6,
      "stroke-linecap": "round",
    });
    parent.appendChild(backArc);

    // Main XOR body
    const bodyD = `M ${leftX},${topY} Q ${leftX + 14},${midY} ${leftX},${botY} Q ${leftX + 32},${botY} ${rightX},${midY} Q ${leftX + 32},${topY} ${leftX},${topY} Z`;
    parent.appendChild(createSVGElement("path", { d: bodyD, class: "kicad-gate-symbol" }));

    Object.keys(pins).forEach((pKey) => renderPin(pins[pKey], parent));
  }

  // 5. Port Symbol
  function renderPort(comp, parent) {
    const { x, y, width, height, ref, value, pins, type } = comp;
    const isHigh = value === "1";
    const isOutput = type === "port_output";

    let d = "";
    if (isOutput) {
      d = `M ${x},${y} L ${x + width - 12},${y} L ${x + width},${y + height / 2} L ${x + width - 12},${y + height} L ${x},${y + height} Z`;
    } else {
      d = `M ${x},${y} L ${x + width - 10},${y} L ${x + width},${y + height / 2} L ${x + width - 10},${y + height} L ${x},${y + height} Z`;
    }

    parent.appendChild(createSVGElement("path", {
      d: d, class: "kicad-port-shape",
      fill: isHigh ? "#10b981" : "#e2e8f0",
      stroke: isHigh ? "#059669" : "#64748b",
    }));

    const text = createSVGElement("text", {
      x: x + width / 2 - 4, y: y + height / 2, class: "kicad-port-text",
      fill: isHigh ? "#ffffff" : "#1e293b",
    });
    text.textContent = `${ref}=${value}`;
    parent.appendChild(text);

    Object.keys(pins).forEach((pKey) => renderPin(pins[pKey], parent));
  }

  // Frame, Grid & Title Block
  function drawKiCadFrameAndGrid(parent, w, h, sheetInfo) {
    parent.innerHTML = "";

    // Grid dots
    const gridG = createSVGElement("g", { id: "kicad-grid" });
    for (let gx = 40; gx <= w - 40; gx += 20) {
      for (let gy = 40; gy <= h - 40; gy += 20) {
        gridG.appendChild(createSVGElement("circle", {
          cx: gx, cy: gy, r: 0.75, fill: "var(--kicad-grid-dot)",
        }));
      }
    }
    parent.appendChild(gridG);

    // Double Red Frame
    const frameG = createSVGElement("g", { id: "kicad-border-frame" });
    frameG.appendChild(createSVGElement("rect", {
      x: 18, y: 18, width: w - 36, height: h - 36, class: "kicad-frame-line",
    }));
    frameG.appendChild(createSVGElement("rect", {
      x: 32, y: 32, width: w - 64, height: h - 64, class: "kicad-frame-line-thin",
    }));

    // Zone marks
    const xZones = ["1", "2", "3", "4", "5", "6"];
    const colStep = (w - 64) / xZones.length;
    xZones.forEach((zone, idx) => {
      const zX = 32 + (idx + 0.5) * colStep;
      const t = createSVGElement("text", { x: zX, y: 25, class: "kicad-zone-label" });
      t.textContent = zone;
      frameG.appendChild(t);
      const b = createSVGElement("text", { x: zX, y: h - 23, class: "kicad-zone-label" });
      b.textContent = zone;
      frameG.appendChild(b);
    });

    const yZones = ["A", "B", "C", "D"];
    const rowStep = (h - 64) / yZones.length;
    yZones.forEach((zone, idx) => {
      const zY = 32 + (idx + 0.5) * rowStep;
      const l = createSVGElement("text", { x: 25, y: zY, class: "kicad-zone-label" });
      l.textContent = zone;
      frameG.appendChild(l);
      const r = createSVGElement("text", { x: w - 23, y: zY, class: "kicad-zone-label" });
      r.textContent = zone;
      frameG.appendChild(r);
    });

    // Title Block in bottom-right corner
    const tbW = 320;
    const tbH = 95;
    const tbX = w - 32 - tbW;
    const tbY = h - 32 - tbH;

    const tbG = createSVGElement("g", { id: "kicad-title-block" });
    tbG.appendChild(createSVGElement("rect", {
      x: tbX, y: tbY, width: tbW, height: tbH, class: "kicad-title-block-bg",
    }));

    tbG.appendChild(createSVGElement("line", { x1: tbX, y1: tbY + 28, x2: tbX + tbW, y2: tbY + 28, class: "kicad-title-block-divider" }));
    tbG.appendChild(createSVGElement("line", { x1: tbX, y1: tbY + 54, x2: tbX + tbW, y2: tbY + 54, class: "kicad-title-block-divider" }));
    tbG.appendChild(createSVGElement("line", { x1: tbX, y1: tbY + 74, x2: tbX + tbW, y2: tbY + 74, class: "kicad-title-block-divider" }));
    tbG.appendChild(createSVGElement("line", { x1: tbX + 160, y1: tbY + 54, x2: tbX + 160, y2: tbY + tbH, class: "kicad-title-block-divider" }));
    tbG.appendChild(createSVGElement("line", { x1: tbX + 240, y1: tbY + 54, x2: tbX + 240, y2: tbY + 74, class: "kicad-title-block-divider" }));

    const today = sheetInfo.date || new Date().toISOString().slice(0, 10);
    const titleStr = sheetInfo.title || "DIGITAL LOGIC SCHEMATIC";
    const fileStr = sheetInfo.file || "schematic.kicad_sch";
    const revStr = sheetInfo.rev || "v1.0";
    const sizeStr = sheetInfo.size || "A4";
    const companyStr = sheetInfo.company || "Logic Sim Suite";

    addTBText(tbG, tbX + 10, tbY + 12, "TITLE:", "kicad-title-label");
    addTBText(tbG, tbX + 50, tbY + 18, titleStr.toUpperCase(), "kicad-title-heading");
    addTBText(tbG, tbX + 10, tbY + 38, "FILE:", "kicad-title-label");
    addTBText(tbG, tbX + 45, tbY + 44, fileStr, "kicad-title-val");
    addTBText(tbG, tbX + 10, tbY + 63, "DATE:", "kicad-title-label");
    addTBText(tbG, tbX + 45, tbY + 66, today, "kicad-title-val");
    addTBText(tbG, tbX + 168, tbY + 63, "REV:", "kicad-title-label");
    addTBText(tbG, tbX + 198, tbY + 66, revStr, "kicad-title-val");
    addTBText(tbG, tbX + 248, tbY + 63, "SIZE:", "kicad-title-label");
    addTBText(tbG, tbX + 280, tbY + 66, sizeStr, "kicad-title-val");
    addTBText(tbG, tbX + 10, tbY + 83, "COMPANY:", "kicad-title-label");
    addTBText(tbG, tbX + 65, tbY + 86, companyStr, "kicad-title-val");
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

  // Info panels & Readouts
  function renderInfoPanels(data) {
    const c = state.activeCircuit;

    if (c === "mux_8to1") {
      const finalY = data.state.output;
      const details = data.state.details || {};
      const led = document.getElementById("output-led-mux8");
      if (led) { led.className = `output-led ${finalY === 1 ? "on" : ""}`; led.textContent = finalY; }
      const desc = document.getElementById("active-path-desc-mux8");
      if (desc) {
        desc.textContent = data.state.strobe === 1
          ? "Disabled (Strobe ~G = 1 -> Output Forced 0)"
          : `${details.active_section === 1 ? "Section 1 (U2A)" : "Section 2 (U2B)"} active | Channel D${parseInt(data.state.select, 2)} routed`;
      }
    } else if (c === "mux_4to1") {
      const finalY = data.state.output;
      const details = data.state.details || {};
      const led = document.getElementById("output-led-mux4");
      if (led) { led.className = `output-led ${finalY === 1 ? "on" : ""}`; led.textContent = finalY; }
      const desc = document.getElementById("active-path-desc-mux4");
      if (desc) {
        desc.textContent = data.state.strobe === 1
          ? "Disabled (Strobe ~1G = 1 -> Output Forced 0)"
          : `Channel ${details.selected_channel} routed to Output 1Y`;
      }
    } else if (c === "comparator_4bit") {
      const details = data.state.details || {};
      const pillGt = document.getElementById("comp-pill-gt");
      const pillEq = document.getElementById("comp-pill-eq");
      const pillLt = document.getElementById("comp-pill-lt");
      if (pillGt) pillGt.classList.toggle("active", details.a_gt_b === 1);
      if (pillEq) pillEq.classList.toggle("active", details.a_eq_b === 1);
      if (pillLt) pillLt.classList.toggle("active", details.a_lt_b === 1);

      const decision = document.getElementById("comp-decision-text");
      if (decision) decision.textContent = `Decision: ${details.decision_stage || details.relation}`;
      const decA = document.getElementById("comp-dec-a");
      const decB = document.getElementById("comp-dec-b");
      if (decA) decA.textContent = details.a_decimal;
      if (decB) decB.textContent = details.b_decimal;
    } else if (c === "adder_subtractor_4bit") {
      const sumVal = data.state.sum;
      const details = data.state.details || {};
      const mode = data.state.mode;

      const ledSum = document.getElementById("addsub-sum-led");
      if (ledSum) ledSum.textContent = sumVal;

      const flagPill = document.getElementById("addsub-flag-pill");
      if (flagPill) {
        if (mode === 0) {
          flagPill.textContent = `Carry-Out (C4): ${data.state.carry_out}`;
          flagPill.classList.toggle("active", data.state.carry_out === 1);
        } else {
          flagPill.textContent = `Borrow: ${data.state.borrow}`;
          flagPill.classList.toggle("active", data.state.borrow === 1);
        }
      }

      const calcText = document.getElementById("addsub-calc-text");
      if (calcText) {
        const op = mode === 0 ? "+" : "-";
        calcText.textContent = `Calculation: ${details.a_decimal} ${op} ${details.b_decimal} = ${details.result_decimal} (Decimal)`;
      }
    }
  }

  // Client Simulation Fallbacks
  function generateClientSideFallback(circuitId) {
    if (circuitId === "mux_8to1") {
      return fallbackMux8(state.mux8.select, state.mux8.inputs, state.mux8.strobe);
    } else if (circuitId === "mux_4to1") {
      return fallbackMux4(state.mux4.select, state.mux4.inputs, state.mux4.strobe);
    } else if (circuitId === "comparator_4bit") {
      return fallbackComp4(state.comp4.a, state.comp4.b, state.comp4.cascade_gt, state.comp4.cascade_lt, state.comp4.cascade_eq);
    } else if (circuitId === "adder_subtractor_4bit") {
      return fallbackAddSub4(state.addSub4.a, state.addSub4.b, state.addSub4.mode);
    }
  }

  function fallbackMux8(select, inputs, strobe) {
    const s2 = parseInt(select[0], 10);
    const s1 = parseInt(select[1], 10);
    const s0 = parseInt(select[2], 10);
    const s2_inv = 1 - s2;
    const subIdx = parseInt(select.slice(1), 2);

    const raw_y1 = inputs[subIdx];
    const raw_y2 = inputs[4 + subIdx];
    const g1_val = s2 | strobe;
    const g2_val = s2_inv | strobe;
    const y1_val = g1_val === 1 ? 0 : raw_y1;
    const y2_val = g2_val === 1 ? 0 : raw_y2;
    const final_y = y1_val | y2_val;

    const components = [];
    for (let i = 0; i < 4; i++) {
      components.push({
        id: `PORT_D${i}`, ref: `D${i}`, value: String(inputs[i]), type: "port_input",
        x: 80, y: 130 + i * 35 - 10, width: 50, height: 20,
        pins: { out: { name: `D${i}`, pin_number: "", x: 130, y: 130 + i * 35, dx: 1.0, dy: 0.0, value: inputs[i], direction: "output" } },
      });
    }
    for (let i = 4; i < 8; i++) {
      components.push({
        id: `PORT_D${i}`, ref: `D${i}`, value: String(inputs[i]), type: "port_input",
        x: 80, y: 380 + (i - 4) * 35 - 10, width: 50, height: 20,
        pins: { out: { name: `D${i}`, pin_number: "", x: 130, y: 380 + (i - 4) * 35, dx: 1.0, dy: 0.0, value: inputs[i], direction: "output" } },
      });
    }
    const selMeta = [["S2", s2, 290], ["S1", s1, 570], ["S0", s0, 610]];
    selMeta.forEach(([sName, sVal, yPos]) => {
      components.push({
        id: `PORT_${sName}`, ref: sName, value: String(sVal), type: "port_select",
        x: 80, y: yPos - 10, width: 50, height: 20,
        pins: { out: { name: sName, pin_number: "", x: 130, y: yPos, dx: 1.0, dy: 0.0, value: sVal, direction: "output" } },
      });
    });
    components.push({
      id: "PORT_STROBE", ref: "~{G}", value: String(strobe), type: "port_select",
      x: 80, y: 70, width: 50, height: 20,
      pins: { out: { name: "~{G}", pin_number: "", x: 130, y: 80, dx: 1.0, dy: 0.0, value: strobe, direction: "output" } },
    });
    components.push({
      id: "U1", ref: "U1", value: "74LS04", type: "not_gate", x: 230, y: 270, width: 60, height: 40,
      pins: { A: { name: "1A", pin_number: "1", x: 230, y: 290, dx: -1.0, dy: 0.0, value: s2, direction: "input" },
              Y: { name: "1Y", pin_number: "2", x: 290, y: 290, dx: 1.0, dy: 0.0, value: s2_inv, direction: "output" } },
    });
    components.push({
      id: "U2A", ref: "U2A", value: "74LS153", type: "ic_block", x: 420, y: 110, width: 160, height: 210,
      pins: { "1C0": { name: "1C0", pin_number: "6", x: 420, y: 130, dx: -1.0, dy: 0.0, value: inputs[0], direction: "input" },
              "1C1": { name: "1C1", pin_number: "5", x: 420, y: 165, dx: -1.0, dy: 0.0, value: inputs[1], direction: "input" },
              "1C2": { name: "1C2", pin_number: "4", x: 420, y: 200, dx: -1.0, dy: 0.0, value: inputs[2], direction: "input" },
              "1C3": { name: "1C3", pin_number: "3", x: 420, y: 235, dx: -1.0, dy: 0.0, value: inputs[3], direction: "input" },
              "1G":  { name: "~{1G}", pin_number: "1", x: 420, y: 270, dx: -1.0, dy: 0.0, value: g1_val, direction: "input" },
              "B":   { name: "B", pin_number: "2", x: 420, y: 295, dx: -1.0, dy: 0.0, value: s1, direction: "input" },
              "A":   { name: "A", pin_number: "14", x: 420, y: 310, dx: -1.0, dy: 0.0, value: s0, direction: "input" },
              "1Y":  { name: "1Y", pin_number: "7", x: 580, y: 170, dx: 1.0, dy: 0.0, value: y1_val, direction: "output" } },
    });
    components.push({
      id: "U2B", ref: "U2B", value: "74LS153", type: "ic_block", x: 420, y: 360, width: 160, height: 210,
      pins: { "2C0": { name: "2C0", pin_number: "10", x: 420, y: 380, dx: -1.0, dy: 0.0, value: inputs[4], direction: "input" },
              "2C1": { name: "2C1", pin_number: "11", x: 420, y: 415, dx: -1.0, dy: 0.0, value: inputs[5], direction: "input" },
              "2C2": { name: "2C2", pin_number: "12", x: 420, y: 450, dx: -1.0, dy: 0.0, value: inputs[6], direction: "input" },
              "2C3": { name: "2C3", pin_number: "13", x: 420, y: 485, dx: -1.0, dy: 0.0, value: inputs[7], direction: "input" },
              "2G":  { name: "~{2G}", pin_number: "15", x: 420, y: 520, dx: -1.0, dy: 0.0, value: g2_val, direction: "input" },
              "B":   { name: "B", pin_number: "2", x: 420, y: 545, dx: -1.0, dy: 0.0, value: s1, direction: "input" },
              "A":   { name: "A", pin_number: "14", x: 420, y: 560, dx: -1.0, dy: 0.0, value: s0, direction: "input" },
              "2Y":  { name: "2Y", pin_number: "9", x: 580, y: 420, dx: 1.0, dy: 0.0, value: y2_val, direction: "output" } },
    });
    components.push({
      id: "U3", ref: "U3", value: "74LS32", type: "or_gate", x: 720, y: 270, width: 70, height: 60,
      pins: { "1A": { name: "1A", pin_number: "1", x: 720, y: 285, dx: -1.0, dy: 0.0, value: y1_val, direction: "input" },
              "1B": { name: "1B", pin_number: "2", x: 720, y: 315, dx: -1.0, dy: 0.0, value: y2_val, direction: "input" },
              "1Y": { name: "1Y", pin_number: "3", x: 790, y: 300, dx: 1.0, dy: 0.0, value: final_y, direction: "output" } },
    });
    components.push({
      id: "PORT_Y", ref: "Y", value: String(final_y), type: "port_output", x: 880, y: 290, width: 60, height: 20,
      pins: { in: { name: "Y", pin_number: "", x: 880, y: 300, dx: -1.0, dy: 0.0, value: final_y, direction: "input" } },
    });

    const wires = [];
    for (let i = 0; i < 4; i++) wires.push({ id: `w_d${i}`, net: `D${i}`, path: `M 130,${130 + i * 35} L 420,${130 + i * 35}`, value: inputs[i] });
    for (let i = 4; i < 8; i++) wires.push({ id: `w_d${i}`, net: `D${i}`, path: `M 130,${380 + (i - 4) * 35} L 420,${380 + (i - 4) * 35}`, value: inputs[i] });
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

    return {
      circuit_id: "mux_8to1",
      title: "8:1 Multiplexer (Dual 74LS153 + Inverter + OR)",
      sheet_info: { title: "8:1 Multiplexer (IC 74LS153 Composition)", file: "mux_8to1.kicad_sch", size: "A4", rev: "v1.0" },
      canvas: { width: 1200, height: 740 },
      components, wires,
      junctions: [{ x: 180, y: 290, value: s2 }, { x: 360, y: 545, value: s1 }, { x: 380, y: 560, value: s0 }],
      state: { select, inputs, strobe, output: final_y, details: { s2, s1, s0, s2_inv, active_section: strobe === 1 ? 0 : (s2 === 1 ? 2 : 1) } },
    };
  }

  function fallbackMux4(select, inputs, strobe) {
    const s1 = parseInt(select[0], 10);
    const s0 = parseInt(select[1], 10);
    const subIdx = parseInt(select, 2);
    const raw_y = inputs[subIdx];
    const final_y = strobe === 1 ? 0 : raw_y;

    const components = [];
    for (let i = 0; i < 4; i++) {
      components.push({
        id: `PORT_D${i}`, ref: `D${i}`, value: String(inputs[i]), type: "port_input",
        x: 80, y: 110 + i * 40 - 10, width: 50, height: 20,
        pins: { out: { name: `D${i}`, pin_number: "", x: 130, y: 110 + i * 40, dx: 1.0, dy: 0.0, value: inputs[i], direction: "output" } },
      });
    }
    components.push({
      id: "PORT_STROBE", ref: "~{1G}", value: String(strobe), type: "port_select",
      x: 80, y: 260, width: 50, height: 20,
      pins: { out: { name: "~{1G}", pin_number: "", x: 130, y: 270, dx: 1.0, dy: 0.0, value: strobe, direction: "output" } },
    });
    components.push({
      id: "PORT_S1", ref: "S1 (B)", value: String(s1), type: "port_select",
      x: 80, y: 300, width: 50, height: 20,
      pins: { out: { name: "S1", pin_number: "", x: 130, y: 310, dx: 1.0, dy: 0.0, value: s1, direction: "output" } },
    });
    components.push({
      id: "PORT_S0", ref: "S0 (A)", value: String(s0), type: "port_select",
      x: 80, y: 340, width: 50, height: 20,
      pins: { out: { name: "S0", pin_number: "", x: 130, y: 350, dx: 1.0, dy: 0.0, value: s0, direction: "output" } },
    });
    components.push({
      id: "U1A", ref: "U1A", value: "74LS153", type: "ic_block", x: 400, y: 75, width: 180, height: 310,
      pins: {
        "1C0": { name: "1C0", pin_number: "6", x: 400, y: 110, dx: -1.0, dy: 0.0, value: inputs[0], direction: "input" },
        "1C1": { name: "1C1", pin_number: "5", x: 400, y: 150, dx: -1.0, dy: 0.0, value: inputs[1], direction: "input" },
        "1C2": { name: "1C2", pin_number: "4", x: 400, y: 190, dx: -1.0, dy: 0.0, value: inputs[2], direction: "input" },
        "1C3": { name: "1C3", pin_number: "3", x: 400, y: 230, dx: -1.0, dy: 0.0, value: inputs[3], direction: "input" },
        "1G":  { name: "~{1G}", pin_number: "1", x: 400, y: 270, dx: -1.0, dy: 0.0, value: strobe, direction: "input" },
        "B":   { name: "B", pin_number: "2", x: 400, y: 310, dx: -1.0, dy: 0.0, value: s1, direction: "input" },
        "A":   { name: "A", pin_number: "14", x: 400, y: 350, dx: -1.0, dy: 0.0, value: s0, direction: "input" },
        "1Y":  { name: "1Y", pin_number: "7", x: 580, y: 210, dx: 1.0, dy: 0.0, value: final_y, direction: "output" },
      },
    });
    components.push({
      id: "PORT_Y", ref: "Y", value: String(final_y), type: "port_output", x: 730, y: 200, width: 60, height: 20,
      pins: { in: { name: "Y", pin_number: "", x: 730, y: 210, dx: -1.0, dy: 0.0, value: final_y, direction: "input" } },
    });

    const wires = [];
    for (let i = 0; i < 4; i++) wires.push({ id: `w_d${i}`, net: `D${i}`, path: `M 130,${110 + i * 40} L 400,${110 + i * 40}`, value: inputs[i] });
    wires.push({ id: "w_strobe", net: "STROBE", path: "M 130,270 L 400,270", value: strobe });
    wires.push({ id: "w_s1", net: "S1", path: "M 130,310 L 400,310", value: s1 });
    wires.push({ id: "w_s0", net: "S0", path: "M 130,350 L 400,350", value: s0 });
    wires.push({ id: "w_y", net: "1Y", path: "M 580,210 L 730,210", value: final_y });

    return {
      circuit_id: "mux_4to1",
      title: "4:1 Multiplexer (Single 74LS153 Section)",
      sheet_info: { title: "4:1 Multiplexer (Single 74LS153 Section)", file: "mux_4to1.kicad_sch", size: "A4", rev: "v1.0" },
      canvas: { width: 1000, height: 560 },
      components, wires, junctions: [],
      state: { select, inputs, strobe, output: final_y, details: { s1, s0, selected_channel: `D${subIdx}`, strobe_disabled: strobe === 1 } },
    };
  }

  function fallbackComp4(a, b, cascade_gt, cascade_lt, cascade_eq) {
    const aDec = parseInt(a, 2);
    const bDec = parseInt(b, 2);

    let out_gt = 0, out_lt = 0, out_eq = 0;
    let decision = "";
    if (aDec > bDec) { out_gt = 1; decision = "Determined by magnitude (A > B)"; }
    else if (aDec < bDec) { out_lt = 1; decision = "Determined by magnitude (A < B)"; }
    else {
      if (cascade_gt) { out_gt = 1; decision = "Bits equal; resolved to A > B by cascade input (IA>B)"; }
      else if (cascade_lt) { out_lt = 1; decision = "Bits equal; resolved to A < B by cascade input (IA<B)"; }
      else { out_eq = cascade_eq; decision = "All 4 bits equal (A = B)"; }
    }

    const a_bits = [int(a[0]), int(a[1]), int(a[2]), int(a[3])];
    const b_bits = [int(b[0]), int(b[1]), int(b[2]), int(b[3])];

    const components = [];
    const a_meta = [["A3", a_bits[0], 100, "15"], ["A2", a_bits[1], 135, "13"], ["A1", a_bits[2], 170, "12"], ["A0", a_bits[3], 205, "10"]];
    a_meta.forEach(([pName, val, yPos]) => {
      components.push({
        id: `PORT_${pName}`, ref: pName, value: String(val), type: "port_input",
        x: 80, y: yPos - 10, width: 50, height: 20,
        pins: { out: { name: pName, pin_number: "", x: 130, y: yPos, dx: 1.0, dy: 0.0, value: val, direction: "output" } },
      });
    });

    const b_meta = [["B3", b_bits[0], 255, "1"], ["B2", b_bits[1], 290, "14"], ["B1", b_bits[2], 325, "11"], ["B0", b_bits[3], 360, "9"]];
    b_meta.forEach(([pName, val, yPos]) => {
      components.push({
        id: `PORT_${pName}`, ref: pName, value: String(val), type: "port_input",
        x: 80, y: yPos - 10, width: 50, height: 20,
        pins: { out: { name: pName, pin_number: "", x: 130, y: yPos, dx: 1.0, dy: 0.0, value: val, direction: "output" } },
      });
    });

    const cas_meta = [["IA_GT", "I_A>B", cascade_gt, 410, "4"], ["IA_EQ", "I_A=B", cascade_eq, 450, "3"], ["IA_LT", "I_A<B", cascade_lt, 490, "2"]];
    cas_meta.forEach(([portId, lbl, val, yPos]) => {
      components.push({
        id: `PORT_${portId}`, ref: lbl, value: String(val), type: "port_select",
        x: 80, y: yPos - 10, width: 65, height: 20,
        pins: { out: { name: lbl, pin_number: "", x: 145, y: yPos, dx: 1.0, dy: 0.0, value: val, direction: "output" } },
      });
    });

    components.push({
      id: "U1", ref: "U1", value: "74LS85", type: "ic_block", x: 440, y: 70, width: 220, height: 450,
      pins: {
        A3: { name: "A3", pin_number: "15", x: 440, y: 100, dx: -1.0, dy: 0.0, value: a_bits[0], direction: "input" },
        A2: { name: "A2", pin_number: "13", x: 440, y: 135, dx: -1.0, dy: 0.0, value: a_bits[1], direction: "input" },
        A1: { name: "A1", pin_number: "12", x: 440, y: 170, dx: -1.0, dy: 0.0, value: a_bits[2], direction: "input" },
        A0: { name: "A0", pin_number: "10", x: 440, y: 205, dx: -1.0, dy: 0.0, value: a_bits[3], direction: "input" },
        B3: { name: "B3", pin_number: "1",  x: 440, y: 255, dx: -1.0, dy: 0.0, value: b_bits[0], direction: "input" },
        B2: { name: "B2", pin_number: "14", x: 440, y: 290, dx: -1.0, dy: 0.0, value: b_bits[1], direction: "input" },
        B1: { name: "B1", pin_number: "11", x: 440, y: 325, dx: -1.0, dy: 0.0, value: b_bits[2], direction: "input" },
        B0: { name: "B0", pin_number: "9",  x: 440, y: 360, dx: -1.0, dy: 0.0, value: b_bits[3], direction: "input" },
        IA_GT: { name: "IA>B", pin_number: "4", x: 440, y: 410, dx: -1.0, dy: 0.0, value: cascade_gt, direction: "input" },
        IA_EQ: { name: "IA=B", pin_number: "3", x: 440, y: 450, dx: -1.0, dy: 0.0, value: cascade_eq, direction: "input" },
        IA_LT: { name: "IA<B", pin_number: "2", x: 440, y: 490, dx: -1.0, dy: 0.0, value: cascade_lt, direction: "input" },
        OA_GT: { name: "OA>B", pin_number: "5", x: 660, y: 200, dx: 1.0, dy: 0.0, value: out_gt, direction: "output" },
        OA_EQ: { name: "OA=B", pin_number: "6", x: 660, y: 275, dx: 1.0, dy: 0.0, value: out_eq, direction: "output" },
        OA_LT: { name: "OA<B", pin_number: "7", x: 660, y: 350, dx: 1.0, dy: 0.0, value: out_lt, direction: "output" },
      },
    });

    const out_meta = [["OA_GT", "OA>B", out_gt, 200], ["OA_EQ", "OA=B", out_eq, 275], ["OA_LT", "OA<B", out_lt, 350]];
    out_meta.forEach(([portId, lbl, val, yPos]) => {
      components.push({
        id: `PORT_${portId}`, ref: lbl, value: String(val), type: "port_output",
        x: 800, y: yPos - 10, width: 65, height: 20,
        pins: { in: { name: lbl, pin_number: "", x: 800, y: yPos, dx: -1.0, dy: 0.0, value: val, direction: "input" } },
      });
    });

    const wires = [];
    a_meta.forEach(([pName, val, yPos]) => wires.push({ id: `w_${pName}`, net: pName, path: `M 130,${yPos} L 440,${yPos}`, value: val }));
    b_meta.forEach(([pName, val, yPos]) => wires.push({ id: `w_${pName}`, net: pName, path: `M 130,${yPos} L 440,${yPos}`, value: val }));
    cas_meta.forEach(([portId, lbl, val, yPos]) => wires.push({ id: `w_${portId}`, net: lbl, path: `M 145,${yPos} L 440,${yPos}`, value: val }));
    out_meta.forEach(([portId, lbl, val, yPos]) => wires.push({ id: `w_${portId}`, net: lbl, path: `M 660,${yPos} L 800,${yPos}`, value: val }));

    return {
      circuit_id: "comparator_4bit",
      title: "4-Bit Magnitude Comparator (IC 74LS85)",
      sheet_info: { title: "4-Bit Magnitude Comparator (IC 74LS85)", file: "comparator_74ls85.kicad_sch", size: "A4", rev: "v1.0" },
      canvas: { width: 1050, height: 620 },
      components, wires, junctions: [],
      state: {
        a, b, cascade_gt, cascade_lt, cascade_eq,
        details: { a_decimal: aDec, b_decimal: bDec, a_gt_b: out_gt, a_lt_b: out_lt, a_eq_b: out_eq, decision_stage: decision },
      },
    };
  }

  function fallbackAddSub4(a, b, mode) {
    const aDec = parseInt(a, 2);
    const bDec = parseInt(b, 2);

    const a_bits = [int(a[0]), int(a[1]), int(a[2]), int(a[3])];
    const b_bits = [int(b[0]), int(b[1]), int(b[2]), int(b[3])];
    const b_eff = b_bits.map(bit => bit ^ mode);

    let carry = mode;
    const s_rev = [];
    for (let i = 3; i >= 0; i--) {
      const sum = a_bits[i] ^ b_eff[i] ^ carry;
      carry = (a_bits[i] & b_eff[i]) | (carry & (a_bits[i] ^ b_eff[i]));
      s_rev.push(sum);
    }
    const s_bits = s_rev.reverse();
    const sumStr = s_bits.join("");
    const finalCout = carry;
    const borrowVal = mode === 1 ? 1 - finalCout : null;

    const components = [];
    const a_meta = [["A0", a_bits[3], 100, "10", "A1"], ["A1", a_bits[2], 140, "8", "A2"], ["A2", a_bits[1], 180, "3", "A3"], ["A3", a_bits[0], 220, "1", "A4"]];
    a_meta.forEach(([pName, val, yPos]) => {
      components.push({
        id: `PORT_${pName}`, ref: pName, value: String(val), type: "port_input",
        x: 70, y: yPos - 10, width: 50, height: 20,
        pins: { out: { name: pName, pin_number: "", x: 120, y: yPos, dx: 1.0, dy: 0.0, value: val, direction: "output" } },
      });
    });

    const b_meta = [
      ["B0", b_bits[3], b_eff[3], 300, "U1A", "11", "B1"],
      ["B1", b_bits[2], b_eff[2], 380, "U1B", "7",  "B2"],
      ["B2", b_bits[1], b_eff[1], 460, "U1C", "4",  "B3"],
      ["B3", b_bits[0], b_eff[0], 540, "U1D", "16", "B4"],
    ];
    b_meta.forEach(([pName, val, effVal, yPos, xorRef]) => {
      components.push({
        id: `PORT_${pName}`, ref: pName, value: String(val), type: "port_input",
        x: 70, y: yPos - 10, width: 50, height: 20,
        pins: { out: { name: pName, pin_number: "", x: 120, y: yPos, dx: 1.0, dy: 0.0, value: val, direction: "output" } },
      });
      components.push({
        id: xorRef, ref: xorRef, value: "74LS86", type: "xor_gate",
        x: 260, y: yPos - 20, width: 65, height: 40,
        pins: {
          A: { name: "1A", pin_number: "1", x: 260, y: yPos - 8, dx: -1.0, dy: 0.0, value: val, direction: "input" },
          B: { name: "1B", pin_number: "2", x: 260, y: yPos + 8, dx: -1.0, dy: 0.0, value: mode, direction: "input" },
          Y: { name: "1Y", pin_number: "3", x: 325, y: yPos, dx: 1.0, dy: 0.0, value: effVal, direction: "output" },
        },
      });
    });

    components.push({
      id: "PORT_MODE", ref: "M", value: String(mode), type: "port_select",
      x: 70, y: 620, width: 65, height: 20,
      pins: { out: { name: "M", pin_number: "", x: 135, y: 630, dx: 1.0, dy: 0.0, value: mode, direction: "output" } },
    });

    components.push({
      id: "U2", ref: "U2", value: "74LS83", type: "ic_block", x: 480, y: 70, width: 220, height: 540,
      pins: {
        A1: { name: "A1", pin_number: "10", x: 480, y: 100, dx: -1.0, dy: 0.0, value: a_bits[3], direction: "input" },
        A2: { name: "A2", pin_number: "8",  x: 480, y: 140, dx: -1.0, dy: 0.0, value: a_bits[2], direction: "input" },
        A3: { name: "A3", pin_number: "3",  x: 480, y: 180, dx: -1.0, dy: 0.0, value: a_bits[1], direction: "input" },
        A4: { name: "A4", pin_number: "1",  x: 480, y: 220, dx: -1.0, dy: 0.0, value: a_bits[0], direction: "input" },
        B1: { name: "B1", pin_number: "11", x: 480, y: 300, dx: -1.0, dy: 0.0, value: b_eff[3], direction: "input" },
        B2: { name: "B2", pin_number: "7",  x: 480, y: 380, dx: -1.0, dy: 0.0, value: b_eff[2], direction: "input" },
        B3: { name: "B3", pin_number: "4",  x: 480, y: 460, dx: -1.0, dy: 0.0, value: b_eff[1], direction: "input" },
        B4: { name: "B4", pin_number: "16", x: 480, y: 540, dx: -1.0, dy: 0.0, value: b_eff[0], direction: "input" },
        C0: { name: "C0", pin_number: "13", x: 480, y: 580, dx: -1.0, dy: 0.0, value: mode, direction: "input" },
        S1: { name: "Σ1", pin_number: "9",  x: 700, y: 140, dx: 1.0, dy: 0.0, value: s_bits[3], direction: "output" },
        S2: { name: "Σ2", pin_number: "6",  x: 700, y: 200, dx: 1.0, dy: 0.0, value: s_bits[2], direction: "output" },
        S3: { name: "Σ3", pin_number: "2",  x: 700, y: 260, dx: 1.0, dy: 0.0, value: s_bits[1], direction: "output" },
        S4: { name: "Σ4", pin_number: "15", x: 700, y: 320, dx: 1.0, dy: 0.0, value: s_bits[0], direction: "output" },
        C4: { name: "C4", pin_number: "14", x: 700, y: 420, dx: 1.0, dy: 0.0, value: finalCout, direction: "output" },
      },
    });

    const s_meta = [["S0", s_bits[3], 140, "S1"], ["S1", s_bits[2], 200, "S2"], ["S2", s_bits[1], 260, "S3"], ["S3", s_bits[0], 320, "S4"]];
    s_meta.forEach(([pName, val, yPos]) => {
      components.push({
        id: `PORT_${pName}`, ref: pName, value: String(val), type: "port_output",
        x: 840, y: yPos - 10, width: 50, height: 20,
        pins: { in: { name: pName, pin_number: "", x: 840, y: yPos, dx: -1.0, dy: 0.0, value: val, direction: "input" } },
      });
    });

    const flagLbl = mode === 0 ? "Cout" : "Borrow";
    const flagVal = mode === 0 ? finalCout : borrowVal;
    components.push({
      id: "PORT_FLAG", ref: flagLbl, value: String(flagVal), type: "port_output",
      x: 840, y: 410, width: 65, height: 20,
      pins: { in: { name: flagLbl, pin_number: "", x: 840, y: 420, dx: -1.0, dy: 0.0, value: flagVal, direction: "input" } },
    });

    const wires = [];
    a_meta.forEach(([pName, val, yPos]) => wires.push({ id: `w_${pName}`, net: pName, path: `M 120,${yPos} L 480,${yPos}`, value: val }));
    b_meta.forEach(([pName, val, effVal, yPos, xorRef]) => wires.push({ id: `w_${pName}`, net: pName, path: `M 120,${yPos} L 210,{yPos} L 210,${yPos - 8} L 260,${yPos - 8}`, value: val }));
    wires.push({ id: "w_mode_trunk", net: "MODE", path: "M 135,630 L 230,630 L 230,548 L 260,548", value: mode });
    wires.push({ id: "w_mode_u1c", net: "MODE", path: "M 230,548 L 230,468 L 260,468", value: mode });
    wires.push({ id: "w_mode_u1b", net: "MODE", path: "M 230,468 L 230,388 L 260,388", value: mode });
    wires.push({ id: "w_mode_u1a", net: "MODE", path: "M 230,388 L 230,308 L 260,308", value: mode });
    wires.push({ id: "w_mode_c0", net: "C0", path: "M 230,630 L 400,630 L 400,580 L 480,580", value: mode });
    b_meta.forEach(([pName, val, effVal, yPos, xorRef, pinNum, icPin]) => wires.push({ id: `w_eff_${pName}`, net: `${pName}_EFF`, path: `M 325,${yPos} L 480,${yPos}`, value: effVal }));
    s_meta.forEach(([pName, val, yPos, icPin]) => wires.push({ id: `w_${pName}`, net: pName, path: `M 700,${yPos} L 840,${yPos}`, value: val }));
    wires.push({ id: "w_cout_borrow", net: flagLbl, path: "M 700,420 L 840,420", value: flagVal });

    return {
      circuit_id: "adder_subtractor_4bit",
      title: "4-Bit Adder / Subtractor (IC 74LS83 + 74LS86)",
      sheet_info: { title: "4-Bit Adder / Subtractor (IC 74LS83 + 74LS86)", file: "adder_subtractor_74ls83.kicad_sch", size: "A4", rev: "v1.0" },
      canvas: { width: 1100, height: 680 },
      components, wires,
      junctions: [{ x: 230, y: 548, value: mode }, { x: 230, y: 468, value: mode }, { x: 230, y: 388, value: mode }, { x: 230, y: 630, value: mode }],
      state: {
        a, b, mode, sum: sumStr, carry_out: mode === 0 ? finalCout : null, borrow: borrowVal,
        details: { a_decimal: aDec, b_decimal: bDec, result_decimal: mode === 0 ? aDec + bDec : aDec - bDec },
      },
    };
  }

  function int(ch) { return parseInt(ch, 10); }

  // Pan and Zoom Controller
  function initPanZoom() {
    const viewport = document.querySelector(".schematic-viewport");
    if (!viewport || !svgRoot) return;

    viewport.addEventListener("wheel", (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY > 0 ? 1.15 : 0.85;
      zoom(zoomFactor, e.offsetX, e.offsetY);
    }, { passive: false });

    viewport.addEventListener("mousedown", (e) => {
      if (e.button !== 0) return;
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

  function createSVGElement(tag, attrs = {}) {
    const el = document.createElementNS(SVG_NS, tag);
    Object.keys(attrs).forEach((k) => el.setAttribute(k, attrs[k]));
    return el;
  }
})();
