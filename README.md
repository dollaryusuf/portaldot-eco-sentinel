🛡️ Portaldot Eco-Sentinel
The Autonomous Sustainability Guard & Infrastructure Auditor for the Green Digital Civilization.
![alt text](https://img.shields.io/badge/Network-Portaldot-00FF9D?style=for-the-badge&logo=polkadot)

![alt text](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)

![alt text](https://img.shields.io/badge/SDK-Portaldot_v2.4.1-blue?style=for-the-badge)
🌐 Vision
In the pursuit of a Green and Trusted Digital Civilization, transactions alone are not enough. Accountability is required. Eco-Sentinel is an autonomous infrastructure layer that monitors, audits, and protects the Portaldot Network’s sustainability. It bridges the gap between raw blockchain weight and real-world environmental impact.
Eco-Sentinel acts as the network's "Immune System"—detecting energy-inefficient anomalies, predicting infrastructure fatigue, and enforcing "Green Governance" via automated multisig protocols.
✨ Key Features
🕵️‍♂️ Historical Auditor
Utilizing the Portaldot SearchExtension, Sentinel performs deep-packet inspection of historical blocks. It converts Substrate Weight and Fees into actionable Carbon Metrics (gCO2), allowing for a transparent audit of the network's efficiency.
📈 Fatigue Stress Test (Linear Regression V2.0)
A predictive engine that monitors block-weight trends. By analyzing the last 1,000 blocks via the Portaldot Python SDK, it predicts "Network Fatigue" to prevent congestion before it occurs, ensuring the "Trusted" nature of the civilization.
⚖️ Multisig Alert & Governance Layer
When high-energy usage or anomalous "un-taxed" weight is detected, Eco-Sentinel prepares a Multisig Extrinsic. It requires 2/3 consensus from "Sentinel Auditors" to flag or throttle accounts, perfectly aligning with the LAO NPoS governance model.
🌿 Green Certificate (ink! Soulbound Tokens)
Validators who maintain a Sustainability Index > 98% are automatically rewarded with "Green Certificates." These are non-transferable ink! Smart Contract (SBTs) that act as on-chain credentials for their contribution to the Green Civilization.
🛠️ Technical Stack
Core: Portaldot Network Infrastructure
Backend: Python 3.10+ utilizing the Portaldot Python SDK
Frontend: React + Tailwind CSS (Optimized for PortalFix High-Fidelity Dark Mode)
Smart Contracts: ink! (Rust) for Soulbound Attestations
Data Engine: Linear Regression for Predictive Fatigue Analysis
Oracle: DePIN Grid Intensity Oracle (Simulated)
🔌 Portaldot SDK Integration
Eco-Sentinel leverages the core modules of the Portaldot SDK to perform its audits:
PortaldotInterface: Primary RPC connection to the Substrate layer.
retrieve_extrinsic_by_identifier: Used for deep-auditing extrinsic success and weight.
get_payment_info: Powers the Carbon Estimator by calculating weight-to-energy ratios.
create_multisig_extrinsic: Foundation of the Sentinel Approval governance system.
Utility.batch: Used in the Green Batcher to stress-test runtime efficiency.
🚀 Getting Started
1. Installation
code
Bash
# Clone the repository
git clone https://github.com/your-username/portaldot-eco-sentinel.git

# Install Frontend dependencies
cd frontend
npm install

# Install Backend (Sentinel Engine) dependencies
cd ../backend
pip install -r requirements.txt
2. Run the Sentinel Engine
code
Bash
python sentinel_engine.py --rpc wss://rpc.portaldot.network
3. Launch the Dashboard
code
Bash
npm run dev
🛡️ Identity & Security
Eco-Sentinel implements Trusted Discovery via native Substrate extensions.
Extensions Supported: Talisman, SubWallet, Polkadot.js.
Sentinel Demo Mode: For reviewers without an active wallet, a "Sentinel Authority Level 4" emulation mode is provided to experience the full stress-testing and governance lifecycle.
📄 License
Distributed under the MIT License. See LICENSE for more information.
🙌 Acknowledgements
Built for the Portaldot Network Hackathon.
Design inspired by the PortalFix Infrastructure Aesthetic.
Logic based on the Portaldot "Green and Trusted Digital Civilization" Whitepaper.
Eco-Sentinel: Ensuring the Future of the Internet is Green, Trusted, and Sovereign.
