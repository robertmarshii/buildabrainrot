<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <?php
    // Extract encoded data from URL
    $encoded = $_GET['id'] ?? '';

    // Basic security validation
    if (empty($encoded)) {
        http_response_code(400);
        die('<h1>400 Bad Request</h1><p>Missing brainrot ID</p>');
    }

    // Validate format (only allow safe characters)
    if (!preg_match('/^[A-Za-z0-9\-_~]+$/', $encoded)) {
        http_response_code(400);
        die('<h1>400 Bad Request</h1><p>Invalid brainrot ID format</p>');
    }

    // Check reasonable length (prevent abuse)
    if (strlen($encoded) > 5000) {
        http_response_code(400);
        die('<h1>400 Bad Request</h1><p>Brainrot ID too long</p>');
    }
    ?>

    <title>View Brainrot - Build a Brainrot</title>

    <!-- Meta tags for social sharing -->
    <meta property="og:title" content="Check out my brainrot creation!" />
    <meta property="og:description" content="I made this on Build a Brainrot - create your own silly meme characters!" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="<?php echo htmlspecialchars($_SERVER['REQUEST_URI']); ?>" />
    <meta property="og:image" content="/assets/images/build-a-brainrot-logo.png" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Check out my brainrot creation!" />
    <meta name="twitter:description" content="I made this on Build a Brainrot!" />
    <meta name="twitter:image" content="/assets/images/build-a-brainrot-logo.png" />

    <!-- Stylesheets -->
    <link rel="stylesheet" href="/assets/css/style.css">

    <!-- Compression library (pako.js) -->
    <script src="/assets/js/pako.min.js" defer></script>

    <!-- Brainrot libraries -->
    <script src="/assets/js/BrainrotEncoder.js" defer></script>
    <script src="/assets/js/BrainrotValidator.js" defer></script>
    <script src="/assets/js/BrainrotUtils.js" defer></script>

    <style>
        body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .container {
            max-width: 1200px;
            margin: 20px;
            background: white;
            border-radius: 20px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            overflow: hidden;
        }

        .header {
            background: linear-gradient(90deg, #ff6b6b, #f06595, #cc5de8);
            color: white;
            padding: 30px;
            text-align: center;
        }

        .header h1 {
            margin: 0;
            font-size: 2.5em;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }

        .canvas-container {
            position: relative;
            width: 100%;
            max-width: 800px;
            margin: 40px auto;
            background: #f8f9fa;
            border-radius: 10px;
            overflow: hidden;
        }

        #brainrot-canvas {
            width: 100%;
            height: auto;
            display: block;
        }

        .loading {
            text-align: center;
            padding: 60px 20px;
        }

        .loading-spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #667eea;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .error {
            background: #fff3cd;
            border: 2px solid #ffc107;
            border-radius: 10px;
            padding: 20px;
            margin: 40px;
            text-align: center;
        }

        .error h2 {
            color: #856404;
            margin-top: 0;
        }

        .actions {
            padding: 30px;
            text-align: center;
            background: #f8f9fa;
        }

        .btn {
            display: inline-block;
            padding: 12px 30px;
            margin: 10px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 25px;
            font-weight: bold;
            transition: transform 0.2s, box-shadow 0.2s;
            border: none;
            cursor: pointer;
            font-size: 1em;
        }

        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }

        .btn-secondary {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }

        .info {
            padding: 20px;
            background: #e7f3ff;
            border-left: 4px solid #2196F3;
            margin: 20px 40px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧠 Build a Brainrot</h1>
            <p>View Shared Creation</p>
        </div>

        <div id="content">
            <div class="loading">
                <div class="loading-spinner"></div>
                <p>Loading brainrot...</p>
            </div>
        </div>

        <div class="actions">
            <a href="/index.php" class="btn">Make Your Own Brainrot</a>
            <button id="copy-link-btn" class="btn btn-secondary" style="display:none;">Copy Link</button>
        </div>
    </div>

    <script>
        // Encoded data from PHP
        const encodedData = <?php echo json_encode($encoded); ?>;

        // Decode and display brainrot
        document.addEventListener('DOMContentLoaded', function() {
            try {
                // Decode the brainrot data
                const brainrotData = BrainrotEncoder.decode(encodedData);

                console.log('Decoded brainrot:', brainrotData);

                // Display the brainrot (placeholder for now - will be implemented in Task 06-09)
                displayBrainrot(brainrotData);

                // Show copy link button
                document.getElementById('copy-link-btn').style.display = 'inline-block';

                // Setup copy button
                document.getElementById('copy-link-btn').addEventListener('click', async function() {
                    try {
                        await BrainrotUtils.copyShareLink(brainrotData);
                        this.textContent = '✓ Link Copied!';
                        setTimeout(() => {
                            this.textContent = 'Copy Link';
                        }, 2000);
                    } catch (error) {
                        console.error('Failed to copy:', error);
                        alert('Failed to copy link. Please copy manually from the address bar.');
                    }
                });

            } catch (error) {
                console.error('Failed to decode brainrot:', error);
                showError(error.message);
            }
        });

        function displayBrainrot(data) {
            // Create HTML for displaying the brainrot
            const contentDiv = document.getElementById('content');

            const html = `
                <div class="canvas-container">
                    <canvas id="brainrot-canvas" width="800" height="800"></canvas>
                </div>

                <div class="info">
                    <h3>Brainrot Details</h3>
                    <p><strong>Character:</strong> ${data.character?.body || 'Unknown'}</p>
                    <p><strong>Background:</strong> ${data.scene?.background || 'Unknown'}</p>
                    <p><strong>Music:</strong> ${data.audio?.music?.id || 'None'}</p>
                    <p><strong>Created:</strong> ${data.metadata?.created || 'Unknown'}</p>
                </div>
            `;

            contentDiv.innerHTML = html;

            // TODO: Actually render the brainrot on canvas (Task 06-09)
            // For now, just show a placeholder
            renderPlaceholder(data);
        }

        function renderPlaceholder(data) {
            const canvas = document.getElementById('brainrot-canvas');
            if (!canvas) return;

            const ctx = canvas.getContext('2d');

            // Draw a simple placeholder
            ctx.fillStyle = '#f0f0f0';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = '#333';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Brainrot Preview', canvas.width / 2, canvas.height / 2 - 40);

            ctx.font = '18px Arial';
            ctx.fillText(`Character: ${data.character?.body || 'Unknown'}`, canvas.width / 2, canvas.height / 2);
            ctx.fillText(`Background: ${data.scene?.background || 'Unknown'}`, canvas.width / 2, canvas.height / 2 + 30);

            ctx.font = '14px Arial';
            ctx.fillStyle = '#666';
            ctx.fillText('(Full rendering coming in Task 06-09)', canvas.width / 2, canvas.height / 2 + 60);
        }

        function showError(message) {
            const contentDiv = document.getElementById('content');
            contentDiv.innerHTML = `
                <div class="error">
                    <h2>😵 Oops!</h2>
                    <p>${message}</p>
                    <p>This brainrot might be corrupted or invalid.</p>
                </div>
            `;
        }
    </script>
</body>
</html>
