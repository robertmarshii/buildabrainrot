<?php
// Password-protected status page: /status. HTTP Basic auth, any username.
// The password's bcrypt hash comes from the STATUS_PASSWORD_HASH environment variable (the hash itself,
// or the hash base64-encoded so it has no "$" characters). Prints no environment, config or secrets.
// With no usable STATUS_PASSWORD_HASH the page refuses everyone (fails closed).
declare(strict_types=1);

const STATUS_APP_NAME = 'buildabrainrot';
const STATUS_VERSION_FILE = '/srv/git-sha';

header('Cache-Control: no-store');
header('X-Robots-Tag: noindex');
header('Content-Type: text/plain; charset=utf-8');

function status_given_password(): ?string
{
    if (isset($_SERVER['PHP_AUTH_PW']) && is_string($_SERVER['PHP_AUTH_PW'])) {
        return $_SERVER['PHP_AUTH_PW'];
    }
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
    if (is_string($header) && stripos($header, 'Basic ') === 0) {
        $decoded = base64_decode(substr($header, 6), true);
        if ($decoded !== false && strpos($decoded, ':') !== false) {
            return explode(':', $decoded, 2)[1];
        }
    }
    return null;
}

/** The bcrypt hash from STATUS_PASSWORD_HASH, or null when it is missing or not a bcrypt hash. */
function status_env_password_hash(): ?string
{
    $isBcrypt = fn ($h): bool => is_string($h) && (bool) preg_match('/^\$2[aby]\$\d\d\$[.\/A-Za-z0-9]{53}$/', $h);
    $v = getenv('STATUS_PASSWORD_HASH');
    if (!is_string($v) || $v === '') {
        $v = $_ENV['STATUS_PASSWORD_HASH'] ?? '';
    }
    $v = trim((string) $v);
    if ($isBcrypt($v)) {
        return $v;
    }
    $decoded = base64_decode($v, true);
    if ($isBcrypt($decoded)) {
        return trim((string) $decoded);
    }
    return null;
}

$given = status_given_password();
$hash = status_env_password_hash();
// password_verify compares in constant time.
if ($given === null || $hash === null || !password_verify($given, $hash)) {
    http_response_code(401);
    header('WWW-Authenticate: Basic realm="status", charset="UTF-8"');
    echo "Unauthorized\n";
    exit;
}

$lines = [];
$allOk = true;
$add = function (string $check, bool $ok, string $why = '') use (&$lines, &$allOk): void {
    $lines[] = $check . '  Result: ' . ($ok ? 'OK' : 'FAIL, ' . $why);
    if (!$ok) {
        $allOk = false;
    }
};

$add('App: ' . STATUS_APP_NAME, true);

$sha = is_readable(STATUS_VERSION_FILE) ? trim((string) file_get_contents(STATUS_VERSION_FILE)) : '';
$shaOk = (bool) preg_match('/^[0-9a-f]{7,40}$/i', $sha);
$add('Version: ' . ($shaOk ? $sha : 'unknown'), $shaOk, 'the build did not record its git commit');

$patched = ['8.2' => '8.2.35', '8.3' => '8.3.36', '8.4' => '8.4.27', '8.5' => '8.5.12'];
$branch = PHP_MAJOR_VERSION . '.' . PHP_MINOR_VERSION;
$phpOk = PHP_EXTRA_VERSION === ''
    && isset($patched[$branch])
    && version_compare(PHP_MAJOR_VERSION . '.' . PHP_MINOR_VERSION . '.' . PHP_RELEASE_VERSION, $patched[$branch], '>=');
$add('PHP version: ' . PHP_VERSION, $phpOk, 'not patched');

foreach ($lines as $line) {
    echo $line, "\n";
}
if ($allOk) {
    echo "All good.\n";
}
