// DOM references and application state
const expressionOutput = document.querySelector("#expression");
const resultOutput = document.querySelector("#result");
const keypad = document.querySelector("#keypad");
const historyList = document.querySelector("#historyList");
const clearHistoryButton = document.querySelector("#clearHistory");
const angleModeButton = document.querySelector("#angleMode");
let expression = "";
let angleMode = "DEG";
let history = [];

// Screen and history rendering helpers
function formatExpression(value) {
  return value.replaceAll("PI", "pi").replaceAll("sqrt", "sqrt");
}

function render(result = "0") {
  expressionOutput.textContent = formatExpression(expression || "0");
  resultOutput.textContent = result;
}

function renderHistory() {
  historyList.innerHTML = "";
  if (!history.length) {
    historyList.innerHTML = '<li class="history__empty">Your calculations will appear here.</li>';
    return;
  }
  history.forEach((entry) => {
    const item = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.answer = entry.answer;
    button.innerHTML = `<span>${formatExpression(entry.expression)}</span><strong>= ${entry.answer}</strong>`;
    item.append(button);
    historyList.append(item);
  });
}

// Factorial helper with sensible limits
function factorial(number) {
  if (!Number.isInteger(number) || number < 0 || number > 170) throw new Error("Invalid factorial");
  let total = 1;
  for (let index = 2; index <= number; index += 1) total *= index;
  return total;
}

// Safe calculation parser and evaluator
function evaluateExpression(input) {
  let parsed = input.replaceAll("^", "**");
  let previous;
  do {
    previous = parsed;
    parsed = parsed.replace(/(\d*\.?\d+|\([^()]*\))%/g, "($1/100)");
    parsed = parsed.replace(/(\d*\.?\d+|\([^()]*\))!/g, "factorial($1)");
  } while (previous !== parsed);

  if (!/^[0-9+\-*/().,\sA-Za-z]*$/.test(parsed)) throw new Error("Invalid input");
  const radians = (value) => angleMode === "DEG" ? value * Math.PI / 180 : value;
  const scope = { PI: Math.PI, e: Math.E, sqrt: Math.sqrt, abs: Math.abs, log: Math.log10, ln: Math.log, factorial, sin: (x) => Math.sin(radians(x)), cos: (x) => Math.cos(radians(x)), tan: (x) => Math.tan(radians(x)) };
  const names = Object.keys(scope);
  const identifiers = parsed.match(/[A-Za-z]+/g) || [];
  if (identifiers.some((name) => !names.includes(name))) throw new Error("Invalid input");
  const value = Function(...names, `"use strict"; return (${parsed});`)(...Object.values(scope));
  if (!Number.isFinite(value)) throw new Error("Math error");
  return Number(value.toPrecision(12)).toString();
}

// Keypad button actions
keypad.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  const { action, value } = button.dataset;
  if (action === "clear") { expression = ""; render(); return; }
  if (action === "delete") { expression = expression.slice(0, -1); render(); return; }
  if (action === "equals") {
    try {
      const source = expression;
      const answer = evaluateExpression(source);
      history = [{ expression: source, answer }, ...history].slice(0, 8);
      renderHistory();
      expression = answer;
      render(answer);
    } catch { render("Error"); }
    return;
  }
  expression = expression === "0" ? value : expression + value;
  render();
});

// Keyboard support for common calculator controls
document.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === "=") { event.preventDefault(); document.querySelector('[data-action="equals"]').click(); return; }
  if (event.key === "Escape") { document.querySelector('[data-action="clear"]').click(); return; }
  if (event.key === "Backspace") { document.querySelector('[data-action="delete"]').click(); return; }
  if ("0123456789.+-*/()%".includes(event.key)) { expression += event.key; render(); }
});

// History reuse and clear controls
historyList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-answer]");
  if (!button) return;
  expression = button.dataset.answer;
  render(expression);
});

clearHistoryButton.addEventListener("click", () => { history = []; renderHistory(); });

// Degree and radian mode control
angleModeButton.addEventListener("click", () => {
  angleMode = angleMode === "DEG" ? "RAD" : "DEG";
  angleModeButton.textContent = angleMode;
});
