// ============ УПРАВЛЕНИЕ ДАННЫМИ ============
let characters = [];
let currentIndex = 0;
let editMode = false;
let editingIndex = null;

// Загрузка данных
function loadCharacters() {
    const saved = localStorage.getItem('characters');
    if (saved) {
        characters = JSON.parse(saved);
    } else {
        characters = [
            {
                name: 'ТВОЙ ПЕРВЫЙ ПЕРСОНАЖ',
                description: 'Наведи курсор на карточку, чтобы увидеть информацию! Нажми "РЕДАКТИРОВАТЬ" в правом верхнем углу, чтобы изменить этого персонажа или добавить новых.',
                age: '???',
                role: 'Начало',
                image: 'data:image/svg+xml,%3Csvg width="400" height="580" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3ClinearGradient id="grad" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%231a1a1d;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%232a2a2e;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="400" height="580" fill="url(%23grad)"/%3E%3Ctext x="50%25" y="45%25" fill="%23ff6b9d" font-size="24" font-family="Arial" text-anchor="middle" opacity="0.8"%3EТВОЁ ФОТО%3C/text%3E%3Ctext x="50%25" y="55%25" fill="%23b0b0b0" font-size="14" font-family="Arial" text-anchor="middle" opacity="0.6"%3EНажми "Редактировать"%3C/text%3E%3C/svg%3E'
            }
        ];
        saveCharacters();
    }
}

function saveCharacters() {
    localStorage.setItem('characters', JSON.stringify(characters));
}

// Декорации
function loadDecorations() {
    const leftDecor = localStorage.getItem('leftDecoration');
    const rightDecor = localStorage.getItem('rightDecoration');

    if (leftDecor) {
        document.getElementById('left-decor-img').src = leftDecor;
        document.getElementById('left-decor-img').style.display = 'block';
    }

    if (rightDecor) {
        document.getElementById('right-decor-img').src = rightDecor;
        document.getElementById('right-decor-img').style.display = 'block';
    }
}

function saveDecoration(side, dataUrl) {
    localStorage.setItem(side + 'Decoration', dataUrl);
}

