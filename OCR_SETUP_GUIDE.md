# DeedDesk - OCR Integration Setup Guide

## Complete Workflow

1. **User uploads images** via React UploadPage
2. **Python server (DOTS.OCR)** processes each image and extracts text
3. **Server saves** individual `.txt` files to `ocr_output/TIMESTAMP/`
4. **Server returns** JSON response with extracted text
5. **Python script** combines all `.txt` files into one document

---

## Setup Instructions

### Step 1: Install Python Dependencies

```bash
# Navigate to your project
cd c:\Projects\cse498Project

# Install required packages
pip install fastapi uvicorn pillow transformers torch psutil qwen-vl-utils python-multipart
```

### Step 2: Download DOTS.OCR Model (if not already done)

```bash
# Create weights directory
mkdir weights
cd weights

# Download model from HuggingFace
# Option 1: Using git-lfs
git lfs install
git clone https://huggingface.co/rednote-hilab/dots.ocr DotsOCR

# Option 2: The server will auto-download from "rednote-hilab/dots.ocr" if ./weights/DotsOCR doesn't exist
```

### Step 3: Start the Python Server

```bash
# Make sure you're in the project root
cd c:\Projects\cse498Project

# Start the server
python server_updated.py
```

You should see:
```
Loading model from ./weights/DotsOCR...
Model loaded successfully!
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Step 4: Start the React Frontend

Open a **new terminal**:

```bash
cd c:\Projects\cse498Project

# Start Vite dev server
npm run dev
```

The app will open at `http://localhost:5173`

### Step 5: Upload Images

1. Go to `http://localhost:5173`
2. Click "হোম" → "দলিল আপলোড করুন" (or navigate to `/upload`)
3. Select multiple deed images
4. Click "সার্ভারে পাঠান" (Send to Server)
5. Wait for processing (the server will show progress in its terminal)
6. View the extracted text in the Response panel

### Step 6: Combine Text Files

After uploading and processing images:

```bash
# Run the combiner script
python combine_deed_texts.py
```

This will:
- Find all batch folders in `ocr_output/`
- Combine all `.txt` files in each batch
- Create a `TIMESTAMP_combined.txt` file in each batch folder

---

## File Structure

```
cse498Project/
├── src/
│   └── pages/
│       └── UploadPage.jsx          # React upload interface
├── ocr_output/                      # Created by server
│   └── 20251215_143022/            # Timestamp folder for each batch
│       ├── 001_deed1.txt           # Individual extracted texts
│       ├── 002_deed2.txt
│       └── 20251215_143022_combined.txt  # Combined output
├── server_updated.py                # Python FastAPI server with OCR
├── combine_deed_texts.py            # Script to combine txt files
├── .env                             # API configuration
└── weights/
    └── DotsOCR/                     # DOTS.OCR model files
```

---

## Environment Variables (.env)

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_UPLOAD_ENDPOINT=/extract
```

---

## API Details

### Endpoint: `POST /extract`

**Request:**
- Content-Type: `multipart/form-data`
- Field name: `files` (multiple files allowed)
- Optional: `prompt` (default: "Extract the text content from this image.")
- Optional: `save_to_disk` (default: `true`)

**Response:**
```json
{
  "results": [
    {
      "filename": "deed1.jpg",
      "text": "Extracted text content...",
      "saved_as": "./ocr_output/20251215_143022/001_deed1.txt"
    }
  ],
  "batch_folder": "./ocr_output/20251215_143022",
  "total_processed": 1
}
```

---

## Troubleshooting

### CORS Error
If you see CORS errors in the browser console:
- Make sure the server is running on port 8000
- Check that `.env` has `VITE_API_BASE_URL=http://localhost:8000`
- Restart Vite after changing `.env`: `npm run dev`

### Model Not Found
```bash
# If you see "Loading model from rednote-hilab/dots.ocr"
# The server will download automatically from HuggingFace
# This may take a while (several GB)
```

### Out of Memory (OOM)
- The server has retry logic with reduced `max_tokens`
- If it still fails, reduce batch size (upload fewer images at once)
- Ensure you have sufficient GPU memory (recommended: 16GB+ VRAM)

### PowerShell Script Execution Error
```bash
# Use cmd instead
cmd /c npm run dev
```

---

## Quick Test

1. Start server: `python server_updated.py`
2. Start frontend: `npm run dev`
3. Upload 2-3 test images
4. Wait for response
5. Run: `python combine_deed_texts.py`
6. Check `ocr_output/TIMESTAMP/TIMESTAMP_combined.txt`

---

## Notes

- Each upload creates a new timestamped folder
- Individual txt files are numbered: `001_`, `002_`, etc.
- The combined file includes headers and separators
- All files are saved with UTF-8 encoding (supports Bengali text)
