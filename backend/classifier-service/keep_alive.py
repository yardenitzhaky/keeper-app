import requests
import time
from datetime import datetime
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class KeepAliveService:
    def __init__(self, url, interval_minutes=14):
        self.url = url
        self.interval_minutes = interval_minutes
        self.is_running = False
    
    def ping(self):
        try:
            response = requests.get(f"{self.url}/health")
            if response.status_code == 200:
                logger.info(f"Ping successful at {datetime.now()}")
                return True
            else:
                logger.error(f"Ping failed with status code: {response.status_code}")
                return False
        except Exception as e:
            logger.error(f"Ping failed with error: {str(e)}")
            return False
    
    def start(self):
        self.is_running = True
        while self.is_running:
            self.ping()
            # Sleep for interval_minutes minutes
            time.sleep(self.interval_minutes * 60)
    
    def stop(self):
        self.is_running = False

if __name__ == "__main__":
    # Replace with your Render service URL
    SERVICE_URL = "https://keeper-model.onrender.com"
    
    keep_alive = KeepAliveService(SERVICE_URL)
    try:
        logger.info("Starting keep-alive service...")
        keep_alive.start()
    except KeyboardInterrupt:
        logger.info("Stopping keep-alive service...")
        keep_alive.stop()