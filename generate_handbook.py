# -*- coding: utf-8 -*-
"""
Generates the comprehensive Sequential Logic & Flip-Flops Engineering Reference Handbook HTML,
then invokes Chrome headless to compile it into a publication-grade PDF.
"""
import subprocess
import os

HTML_CONTENT = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Sequential Circuits & Flip-Flops — Master Reference Handbook</title>
<style>
  @page {
    size: A4;
    margin: 18mm 14mm 18mm 14mm;
  }
  
  * {
    box-sizing: border-box;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    font-size: 10.5pt;
    line-height: 1.5;
    color: #1e293b;
    background: #ffffff;
    margin: 0;
    padding: 0;
  }

  /* Cover & Header */
  .cover-card {
    background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%);
    color: #ffffff;
    padding: 28px 24px;
    border-radius: 10px;
    margin-bottom: 24px;
    border-left: 8px solid #38bdf8;
  }

  .cover-card h1 {
    margin: 0 0 6px 0;
    font-size: 22pt;
    font-weight: 800;
    letter-spacing: -0.5px;
    color: #ffffff;
  }

  .cover-card .subtitle {
    font-size: 12pt;
    color: #93c5fd;
    font-weight: 600;
    margin-bottom: 12px;
  }

  .cover-card .meta-tags {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    font-size: 8.5pt;
    font-family: "Courier New", Courier, monospace;
  }

  .meta-tag {
    background: rgba(255, 255, 255, 0.15);
    padding: 3px 10px;
    border-radius: 4px;
    border: 1px solid rgba(255, 255, 255, 0.25);
  }

  /* Section Styling */
  .section {
    margin-bottom: 24px;
    page-break-inside: auto;
  }

  h2 {
    font-size: 14pt;
    font-weight: 800;
    color: #0f172a;
    border-bottom: 2px solid #2563eb;
    padding-bottom: 4px;
    margin-top: 22px;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
    page-break-after: avoid;
  }

  h3 {
    font-size: 11.5pt;
    font-weight: 700;
    color: #1e3a8a;
    margin-top: 14px;
    margin-bottom: 6px;
    page-break-after: avoid;
  }

  p {
    margin: 0 0 8px 0;
    text-align: justify;
  }

  /* Tables */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0 14px 0;
    font-size: 9pt;
    page-break-inside: avoid;
  }

  th, td {
    border: 1px solid #cbd5e1;
    padding: 6px 10px;
    text-align: center;
  }

  th {
    background-color: #f1f5f9;
    color: #0f172a;
    font-weight: 700;
    text-transform: uppercase;
    font-size: 8pt;
    letter-spacing: 0.5px;
  }

  tr:nth-child(even) {
    background-color: #f8fafc;
  }

  .table-highlight {
    background-color: #eff6ff !important;
    font-weight: bold;
    color: #1d4ed8;
  }

  .table-danger {
    background-color: #fef2f2 !important;
    color: #b91c1c;
    font-weight: bold;
  }

  /* Callout boxes */
  .callout {
    border-left: 4px solid #2563eb;
    background: #f8fafc;
    padding: 10px 14px;
    border-radius: 0 6px 6px 0;
    margin: 12px 0;
    page-break-inside: avoid;
    font-size: 9.5pt;
  }

  .callout-title {
    font-weight: 700;
    color: #1e3a8a;
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .callout.formula {
    border-left-color: #059669;
    background: #f0fdf4;
  }
  .callout.formula .callout-title {
    color: #047857;
  }

  .callout.danger {
    border-left-color: #dc2626;
    background: #fef2f2;
  }
  .callout.danger .callout-title {
    color: #b91c1c;
  }

  .callout.hardware {
    border-left-color: #d97706;
    background: #fffbeb;
  }
  .callout.hardware .callout-title {
    color: #b45309;
  }

  /* Code / Monospace */
  code, .mono {
    font-family: "Courier New", Courier, monospace;
    font-size: 9pt;
    background: #f1f5f9;
    padding: 1px 4px;
    border-radius: 3px;
    color: #0f172a;
    font-weight: 600;
  }

  .badge {
    display: inline-block;
    padding: 2px 7px;
    border-radius: 4px;
    font-size: 8pt;
    font-weight: 700;
    text-transform: uppercase;
  }
  .badge-primary { background: #dbeafe; color: #1e40af; }
  .badge-success { background: #dcfce7; color: #15803d; }
  .badge-warning { background: #fef3c7; color: #b45309; }
  .badge-danger  { background: #fee2e2; color: #991b1b; }

  /* Two Column Grid */
  .grid-2 {
    display: flex;
    gap: 14px;
    margin: 10px 0;
    page-break-inside: avoid;
  }
  .grid-2 > div {
    flex: 1;
  }

  /* Page Break Rule */
  .page-break {
    page-break-before: always;
  }

  .diagram-box {
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    background: #f8fafc;
    padding: 12px;
    margin: 10px 0;
    text-align: center;
    page-break-inside: avoid;
  }
  
  .diagram-caption {
    font-size: 8.5pt;
    font-weight: 600;
    color: #64748b;
    margin-top: 6px;
  }
</style>
</head>
<body>

  <!-- COVER TITLE -->
  <div class="cover-card">
    <h1>SEQUENTIAL CIRCUITS &amp; FLIP-FLOPS</h1>
    <div class="subtitle">Complete High-Yield Engineering Reference Handbook &amp; Study Guide</div>
    <div class="meta-tags">
      <span class="meta-tag">SOURCE: R.P. JAIN (CH 7 &amp; CH 8)</span>
      <span class="meta-tag">TARGET: ADE / DEC / VLSI</span>
      <span class="meta-tag">CURRICULUM: SPPU / VTU / NATIONAL DIPLOMA &amp; DEGREE</span>
      <span class="meta-tag">PRODUCT: ADE MADE EASY</span>
    </div>
  </div>

  <!-- SECTION 1 -->
  <div class="section">
    <h2>1. Foundations of Sequential Logic &amp; Latches</h2>
    <p>
      Unlike <strong>combinational circuits</strong> whose output depends purely on present input levels, 
      a <strong>sequential digital circuit</strong> utilizes memory elements and feedback paths. Its output is 
      a function of both the present external inputs and the <strong>present state</strong> (stored past history).
    </p>

    <table>
      <thead>
        <tr>
          <th>Attribute</th>
          <th>Combinational Circuit</th>
          <th>Sequential Circuit</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Output Dependency</strong></td>
          <td>Present inputs only: \(Y = f(X)\)</td>
          <td>Present inputs + Past states: \(Y = f(X, Q_n)\)</td>
        </tr>
        <tr>
          <td><strong>Memory Elements</strong></td>
          <td>No memory required (direct gate logic)</td>
          <td>Latches or Flip-Flops present</td>
        </tr>
        <tr>
          <td><strong>Feedback Paths</strong></td>
          <td>Strictly feedforward (no feedback)</td>
          <td>Output fed back to combinational inputs</td>
        </tr>
        <tr>
          <td><strong>Clock Synchronization</strong></td>
          <td>Clockless</td>
          <td>Synchronous (clocked) or Asynchronous</td>
        </tr>
        <tr>
          <td><strong>Operating Speed</strong></td>
          <td>Faster (governed only by gate delays)</td>
          <td>Governed by clock cycle &amp; setup/hold constraints</td>
        </tr>
      </tbody>
    </table>

    <h3>1.1 The Basic 1-Bit Memory Cell &amp; Latches</h3>
    <p>
      The fundamental 1-bit memory cell consists of two cross-coupled inverters. To enter data externally, 
      2-input <strong>NAND</strong> or <strong>NOR</strong> gates are used, forming the <strong>S-R Latch</strong>.
    </p>

    <div class="grid-2">
      <div>
        <h4>NAND S-R Latch (Active-Low Inputs)</h4>
        <table>
          <thead>
            <tr><th>\(\bar{S}\)</th><th>\(\bar{R}\)</th><th>\(Q_{n+1}\)</th><th>State / Action</th></tr>
          </thead>
          <tbody>
            <tr><td>0</td><td>0</td><td class="table-danger">1 / 1 (?)</td><td class="table-danger">Forbidden / Invalid</td></tr>
            <tr><td>0</td><td>1</td><td class="table-highlight">1</td><td>Set State (\(Q=1\))</td></tr>
            <tr><td>1</td><td>0</td><td>0</td><td>Reset State (\(Q=0\))</td></tr>
            <tr><td>1</td><td>1</td><td>\(Q_n\)</td><td>No Change (Memory Hold)</td></tr>
          </tbody>
        </table>
      </div>
      <div>
        <h4>NOR S-R Latch (Active-High Inputs)</h4>
        <table>
          <thead>
            <tr><th>\(S\)</th><th>\(R\)</th><th>\(Q_{n+1}\)</th><th>State / Action</th></tr>
          </thead>
          <tbody>
            <tr><td>0</td><td>0</td><td>\(Q_n\)</td><td>No Change (Memory Hold)</td></tr>
            <tr><td>0</td><td>1</td><td>0</td><td>Reset State (\(Q=0\))</td></tr>
            <tr><td>1</td><td>0</td><td class="table-highlight">1</td><td>Set State (\(Q=1\))</td></tr>
            <tr><td>1</td><td>1</td><td class="table-danger">0 / 0 (?)</td><td class="table-danger">Forbidden / Invalid</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="callout hardware">
      <div class="callout-title">⚠️ Hardware Rule: Active-Low Preset (\(\bar{Pr}\)) and Clear (\(\bar{Cr}\))</div>
      Most practical TTL ICs (e.g. <strong>7474, 7476</strong>) feature asynchronous \(\bar{Pr}\) and \(\bar{Cr}\) pins. 
      Because they operate directly on the internal cross-coupled latch, they <strong>override the clock and data inputs</strong>.
      To operate normally in synchronous mode, both \(\bar{Pr}\) and \(\bar{Cr}\) must be tied to logic <strong>1 (\(V_{CC}\))</strong>.
    </div>
  </div>

  <!-- SECTION 2 -->
  <div class="section page-break">
    <h2>2. The Core 4 Flip-Flops: Characteristics &amp; Truth Tables</h2>

    <h3>2.1 Clocked S-R Flip-Flop</h3>
    <p>
      Gating the S-R inputs with a clock signal ensures transitions only occur during active clock intervals.
    </p>
    <table>
      <thead>
        <tr><th>\(CK\)</th><th>\(S\)</th><th>\(R\)</th><th>\(Q_n\)</th><th>\(Q_{n+1}\)</th><th>Action / Mode</th></tr>
      </thead>
      <tbody>
        <tr><td>0</td><td>\(\times\)</td><td>\(\times\)</td><td>\(Q\)</td><td>\(Q\)</td><td>No Clock (Latched)</td></tr>
        <tr><td>1</td><td>0</td><td>0</td><td>\(Q\)</td><td>\(Q\)</td><td>No Change (Hold)</td></tr>
        <tr><td>1</td><td>0</td><td>1</td><td>\(\times\)</td><td>0</td><td>Reset</td></tr>
        <tr><td>1</td><td>1</td><td>0</td><td>\(\times\)</td><td>1</td><td>Set</td></tr>
        <tr><td>1</td><td>1</td><td>1</td><td>\(\times\)</td><td class="table-danger">?</td><td class="table-danger">Prohibited State (\(S \cdot R = 0\) violation)</td></tr>
      </tbody>
    </table>
    <div class="callout formula">
      <div class="callout-title">📐 Characteristic Equation: S-R Flip-Flop</div>
      <strong>\(Q_{n+1} = S + \bar{R}Q_n\)</strong> &nbsp;&nbsp;(Subject to constraint: \(S \cdot R = 0\))
    </div>

    <h3>2.2 J-K Flip-Flop &amp; The Race-Around Condition</h3>
    <p>
      The J-K flip-flop solves the forbidden state of the S-R flip-flop by feeding back the outputs: 
      \(S = J\bar{Q}\) and \(R = KQ\). When \(J = K = 1\), the output <strong>toggles</strong> on every clock pulse.
    </p>
    <table>
      <thead>
        <tr><th>\(J\)</th><th>\(K\)</th><th>\(Q_n\)</th><th>\(Q_{n+1}\)</th><th>Operation</th></tr>
      </thead>
      <tbody>
        <tr><td>0</td><td>0</td><td>\(Q\)</td><td>\(Q\)</td><td>Hold / No Change</td></tr>
        <tr><td>0</td><td>1</td><td>\(\times\)</td><td>0</td><td>Reset</td></tr>
        <tr><td>1</td><td>0</td><td>\(\times\)</td><td>1</td><td>Set</td></tr>
        <tr><td>1</td><td>1</td><td>\(Q\)</td><td class="table-highlight">\(\bar{Q}\)</td><td class="table-highlight">Toggle Mode</td></tr>
      </tbody>
    </table>
    <div class="callout formula">
      <div class="callout-title">📐 Characteristic Equation: J-K Flip-Flop</div>
      <strong>\(Q_{n+1} = J\bar{Q}_n + \bar{K}Q_n\)</strong>
    </div>

    <div class="callout danger">
      <div class="callout-title">⚡ The Race-Around Condition (Critical Exam &amp; Viva Topic)</div>
      <strong>Cause:</strong> In a level-triggered J-K flip-flop with \(J=K=1\), if the clock pulse duration \(t_p\) is 
      longer than the flip-flop's internal propagation delay \(\Delta t\) (\(t_p > \Delta t\)), the output toggles repeatedly 
      during the single high pulse. At the end of the clock pulse, the final state of \(Q\) is unpredictable and indeterminate.
      <br><strong>Condition to Avoid:</strong> \(t_p &lt; \Delta t &lt; T\) (Practically difficult with high-speed ICs).
      <br><strong>Solution:</strong> 
      1. <strong>Master-Slave J-K Flip-Flop (e.g. IC 7476)</strong>: Isolates input reading on master during clock HIGH, and transfers to slave on falling edge.
      2. <strong>Edge-Triggered Flip-Flops (e.g. IC 7474, 74LS112)</strong>: Responds strictly at the rising or falling edge of the clock (data lockout).
    </div>

    <div class="grid-2">
      <div>
        <h3>2.3 D-Type Flip-Flop (Data / Delay)</h3>
        <p>Formed by setting \(K = \bar{J}\) or \(R = \bar{S}\). Transfers data directly to output on clock trigger.</p>
        <table>
          <thead><tr><th>\(D\)</th><th>\(Q_{n+1}\)</th><th>Operation</th></tr></thead>
          <tbody>
            <tr><td>0</td><td>0</td><td>Reset</td></tr>
            <tr><td>1</td><td>1</td><td>Set</td></tr>
          </tbody>
        </table>
        <div class="callout formula">
          <strong>\(Q_{n+1} = D\)</strong> &nbsp;(Used in registers, pipeline buffers, memory cells)
        </div>
      </div>
      <div>
        <h3>2.4 T-Type Flip-Flop (Toggle)</h3>
        <p>Formed by tying \(J = K = T\). Toggles output when \(T = 1\), holds state when \(T = 0\).</p>
        <table>
          <thead><tr><th>\(T\)</th><th>\(Q_{n+1}\)</th><th>Operation</th></tr></thead>
          <tbody>
            <tr><td>0</td><td>\(Q_n\)</td><td>Hold</td></tr>
            <tr><td>1</td><td>\(\bar{Q}_n\)</td><td>Toggle</td></tr>
          </tbody>
        </table>
        <div class="callout formula">
          <strong>\(Q_{n+1} = T \oplus Q_n\)</strong> &nbsp;(Used in binary ripple &amp; sync counters)
        </div>
      </div>
    </div>
  </div>

  <!-- SECTION 3 -->
  <div class="section page-break">
    <h2>3. The Master Excitation Table &amp; Flip-Flop Conversions</h2>
    <p>
      An <strong>Excitation Table</strong> specifies the required inputs to cause a desired state transition from 
      <strong>Present State (\(Q_n\))</strong> to <strong>Next State (\(Q_{n+1}\))</strong>. It is the core mathematical tool 
      for designing counters, sequence generators, and FSMs.
    </p>

    <table>
      <thead>
        <tr>
          <th colspan="2">State Transition</th>
          <th colspan="2">S-R Flip-Flop</th>
          <th colspan="2">J-K Flip-Flop</th>
          <th>T Flip-Flop</th>
          <th>D Flip-Flop</th>
        </tr>
        <tr>
          <th>Present (\(Q_n\))</th>
          <th>Next (\(Q_{n+1}\))</th>
          <th>\(S\)</th>
          <th>\(R\)</th>
          <th>\(J\)</th>
          <th>\(K\)</th>
          <th>\(T\)</th>
          <th>\(D\)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>0</strong></td>
          <td><strong>0</strong></td>
          <td>0</td>
          <td>\(\times\)</td>
          <td class="table-highlight">0</td>
          <td class="table-highlight">\(\times\)</td>
          <td>0</td>
          <td>0</td>
        </tr>
        <tr>
          <td><strong>0</strong></td>
          <td><strong>1</strong></td>
          <td>1</td>
          <td>0</td>
          <td class="table-highlight">1</td>
          <td class="table-highlight">\(\times\)</td>
          <td>1</td>
          <td>1</td>
        </tr>
        <tr>
          <td><strong>1</strong></td>
          <td><strong>0</strong></td>
          <td>0</td>
          <td>1</td>
          <td class="table-highlight">\(\times\)</td>
          <td class="table-highlight">1</td>
          <td>1</td>
          <td>0</td>
        </tr>
        <tr>
          <td><strong>1</strong></td>
          <td><strong>1</strong></td>
          <td>\(\times\)</td>
          <td>0</td>
          <td class="table-highlight">\(\times\)</td>
          <td class="table-highlight">0</td>
          <td>0</td>
          <td>1</td>
        </tr>
      </tbody>
    </table>

    <h3>3.1 Universal Flip-Flop Conversion Algorithm (3 Steps)</h3>
    <ol>
      <li><strong>Identify:</strong> Define the <em>Available Flip-Flop</em> (what you have) and the <em>Required Flip-Flop</em> (what you want to build).</li>
      <li><strong>Construct Combined Truth-Excitation Table:</strong> 
        List columns: [Required Inputs] \(\rightarrow\) [Present State \(Q_n\)] \(\rightarrow\) [Next State \(Q_{n+1}\)] \(\rightarrow\) [Available Inputs needed from Excitation Table].
      </li>
      <li><strong>Minimize using K-Maps:</strong> Solve for each Available input variable in terms of Required inputs and \(Q_n\). Draw the circuit.</li>
    </ol>

    <div class="grid-2">
      <div class="callout">
        <div class="callout-title">Solved Example 1: Convert S-R to J-K</div>
        <ul>
          <li>Available: S-R Flip-Flop; Required: J-K Flip-Flop.</li>
          <li>Excitation extraction gives:
            <br>For \(S\): minterms at \(J=1, \bar{Q}=1\) &rarr; <strong>\(S = J\bar{Q}\)</strong>
            <br>For \(R\): minterms at \(K=1, Q=1\) &rarr; <strong>\(R = KQ\)</strong>
          </li>
          <li><strong>Implementation:</strong> Two 2-input AND gates driving S and R with cross-coupled feedback from \(\bar{Q}\) and \(Q\).</li>
        </ul>
      </div>
      <div class="callout">
        <div class="callout-title">Solved Example 2: Convert J-K to D-Type</div>
        <ul>
          <li>Available: J-K Flip-Flop; Required: D Flip-Flop.</li>
          <li>For \(D=0\): Need \(Q^+=0\) &rarr; \(J=0, K=1\)</li>
          <li>For \(D=1\): Need \(Q^+=1\) &rarr; \(J=1, K=0\)</li>
          <li><strong>Equations:</strong> <strong>\(J = D\)</strong>, and <strong>\(K = \bar{D}\)</strong></li>
          <li><strong>Implementation:</strong> Single inverter (7404) between J and K input terminals.</li>
        </ul>
      </div>
    </div>
  </div>

  <!-- SECTION 4 -->
  <div class="section page-break">
    <h2>4. Timing Specifications &amp; VLSI Hardware Physics</h2>
    <p>
      In real semiconductor circuits, signals take time to propagate, and flip-flops require signals to be stable 
      around clock transitions to prevent <strong>metastability</strong>.
    </p>

    <table>
      <thead>
        <tr>
          <th>Parameter</th>
          <th>Symbol</th>
          <th>Definition</th>
          <th>74LS74A (TTL)</th>
          <th>74HC74A (CMOS)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Setup Time</strong></td>
          <td>\(t_s\)</td>
          <td>Minimum time data input must remain stable <em>before</em> active clock edge</td>
          <td>20 ns</td>
          <td>14 ns</td>
        </tr>
        <tr>
          <td><strong>Hold Time</strong></td>
          <td>\(t_h\)</td>
          <td>Minimum time data input must remain stable <em>after</em> active clock edge</td>
          <td>5 ns</td>
          <td>3 ns</td>
        </tr>
        <tr>
          <td><strong>Propagation Delay</strong></td>
          <td>\(t_{pLH}, t_{pHL}\)</td>
          <td>Delay from 50% point of clock transition to 50% point of output \(Q\) transition</td>
          <td>25 - 40 ns</td>
          <td>17 - 18 ns</td>
        </tr>
        <tr>
          <td><strong>Clock Pulse Width</strong></td>
          <td>\(t_{CH}, t_{CL}\)</td>
          <td>Minimum duration clock pulse must remain HIGH or LOW</td>
          <td>25 ns</td>
          <td>10 ns</td>
        </tr>
        <tr>
          <td><strong>Max Clock Frequency</strong></td>
          <td>\(f_{max}\)</td>
          <td>Highest rate at which flip-flop can be reliably clocked</td>
          <td>25 MHz</td>
          <td>35 MHz</td>
        </tr>
      </tbody>
    </table>

    <div class="callout danger">
      <div class="callout-title">⏱️ Clock Skew in High-Speed VLSI Systems</div>
      <strong>Definition:</strong> Difference in clock arrival time at two different flip-flops (\(\Delta t_{skew} = t_{clk2} - t_{clk1}\)).
      If destination flip-flop receives clock later than source, a data race occurs.
      To prevent hold time violations: <strong>\(t_{prop(source)} \ge t_{hold(dest)} + t_{skew}\)</strong>.
    </div>
  </div>

  <!-- SECTION 5 -->
  <div class="section page-break">
    <h2>5. Shift Registers &amp; IC 74194</h2>
    <p>
      A register is a cascade of flip-flops used for bit storage and bit manipulation. For an \(N\)-bit register, 
      \(N\) flip-flops are required.
    </p>

    <h3>5.1 The 4 Modes of Shift Register Operation</h3>
    <table>
      <thead>
        <tr>
          <th>Mode</th>
          <th>Full Name</th>
          <th>Input Type</th>
          <th>Output Type</th>
          <th>Clocks to Write</th>
          <th>Clocks to Read</th>
          <th>Primary Real-World Use</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>SISO</strong></td>
          <td>Serial-In Serial-Out</td>
          <td>1 bit/clock</td>
          <td>1 bit/clock</td>
          <td>\(N\) pulses</td>
          <td>\(N-1\) pulses</td>
          <td>Digital Delay Line: \(\Delta t = N \times \frac{1}{f_c}\)</td>
        </tr>
        <tr>
          <td><strong>SIPO</strong></td>
          <td>Serial-In Parallel-Out</td>
          <td>1 bit/clock</td>
          <td>All \(N\) bits</td>
          <td>\(N\) pulses</td>
          <td>0 (Instantaneous)</td>
          <td>UART / SPI Receiver (Deserializer)</td>
        </tr>
        <tr>
          <td><strong>PISO</strong></td>
          <td>Parallel-In Serial-Out</td>
          <td>All \(N\) bits</td>
          <td>1 bit/clock</td>
          <td>1 pulse (load)</td>
          <td>\(N\) pulses</td>
          <td>UART / SPI Transmitter (Serializer)</td>
        </tr>
        <tr>
          <td><strong>PIPO</strong></td>
          <td>Parallel-In Parallel-Out</td>
          <td>All \(N\) bits</td>
          <td>All \(N\) bits</td>
          <td>1 pulse</td>
          <td>0 (Instantaneous)</td>
          <td>CPU Data Bus Buffer / Scratch Register</td>
        </tr>
      </tbody>
    </table>

    <h3>5.2 IC 74194 (4-Bit Bidirectional Universal Shift Register)</h3>
    <p>
      The industry standard MSI universal shift register. Capable of all 4 modes plus bidirectional shifting.
    </p>
    <table>
      <thead>
        <tr><th colspan="2">Mode Select</th><th rowspan="2">Clock (\(CK\))</th><th rowspan="2">Clear (\(\bar{Cr}\))</th><th rowspan="2">Operation Performed</th></tr>
        <tr><th>\(S_1\)</th><th>\(S_0\)</th></tr>
      </thead>
      <tbody>
        <tr><td>\(\times\)</td><td>\(\times\)</td><td>\(\times\)</td><td>0</td><td class="table-danger">Reset to 0000 (Asynchronous Clear)</td></tr>
        <tr><td>0</td><td>0</td><td>\(\times\)</td><td>1</td><td>Inhibit Clock (Hold State)</td></tr>
        <tr><td>0</td><td>1</td><td>&uarr;</td><td>1</td><td class="table-highlight">Shift Right (\(D_{SR} \rightarrow Q_A \rightarrow Q_B \rightarrow Q_C \rightarrow Q_D\))</td></tr>
        <tr><td>1</td><td>0</td><td>&uarr;</td><td>1</td><td class="table-highlight">Shift Left (\(Q_A \leftarrow Q_B \leftarrow Q_C \leftarrow Q_D \leftarrow D_{SL}\))</td></tr>
        <tr><td>1</td><td>1</td><td>&uarr;</td><td>1</td><td>Parallel Load (\(A, B, C, D \rightarrow Q_A, Q_B, Q_C, Q_D\))</td></tr>
      </tbody>
    </table>

    <div class="grid-2">
      <div>
        <h3>5.3 Ring Counter</h3>
        <ul>
          <li><strong>Connection:</strong> Serial output \(Q_0\) fed back to serial input \(D\) of first stage.</li>
          <li><strong>Pre-load:</strong> Initialized to \(1000\) (single 1 circulating).</li>
          <li><strong>Modulus:</strong> <strong>\(N\) states</strong> for \(N\) flip-flops.</li>
          <li><strong>Waveform:</strong> Sequential, non-overlapping pulses.</li>
          <li><strong>Application:</strong> Multiphase clock generator, stepper motor phase sequencer.</li>
        </ul>
      </div>
      <div>
        <h3>5.4 Johnson (Twisted-Ring) Counter</h3>
        <ul>
          <li><strong>Connection:</strong> Inverted serial output \(\bar{Q}_0\) fed back to serial input \(D\).</li>
          <li><strong>Pre-load:</strong> Starts from cleared state \(0000\).</li>
          <li><strong>Modulus:</strong> <strong>\(2N\) states</strong> for \(N\) flip-flops (Twice the states!).</li>
          <li><strong>Decoding:</strong> Decoded with simple 2-input AND gates without glitch hazards.</li>
          <li><strong>Application:</strong> High-speed frequency divider, Quadrature clock generation.</li>
        </ul>
      </div>
    </div>
  </div>

  <!-- SECTION 6 -->
  <div class="section page-break">
    <h2>6. Counters: Asynchronous (Ripple) &amp; Synchronous Design</h2>

    <h3>6.1 Ripple Counters vs. Synchronous Counters</h3>
    <table>
      <thead>
        <tr><th>Feature</th><th>Asynchronous (Ripple) Counter</th><th>Synchronous Counter</th></tr>
      </thead>
      <tbody>
        <tr><td><strong>Clock Connection</strong></td><td>Only FF0 connected to clock; succeeding FFs clocked by previous output</td><td>All flip-flops connected to the exact same master clock simultaneously</td></tr>
        <tr><td><strong>Propagation Delay</strong></td><td>Cumulative: \(t_{total} = N \cdot t_{pd}\)</td><td>Fixed: Single flip-flop delay \(t_{pd}\)</td></tr>
        <tr><td><strong>Maximum Frequency</strong></td><td>Low: \(f_{max} \le \frac{1}{N \cdot t_d + T_s}\)</td><td>High: \(f_{max} \le \frac{1}{t_d + t_{comb}}\)</td></tr>
        <tr><td><strong>Decoding Glitches</strong></td><td>Severe false spikes due to intermediate transient states</td><td>Minimal / Glitch-free</td></tr>
      </tbody>
    </table>

    <h3>6.2 Key Asynchronous Counter ICs: 7490 &amp; 7493</h3>
    <div class="grid-2">
      <div class="callout">
        <div class="callout-title">IC 7490 BCD Decade Counter</div>
        <ul>
          <li>Contains independent Mod-2 (\(FF_A\)) and Mod-5 (\(FF_B, FF_C, FF_D\)) sections.</li>
          <li><strong>Mod-10 Connection:</strong> Connect \(Q_A\) output to Input B. Apply clock to Input A.</li>
          <li><strong>Mod-6 Counter Design:</strong> Connect outputs \(Q_B\) and \(Q_C\) (count \(0110 = 6\)) to Reset pins \(R_1, R_2\).</li>
        </ul>
      </div>
      <div class="callout">
        <div class="callout-title">IC 7493 4-Bit Binary Counter</div>
        <ul>
          <li>Contains Mod-2 (\(FF_A\)) and Mod-8 (\(FF_B, FF_C, FF_D\)) sections.</li>
          <li><strong>Mod-16 Connection:</strong> Connect \(Q_A\) output to Input B. Apply clock to Input A. Counts 0 to 15.</li>
          <li><strong>Mod-12 Counter Design:</strong> Connect outputs \(Q_C\) and \(Q_D\) (count \(1100 = 12\)) to Reset pins \(R_1, R_2\).</li>
        </ul>
      </div>
    </div>

    <h3>6.3 Step-by-Step Synchronous Counter Design Procedure</h3>
    <ol>
      <li>Find number of flip-flops required: \(2^N \ge M\) (where \(M\) is modulus).</li>
      <li>Write state transition table (\(Q_2 Q_1 Q_0 \rightarrow Q_2^+ Q_1^+ Q_0^+\)).</li>
      <li>Use Flip-Flop Excitation Table to determine required inputs for each state transition.</li>
      <li>Plot K-maps for each input and minimize expressions.</li>
      <li>Draw the circuit diagram.</li>
    </ol>

    <div class="callout formula">
      <div class="callout-title">📐 Master Derived Equations: 3-Bit Synchronous Binary UP Counter (using J-K)</div>
      <ul>
        <li>Stage 0 (LSB): <strong>\(J_0 = 1, \quad K_0 = 1\)</strong> (Toggles on every single clock pulse)</li>
        <li>Stage 1: <strong>\(J_1 = Q_0, \quad K_1 = Q_0\)</strong> (Toggles when \(Q_0 = 1\))</li>
        <li>Stage 2 (MSB): <strong>\(J_2 = Q_0 \cdot Q_1, \quad K_2 = Q_0 \cdot Q_1\)</strong> (Toggles when both \(Q_0 = 1\) and \(Q_1 = 1\))</li>
      </ul>
    </div>
  </div>

  <!-- SECTION 7 -->
  <div class="section page-break">
    <h2>7. Finite State Machines (FSMs) &amp; Sequential Synthesis</h2>
    
    <div class="grid-2">
      <div>
        <h3>Mealy Model</h3>
        <p>Outputs are a function of <strong>both present state and current inputs</strong>: \(Y = f(PS, X)\). 
        Outputs change asynchronously if inputs change between clock pulses.</p>
      </div>
      <div>
        <h3>Moore Model</h3>
        <p>Outputs are a function of <strong>present state only</strong>: \(Y = f(PS)\). 
        Outputs change strictly synchronously on clock edges, eliminating input glitch hazards.</p>
      </div>
    </div>

    <h3>7.1 Solved Classic Design: Sequence Detector for `1010`</h3>
    <p>
      Detects the bit stream <strong>`1010`</strong> on a serial input \(X\). When detected, output \(Y = 1\).
    </p>

    <table>
      <thead>
        <tr>
          <th>State</th>
          <th>Sequence Stored</th>
          <th>Next State (\(X=0\))</th>
          <th>Next State (\(X=1\))</th>
          <th>Output \(Y\) (\(X=0\))</th>
          <th>Output \(Y\) (\(X=1\))</th>
        </tr>
      </thead>
      <tbody>
        <tr><td><strong>A (00)</strong></td><td>No bit matched (Reset)</td><td>A</td><td>B</td><td>0</td><td>0</td></tr>
        <tr><td><strong>B (01)</strong></td><td>Matched `1`</td><td>C</td><td>B</td><td>0</td><td>0</td></tr>
        <tr><td><strong>C (10)</strong></td><td>Matched `10`</td><td>A</td><td>D</td><td>0</td><td>0</td></tr>
        <tr><td><strong>D (11)</strong></td><td>Matched `101`</td><td>C</td><td>B</td><td class="table-highlight">1 (Sequence 1010 detected!)</td><td>0</td></tr>
      </tbody>
    </table>

    <div class="callout formula">
      <div class="callout-title">📐 Synthesized D Flip-Flop Excitation Equations (from K-Maps)</div>
      <ul>
        <li>Flip-Flop 1 Input: <strong>\(D_1 = Q_0 \bar{X} + Q_1 \bar{Q}_0 X\)</strong></li>
        <li>Flip-Flop 0 Input: <strong>\(D_0 = X\)</strong></li>
        <li>Output Equation: <strong>\(Y = Q_1 Q_0 \bar{X}\)</strong></li>
      </ul>
    </div>
  </div>

  <!-- SECTION 8 -->
  <div class="section page-break">
    <h2>8. Real-World Practical Applications &amp; Circuit Engineering</h2>

    <h3>8.1 Switch Debouncing Circuit (Chatterless Switch)</h3>
    <p>
      Mechanical switches bounce upon closing for 5–20 ms, creating false pulse bursts that cause counters to advance multiple counts.
      An <strong>S-R latch with pull-up resistors and SPDT push button</strong> completely eliminates bouncing:
      the first physical contact flip sets the latch, and subsequent chattering produces no state change.
    </p>

    <h3>8.2 Stepper Motor 4-Phase Drive Generator</h3>
    <p>
      A 4-bit Ring Counter running on clock pulses generates the sequence \(\Phi_1 \rightarrow \Phi_2 \rightarrow \Phi_3 \rightarrow \Phi_4\) 
      (\(1000 \rightarrow 0100 \rightarrow 0010 \rightarrow 0001\)), directly sequencing power transistors to rotate stepper motor poles.
    </p>

    <h3>8.3 1-Bit Static RAM (SRAM) Cell Architecture</h3>
    <p>
      A clocked D latch combined with address select line (\(A_n\)) and Read/Write control line (\(R/\bar{W}\)):
      When \(A_n = 1\) and \(R/\bar{W} = 0\), data is written into the cell. When \(A_n = 1\) and \(R/\bar{W} = 1\), data is read out non-destructively.
    </p>

    <div style="margin-top: 30px; padding: 14px; background: #f1f5f9; border-radius: 6px; text-align: center; font-size: 8.5pt; color: #64748b;">
      <strong>ADE Made Easy Study Reference</strong> &bull; Extracted from R. P. Jain Chapters 7 &amp; 8 &bull; Compiled for Antigravity EDA Platform
    </div>
  </div>

</body>
</html>
"""

def generate_pdf():
    work_dir = r"c:\Users\Sagar\Documents\GitHub\logic_sim_suite"
    html_path = os.path.join(work_dir, "sequential_circuits_handbook.html")
    pdf_path = os.path.join(work_dir, "Sequential_Logic_Complete_Reference.pdf")

    # Write HTML file
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(HTML_CONTENT)
    print(f"HTML handbook written to: {html_path}")

    # Invoke Chrome headless to compile to PDF
    chrome_exe = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
    cmd = [
        chrome_exe,
        "--headless=new",
        "--disable-gpu",
        "--no-pdf-header-footer",
        f"--print-to-pdf={pdf_path}",
        html_path
    ]
    print(f"Compiling PDF via Chrome: {pdf_path}")
    res = subprocess.run(cmd, capture_output=True, text=True)
    if os.path.exists(pdf_path):
        size_kb = os.path.getsize(pdf_path) / 1024
        print(f"SUCCESS: PDF created successfully! Size: {size_kb:.1f} KB")
        return pdf_path
    else:
        print(f"ERROR creating PDF. Stderr: {res.stderr}")
        return None

if __name__ == "__main__":
    generate_pdf()
