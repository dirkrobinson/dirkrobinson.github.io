
// Data Configuration
const VIDEO_ID = '1rDlPVmE63k';
const chapters = [
    {
        title: "Magic Pants",
        startTime: 0,
        targetId: "EXPR-3"
    },
    {
        title: "Trippy Shit",
        startTime: 35,
        targetId: "ESCA-3"
    },
    {
        title: "Diahreah",
        startTime: 54,
        targetId: "SPAR-1"
    },
    {
        title: "Picnic Time",
        startTime: 66,
        targetId: "CUBI-6"
    }
];

// App State
let player;
let currentChapterIndex = -1;
let updateInterval;
let cart = new Set(); // Stores IDs of selected items

// Initialize
function init() {
    renderChapters();
    loadYoutubeAPI();
    setupGridInteractions();
}

function renderChapters() {
    const list = document.getElementById('chapters-list');
    list.innerHTML = chapters.map((chapter, index) => `
        <div class="chapter-item" onclick="seekToChapter(${index})" id="chapter-${index}">
            <span class="chapter-title">${chapter.title}</span>
            <span class="chapter-time">${formatTime(chapter.startTime)}</span>
        </div>
    `).join('');
}

// 1. YouTube API Setup
function loadYoutubeAPI() {
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

window.onYouTubeIframeAPIReady = function () {
    player = new YT.Player('player', {
        height: '100%',
        width: '100%',
        videoId: VIDEO_ID,
        playerVars: {
            'playsinline': 1,
            'modestbranding': 1
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
};

function onPlayerReady(event) {
    updateInterval = setInterval(checkTime, 1000);
    syncChapter(0);
}

function onPlayerStateChange(event) {
    // Optional
}

// 2. Video & Chapter Logic
function seekToChapter(index) {
    if (!player) return;
    const time = chapters[index].startTime;
    player.seekTo(time, true);
    player.playVideo();
    syncChapter(index);
}

function checkTime() {
    if (!player || !player.getCurrentTime) return;

    const currentTime = player.getCurrentTime();
    document.getElementById('current-timestamp').textContent = formatTime(currentTime);

    let activeIndex = -1;
    for (let i = 0; i < chapters.length; i++) {
        if (currentTime >= chapters[i].startTime) {
            activeIndex = i;
        } else {
            break;
        }
    }

    if (activeIndex !== currentChapterIndex) {
        syncChapter(activeIndex);
    }
}

function syncChapter(index) {
    if (index === -1) index = 0;
    currentChapterIndex = index;

    const chapter = chapters[index];

    // Highlight Chapter in list
    document.querySelectorAll('.chapter-item').forEach(el => el.classList.remove('active'));
    const activeEl = document.getElementById(`chapter-${index}`);
    if (activeEl) {
        activeEl.classList.add('active');
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Scroll Grid Item into View
    if (chapter.targetId) {
        const gridItem = document.getElementById(chapter.targetId);
        if (gridItem) {
            gridItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Add a temporary highlight effect logic if desired
            gridItem.style.transition = 'transform 0.5s';
            gridItem.style.transform = 'scale(1.1)';
            setTimeout(() => {
                gridItem.style.transform = '';
            }, 1000);
        }
    }
}

// 3. Shopping Cart Interactions
function setupGridInteractions() {
    const items = document.querySelectorAll('.grid-item');
    items.forEach(item => {
        // The click listener should be on the inner card div which has the ID and data attributes
        const card = item.querySelector('.sb-card');
        if (card) {
            card.addEventListener('click', () => toggleItem(card));
        }
    });
}

function toggleItem(element) {
    const id = element.dataset.id;

    // Toggle class
    element.parentElement.classList.toggle('selected');

    // Update State
    if (cart.has(id)) {
        cart.delete(id);
    } else {
        cart.add(id);
    }

    updateCartUI();
}

function updateCartUI() {
    const count = cart.size;

    // Update Header Text
    const text = count === 1 ? '1 item selected' : `${count} items selected`;
    document.getElementById('selection-count').textContent = text;

    // Update FAB
    const btn = document.getElementById('add-to-cart-btn');
    const btnCount = document.getElementById('cart-count');

    btn.disabled = count === 0;
    btnCount.textContent = count > 0 ? `(${count})` : '';
}

// 4. View Navigation
function goToCheckout() {
    if (cart.size === 0) return;

    renderCartList();
    goToStep(2);
}

function goToStep(step) {
    const step1 = document.getElementById('step-1');
    const step2 = document.getElementById('step-2');

    if (step === 1) {
        step2.classList.add('hidden');
        step1.classList.remove('hidden');
    } else {
        step1.classList.add('hidden');
        step2.classList.remove('hidden');
    }
}

function renderCartList() {
    const container = document.getElementById('cart-list');
    container.innerHTML = '';

    cart.forEach(id => {
        const originalElement = document.getElementById(id);
        if (originalElement) {
            const desc = originalElement.dataset.desc;
            const imgSrc = originalElement.querySelector('img').src;

            const itemHTML = `
                <div class="cart-item">
                    <img src="${imgSrc}" alt="${desc}">
                    <div class="cart-item-info">
                        <h4>${desc}</h4>
                        <p>ID: ${id}</p>
                    </div>
                </div>
            `;
            container.innerHTML += itemHTML;
        }
    });
}

// 5. Checkout
function handleCheckout(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const order = {
        name: formData.get('name'),
        address: formData.get('address'),
        items: Array.from(cart),
        timestamp: new Date().toISOString()
    };

    console.log("ORDER SUBMITTED:", order);

    alert(`Order Submitted for ${order.name}!\n\nCheck the console for the data object.`);

    // Reset App
    cart.clear();
    document.querySelectorAll('.grid-item.selected').forEach(el => el.classList.remove('selected'));
    updateCartUI();
    event.target.reset();
    goToStep(1);
}

// Utils
function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}

init();
