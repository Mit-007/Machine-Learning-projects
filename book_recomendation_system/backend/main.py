import os
import pickle
import numpy as np

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(
    title="Book Recommendation API",
    version="1.0.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# Model Paths
# ============================================================

BASE_DIR = os.path.dirname(__file__)
MODEL_DIR = os.path.join(BASE_DIR, "model")

POPULAR_PATH = os.path.join(MODEL_DIR, "popular.pkl")
PT_PATH = os.path.join(MODEL_DIR, "pt.pkl")
BOOKS_PATH = os.path.join(MODEL_DIR, "books.pkl")
SIMILARITY_PATH = os.path.join(MODEL_DIR, "similarity_score.pkl")


# ============================================================
# Load Models / Data
# ============================================================

popular = None
pt = None
books = None
similarity_score = None


if os.path.exists(POPULAR_PATH):
    with open(POPULAR_PATH, "rb") as f:
        popular = pickle.load(f)
else:
    print(f"Warning: popular.pkl not found at {POPULAR_PATH}")


if os.path.exists(PT_PATH):
    with open(PT_PATH, "rb") as f:
        pt = pickle.load(f)
else:
    print(f"Warning: pt.pkl not found at {PT_PATH}")


if os.path.exists(BOOKS_PATH):
    with open(BOOKS_PATH, "rb") as f:
        books = pickle.load(f)
else:
    print(f"Warning: books.pkl not found at {BOOKS_PATH}")


if os.path.exists(SIMILARITY_PATH):
    with open(SIMILARITY_PATH, "rb") as f:
        similarity_score = pickle.load(f)
else:
    print(f"Warning: similarity_score.pkl not found at {SIMILARITY_PATH}")


# ============================================================
# Root API
# ============================================================

@app.get("/")
def read_root():
    return {
        "status": "ok",
        "message": "Book Recommendation API is running"
    }


# ============================================================
# Popular Books API
# ============================================================

@app.get("/popular")
def get_popular_books():

    if popular is None:
        raise HTTPException(
            status_code=500,
            detail="Popular books data is not loaded."
        )

    try:
        top_books = popular.head(50)

        data = []

        for _, row in top_books.iterrows():

            data.append({
                "book_title": row["Book-Title"],
                "book_author": row["Book-Author"],
                "image_url": row["Image-URL-M"]
            })

        return {
            "count": len(data),
            "books": data
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching popular books: {str(e)}"
        )


# ============================================================
# Book Recommendation API
# ============================================================

@app.get("/recommend/{book_name}")
def recommend_books(book_name: str):

    if pt is None or books is None or similarity_score is None:
        raise HTTPException(
            status_code=500,
            detail="Recommendation data is not loaded."
        )

    try:

        # ----------------------------------------------------
        # Check whether book exists
        # ----------------------------------------------------

        if book_name not in pt.index:
            raise HTTPException(
                status_code=404,
                detail=f"Book '{book_name}' not found."
            )


        # ----------------------------------------------------
        # Find book index
        # ----------------------------------------------------

        index = np.where(pt.index == book_name)[0][0]


        # ----------------------------------------------------
        # Calculate top 5 similar books
        # ----------------------------------------------------

        similar_items = sorted(
            list(enumerate(similarity_score[index])),
            key=lambda x: x[1],
            reverse=True
        )[1:6]


        # ----------------------------------------------------
        # Prepare recommendation response
        # ----------------------------------------------------

        data = []

        for item in similar_items:

            book_index = item[0]
            score = item[1]

            recommended_book_name = pt.index[book_index]

            temp_df = books[
                books["Book-Title"] == recommended_book_name
            ]

            temp_df = temp_df.drop_duplicates("Book-Title")

            if temp_df.empty:
                continue

            row = temp_df.iloc[0]

            data.append({
                "book_title": row["Book-Title"],
                "book_author": row["Book-Author"],
                "image_url": row["Image-URL-M"],
                "similarity_score": float(score)
            })


        return {
            "book": book_name,
            "count": len(data),
            "recommendations": data
        }


    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Recommendation error: {str(e)}"
        )