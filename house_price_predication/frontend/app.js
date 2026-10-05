/**
 * House Price Prediction System - Frontend JavaScript
 * Connects frontend UI to FastAPI backend at http://127.0.0.1:8000/predict
 */

// List of supported locations as requested
const LOCATIONS = [
    "other",
    "Whitefield",
    "Sarjapur Road",
    "Electronic City",
    "Raja Rajeshwari Nagar",
    "Uttarahalli",
    "Haralur Road",
    "Marathahalli",
    "Bannerghatta Road",
    "Hennur Road",
    "Thanisandra",
    "Hebbal",
    "Kanakpura Road",
    "Electronic City Phase II",
    "Yelahanka",
    "7th Phase JP Nagar",
    "Bellandur",
    "KR Puram",
    "Chandapura",
    "Harlur"
];

// Backend API Base URL
const API_BASE_URL = "http://127.0.0.1:8000";

// DOM Elements
const locationSelect = document.getElementById("location");
const totalSqftInput = document.getElementById("total_sqft");
const bhkInput = document.getElementById("bhk");
const bathInput = document.getElementById("bath");
const predictionForm = document.getElementById("predictionForm");
const predictBtn = document.getElementById("predictBtn");
const resetBtn = document.getElementById("resetBtn");
const sampleDataBtn = document.getElementById("sampleDataBtn");
const errorAlert = document.getElementById("errorAlert");
const errorMessage = document.getElementById("errorMessage");
const apiStatusBadge = document.getElementById("apiStatusBadge");
const statusText = document.getElementById("statusText");

// Result Card DOM Elements
const emptyState = document.getElementById("emptyState");
const loadingState = document.getElementById("loadingState");
const successState = document.getElementById("successState");
const predictedPriceEl = document.getElementById("predictedPrice");
const priceUnitEl = document.getElementById("priceUnit");
const priceInWordsEl = document.getElementById("priceInWords");
const ratePerSqftEl = document.getElementById("ratePerSqft");
const summaryBhkEl = document.getElementById("summaryBhk");
const summaryLocationEl = document.getElementById("summaryLocation");
const summarySqftEl = document.getElementById("summarySqft");
const summaryBathEl = document.getElementById("summaryBath");
const resultTimestampEl = document.getElementById("resultTimestamp");
const newPredictionBtn = document.getElementById("newPredictionBtn");

/**
 * Initialize Application
 */
function initApp() {
    populateLocations();
    setupPresetChips();
    setupEventListeners();
    checkBackendHealth();
}

/**
 * Populate Location Dropdown
 */
function populateLocations() {
    locationSelect.innerHTML = '<option value="" disabled selected>Choose property location...</option>';
    
    LOCATIONS.forEach((loc) => {
        const option = document.createElement("option");
        option.value = loc;
        option.textContent = loc === "other" ? "Other Localities" : loc;
        locationSelect.appendChild(option);
    });
}

/**
 * Preset Chips Click Handlers
 */
function setupPresetChips() {
    const chips = document.querySelectorAll(".chip");
    
    chips.forEach((chip) => {
        chip.addEventListener("click", () => {
            const targetId = chip.getAttribute("data-target");
            const val = chip.getAttribute("data-val");
            const inputEl = document.getElementById(targetId);
            
            if (inputEl) {
                inputEl.value = val;
                
                // Highlight active chip within same container
                const siblingChips = chip.parentElement.querySelectorAll(".chip");
                siblingChips.forEach((c) => c.classList.remove("active"));
                chip.classList.add("active");
                
                inputEl.dispatchEvent(new Event("input", { bubbles: true }));
            }
        });
    });
}

/**
 * Setup Event Listeners
 */
function setupEventListeners() {
    // Form Submit
    predictionForm.addEventListener("submit", handleFormSubmit);

    // Reset Form
    resetBtn.addEventListener("click", resetForm);

    // Sample Data
    sampleDataBtn.addEventListener("click", fillSampleData);

    // Calculate Another
    if (newPredictionBtn) {
        newPredictionBtn.addEventListener("click", () => {
            totalSqftInput.focus();
            showState("empty");
        });
    }

    // Clear error on input change
    [locationSelect, totalSqftInput, bhkInput, bathInput].forEach((input) => {
        input.addEventListener("input", hideError);
    });
}

/**
 * Fill Form with Sample Values
 */
function fillSampleData() {
    locationSelect.value = "Whitefield";
    totalSqftInput.value = "1200";
    bhkInput.value = "2";
    bathInput.value = "2";

    // Update active chip styles
    updateActiveChips();
    hideError();
}

/**
 * Update chip styles according to current input values
 */
function updateActiveChips() {
    document.querySelectorAll(".chip").forEach((chip) => {
        const targetId = chip.getAttribute("data-target");
        const val = chip.getAttribute("data-val");
        const inputEl = document.getElementById(targetId);
        
        if (inputEl && inputEl.value === val) {
            chip.classList.add("active");
        } else {
            chip.classList.remove("active");
        }
    });
}

/**
 * Reset Form
 */
function resetForm() {
    predictionForm.reset();
    document.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
    hideError();
    showState("empty");
}

/**
 * Check Backend Health & Status
 */
async function checkBackendHealth() {
    try {
        const response = await fetch(`${API_BASE_URL}/`, { method: "GET" });
        if (response.ok) {
            apiStatusBadge.className = "api-status-badge connected";
            statusText.textContent = "Backend API Connected (Port 8000)";
        } else {
            throw new Error("Server responded with error");
        }
    } catch (err) {
        apiStatusBadge.className = "api-status-badge offline";
        statusText.textContent = "Backend API Offline (Start FastAPI server)";
    }
}

