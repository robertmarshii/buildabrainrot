<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Scene Builder - Build a Brainrot</title>

    <link rel="stylesheet" href="/assets/css/style.css">
    <style>
        body {
            overflow-x: hidden;
        }

        /* Override container for scene builder */
        .container {
            max-width: 100%;
            padding: 1rem;
        }

        .builder-container {
            display: grid;
            grid-template-columns: 280px 1fr 280px;
            gap: 15px;
            max-width: 1800px;
            margin: 0 auto;
            padding: 10px;
        }

        .builder-sidebar {
            background: white;
            border-radius: 20px;
            padding: 20px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            max-height: 800px;
            overflow-y: auto;
        }

        .builder-canvas-area {
            background: white;
            border-radius: 20px;
            padding: 20px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            text-align: center;
        }

        .builder-canvas-area canvas {
            border: 2px solid #ddd;
            border-radius: 10px;
            cursor: grab;
            display: block;
            margin: 0 auto;
            width: 960px;
            height: 540px;
        }

        /* Responsive canvas sizing */
        @media (max-width: 1000px) {
            .builder-canvas-area canvas {
                width: 100% !important;
                height: auto !important;
                max-width: 95vw;
            }
        }

        @media (max-width: 768px) {
            .builder-canvas-area canvas {
                max-width: 100%;
            }
        }

        .builder-canvas-area canvas:active {
            cursor: grabbing;
        }

        .section-title {
            font-size: 1.3em;
            font-weight: bold;
            margin-bottom: 15px;
            color: #333;
        }

        .asset-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            margin-bottom: 20px;
        }

        .asset-card {
            border: 3px solid transparent;
            border-radius: 10px;
            padding: 10px;
            cursor: pointer;
            transition: all 0.2s;
            background: #f5f5f5;
            text-align: center;
        }

        .asset-card:hover {
            transform: scale(1.05);
            border-color: #667eea;
        }

        .asset-card.selected {
            border-color: #667eea;
            background: #e8eeff;
        }

        .asset-card img {
            width: 100%;
            height: 80px;
            object-fit: contain;
            border-radius: 5px;
        }

        .asset-card .name {
            font-size: 0.8em;
            margin-top: 5px;
            color: #666;
        }

        .text-input-area {
            background: #f5f5f5;
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 15px;
        }

        .text-input-area input {
            width: 100%;
            padding: 10px;
            border: 2px solid #ddd;
            border-radius: 5px;
            font-size: 1em;
            margin-bottom: 10px;
        }

        .quick-phrases {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 5px;
            margin-bottom: 10px;
        }

        .quick-phrase-btn {
            padding: 8px;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 0.9em;
        }

        .quick-phrase-btn:hover {
            background: #5566dd;
        }

        .text-styles {
            display: flex;
            gap: 5px;
            margin-bottom: 10px;
        }

        .style-btn {
            flex: 1;
            padding: 8px;
            background: #f0f0f0;
            border: 2px solid transparent;
            border-radius: 5px;
            cursor: pointer;
        }

        .style-btn.selected {
            border-color: #667eea;
            background: #e8eeff;
        }

        .item-list {
            margin-top: 10px;
        }

        .item-entry {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 8px;
            background: #f5f5f5;
            border-radius: 5px;
            margin-bottom: 5px;
            font-size: 0.9em;
        }

        .item-controls button {
            background: none;
            border: none;
            cursor: pointer;
            font-size: 1.2em;
            padding: 0 5px;
        }

        .btn-group {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            margin-top: 20px;
        }

        .btn {
            flex: 1;
            min-width: 140px;
            padding: 12px;
            border: none;
            border-radius: 10px;
            font-size: 1em;
            font-weight: bold;
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

        @media (max-width: 1200px) {
            .builder-container {
                grid-template-columns: 1fr;
            }

            .builder-canvas-area {
                order: -1;
            }
        }

        /* Tablet and mobile responsive styles */
        @media (max-width: 768px) {
            .container {
                padding: 0.5rem;
            }

            .builder-container {
                padding: 10px;
                gap: 15px;
            }

            .builder-sidebar {
                padding: 15px;
                max-height: none;
            }

            .builder-canvas-area {
                padding: 15px;
            }

            .section-title {
                font-size: 1.2em;
            }

            .asset-grid {
                grid-template-columns: repeat(2, 1fr);
                gap: 8px;
            }

            .asset-card img {
                height: 60px;
            }

            .asset-card .name {
                font-size: 0.75em;
            }

            .text-input-area input {
                font-size: 0.95em;
                padding: 12px;
            }

            .quick-phrases {
                grid-template-columns: repeat(2, 1fr);
                gap: 5px;
            }

            .quick-phrase-btn {
                padding: 10px 6px;
                font-size: 0.85em;
                min-height: 44px;
            }

            .style-btn {
                padding: 10px 6px;
                font-size: 0.85em;
                min-height: 44px;
            }

            .btn {
                min-width: 100px;
                padding: 14px 12px;
                font-size: 0.95em;
                min-height: 44px;
            }

            .btn-group {
                gap: 8px;
            }

            .item-entry {
                padding: 10px 8px;
                font-size: 0.85em;
            }

            .item-controls button {
                font-size: 1.4em;
                padding: 4px 8px;
                min-width: 36px;
                min-height: 36px;
            }
        }

        /* Small mobile phones */
        @media (max-width: 480px) {
            header h1 {
                font-size: 1.5em;
            }

            header p {
                font-size: 0.9em;
            }

            .builder-sidebar {
                padding: 12px;
                border-radius: 15px;
            }

            .builder-canvas-area {
                padding: 12px;
                border-radius: 15px;
            }

            .section-title {
                font-size: 1.1em;
                margin-bottom: 10px;
            }

            .asset-grid {
                grid-template-columns: 1fr 1fr;
                gap: 6px;
            }

            .asset-card {
                padding: 8px;
            }

            .asset-card img {
                height: 50px;
            }

            .asset-card .name {
                font-size: 0.7em;
            }

            .text-input-area {
                padding: 12px;
            }

            .text-input-area input {
                padding: 14px 10px;
                font-size: 0.9em;
            }

            .quick-phrases {
                gap: 4px;
            }

            .quick-phrase-btn {
                padding: 12px 4px;
                font-size: 0.8em;
                min-height: 48px;
            }

            .style-btn {
                padding: 10px 4px;
                font-size: 0.8em;
                min-height: 48px;
            }

            .btn {
                min-width: 80px;
                padding: 16px 10px;
                font-size: 0.9em;
                min-height: 48px;
            }

            .item-entry {
                padding: 8px 6px;
                font-size: 0.8em;
            }

            .item-controls button {
                font-size: 1.3em;
                padding: 6px;
                min-width: 40px;
                min-height: 40px;
            }
        }

        /* Mobile tab interface */
        .mobile-tabs {
            display: none;
            padding: 10px;
            max-width: 100vw;
            overflow-x: hidden;
        }

        /* Mobile canvas styling */
        #scene-canvas-mobile {
            border: 2px solid #ddd;
            border-radius: 10px;
            cursor: grab;
            margin: 0 auto;
            display: block;
            max-width: 100%;
        }

        #scene-canvas-mobile:active {
            cursor: grabbing;
        }

        .mobile-tab-nav {
            display: flex;
            gap: 5px;
            padding: 10px;
            background: white;
            border-radius: 15px;
            margin-bottom: 15px;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
        }

        .mobile-tab-btn {
            flex: 1;
            min-width: 80px;
            padding: 12px 8px;
            border: 2px solid #ddd;
            background: white;
            border-radius: 10px;
            font-size: 0.9em;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.2s;
            white-space: nowrap;
        }

        .mobile-tab-btn.active {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-color: #667eea;
        }

        .mobile-tab-content {
            display: none;
            background: white;
            border-radius: 15px;
            padding: 15px;
            margin-bottom: 80px;
            max-width: 100%;
            overflow-x: hidden;
        }

        .mobile-tab-content.active {
            display: block;
        }

        .mobile-bottom-bar {
            display: none;
        }

        /* Show mobile interface on small screens */
        @media (max-width: 768px) {
            .builder-container {
                display: none;
            }

            .mobile-tabs {
                display: block;
            }

            .mobile-bottom-bar {
                display: flex;
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                padding: 15px;
                background: white;
                box-shadow: 0 -4px 15px rgba(0,0,0,0.1);
                gap: 10px;
                z-index: 100;
            }

            .mobile-bottom-bar .btn {
                flex: 1;
                min-height: 50px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1 style="text-align: center; color: #667eea;">🎬 Scene Builder</h1>
            <p style="text-align: center;">Add backgrounds, stickers, and text!</p>
        </header>

        <div class="builder-container">
            <!-- Left Sidebar: Background & Stickers -->
            <div class="builder-sidebar">
                <div class="section-title">1. Choose Background</div>
                <div class="asset-grid" id="background-grid"></div>

                <div class="section-title">2. Add Stickers</div>
                <div class="asset-grid" id="sticker-grid"></div>

                <div class="section-title">Stickers on Scene</div>
                <div class="item-list" id="sticker-list"></div>
            </div>

            <!-- Center: Canvas -->
            <div class="builder-canvas-area">
                <canvas id="scene-canvas"></canvas>
                <p style="color: #999; font-size: 0.9em;">💡 Drag items to reposition them</p>

                <div class="btn-group">
                    <button class="btn btn-secondary" onclick="goBack()">← Back</button>
                    <button class="btn btn-secondary" onclick="exportScene()">💾 Save PNG</button>
                    <button class="btn btn-primary" onclick="nextStep()">Next Step →</button>
                </div>
            </div>

            <!-- Right Sidebar: Text -->
            <div class="builder-sidebar">
                <div class="section-title">3. Add Text</div>

                <div class="text-input-area">
                    <input type="text" id="text-input" placeholder="Type your text..." maxlength="30">

                    <div class="quick-phrases">
                        <button class="quick-phrase-btn" onclick="usePhrase('sheesh!')">sheesh!</button>
                        <button class="quick-phrase-btn" onclick="usePhrase('no cap')">no cap</button>
                        <button class="quick-phrase-btn" onclick="usePhrase('bussin')">bussin</button>
                        <button class="quick-phrase-btn" onclick="usePhrase('fr fr')">fr fr</button>
                    </div>

                    <div class="text-styles">
                        <button class="style-btn selected" data-style="bubble">💭 Bubble</button>
                        <button class="style-btn" data-style="comic">💥 Comic</button>
                    </div>

                    <button class="btn btn-primary" onclick="addTextToScene()" style="width: 100%;">➕ Add Text</button>
                </div>

                <div class="section-title">Text on Scene</div>
                <div class="item-list" id="text-list"></div>
            </div>
        </div>

        <!-- Mobile Tab Interface -->
        <div class="mobile-tabs">
            <!-- Canvas (always visible on mobile) -->
            <div style="background: white; border-radius: 15px; padding: 15px; margin-bottom: 15px; text-align: center; max-width: 100%; overflow: hidden;">
                <canvas id="scene-canvas-mobile"></canvas>
                <p style="color: #999; font-size: 0.85em; margin-top: 10px;">💡 Drag items to reposition</p>
            </div>

            <!-- Tab Navigation -->
            <div class="mobile-tab-nav">
                <button class="mobile-tab-btn active" onclick="switchMobileTab('background')">Background</button>
                <button class="mobile-tab-btn" onclick="switchMobileTab('stickers')">Stickers</button>
                <button class="mobile-tab-btn" onclick="switchMobileTab('text')">Text</button>
            </div>

            <!-- Tab: Background -->
            <div class="mobile-tab-content active" id="mobile-tab-background">
                <div class="section-title">Choose Background</div>
                <div class="asset-grid" id="background-grid-mobile"></div>
            </div>

            <!-- Tab: Stickers -->
            <div class="mobile-tab-content" id="mobile-tab-stickers">
                <div class="section-title">Add Stickers</div>
                <div class="asset-grid" id="sticker-grid-mobile"></div>

                <div class="section-title" style="margin-top: 20px;">Stickers on Scene</div>
                <div class="item-list" id="sticker-list-mobile"></div>
            </div>

            <!-- Tab: Text -->
            <div class="mobile-tab-content" id="mobile-tab-text">
                <div class="section-title">Add Text</div>

                <div class="text-input-area">
                    <input type="text" id="text-input-mobile" placeholder="Type your text..." maxlength="30">

                    <div class="quick-phrases">
                        <button class="quick-phrase-btn" onclick="usePhrase('sheesh!', true)">sheesh!</button>
                        <button class="quick-phrase-btn" onclick="usePhrase('no cap', true)">no cap</button>
                        <button class="quick-phrase-btn" onclick="usePhrase('bussin', true)">bussin</button>
                        <button class="quick-phrase-btn" onclick="usePhrase('fr fr', true)">fr fr</button>
                    </div>

                    <div class="text-styles" id="text-styles-mobile">
                        <button class="style-btn selected" data-style="bubble">💭 Bubble</button>
                        <button class="style-btn" data-style="comic">💥 Comic</button>
                    </div>

                    <button class="btn btn-primary" onclick="addTextToScene(true)" style="width: 100%;">➕ Add Text</button>
                </div>

                <div class="section-title">Text on Scene</div>
                <div class="item-list" id="text-list-mobile"></div>
            </div>

            <!-- Bottom Fixed Bar -->
            <div class="mobile-bottom-bar">
                <button class="btn btn-secondary" onclick="goBack()">←</button>
                <button class="btn btn-primary" onclick="nextStep()">Next Step →</button>
            </div>
        </div>
    </div>

    <!-- Loading container -->
    <div id="loading-container"></div>

    <!-- Scripts -->
    <script src="/assets/js/AssetManager.js"></script>
    <script src="/assets/js/LoadingUI.js"></script>
    <script src="/assets/js/CharacterCanvas.js"></script>
    <script src="/assets/js/SceneCanvas.js"></script>

    <script>
        // Global state
        let sceneCanvas;
        const loadingUI = new LoadingUI();
        let selectedTextStyle = 'bubble';

        // Check if mobile
        const isMobile = () => window.innerWidth <= 768;

        // Mobile tab switching
        function switchMobileTab(tabName) {
            // Update buttons
            document.querySelectorAll('.mobile-tab-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            event.target.classList.add('active');

            // Update content
            document.querySelectorAll('.mobile-tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(`mobile-tab-${tabName}`).classList.add('active');
        }

        // Initialize
        async function init() {
            try {
                loadingUI.show({ title: 'Loading Scene Builder...' });

                // Initialize asset manager
                await assetManager.init();

                // Initialize canvas (mobile or desktop)
                const canvasId = isMobile() ? 'scene-canvas-mobile' : 'scene-canvas';
                sceneCanvas = new SceneCanvas(canvasId);

                // Size mobile canvas properly
                if (isMobile()) {
                    const canvas = document.getElementById(canvasId);
                    const maxWidth = Math.min(window.innerWidth - 40, window.innerWidth * 0.95);
                    const scale = maxWidth / 1920;
                    canvas.style.width = (1920 * scale) + 'px';
                    canvas.style.height = (1080 * scale) + 'px';
                }

                // Load character from previous step
                const characterData = sessionStorage.getItem('character-data');
                if (characterData) {
                    const parsed = JSON.parse(characterData);
                    console.log('Loading character data:', parsed);
                    console.log('Accessories to load:', parsed.accessories);
                    await sceneCanvas.loadCharacterData(parsed);
                    console.log('Character loaded. Accessories in canvas:', sceneCanvas.character.accessories);
                }

                // Load UI
                await loadBackgroundGrid();
                await loadStickerGrid();

                // Set up text style buttons
                setupTextStyleButtons();

                loadingUI.hide();
            } catch (error) {
                console.error('Failed to initialize:', error);
                loadingUI.showError('Failed to load scene builder');
            }
        }

        // Load background grid
        async function loadBackgroundGrid() {
            const backgrounds = assetManager.getAssetsByCategory('backgrounds');
            const grid = document.getElementById('background-grid');
            const gridMobile = document.getElementById('background-grid-mobile');

            for (const bg of backgrounds) {
                const img = await assetManager.loadImage(bg.id);

                // Desktop
                const card = document.createElement('div');
                card.className = 'asset-card';
                card.dataset.id = bg.id;

                const imgEl = document.createElement('img');
                imgEl.src = img.src;

                const name = document.createElement('div');
                name.className = 'name';
                name.textContent = bg.name;

                card.appendChild(imgEl);
                card.appendChild(name);
                card.addEventListener('click', () => selectBackground(bg.id));
                grid.appendChild(card);

                // Mobile
                const cardMobile = card.cloneNode(true);
                cardMobile.addEventListener('click', () => selectBackground(bg.id));
                gridMobile.appendChild(cardMobile);
            }

            // Select first background by default
            if (backgrounds.length > 0) {
                selectBackground(backgrounds[0].id);
            }
        }

        // Select background
        async function selectBackground(bgId) {
            // Update UI (both desktop and mobile)
            document.querySelectorAll('#background-grid .asset-card, #background-grid-mobile .asset-card').forEach(card => {
                card.classList.toggle('selected', card.dataset.id === bgId);
            });

            await sceneCanvas.setBackground(bgId);
        }

        // Load sticker grid
        async function loadStickerGrid() {
            const stickers = assetManager.getAssetsByCategory('stickers');
            const grid = document.getElementById('sticker-grid');
            const gridMobile = document.getElementById('sticker-grid-mobile');

            for (const sticker of stickers) {
                const img = await assetManager.loadImage(sticker.id);

                // Desktop
                const card = document.createElement('div');
                card.className = 'asset-card';
                card.dataset.id = sticker.id;

                const imgEl = document.createElement('img');
                imgEl.src = img.src;

                const name = document.createElement('div');
                name.className = 'name';
                name.textContent = sticker.name;

                card.appendChild(imgEl);
                card.appendChild(name);
                card.addEventListener('click', () => addStickerToScene(sticker.id));
                grid.appendChild(card);

                // Mobile
                const cardMobile = card.cloneNode(true);
                cardMobile.addEventListener('click', () => addStickerToScene(sticker.id));
                gridMobile.appendChild(cardMobile);
            }
        }

        // Add sticker
        async function addStickerToScene(stickerId) {
            try {
                await sceneCanvas.addSticker(stickerId);
                updateStickerList();
            } catch (error) {
                console.error('Failed to add sticker:', error);
                alert('Failed to add sticker');
            }
        }

        // Update sticker list
        function updateStickerList() {
            const list = document.getElementById('sticker-list');
            const listMobile = document.getElementById('sticker-list-mobile');
            const stickers = sceneCanvas.scene.stickers;

            list.innerHTML = '';
            listMobile.innerHTML = '';

            if (stickers.length === 0) {
                const emptyMsg = '<p style="text-align: center; color: #999; font-size: 0.9em;">No stickers added</p>';
                list.innerHTML = emptyMsg;
                listMobile.innerHTML = emptyMsg;
                return;
            }

            stickers.forEach((sticker, index) => {
                // Desktop
                const item = document.createElement('div');
                item.className = 'item-entry';

                const name = document.createElement('span');
                name.textContent = sticker.metadata?.name || sticker.id;

                const controls = document.createElement('div');
                controls.className = 'item-controls';

                controls.innerHTML = `
                    <button onclick="sceneCanvas.moveLayer('sticker', ${index}, 'up'); updateStickerList();" title="Move up">⬆️</button>
                    <button onclick="sceneCanvas.moveLayer('sticker', ${index}, 'down'); updateStickerList();" title="Move down">⬇️</button>
                    <button onclick="sceneCanvas.removeSticker(${index}); updateStickerList();" title="Remove">❌</button>
                `;

                item.appendChild(name);
                item.appendChild(controls);
                list.appendChild(item);

                // Mobile
                const itemMobile = item.cloneNode(true);
                itemMobile.querySelector('.item-controls').innerHTML = controls.innerHTML;
                listMobile.appendChild(itemMobile);
            });
        }

        // Text style selection (will be set up after DOM loads)
        function setupTextStyleButtons() {
            document.querySelectorAll('.style-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    // Get parent container to only affect buttons in same section
                    const container = this.closest('.text-input-area');
                    container.querySelectorAll('.style-btn').forEach(b => b.classList.remove('selected'));
                    this.classList.add('selected');
                    selectedTextStyle = this.dataset.style;
                });
            });
        }

        // Use quick phrase
        function usePhrase(phrase, isMobile = false) {
            const inputId = isMobile ? 'text-input-mobile' : 'text-input';
            document.getElementById(inputId).value = phrase;
        }

        // Add text to scene
        function addTextToScene(isMobile = false) {
            const inputId = isMobile ? 'text-input-mobile' : 'text-input';
            const input = document.getElementById(inputId);
            const text = input.value.trim();

            if (!text) {
                alert('Please enter some text!');
                return;
            }

            const textObj = sceneCanvas.addText(text, selectedTextStyle);
            console.log('Text added:', textObj);
            console.log('Total texts in scene:', sceneCanvas.scene.texts.length);
            updateTextList();

            // Clear input
            input.value = '';
        }

        // Update text list
        function updateTextList() {
            const list = document.getElementById('text-list');
            const listMobile = document.getElementById('text-list-mobile');
            const texts = sceneCanvas.scene.texts;

            list.innerHTML = '';
            listMobile.innerHTML = '';

            if (texts.length === 0) {
                const emptyMsg = '<p style="text-align: center; color: #999; font-size: 0.9em;">No text added</p>';
                list.innerHTML = emptyMsg;
                listMobile.innerHTML = emptyMsg;
                return;
            }

            texts.forEach((text, index) => {
                // Desktop
                const item = document.createElement('div');
                item.className = 'item-entry';

                const content = document.createElement('span');
                content.textContent = `"${text.content}"`;

                const controls = document.createElement('div');
                controls.className = 'item-controls';

                controls.innerHTML = `
                    <button onclick="sceneCanvas.moveLayer('text', ${index}, 'up'); updateTextList();" title="Move up">⬆️</button>
                    <button onclick="sceneCanvas.moveLayer('text', ${index}, 'down'); updateTextList();" title="Move down">⬇️</button>
                    <button onclick="sceneCanvas.removeText(${index}); updateTextList();" title="Remove">❌</button>
                `;

                item.appendChild(content);
                item.appendChild(controls);
                list.appendChild(item);

                // Mobile
                const itemMobile = item.cloneNode(true);
                itemMobile.querySelector('.item-controls').innerHTML = controls.innerHTML;
                listMobile.appendChild(itemMobile);
            });
        }

        // Go back
        function goBack() {
            if (confirm('Go back to character builder? (Scene will be lost)')) {
                window.location.href = '/character-builder.php';
            }
        }

        // Export scene
        function exportScene() {
            sceneCanvas.exportPNG('my-brainrot-scene.png');
        }

        // Next step
        function nextStep() {
            // Save complete data
            const completeData = sceneCanvas.getCompleteData();
            sessionStorage.setItem('complete-brainrot', JSON.stringify(completeData));

            // Navigate to audio builder
            window.location.href = '/audio-builder.php';
        }

        // Initialize on page load
        document.addEventListener('DOMContentLoaded', init);
    </script>
</body>
</html>
