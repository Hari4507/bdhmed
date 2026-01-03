# Brain-Derived Hierarchical (BDH) Adverse Event Learning System

## Live Demo
- Try it here: https://bdh-frontend-jjdo.onrender.com

## Overview
This project implements a **Brain-Derived Hierarchical (BDH)** architecture for detecting and learning from adverse healthcare events in real-time. Unlike traditional Transformer models that require massive retraining, the BDH system uses **Hebbian learning** and **synaptic plasticity** to adapt immediately during the inference phase.

## Core Concepts

### 1. Neurons & Synapses (Not Tensors)
- The system is built from explicit `Neuron` and `Synapse` objects, not matrix multiplications.
- **Input Layer**: Represents discrete clinical factors (Drugs, Dosages, Conditions).
- **Hidden Layer**: Dynamically grows to represent learned **patterns** (e.g., "Drug A + Drug B").
- **Output Layer**: Represents the "Adverse Event" outcome.

### 2. Hebbian Learning ("Fire together, wire together")
- When an Adverse Event is reported:
  - The system identifies which input neurons were active.
  - It creates or strengthens a **Pattern Neuron** representing that specific combination.
  - It strengthens the synaptic connection between that pattern and the "Adverse Event" neuron.
- This happens **instantly** in memory. No backpropagation or gradient descent is used.

### 3. Inference & Traceability
- Risk scores are calculated by propagating activation signals through the network.
- The decision path is fully explainable:
  - "Risk Score: 0.85"
  - "Reason: Drug A and Drug B fired Pattern Node X, which has a strong connection to Adverse Event."

## Tech Stack
- **Frontend**: React, TypeScript, TailwindCSS (Netflix Theme), Recharts
- **Backend**: FastAPI (Python)
- **Persistence**: Local JSON storage (`data/network_state.json`)

## Running the Project

### Prerequisites
- Node.js & npm
- Python 3.8+

### 1. Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```

### 3. Usage
1. Open the web interface.
2. Enter patient data (e.g., "Aspirin", "Warfarin").
3. Select "Adverse Event" and submit.
4. Watch the **Dashboard** to see the new synaptic connections form in real-time.
5. Submit the same data again to see the elevated Risk Score.
