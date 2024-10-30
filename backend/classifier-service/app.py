from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import os

app = Flask(__name__)
CORS(app)

# Load the model once when the app starts
model = joblib.load('note_classifier.joblib')

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'})

@app.route('/classify', methods=['POST'])
def classify_text():
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({'error': 'No text provided'}), 400
            
        text = data['text']
        
        # Get prediction directly from the model
        category = model.predict([text])[0]
        
        return jsonify({
            'category': category,
            'success': True
        })
        
    except Exception as e:
        print(f"Classification error: {str(e)}")
        return jsonify({
            'error': str(e),
            'category': 'Uncategorized',
            'success': False
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)