/**
 * SongScope — Song Genre Classifier Dashboard
 * Frontend logic: API calls, Chart.js visualizations, history management.
 */

// ===== Genre Config =====
const GENRE_CONFIG = {
    pop:      { label: "Pop",     color: "#ff6b9d", bg: "rgba(255,107,157,0.25)" },
    country:  { label: "Country", color: "#f0932b", bg: "rgba(240,147,43,0.25)" },
    blues:    { label: "Blues",   color: "#4a90d9", bg: "rgba(74,144,217,0.25)" },
    jazz:     { label: "Jazz",    color: "#a29bfe", bg: "rgba(162,155,254,0.25)" },
    reggae:   { label: "Reggae",  color: "#2ed573", bg: "rgba(46,213,115,0.25)" },
    rock:     { label: "Rock",    color: "#ff4757", bg: "rgba(255,71,87,0.25)" },
    hip_hop:  { label: "Hip Hop", color: "#ffa502", bg: "rgba(255,165,2,0.25)" },
    metal:    { label: "Metal",   color: "#747d8c", bg: "rgba(116,125,140,0.25)" },
};

// Ordered genre keys
const GENRE_KEYS = Object.keys(GENRE_CONFIG);

// ===== DOM Elements =====
const lyricsInput      = document.getElementById("lyrics-input");
const classifyBtn      = document.getElementById("classify-btn");
const clearBtn         = document.getElementById("clear-btn");
const welcomeSection   = document.getElementById("welcome-section");
const resultsSection   = document.getElementById("results-section");
const topGenreEl       = document.getElementById("top-genre");
const topConfidenceEl  = document.getElementById("top-confidence");
const mockNotice       = document.getElementById("mock-notice");
const scorePills       = document.getElementById("score-pills");
const historyList      = document.getElementById("history-list");
const statusBadge      = document.getElementById("status-badge");
const statusText       = statusBadge.querySelector(".status-text");
const toastContainer   = document.getElementById("toast-container");
const btnText          = classifyBtn.querySelector(".btn-text");
const btnIcon          = classifyBtn.querySelector(".btn-icon");
const btnLoader        = classifyBtn.querySelector(".btn-loader");

// ===== Charts =====
let radarChart    = null;
let barChart      = null;

// ===== History =====
let predictionHistory = [];
const MAX_HISTORY = 10;

// ===== Initialize =====
document.addEventListener("DOMContentLoaded", () => {
    classifyBtn.addEventListener("click", handleClassify);
    clearBtn.addEventListener("click", handleClear);

    // Allow Ctrl+Enter to submit
    lyricsInput.addEventListener("keydown", (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
            handleClassify();
        }
    });
});

// ===== Classify Handler =====
async function handleClassify() {
    const lyrics = lyricsInput.value.trim();
    if (!lyrics) {
        showToast("Please enter some lyrics first.", "error");
        lyricsInput.focus();
        return;
    }

    setLoading(true);

    try {
        const response = await fetch("/api/classify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lyrics }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Something went wrong");
        }

        if (data.success) {
            displayResults(data.predictions, lyrics, !!data.mock);
            if (data.mock) {
                showToast(data.message || "Using mock data", "warning");
            } else {
                showToast("Genre classification complete!", "success");
            }
        } else {
            throw new Error(data.error || "Classification failed");
        }
    } catch (err) {
        showToast(err.message, "error");
        setStatus("error", "Error");
    } finally {
        setLoading(false);
    }
}

// ===== Display Results =====
function displayResults(predictions, lyrics, isMock) {
    // Normalize predictions: ensure all genres present, map scores
    const scores = {};
    for (const key of GENRE_KEYS) {
        // Try different key formats from the backend
        scores[key] =
            predictions[key] ??
            predictions[key.replace("_", " ")] ??
            predictions[GENRE_CONFIG[key].label.toLowerCase()] ??
            predictions[GENRE_CONFIG[key].label] ??
            0;
    }

    // Sort by score descending
    const sorted = GENRE_KEYS
        .map((k) => ({ key: k, score: scores[k] }))
        .sort((a, b) => b.score - a.score);

    const topGenre = sorted[0];

    // Show results section
    welcomeSection.hidden = true;
    resultsSection.hidden = false;
    mockNotice.hidden = !isMock;

    // Update top prediction
    topGenreEl.textContent = GENRE_CONFIG[topGenre.key].label;
    topGenreEl.style.color = GENRE_CONFIG[topGenre.key].color;
    topConfidenceEl.textContent = `${topGenre.score.toFixed(1)}%`;

    // Update score pills
    updateScorePills(sorted);

    // Update charts
    updateRadarChart(scores);
    updateBarChart(sorted);

    // Add to history
    addToHistory(topGenre, lyrics);

    setStatus("ready", "Ready");
}

// ===== Radar Chart =====
function updateRadarChart(scores) {
    const labels = GENRE_KEYS.map((k) => GENRE_CONFIG[k].label);
    const data = GENRE_KEYS.map((k) => scores[k]);
    const colors = GENRE_KEYS.map((k) => GENRE_CONFIG[k].color);

    const config = {
        type: "radar",
        data: {
            labels,
            datasets: [
                {
                    label: "Genre Score (%)",
                    data,
                    backgroundColor: "rgba(108, 92, 231, 0.15)",
                    borderColor: "#6c5ce7",
                    borderWidth: 2,
                    pointBackgroundColor: colors,
                    pointBorderColor: colors,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        display: false,
                    },
                    grid: {
                        color: "rgba(255,255,255,0.06)",
                    },
                    angleLines: {
                        color: "rgba(255,255,255,0.06)",
                    },
                    pointLabels: {
                        color: "#9a9cb8",
                        font: { size: 12, family: "Inter" },
                    },
                },
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: "#1c1e2b",
                    titleColor: "#e8eaf0",
                    bodyColor: "#9a9cb8",
                    borderColor: "#2e3148",
                    borderWidth: 1,
                    callbacks: {
                        label: (ctx) => `${ctx.label}: ${ctx.raw.toFixed(2)}%`,
                    },
                },
            },
        },
    };

    if (radarChart) {
        radarChart.data.datasets[0].data = data;
        radarChart.update("active");
    } else {
        radarChart = new Chart(document.getElementById("radar-chart"), config);
    }
}