/**
 * Form Submit Handler
 */
async function handleFormSubmit(e) {
    e.preventDefault();
    hideError();

    // Extract Values
    const location = locationSelect.value;
    const total_sqft = parseFloat(totalSqftInput.value);
    const bhk = parseInt(bhkInput.value, 10);
    const bath = parseFloat(bathInput.value);

    // Validation
    if (!location) {
        showError("Please select a valid property location.");
        locationSelect.focus();
        return;
    }

    if (isNaN(total_sqft) || total_sqft <= 0) {
        showError("Please enter a valid built-up area in square feet (greater than 0).");
        totalSqftInput.focus();
        return;
    }

    if (isNaN(bhk) || bhk <= 0) {
        showError("Please enter a valid number of BHK / bedrooms.");
        bhkInput.focus();
        return;
    }

    if (isNaN(bath) || bath <= 0) {
        showError("Please enter a valid number of bathrooms.");
        bathInput.focus();
        return;
    }

    // Payload formatted strictly according to backend BaseModel:
    // { location: str, total_sqft: float, bath: float, bhk: int }
    const payload = {
        location: location,
        total_sqft: total_sqft,
        bath: bath,
        bhk: bhk
    };

    // UI Loading state
    setLoading(true);
    showState("loading");

    try {
        const response = await fetch(`${API_BASE_URL}/predict`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            let errorDetail = "Failed to calculate prediction.";
            try {
                const errorJson = await response.json();
                if (errorJson && errorJson.detail) {
                    errorDetail = errorJson.detail;
                }
            } catch (_) {}
            throw new Error(errorDetail);
        }

        const data = await response.json();
        
        // Handle predicted price
        displayPredictionResult(data.predicted_price, payload);
        apiStatusBadge.className = "api-status-badge connected";
        statusText.textContent = "Backend API Connected (Port 8000)";

    } catch (error) {
        console.error("Prediction Request Failed:", error);
        showError(
            error.message.includes("Failed to fetch") || error.message.includes("NetworkError")
                ? `Cannot connect to Backend API at ${API_BASE_URL}. Make sure your FastAPI server is running with: uvicorn main:app --reload`
                : `Error: ${error.message}`
        );
        showState("empty");
        apiStatusBadge.className = "api-status-badge offline";
        statusText.textContent = "Backend API Offline (Check Server)";
    } finally {
        setLoading(false);
    }
}

/**
 * Format and Display the Prediction Result
 */
function displayPredictionResult(predictedPrice, inputs) {
    // Note: Model prediction output is in Lakhs (INR)
    const priceVal = parseFloat(predictedPrice);
    
    if (isNaN(priceVal)) {
        showError("Received invalid prediction result from backend.");
        showState("empty");
        return;
    }

    // Format display for Lakhs vs Crores
    let displayPrice = "";
    let unit = "Lakhs";
    let formattedInWords = "";

    if (priceVal >= 100) {
        // >= 1 Crore (100 Lakhs)
        const inCrores = priceVal / 100;
        displayPrice = inCrores.toFixed(2);
        unit = "Crore";
        formattedInWords = `Approx. ₹ ${(priceVal * 100000).toLocaleString("en-IN")} INR`;
    } else if (priceVal < 1) {
        // < 1 Lakh (in Thousands)
        const inThousands = priceVal * 100;
        displayPrice = inThousands.toFixed(1);
        unit = "Thousand";
        formattedInWords = `Approx. ₹ ${(priceVal * 100000).toLocaleString("en-IN")} INR`;
    } else {
        displayPrice = priceVal.toFixed(2);
        unit = "Lakhs";
        formattedInWords = `Approx. ₹ ${(priceVal * 100000).toLocaleString("en-IN")} INR`;
    }

    // Price per Sq.Ft calculation
    const totalRupees = priceVal * 100000;
    const ratePerSqFt = inputs.total_sqft > 0 ? Math.round(totalRupees / inputs.total_sqft) : 0;

    // Update Result DOM
    predictedPriceEl.textContent = displayPrice;
    priceUnitEl.textContent = unit;
    priceInWordsEl.textContent = formattedInWords;
    ratePerSqftEl.textContent = `₹ ${ratePerSqFt.toLocaleString("en-IN")}`;
    summaryBhkEl.textContent = `${inputs.bhk} BHK (${inputs.bhk} Bed)`;
    summaryLocationEl.textContent = inputs.location;
    summarySqftEl.textContent = `${inputs.total_sqft.toLocaleString()} sq.ft`;
    summaryBathEl.textContent = `${inputs.bath} Bathroom${inputs.bath > 1 ? "s" : ""}`;
    resultTimestampEl.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    showState("success");
}

/**
 * Toggle Result State (empty | loading | success)
 */
function showState(state) {
    emptyState.style.display = state === "empty" ? "flex" : "none";
    loadingState.style.display = state === "loading" ? "flex" : "none";
    successState.style.display = state === "success" ? "flex" : "none";
}

/**
 * Set Button Loading State
 */
function setLoading(isLoading) {
    if (isLoading) {
        predictBtn.classList.add("btn-loading");
        predictBtn.disabled = true;
    } else {
        predictBtn.classList.remove("btn-loading");
        predictBtn.disabled = false;
    }
}

/**
 * Error Alert Handling
 */
function showError(msg) {
    errorMessage.textContent = msg;
    errorAlert.style.display = "flex";
}

function hideError() {
    errorAlert.style.display = "none";
}

// Initialize on DOM Ready
document.addEventListener("DOMContentLoaded", initApp);
