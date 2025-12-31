const sizeSelect = document.getElementById("sizeSelect");
const generateButton = document.getElementById("generateButton");
const termInput = document.getElementById("termInput");
const addTermButton = document.getElementById("addTermButton");
const presetList = document.getElementById("presetList");
const customList = document.getElementById("customList");
const bingoGrid = document.getElementById("bingoGrid");
const selectionInfo = document.getElementById("selectionInfo");

const STORAGE_KEY = "goodboybingo.customTerms";

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
  "Kaputte Schallplatte (sagt immer wieder das selbe)",
  "Geht Crashout"
];

let customTerms = loadCustomTerms();
let selectedTerms = new Set([...presetTerms]);

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
  }
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
    alert("Bitte wähle mehr Begriffe aus, damit das Bingo gefüllt werden kann.");
    return;
  }

  const chosen = availableTerms.slice(0, needed);
  bingoGrid.innerHTML = "";
  bingoGrid.style.gridTemplateColumns = `repeat(${size}, minmax(0, 1fr))`;

  chosen.forEach((term) => {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.textContent = term;
    cell.addEventListener("click", () => {
      cell.classList.toggle("selected");
    });
    bingoGrid.appendChild(cell);
  });
}

function addCustomTerm() {
  const value = termInput.value.trim();
  if (!value) {
    termInput.focus();
    return;
  }

  const allTerms = new Set([...presetTerms, ...customTerms]);
  if (allTerms.has(value)) {
    alert("Dieser Begriff existiert bereits.");
    termInput.value = "";
    return;
  }

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

renderTerms();
generateBingo();