// ===== Bar Chart =====
function updateBarChart(sorted) {
    const labels = sorted.map((s) => GENRE_CONFIG[s.key].label);
    const data = sorted.map((s) => s.score);
    const bgColors = sorted.map((s) => GENRE_CONFIG[s.key].bg);
    const borderColors = sorted.map((s) => GENRE_CONFIG[s.key].color);

    const config = {
        type: "bar",
        data: {
            labels,
            datasets: [
                {
                    label: "Score (%)",
                    data,
                    backgroundColor: bgColors,
                    borderColor: borderColors,
                    borderWidth: 2,
                    borderRadius: 6,
                    borderSkipped: false,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: "y",
            scales: {
                x: {
                    beginAtZero: true,
                    max: 100,
                    grid: { color: "rgba(255,255,255,0.04)" },
                    ticks: { color: "#6c6f8a", font: { size: 10 } },
                },
                y: {
                    grid: { display: false },
                    ticks: { color: "#9a9cb8", font: { size: 11, family: "Inter" } },
                },
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: "#1c1e2b",
                    titleColor: "#e8eaf0",
                    bodyColor: "#9a9cb8",
                    borderColor: "#2e3148",
                    borderWidth: 1,
                    callbacks: {
                        label: (ctx) => `${ctx.raw.toFixed(2)}%`,
                    },
                },
            },
        },
    };

    if (barChart) {
        barChart.data.labels = labels;
        barChart.data.datasets[0].data = data;
        barChart.data.datasets[0].backgroundColor = bgColors;
        barChart.data.datasets[0].borderColor = borderColors;
        barChart.update("active");
    } else {
        barChart = new Chart(document.getElementById("bar-chart"), config);
    }
}

// ===== Score Pills =====
function updateScorePills(sorted) {
    scorePills.innerHTML = "";

    sorted.forEach((item, idx) => {
        const cfg = GENRE_CONFIG[item.key];
        const pill = document.createElement("div");
        pill.className = "score-pill" + (idx === 0 ? " top-pill" : "");
        pill.innerHTML = `
            <span class="score-pill-dot" style="background:${cfg.color}"></span>
            <span class="score-pill-name">${cfg.label}</span>
            <span class="score-pill-value" style="color:${cfg.color}">${item.score.toFixed(1)}%</span>
        `;
        scorePills.appendChild(pill);
    });
}

// ===== History =====
function addToHistory(topGenre, lyrics) {
    const entry = {
        genre: GENRE_CONFIG[topGenre.key].label,
        genreColor: GENRE_CONFIG[topGenre.key].color,
        score: topGenre.score,
        lyrics: lyrics,
        time: new Date(),
    };

    predictionHistory.unshift(entry);
    if (predictionHistory.length > MAX_HISTORY) {
        predictionHistory.pop();
    }

    renderHistory();
}

function renderHistory() {
    historyList.innerHTML = "";

    if (predictionHistory.length === 0) {
        historyList.innerHTML = '<li class="history-empty">No predictions yet</li>';
        return;
    }

    predictionHistory.forEach((entry, idx) => {
        const li = document.createElement("li");
        li.className = "history-item";
        li.innerHTML = `
            <div class="history-item-genre" style="color:${entry.genreColor}">
                ${entry.genre} — ${entry.score.toFixed(1)}%
            </div>
            <div class="history-item-lyrics">${escapeHtml(entry.lyrics)}</div>
            <div class="history-item-time">${formatTime(entry.time)}</div>
        `;
        li.addEventListener("click", () => {
            lyricsInput.value = entry.lyrics;
            lyricsInput.focus();
            showToast("Lyrics loaded — click Classify to re-analyze.", "success");
        });
        historyList.appendChild(li);
    });
}

// ===== Clear =====
function handleClear() {
    lyricsInput.value = "";
    welcomeSection.hidden = false;
    resultsSection.hidden = true;

    if (radarChart) { radarChart.destroy(); radarChart = null; }
    if (barChart) { barChart.destroy(); barChart = null; }

    scorePills.innerHTML = "";
    setStatus("ready", "Ready");
    lyricsInput.focus();
}

// ===== Loading State =====
function setLoading(isLoading) {
    classifyBtn.disabled = isLoading;
    btnText.hidden = isLoading;
    btnIcon.hidden = isLoading;
    btnLoader.hidden = !isLoading;

    if (isLoading) {
        setStatus("loading", "Analyzing...");
    }
}

// ===== Status Badge =====
function setStatus(state, text) {
    statusBadge.className = "status-badge";
    if (state === "loading") statusBadge.classList.add("loading");
    if (state === "error") statusBadge.classList.add("error");
    statusText.textContent = text;
}

// ===== Toast Notifications =====
function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(10px)";
        toast.style.transition = "all 0.3s ease";
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// ===== Utilities =====
function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

function formatTime(date) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
