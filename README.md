# NIRBHAY INDIA (AI + Blockchain Powered Women’s Safety Ecosystem)  

## 🧭 Overview  
**Nirbhay India** is an AI-driven women’s safety ecosystem that integrates **Artificial Intelligence, IoT, and Blockchain** to create a **proactive, transparent, and secure safety network**.  

The platform is designed to:  
- Detect danger and alert emergency contacts instantly.  
- Provide real-time tracking and verified community help.  
- Store immutable evidence on the blockchain.  
- Leverage AI for predictive analysis and safety recommendations.  

This project aims to **empower women with fearless mobility** and **restore trust in public spaces**.

---

## 🚀 Vision  
To redefine personal safety through **proactive technology**, **authentic data**, and **community-driven accountability**, ensuring every citizen — especially women — feels safe, connected, and protected anywhere in India.

---

## ⚙️ Features  

| Feature | Description |
|----------|-------------|
| **🧠 AI-Powered Safety Intelligence** | Detects potential danger from user voice tone, gestures, and environmental cues. Suggests nearest safe zones. |
| **🛰️ Real-Time GPS Tracking** | Tracks location continuously and sends live coordinates to family, police, and emergency centers during alerts. |
| **🔗 Blockchain-Based Evidence Storage** | Records tamper-proof incident data (time, location, audio, video) using smart contracts for transparency and legal validation. |
| **🧾 Blockchain Identity Verification** | Uses decentralized identity for verified police, NGOs, and users to prevent misuse. |
| **📢 Emergency SOS Button (Device + App)** | Physical or in-app button sends immediate alerts to registered contacts and emergency response centers. |
| **👁️ AI Monitoring via Camera/Audio** | Detects distress signals or suspicious surroundings using computer vision and audio processing. |
| **📊 Safety Heatmap Dashboard** | Displays real-time safety index of regions using historical data, AI predictions, and public reports. |
| **📱 Community Support Network** | Connects nearby verified volunteers and police through location smart contracts. |
| **🧬 Predictive Analytics (AI)** | Predicts potential unsafe zones and alerts users before entering high-risk areas. |
| **🔒 Tamper-Proof Reports** | All incident reports are cryptographically secured and visible only to authorized identities. |

---

## 🧩 Tech Stack  

| Layer | Technologies Used |
|--------|-------------------|
| **AI/ML** | Python, TensorFlow, Scikit-learn, NumPy, Pandas |
| **LLMs / AI APIs** | Google Gemini API, Groq Cloud |
| **Backend** | FastAPI, Flask, MQTT/IoT Protocols |
| **Blockchain** | Solidity, Ethereum, IPFS, Pinata API, MetaMask |
| **Frontend** | React.js, HTML, CSS, Tailwind, JavaScript |
| **Database** | MongoDB, Firebase (for real-time alerts) |
| **Design** | Figma, Canva |
| **Cloud & Deployment** | AWS / Render / Netlify |
| **IoT Integration** | GPS Sensors, Vibration Sensors, Microcontroller (ESP32 / Arduino) |

---

## 🧠 AI Architecture  

**AI Workflow:**
1. **Data Input:** Voice, video, motion, and GPS signals are continuously monitored.  
2. **Threat Detection:** ML models analyze emotion, motion patterns, and audio intensity to identify distress.  
3. **Alert Trigger:** If a potential threat is detected, AI immediately initiates the SOS system.  
4. **Response Recommendation:** AI suggests the nearest safe route, police stations, and hospitals.  
5. **Predictive Insights:** AI learns from user patterns to warn before entering unsafe zones.

### 🔍 Key AI Models  
- Emotion Recognition Model (CNN + LSTM)  
- Voice Stress Detection Model  
- Anomaly Detection (to identify unusual movement patterns)  
- Location Safety Predictor (trained on public crime datasets)  

---

## ⛓️ Blockchain Architecture  

**Objective:** To ensure **data integrity, transparency, and trust** among users, police, and emergency services.

### 🔐 Blockchain Workflow  
(Smart Contracts are not Working For Now Due to Some Issues)

1. **Incident Detection (AI/IoT Trigger):**  
   When AI detects a distress signal, the event is automatically logged.  

