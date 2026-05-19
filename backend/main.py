from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from substrateinterface import SubstrateInterface
from SentinelEngine import SentinelEngine
import uvicorn
import time
import json
import os

app = FastAPI(title="Portaldot Eco-Sentinel API")

# Portaldot Initialization
portaldot = SubstrateInterface(
    url="wss://mainnet.portaldot.io",
    ss58_format=42,
    type_registry_preset='default'
)

# Configure CORS
origins = [
    "https://eco-dotsentinel.netlify.app",
    "http://localhost:3000",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the core engine
engine = SentinelEngine(interface=portaldot)

class TriggerFlagRequest(BaseModel):
    target_account: str

class BatchRequest(BaseModel):
    remarks: list

class MultisigRequest(BaseModel):
    call: dict
    threshold: int

class ProposeRequest(BaseModel):
    call: dict
    proposer: str

class MintRequest(BaseModel):
    recipient: str

# API Routes
@app.get("/api/health")
async def health_check():
    return {"status": "online", "system": "Portaldot Sentinel", "timestamp": int(time.time())}

@app.get("/api/stats")
async def get_stats(identifier: str = Query("0x897ae...912")):
    try:
        report = engine.perform_deep_audit(identifier)
        return {
            "carbon_estimator": report["metrics"]["carbon_estimate"],
            "sustainability_score": report["metrics"]["sustainability_score"],
            "compliance": report["compliance"],
            "audit_id": report["audit_id"],
            "timestamp": report["extrinsic"]["timestamp"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sentinel Engine Error: {str(e)}")

@app.get("/api/history")
async def get_history():
    return [
        {"id": "BATCH_01", "totalWeight": 15000000, "carbonEstimate": "0.015", "timestamp": int(time.time()) - 3600},
        {"id": "BATCH_02", "totalWeight": 8000000, "carbonEstimate": "0.008", "timestamp": int(time.time()) - 7200}
    ]

@app.get("/api/audit/{query}")
async def audit_query(query: str):
    return engine.perform_deep_audit(query)

@app.get("/api/attestation/{id_or_address}")
async def get_attestation(id_or_address: str):
    return {
        "target": id_or_address,
        "efficiency_score": 99.4,
        "status": "VALIDATED",
        "minted_at": int(time.time()) - 86400
    }

@app.get("/api/carbon-oracle")
async def get_carbon_oracle(region: str = "europe-west2"):
    return {
        "region": region,
        "carbon_intensity": 42.4,
        "sustainability_score": 98.2,
        "status": "VALIDATED",
        "timestamp": int(time.time())
    }

@app.post("/api/batch")
async def submit_batch(request: BatchRequest):
    return {"success": True, "batch_hash": f"0xBATCH_{int(time.time())}"}

@app.post("/api/multisig")
async def trigger_multisig(request: MultisigRequest):
    return {"success": True, "multisig_id": f"0xMS_{int(time.time())}", "status": "PENDING"}

@app.get("/api/runtime/seal/{address}")
async def get_runtime_seal(address: str):
    return {"address": address, "seal": "CRYPTO_OPTIMIZED", "version": "4.2.1"}

@app.post("/api/democracy/propose")
async def propose_governance(request: ProposeRequest):
    return {"success": True, "proposal_id": 42, "status": "SUBMITTED"}

@app.post("/api/mint-soulbound")
async def mint_soulbound(request: MintRequest):
    return {"success": True, "token_id": f"SB_{int(time.time())}", "recipient": request.recipient}

@app.post("/api/trigger-flag")
async def trigger_flag(request: TriggerFlagRequest):
    """
    Initiates the Multisig logic for a high-energy account.
    """
    try:
        alert = engine.dispatch_multisig_alert(request.target_account)
        return {
            "success": True,
            "multisig_id": alert["multisig_id"],
            "threshold": alert["threshold"],
            "signers": alert["participants"],
            "status": alert["status"],
            "proposed_at": int(time.time())
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Multisig Dispatch Failed: {str(e)}")

@app.get("/api/fatigue")
async def get_fatigue():
    """
    Reads derived fatigue state from the background engine (fatigue_engine.py).
    """
    state_file = "fatigue_state.json"
    if os.path.exists(state_file):
        try:
            with open(state_file, "r") as f:
                return json.load(f)
        except Exception:
            pass
    
    return {
        "fatigue_index": 4.2,
        "warning_level": "STABLE",
        "timestamp": int(time.time())
    }

# Serve Frontend Static Files
# This should be mounted AFTER API routes
# In a monorepo, the build artifacts might be in ../frontend/dist
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))
local_dist = os.path.exists("dist")

if os.path.exists(frontend_dist) or local_dist:
    static_dir = frontend_dist if os.path.exists(frontend_dist) else "dist"
    
    if os.path.exists(os.path.join(static_dir, "assets")):
        app.mount("/assets", StaticFiles(directory=os.path.join(static_dir, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        # Serve index.html for all non-API routes to support SPA routing
        if full_path.startswith("api/"):
             raise HTTPException(status_code=404)
        
        file_path = os.path.join(static_dir, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        
        return FileResponse(os.path.join(static_dir, "index.html"))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=3000)
