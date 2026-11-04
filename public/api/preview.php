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
if (!is_string($encoded) || strlen($encoded) > 8000 || !preg_match('/^[A-Za-z0-9\-_~]+$/', $encoded)) {
    http_response_code(400);
    die('Invalid ID format');
}

/**
 * Decode a share ID the same way BrainrotEncoder.js does: "c_" (zlib) or "u_"
 * prefix, then URL-safe base64 (-_~ for +/=) of the JSON. Returns null unless it
 * is a real brainrot (has character.body and scene.background), so random IDs
 * cannot fill the preview cache.
 */
function decode_brainrot(string $encoded): ?array
{
    $prefix = substr($encoded, 0, 2);
    if ($prefix !== 'c_' && $prefix !== 'u_') {
        return null;
    }
    $raw = base64_decode(strtr(substr($encoded, 2), '-_~', '+/='), true);
    if ($raw === false) {
        return null;
    }
    if ($prefix === 'c_') {
        $raw = @zlib_decode($raw, 100000);
        if ($raw === false) {
            return null;
        }
    }
    $data = json_decode($raw, true);
    if (!is_array($data) || empty($data['character']['body']) || empty($data['scene']['background'])) {
        return null;
    }
    return $data;
}

if (decode_brainrot($encoded) === null) {
    http_response_code(400);
    die('Invalid ID');
}

$font = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';
if (!function_exists('imagettftext') || !is_file($font)) {
    http_response_code(503);
    error_log('preview.php: GD with FreeType or the DejaVu font is missing');
    die('Preview unavailable');
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
imagettftext($image, 60, 0, 100, 280, $white, $font, $title);

// Subtitle
$subtitle = 'Made on buildabrainrot.com';
imagettftext($image, 40, 0, 100, 360, $white, $font, $subtitle);

// Save to cache
if (!is_dir($cacheDir)) {
    @mkdir($cacheDir, 0755, true);
}
if (is_dir($cacheDir) && is_writable($cacheDir)) {
    imagepng($image, $cacheFile);
}

// Output
header('Content-Type: image/png');
header('Cache-Control: public, max-age=86400');
imagepng($image);
imagedestroy($image);
?>
