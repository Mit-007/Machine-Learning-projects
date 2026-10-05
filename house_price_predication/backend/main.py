import os
import pickle
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="House Price Prediction API", version="1.0.0")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load trained model safely
MODEL_PATH = os.path.join(os.path.dirname(__file__), "RidgeModel.pkl")
if not os.path.exists(MODEL_PATH):
    MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "RidgeModel.pkl")

model = None
if os.path.exists(MODEL_PATH):
    with open(MODEL_PATH, "rb") as f:
        model = pickle.load(f)
else:
    print(f"Warning: Model file not found at {MODEL_PATH}")


class HouseData(BaseModel):
    location: str = Field(..., description="Location of the house")
    total_sqft: float = Field(..., gt=0, description="Total square feet area")
    bath: float = Field(..., gt=0, description="Number of bathrooms")
    bhk: int = Field(..., gt=0, description="Number of BHK / bedrooms")


@app.get("/")
def read_root():
    return {"status": "ok", "message": "House Price Prediction API is running"}


@app.post("/predict")
def predict(data: HouseData):
    if model is None:
        raise HTTPException(status_code=500, detail="Model is not loaded. Please verify RidgeModel.pkl exists.")

    try:
        input_data = pd.DataFrame([{
            "location": data.location,
            "total_sqft": data.total_sqft,
            "bath": data.bath,
            "bhk": data.bhk
        }])

        prediction = model.predict(input_data)
        predicted_val = float(prediction[0])

        return {
            "predicted_price": predicted_val,
            "location": data.location,
            "total_sqft": data.total_sqft,
            "bath": data.bath,
            "bhk": data.bhk
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Prediction error: {str(e)}")