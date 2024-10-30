from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import os
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Load the model once when the app starts
try:
    model = joblib.load('note_classifier.joblib')
    logger.info("Model loaded successfully")
except Exception as e:
    logger.error(f"Error loading model: {str(e)}")
    model = None

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint to keep the service alive"""
    status = 'healthy' if model is not None else 'degraded'
    logger.info(f"Health check - Status: {status}")
    return jsonify({
        'status': status,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/classify', methods=['POST'])
def classify_text():
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            logger.warning("No text provided in request")
            return jsonify({'error': 'No text provided'}), 400
            
        text = data['text']
        
        if model is None:
            logger.error("Model not loaded")
            return jsonify({
                'error': 'Model not available',
                'category': 'Uncategorized',
                'success': False
            }), 500
        
        # Get prediction from the model
        category = model.predict([text])[0]
        logger.info(f"Successfully classified text into category: {category}")
        
        return jsonify({
            'category': category,
            'success': True
        })
        
    except Exception as e:
        logger.error(f"Classification error: {str(e)}")
        return jsonify({
            'error': str(e),
            'category': 'Uncategorized',
            'success': False
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    logger.info(f"Starting Flask app on port {port}")
    app.run(host='0.0.0.0', port=port)