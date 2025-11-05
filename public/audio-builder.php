<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Audio Mixer - Build a Brainrot</title>

    <link rel="stylesheet" href="/assets/css/style.css">
    <style>
        .builder-container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
        }

        .audio-controls {
            background: white;
            border-radius: 20px;
            padding: 30px;
            margin-bottom: 20px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }

        .section-title {
            font-size: 1.5em;
            font-weight: bold;
            margin-bottom: 15px;
            color: #333;
        }

        .music-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        }

        .music-card {
            border: 3px solid transparent;
            border-radius: 10px;
            padding: 15px;
            cursor: pointer;
            transition: all 0.2s;
            background: #f5f5f5;
            text-align: center;
        }

        .music-card:hover {
            transform: translateY(-2px);
            border-color: #667eea;
        }

        .music-card.selected {
            border-color: #667eea;
            background: #e8eeff;
        }

        .music-card .icon {
            font-size: 3em;
            margin-bottom: 10px;
        }

        .timeline {
            background: #f5f5f5;
            padding: 30px;
            border-radius: 10px;
            margin: 20px 0;
        }

        .timeline-ruler {
            position: relative;
            height: 100px;
            background: white;
            border-radius: 5px;
            margin-bottom: 15px;
        }

        .timeline-markers {
            display: flex;
            justify-content: space-between;
            padding: 5px 10px;
            color: #666;
            font-size: 0.9em;
        }

        .timeline-progress {
            position: absolute;
            top: 50%;
            left: 0;
            width: 2px;
            height: 40px;
            background: #667eea;
            transform: translateY(-50%);
            transition: left 0.1s linear;
        }

        .timeline-sfx {
            position: absolute;
            top: 50%;
            transform: translate(-50%, -50%);
            font-size: 2em;
            cursor: pointer;
        }

        .playback-controls {
            display: flex;
            gap: 15px;
            justify-content: center;
            margin: 20px 0;
        }

        .control-btn {
            padding: 15px 30px;
            font-size: 1.5em;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            transition: all 0.2s;
        }

        .control-btn:hover {
            transform: scale(1.05);
        }

        .control-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .sfx-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
            gap: 10px;
        }

        .sfx-card {
            background: #f5f5f5;
            border: 2px solid transparent;
            border-radius: 10px;
            padding: 15px;
            text-align: center;
            cursor: pointer;
            transition: all 0.2s;
        }

        .sfx-card:hover {
            background: #e8eeff;
            border-color: #667eea;
        }

        .sfx-card .icon {
            font-size: 2.5em;
            margin-bottom: 5px;
        }

        .sfx-card .name {
            font-size: 0.85em;
            color: #666;
        }

        .sfx-list {
            margin-top: 15px;
        }

        .sfx-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 10px;
            background: #f5f5f5;
            border-radius: 5px;
            margin-bottom: 5px;
        }

        .sfx-item button {
            background: #ff4444;
            color: white;
            border: none;
            border-radius: 5px;
            padding: 5px 10px;
            cursor: pointer;
        }

        .btn-group {
            display: flex;
            gap: 15px;
            justify-content: center;
            margin-top: 30px;
        }

        .btn {
            padding: 15px 30px;
            font-size: 1.1em;
            font-weight: bold;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            transition: all 0.2s;
        }

        .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }

        .btn-secondary {
            background: #f0f0f0;
            color: #333;
        }

        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 10px rgba(0,0,0,0.2);
        }

        /* Share Modal */
        .share-modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0,0,0,0.85);
            z-index: 10000;
            align-items: center;
            justify-content: center;
        }

        .share-modal.active {
            display: flex;
        }

        .share-content {
            background: white;
            border-radius: 20px;
            padding: 40px;
            max-width: 600px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
            position: relative;
            animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
            from {
                transform: translateY(50px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }

        .share-close {
            position: absolute;
            top: 15px;
            right: 15px;
            background: none;
            border: none;
            font-size: 2.5em;
            cursor: pointer;
            color: #999;
            padding: 0;
            width: 40px;
            height: 40px;
            line-height: 1;
        }

        .share-close:hover {
            color: #333;
        }

        .share-title {
            font-size: 2em;
            font-weight: bold;
            margin-bottom: 10px;
            color: #667eea;
            text-align: center;
        }

        .share-subtitle {
            text-align: center;
            color: #666;
            margin-bottom: 30px;
            font-size: 1.1em;
        }

        .share-url-box {
            display: flex;
            gap: 10px;
            margin-bottom: 30px;
            flex-wrap: wrap;
        }

        .share-url-input {
            flex: 1;
            min-width: 200px;
            padding: 15px;
            border: 2px solid #ddd;
            border-radius: 10px;
            font-size: 1em;
            font-family: monospace;
            background: #f5f5f5;
        }

        .btn-copy {
            padding: 15px 30px;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            font-weight: bold;
            transition: all 0.2s;
            white-space: nowrap;
        }

        .btn-copy:hover {
            background: #5566dd;
            transform: translateY(-2px);
        }

        .btn-copy.copied {
            background: #4caf50;
        }

        .share-options {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 15px;
            margin-bottom: 30px;
        }

        .share-button {
            padding: 20px 15px;
            border: 2px solid #e0e0e0;
            border-radius: 15px;
            background: white;
            cursor: pointer;
            transition: all 0.2s;
            text-align: center;
            font-weight: 600;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            color: #333;
        }

        .share-button:hover {
            transform: translateY(-4px);
            box-shadow: 0 6px 20px rgba(0,0,0,0.15);
            border-color: #667eea;
        }

        .share-button .icon {
            font-size: 2.5em;
        }

        .share-actions {
            display: flex;
            gap: 10px;
            justify-content: center;
            margin-top: 20px;
        }

        .btn-view {
            padding: 18px 45px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 12px;
            cursor: pointer;
            font-weight: bold;
            font-size: 1.2em;
            transition: all 0.2s;
            box-shadow: 0 4px 15px rgba(102,126,234,0.4);
        }

        .btn-view:hover {
            transform: translateY(-3px);
            box-shadow: 0 6px 25px rgba(102,126,234,0.5);
        }

        @media (max-width: 768px) {
            .share-content {
                padding: 30px 20px;
            }

            .share-options {
                grid-template-columns: repeat(2, 1fr);
            }

            .share-url-box {
                flex-direction: column;
            }

            .share-url-input {
                width: 100%;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1 style="text-align: center; color: #667eea;">🎵 Audio Mixer</h1>
            <p style="text-align: center;">Add music and sound effects!</p>
        </header>

        <div class="builder-container">
            <div class="audio-controls">
                <div class="section-title">1. Choose Background Music</div>
                <div class="music-grid" id="music-grid"></div>

                <div class="section-title" style="margin-top: 30px;">2. Timeline & Playback</div>
                <div class="timeline">
                    <div class="timeline-markers">
                        <span>0s</span>
                        <span>5s</span>
                        <span>10s</span>
                        <span>15s</span>
                        <span>20s</span>
                    </div>
                    <div class="timeline-ruler" id="timeline-ruler">
                        <div class="timeline-progress" id="timeline-progress"></div>
                    </div>

                    <div class="playback-controls">
                        <button class="control-btn" onclick="audioMixer.play()" id="play-btn">▶️</button>
                        <button class="control-btn" onclick="audioMixer.pause()" id="pause-btn">⏸️</button>
                        <button class="control-btn" onclick="audioMixer.stop()" id="stop-btn">⏹️</button>
                    </div>
                </div>

                <div class="section-title">3. Add Sound Effects</div>
                <p style="color: #666; margin-bottom: 10px;">Click a sound to add it at current playback position</p>
                <div class="sfx-grid" id="sfx-grid"></div>

                <div class="sfx-list" id="sfx-list"></div>
            </div>

            <div class="btn-group">
                <button class="btn btn-secondary" onclick="goBack()">← Back</button>
                <button class="btn btn-primary" onclick="finishBrainrot()">🎉 Finish & Share!</button>
            </div>
        </div>
    </div>

    <!-- Loading container -->
    <div id="loading-container"></div>

    <!-- Scripts -->
    <script src="/assets/js/AssetManager.js"></script>
    <script src="/assets/js/LoadingUI.js"></script>
    <script src="/assets/js/BrainrotEncoder.js"></script>
    <script src="/assets/js/AudioMixer.js"></script>

    <script>
        // Global state
        let audioMixer;
        const loadingUI = new LoadingUI();

        // Initialize
        async function init() {
            try {
                loadingUI.show({ title: 'Loading Audio Mixer...' });

                await assetManager.init();

                audioMixer = new AudioMixer();
                audioMixer.onTimeUpdate = updateTimeline;

                await loadMusicGrid();
                await loadSFXGrid();

                loadingUI.hide();
            } catch (error) {
                console.error('Failed to initialize:', error);
                loadingUI.showError('Failed to load audio mixer');
            }
        }

        // Load music grid
        async function loadMusicGrid() {
            const music = assetManager.getAssetsByCategory('music');
            const grid = document.getElementById('music-grid');

            for (const track of music) {
                const card = document.createElement('div');
                card.className = 'music-card';
                card.dataset.id = track.id;

                card.innerHTML = `
                    <div class="icon">🎵</div>
                    <div class="name">${track.name}</div>
                `;

                card.addEventListener('click', () => selectMusic(track.id));
                grid.appendChild(card);
            }

            // Select first track by default
            if (music.length > 0) {
                selectMusic(music[0].id);
            }
        }

        // Select music
        async function selectMusic(musicId) {
            document.querySelectorAll('.music-card').forEach(card => {
                card.classList.toggle('selected', card.dataset.id === musicId);
            });

            await audioMixer.setMusic(musicId);
        }

        // Load SFX grid
        async function loadSFXGrid() {
            const sfx = assetManager.getAssetsByCategory('sfx');
            const grid = document.getElementById('sfx-grid');

            for (const sound of sfx.slice(0, 8)) { // Limit to first 8
                const card = document.createElement('div');
                card.className = 'sfx-card';

                const icon = getSFXIcon(sound.id);
                card.innerHTML = `
                    <div class="icon">${icon}</div>
                    <div class="name">${sound.name}</div>
                `;

                card.addEventListener('click', () => addSFX(sound.id));
                grid.appendChild(card);
            }
        }

        // Get SFX icon
        function getSFXIcon(sfxId) {
            if (sfxId.includes('vine-boom')) return '💥';
            if (sfxId.includes('airhorn')) return '📯';
            if (sfxId.includes('bark')) return '🐶';
            if (sfxId.includes('boing')) return '🎈';
            if (sfxId.includes('honk')) return '📣';
            return '🔊';
        }

        // Add SFX at current time
        async function addSFX(sfxId) {
            const time = audioMixer.currentTime || Math.random() * 15;
            await audioMixer.addSFX(sfxId, time);
            updateSFXList();
            updateTimelineVisual();
        }

        // Update SFX list
        function updateSFXList() {
            const list = document.getElementById('sfx-list');
            const sfx = audioMixer.sfxQueue;

            list.innerHTML = '';

            if (sfx.length === 0) {
                list.innerHTML = '<p style="text-align: center; color: #999;">No sound effects added</p>';
                return;
            }

            sfx.forEach((sound, index) => {
                const item = document.createElement('div');
                item.className = 'sfx-item';

                item.innerHTML = `
                    <span>${sound.metadata.name} @ ${sound.time.toFixed(1)}s</span>
                    <button onclick="removeSFX(${index})">Remove</button>
                `;

                list.appendChild(item);
            });
        }

        // Remove SFX
        function removeSFX(index) {
            audioMixer.removeSFX(index);
            updateSFXList();
            updateTimelineVisual();
        }

        // Update timeline visual
        function updateTimelineVisual() {
            const ruler = document.getElementById('timeline-ruler');

            // Remove old SFX markers
            document.querySelectorAll('.timeline-sfx').forEach(el => el.remove());

            // Add SFX markers
            audioMixer.sfxQueue.forEach(sfx => {
                const marker = document.createElement('div');
                marker.className = 'timeline-sfx';
                marker.textContent = getSFXIcon(sfx.id);
                marker.style.left = ((sfx.time / audioMixer.duration) * 100) + '%';
                ruler.appendChild(marker);
            });
        }

        // Update timeline during playback
        function updateTimeline(currentTime) {
            const progress = document.getElementById('timeline-progress');
            const percentage = (currentTime / audioMixer.duration) * 100;
            progress.style.left = percentage + '%';
        }

        // Go back
        function goBack() {
            if (confirm('Go back to scene builder? (Audio will be lost)')) {
                window.location.href = '/scene-builder.php';
            }
        }

        // Finish brainrot
        async function finishBrainrot() {
            try {
                // Get all data
                const sceneData = JSON.parse(sessionStorage.getItem('complete-brainrot') || '{}');
                const audioData = audioMixer.getAudioData();

                const completeBrainrot = {
                    version: '1.0',
                    ...sceneData,
                    audio: audioData,
                    metadata: {
                        created: new Date().toISOString(),
                        creator: 'anonymous'
                    }
                };

                // Encode
                const encoded = BrainrotEncoder.encode(completeBrainrot);
                const shareUrl = window.location.origin + '/b/' + encoded;

                // Show share modal
                showShareModal(shareUrl, encoded);
            } catch (error) {
                console.error('Failed to finish:', error);
                alert('Failed to create brainrot. Please try again.');
            }
        }

        // Show share modal
        function showShareModal(shareUrl, encoded) {
            const modal = document.getElementById('share-modal');
            const urlInput = document.getElementById('share-url');

            urlInput.value = shareUrl;
            modal.classList.add('active');

            // Store for social sharing
            window.currentShareUrl = shareUrl;
            window.currentEncoded = encoded;
        }

        // Close share modal
        function closeShareModal() {
            document.getElementById('share-modal').classList.remove('active');
        }

        // Copy link to clipboard
        async function copyShareLink() {
            const urlInput = document.getElementById('share-url');
            const copyBtn = document.getElementById('copy-btn');

            try {
                await navigator.clipboard.writeText(urlInput.value);
                copyBtn.textContent = '✓ Copied!';
                copyBtn.classList.add('copied');

                setTimeout(() => {
                    copyBtn.textContent = '📋 Copy Link';
                    copyBtn.classList.remove('copied');
                }, 2000);
            } catch (err) {
                // Fallback for older browsers
                urlInput.select();
                document.execCommand('copy');
                copyBtn.textContent = '✓ Copied!';
            }
        }

        // Social media sharing functions
        function shareToTwitter() {
            const text = encodeURIComponent('Check out my brainrot creation! 🧠🔥');
            const url = encodeURIComponent(window.currentShareUrl);
            window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
        }

        function shareToFacebook() {
            const url = encodeURIComponent(window.currentShareUrl);
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
        }

        function shareToWhatsApp() {
            const text = encodeURIComponent('Check out my brainrot! ' + window.currentShareUrl);
            window.open(`https://wa.me/?text=${text}`, '_blank');
        }

        function shareToEmail() {
            const subject = encodeURIComponent('Check out my brainrot!');
            const body = encodeURIComponent(`I made this silly brainrot character:\n\n${window.currentShareUrl}\n\nMake your own at buildabrainrot.com!`);
            window.location.href = `mailto:?subject=${subject}&body=${body}`;
        }

        function viewBrainrot() {
            window.location.href = '/b/' + window.currentEncoded;
        }

        // Initialize on load
        document.addEventListener('DOMContentLoaded', init);
    </script>

    <!-- Share Modal -->
    <div id="share-modal" class="share-modal">
        <div class="share-content">
            <button class="share-close" onclick="closeShareModal()">×</button>

            <h2 class="share-title">🎉 Your Brainrot is Ready!</h2>
            <p class="share-subtitle">Share it with your friends!</p>

            <div class="share-url-box">
                <input type="text" id="share-url" class="share-url-input" readonly>
                <button id="copy-btn" class="btn-copy" onclick="copyShareLink()">📋 Copy Link</button>
            </div>

            <div class="share-options">
                <button class="share-button" onclick="shareToTwitter()">
                    <div class="icon">🐦</div>
                    <div>Twitter</div>
                </button>

                <button class="share-button" onclick="shareToFacebook()">
                    <div class="icon">📘</div>
                    <div>Facebook</div>
                </button>

                <button class="share-button" onclick="shareToWhatsApp()">
                    <div class="icon">💬</div>
                    <div>WhatsApp</div>
                </button>

                <button class="share-button" onclick="shareToEmail()">
                    <div class="icon">📧</div>
                    <div>Email</div>
                </button>
            </div>

            <div class="share-actions">
                <button class="btn-view" onclick="viewBrainrot()">
                    ▶️ View My Brainrot
                </button>
            </div>
        </div>
    </div>
</body>
</html>
