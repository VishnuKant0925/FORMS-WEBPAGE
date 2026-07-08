# AI4Bharat IndicXlit — Local Transliteration Server

## What is this?
Ye ek local Python server hai jo AI4Bharat ke IndicXlit transliteration engine ko host karta hai.
Iska use NRSC SLMS project mein offline transliteration ke liye hota hai — bina kisi external API ke.

## Prerequisites
- Python 3.8+
- pip

## Setup (One-time)

### Option A: Direct Install (Linux / WSL2 recommended)
```bash
cd transliteration-server
python -m venv venv
source venv/bin/activate        # Linux/Mac
# venv\Scripts\activate         # Windows

pip install ai4bharat-transliteration flask-cors
```

### Option B: Windows (if Option A fails due to fairseq)
```bash
cd transliteration-server
python -m venv venv
venv\Scripts\activate

pip install --force pip==24.0
pip install numpy editdistance
git clone https://github.com/pytorch/fairseq
cd fairseq && pip install --editable ./ && cd ..
pip install ai4bharat-transliteration flask-cors
```

> **Note**: First run will download model weights (~2-3 GB). Internet required only once.
> After that, everything runs offline.

## Run
```bash
python server.py
```

Server starts on `http://localhost:8000`

## Test
```
GET http://localhost:8000/tl/hi/namaste
→ { "success": true, "result": ["नमस्ते", ...], "input": "namaste" }

GET http://localhost:8000/languages
→ List of supported languages
```

## Architecture
```
Frontend (React) → Node.js Backend (port 5000) → This Python Server (port 8000)
```
Frontend NEVER calls this server directly. The Node.js backend acts as a proxy.
