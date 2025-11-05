<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Build a Brainrot - Create & Share Your Own Brainrot Characters!</title>
    <meta name="description" content="Create silly brainrot characters with sounds and share them with friends! Free, fun, and kid-friendly. For ages 7+.">

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:title" content="Build a Brainrot">
    <meta property="og:description" content="Create and share your own brainrot characters! Free and kid-friendly.">
    <meta property="og:image" content="/assets/images/ui/og-image.png">
    <meta property="og:url" content="https://buildabrainrot.com">

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Build a Brainrot">
    <meta name="twitter:description" content="Create silly brainrot characters!">
    <meta name="twitter:image" content="/assets/images/ui/og-image.png">

    <!-- Favicon -->
    <link rel="icon" href="/assets/images/ui/favicon.png" type="image/png">

    <!-- Styles -->
    <link rel="stylesheet" href="/assets/css/home.css">
</head>
<body>
    <!-- Hero Section -->
    <section class="hero">
        <div class="hero-content">
            <div class="hero-mascot" id="rotto-mascot">
                <div class="mascot-emoji">🧠</div>
            </div>

            <h1 class="hero-title">
                <span class="title-main">BUILD A BRAINROT</span>
                <span class="title-sub">You don't just scroll — you BUILD them! 🔥</span>
            </h1>

            <p class="hero-description">
                Create wild characters, add silly sounds, and share with your friends!
            </p>

            <a href="/character-builder.php" class="btn-cta" id="main-cta">
                🎨 Make My Brainrot!
            </a>

            <div class="hero-badges">
                <span class="badge">✅ Free Forever</span>
                <span class="badge">✅ Kid-Friendly</span>
                <span class="badge">✅ No Signup</span>
            </div>
        </div>
    </section>

    <!-- Features Section -->
    <section class="features">
        <h2 class="section-title">How It Works</h2>

        <div class="feature-grid">
            <div class="feature-card">
                <div class="feature-icon">🎨</div>
                <h3>1. Pick a Character</h3>
                <p>Choose from sharks, cats, bananas, and more silly characters!</p>
            </div>

            <div class="feature-card">
                <div class="feature-icon">✨</div>
                <h3>2. Make it Yours</h3>
                <p>Add colors, accessories, stickers, and silly faces!</p>
            </div>

            <div class="feature-card">
                <div class="feature-icon">🎵</div>
                <h3>3. Add Sounds</h3>
                <p>Pick background music and add sound effects!</p>
            </div>

            <div class="feature-card">
                <div class="feature-icon">📤</div>
                <h3>4. Share It!</h3>
                <p>Get a link to share with friends or download as an image!</p>
            </div>
        </div>
    </section>

    <!-- Examples Section -->
    <section class="examples">
        <h2 class="section-title">Check Out These Examples!</h2>

        <div class="examples-grid">
            <div class="example-card" onclick="location.href='#'">
                <div class="example-placeholder">
                    <span class="example-emoji">🦈</span>
                </div>
                <span class="example-label">Silly Shark</span>
            </div>

            <div class="example-card" onclick="location.href='#'">
                <div class="example-placeholder">
                    <span class="example-emoji">🐱</span>
                </div>
                <span class="example-label">Cool Cat</span>
            </div>

            <div class="example-card" onclick="location.href='#'">
                <div class="example-placeholder">
                    <span class="example-emoji">🍌</span>
                </div>
                <span class="example-label">Goofy Banana</span>
            </div>
        </div>

        <div class="examples-cta">
            <a href="/character-builder.php" class="btn-secondary">
                ✨ Make Your Own!
            </a>
        </div>
    </section>

    <!-- Safety Section -->
    <section class="safety">
        <h2 class="section-title">Safe & Kid-Friendly</h2>

        <div class="safety-features">
            <div class="safety-item">
                <div class="safety-icon">✅</div>
                <h3>No Personal Info</h3>
                <p>No email, no password, no data collection</p>
            </div>

            <div class="safety-item">
                <div class="safety-icon">✅</div>
                <h3>Age-Appropriate</h3>
                <p>All content is reviewed and kid-friendly</p>
            </div>

            <div class="safety-item">
                <div class="safety-icon">✅</div>
                <h3>No Chat</h3>
                <p>No messaging, comments, or direct contact</p>
            </div>

            <div class="safety-item">
                <div class="safety-icon">✅</div>
                <h3>Always Free</h3>
                <p>No ads, no subscriptions, totally free</p>
            </div>
        </div>

        <div class="safety-cta">
            <p class="safety-note">
                <strong>Parents:</strong> Learn more on our
                <a href="/parents.php">Parent Information Page</a>
            </p>
        </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
        <div class="footer-content">
            <div class="footer-section">
                <h3>Build a Brainrot</h3>
                <p>Create and share silly brainrot characters! Free and safe for kids ages 7+.</p>
                <div class="footer-mascot">Made with 🧠 by Brainrot Labs</div>
            </div>

            <div class="footer-section">
                <h3>Links</h3>
                <ul class="footer-links">
                    <li><a href="/about.php">About</a></li>
                    <li><a href="/privacy.php">Privacy Policy</a></li>
                    <li><a href="/parents.php">For Parents</a></li>
                    <li><a href="/contact.php">Contact</a></li>
                </ul>
            </div>

            <div class="footer-section">
                <h3>Get Started</h3>
                <ul class="footer-links">
                    <li><a href="/character-builder.php">Character Builder</a></li>
                    <li><a href="/faq.php">FAQ</a></li>
                    <li><a href="#examples">Examples</a></li>
                </ul>
            </div>
        </div>

        <div class="footer-bottom">
            <p>&copy; 2025 Build a Brainrot. All rights reserved.</p>
            <p class="footer-attribution">A Serious Scientific Enterprise™</p>
        </div>
    </footer>

    <!-- Scripts -->
    <script src="/assets/js/home.js"></script>
</body>
</html>
