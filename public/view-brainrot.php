<?php
/**
 * BRAINROT VIEW PAGE
 *
 * Displays shared brainrots from encoded URLs
 * Route: /b/{encoded-id}
 */

// Get encoded ID from URL
$encoded = $_GET['id'] ?? null;

if (!$encoded) {
    http_response_code(400);
    die('Missing brainrot ID');
}

// Basic validation: only allow URL-safe base64 characters
if (!preg_match('/^[A-Za-z0-9\-_~]+$/', $encoded)) {
    http_response_code(400);
    die('Invalid brainrot ID format');
}

// For social media crawlers, generate preview
$userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
$isCrawler = preg_match('/bot|crawler|spider|facebook|twitter|linkedin|pinterest/i', $userAgent);

// Default preview image
$previewUrl = "https://" . ($_SERVER['HTTP_HOST'] ?? 'buildabrainrot.com') . "/assets/images/ui/og-image.png";

// Full URL for sharing
$fullUrl = "https://" . ($_SERVER['HTTP_HOST'] ?? 'buildabrainrot.com') . "/b/" . htmlspecialchars($encoded);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Check out my brainrot! - buildabrainrot</title>

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="<?php echo $fullUrl; ?>">
    <meta property="og:title" content="Check out my brainrot!">
    <meta property="og:description" content="I made this silly creation on buildabrainrot! Click to see it.">
    <meta property="og:image" content="<?php echo $previewUrl; ?>">

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="<?php echo $fullUrl; ?>">
    <meta name="twitter:title" content="Check out my brainrot!">
    <meta name="twitter:description" content="I made this silly creation on buildabrainrot!">
    <meta name="twitter:image" content="<?php echo $previewUrl; ?>">

    <!-- Favicon -->
    <link rel="icon" href="/assets/images/ui/favicon.png" type="image/png">

    <!-- Styles -->
    <link rel="stylesheet" href="/assets/css/view.css">
</head>
<body>
    <!-- Loading Screen -->
    <div id="loading-screen" class="loading-screen">
        <div class="loading-content">
            <h1>🧠 Loading Brainrot...</h1>
            <div class="progress-bar">
                <div class="progress-fill" id="progress-fill"></div>
            </div>
            <p id="loading-status">Initializing...</p>
            <p id="loading-percentage">0%</p>
        </div>
    </div>

    <!-- Error Screen -->
    <div id="error-screen" class="error-screen" style="display: none;">
        <div class="error-content">
            <h1>😵 Oops!</h1>
            <p id="error-message">Something went wrong loading this brainrot.</p>
            <button onclick="window.location.href='/'" class="btn-primary">
                🎨 Make Your Own Brainrot
            </button>
        </div>
    </div>

    <!-- View Screen -->
    <div id="view-screen" class="view-screen" style="display: none;">
        <!-- Canvas -->
        <canvas id="brainrot-canvas"></canvas>

        <!-- Audio Controls -->
        <div id="audio-controls" class="audio-controls">
            <button id="btn-mute" class="control-btn" title="Mute/Unmute">🔊</button>
            <div class="playback-bar">
                <div class="playback-progress" id="playback-progress"></div>
            </div>
            <span id="playback-time">0:00</span>
        </div>

        <!-- Action Buttons -->
        <div id="action-buttons" class="action-buttons">
            <button id="btn-replay" class="btn-action" title="Replay">🔁 Replay</button>
            <button id="btn-remix" class="btn-action" title="Remix this brainrot">🎨 Remix This</button>
            <button id="btn-share" class="btn-action" title="Share">📤 Share</button>
            <button id="btn-download" class="btn-action" title="Download as image">💾 Download</button>
        </div>

        <!-- Branding -->
        <div class="branding">
            <a href="/" title="Make your own brainrot">Made with buildabrainrot.com</a>
        </div>
    </div>

    <!-- Scripts -->
    <!-- Compression library for decoding -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pako/2.1.0/pako.min.js"></script>

    <!-- Core libraries -->
    <script src="/assets/js/AssetManager.js"></script>
    <script src="/assets/js/BrainrotEncoder.js"></script>
    <script src="/assets/js/CharacterCanvas.js"></script>
    <script src="/assets/js/SceneCanvas.js"></script>
    <script src="/assets/js/AudioMixer.js"></script>
    <script src="/assets/js/BrainrotViewer.js"></script>

    <script>
        // Get encoded data from URL
        const encodedData = '<?php echo addslashes($encoded); ?>';

        // Initialize viewer
        window.addEventListener('DOMContentLoaded', () => {
            const viewer = new BrainrotViewer('brainrot-canvas', encodedData);
            viewer.load();
        });
    </script>
</body>
</html>
