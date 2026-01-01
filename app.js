const sizeSelect = document.getElementById("sizeSelect");
const generateButton = document.getElementById("generateButton");
const termInput = document.getElementById("termInput");
const addTermButton = document.getElementById("addTermButton");
const presetList = document.getElementById("presetList");
const customList = document.getElementById("customList");
const bingoGrid = document.getElementById("bingoGrid");
const selectionInfo = document.getElementById("selectionInfo");
const generateMessage = document.getElementById("generateMessage");
const termMessage = document.getElementById("termMessage");
const bingoMessage = document.getElementById("bingoMessage");
const screenshotName = document.getElementById("screenshotName");
const saveScreenshotButton = document.getElementById("saveScreenshotButton");
const reviewScreenshotsButton = document.getElementById("reviewScreenshotsButton");
const screenshotMessage = document.getElementById("screenshotMessage");
const bingoPopup = document.getElementById("bingoPopup");
const reviewModal = document.getElementById("reviewModal");
const reviewList = document.getElementById("reviewList");
const closeReviewButton = document.getElementById("closeReviewButton");
const imageModal = document.getElementById("imageModal");
const imageModalPreview = document.getElementById("imageModalPreview");
const closeImageButton = document.getElementById("closeImageButton");

const STORAGE_KEY = "goodboybingo.customTerms";
const STORAGE_KEY_SAVED = "goodboybingo.savedCards";

const presetTerms = [
  "Stottern",
  "Chinese",
  "Digga",
  "Hurensohn",
  "geht auf Tote",
  "Tatsächlich",
  "Weiß nicht was das Wort bedeutet",
  "Kein B2",
  "Renter/Alt",
  "Was spielst du da für ein Kinderspiel",
  "Fettsack",
  "Hör auf zu Vapen",
  "Bist du Schwul",
  "Gay",
  "Sexismus",
  "Ragebait",
  "25?",
  "Voicechanger",
  "Mic in Mund",
  "Dumme Fragen",
  "Ich piss dein Gehalt",
  "was das für ein kack spiel",
  "N Bombe",
  "Pumkin Monkey",
  "du drecks Deutscher",
  "Ich Küss doch dein Herz",
  "In Rp oder Tiktok Sportlich",
  "Geht Crashout",
  "afd wähler",
  "Berro mental",
  "discord mod",
  "kleinen schwanz",
  "double time",
  "Brainrot",
  "femboy",
  "du bist nicht tuff bro",
  "Deine Mutter",
  "Bruder spam"
];

let customTerms = loadCustomTerms();
let selectedTerms = new Set([...presetTerms]);
let bingoAnnounced = false;
let rowAnnounced = false;
let fullAnnounced = false;
let savedCards = loadSavedCards();
const filteredCustomTerms = customTerms.filter((term) => !presetTerms.includes(term));
if (filteredCustomTerms.length !== customTerms.length) {
  customTerms = filteredCustomTerms;
  saveCustomTerms();
}

function loadCustomTerms() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function loadSavedCards() {
  const raw = localStorage.getItem(STORAGE_KEY_SAVED);
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function saveSavedCards() {
  localStorage.setItem(STORAGE_KEY_SAVED, JSON.stringify(savedCards));
}

function saveCustomTerms() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(customTerms));
}

function renderTerms() {
  presetList.innerHTML = "";
  customList.innerHTML = "";

  presetTerms.forEach((term) => {
    const item = createTermItem(term, false);
    presetList.appendChild(item);
  });

  if (customTerms.length === 0) {
    const empty = document.createElement("li");
    empty.className = "term-item";
    empty.textContent = "Noch keine eigenen Begriffe hinzugefügt.";
    customList.appendChild(empty);
  } else {
    customTerms.forEach((term) => {
      const item = createTermItem(term, true);
      customList.appendChild(item);
    });
  }

  updateSelectionInfo();
}

function createTermItem(term, isCustom) {
  const item = document.createElement("li");
  item.className = "term-item";

  const label = document.createElement("label");
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = selectedTerms.has(term);
  checkbox.addEventListener("change", () => {
    if (checkbox.checked) {
      selectedTerms.add(term);
    } else {
      selectedTerms.delete(term);
    }
    updateSelectionInfo();
  });

  const text = document.createElement("span");
  text.textContent = term;

  label.appendChild(checkbox);
  label.appendChild(text);

  item.appendChild(label);

  if (isCustom) {
    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.textContent = "Entfernen";
    removeButton.addEventListener("click", () => {
      customTerms = customTerms.filter((entry) => entry !== term);
      selectedTerms.delete(term);
      saveCustomTerms();
      renderTerms();
    });
    item.appendChild(removeButton);
  }

  return item;
}

