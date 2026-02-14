// ============ УПРАВЛЕНИЕ ДАННЫМИ ============
let characters = [];
let currentIndex = 0;
let editMode = false;
let editingIndex = null;

// Загрузка данных из localStorage
function loadCharacters() {
    const saved = localStorage.getItem('characters');
    if (saved) {
        characters = JSON.parse(saved);
    } else {
        // Дефолтные персонажи при первом запуске
        characters = [
            {
                name: 'ПРИМЕР ПЕРСОНАЖА',
                description: 'Кликни "Редактировать" в правом верхнем углу, чтобы изменить этого персонажа или добавить своих!',
                age: '???',
                role: 'Пример',
                image: 'data:image/svg+xml,%3Csvg width="450" height="600" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="450" height="600" fill="%232a2a2e"/%3E%3Ctext x="50%25" y="50%25" fill="%23ff6b9d" font-size="24" font-family="Arial" text-anchor="middle"%3EТвоё фото%3C/text%3E%3C/svg%3E'
            }
        ];
        saveCharacters();
    }
}

// Сохранение данных
function saveCharacters() {
    localStorage.setItem('characters', JSON.stringify(characters));
}

// ============ РЕНДЕРИНГ КАРТОЧЕК ============
function renderCards() {
    const container = document.getElementById('card-stack');
    container.innerHTML = '';

    if (characters.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: #b0b0b0; padding: 50px;">Нет персонажей. Добавь первого!</div>';
        document.getElementById('total').textContent = '0';
        return;
    }

    characters.forEach((char, index) => {
        const card = createCardElement(char, index);
        container.appendChild(card);
    });

    updateCardPositions();
    updateCounter();
}

function createCardElement(char, index) {
    const card = document.createElement('div');
    card.className = 'character-card';
    card.dataset.index = index;

    card.innerHTML = `
        <button class="edit-card-btn" onclick="openEditModal(${index})">✎</button>
        <div class="card-image">
            <img src="${char.image}" alt="${char.name}">
        </div>
        <div class="card-overlay">
            <div class="card-content">
                <h2 class="card-title">${char.name}</h2>
                <div class="divider"></div>
                <p class="card-description">${char.description}</p>
                <div class="card-stats">
                    <span class="stat">ВОЗРАСТ: ${char.age}</span>
                    <span class="stat">РОЛЬ: ${char.role}</span>
                </div>
                <button class="download-btn" onclick="downloadImage(${index})">
                    <span>↓</span> СКАЧАТЬ
                </button>
            </div>
        </div>
    `;

    return card;
}

function updateCardPositions() {
    const cards = document.querySelectorAll('.character-card');
    cards.forEach((card, index) => {
        card.classList.remove('exit-left', 'exit-right');
        const position = (index - currentIndex + characters.length) % characters.length;
        card.dataset.position = Math.min(position, 2);
    });
}

function updateCounter() {
    document.getElementById('current').textContent = characters.length > 0 ? currentIndex + 1 : 0;
    document.getElementById('total').textContent = characters.length;
}

// ============ НАВИГАЦИЯ ============
document.getElementById('next-btn').addEventListener('click', () => {
    if (characters.length === 0) return;

    const cards = document.querySelectorAll('.character-card');
    const currentCard = cards[currentIndex];
    if (currentCard) currentCard.classList.add('exit-left');

    setTimeout(() => {
        currentIndex = (currentIndex + 1) % characters.length;
        updateCardPositions();
        updateCounter();
    }, 300);
});

document.getElementById('prev-btn').addEventListener('click', () => {
    if (characters.length === 0) return;

    const cards = document.querySelectorAll('.character-card');
    const currentCard = cards[currentIndex];
    if (currentCard) currentCard.classList.add('exit-right');

    setTimeout(() => {
        currentIndex = (currentIndex - 1 + characters.length) % characters.length;
        updateCardPositions();
        updateCounter();
    }, 300);
});

// Свайп для мобильных
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    if (touchEndX < touchStartX - 50) {
        document.getElementById('next-btn').click();
    }
    if (touchEndX > touchStartX + 50) {
        document.getElementById('prev-btn').click();
    }
}

