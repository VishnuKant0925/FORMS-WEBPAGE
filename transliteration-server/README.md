# AI4Bharat IndicXlit — Local Transliteration Server

This repository contains a local Python server that hosts the AI4Bharat IndicXlit transliteration engine. It provides a drop-in replacement for external APIs (like Google Transliteration or Bhashini), allowing your application to perform **100% offline** transliteration for Indian languages.

---

## 🚀 Why Use This? (Transitioning from External APIs)
If you were previously using an external API for transliteration, here is why this local server is beneficial:
1. **Offline & Secure:** No data leaves your machine or network. Perfect for secure internal applications.
2. **No Rate Limits:** You control the server, so you can make as many requests as you want without API limits, throttling, or billing.
3. **High Quality:** Uses state-of-the-art AI4Bharat neural network models.

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
   python -m venv venv
   ```
3. **Activate the virtual environment:**
   ```bash
   source venv/bin/activate
   ```
4. **Install the required packages:**
   ```bash
   pip install ai4bharat-transliteration flask-cors
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
   git clone https://github.com/pytorch/fairseq
   cd fairseq && pip install --editable ./ && cd ..
   pip install ai4bharat-transliteration flask-cors
   ```

---

## 🏃 Step 2: Run the Server

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

### Test the Server
You can test if the server is running correctly by opening your browser or using `curl`:
```bash
# Test Hindi Transliteration
curl http://localhost:8000/tl/hi/namaste

# Expected Output:
# { "success": true, "result": ["नमस्ते", ...], "input": "namaste" }
```

---

## 🔗 Step 3: Connect with the Backend

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

## 📝 Available API Routes (For Reference)

If you are curious about the API this server exposes to the backend:

- **`GET /languages`**
  Returns a list of supported languages and their codes (e.g., `hi` for Hindi, `te` for Telugu).

- **`GET /tl/<lang_code>/<word>`**
  Returns transliteration suggestions for a given word.
  Example: `http://localhost:8000/tl/ta/vanakkam`
