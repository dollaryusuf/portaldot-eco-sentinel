
# Portaldot DePIN Oracle Connector v1.0
# Pings simulated Energy APIs to determine grid carbon intensity.

import random
import time
import json
import sys

def get_energy_intensity(region):
    """
    Simulated real-world Energy API call.
    Returns Carbon Intensity in gCO2/kWh.
    """
    # Mapping of regions to base intensity values
    # europe-west2 (Green), us-east-1 (Mixed), asia-east1 (Heavy Fossil)
    grid_profiles = {
        'europe-west2': random.uniform(30, 90),
        'us-east-1': random.uniform(180, 320),
        'asia-east1': random.uniform(450, 750),
    }
    
    # Add some noise to simulate live grid fluctuations
    noise = random.uniform(-15, 15)
    base = grid_profiles.get(region, random.uniform(100, 300))
    
    return max(10, base + noise)

def calculate_sustainability_score(intensity):
    """
    Translates carbon intensity into a 0-100 score.
    Target: Intensity < 50gCO2/kWh = 100 Score.
    Penalty: Scores drop as intensity increases.
    """
    # 50g = 100 points
    # 800g = 0 points
    # Formula: 100 - ((intensity - 50) / 7.5)
    score = 100 - ((intensity - 50) / 7.5)
    score = max(0, min(100, score))
    
    return round(score, 2)

if __name__ == "__main__":
    region = sys.argv[1] if len(sys.argv) > 1 else 'europe-west2'
    
    intensity = get_energy_intensity(region)
    score = calculate_sustainability_score(intensity)
    
    output = {
        "region": region,
        "carbon_intensity": round(intensity, 2),
        "sustainability_score": score,
        "status": "VALIDATED",
        "oracle_node": "Sentinel_DePIN_01",
        "timestamp": int(time.time())
    }
    
    print(json.dumps(output))
