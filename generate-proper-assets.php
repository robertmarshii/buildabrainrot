<?php
/**
 * Asset Generator - Creates proper SVG character assets
 */

$svgAssets = [
    'images/characters/bodies/char-body-banana.svg' => '<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <!-- Banana body -->
  <path d="M 256 50 Q 300 100 300 200 Q 300 400 256 450 Q 212 400 212 200 Q 212 100 256 50 Z" fill="#FFE135" stroke="#000" stroke-width="4"/>
  <ellipse cx="256" cy="200" rx="30" ry="40" fill="#FFD700"/>

  <!-- Eyes -->
  <circle cx="230" cy="180" r="15" fill="#000"/>
  <circle cx="282" cy="180" r="15" fill="#000"/>
  <circle cx="235" cy="175" r="5" fill="#fff"/>
  <circle cx="287" cy="175" r="5" fill="#fff"/>

  <!-- Mouth -->
  <path d="M 220 220 Q 256 240 292 220" stroke="#000" stroke-width="4" fill="none" stroke-linecap="round"/>
</svg>',

    'images/characters/bodies/char-body-cat.svg' => '<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <!-- Cat body -->
  <ellipse cx="256" cy="300" rx="120" ry="150" fill="#FF9966" stroke="#000" stroke-width="4"/>

  <!-- Cat head -->
  <circle cx="256" cy="180" r="90" fill="#FF9966" stroke="#000" stroke-width="4"/>

  <!-- Ears -->
  <path d="M 180 120 L 160 60 L 200 100 Z" fill="#FF9966" stroke="#000" stroke-width="4"/>
  <path d="M 332 120 L 352 60 L 312 100 Z" fill="#FF9966" stroke="#000" stroke-width="4"/>

  <!-- Eyes -->
  <circle cx="230" cy="170" r="18" fill="#000"/>
  <circle cx="282" cy="170" r="18" fill="#000"/>
  <circle cx="235" cy="165" r="6" fill="#fff"/>
  <circle cx="287" cy="165" r="6" fill="#fff"/>

  <!-- Nose -->
  <path d="M 256 190 L 246 200 L 266 200 Z" fill="#FF69B4" stroke="#000" stroke-width="2"/>

  <!-- Mouth -->
  <path d="M 256 200 L 256 210 M 256 210 Q 240 220 230 215 M 256 210 Q 272 220 282 215" stroke="#000" stroke-width="3" fill="none" stroke-linecap="round"/>

  <!-- Whiskers -->
  <line x1="180" y1="190" x2="120" y2="185" stroke="#000" stroke-width="2"/>
  <line x1="180" y1="200" x2="120" y2="205" stroke="#000" stroke-width="2"/>
  <line x1="332" y1="190" x2="392" y2="185" stroke="#000" stroke-width="2"/>
  <line x1="332" y1="200" x2="392" y2="205" stroke="#000" stroke-width="2"/>
</svg>',

    'images/characters/bodies/char-body-cube.svg' => '<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <!-- 3D Cube effect -->
  <!-- Front face -->
  <rect x="156" y="156" width="200" height="200" fill="#6495ED" stroke="#000" stroke-width="4"/>

  <!-- Top face -->
  <path d="M 156 156 L 256 106 L 456 106 L 356 156 Z" fill="#87CEEB" stroke="#000" stroke-width="4"/>

  <!-- Right face -->
  <path d="M 356 156 L 456 106 L 456 306 L 356 356 Z" fill="#4169E1" stroke="#000" stroke-width="4"/>

  <!-- Eyes on front face -->
  <circle cx="220" cy="220" r="20" fill="#fff" stroke="#000" stroke-width="3"/>
  <circle cx="292" cy="220" r="20" fill="#fff" stroke="#000" stroke-width="3"/>
  <circle cx="225" cy="220" r="12" fill="#000"/>
  <circle cx="297" cy="220" r="12" fill="#000"/>

  <!-- Smile -->
  <path d="M 200 280 Q 256 310 312 280" stroke="#000" stroke-width="4" fill="none" stroke-linecap="round"/>
</svg>',

    'images/characters/bodies/char-body-dog.svg' => '<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <!-- Dog body -->
  <ellipse cx="256" cy="320" rx="110" ry="140" fill="#D2691E" stroke="#000" stroke-width="4"/>

  <!-- Dog head -->
  <ellipse cx="256" cy="170" rx="95" ry="80" fill="#D2691E" stroke="#000" stroke-width="4"/>

  <!-- Snout -->
  <ellipse cx="256" cy="200" rx="60" ry="45" fill="#F4A460" stroke="#000" stroke-width="4"/>

  <!-- Ears -->
  <ellipse cx="180" cy="150" rx="35" ry="70" fill="#A0522D" stroke="#000" stroke-width="4" transform="rotate(-20 180 150)"/>
  <ellipse cx="332" cy="150" rx="35" ry="70" fill="#A0522D" stroke="#000" stroke-width="4" transform="rotate(20 332 150)"/>

  <!-- Eyes -->
  <circle cx="230" cy="155" r="16" fill="#000"/>
  <circle cx="282" cy="155" r="16" fill="#000"/>
  <circle cx="235" cy="150" r="5" fill="#fff"/>
  <circle cx="287" cy="150" r="5" fill="#fff"/>

  <!-- Nose -->
  <ellipse cx="256" cy="195" rx="15" ry="12" fill="#000"/>

  <!-- Mouth -->
  <path d="M 256 207 Q 240 220 230 215 M 256 207 Q 272 220 282 215" stroke="#000" stroke-width="3" fill="none" stroke-linecap="round"/>
</svg>',

    'images/characters/bodies/char-body-pickle.svg' => '<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <!-- Pickle body -->
  <path d="M 256 50 Q 310 80 310 250 Q 310 420 256 460 Q 202 420 202 250 Q 202 80 256 50 Z" fill="#90EE90" stroke="#228B22" stroke-width="4"/>

  <!-- Pickle bumps -->
  <circle cx="230" cy="120" r="12" fill="#7CCD7C"/>
  <circle cx="280" cy="140" r="14" fill="#7CCD7C"/>
  <circle cx="240" cy="180" r="10" fill="#7CCD7C"/>
  <circle cx="275" cy="210" r="13" fill="#7CCD7C"/>
  <circle cx="235" cy="250" r="11" fill="#7CCD7C"/>
  <circle cx="280" cy="290" r="12" fill="#7CCD7C"/>
  <circle cx="245" cy="330" r="10" fill="#7CCD7C"/>
  <circle cx="270" cy="370" r="13" fill="#7CCD7C"/>

  <!-- Eyes -->
  <circle cx="230" cy="200" r="18" fill="#fff" stroke="#000" stroke-width="3"/>
  <circle cx="282" cy="200" r="18" fill="#fff" stroke="#000" stroke-width="3"/>
  <circle cx="235" cy="200" r="10" fill="#000"/>
  <circle cx="287" cy="200" r="10" fill="#000"/>

  <!-- Grin -->
  <path d="M 210 240 Q 256 270 302 240" stroke="#000" stroke-width="4" fill="none" stroke-linecap="round"/>
</svg>',

    'images/accessories/acc-head-sunglasses.svg' => '<?xml version="1.0" encoding="UTF-8"?>
<svg width="256" height="128" viewBox="0 0 256 128" xmlns="http://www.w3.org/2000/svg">
  <!-- Left lens -->
  <rect x="20" y="30" width="80" height="60" rx="10" fill="#333" stroke="#000" stroke-width="3"/>
  <rect x="25" y="35" width="70" height="50" rx="8" fill="#1a1a1a" opacity="0.9"/>

  <!-- Bridge -->
  <rect x="100" y="55" width="56" height="10" rx="5" fill="#333" stroke="#000" stroke-width="2"/>

  <!-- Right lens -->
  <rect x="156" y="30" width="80" height="60" rx="10" fill="#333" stroke="#000" stroke-width="3"/>
  <rect x="161" y="35" width="70" height="50" rx="8" fill="#1a1a1a" opacity="0.9"/>

  <!-- Left arm -->
  <line x1="20" y1="60" x2="5" y2="60" stroke="#000" stroke-width="3" stroke-linecap="round"/>

  <!-- Right arm -->
  <line x1="236" y1="60" x2="251" y2="60" stroke="#000" stroke-width="3" stroke-linecap="round"/>

  <!-- Glare effects -->
  <rect x="30" y="40" width="15" height="8" rx="2" fill="#fff" opacity="0.4"/>
  <rect x="166" y="40" width="15" height="8" rx="2" fill="#fff" opacity="0.4"/>
</svg>',

    'images/accessories/acc-head-crown.svg' => '<?xml version="1.0" encoding="UTF-8"?>
<svg width="256" height="256" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
  <!-- Crown base -->
  <path d="M 40 150 L 60 70 L 90 110 L 128 60 L 166 110 L 196 70 L 216 150 Z" fill="#FFD700" stroke="#FFA500" stroke-width="3"/>
  <rect x="40" y="150" width="176" height="30" rx="5" fill="#FFD700" stroke="#FFA500" stroke-width="3"/>

  <!-- Jewels -->
  <circle cx="70" cy="100" r="8" fill="#FF1493"/>
  <circle cx="128" cy="80" r="10" fill="#FF1493"/>
  <circle cx="186" cy="100" r="8" fill="#FF1493"/>

  <!-- More jewels on base -->
  <circle cx="80" cy="165" r="6" fill="#FF1493"/>
  <circle cx="128" cy="165" r="7" fill="#00CED1"/>
  <circle cx="176" cy="165" r="6" fill="#FF1493"/>

  <!-- Shine effects -->
  <path d="M 65 95 L 70 100 L 65 105" stroke="#FFE4E1" stroke-width="2" fill="none"/>
  <path d="M 123 75 L 128 80 L 123 85" stroke="#FFE4E1" stroke-width="2" fill="none"/>
</svg>',

    'images/accessories/acc-head-hat.svg' => '<?xml version="1.0" encoding="UTF-8"?>
<svg width="256" height="256" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
  <!-- Hat brim -->
  <ellipse cx="128" cy="150" rx="100" ry="20" fill="#8B4513" stroke="#654321" stroke-width="3"/>

  <!-- Hat crown -->
  <path d="M 70 150 Q 70 70 128 60 Q 186 70 186 150 Z" fill="#A0522D" stroke="#654321" stroke-width="3"/>

  <!-- Hat band -->
  <ellipse cx="128" cy="135" rx="60" ry="10" fill="#654321"/>

  <!-- Hat crease -->
  <path d="M 128 60 Q 128 100 128 150" stroke="#654321" stroke-width="2" opacity="0.5"/>
</svg>'
];