function updateSelectionInfo() {
  const needed = Number(sizeSelect.value) ** 2;
  const available = selectedTerms.size;
  selectionInfo.textContent = `Ausgewählt: ${available} Begriffe • Benötigt: ${needed}`;
  if (available < needed) {
    selectionInfo.classList.add("warning");
  } else {
    selectionInfo.classList.remove("warning");
    setMessage(generateMessage, "");
  }
}

function setMessage(element, text, type = "") {
  element.textContent = text;
  element.classList.toggle("error", type === "error");
}

function showPopup(type, size) {
  if (!bingoPopup) {
    return;
  }
  const message =
    type === "full"
      ? `VOLLES BINGO! (${size}×${size})`
      : "Reihe komplett!";
  bingoPopup.textContent = message;
  bingoPopup.classList.remove("row", "full", "show");
  void bingoPopup.offsetWidth;
  bingoPopup.classList.add("show", type);
}

function shuffle(array) {
  const copy = [...array];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function generateBingo() {
  const size = Number(sizeSelect.value);
  const needed = size * size;
  const availableTerms = shuffle([...selectedTerms]);

  if (availableTerms.length < needed) {
    setMessage(
      generateMessage,
      "Bitte wähle mehr Begriffe aus, damit das Bingo gefüllt werden kann.",
      "error"
    );
    return;
  }

  setMessage(generateMessage, "");
  const chosen = availableTerms.slice(0, needed);
  bingoGrid.innerHTML = "";
  bingoGrid.classList.remove("bingo-complete");
  bingoAnnounced = false;
  rowAnnounced = false;
  fullAnnounced = false;
  setMessage(bingoMessage, "");
  bingoGrid.style.gridTemplateColumns = `repeat(${size}, minmax(0, 1fr))`;

  chosen.forEach((term) => {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.textContent = term;
    cell.addEventListener("click", () => {
      cell.classList.toggle("selected");
      evaluateBingo(size);
    });
    bingoGrid.appendChild(cell);
  });
}

function evaluateBingo(size) {
  const cells = [...bingoGrid.querySelectorAll(".cell")];
  const isSelected = (index) => cells[index]?.classList.contains("selected");
  const selectedCount = cells.filter((cell) => cell.classList.contains("selected")).length;
  const hasFullCard = selectedCount === size * size;

  const hasRow = (row) =>
    Array.from({ length: size }, (_, col) => isSelected(row * size + col)).every(
      Boolean
    );
  const hasCol = (col) =>
    Array.from({ length: size }, (_, row) => isSelected(row * size + col)).every(
      Boolean
    );

  const hasDiag =
    Array.from({ length: size }, (_, index) => isSelected(index * size + index)).every(
      Boolean
    ) ||
    Array.from({ length: size }, (_, index) =>
      isSelected(index * size + (size - 1 - index))
    ).every(Boolean);

  const hasBingo =
    Array.from({ length: size }, (_, row) => hasRow(row)).some(Boolean) ||
    Array.from({ length: size }, (_, col) => hasCol(col)).some(Boolean) ||
    hasDiag;

  if (hasFullCard) {
    setMessage(bingoMessage, "");
    bingoGrid.classList.remove("bingo-complete");
    void bingoGrid.offsetWidth;
    bingoGrid.classList.add("bingo-complete");
    if (!fullAnnounced) {
      showPopup("full", size);
      fullAnnounced = true;
    }
    rowAnnounced = true;
    bingoAnnounced = true;
    return;
  }

  if (hasBingo) {
    fullAnnounced = false;
    setMessage(bingoMessage, "");
    if (!rowAnnounced) {
      showPopup("row", size);
      rowAnnounced = true;
    }
    bingoAnnounced = true;
  } else {
    bingoAnnounced = false;
    rowAnnounced = false;
    fullAnnounced = false;
    setMessage(bingoMessage, "");
    bingoGrid.classList.remove("bingo-complete");
  }
}

function addCustomTerm() {
  const value = termInput.value.trim();
  if (!value) {
    termInput.focus();
    return;
  }

  const allTerms = new Set([...presetTerms, ...customTerms]);
  if (allTerms.has(value)) {
    setMessage(termMessage, "Dieser Begriff existiert bereits.", "error");
    termInput.focus();
    termInput.select();
    return;
  }

  setMessage(termMessage, "");
  customTerms = [value, ...customTerms];
  selectedTerms.add(value);
  saveCustomTerms();
  termInput.value = "";
  renderTerms();
}

sizeSelect.addEventListener("change", updateSelectionInfo);
addTermButton.addEventListener("click", addCustomTerm);
termInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    addCustomTerm();
  }
});

