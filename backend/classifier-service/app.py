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
        # Validate content type
        if not request.is_json:
            return jsonify({
                'error': 'Content-Type must be application/json',
                'category': 'Uncategorized',
                'success': False
            }), 400
            
        data = request.get_json()
        
        # Validate request data
        if not data or 'text' not in data:
            return jsonify({
                'error': 'No text provided',
                'category': 'Uncategorized',
                'success': False
            }), 400
            
        text = data['text']
        
        # Validate text is non-empty
        if not text or not isinstance(text, str) or len(text.strip()) == 0:
            return jsonify({
                'error': 'Text cannot be empty',
                'category': 'Uncategorized',
                'success': False
            }), 400
        
        # Get prediction from the model with error handling
        try:
            category = model.predict([text])[0]
            
            # Validate category is a string
            if not isinstance(category, str):
                category = str(category)
                
            return jsonify({
                'category': category,
                'success': True
            })
        except Exception as model_error:
            print(f"Model prediction error: {str(model_error)}")
            return jsonify({
                'error': f"Prediction error: {str(model_error)}",
                'category': 'Uncategorized',
                'success': False
            }), 500
            
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