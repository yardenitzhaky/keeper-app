import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report
import joblib

# Category mapping for Kaggle dataset
CATEGORY_MAP = {
    0: 'Politics',
    1: 'Sport',
    2: 'Technology',
    3: 'Entertainment',
    4: 'Business'
}

def train_classifier():
    # Load the dataset
    print("Loading dataset...")
    df = pd.read_csv('text_classification_dataset.csv')
    
    # Convert numeric labels to category names
    df['category'] = df['Label'].map(CATEGORY_MAP)
    
    # Split the data
    X_train, X_test, y_train, y_test = train_test_split(
        df['Text'],  # Changed from 'text' to 'Text'
        df['category'],
        test_size=0.2,
        random_state=42
    )
    
    print(f"Training data size: {len(X_train)} samples")
    print(f"Testing data size: {len(X_test)} samples")
    
    # Create and train the pipeline
    print("\nTraining the model...")
    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(
            max_features=5000,
            stop_words='english',
            ngram_range=(1, 2)
        )),
        ('classifier', MultinomialNB())
    ])
    
    pipeline.fit(X_train, y_train)
    
    # Evaluate the model
    print("\nEvaluating the model...")
    y_pred = pipeline.predict(X_test)
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    
    # Save the model
    print("\nSaving the model...")
    joblib.dump(pipeline, 'note_classifier.joblib')
    
    # Test some predictions
    print("\nTesting some example predictions:")
    test_texts = [
        "The president announced new economic policies today",
        "Manchester United won their match against Liverpool",
        "Apple unveiled their latest smartphone yesterday",
        "New movie breaks box office records",
        "Stock market reaches all-time high"
    ]
    
    predictions = pipeline.predict(test_texts)
    for text, pred in zip(test_texts, predictions):
        print(f"\nText: {text}")
        print(f"Predicted category: {pred}")

if __name__ == "__main__":
    train_classifier()