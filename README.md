<div align="center">
  <img src="https://your-image-link-here.com/sentinel-logo.png" alt="Eco-Sentinel Logo" width="120" />
  <h1>🛡️ Portaldot Eco-Sentinel</h1>
  <p><b>The Autonomous Sustainability Guard & Infrastructure Auditor for the Green Digital Civilization.</b></p>

  <div>
    <img src="https://img.shields.io/badge/Network-Portaldot-00FF9D?style=for-the-badge&logo=polkadot" alt="Network" />
    <img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge" alt="License" />
    <img src="https://img.shields.io/badge/SDK-Portaldot_v2.4.1-blue?style=for-the-badge" alt="SDK" />
  </div>
</div>

---

## 🌐 Vision
<div align="justify">
In the pursuit of a <b>Green and Trusted Digital Civilization</b>, transactions alone are not enough. Accountability is required. Eco-Sentinel is an autonomous infrastructure layer that monitors, audits, and protects the Portaldot Network’s sustainability. It bridges the gap between raw blockchain weight and real-world environmental impact.
</div>

> Eco-Sentinel acts as the network's **"Immune System"**—detecting energy-inefficient anomalies, predicting infrastructure fatigue, and enforcing "Green Governance" via automated multisig protocols.

---

## ✨ Key Features

<table width="100%">
  <tr>
    <td width="50%" valign="top">
      <h4>🕵️‍♂️ Historical Auditor</h4>
      <p>Utilizing the <b>Portaldot SearchExtension</b>, Sentinel performs deep-packet inspection of historical blocks. It converts Substrate Weight and Fees into actionable Carbon Metrics (gCO2).</p>
    </td>
    <td width="50%" valign="top">
      <h4>📈 Fatigue Stress Test</h4>
      <p>A predictive engine powered by <b>Linear Regression V2.0</b>. By analyzing block-weight trends via the Portaldot Python SDK, it predicts "Network Fatigue" to prevent congestion.</p>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <h4>⚖️ Multisig Governance</h4>
      <p>Detects anomalous weight usage and prepares a <b>Multisig Extrinsic</b>. Requires 2/3 consensus from Sentinel Auditors to flag accounts, aligning with LAO NPoS models.</p>
    </td>
    <td width="50%" valign="top">
      <h4>🌿 Green Certificates</h4>
      <p>Validators maintaining a Sustainability Index > 98% are awarded <b>ink! Soulbound Tokens (SBTs)</b>—on-chain credentials for their contribution to the network.</p>
    </td>
  </tr>
</table>

---

## 🛠️ Technical Stack

<div align="left">
  <ul>
    <li><b>Core:</b> Portaldot Network Infrastructure</li>
    <li><b>Backend:</b> Python 3.10+ utilizing the <b>Portaldot Python SDK</b></li>
    <li><b>Frontend:</b> React + Tailwind CSS (Optimized for PortalFix High-Fidelity Dark Mode)</li>
    <li><b>Smart Contracts:</b> ink! (Rust) for Soulbound Attestations</li>
    <li><b>Oracles:</b> DePIN Grid Intensity Oracle (Simulated)</li>
  </ul>
</div>

---

## 🔌 Portaldot SDK Integration
Eco-Sentinel leverages core SDK modules for deep infrastructure auditing:

| Module | Purpose |
| :--- | :--- |
| `PortaldotInterface` | Primary RPC connection to the Substrate layer. |
| `retrieve_extrinsic_by_identifier` | Deep-auditing extrinsic success and weight metrics. |
| `get_payment_info` | Powering the Carbon Estimator via weight-to-energy ratios. |
| `create_multisig_extrinsic` | Foundation of the Sentinel Approval governance system. |
| `Utility.batch` | High-throughput stress-testing of runtime efficiency. |

---

## 🚀 Getting Started

### 1. Installation
```bash
# Clone the repository
git clone https://github.com/your-username/portaldot-eco-sentinel.git

# Install Frontend dependencies
cd frontend
npm install

# Install Backend (Sentinel Engine) dependencies
cd ../backend
pip install -r requirements.txt

2. Execution

# Run the Sentinel Engine
python sentinel_engine.py --rpc wss://rpc.portaldot.network

# Launch the Dashboard
npm run dev

🛡️ Identity & Security
Eco-Sentinel implements Trusted Discovery via native Substrate extensions.
Extensions Supported: Talisman, SubWallet, Polkadot.js.
Sentinel Demo Mode: For reviewers without an active wallet, a "Sentinel Authority Level 4" emulation mode is provided to experience the full stress-testing and governance lifecycle without security friction.
