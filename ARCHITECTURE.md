# Technical Architecture: Portaldot Eco-Sentinel

## Overview
The Portaldot Eco-Sentinel is a high-integrity sustainability monitoring and governance layer for the Portaldot Network. It leverages real-time chain data, predictive modeling, and decentralized governance to enforce environmental standards across the infrastructure.

---

## 1. Data Acquisition
The **PortaldotInterface** serves as the primary gateway to the Substrate-based relay chain. 
- **Live Subscription:** The system utilizes the `subscribe_block_headers` SDK method to maintain a persistent WebSocket connection to the network.
- **Metadata Extraction:** For every block header received, the engine triggers an asynchronous lookup using `retrieve_extrinsic_by_identifier`. 
- **Weight Auditing:** It extracts the `weight` (computational complexity) and `fee_amount` for every extrinsic to calculate the **Carbon Footprint** using the standardized Portaldot ratio: **1M Weight units ≈ 0.001g CO2**.

## 2. Predictive "Network Fatigue" Engine
The **Fatigue Engine** implements **Linear Regression V2.0** to anticipate network congestion before it impacts efficiency.
- **Sliding Window:** The engine maintains a 50-block rolling window of cumulative block weights.
- **Algorithmic Projection:** By calculating the least-squares slope (trend) of recent weight usage, the engine predicts the 'Network Fatigue' index for the next 10 blocks.
- **Warning Thresholds:** 
  - **STABLE (< 8%):** Normal operations.
  - **WARNING (8-15%):** Impending fatigue; system suggests dynamic batching.
  - **CRITICAL (> 15%):** High fatigue; the dashboard triggers automated environmental cooling protocols.

## 3. Governance Integration
Environmental enforcement is handled via the **Multisig Governance Layer**.
- **Violation Detection:** If an account's energy consumption exceeds the predefined **23% Threshold**, the `SentinelAuditor` triggers a governance event.
- **Multisig Flag Call:** The system uses the `create_multisig_extrinsic` method to propose a `flag_account` call. 
- **Decentralized Consent:** This proposal requires a **2-of-3 threshold** from authorized Sustainability Auditors (Sentinel Admin accounts) before the account is restricted or taxed for excess emissions.

## 4. Attestation Layer (Green Certificates)
The **GreenCert** smart contract, written in **ink! (Rust)**, provides immutable proof of validator efficiency.
- **Soulbound Minting:** When a validator passes a Deep Audit with an efficiency score > 98%, the Sentinel Admin invokes the `mint_attestation` message.
- **On-Chain Metadata:** The contract stores the `efficiency_score` and `audit_timestamp` as immutable storage items.
- **Event Emission:** A `CertificateMinted` event is emitted upon successful issuance, which the React frontend listens for to update the **Attestation Badge** in the UI. 
- **Non-Transferability:** The contract logic strictly prevents `transfer` calls, ensuring the certificate remains "Soulbound" to the authorized validator address.

---
**Status:** Production Ready | **SDK Version:** v2.4.1 | **Environment:** Portaldot-Mainnet-v4-Relay
