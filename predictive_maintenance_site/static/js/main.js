// PROGRESS BAR
const bar = document.getElementById("progress-bar");
window.addEventListener("scroll", () => {
  const s = window.scrollY, h = document.documentElement.scrollHeight - window.innerHeight;
  bar.style.width = (h > 0 ? (s / h) * 100 : 0) + "%";
  document.getElementById("navbar").classList.toggle("scrolled", s > 40);
  checkReveal();
}, { passive: true });

// HAMBURGER
const hamburger = document.getElementById("hamburger");
const drawer = document.getElementById("drawer");
hamburger.addEventListener("click", () => drawer.classList.toggle("open"));
document.querySelectorAll(".drawer-link").forEach(l => l.addEventListener("click", () => drawer.classList.remove("open")));

// REVEAL
function checkReveal() {
  document.querySelectorAll(".reveal, .reveal-right").forEach(el => {
    if (el.getBoundingClientRect().top < window.innerHeight * 0.88) el.classList.add("visible");
  });
}

// SMOOTH SCROLL
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener("click", e => {
    e.preventDefault();
    const t = document.querySelector(a.getAttribute("href"));
    if (t) t.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

// SENSOR ANIMATION
function animateSensors() {
  document.querySelectorAll(".anim-val").forEach(el => {
    const vals = el.dataset.vals.split(",");
    let i = 0;
    setInterval(() => {
      i = (i + 1) % vals.length;
      el.style.opacity = "0";
      setTimeout(() => { el.textContent = vals[i].trim(); el.style.opacity = "1"; }, 200);
    }, 2000 + Math.random() * 800);
  });
}

function animateSensorBars() {
  setTimeout(() => {
    document.querySelectorAll(".sensor-fill").forEach(el => {
      const w = el.style.width; el.style.width = "0%";
      requestAnimationFrame(() => requestAnimationFrame(() => {
        el.style.transition = "width 1.2s ease"; el.style.width = w;
      }));
    });
  }, 300);
}

document.addEventListener("DOMContentLoaded", () => {
  checkReveal();
  animateSensors();
  animateSensorBars();
});
// PREDICTION FORM LOGIC
const predictionForm = document.getElementById("prediction-form");
const resultsCard = document.getElementById("prediction-results");
const submitBtn = document.getElementById("submit-btn");
const btnLoader = submitBtn.querySelector(".btn-loader");
const btnText = submitBtn.querySelector(".btn-text");

const resPlaceholder = resultsCard.querySelector(".result-placeholder");
const resContent = resultsCard.querySelector(".result-content");
const diagLoader = resultsCard.querySelector(".diagnostic-loader");
const hybridStatus = document.getElementById("hybrid-status");
const statusDot = resultsCard.querySelector(".status-dot");
const statusMsg = resultsCard.querySelector(".status-message");

if (predictionForm) {
  predictionForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(predictionForm);
    const data = Object.fromEntries(formData.entries());

    // UI Loading State
    submitBtn.disabled = true;
    btnLoader.classList.remove("hidden");
    btnText.textContent = "Processing...";

    // Reset Card State & Show Mechanism
    resultsCard.classList.remove("initial", "safe", "fail");
    resPlaceholder.classList.add("hidden");
    resContent.classList.add("hidden");
    diagLoader.classList.remove("hidden");

    resetLogs();
    statusMsg.textContent = "Computing Diagnostic...";
    statusDot.className = "status-dot pulse";

    try {
      const response = await fetch("/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (result.status === "success") {
        // Run The Animation Mechanism (Heavy Task feel)
        await runDiagnosticSequence();
        displayHybridResult(result.prediction);
      } else {
        alert("Error: " + result.message);
        resetResultCard();
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while connecting to the server.");
      resetResultCard();
    } finally {
      submitBtn.disabled = false;
      btnLoader.classList.add("hidden");
      btnText.textContent = "Run Diagnostic";
      diagLoader.classList.add("hidden");
    }
  });
}

function resetLogs() {
  document.querySelectorAll(".log-line").forEach((l, i) => {
    if (i === 0) {
      l.classList.remove("hidden", "active");
    } else {
      l.classList.add("hidden");
    }
  });
}

async function runDiagnosticSequence() {
  const steps = [
    { id: "log-1", delay: 400 },
    { id: "log-2", delay: 600 },
    { id: "log-3", delay: 800 },
    { id: "log-4", delay: 600 },
    { id: "log-5", delay: 400 }
  ];

  for (let step of steps) {
    const el = document.getElementById(step.id);
    if (el) {
      el.classList.remove("hidden");
      el.classList.add("active");
      await new Promise(r => setTimeout(r, step.delay));
      el.classList.remove("active");
    }
  }
  // Extra pause for impact
  await new Promise(r => setTimeout(r, 400));
}

function displayHybridResult(prediction) {
  resPlaceholder.classList.add("hidden");
  resContent.classList.remove("hidden");

  hybridStatus.textContent = prediction;
  hybridStatus.className = "res-val"; // Reset classes

  if (prediction === "No Failure") {
    resultsCard.classList.add("safe");
    hybridStatus.classList.add("text-safe");
    statusMsg.textContent = "Machine Healthy";
    statusDot.className = "status-dot green";
  } else {
    resultsCard.classList.add("fail");
    hybridStatus.classList.add("text-fail");
    statusMsg.textContent = "Failure Detected";
    statusDot.className = "status-dot red";
  }

  // Animation Trigger
  resultsCard.style.transform = "scale(1.02)";
  setTimeout(() => resultsCard.style.transform = "scale(1)", 300);
}

function resetResultCard() {
  resultsCard.classList.add("initial");
  resPlaceholder.classList.remove("hidden");
  resContent.classList.add("hidden");
  statusMsg.textContent = "System Idle";
  statusDot.className = "status-dot";
}

// RANDOMIZATION LOGIC
const randomBtn = document.getElementById("random-btn");
if (randomBtn) {
  randomBtn.addEventListener("click", () => {
    const typeSelect = document.getElementById("type");
    const airTempInput = document.getElementById("air_temp");
    const procTempInput = document.getElementById("process_temp");
    const speedInput = document.getElementById("rot_speed");
    const torqueInput = document.getElementById("torque");
    const wearInput = document.getElementById("tool_wear");

    // 40% chance of generating a "Failure Scenario" to avoid looking biased
    const generateFailure = Math.random() < 0.4;

    // Base Values
    let type = ["L", "M", "H"][Math.floor(Math.random() * 3)];
    let airTemp = (Math.random() * (305 - 295) + 295).toFixed(1);
    let procTemp = (parseFloat(airTemp) + Math.random() * (12 - 8) + 8).toFixed(1);
    let speed = Math.floor(Math.random() * (2800 - 1200) + 1200);
    let torque = (Math.random() * (75 - 10) + 10).toFixed(1);
    let wear = Math.floor(Math.random() * 250);

    if (generateFailure) {
      const mode = Math.random();
      if (mode < 0.5) {
        // Mode 1: Overstrain (High Torque + Low Speed)
        torque = (Math.random() * (75 - 65) + 65).toFixed(1);
        speed = Math.floor(Math.random() * (1350 - 1200) + 1200);
        wear = Math.floor(Math.random() * (250 - 150) + 150);
      } else {
        // Mode 2: Extreme Tool Wear
        wear = Math.floor(Math.random() * (250 - 210) + 210);
        torque = (Math.random() * (60 - 45) + 45).toFixed(1);
      }
    }

    // Update Inputs with animation
    const updateWithEffect = (el, val) => {
      el.classList.add("highlight-flash");
      el.value = val;
      setTimeout(() => el.classList.remove("highlight-flash"), 400);
    };

    typeSelect.value = type;
    updateWithEffect(airTempInput, airTemp);
    updateWithEffect(procTempInput, procTemp);
    updateWithEffect(speedInput, speed);
    updateWithEffect(torqueInput, torque);
    updateWithEffect(wearInput, wear);

    // Add simple CSS class for highlight if not exists
    if (!document.getElementById("flash-style")) {
      const style = document.createElement("style");
      style.id = "flash-style";
      style.textContent = ".highlight-flash { background: rgba(0, 240, 255, 0.2) !important; border-color: #00f0ff !important; }";
      document.head.appendChild(style);
    }
  });
}

// --- SERVER WAKE-UP LOGIC ---
document.addEventListener("DOMContentLoaded", () => {
  const loader = document.getElementById("server-loader");
  const loaderText = document.getElementById("loader-text");

  const entertainMessages = [
    "Calibrating industrial sensors...",
    "Tuning Hybrid Ensemble weights...",
    "Normalizing dataset parameters...",
    "Initializing RF decision trees...",
    "Computing KNN neighbor clusters...",
    "Stabilizing sensor data feed...",
    "Training the predictive models...",
    "Optimizing diagnostic pipeline...",
    "Securing industrial interface...",
    "Processing historical maintenance logs..."
  ];

  let msgIndex = 0;
  const textInterval = setInterval(() => {
    loaderText.style.opacity = 0;
    setTimeout(() => {
      msgIndex = (msgIndex + 1) % entertainMessages.length;
      loaderText.textContent = entertainMessages[msgIndex];
      loaderText.style.opacity = 1;
    }, 300);
  }, 3500);

  // Function to check if server is active
  const checkServer = async () => {
    try {
      // We ping the index page. Render's cold start will hang here until ready.
      const response = await fetch("/", { method: "HEAD" });
      if (response.ok) {
        clearInterval(textInterval);
        loader.classList.add("loaded");
        console.log("Server active. Dashboard ready.");
      } else {
        setTimeout(checkServer, 2000);
      }
    } catch (err) {
      // Still starting up or network issue
      setTimeout(checkServer, 2000);
    }
  };

  // Delay the first check slightly to let the animation start
  setTimeout(checkServer, 1000);
});

// ══════════════════════════════════════════════════════════
// EVALUATION SECTION — Confusion Matrix + ROC Charts
// ══════════════════════════════════════════════════════════

const CHART_DEFAULTS = {
  color: "#9494a8",
  grid: "rgba(255,255,255,0.06)",
  accent: "#f59e0b"
};

const MODEL_COLORS = {
  "Logistic Regression": "#ef4444",
  "Decision Tree": "#f59e0b",
  "KNN": "#3b82f6",
  "Random Forest": "#10b981",
  "Hybrid (RF + KNN)": "#a78bfa"
};

let evalData = {};
let rocSingleChart = null;
let rocAllChart = null;
let activeEvalModel = "Logistic Regression";

// Update CM cells + single ROC chart for the selected model
function renderEvalForModel(modelKey) {
  const d = evalData[modelKey];
  if (!d) return;

  // Confusion matrix cells
  document.getElementById("cm-tn").textContent = d.cm[0].toLocaleString();
  document.getElementById("cm-fp").textContent = d.cm[1].toLocaleString();
  document.getElementById("cm-fn").textContent = d.cm[2].toLocaleString();
  document.getElementById("cm-tp").textContent = d.cm[3].toLocaleString();

  // ROC label + AUC badge
  document.getElementById("roc-model-label").textContent = modelKey;
  document.getElementById("roc-auc-label").textContent = `AUC: ${d.auc}`;

  const color = MODEL_COLORS[modelKey] || "#f59e0b";
  const ctx = document.getElementById("rocSingleChart").getContext("2d");

  if (rocSingleChart) rocSingleChart.destroy();
  rocSingleChart = new Chart(ctx, {
    type: "line",
    data: {
      datasets: [
        {
          label: `${modelKey} (AUC = ${d.auc})`,
          data: d.fpr.map((x, i) => ({ x, y: d.tpr[i] })),
          borderColor: color,
          backgroundColor: color.replace(")", ", 0.08)").replace("rgb", "rgba"),
          borderWidth: 2.5,
          fill: true,
          tension: 0.3,
          pointRadius: 0
        },
        {
          label: "Random Baseline",
          data: [{ x: 0, y: 0 }, { x: 1, y: 1 }],
          borderColor: "rgba(255,255,255,0.2)",
          borderWidth: 1,
          borderDash: [5, 5],
          pointRadius: 0,
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 500 },
      scales: {
        x: {
          type: "linear", min: 0, max: 1,
          title: { display: true, text: "False Positive Rate", color: CHART_DEFAULTS.color },
          grid: { color: CHART_DEFAULTS.grid },
          ticks: { color: CHART_DEFAULTS.color, maxTicksLimit: 6 }
        },
        y: {
          min: 0, max: 1,
          title: { display: true, text: "True Positive Rate", color: CHART_DEFAULTS.color },
          grid: { color: CHART_DEFAULTS.grid },
          ticks: { color: CHART_DEFAULTS.color, maxTicksLimit: 6 }
        }
      },
      plugins: {
        legend: { labels: { color: CHART_DEFAULTS.color, boxWidth: 14, font: { size: 11 } } }
      }
    }
  });
}

// Render all-models ROC comparison
function renderAllROC() {
  const ctx = document.getElementById("rocAllChart").getContext("2d");
  const datasets = Object.entries(evalData).map(([key, d]) => ({
    label: `${key} (${d.auc})`,
    data: d.fpr.map((x, i) => ({ x, y: d.tpr[i] })),
    borderColor: MODEL_COLORS[key] || "#aaa",
    borderWidth: 2,
    pointRadius: 0,
    tension: 0.3,
    fill: false
  }));

  // Baseline
  datasets.push({
    label: "Random Baseline",
    data: [{ x: 0, y: 0 }, { x: 1, y: 1 }],
    borderColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderDash: [5, 5],
    pointRadius: 0,
    fill: false
  });

  if (rocAllChart) rocAllChart.destroy();
  rocAllChart = new Chart(ctx, {
    type: "line",
    data: { datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: "linear", min: 0, max: 1,
          title: { display: true, text: "False Positive Rate", color: CHART_DEFAULTS.color },
          grid: { color: CHART_DEFAULTS.grid },
          ticks: { color: CHART_DEFAULTS.color, maxTicksLimit: 6 }
        },
        y: {
          min: 0, max: 1,
          title: { display: true, text: "True Positive Rate", color: CHART_DEFAULTS.color },
          grid: { color: CHART_DEFAULTS.grid },
          ticks: { color: CHART_DEFAULTS.color, maxTicksLimit: 6 }
        }
      },
      plugins: {
        legend: { labels: { color: CHART_DEFAULTS.color, boxWidth: 12, font: { size: 11 } } }
      }
    }
  });
}

// Tab click handler
document.querySelectorAll("#eval-model-tabs .gtab").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("#eval-model-tabs .gtab").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    activeEvalModel = btn.dataset.emodel;
    renderEvalForModel(activeEvalModel);
  });
});

// Fetch evaluation data on load
fetch("/evaluation")
  .then(r => r.json())
  .then(data => {
    if (!data || !Object.keys(data).length) return;
    evalData = data;
    renderEvalForModel(activeEvalModel);
    renderAllROC();
  })
  .catch(() => console.warn("Evaluation data not yet available — run model files first."));
