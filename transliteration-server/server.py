"""
AI4Bharat IndicXlit — Local Transliteration Server
===================================================
Ye script AI4Bharat ke pre-trained Neural Network models ko locally host karti hai
aur Flask REST API expose karti hai.

Setup:
  pip install ai4bharat-transliteration flask-cors

First Run:
  Models (~2-3 GB) automatically download honge — internet chahiye pehli baar.
  Uske baad offline kaam karega.

Usage:
  python server.py
  → Server starts on http://localhost:8000

  Environment variables (optional):
    XLIT_PORT  — port to run on (default: 8000)
    XLIT_HOST  — host to bind to (default: 0.0.0.0)

  API: GET http://localhost:8000/tl/hi/namaste
  Response: { "success": true, "result": ["नमस्ते", ...], "input": "namaste", ... }
"""

import os
import torch
import argparse
if hasattr(torch.serialization, 'add_safe_globals'):
    torch.serialization.add_safe_globals([argparse.Namespace])

from ai4bharat.transliteration import xlit_server
from flask_cors import CORS
import sys

def start_server():
    host = os.environ.get('XLIT_HOST', '0.0.0.0')
    port = int(os.environ.get('XLIT_PORT', '8000'))

    print("=" * 60)
    print("  AI4Bharat IndicXlit — Local Server")
    print("=" * 60)
    print()
    print("Initializing... (Pehli baar models download hone mein time lagega)")
    print()

    try:
        # xlit_server.get_app() internally:
        #   1. Downloads model weights (first run only)
        #   2. Loads XlitEngine with all supported languages
        #   3. Creates Flask app with /tl/<lang>/<text> and /languages routes
        app, engine = xlit_server.get_app()
    except Exception as e:
        print(f"[ERROR] Engine initialization failed: {e}")
        print()
        print("Troubleshooting:")
        print("  1. Ensure 'ai4bharat-transliteration' is installed: pip install ai4bharat-transliteration")
        print("  2. Ensure 'fairseq' is properly installed (may need C++ Build Tools on Windows)")
        print("  3. Check internet connection for first-time model download")
        sys.exit(1)

    # Enable CORS so the Node.js backend (port 5000) can call this server
    CORS(app)

    print()
    print("✅ Server ready!")
    print(f"   → http://localhost:{port}")
    print(f"   → Test: http://localhost:{port}/tl/hi/namaste")
    print(f"   → Languages: http://localhost:{port}/languages")
    print()

    # Run on configured host/port — Node.js backend will proxy requests here
    app.run(host=host, port=port, debug=False)

if __name__ == '__main__':
    start_server()