2. **Smart Contract Activation:**  
   A smart contract is triggered to record:  
   - User ID (hashed)  
   - Time, Location  
   - Incident Type  
   - Encrypted evidence (audio/video via IPFS)  

3. **Data Storage (Immutable):**  
   - Evidence is uploaded to **IPFS (via Pinata)**.  
   - IPFS hash + metadata is stored on **Ethereum Blockchain** via **Solidity Smart Contract**.  

4. **Verification Layer:**  
   Authorized agencies (police/NGOs) verify data using their **blockchain identity keys**.  

5. **Transparency Layer:**  
   Victims can later retrieve proof for legal support, ensuring **tamper-proof and timestamped evidence**.

### 🧱 Smart Contract Modules  

| Module | Function |
|---------|-----------|
| **IncidentEvidence.sol** | Stores immutable proof of emergencies. |
| **UserIdentity.sol** | Manages decentralized verified user identities. |
| **ResponderRegistry.sol** | Verifies and ranks emergency responders. |
| **CommunityTrust.sol** | Tracks verified helper ratings and community trust scores. |

---

## 🧩 System Architecture Diagram (Workflow)

**1. Mobile App / IoT Device**  
→ Collects location, audio, and gesture data  

**2. AI Engine (Server/Cloud)**  
→ Processes real-time inputs → Detects threats → Sends alert  

**3. Blockchain Layer (Ethereum + IPFS)**  
→ Records immutable event data and authenticates identities  

**4. Response Layer**  
→ Sends alert to emergency contacts, police, and nearby users  

**5. Dashboard (Admin + Police View)**  
→ Monitors all events, safety heatmaps, and verified actions  

---

## 🧰 Installation & Setup  

### 1️⃣ Clone the Repository  
```bash
git clone https://github.com/NirbhayIndia/NirbhayIndia.git
cd NirbhayIndia

cd backend
pip install -r requirements.txt
python app.py

cd frontend
npm install
npm start
```

## 🔍 Running the Project  

1. Start the backend (**FastAPI/Flask server**).  
2. Start the frontend (**React web interface**).  
3. Deploy smart contracts and note their addresses.  
4. Connect **MetaMask** to interact with blockchain modules.  
5. Test the app — trigger an **SOS** or simulated emergency event.  
6. Check the **dashboard** for AI predictions and blockchain logs.  

---

## 🔒 Security Layers  

| Layer | Protection |
|--------|-------------|
| **AES Encryption** | For all communication between app and backend. |
| **Decentralized Authentication** | Verified identity keys for responders. |
| **Immutable Records** | No deletion or modification of evidence. |
| **End-to-End Data Privacy** | Only authorized entities can access case data. |

---

## 📊 Future Scope  

- 🔗 Integration with **National Police APIs**.  
- 🗣️ **Voice-based blockchain verification** for emergency responders.  
- 👥 **AI models for crowd behavior prediction**.  
- 🚁 Integration of **drone-based rapid response systems**.  
- 🌍 Expansion into a **global women’s safety protocol (Nirbhay Global)**.  

---

## 👥 Team Nirbhay India  

| Name | Role | LinkedIn |
|------|------|-----------|
| **Rishabh Jain** | Founder | [linkedin.com/in/rishabh-jain2005](https://linkedin.com/in/rishabh-jain2005) |
| **Yashvika Bhardwaj** | Co-Founder | [linkedin.com/in/yashvika-bhardwaj-08b500351](https://linkedin.com/in/yashvika-bhardwaj-08b500351) |
| **Nirbhay India Official** | Project Page | [linkedin.com/in/nirbhay-india-aa31bb375](https://linkedin.com/in/nirbhay-india-aa31bb375) |

---

## 🌟 Conclusion  

**Nirbhay India** blends **AI intelligence** with **blockchain transparency** to ensure **authentic safety data**, **instant emergency support**, and **nationwide accountability**.  
It’s not just a safety app — it’s a **movement towards a fearless India. 🇮🇳**  

---

> 🧡 Developed with ❤️ by **Team Nirbhay India**  
> 🔐 Empowering Safety Through Technology
