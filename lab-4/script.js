const STORAGE_KEY = "kanbanBoardV1";

let boardState = {
  todo: [],
  doing: [],
  done: [],
};

document.addEventListener("DOMContentLoaded", () => {
  loadBoardFromStorage();

  const columns = document.querySelectorAll(".column");


  columns.forEach((column) => {
    const columnName = column.dataset.column;
    const addBtn = column.querySelector(".btn-add-card");
    const colorColumnBtn = column.querySelector(".btn-color-column");
    const sortBtn = column.querySelector(".btn-sort-column");
    const body = column.querySelector(".column-body");


    renderColumn(columnName, column);


    addBtn.addEventListener("click", () => {
      const newCard = createCardData("Nowa karta");
      boardState[columnName].push(newCard);
      saveBoardToStorage();
      addCardElement(column, newCard);
      updateColumnCount(columnName);
    });

    colorColumnBtn.addEventListener("click", () => {
      colorWholeColumn(columnName);
    });


    sortBtn.addEventListener("click", () => {
      sortColumn(columnName);
      renderColumn(columnName, column);
    });


    body.addEventListener("click", (event) => {
      const target = event.target;
      const cardElement = target.closest(".card");
      if (!cardElement) return;

      const cardId = cardElement.dataset.id;


      if (target.classList.contains("btn-delete")) {
        deleteCard(columnName, cardId);
        cardElement.remove();
        updateColumnCount(columnName);
      }


      if (target.classList.contains("btn-move-left")) {
        moveCard(cardId, columnName, -1);
      }


      if (target.classList.contains("btn-move-right")) {
        moveCard(cardId, columnName, 1);
      }


      if (target.classList.contains("btn-color-card")) {
        const newColor = randomColor();
        cardElement.style.backgroundColor = newColor;
        updateCardColor(columnName, cardId, newColor);
      }
    });

    body.addEventListener("input", (event) => {
      const target = event.target;
      if (!target.classList.contains("card-content")) return;

      const cardElement = target.closest(".card");
      if (!cardElement) return;

      const cardId = cardElement.dataset.id;
      const newText = target.innerText.trim();
      updateCardText(columnName, cardId, newText);
    });
  });

  updateAllCounts();
});


function createCardData(initialText) {
  return {
    id: generateId(),
    text: initialText || "Nowa karta",
    color: randomColor(),
  };
}
function generateId() {
  return (
    "card-" +
    Date.now().toString(36) +
    "-" +
    Math.random().toString(36).slice(2, 8)
  );
}

function randomColor() {
  const r = 150 + Math.floor(Math.random() * 100);
  const g = 150 + Math.floor(Math.random() * 100);
  const b = 150 + Math.floor(Math.random() * 100);
  return `rgb(${r}, ${g}, ${b})`;
}

function saveBoardToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(boardState));
}

function loadBoardFromStorage() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;

  try {
    const parsed = JSON.parse(raw);

    if (parsed.todo && parsed.doing && parsed.done) {
      boardState = parsed;
    }
  } catch (e) {
    console.error("Błąd parsowania danych Kanban z localStorage:", e);
  }
}


function renderColumn(columnName, columnElement) {
  const body = columnElement.querySelector(".column-body");
  body.innerHTML = "";

  const cards = boardState[columnName];
  cards.forEach((cardData) => {
    addCardElement(columnElement, cardData);
  });

  updateColumnCount(columnName);
}

