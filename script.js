// Функция скачивания изображения
function downloadImage(button) {
    const card = button.closest('.character-card');
    const img = card.querySelector('.character-image');
    const imgSrc = img.src;
    const imgAlt = img.alt;

    // Создаём временную ссылку для скачивания
    const link = document.createElement('a');
    link.href = imgSrc;
    link.download = imgAlt.replace(/\s+/g, '_') + '.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Визуальная обратная связь
    button.textContent = '✓ Скачано!';
    setTimeout(() => {
        button.innerHTML = '<span>⬇</span> Скачать';
    }, 2000);
}

// Создание падающих лепестков сакуры
function createSakuraPetals() {
    const container = document.getElementById('sakuraContainer');
    const petalCount = 25; // Количество лепестков

    for (let i = 0; i < petalCount; i++) {
        const petal = document.createElement('div');
        petal.classList.add('sakura-petal');

        // Случайные параметры для каждого лепестка
        const leftPosition = Math.random() * 100;
        const animationDuration = 8 + Math.random() * 10;
        const animationDelay = Math.random() * 5;
        const size = 10 + Math.random() * 10;

        petal.style.left = leftPosition + '%';
        petal.style.animationDuration = animationDuration + 's';
        petal.style.animationDelay = animationDelay + 's';
        petal.style.width = size + 'px';
        petal.style.height = size + 'px';

        container.appendChild(petal);
    }
}

// Запуск анимации при загрузке страницы
window.addEventListener('load', () => {
    createSakuraPetals();
});

// Плавная прокрутка
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});

// Lazy loading для изображений (опционально)
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src || img.src;
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    });

    document.querySelectorAll('.character-image').forEach(img => {
        imageObserver.observe(img);
    });
}