// ============ РЕЖИМ РЕДАКТИРОВАНИЯ ============
document.getElementById('edit-mode-btn').addEventListener('click', () => {
    editMode = !editMode;
    const btn = document.getElementById('edit-mode-btn');
    const addBtn = document.getElementById('add-card-btn');
    const container = document.getElementById('card-stack');

    if (editMode) {
        btn.classList.add('active');
        btn.textContent = '✓ ГОТОВО';
        addBtn.style.display = 'block';
        container.classList.add('edit-mode');
    } else {
        btn.classList.remove('active');
        btn.textContent = '✎ РЕДАКТИРОВАТЬ';
        addBtn.style.display = 'none';
        container.classList.remove('edit-mode');
    }
});

// ============ МОДАЛЬНОЕ ОКНО ============
const modal = document.getElementById('edit-modal');
const form = document.getElementById('edit-form');
const imageInput = document.getElementById('image-input');
const previewImage = document.getElementById('preview-image');

document.getElementById('add-card-btn').addEventListener('click', () => {
    editingIndex = null;
    openModal();
});

document.getElementById('close-modal').addEventListener('click', closeModal);
document.getElementById('cancel-btn').addEventListener('click', closeModal);

function openEditModal(index) {
    if (!editMode) return;
    editingIndex = index;
    const char = characters[index];

    document.getElementById('char-name').value = char.name;
    document.getElementById('char-description').value = char.description;
    document.getElementById('char-age').value = char.age;
    document.getElementById('char-role').value = char.role;
    previewImage.src = char.image;

    document.getElementById('delete-btn').style.display = 'block';
    openModal();
}

function openModal() {
    if (editingIndex === null) {
        form.reset();
        previewImage.src = '';
        document.getElementById('delete-btn').style.display = 'none';
    }
    modal.classList.add('active');
}

function closeModal() {
    modal.classList.remove('active');
    editingIndex = null;
}

// Загрузка изображения
imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            previewImage.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// Сохранение
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const char = {
        name: document.getElementById('char-name').value || 'БЕЗ ИМЕНИ',
        description: document.getElementById('char-description').value || 'Описание отсутствует',
        age: document.getElementById('char-age').value || '???',
        role: document.getElementById('char-role').value || 'Неизвестно',
        image: previewImage.src || 'data:image/svg+xml,%3Csvg width="450" height="600" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="450" height="600" fill="%232a2a2e"/%3E%3C/svg%3E'
    };

    if (editingIndex !== null) {
        characters[editingIndex] = char;
    } else {
        characters.push(char);
    }

    saveCharacters();
    renderCards();
    closeModal();
});

// Удаление
document.getElementById('delete-btn').addEventListener('click', () => {
    if (editingIndex !== null && confirm('Точно удалить этого персонажа?')) {
        characters.splice(editingIndex, 1);
        if (currentIndex >= characters.length && currentIndex > 0) {
            currentIndex--;
        }
        saveCharacters();
        renderCards();
        closeModal();
    }
});

// Скачивание изображения
function downloadImage(index) {
    const char = characters[index];
    const link = document.createElement('a');
    link.href = char.image;
    link.download = `${char.name.replace(/\s+/g, '_')}.png`;
    link.click();
}

// ============ АНИМАЦИЯ САКУРЫ ============
const canvas = document.getElementById('sakura-canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

class SakuraPetal {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height - canvas.height;
        this.size = Math.random() * 8 + 4;
        this.speedY = Math.random() * 1 + 0.5;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.opacity = Math.random() * 0.6 + 0.2;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 2 - 1;
        this.swingSpeed = Math.random() * 0.02 + 0.01;
        this.swingOffset = Math.random() * Math.PI * 2;
    }

    update() {
        this.y += this.speedY;
        this.x += this.speedX + Math.sin(this.y * this.swingSpeed + this.swingOffset) * 0.3;
        this.rotation += this.rotationSpeed;

        if (this.y > canvas.height) {
            this.reset();
            this.y = -20;
        }

        if (this.x > canvas.width + 20) {
            this.x = -20;
        } else if (this.x < -20) {
            this.x = canvas.width + 20;
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation * Math.PI / 180);

        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = '#ff6b9d';

        ctx.beginPath();
        ctx.ellipse(0, 0, this.size, this.size * 1.5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ff4d87';
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size * 0.5, this.size * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

const petals = [];
const petalCount = 40;

for (let i = 0; i < petalCount; i++) {
    petals.push(new SakuraPetal());
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    petals.forEach(petal => {
        petal.update();
        petal.draw();
    });

    requestAnimationFrame(animate);
}

animate();

// ============ ИНИЦИАЛИЗАЦИЯ ============
loadCharacters();
renderCards();