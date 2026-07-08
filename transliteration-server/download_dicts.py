import os
import requests
import zipfile
import time
import sys

URL = "https://github.com/AI4Bharat/IndicXlit/releases/download/v1.0/word_prob_dicts.zip"
DEST_DIR = r"C:\Users\vishn\OneDrive\Desktop\ISRO\Regional-Remote\nrsc-slms\transliteration-server\venv\Lib\site-packages\ai4bharat\transliteration\transformer\models\en2indic\v1.0"
ZIP_PATH = os.path.join(DEST_DIR, "dicts.zip")

def download_with_resume(url, filepath):
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    
    headers = {}
    mode = "wb"
    downloaded_size = 0
    
    if os.path.exists(filepath):
        downloaded_size = os.path.getsize(filepath)
        headers["Range"] = f"bytes={downloaded_size}-"
        mode = "ab"
        
    try:
        print(f"Connecting... (Current file size: {downloaded_size/(1024*1024):.1f}MB)")
        response = requests.get(url, headers=headers, stream=True, timeout=15)
        
        if response.status_code == 416:
            print("Already downloaded.")
            return True
        elif response.status_code == 206:
            print(f"Resuming download from {downloaded_size} bytes...")
        elif response.status_code == 200:
            print("Starting download from scratch...")
            mode = "wb"
            downloaded_size = 0
        else:
            print(f"Failed with status code: {response.status_code}")
            return False
            
        total_size_header = response.headers.get('content-length', 0)
        total_size = int(total_size_header) + downloaded_size if response.status_code == 206 else int(total_size_header)
        
        with open(filepath, mode) as f:
            for chunk in response.iter_content(chunk_size=1024*1024):
                if chunk:
                    f.write(chunk)
                    downloaded_size += len(chunk)
                    percent = (downloaded_size / total_size) * 100 if total_size > 0 else 0
                    print(f"\rDownloaded: {downloaded_size/(1024*1024):.1f}MB / {total_size/(1024*1024):.1f}MB ({percent:.1f}%)", end="", flush=True)
                    
        print("\nDownload complete.")
        return True
    except Exception as e:
        print(f"\nError during download: {e}")
        return False

def extract_zip(filepath, dest_dir):
    print("Extracting zip file...")
    with zipfile.ZipFile(filepath, 'r') as zip_ref:
        zip_ref.extractall(dest_dir)
    print("Extraction complete.")

if __name__ == "__main__":
    success = False
    retries = 20
    
    for attempt in range(retries):
        print(f"\nAttempt {attempt + 1}/{retries}")
        if download_with_resume(URL, ZIP_PATH):
            # Check if file is really complete by trying to open zip
            try:
                with zipfile.ZipFile(ZIP_PATH) as z:
                    # if it's a valid zip, we're good
                    success = True
                    break
            except zipfile.BadZipFile:
                print("Bad zip file, it might be incomplete. Deleting and restarting...")
                os.remove(ZIP_PATH)
        time.sleep(2)
            
    if success:
        # We can let the server.py extract it next time it runs.
        print("Success! The dicts.zip file has been fully downloaded.")
        print("You can now run 'python server.py' again.")
    else:
        print("Failed to download dictionaries after multiple attempts.")
