/**
 * BookWise - Book Recommendation System Frontend Script
 * Connects directly with FastAPI Backend (http://127.0.0.1:8000)
 */

// ==========================================================================
// Configuration & State
// ==========================================================================

const DEFAULT_API_BASE = "http://127.0.0.1:8000";
let API_BASE_URL = localStorage.getItem("bookwise_api_url") || DEFAULT_API_BASE;

let popularBooksData = [];
let allBookTitles = new Set([
  "The Da Vinci Code",
  "The Hobbit",
  "1984",
  "Animal Farm",
  "To Kill a Mockingbird",
  "The Catcher in the Rye",
  "Pride and Prejudice",
  "The Great Gatsby",
  "Angels & Demons",
  "The Fellowship of the Ring",
  "Harry Potter and the Sorcerer's Stone",
  "The Lovely Bones: A Novel",
  "The Secret Life of Bees",
  "The Red Tent (Bestselling Backlist)",
  "A Painted House",
  "Wild Animus"
]);

// DOM Elements
const searchInput = document.getElementById("book-search-input");
const clearBtn = document.getElementById("clear-search-btn");
const searchBtn = document.getElementById("search-btn");
const suggestionsList = document.getElementById("suggestions-list");
const sampleTagsContainer = document.getElementById("sample-tags");
const popularGrid = document.getElementById("popular-grid");
const recommendGrid = document.getElementById("recommend-grid");
const recommendSubtitle = document.getElementById("recommend-subtitle");
const recommendEmptyState = document.getElementById("recommend-empty-state");
const alertBanner = document.getElementById("alert-banner");
const alertMessageText = document.getElementById("alert-message-text");
const backendBadge = document.getElementById("backend-status-badge");
const backendStatusText = document.getElementById("backend-status-text");
const settingsModal = document.getElementById("settings-modal");
const apiUrlInput = document.getElementById("api-url-input");
const settingsBtn = document.getElementById("api-settings-btn");
const toastEl = document.getElementById("toast");
const toastIcon = document.getElementById("toast-icon");
const toastMsg = document.getElementById("toast-msg");

// ==========================================================================
// Initialization
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
  apiUrlInput.value = API_BASE_URL;
  renderSampleTags();
  setupEventListeners();
  checkBackendHealth();
  fetchPopularBooks();
});

// ==========================================================================
// Event Listeners
// ==========================================================================

function setupEventListeners() {
  // Input search events
  searchInput.addEventListener("input", (e) => {
    const val = e.target.value;
    if (val.length > 0) {
      clearBtn.classList.remove("hidden");
    } else {
      clearBtn.classList.add("hidden");
    }
    handleAutocomplete(val);
  });

  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      suggestionsList.classList.add("hidden");
      handleSearch();
    } else if (e.key === "Escape") {
      suggestionsList.classList.add("hidden");
    }
  });

  clearBtn.addEventListener("click", () => {
    searchInput.value = "";
    clearBtn.classList.add("hidden");
    suggestionsList.classList.add("hidden");
    searchInput.focus();
  });

  // Hide autocomplete on click outside
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".search-wrapper")) {
      suggestionsList.classList.add("hidden");
    }
  });

  // Settings modal
  settingsBtn.addEventListener("click", () => {
    settingsModal.classList.remove("hidden");
  });
}

// ==========================================================================
// Tab Switching
// ==========================================================================

function switchTab(tabName) {
  const popTab = document.getElementById("nav-popular-btn");
  const recTab = document.getElementById("nav-recommend-btn");
  const popSection = document.getElementById("popular-section");
  const recSection = document.getElementById("recommend-section");

  if (tabName === "popular") {
    popTab.classList.add("active");
    recTab.classList.remove("active");
    popSection.classList.add("active");
    recSection.classList.remove("active");
  } else {
    recTab.classList.add("active");
    popTab.classList.remove("active");
    recSection.classList.add("active");
    popSection.classList.remove("active");
  }
}

// ==========================================================================
// Backend Health Check
// ==========================================================================

async function checkBackendHealth() {
  setBackendStatus("checking", "Connecting...");
  try {
    const res = await fetch(`${API_BASE_URL}/`, { method: "GET" });
    if (res.ok) {
      setBackendStatus("connected", "Connected");
      return true;
    } else {
      setBackendStatus("disconnected", "Offline");
      return false;
    }
  } catch (err) {
    setBackendStatus("disconnected", "Offline");
    return false;
  }
}

function setBackendStatus(state, text) {
  backendBadge.className = `status-badge ${state}`;
  backendStatusText.textContent = text;
}

// ==========================================================================
// Fetch Popular Books (Top 50)
// ==========================================================================

