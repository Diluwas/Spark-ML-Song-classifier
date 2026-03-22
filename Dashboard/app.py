"""
Song Genre Classifier Dashboard
Flask application that serves the frontend and proxies requests
to the Spring Boot backend for song genre prediction.
"""

import os
import requests
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# Spring Boot backend URL - update this to match your Spring Boot app
SPRING_BOOT_URL = os.environ.get("SPRING_BOOT_URL", "http://localhost:8080")
PREDICT_ENDPOINT = f"{SPRING_BOOT_URL}/api/predict"

# Genre categories used by the classifier
GENRES = ["Pop", "Country", "Blues", "Jazz", "Reggae", "Rock", "Hip Hop", "Metal"]


@app.route("/")
def index():
    """Serve the main dashboard page."""
    return render_template("index.html")


@app.route("/api/classify", methods=["POST"])
def classify_lyrics():
    """
    Receive lyrics from the frontend, forward them to the Spring Boot
    classifier API, and return the multiclass prediction results.
    """
    data = request.get_json()

    if not data or "lyrics" not in data:
        return jsonify({"error": "No lyrics provided"}), 400

    lyrics = data["lyrics"].strip()
    if not lyrics:
        return jsonify({"error": "Lyrics cannot be empty"}), 400

    try:
        # Forward the request to Spring Boot backend
        response = requests.post(
            PREDICT_ENDPOINT,
            json={"lyrics": lyrics},
            headers={"Content-Type": "application/json"},
            timeout=30,
        )
        response.raise_for_status()
        prediction = response.json()

        # The Spring Boot API is expected to return genre probabilities.
        # Normalize the response to a consistent format for the frontend.
        # Expected format from BE: { "pop": 0.35, "country": 0.10, ... }
        # We'll pass it through as-is if it matches, or adapt if needed.
        return jsonify({"success": True, "predictions": prediction})

    except requests.exceptions.ConnectionError:
        # If Spring Boot is not running, return mock data for development
        return jsonify({
            "success": True,
            "predictions": _get_mock_predictions(),
            "mock": True,
            "message": "Using mock data — Spring Boot backend not available"
        })
    except requests.exceptions.Timeout:
        return jsonify({"error": "Backend service timed out"}), 504
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Backend service error: {str(e)}"}), 502


def _get_mock_predictions():
    """
    Return mock prediction data for development/testing when Spring Boot
    backend is not available. Simulates multiclass classifier output.
    """
    import random
    raw = [random.random() for _ in GENRES]
    total = sum(raw)
    probabilities = [round(v / total * 100, 2) for v in raw]

    return {genre.lower().replace(" ", "_"): prob for genre, prob in zip(GENRES, probabilities)}


if __name__ == "__main__":
    print("=" * 60)
    print("  🎵 Song Genre Classifier Dashboard")
    print(f"  Spring Boot Backend: {SPRING_BOOT_URL}")
    print("  Dashboard: http://localhost:5000")
    print("=" * 60)
    app.run(debug=True, host="0.0.0.0", port=5000)
