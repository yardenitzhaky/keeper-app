# ml/note_classifier.py
import joblib
import os

class NoteClassifier:
    def __init__(self):
        self.model = None
        self.model_path = 'note_classifier.joblib'
        self.categories = [
            'Politics',
            'Sport',
            'Technology',
            'Entertainment',
            'Business'
        ]
    
    def load_model(self):
        """Load the trained model"""
        if not os.path.exists(self.model_path):
            raise FileNotFoundError("Model file not found. Please train the model first.")
        self.model = joblib.load(self.model_path)
    
    def predict(self, text):
        """Predict category for a given text"""
        if self.model is None:
            self.load_model()
        
        try:
            prediction = self.model.predict([text])[0]
            return prediction
        except Exception as e:
            print(f"Prediction error: {str(e)}")
            return "Uncategorized"
    
    def get_categories(self):
        """Return available categories"""
        return self.categories

# Test the classifier
if __name__ == "__main__":
    classifier = NoteClassifier()
    try:
        classifier.load_model()
        test_texts = [
            "The president announced new economic policies today",
            "Manchester United won their match against Liverpool",
            "Apple unveiled their latest smartphone yesterday",
            "New movie breaks box office records",
            "Stock market reaches all-time high"
        ]
        
        for text in test_texts:
            category = classifier.predict(text)
            print(f"\nText: {text}")
            print(f"Category: {category}")
    except FileNotFoundError:
        print("Please train the model first using train.py")