async function fetchPopularBooks() {
  renderSkeletons(popularGrid, 12);

  try {
    const response = await fetch(`${API_BASE_URL}/popular`);
    
    if (!response.ok) {
      throw new Error(`Failed to load popular books (Status: ${response.status})`);
    }

    const data = await response.json();
    popularBooksData = data.books || [];

    // Cache titles for autocomplete
    popularBooksData.forEach((b) => {
      if (b.book_title) allBookTitles.add(b.book_title);
    });

    renderSampleTags();
    renderPopularBooks(popularBooksData);
    setBackendStatus("connected", "Connected");
  } catch (error) {
    console.error("Error fetching popular books:", error);
    renderErrorMessage(
      popularGrid,
      "Could not load popular books.",
      `Ensure the FastAPI backend is running at ${API_BASE_URL}. Click the gear icon to change backend URL.`
    );
    showAlert(
      `Unable to connect to backend at ${API_BASE_URL}. Make sure your FastAPI server is started.`
    );
  }
}

function renderPopularBooks(books) {
  if (!books || books.length === 0) {
    popularGrid.innerHTML = `<div class="empty-state"><h3>No books found</h3></div>`;
    return;
  }

  popularGrid.innerHTML = books
    .map((book, idx) => createBookCardHTML(book, idx + 1, false))
    .join("");
}

function filterPopularBooks(query) {
  const filtered = popularBooksData.filter((b) => {
    const title = (b.book_title || "").toLowerCase();
    const author = (b.book_author || "").toLowerCase();
    const q = query.toLowerCase();
    return title.includes(q) || author.includes(q);
  });
  renderPopularBooks(filtered);
}

// ==========================================================================
// Search & Recommend Books
// ==========================================================================

async function handleSearch() {
  const query = searchInput.value.trim();
  if (!query) {
    showToast("Please type a book name to search!", "warning");
    searchInput.focus();
    return;
  }

  await recommendBook(query);
}