$pngBackgrounds = [
    'images/backgrounds/bg-classroom.png' => function() {
        $img = imagecreatetruecolor(1920, 1080);

        // Sky blue background
        $skyBlue = imagecolorallocate($img, 220, 240, 255);
        imagefilledrectangle($img, 0, 0, 1920, 1080, $skyBlue);

        // Floor
        $floor = imagecolorallocate($img, 200, 180, 160);
        imagefilledrectangle($img, 0, 800, 1920, 1080, $floor);

        // Window
        $window = imagecolorallocate($img, 180, 220, 255);
        imagefilledrectangle($img, 200, 100, 500, 400, $window);
        $windowFrame = imagecolorallocate($img, 100, 100, 100);
        imagerectangle($img, 200, 100, 500, 400, $windowFrame);
        imageline($img, 350, 100, 350, 400, $windowFrame);
        imageline($img, 200, 250, 500, 250, $windowFrame);

        // Blackboard
        $blackboard = imagecolorallocate($img, 40, 60, 40);
        imagefilledrectangle($img, 700, 200, 1400, 600, $blackboard);
        $boardFrame = imagecolorallocate($img, 139, 90, 43);
        imagerectangle($img, 690, 190, 1410, 610, $boardFrame);

        // Desk
        $desk = imagecolorallocate($img, 160, 120, 80);
        imagefilledrectangle($img, 400, 700, 800, 800, $desk);
        imagefilledrectangle($img, 420, 800, 460, 950, $desk);
        imagefilledrectangle($img, 740, 800, 780, 950, $desk);

        return $img;
    },

    'images/backgrounds/bg-space.png' => function() {
        $img = imagecreatetruecolor(1920, 1080);

        // Dark space background
        $space = imagecolorallocate($img, 10, 10, 30);
        imagefilledrectangle($img, 0, 0, 1920, 1080, $space);

        // Stars
        $white = imagecolorallocate($img, 255, 255, 255);
        $yellow = imagecolorallocate($img, 255, 255, 200);
        for ($i = 0; $i < 200; $i++) {
            $x = rand(0, 1920);
            $y = rand(0, 1080);
            $size = rand(1, 3);
            $color = rand(0, 1) ? $white : $yellow;
            imagefilledellipse($img, $x, $y, $size, $size, $color);
        }

        // Planets
        $planet1 = imagecolorallocate($img, 255, 150, 100);
        imagefilledellipse($img, 300, 200, 150, 150, $planet1);

        $planet2 = imagecolorallocate($img, 100, 150, 255);
        imagefilledellipse($img, 1600, 800, 200, 200, $planet2);

        // Moon
        $moon = imagecolorallocate($img, 220, 220, 220);
        imagefilledellipse($img, 1700, 150, 100, 100, $moon);

        return $img;
    },

    'images/backgrounds/bg-city.png' => function() {
        $img = imagecreatetruecolor(1920, 1080);

        // Sky gradient
        $skyTop = imagecolorallocate($img, 100, 150, 255);
        $skyBottom = imagecolorallocate($img, 150, 200, 255);
        imagefilledrectangle($img, 0, 0, 1920, 1080, $skyBottom);

        // Buildings
        $colors = [
            imagecolorallocate($img, 100, 100, 120),
            imagecolorallocate($img, 120, 120, 140),
            imagecolorallocate($img, 80, 80, 100),
            imagecolorallocate($img, 90, 90, 110)
        ];

        $buildings = [
            ['x' => 0, 'width' => 300, 'height' => 600],
            ['x' => 300, 'width' => 250, 'height' => 800],
            ['x' => 550, 'width' => 280, 'height' => 500],
            ['x' => 830, 'width' => 300, 'height' => 750],
            ['x' => 1130, 'width' => 250, 'height' => 550],
            ['x' => 1380, 'width' => 280, 'height' => 700],
            ['x' => 1660, 'width' => 260, 'height' => 600]
        ];

        foreach ($buildings as $i => $b) {
            $color = $colors[$i % count($colors)];
            $y = 1080 - $b['height'];
            imagefilledrectangle($img, $b['x'], $y, $b['x'] + $b['width'], 1080, $color);

            // Windows
            $windowColor = imagecolorallocate($img, 255, 255, 200);
            for ($wy = $y + 30; $wy < 1080 - 30; $wy += 50) {
                for ($wx = $b['x'] + 30; $wx < $b['x'] + $b['width'] - 30; $wx += 40) {
                    if (rand(0, 3) > 0) { // 75% chance of window being lit
                        imagefilledrectangle($img, $wx, $wy, $wx + 15, $wy + 25, $windowColor);
                    }
                }
            }
        }

        // Ground
        $ground = imagecolorallocate($img, 60, 60, 70);
        imagefilledrectangle($img, 0, 1040, 1920, 1080, $ground);

        return $img;
    }
];

echo "Generating proper assets...\n\n";

// Create SVG assets
foreach ($svgAssets as $path => $svg) {
    $fullPath = __DIR__ . '/public/assets/' . $path;
    $dir = dirname($fullPath);
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
    file_put_contents($fullPath, $svg);
    echo "✓ Created SVG: $path\n";
}

// Create PNG backgrounds
foreach ($pngBackgrounds as $path => $generator) {
    $fullPath = __DIR__ . '/public/assets/' . $path;
    $dir = dirname($fullPath);
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
    $img = $generator();
    imagepng($img, $fullPath);
    imagedestroy($img);
    echo "✓ Created PNG: $path\n";
}

echo "\n✓ All proper assets generated successfully!\n";
echo "\nNote: SVG assets can be used in the app with proper MIME types.\n";
echo "You may need to update manifest.json to reference .svg files instead of .png for characters/accessories.\n";
