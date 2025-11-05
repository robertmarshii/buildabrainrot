<?php
/**
 * PREVIEW IMAGE API
 *
 * Generates preview images for social media sharing (Open Graph)
 * Caches generated images for 24 hours
 */

// Get encoded ID
$encoded = $_GET['id'] ?? null;

if (!$encoded) {
    http_response_code(400);
    die('Missing ID');
}

// Validate ID format
if (!preg_match('/^[A-Za-z0-9\-_~]+$/', $encoded)) {
    http_response_code(400);
    die('Invalid ID format');
}

// Check cache first
$cacheDir = __DIR__ . '/../cache/previews/';
$cacheFile = $cacheDir . md5($encoded) . '.png';

if (file_exists($cacheFile) && (time() - filemtime($cacheFile)) < 86400) {
    // Serve cached image (valid for 24 hours)
    header('Content-Type: image/png');
    header('Cache-Control: public, max-age=86400');
    readfile($cacheFile);
    exit;
}

// Generate new preview image
$width = 1200;
$height = 630; // Standard OG image size

$image = imagecreatetruecolor($width, $height);

// Create gradient background
for ($y = 0; $y < $height; $y++) {
    $ratio = $y / $height;
    $r = (int)(102 + $ratio * 16);
    $g = (int)(126 - $ratio * 51);
    $b = (int)(234 - $ratio * 72);
    $color = imagecolorallocate($image, $r, $g, $b);
    imagefilledrectangle($image, 0, $y, $width, $y + 1, $color);
}

// Add white text
$white = imagecolorallocate($image, 255, 255, 255);

// Title
$title = 'Check out my brainrot!';
imagettftext($image, 60, 0, 100, 280, $white, __DIR__ . '/../assets/fonts/arial.ttf', $title);

// Subtitle
$subtitle = 'Made on buildabrainrot.com';
imagettftext($image, 40, 0, 100, 360, $white, __DIR__ . '/../assets/fonts/arial.ttf', $subtitle);

// Emoji (if PHP supports it)
imagettftext($image, 80, 0, 100, 180, $white, __DIR__ . '/../assets/fonts/arial.ttf', '🧠');

// Save to cache
if (!is_dir($cacheDir)) {
    mkdir($cacheDir, 0755, true);
}
imagepng($image, $cacheFile);

// Output
header('Content-Type: image/png');
header('Cache-Control: public, max-age=86400');
imagepng($image);
imagedestroy($image);
?>