function addCardElement(columnElement, cardData) {
  const columnName = columnElement.dataset.column;
  const body = columnElement.querySelector(".column-body");

  const card = document.createElement("div");
  card.className = "card";
  card.dataset.id = cardData.id;
  card.style.backgroundColor = cardData.color;

  const content = document.createElement("div");
  content.className = "card-content";
  content.contentEditable = "true";
  content.innerText = cardData.text || "";

  const toolbar = document.createElement("div");
  toolbar.className = "card-toolbar";

  const btnLeft = document.createElement("button");
  btnLeft.className = "card-btn btn-move-left";
  btnLeft.textContent = "←";

  const btnRight = document.createElement("button");
  btnRight.className = "card-btn btn-move-right";
  btnRight.textContent = "→";

  const btnColor = document.createElement("button");
  btnColor.className = "card-btn btn-color-card";
  btnColor.textContent = "🎨";

  const btnDelete = document.createElement("button");
  btnDelete.className = "card-btn btn-delete";
  btnDelete.textContent = "x";

  toolbar.appendChild(btnLeft);
  toolbar.appendChild(btnRight);
  toolbar.appendChild(btnColor);
  toolbar.appendChild(btnDelete);

  card.appendChild(content);
  card.appendChild(toolbar);

  body.appendChild(card);

  updateMoveButtonsState(card, columnName);
}


function deleteCard(columnName, cardId) {
  boardState[columnName] = boardState[columnName].filter(
    (card) => card.id !== cardId
  );
  saveBoardToStorage();
}

function moveCard(cardId, fromColumnName, direction) {
  const order = ["todo", "doing", "done"];
  const fromIndex = order.indexOf(fromColumnName);
  const toIndex = fromIndex + direction;

  if (toIndex < 0 || toIndex >= order.length) {
    return;
  }

  const toColumnName = order[toIndex];

  const cardIndex = boardState[fromColumnName].findIndex(
    (card) => card.id === cardId
  );
  if (cardIndex === -1) return;

  const [card] = boardState[fromColumnName].splice(cardIndex, 1);
  boardState[toColumnName].push(card);
  saveBoardToStorage();


  const fromColumnElement = document.querySelector(
    `.column[data-column="${fromColumnName}"]`
  );
  const toColumnElement = document.querySelector(
    `.column[data-column="${toColumnName}"]`
  );

  renderColumn(fromColumnName, fromColumnElement);
  renderColumn(toColumnName, toColumnElement);
}

function updateCardColor(columnName, cardId, newColor) {
  const card = boardState[columnName].find((c) => c.id === cardId);
  if (!card) return;
  card.color = newColor;
  saveBoardToStorage();
}

function updateCardText(columnName, cardId, newText) {
  const card = boardState[columnName].find((c) => c.id === cardId);
  if (!card) return;
  card.text = newText;
  saveBoardToStorage();
}


function colorWholeColumn(columnName) {
  const cards = boardState[columnName];
  cards.forEach((card) => {
    card.color = randomColor();
  });
  saveBoardToStorage();

  const columnElement = document.querySelector(
    `.column[data-column="${columnName}"]`
  );
  renderColumn(columnName, columnElement);
}

function updateColumnCount(columnName) {
  const columnElement = document.querySelector(
    `.column[data-column="${columnName}"]`
  );
  const countSpan = columnElement.querySelector(".column-count");
  const count = boardState[columnName].length;
  countSpan.textContent = count;
}

function updateAllCounts() {
  ["todo", "doing", "done"].forEach(updateColumnCount);
}

function sortColumn(columnName) {
  boardState[columnName].sort((a, b) => {
    const textA = (a.text || "").toLowerCase();
    const textB = (b.text || "").toLowerCase();
    if (textA < textB) return -1;
    if (textA > textB) return 1;
    return 0;
  });
  saveBoardToStorage();
}


function updateMoveButtonsState(cardElement, columnName) {
  const btnLeft = cardElement.querySelector(".btn-move-left");
  const btnRight = cardElement.querySelector(".btn-move-right");

  const order = ["todo", "doing", "done"];
  const index = order.indexOf(columnName);

  if (index === 0) {
    btnLeft.classList.add("btn-move-disabled");
  } else {
    btnLeft.classList.remove("btn-move-disabled");
  }

  if (index === order.length - 1) {
    btnRight.classList.add("btn-move-disabled");
  } else {
    btnRight.classList.remove("btn-move-disabled");
  }
}