// ============ РЕНДЕРИНГ ============
function renderCards() {
    const container = document.getElementById('card-stack');
    container.innerHTML = '';

    if (characters.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; color: #b0b0b0; padding: 80px 20px; font-size: 1.2rem;">
                <div style="color: #ff6b9d; font-size: 3rem; margin-bottom: 20px;">✨</div>
                <div style="font-family: 'Russo One', sans-serif; letter-spacing: 2px; margin-bottom: 10px;">ГАЛЕРЕЯ ПУСТА</div>
                <div style="font-size: 1rem;">Нажми "Редактировать" и добавь первого персонажа!</div>
            </div>
        `;
        updateStats();
        return;
    }

    characters.forEach((char, index) => {
        const card = createCardElement(char, index);
        container.appendChild(card);
    });

    updateCardPositions();
    updateCounter();
    updateStats();
    renderThumbnails();
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
                <div class="card-buttons">
                    <button class="download-btn" onclick="downloadImage(${index})">
                        <span>⬇</span>ФОТО
                    </button>
                    <button class="copy-btn" onclick="copyCharacter(${index})">
                        <span>📋</span>КОПИРОВАТЬ
                    </button>
                </div>
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

// ============ СТАТИСТИКА ============
function updateStats() {
    document.getElementById('total-chars').textContent = characters.length;

    if (characters.length > 0) {
        const current = characters[currentIndex];
        document.getElementById('current-role').textContent = current.role || '—';
        document.getElementById('current-age').textContent = current.age || '—';
    } else {
        document.getElementById('current-role').textContent = '—';
        document.getElementById('current-age').textContent = '—';
    }
}

// ============ МИНИАТЮРЫ ============
function renderThumbnails() {
    const leftContainer = document.getElementById('left-thumbnails');
    const rightContainer = document.getElementById('right-thumbnails');

    leftContainer.innerHTML = '';
    rightContainer.innerHTML = '';

    if (characters.length <= 1) return;

    // Левые миниатюры (предыдущие 3)
    for (let i = 1; i <= 3; i++) {
        const index = (currentIndex - i + characters.length) % characters.length;
        if (index !== currentIndex) {
            leftContainer.appendChild(createThumbnail(characters[index], index));
        }
    }

    // Правые миниатюры (следующие 3)
    for (let i = 1; i <= 3; i++) {
        const index = (currentIndex + i) % characters.length;
        if (index !== currentIndex) {
            rightContainer.appendChild(createThumbnail(characters[index], index));
        }
    }
}

function createThumbnail(char, index) {
    const thumb = document.createElement('div');
    thumb.className = 'thumbnail';
    thumb.onclick = () => jumpToCharacter(index);

    thumb.innerHTML = `
        <img src="${char.image}" alt="${char.name}">
        <div class="thumbnail-name">${char.name}</div>
    `;

    return thumb;
}

function jumpToCharacter(index) {
    if (index === currentIndex) return;

    const cards = document.querySelectorAll('.character-card');
    const currentCard = cards[currentIndex];

    // Анимация выхода
    if (index > currentIndex || (currentIndex === characters.length - 1 && index === 0)) {
        if (currentCard) currentCard.classList.add('exit-left');
    } else {
        if (currentCard) currentCard.classList.add('exit-right');
    }

    setTimeout(() => {
        currentIndex = index;
        updateCardPositions();
        updateCounter();
        updateStats();
        renderThumbnails();
    }, 300);
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
        updateStats();
        renderThumbnails();
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
        updateStats();
        renderThumbnails();
    }, 300);
});

// Свайп
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

// ============ ДЕКОРАЦИИ ============
document.getElementById('edit-left-decor').addEventListener('click', () => {
    document.getElementById('left-decor-input').click();
});

document.getElementById('edit-right-decor').addEventListener('click', () => {
    document.getElementById('right-decor-input').click();
});

document.getElementById('left-decor-input').addEventListener('change', (e) => {
    loadDecorationImage(e, 'left');
});

document.getElementById('right-decor-input').addEventListener('change', (e) => {
    loadDecorationImage(e, 'right');
});

function loadDecorationImage(e, side) {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
        alert('Файл слишком большой! Максимум 3МБ.');
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
        const img = document.getElementById(side + '-decor-img');
        img.src = event.target.result;
        img.style.display = 'block';
        saveDecoration(side, event.target.result);
        showNotification('ДЕКОРАЦИЯ ОБНОВЛЕНА!');
    };
    reader.readAsDataURL(file);
}

// ============ РЕЖИМ РЕДАКТИРОВАНИЯ ============
document.getElementById('edit-mode-btn').addEventListener('click', () => {
    editMode = !editMode;
    const btn = document.getElementById('edit-mode-btn');
    const addBtn = document.getElementById('add-card-btn');
    const container = document.getElementById('card-stack');
    const leftDecorBtn = document.getElementById('edit-left-decor');
    const rightDecorBtn = document.getElementById('edit-right-decor');

    if (editMode) {
        btn.classList.add('active');
        btn.textContent = '✓ ГОТОВО';
        addBtn.style.display = 'block';
        container.classList.add('edit-mode');
        leftDecorBtn.style.display = 'block';
        rightDecorBtn.style.display = 'block';
    } else {
        btn.classList.remove('active');
        btn.textContent = '✎ РЕДАКТИРОВАТЬ';
        addBtn.style.display = 'none';
        container.classList.remove('edit-mode');
        leftDecorBtn.style.display = 'none';
        rightDecorBtn.style.display = 'none';
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

modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

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
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    editingIndex = null;
}

imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        if (file.size > 5 * 1024 * 1024) {
            alert('Файл слишком большой! Максимум 5МБ.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            previewImage.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const char = {
        name: document.getElementById('char-name').value.trim() || 'БЕЗ ИМЕНИ',
        description: document.getElementById('char-description').value.trim() || 'Описание отсутствует.',
        age: document.getElementById('char-age').value.trim() || '???',
        role: document.getElementById('char-role').value.trim() || 'Неизвестно',
        image: previewImage.src || 'data:image/svg+xml,%3Csvg width="400" height="580" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="400" height="580" fill="%232a2a2e"/%3E%3C/svg%3E'
    };

    if (editingIndex !== null) {
        characters[editingIndex] = char;
    } else {
        characters.push(char);
    }

    saveCharacters();
    renderCards();
    closeModal();
    showNotification('СОХРАНЕНО!');
});

document.getElementById('delete-btn').addEventListener('click', () => {
    if (editingIndex !== null && confirm('Точно удалить этого персонажа?')) {
        characters.splice(editingIndex, 1);
        if (currentIndex >= characters.length && currentIndex > 0) {
            currentIndex--;
        }
        saveCharacters();
        renderCards();
        closeModal();
        showNotification('УДАЛЕНО!');
    }
});

// ============ КОПИРОВАНИЕ И СКАЧИВАНИЕ ============
function downloadImage(index) {
    const char = characters[index];
    const link = document.createElement('a');
    link.href = char.image;
    link.download = `${char.name.replace(/[^a-zA-Zа-яА-Я0-9]/g, '_')}.png`;
    link.click();
    showNotification('ФОТО СКАЧАНО!');
}

function copyCharacter(index) {
    const char = characters[index];

    const text = `
╔═══════════════════════════════════╗
    ${char.name}
╚═══════════════════════════════════╝

📝 ОПИСАНИЕ:
${char.description}

📊 ХАРАКТЕРИСТИКИ:
• Возраст: ${char.age}
• Роль: ${char.role}

────────────────────────────────────
Создано в Галерее Персонажей
    `.trim();

    navigator.clipboard.writeText(text).then(() => {
        showNotification('✓ СКОПИРОВАНО!');
    }).catch(err => {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showNotification('✓ СКОПИРОВАНО!');
    });
}

function showNotification(message) {
    const notification = document.getElementById('copy-notification');
    notification.textContent = message;
    notification.classList.add('show');

    setTimeout(() => {
        notification.classList.remove('show');
    }, 2500);
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
        this.size = Math.random() * 9 + 5;
        this.speedY = Math.random() * 1.2 + 0.6;
        this.speedX = Math.random() * 0.6 - 0.3;
        this.opacity = Math.random() * 0.5 + 0.3;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 2.5 - 1.25;
        this.swingSpeed = Math.random() * 0.025 + 0.015;
        this.swingOffset = Math.random() * Math.PI * 2;
    }

    update() {
        this.y += this.speedY;
        this.x += this.speedX + Math.sin(this.y * this.swingSpeed + this.swingOffset) * 0.4;
        this.rotation += this.rotationSpeed;

        if (this.y > canvas.height + 20) {
            this.reset();
            this.y = -20;
        }

        if (this.x > canvas.width + 30) {
            this.x = -30;
        } else if (this.x < -30) {
            this.x = canvas.width + 30;
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
        ctx.ellipse(0, 0, this.size * 0.4, this.size * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 8;
        ctx.shadowColor = '#ff6b9d';
        ctx.fillStyle = 'rgba(255, 107, 157, 0.3)';
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size * 1.2, this.size * 1.7, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

const petals = [];
const petalCount = 45;

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
loadDecorations();
renderCards();

setTimeout(() => {
    if (characters.length === 1 && characters[0].name === 'ТВОЙ ПЕРВЫЙ ПЕРСОНАЖ') {
        showNotification('Наведи курсор на карточку! 👆');
    }
}, 1500);