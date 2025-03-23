from flask import Flask, request, jsonify, Response
import google.generativeai as genai
from dotenv import load_dotenv
import os
from flask_cors import CORS
import json

load_dotenv()

app = Flask(__name__)
CORS(app, supports_credentials=True, origins=["*"])

genai.configure(api_key=os.getenv('GOOGLE_API_KEY') )
model = genai.GenerativeModel('gemini-2.0-flash', system_instruction="You are a medical diagnostic assistant. Provide accurate and concise medical information.")

@app.route('/process', methods=['POST'])
def process_request():
    try:
        data = request.get_json()
        if not data or 'prompt' not in data:
            return jsonify({'error': 'No prompt provided'}), 400

        def generate():
            response = model.generate_content(data['prompt'], stream=True)
            for chunk in response:
                if chunk.text:
                    yield f"data: {json.dumps({'chunk': chunk.text})}\n\n"

        return Response(generate(), mimetype='text/event-stream')

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
