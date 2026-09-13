async function convertBits() {
  const fromCode = document.getElementById("fromCode").value;
  const toCode = document.getElementById("toCode").value;
  const bits = document.getElementById("bitsInput").value;
  const resultBox = document.getElementById("convertResult");

  resultBox.classList.remove("error");
  resultBox.textContent = "Converting...";

  try {
    const response = await fetch("http://127.0.0.1:8000/convert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from_code: fromCode, to_code: toCode, bits: bits }),
    });

    const data = await response.json();

    if (!response.ok) {
      // FastAPI's error shape is { "detail": "..." }, not the success shape
      resultBox.textContent = "Error: " + data.detail;
      resultBox.classList.add("error");
      return;
    }

    resultBox.textContent =
      `${data.input_bits} (decimal ${data.decimal_value}) \u2192 ${data.output_bits}`;

  } catch (err) {
    // network failure (backend not running, CORS blocked, wrong URL) —
    // different from a 422, which is a successful request with a bad answer
    resultBox.textContent = "Could not reach the server: " + err.message;
    resultBox.classList.add("error");
  }
}
