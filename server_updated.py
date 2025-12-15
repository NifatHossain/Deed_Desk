import os
import sys
import time
import psutil
import torch
import uvicorn
import shutil
from pathlib import Path
from datetime import datetime
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from transformers import AutoModelForCausalLM, AutoProcessor
from qwen_vl_utils import process_vision_info

# Import your custom utils (Assuming you are in the dots.ocr directory)
try:
    from dots_ocr.utils.consts import MIN_PIXELS, MAX_PIXELS, IMAGE_FACTOR
    from dots_ocr.utils.image_utils import smart_resize, fetch_image, get_image_by_fitz_doc
except ImportError:
    print("Warning: dots_ocr utils not found. Using default resize logic.")
    MIN_PIXELS = 256 * 28 * 28
    MAX_PIXELS = 1280 * 28 * 28
    IMAGE_FACTOR = 28
    
    def smart_resize(height, width, factor, min_pixels, max_pixels):
        return height, width
    
    def fetch_image(image, **kwargs):
        return image
        
    def get_image_by_fitz_doc(path, **kwargs):
        return Image.open(path).convert("RGB")

# ============================================================================
# CONFIGURATION & SETUP
# ============================================================================

app = FastAPI()

# Add CORS middleware to allow requests from your React app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Vite default ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = "./weights/DotsOCR"
if not os.path.exists(MODEL_PATH):
    print("using rednote-hilab/dots.ocr as model path")
    MODEL_PATH = "rednote-hilab/dots.ocr"

# Output directory for extracted texts
OUTPUT_DIR = Path("./ocr_output")
OUTPUT_DIR.mkdir(exist_ok=True)

# ============================================================================
# MEMORY HELPERS
# ============================================================================

def get_gpu_memory():
    return torch.cuda.memory_allocated() / 1024**3

def get_cpu_memory():
    return psutil.virtual_memory().percent

def clear_memory():
    torch.cuda.empty_cache()
    torch.cuda.synchronize()
    import gc
    gc.collect()

# ============================================================================
# MODEL LOADING (Run on Startup)
# ============================================================================

print(f"Loading model from {MODEL_PATH}...")
model = AutoModelForCausalLM.from_pretrained(
    MODEL_PATH,
    attn_implementation="flash_attention_2",
    torch_dtype=torch.bfloat16,
    device_map="auto",
    trust_remote_code=True
)

processor = AutoProcessor.from_pretrained(
    MODEL_PATH,
    trust_remote_code=True,
    use_fast=True
)
print("Model loaded successfully!")

# ============================================================================
# INFERENCE LOGIC
# ============================================================================

def run_inference(image_path, prompt, max_tokens=6000, target_dpi=200, fitz_preprocess=False):
    max_retries = 2
    retry_count = 0
    current_max_tokens = max_tokens
    
    while retry_count < max_retries:
        try:
            clear_memory()
            
            # 1. Load Image
            if fitz_preprocess:
                image = get_image_by_fitz_doc(image_path, target_dpi=target_dpi)
            else:
                image = Image.open(image_path).convert("RGB")
            
            # 2. Resize
            image = fetch_image(image, min_pixels=MIN_PIXELS, max_pixels=MAX_PIXELS)
            
            # 3. Prepare Chat Format
            messages = [
                {
                    "role": "user",
                    "content": [
                        {"type": "image", "image": image},
                        {"type": "text", "text": prompt}
                    ]
                }
            ]
            
            text = processor.apply_chat_template(
                messages, tokenize=False, add_generation_prompt=True
            )
            
            image_inputs, video_inputs = process_vision_info(messages)
            
            del image, messages
            clear_memory()
            
            # 4. Process Inputs
            inputs = processor(
                text=[text],
                images=image_inputs,
                videos=video_inputs,
                padding=True,
                return_tensors="pt",
            )
            
            del image_inputs, video_inputs
            clear_memory()
            
            inputs = inputs.to("cuda")
            
            # 5. Generate
            with torch.no_grad():
                with torch.amp.autocast('cuda', dtype=torch.bfloat16):
                    generated_ids = model.generate(
                        **inputs,
                        max_new_tokens=current_max_tokens,
                        do_sample=False,
                        pad_token_id=151643,
                        eos_token_id=151643,
                        num_beams=1
                    )
            
            # 6. Decode
            generated_ids_trimmed = [
                out_ids[len(in_ids):] for in_ids, out_ids in zip(inputs.input_ids, generated_ids)
            ]
            output_text = processor.batch_decode(
                generated_ids_trimmed,
                skip_special_tokens=True,
                clean_up_tokenization_spaces=False
            )
            
            del inputs, generated_ids
            clear_memory()
            
            return output_text[0].strip()
            
        except torch.cuda.OutOfMemoryError:
            retry_count += 1
            print(f"⚠️ OOM Error (Retry {retry_count}/{max_retries})")
            clear_memory()
            if retry_count < max_retries:
                current_max_tokens = max(2000, current_max_tokens // 2)
                time.sleep(2)
            else:
                raise
        except Exception as e:
            print(f"Error during inference: {e}")
            raise

# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.get("/")
def health_check():
    return {"status": "Online", "message": "DOTS.OCR Server is running!"}

from typing import List

@app.post("/extract")
async def extract_endpoint(
    files: List[UploadFile] = File(...),
    prompt: str = Form("Extract the text content from this image."),
    fitz_preprocess: bool = Form(False),
    save_to_disk: bool = Form(True)  # New parameter to save txt files
):
    # Create a timestamp-based folder for this batch
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    batch_folder = OUTPUT_DIR / timestamp
    batch_folder.mkdir(exist_ok=True)
    
    results = []
    
    for idx, file in enumerate(files):
        temp_filename = f"temp_{file.filename}"
        
        try:
            # 1. Save temp file
            with open(temp_filename, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            # 2. Run Inference
            print(f"Processing {file.filename}...")
            text_content = run_inference(
                temp_filename, 
                prompt=prompt, 
                fitz_preprocess=fitz_preprocess
            )
            
            # 3. Save to disk if requested
            txt_filename = None
            if save_to_disk:
                # Create txt filename (remove extension and add .txt)
                base_name = Path(file.filename).stem
                txt_filename = f"{idx+1:03d}_{base_name}.txt"
                txt_path = batch_folder / txt_filename
                
                with open(txt_path, "w", encoding="utf-8") as f:
                    f.write(text_content)
                
                print(f"  Saved to: {txt_path}")
            
            # 4. Add to results list
            results.append({
                "filename": file.filename,
                "text": text_content,
                "saved_as": str(txt_path) if save_to_disk else None
            })
            
        except Exception as e:
            results.append({
                "filename": file.filename,
                "error": str(e),
                "saved_as": None
            })
            
        finally:
            # Cleanup temp file
            if os.path.exists(temp_filename):
                os.remove(temp_filename)

    return {
        "results": results,
        "batch_folder": str(batch_folder) if save_to_disk else None,
        "total_processed": len(files)
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