generateButton.addEventListener("click", generateBingo);

function openReviewModal() {
  reviewModal.classList.add("open");
  reviewModal.setAttribute("aria-hidden", "false");
  renderReviewList();
}

function closeReviewModal() {
  reviewModal.classList.remove("open");
  reviewModal.setAttribute("aria-hidden", "true");
}

function openImageModal(card) {
  imageModalPreview.src = card.image;
  imageModalPreview.alt = `Große Ansicht von ${card.name}`;
  imageModal.classList.add("open");
  imageModal.setAttribute("aria-hidden", "false");
}

function closeImageModal() {
  imageModal.classList.remove("open");
  imageModal.setAttribute("aria-hidden", "true");
  imageModalPreview.src = "";
  imageModalPreview.alt = "";
}

function renderReviewList() {
  reviewList.innerHTML = "";
  if (savedCards.length === 0) {
    const empty = document.createElement("p");
    empty.className = "info";
    empty.textContent = "Noch keine Bingokarten gespeichert.";
    reviewList.appendChild(empty);
    return;
  }

  savedCards.forEach((card) => {
    const cardElement = document.createElement("div");
    cardElement.className = "review-card";

    const title = document.createElement("strong");
    title.textContent = card.name;

    const meta = document.createElement("small");
    meta.textContent = `${card.size}×${card.size} • ${card.savedAt}`;

    const imageButton = document.createElement("button");
    imageButton.type = "button";
    imageButton.className = "image-button";
    imageButton.addEventListener("click", () => openImageModal(card));

    const img = document.createElement("img");
    img.alt = `Bingokarte ${card.name}`;
    img.src = card.image;

    cardElement.appendChild(title);
    cardElement.appendChild(meta);
    imageButton.appendChild(img);
    cardElement.appendChild(imageButton);
    reviewList.appendChild(cardElement);
  });
}

function saveScreenshot() {
  const name = screenshotName.value.trim();
  if (!name) {
    setMessage(screenshotMessage, "Bitte gib einen Namen für die Karte an.", "error");
    screenshotName.focus();
    return;
  }

  if (bingoGrid.children.length === 0) {
    setMessage(screenshotMessage, "Bitte erstelle zuerst ein Bingo.", "error");
    return;
  }

  if (typeof window.html2canvas !== "function") {
    setMessage(
      screenshotMessage,
      "Screenshot-Funktion ist gerade nicht verfügbar.",
      "error"
    );
    return;
  }

  setMessage(screenshotMessage, "Screenshot wird erstellt...");
  window
    .html2canvas(bingoGrid, { backgroundColor: null, scale: 2 })
    .then((canvas) => {
      const dataUrl = canvas.toDataURL("image/png");
      const size = Number(sizeSelect.value);
      const savedAt = new Date().toLocaleString("de-DE");
      savedCards = [
        {
          id: crypto.randomUUID(),
          name,
          size,
          savedAt,
          image: dataUrl
        },
        ...savedCards
      ];
      saveSavedCards();
      renderReviewList();
      setMessage(screenshotMessage, "Bingokarte gespeichert!");
      screenshotName.value = "";
    })
    .catch(() => {
      setMessage(
        screenshotMessage,
        "Screenshot konnte nicht erstellt werden.",
        "error"
      );
    });
}

saveScreenshotButton.addEventListener("click", saveScreenshot);
reviewScreenshotsButton.addEventListener("click", openReviewModal);
closeReviewButton.addEventListener("click", closeReviewModal);
reviewModal.addEventListener("click", (event) => {
  if (event.target === reviewModal) {
    closeReviewModal();
  }
});
closeImageButton.addEventListener("click", closeImageModal);
imageModal.addEventListener("click", (event) => {
  if (event.target === imageModal) {
    closeImageModal();
  }
});

renderTerms();
generateBingo();
renderReviewList();
