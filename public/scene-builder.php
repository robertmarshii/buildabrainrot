<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Scene Builder - Build a Brainrot</title>

    <link rel="stylesheet" href="/assets/css/style.css">
    <style>
        .builder-container {
            display: grid;
            grid-template-columns: 300px 1fr 300px;
            gap: 20px;
            max-width: 1600px;
            margin: 0 auto;
            padding: 20px;
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

        #scene-canvas {
            border: 2px solid #ddd;
            border-radius: 10px;
            cursor: grab;
        }

        #scene-canvas:active {
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
            object-fit: cover;
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

        // Initialize
        async function init() {
            try {
                loadingUI.show({ title: 'Loading Scene Builder...' });

                // Initialize asset manager
                await assetManager.init();

                // Initialize canvas
                sceneCanvas = new SceneCanvas('scene-canvas');

                // Load character from previous step
                const characterData = sessionStorage.getItem('character-data');
                if (characterData) {
                    await sceneCanvas.loadCharacterData(JSON.parse(characterData));
                }

                // Load UI
                await loadBackgroundGrid();
                await loadStickerGrid();

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

            for (const bg of backgrounds) {
                const card = document.createElement('div');
                card.className = 'asset-card';
                card.dataset.id = bg.id;

                const img = await assetManager.loadImage(bg.id);
                const imgEl = document.createElement('img');
                imgEl.src = img.src;

                const name = document.createElement('div');
                name.className = 'name';
                name.textContent = bg.name;

                card.appendChild(imgEl);
                card.appendChild(name);

                card.addEventListener('click', () => selectBackground(bg.id));
                grid.appendChild(card);
            }

            // Select first background by default
            if (backgrounds.length > 0) {
                selectBackground(backgrounds[0].id);
            }
        }

        // Select background
        async function selectBackground(bgId) {
            document.querySelectorAll('#background-grid .asset-card').forEach(card => {
                card.classList.toggle('selected', card.dataset.id === bgId);
            });

            await sceneCanvas.setBackground(bgId);
        }

        // Load sticker grid
        async function loadStickerGrid() {
            const stickers = assetManager.getAssetsByCategory('stickers');
            const grid = document.getElementById('sticker-grid');

            for (const sticker of stickers) {
                const card = document.createElement('div');
                card.className = 'asset-card';
                card.dataset.id = sticker.id;

                const img = await assetManager.loadImage(sticker.id);
                const imgEl = document.createElement('img');
                imgEl.src = img.src;

                const name = document.createElement('div');
                name.className = 'name';
                name.textContent = sticker.name;

                card.appendChild(imgEl);
                card.appendChild(name);

                card.addEventListener('click', () => addStickerToScene(sticker.id));
                grid.appendChild(card);
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
            const stickers = sceneCanvas.scene.stickers;

            list.innerHTML = '';

            stickers.forEach((sticker, index) => {
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
            });

            if (stickers.length === 0) {
                list.innerHTML = '<p style="text-align: center; color: #999; font-size: 0.9em;">No stickers added</p>';
            }
        }

        // Text style selection
        document.querySelectorAll('.style-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.style-btn').forEach(b => b.classList.remove('selected'));
                this.classList.add('selected');
                selectedTextStyle = this.dataset.style;
            });
        });

        // Use quick phrase
        function usePhrase(phrase) {
            document.getElementById('text-input').value = phrase;
        }

        // Add text to scene
        function addTextToScene() {
            const input = document.getElementById('text-input');
            const text = input.value.trim();

            if (!text) {
                alert('Please enter some text!');
                return;
            }

            sceneCanvas.addText(text, selectedTextStyle);
            updateTextList();

            // Clear input
            input.value = '';
        }

        // Update text list
        function updateTextList() {
            const list = document.getElementById('text-list');
            const texts = sceneCanvas.scene.texts;

            list.innerHTML = '';

            texts.forEach((text, index) => {
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
            });

            if (texts.length === 0) {
                list.innerHTML = '<p style="text-align: center; color: #999; font-size: 0.9em;">No text added</p>';
            }
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

            // Navigate to audio builder (will be created in Task 08)
            alert('Scene saved! Audio mixer coming in next task.');
            // window.location.href = '/audio-builder.php';
        }

        // Initialize on page load
        document.addEventListener('DOMContentLoaded', init);
    </script>
</body>
</html>
