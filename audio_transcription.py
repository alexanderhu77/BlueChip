import os

# Fix ffmpeg path
os.environ["PATH"] += os.pathsep + r"C:\ffmpeg\bin"

import whisper

# Transcribe with Whisper
def transcribe_audio(file_path):
    model = whisper.load_model("base")  # You can pick "tiny", "base", "small", "medium", "large"
    result = model.transcribe(file_path)
    return result['text']

file_path = input("Enter the path to your audio file: ")
print(transcribe_audio(file_path))  # Replace with your audio file path