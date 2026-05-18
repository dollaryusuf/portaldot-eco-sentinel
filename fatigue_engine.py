
# Portaldot Network Fatigue Engine
# Performs Linear Regression on Block Weights to predict future congestion.

import time
import random
import json
from collections import deque

class FatigueEngine:
    def __init__(self, window_size=50):
        self.window_size = window_size
        self.block_weights = deque(maxlen=window_size)
        self.current_height = 104237

    def subscribe_to_finalized_heads(self):
        """
        In a production environment, this would use:
        substrate.subscribe_block_headers(self.on_block)
        """
        print(f"Subscribing to Portaldot FinalizedHeads...")
        while True:
            # Simulate block arrival every 6s (Standard Portaldot Block Time)
            self.current_height += 1
            new_weight = random.randint(20000, 60000)
            self.on_block(self.current_height, new_weight)
            time.sleep(6)

    def on_block(self, height, weight):
        self.block_weights.append(weight)
        if len(self.block_weights) >= 10:
            prediction = self.predict_fatigue(horizon=10)
            self.export_data(prediction)

    def predict_fatigue(self, horizon=10):
        """
        Basic Linear Regression (y = mx + b) to predict future weight trends.
        """
        n = len(self.block_weights)
        if n < 2: return 0
        
        x = list(range(n))
        y = list(self.block_weights)
        
        sum_x = sum(x)
        sum_y = sum(y)
        sum_xy = sum(val_x * val_y for val_x, val_y in zip(x, y))
        sum_xx = sum(val_x**2 for val_x in x)
        
        slope = (n * sum_xy - sum_x * sum_y) / (n * sum_xx - sum_x**2)
        intercept = (sum_y - slope * sum_x) / n
        
        # Predict fatigue at horizon
        last_val = y[-1]
        predicted_val = slope * (n + horizon) + intercept
        
        # Fatigue is the percentage increase expected
        fatigue_index = ((predicted_val - last_val) / last_val) * 100
        return round(max(0, fatigue_index), 2)

    def export_data(self, fatigue_index):
        data = {
            "current_height": self.current_height,
            "fatigue_index": fatigue_index,
            "warning_level": "CRITICAL" if fatigue_index > 15 else "STABLE",
            "timestamp": time.time()
        }
        # Bridge: Write to a shared state for the API server
        with open("fatigue_state.json", "w") as f:
            json.dump(data, f)
        print(f"[ENGINE] Block {self.current_height} | Predicted Fatigue: {fatigue_index}%")

if __name__ == "__main__":
    engine = FatigueEngine()
    engine.subscribe_to_finalized_heads()
