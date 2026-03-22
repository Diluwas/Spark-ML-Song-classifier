# SongScope — Song Genre Classifier Dashboard

A Flask-powered dashboard that provides a frontend for a Spring Boot ML application which classifies song lyrics into music genres using a trained multiclass classifier.

## 🎵 Supported Genres

| Genre   | Genre   |
|---------|---------|
| Pop     | Rock    |
| Country | Hip Hop |
| Blues   | Metal   |
| Jazz    | Reggae  |

## 🏗️ Architecture

```
┌──────────────┐       ┌──────────────┐       ┌──────────────────┐
│   Browser    │──────▶│  Flask App   │──────▶│  Spring Boot BE  │
│  (Dashboard) │◀──────│  (port 5000) │◀──────│   (port 8080)    │
└──────────────┘       └──────────────┘       └──────────────────┘
     HTML/JS              Proxy API            ML Classifier API
    Chart.js            /api/classify           /api/predict
```

## 📦 Setup

### 1. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure Spring Boot Backend URL (Optional)

By default, the app expects your Spring Boot backend at `http://localhost:8080`. To change this:

```bash
set SPRING_BOOT_URL=http://your-backend-host:port   # Windows
export SPRING_BOOT_URL=http://your-backend-host:port # macOS/Linux
```

### 3. Run the Dashboard

```bash
python app.py
```

Open **http://localhost:5000** in your browser.

> **Note:** If the Spring Boot backend is not running, the dashboard will return **mock prediction data** so you can still test the UI.

## 🔌 Spring Boot API Contract

The Flask app forwards lyrics to your Spring Boot backend. Expected API:

**Request:**
```http
POST /api/predict
Content-Type: application/json

{
    "lyrics": "I walked down the old country road..."
}
```

**Response:**
```json
{
    "pop": 5.23,
    "country": 42.17,
    "blues": 18.90,
    "jazz": 3.45,
    "reggae": 2.10,
    "rock": 12.55,
    "hip_hop": 8.30,
    "metal": 7.30
}
```

Values represent the percentage similarity/probability for each genre (should sum to ~100%).

## 📊 Dashboard Features

- **Lyrics Input** — Paste or type song lyrics in the sidebar
- **Radar Chart** — Visualize genre similarity across all 8 categories
- **Horizontal Bar Chart** — Ranked genre probabilities
- **Doughnut Chart** — Genre distribution at a glance
- **Detailed Scores Table** — Precise scores with confidence bars
- **Prediction History** — Track past classifications (click to reload)
- **Mock Data Mode** — Works without backend for UI testing
- **Responsive Design** — Works on desktop and tablets

## 🛠️ Tech Stack

| Layer    | Technology               |
|----------|--------------------------|
| Frontend | HTML5, CSS3, JavaScript  |
| Charts   | Chart.js 4.x            |
| Backend  | Python Flask             |
| ML API   | Spring Boot (your app)   |