async function recommendBook(bookTitle) {
  hideAlert();
  searchInput.value = bookTitle;
  clearBtn.classList.remove("hidden");
  suggestionsList.classList.add("hidden");

  // Switch to recommend tab and scroll
  switchTab("recommend");
  recommendEmptyState.classList.add("hidden");
  recommendSubtitle.innerHTML = `Showing top 5 similar recommendations for <strong>"${escapeHTML(bookTitle)}"</strong>`;

  renderSkeletons(recommendGrid, 5);

  try {
    const endpoint = `${API_BASE_URL}/recommend/${encodeURIComponent(bookTitle)}`;
    const response = await fetch(endpoint);

    if (!response.ok) {
      if (response.status === 404) {
        const errorData = await response.json().catch(() => ({}));
        const detail = errorData.detail || `Book "${bookTitle}" was not found in the dataset.`;
        throw new Error(detail);
      } else {
        throw new Error(`Server returned error status ${response.status}`);
      }
    }

    const data = await response.json();
    const recommendations = data.recommendations || [];

    if (recommendations.length === 0) {
      recommendGrid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-icon"><i class="fa-solid fa-face-frown"></i></div>
          <h3>No recommendations found</h3>
          <p>We couldn't find enough similarity data for "${escapeHTML(bookTitle)}". Try searching another classic title.</p>
        </div>
      `;
      return;
    }

    recommendGrid.innerHTML = recommendations
      .map((book) => createBookCardHTML(book, null, true))
      .join("");

    showToast(`Found ${recommendations.length} recommendations for "${bookTitle}"`, "success");
    
    // Smooth scroll to recommendation section
    document.getElementById("recommend-section").scrollIntoView({ behavior: "smooth", block: "start" });

  } catch (error) {
    console.error("Recommendation error:", error);
    recommendGrid.innerHTML = "";
    recommendEmptyState.classList.remove("hidden");
    showAlert(
      `<strong>Recommendation Note:</strong> ${error.message} <br/>Tip: Try searching one of the popular books below or sample classics!`
    );
  }
}

function searchSampleBook(title) {
  searchInput.value = title;
  handleSearch();
}

// ==========================================================================
// Card HTML Builder & Fallbacks
// ==========================================================================

function createBookCardHTML(book, rank, isRecommendation) {
  const title = book.book_title || "Unknown Title";
  const author = book.book_author || "Unknown Author";
  let imgUrl = book.image_url || "";

  // Upgrade http image URLs to https where possible for mixed-content safety
  if (imgUrl.startsWith("http://images.amazon.com")) {
    imgUrl = imgUrl.replace("http://", "https://");
  }

  const escapedTitle = escapeHTML(title);
  const escapedAuthor = escapeHTML(author);

  const rankBadge = rank
    ? `<div class="card-badge"><i class="fa-solid fa-trophy"></i> #${rank}</div>`
    : "";

  let scoreBadge = "";
  if (isRecommendation && book.similarity_score !== undefined) {
    const percentage = Math.round(book.similarity_score * 100);
    scoreBadge = `<div class="score-badge" title="Reader Similarity Match Score"><i class="fa-solid fa-chart-simple"></i> ${percentage}% Match</div>`;
  }

  // Fallback visual cover with gradient and icon if image fails
  const fallbackSvg = `
    <div class="book-cover-fallback">
      <i class="fa-solid fa-book"></i>
      <span class="fallback-title">${escapedTitle}</span>
    </div>
  `;

  return `
    <div class="book-card">
      <div class="book-cover-wrapper">
        ${rankBadge}
        ${scoreBadge}
        <img
          class="book-cover-img"
          src="${imgUrl}"
          alt="${escapedTitle}"
          loading="lazy"
          onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
        />
        <div class="book-cover-fallback" style="display: none;">
          <i class="fa-solid fa-book"></i>
          <span class="fallback-title">${escapedTitle}</span>
        </div>
      </div>
      <div class="book-details">
        <div>
          <h3 class="book-title" title="${escapedTitle}">${escapedTitle}</h3>
          <div class="book-author">
            <i class="fa-solid fa-user-pen"></i>
            <span>${escapedAuthor}</span>
          </div>
        </div>
        <button
          class="card-action-btn"
          onclick="recommendBook('${escapeJSString(title)}')"
          title="Find similar books to this"
        >
          <i class="fa-solid fa-wand-magic-sparkles"></i> Recommend Similar
        </button>
      </div>
    </div>
  `;
}

// ==========================================================================
// Autocomplete & Sample Tags
// ==========================================================================

function handleAutocomplete(query) {
  if (!query || query.length < 2) {
    suggestionsList.classList.add("hidden");
    return;
  }

  const q = query.toLowerCase();
  const matches = Array.from(allBookTitles)
    .filter((title) => title.toLowerCase().includes(q))
    .slice(0, 6);

  if (matches.length === 0) {
    suggestionsList.classList.add("hidden");
    return;
  }

  suggestionsList.innerHTML = matches
    .map(
      (title) => `
      <li class="suggestion-item" onclick="selectSuggestion('${escapeJSString(title)}')">
        <i class="fa-solid fa-book-bookmark"></i>
        <span>${escapeHTML(title)}</span>
      </li>
    `
    )
    .join("");

  suggestionsList.classList.remove("hidden");
}

function selectSuggestion(title) {
  searchInput.value = title;
  suggestionsList.classList.add("hidden");
  clearBtn.classList.remove("hidden");
  handleSearch();
}

function renderSampleTags() {
  const sampleBooks = [
    "The Da Vinci Code",
    "The Hobbit",
    "1984",
    "Pride and Prejudice",
    "The Lovely Bones: A Novel",
    "Animal Farm",
    "To Kill a Mockingbird"
  ];

  sampleTagsContainer.innerHTML = sampleBooks
    .map(
      (b) => `
      <button class="book-tag" onclick="searchSampleBook('${escapeJSString(b)}')">
        ${escapeHTML(b)}
      </button>
    `
    )
    .join("");
}

// ==========================================================================
// Skeletons & Error UI Helpers
// ==========================================================================

function renderSkeletons(container, count = 8) {
  container.innerHTML = Array(count)
    .fill(0)
    .map(
      () => `
      <div class="skeleton-card">
        <div class="skeleton-img"></div>
        <div class="skeleton-body">
          <div class="skeleton-line w-80"></div>
          <div class="skeleton-line w-50"></div>
          <div class="skeleton-line btn"></div>
        </div>
      </div>
    `
    )
    .join("");
}

function renderErrorMessage(container, title, msg) {
  container.innerHTML = `
    <div class="empty-state" style="grid-column: 1 / -1;">
      <div class="empty-icon" style="color: var(--danger); background: rgba(239, 68, 68, 0.15);">
        <i class="fa-solid fa-triangle-exclamation"></i>
      </div>
      <h3>${title}</h3>
      <p>${msg}</p>
      <button class="btn-primary" onclick="fetchPopularBooks()">
        <i class="fa-solid fa-rotate-right"></i> Retry Connection
      </button>
    </div>
  `;
}

function showAlert(msg) {
  alertMessageText.innerHTML = msg;
  alertBanner.classList.remove("hidden");
}

function hideAlert() {
  alertBanner.classList.add("hidden");
}

function showToast(msg, type = "info") {
  toastMsg.textContent = msg;
  if (type === "success") {
    toastIcon.innerHTML = `<i class="fa-solid fa-circle-check" style="color: var(--success);"></i>`;
  } else if (type === "warning") {
    toastIcon.innerHTML = `<i class="fa-solid fa-circle-exclamation" style="color: var(--warning);"></i>`;
  } else {
    toastIcon.innerHTML = `<i class="fa-solid fa-circle-info" style="color: var(--primary);"></i>`;
  }

  toastEl.classList.remove("hidden");
  setTimeout(() => {
    toastEl.classList.add("hidden");
  }, 4000);
}

// ==========================================================================
// Settings Modal
// ==========================================================================

function closeSettingsModal() {
  settingsModal.classList.add("hidden");
}

async function saveApiUrl() {
  let val = apiUrlInput.value.trim();
  if (!val) {
    val = DEFAULT_API_BASE;
  }
  // Remove trailing slash
  val = val.replace(/\/+$/, "");

  API_BASE_URL = val;
  localStorage.setItem("bookwise_api_url", API_BASE_URL);
  closeSettingsModal();
  showToast(`Updated Backend URL: ${API_BASE_URL}`, "success");

  const healthy = await checkBackendHealth();
  if (healthy) {
    fetchPopularBooks();
  }
}

// ==========================================================================
// Utilities
// ==========================================================================

function escapeHTML(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeJSString(str) {
  if (!str) return "";
  return String(str).replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/"/g, '\\"');
}
