# 📚 BookWise - Book Recommendation System

A Machine Learning-powered Book Recommendation Web Application built with **FastAPI** on the backend and modern **HTML5 / CSS3 / JavaScript** on the frontend. The system provides book recommendations using **Popularity-Based Filtering** and **Collaborative Filtering** techniques.

---

## 🌟 Features

- 🔥 **Top 50 Popular Books**: Displays the highest-rated and most popular books curated across thousands of user ratings.
- 🪄 **Intelligent Book Recommendations**: Search for any book title to receive the top 5 most similar and relevant book recommendations based on user reading behaviors and cosine similarity.
- ⚡ **FastAPI High-Performance Backend**: Fast, lightweight REST API serving recommendations and book metadata with CORS support.
- 🎨 **Responsive & Modern UI**: Clean user interface featuring smooth transitions, real-time search suggestions, auto-complete tags, and server status indicators.
- 🔌 **Configurable API Endpoint**: Seamlessly connect the frontend to different backend URLs from the built-in UI settings modal.

---

## 🛠️ Tech Stack & Architecture

- **Backend**: Python 3.10+, [FastAPI](https://fastapi.tiangolo.com/), [Uvicorn](https://www.uvicorn.org/)
- **Machine Learning & Data Processing**: [Pandas](https://pandas.pydata.org/), [NumPy](https://numpy.org/), [Scikit-Learn](https://scikit-learn.org/), Pickle
- **Frontend**: HTML5, CSS3 (Modern Flexbox & Grid), Vanilla JavaScript (ES6+), FontAwesome Icons, Google Fonts (Plus Jakarta Sans)

---

## 📁 Project Structure

```text
book_recomendation_system/
│
├── backend/
│   ├── model/
│   │   ├── books.pkl               # Book metadata dataframe (titles, authors, image URLs)
│   │   ├── popular.pkl             # Top 50 popular books dataframe
│   │   ├── pt.pkl                  # Pivot table matrix (books vs users)
│   │   └── similarity_score.pkl    # Cosine similarity matrix between books
│   └── main.py                     # FastAPI application entry point & API routes
│
├── frontend/
│   ├── app.js                      # Client-side JavaScript (API calls, UI logic)
│   ├── index.html                  # Main web interface
│   └── style.css                   # Custom styles and responsive layouts
│
├── .gitignore                      # Git ignore file
├── README.md                       # Project documentation
└── requirements.txt                # Python dependencies list
```

---

## ⚙️ Prerequisites

Make sure you have the following installed on your system:
- **Python 3.10+** (Recommended: Python 3.10 - 3.12)
- **pip** (Python package installer)
- A modern web browser (Google Chrome, Microsoft Edge, Firefox, etc.)

---

## 🚀 Installation & Setup

### 1. Clone or Open the Repository
Open your terminal / command prompt and navigate to the project root directory:
```bash
cd "path/to/book_recomendation_system"
```

### 2. Create and Activate a Virtual Environment

**On Windows (PowerShell):**
```powershell
python -m venv venv
Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned
.\venv\Scripts\Activate.ps1
```

**On Windows (Command Prompt):**
```cmd
python -m venv venv
venv\Scripts\activate.bat
```

**On macOS / Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Required Dependencies
Install the required packages using [`requirements.txt`](file:///D:/VS%20CODE/TRT-Intenship/mini%20projects%20TRT/Machine_learning_project/book_recomendation_system/requirements.txt):
```bash
pip install -r requirements.txt
```

---

## ▶️ How to Run the Project

### Step 1: Start the Backend Server (FastAPI)

Run the backend using `uvicorn` from either the project root or the `backend` folder:

**Option A (From Project Root):**
```bash
uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

**Option B (From Backend Directory):**
```bash
cd backend
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

The API will start at: `http://127.0.0.1:8000`
- Interactive API Docs (Swagger UI): `http://127.0.0.1:8000/docs`
- Alternative API Docs (ReDoc): `http://127.0.0.1:8000/redoc`

---

### Step 2: Launch the Frontend

You can run the frontend in any of the following ways:

#### Option 1: Using Python HTTP Server (Recommended)
In a new terminal window, navigate to the `frontend` folder and start a simple server:
```bash
cd frontend
python -m http.server 5500
```
Then open your browser and visit: `http://127.0.0.1:5500`

#### Option 2: Using VS Code Live Server
1. Open the project in VS Code.
2. Right-click on `frontend/index.html`.
3. Click **"Open with Live Server"**.

#### Option 3: Open Directly in Browser
Double-click `frontend/index.html` or drag and drop it into your web browser.

---

## 📡 API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Root health check and API status message. |
| `GET` | `/popular` | Returns the top 50 popular books with title, author, and cover image. |
| `GET` | `/recommend/{book_name}` | Returns top 5 collaborative filtering recommendations for the specified book title. |

### Example Request
```http
GET http://127.0.0.1:8000/recommend/The%20Da%20Vinci%20Code
```

### Example Response
```json
{
  "book": "The Da Vinci Code",
  "count": 5,
  "recommendations": [
    {
      "book_title": "Angels & Demons",
      "book_author": "Dan Brown",
      "image_url": "http://images.amazon.com/images/P/0671027360.01.MZZZZZZZ.jpg",
      "similarity_score": 0.583
    }
  ]
}
```

---

## 🧠 Recommendation Algorithms

1. **Popularity-Based Filtering (`popular.pkl`)**:
   - Computes weighted averages based on book rating counts and mean ratings.
   - Recommends the highest-rated books with a threshold minimum number of ratings.

2. **Collaborative Filtering (`pt.pkl`, `similarity_score.pkl`)**:
   - Constructs a user-item pivot matrix of users who have rated a significant number of books.
   - Calculates **Cosine Similarity** between book vectors.
   - Finds the nearest neighbors for a selected book to generate top similar recommendations.

---

## 📝 License

This project is developed as part of a Machine Learning internship project. Free for educational and personal use.
