import os
from pathlib import Path
from datetime import datetime

class OCRTextCompiler:
    def __init__(self, base_path):
        self.base_path = Path(base_path)
        self.compiled_count = 0
        self.error_count = 0
        
    def find_batch_folders(self):
        """Find all timestamp-based batch folders"""
        batch_folders = []
        if self.base_path.exists() and self.base_path.is_dir():
            for item in self.base_path.iterdir():
                if item.is_dir():
                    batch_folders.append(item)
        return sorted(batch_folders)
    
    def compile_txt_files(self, batch_folder):
        """Compile all .txt files from a batch folder into a single file"""
        # Get all .txt files (sorted)
        txt_files = sorted(batch_folder.glob("*.txt"))
        
        if not txt_files:
            print(f"  ⚠ No .txt files found in {batch_folder}")
            return
        
        print(f"  Found {len(txt_files)} .txt files")
        
        # Create output filename based on folder name
        folder_name = batch_folder.name
        output_filename = f"{folder_name}_combined.txt"
        output_file_path = batch_folder / output_filename
        
        try:
            with open(output_file_path, 'w', encoding='utf-8') as combined_file:
                # Write header
                combined_file.write(f"# Combined OCR Output from {folder_name}\n")
                combined_file.write(f"# Generated at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
                combined_file.write(f"# Total files: {len(txt_files)}\n")
                combined_file.write("=" * 80 + "\n\n")
                
                for idx, txt_file in enumerate(txt_files, 1):
                    try:
                        # Write file separator
                        combined_file.write(f"\n{'─' * 80}\n")
                        combined_file.write(f"File {idx}/{len(txt_files)}: {txt_file.name}\n")
                        combined_file.write(f"{'─' * 80}\n\n")
                        
                        # Read and write file content
                        with open(txt_file, 'r', encoding='utf-8') as f:
                            content = f.read()
                        combined_file.write(content)
                        combined_file.write("\n\n")
                    except Exception as e:
                        combined_file.write(f"[ERROR reading file {txt_file.name}: {e}]\n\n")
                        self.error_count += 1
            
            self.compiled_count += 1
            print(f"  ✓ Compiled into: {output_filename}")
            print(f"  📁 Location: {output_file_path}")
            
        except Exception as e:
            print(f"  ✗ Error creating compiled file: {e}")
            self.error_count += 1
    
    def process_all(self):
        """Main processing method"""
        print("=" * 80)
        print(f"OCR Text Compiler started at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"Base path: {self.base_path}")
        print("=" * 80)
        
        batch_folders = self.find_batch_folders()
        
        if not batch_folders:
            print("\nNo batch folders found!")
            print(f"Make sure the server has saved files to: {self.base_path}")
            return
        
        print(f"\nFound {len(batch_folders)} batch folders\n")
        
        for batch_folder in batch_folders:
            print(f"\n{'─' * 80}")
            print(f"Processing: {batch_folder.name}")
            print(f"{'─' * 80}")
            self.compile_txt_files(batch_folder)
        
        print("\n" + "=" * 80)
        print(f"Compilation completed at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"Total batches compiled: {self.compiled_count}")
        print(f"Total errors: {self.error_count}")
        print("=" * 80)
        
        return {
            "total_compiled": self.compiled_count,
            "total_errors": self.error_count
        }


def main():
    # Path to the ocr_output folder where the server saves files
    base_path = "./ocr_output"
    
    # You can also use an absolute path:
    # base_path = "C:/Projects/cse498Project/ocr_output"
    
    # Create compiler instance
    compiler = OCRTextCompiler(base_path)
    
    # Run the compilation
    results = compiler.process_all()


if __name__ == "__main__":
    main()
