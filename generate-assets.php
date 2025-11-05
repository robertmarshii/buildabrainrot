<?php
/**
 * Asset Generator - Creates simple colored block assets
 */

// Asset definitions with colors
$assets = [
    // Character Bodies
    'images/characters/bodies/char-body-banana.png' => [
        'width' => 512, 'height' => 512, 'color' => [255, 255, 100], 'shape' => 'rounded'
    ],
    'images/characters/bodies/char-body-cat.png' => [
        'width' => 512, 'height' => 512, 'color' => [255, 150, 100], 'shape' => 'rounded'
    ],
    'images/characters/bodies/char-body-cube.png' => [
        'width' => 512, 'height' => 512, 'color' => [100, 150, 255], 'shape' => 'square'
    ],
    'images/characters/bodies/char-body-dog.png' => [
        'width' => 512, 'height' => 512, 'color' => [200, 150, 100], 'shape' => 'rounded'
    ],
    'images/characters/bodies/char-body-pickle.png' => [
        'width' => 512, 'height' => 512, 'color' => [100, 200, 100], 'shape' => 'rounded'
    ],

    // Accessories
    'images/accessories/acc-head-sunglasses.png' => [
        'width' => 256, 'height' => 128, 'color' => [50, 50, 50], 'shape' => 'rectangle'
    ],
    'images/accessories/acc-head-crown.png' => [
        'width' => 256, 'height' => 256, 'color' => [255, 215, 0], 'shape' => 'triangle'
    ],
    'images/accessories/acc-head-hat.png' => [
        'width' => 256, 'height' => 256, 'color' => [150, 75, 0], 'shape' => 'rectangle'
    ],

    // Backgrounds
    'images/backgrounds/bg-classroom.png' => [
        'width' => 1920, 'height' => 1080, 'color' => [220, 240, 255], 'shape' => 'solid'
    ],
    'images/backgrounds/bg-space.png' => [
        'width' => 1920, 'height' => 1080, 'color' => [20, 20, 60], 'shape' => 'solid'
    ],
    'images/backgrounds/bg-city.png' => [
        'width' => 1920, 'height' => 1080, 'color' => [100, 150, 200], 'shape' => 'solid'
    ]
];

function createAsset($path, $config) {
    $dir = dirname($path);
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }

    $img = imagecreatetruecolor($config['width'], $config['height']);

    // Enable alpha blending for transparency
    imagealphablending($img, false);
    imagesavealpha($img, true);

    // Create transparent background
    $transparent = imagecolorallocatealpha($img, 0, 0, 0, 127);
    imagefill($img, 0, 0, $transparent);
    imagealphablending($img, true);

    // Create the main color
    $color = imagecolorallocate($img, $config['color'][0], $config['color'][1], $config['color'][2]);

    switch ($config['shape']) {
        case 'solid':
            // Full solid color (for backgrounds)
            imagefilledrectangle($img, 0, 0, $config['width'], $config['height'], $color);
            break;

        case 'square':
            // Centered square with 20% padding
            $padding = (int)($config['width'] * 0.1);
            imagefilledrectangle($img, $padding, $padding, $config['width'] - $padding, $config['height'] - $padding, $color);
            break;

        case 'rounded':
            // Centered rounded rectangle (ellipse)
            $padding = (int)($config['width'] * 0.1);
            imagefilledellipse($img, $config['width'] / 2, $config['height'] / 2, $config['width'] - $padding * 2, $config['height'] - $padding * 2, $color);
            break;

        case 'rectangle':
            // Horizontal rectangle
            $paddingX = (int)($config['width'] * 0.1);
            $paddingY = (int)($config['height'] * 0.2);
            imagefilledrectangle($img, $paddingX, $paddingY, $config['width'] - $paddingX, $config['height'] - $paddingY, $color);
            break;

        case 'triangle':
            // Triangle pointing up
            $points = [
                $config['width'] / 2, (int)($config['height'] * 0.1),  // Top point
                (int)($config['width'] * 0.1), (int)($config['height'] * 0.9),  // Bottom left
                (int)($config['width'] * 0.9), (int)($config['height'] * 0.9)   // Bottom right
            ];
            imagefilledpolygon($img, $points, 3, $color);
            break;
    }

    // Save as PNG
    imagepng($img, $path);
    imagedestroy($img);

    echo "✓ Created: $path\n";
}

// Create all assets
echo "Generating assets...\n\n";
foreach ($assets as $path => $config) {
    createAsset(__DIR__ . '/public/assets/' . $path, $config);
}

echo "\n✓ All assets generated successfully!\n";
