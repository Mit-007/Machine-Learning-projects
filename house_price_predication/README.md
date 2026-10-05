# 🏡 House Price Prediction System

A full-stack Machine Learning web application for predicting residential property prices based on location, area (total sq. ft.), number of bathrooms, and BHK configuration using a trained **Ridge Regression** model and **FastAPI**.

---

## 📁 Project Structure

```text
house_price_predication/
│
├── backend/
│   ├── main.py              # FastAPI backend API with CORS & model loader
│   └── RidgeModel.pkl       # Trained Ridge Regression scikit-learn model
│
├── frontend/
│   ├── index.html           # Modern, responsive UI layout
│   ├── style.css            # Custom CSS with cards, gradients, and animations
│   └── app.js               # Frontend JavaScript connected to backend API
│
└── README.md                # Setup and execution guide
```

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have **Python 3.8+** installed.

Install the required Python packages:
```bash
pip install fastapi uvicorn scikit-learn pandas
```

---

### 2. Start the Backend API

1. Open your terminal in the project directory:
   ```bash
   cd backend
   ```
2. Start the FastAPI server using Uvicorn:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
3. The backend server will be running at:
   - **API URL:** `http://127.0.0.1:8000`
   - **Interactive API Docs (Swagger UI):** `http://127.0.0.1:8000/docs`

---

### 3. Open the Frontend

You can run the frontend in any of the following easy ways:

#### Method 1: Direct Browser Open (Easiest)
Simply navigate to the `frontend/` folder in your file explorer and **double-click** `index.html` (or right-click → Open With Chrome/Edge/Firefox).

#### Method 2: VS Code Live Server
- Open VS Code.
- Right-click `frontend/index.html` → Click **"Open with Live Server"**.

#### Method 3: Python HTTP Server
Run a lightweight local web server:
```bash
cd frontend
python -m http.server 5500
```
Then open [http://localhost:5500](http://localhost:5500) in your browser.

---

## 📋 Input Fields & Options

The application accepts 4 property parameters:

| Field | Type | Description |
| :--- | :--- | :--- |
| `location` | `string` | Locality of the property (Selected from dropdown) |
| `total_sqft` | `float` | Total built-up area in square feet (e.g. `1200`) |
| `bath` | `float` | Number of bathrooms (e.g. `2`) |
| `bhk` | `int` | Number of bedrooms/BHK (e.g. `2`) |

### Supported Locations:
1. `other`
2. `Whitefield`
3. `Sarjapur Road`
4. `Electronic City`
5. `Raja Rajeshwari Nagar`
6. `Uttarahalli`
7. `Haralur Road`
8. `Marathahalli`
9. `Bannerghatta Road`
10. `Hennur Road`
11. `Thanisandra`
12. `Hebbal`
13. `Kanakpura Road`
14. `Electronic City Phase II`
15. `Yelahanka`
16. `7th Phase JP Nagar`
17. `Bellandur`
18. `KR Puram`
19. `Chandapura`
20. `Harlur`

---

## 🔌 API Endpoint Reference

### Predict House Price
- **URL:** `/predict`
- **Method:** `POST`
- **Headers:** `Content-Type: application/json`

#### Request Body:
```json
{
  "location": "Whitefield",
  "total_sqft": 1200.0,
  "bath": 2.0,
  "bhk": 2
}
```

#### Response:
```json
{
  "predicted_price": 75.50,
  "location": "Whitefield",
  "total_sqft": 1200.0,
  "bath": 2.0,
  "bhk": 2
}
```
*(The predicted price is in **₹ Lakhs** and automatically converted to Lakhs/Crores & Rate per sq.ft on the UI).*
