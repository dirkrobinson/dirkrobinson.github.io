// Data Configuration - Edit this to change content
const VIDEO_ID = '1rDlPVmE63k'; // "YouTube Developers" generic video
const chapters = [
    {
        title: "Magic Pants",
        startTime: 0,
        url: "https://dirkrobinson.github.io/local_test.html#EXPR-3"
    },
    {
        title: "Trippy Shit",
        startTime: 35,
        url: "https://dirkrobinson.github.io/local_test.html#ESCA-3"
    },
    {
        title: "Diahreah",
        startTime: 54,
        url: "https://dirkrobinson.github.io/local_test.html#SPAR-1"
    },
    {
        title: "Picnic Time",
        startTime: 106,
        url: "https://dirkrobinson.github.io/local_test.html#CUBI-6"
    }
];

// App State
let player;
let currentChapterIndex = -1;
let updateInterval;

// Initialize
function init() {
    renderChapters();
    loadYoutubeAPI();
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

// Global callback for YouTube API
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
    // Start tracking time
    updateInterval = setInterval(checkTime, 1000);
    // Initial sync
    syncIframe(0);
}

function onPlayerStateChange(event) {
    // Could handle play/pause states here 
}

// 2. Logic Implementation
function seekToChapter(index) {
    if (!player) return;
    const time = chapters[index].startTime;
    player.seekTo(time, true);
    player.playVideo();
    syncIframe(index); // Immediate sync on click
}

function checkTime() {
    if (!player || !player.getCurrentTime) return;

    const currentTime = player.getCurrentTime();
    document.getElementById('current-timestamp').textContent = formatTime(currentTime);

    // Find active chapter based on time
    // We reverse find to get the last chapter that has startTime <= currentTime
    let activeIndex = -1;
    for (let i = 0; i < chapters.length; i++) {
        if (currentTime >= chapters[i].startTime) {
            activeIndex = i;
        } else {
            break;
        }
    }

    if (activeIndex !== currentChapterIndex) {
        syncIframe(activeIndex);
    }
}

function syncIframe(index) {
    if (index === -1) index = 0; // Default to first if before start
    currentChapterIndex = index;

    const chapter = chapters[index];

    // Update Iframe
    const iframe = document.getElementById('content-frame');
    const urlDisplay = document.getElementById('url-display');

    // Only update if actually changed to prevent reloads
    if (iframe.dataset.currentUrl !== chapter.url) {
        iframe.src = chapter.url;
        iframe.dataset.currentUrl = chapter.url;
        urlDisplay.textContent = chapter.url;
    }

    // Update UI List Styling
    document.querySelectorAll('.chapter-item').forEach(el => el.classList.remove('active'));
    const activeEl = document.getElementById(`chapter-${index}`);
    if (activeEl) {
        activeEl.classList.add('active');
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// Utils
function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}

init();
