<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Character Builder - Build a Brainrot</title>

    <link rel="stylesheet" href="/assets/css/style.css">
    <style>
        .builder-container {
            display: grid;
            grid-template-columns: 1fr 512px 1fr;
            gap: 20px;
            max-width: 1400px;
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

        #character-canvas {
            border: 2px solid #ddd;
            border-radius: 10px;
            margin: 0 auto;
            display: block;
            max-width: 100%;
            height: auto;
        }

        .section-title {
            font-size: 1.5em;
            font-weight: bold;
            margin-bottom: 15px;
            color: #333;
        }

        .asset-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
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
            width: 80px;
            height: 80px;
            object-fit: contain;
        }

        .asset-card .name {
            font-size: 0.9em;
            margin-top: 5px;
            color: #666;
        }

        .color-palette {
            display: grid;
            grid-template-columns: repeat(6, 1fr);
            gap: 10px;
            margin-bottom: 20px;
        }

        .color-swatch {
            width: 100%;
            aspect-ratio: 1;
            border-radius: 10px;
            cursor: pointer;
            border: 3px solid transparent;
            transition: all 0.2s;
        }

        .color-swatch:hover {
            transform: scale(1.1);
        }

        .color-swatch.selected {
            border-color: #333;
            box-shadow: 0 0 10px rgba(0,0,0,0.3);
        }

        .btn-group {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            margin-top: 20px;
        }

        .btn {
            flex: 1;
            min-width: 120px;
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

        .accessory-list {
            margin-top: 10px;
        }

        .accessory-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 10px;
            background: #f5f5f5;
            border-radius: 5px;
            margin-bottom: 5px;
        }

        .accessory-item button {
            background: #ff4444;
            color: white;
            border: none;
            border-radius: 5px;
            padding: 5px 10px;
            cursor: pointer;
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
            <h1 style="text-align: center; color: #667eea;">🧠 Character Builder</h1>
            <p style="text-align: center;">Create your brainrot character!</p>
        </header>

        <div class="builder-container">
            <!-- Left Sidebar: Body & Color -->
            <div class="builder-sidebar">
                <div class="section-title">1. Choose Body</div>
                <div class="asset-grid" id="body-grid"></div>

                <div class="section-title">2. Pick Color</div>
                <div class="color-palette" id="color-palette"></div>

                <button class="btn btn-secondary" onclick="randomizeColor()">🎲 Random Color</button>
            </div>

            <!-- Center: Canvas -->
            <div class="builder-canvas-area">
                <canvas id="character-canvas"></canvas>

                <div class="btn-group">
                    <button class="btn btn-secondary" onclick="resetCharacter()">🔄 Reset</button>
                    <button class="btn btn-secondary" onclick="exportCharacter()">💾 Save PNG</button>
                    <button class="btn btn-primary" onclick="nextStep()">Next Step →</button>
                </div>
            </div>

            <!-- Right Sidebar: Accessories -->
            <div class="builder-sidebar">
                <div class="section-title">3. Add Accessories</div>
                <div class="asset-grid" id="accessory-grid"></div>

                <div class="section-title">Current Accessories</div>
                <div class="accessory-list" id="accessory-list"></div>
            </div>
        </div>
    </div>

    <!-- Loading container -->
    <div id="loading-container"></div>

    <!-- Scripts -->
    <script src="/assets/js/AssetManager.js"></script>
    <script src="/assets/js/LoadingUI.js"></script>
    <script src="/assets/js/CharacterCanvas.js"></script>

    <script>
        // Global state
        let characterCanvas;
        const loadingUI = new LoadingUI();

        // Color palette
        const COLORS = [
            '#808080', // Default gray
            '#FF6B6B', // Red
            '#FFA500', // Orange
            '#FFD700', // Yellow
            '#7ED321', // Green
            '#4A90E2', // Blue
            '#9B59B6', // Purple
            '#F5A623', // Amber
            '#E91E63', // Pink
            '#00CED1', // Cyan
            '#8B4513', // Brown
            '#FFFFFF'  // White
        ];

        // Initialize
        async function init() {
            try {
                loadingUI.show({ title: 'Loading Character Builder...' });

                // Initialize asset manager
                await assetManager.init();

                // Initialize canvas
                characterCanvas = new CharacterCanvas('character-canvas');

                // Load UI
                await loadBodyGrid();
                loadColorPalette();
                await loadAccessoryGrid();

                loadingUI.hide();
            } catch (error) {
                console.error('Failed to initialize:', error);
                loadingUI.showError('Failed to load character builder');
            }
        }

        // Load body selection grid
        async function loadBodyGrid() {
            const bodies = assetManager.getAssetsByCategory('character-bodies');
            const grid = document.getElementById('body-grid');

            for (const body of bodies) {
                const card = document.createElement('div');
                card.className = 'asset-card';
                card.dataset.id = body.id;

                const img = await assetManager.loadImage(body.id);
                const imgEl = document.createElement('img');
                imgEl.src = img.src;

                const name = document.createElement('div');
                name.className = 'name';
                name.textContent = body.name;

                card.appendChild(imgEl);
                card.appendChild(name);

                card.addEventListener('click', () => selectBody(body.id));
                grid.appendChild(card);
            }

            // Select first body by default
            if (bodies.length > 0) {
                selectBody(bodies[0].id);
            }
        }

        // Select body
        async function selectBody(bodyId) {
            // Update UI
            document.querySelectorAll('#body-grid .asset-card').forEach(card => {
                card.classList.toggle('selected', card.dataset.id === bodyId);
            });

            // Update canvas
            await characterCanvas.setBody(bodyId);
        }

        // Load color palette
        function loadColorPalette() {
            const palette = document.getElementById('color-palette');

            COLORS.forEach(color => {
                const swatch = document.createElement('div');
                swatch.className = 'color-swatch';
                swatch.style.backgroundColor = color;
                swatch.dataset.color = color;

                if (color === '#808080') {
                    swatch.classList.add('selected');
                }

                swatch.addEventListener('click', () => selectColor(color));
                palette.appendChild(swatch);
            });
        }

        // Select color
        function selectColor(color) {
            // Update UI
            document.querySelectorAll('.color-swatch').forEach(swatch => {
                swatch.classList.toggle('selected', swatch.dataset.color === color);
            });

            // Update canvas
            characterCanvas.setBodyColor(color);
        }

        // Randomize color
        function randomizeColor() {
            const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
            selectColor(randomColor);
        }

        // Load accessory grid
        async function loadAccessoryGrid() {
            const accessories = assetManager.getAssetsByCategory('character-accessories');
            const grid = document.getElementById('accessory-grid');

            for (const accessory of accessories) {
                const card = document.createElement('div');
                card.className = 'asset-card';
                card.dataset.id = accessory.id;

                const img = await assetManager.loadImage(accessory.id);
                const imgEl = document.createElement('img');
                imgEl.src = img.src;

                const name = document.createElement('div');
                name.className = 'name';
                name.textContent = accessory.name;

                card.appendChild(imgEl);
                card.appendChild(name);

                card.addEventListener('click', () => addAccessory(accessory.id));
                grid.appendChild(card);
            }
        }

        // Add accessory
        async function addAccessory(accessoryId) {
            try {
                await characterCanvas.addAccessory(accessoryId);
                updateAccessoryList();
            } catch (error) {
                console.error('Failed to add accessory:', error);
                alert('Failed to add accessory');
            }
        }

        // Update accessory list
        function updateAccessoryList() {
            const list = document.getElementById('accessory-list');
            const accessories = characterCanvas.character.accessories;

            list.innerHTML = '';

            accessories.forEach((acc, index) => {
                const item = document.createElement('div');
                item.className = 'accessory-item';

                const name = document.createElement('span');
                name.textContent = acc.metadata?.name || acc.id;

                const removeBtn = document.createElement('button');
                removeBtn.textContent = '✕ Remove';
                removeBtn.onclick = () => {
                    characterCanvas.removeAccessory(index);
                    updateAccessoryList();
                };

                item.appendChild(name);
                item.appendChild(removeBtn);
                list.appendChild(item);
            });

            if (accessories.length === 0) {
                list.innerHTML = '<p style="text-align: center; color: #999;">No accessories added yet</p>';
            }
        }

        // Reset character
        function resetCharacter() {
            if (confirm('Reset character to default?')) {
                characterCanvas.clear();
                updateAccessoryList();

                // Reset to first body
                const firstBody = document.querySelector('#body-grid .asset-card');
                if (firstBody) {
                    selectBody(firstBody.dataset.id);
                }
            }
        }

        // Export character
        function exportCharacter() {
            characterCanvas.exportPNG('my-brainrot-character.png');
        }

        // Next step
        function nextStep() {
            // Validate that a body is selected
            if (!characterCanvas.character.body) {
                alert('Please select a character body first!');
                return;
            }

            // Save character data to sessionStorage
            const characterData = characterCanvas.getCharacterData();
            sessionStorage.setItem('character-data', JSON.stringify(characterData));

            // Navigate to scene builder
            window.location.href = '/scene-builder.php';
        }

        // Initialize on page load
        document.addEventListener('DOMContentLoaded', init);
    </script>
</body>
</html>
