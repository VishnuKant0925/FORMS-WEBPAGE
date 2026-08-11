# AI4Bharat IndicXlit — Local Transliteration Server

This directory contains a local Python server that hosts the AI4Bharat IndicXlit transliteration engine. It provides a drop-in replacement for external APIs (like Google Transliteration or Bhashini), allowing your application to perform **100% offline** transliteration for **21 Indian languages**.

---

## 🚀 Why Use This? (Transitioning from External APIs)
If you were previously using an external API for transliteration, here is why this local server is beneficial:
1. **Offline & Secure:** No data leaves your machine or network. Perfect for secure internal applications.
2. **No Rate Limits:** You control the server, so you can make as many requests as you want without API limits, throttling, or billing.
3. **High Quality:** Uses state-of-the-art AI4Bharat neural network models.
4. **21 Languages:** Supports all 21 Indic languages out of the box.

---

## 🛠️ Step 1: Setup the Transliteration Server

The server requires Python (3.8+ recommended) to run.

### Method A: Standard Setup (Linux / Mac / WSL)
1. **Navigate to the directory:**
   ```bash
   cd transliteration-server
   ```
2. **Create a virtual environment:**
   ```bash
   python3 -m venv venv
   ```
3. **Activate the virtual environment:**
   ```bash
   source venv/bin/activate
   ```
4. **Install the required packages:**
   ```bash
   pip install ai4bharat-transliteration flask-cors requests
   ```

### Method B: Windows Setup
If you are on Windows and face issues with the `fairseq` dependency during Method A, use this robust method:
1. **Navigate to the directory:**
   ```cmd
   cd transliteration-server
   ```
2. **Create and activate a virtual environment:**
   ```cmd
   python -m venv venv
   venv\Scripts\activate
   ```
3. **Install dependencies:**
   ```cmd
   pip install --force pip==24.0
   pip install numpy editdistance
   cd fairseq && pip install --editable ./ && cd ..
   pip install ai4bharat-transliteration flask-cors requests
   ```

> **Note:** The `fairseq/` directory is included as a git submodule in this repository. If it's empty after cloning, run:
> ```bash
> git submodule update --init --recursive
> ```

---

## 📥 Step 2: Download Word Dictionaries (First Time Only)

The transliteration engine requires word probability dictionaries for better accuracy. Download them using:

```bash
python download_dicts.py
```

This script:
- **Automatically detects** where `ai4bharat-transliteration` is installed (no hardcoded paths)
- **Supports resume** — if the download is interrupted, re-run to continue from where it stopped
- **Validates** the downloaded file and extracts it to the correct location
- Works on **any OS** (Windows, macOS, Linux) and with any venv or system Python

---

## 🏃 Step 3: Run the Server

Once installed, start the server by running:

```bash
python server.py
```

> **⚠️ Important Note for the First Run:**
> The first time you run this script, it will download the AI model weights (approx. 2-3 GB). **You must have an active internet connection for this first run.** Once the download is complete, the server will start and all future runs will be completely offline.

When successful, you will see:
```text
✅ Server ready!
   → http://localhost:8000
```

### Environment Variables (Optional)

| Variable | Default | Description |
|----------|---------|-------------|
| `XLIT_PORT` | `8000` | Port to run the server on |
| `XLIT_HOST` | `0.0.0.0` | Host to bind to |

Example:
```bash
# Run on a custom port
XLIT_PORT=9000 python server.py
```

### Test the Server
You can test if the server is running correctly by opening your browser or using `curl`:
```bash
# Test Hindi Transliteration
curl http://localhost:8000/tl/hi/namaste

# Expected Output:
# { "success": true, "result": ["नमस्ते", ...], "input": "namaste" }
```

---

## 🔗 Step 4: Connect with the Backend

By default, the Python server runs on `http://localhost:8000`.

Your Node.js Backend is already configured to prioritize this local server. To connect them, ensure your backend's environment variables point to this server.

1. Open the `.env` file in your `backend` directory.
2. Add or update the `LOCAL_XLIT_URL` variable:
   ```env
   LOCAL_XLIT_URL=http://localhost:8000
   ```
*(Note: If `LOCAL_XLIT_URL` is not provided, the backend defaults to `http://localhost:8000` anyway).*

### Architecture Overview
The frontend application **never** talks to this Python server directly. It follows this flow:
```text
React Frontend  →  Node.js Backend (Port 5000)  →  Python Local Server (Port 8000)
```
The Node.js backend acts as a proxy. It will attempt to use this local server first. If the local server is offline, it will automatically fallback to external APIs as a backup mechanism (if configured).

---

## 🌐 Supported Languages (21)

| Language | Code | Script |
|----------|------|--------|
| Assamese | `as` | Bengali |
| Bengali | `bn` | Bengali |
| Bodo | `brx` | Devanagari |
| Gujarati | `gu` | Gujarati |
| Hindi | `hi` | Devanagari |
| Kannada | `kn` | Kannada |
| Kashmiri | `ks` | Devanagari |
| Konkani | `gom` | Devanagari |
| Maithili | `mai` | Devanagari |
| Malayalam | `ml` | Malayalam |
| Manipuri | `mni` | Bengali |
| Marathi | `mr` | Devanagari |
| Nepali | `ne` | Devanagari |
| Odia | `or` | Odia |
| Punjabi | `pa` | Gurmukhi |
| Sanskrit | `sa` | Devanagari |
| Sindhi | `sd` | Arabic |
| Sinhala | `si` | Sinhala |
| Tamil | `ta` | Tamil |
| Telugu | `te` | Telugu |
| Urdu | `ur` | Arabic |

---

## 📝 Available API Routes (For Reference)

If you are curious about the API this server exposes to the backend:

- **`GET /languages`**
  Returns a list of supported languages and their codes (e.g., `hi` for Hindi, `te` for Telugu).

- **`GET /tl/<lang_code>/<word>`**
  Returns transliteration suggestions for a given word.
  Example: `http://localhost:8000/tl/ta/vanakkam`

---

## 📁 File Structure

```
transliteration-server/
├── server.py              # Flask transliteration API server
├── download_dicts.py      # Word dictionary downloader (auto-detects install path)
├── fairseq/               # Facebook AI Research Seq2Seq toolkit (git submodule)
├── venv/                  # Python virtual environment (not tracked by git)
└── README.md              # This file
```

