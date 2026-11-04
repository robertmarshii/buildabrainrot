<?php
// Shared footer with the legal links, for every page except the home page (which has its own big footer).
// Included with: include __DIR__ . '/includes/legal-footer.php';  Set $legalFooterOverlay = true on the
// full-screen creation viewer to show it as a small corner bar instead.
if (basename($_SERVER['SCRIPT_FILENAME'] ?? '') === basename(__FILE__)) { http_response_code(404); exit; }
$legalFooterClass = !empty($legalFooterOverlay) ? 'legal-footer legal-footer--overlay' : 'legal-footer';
?>
<link rel="stylesheet" href="/assets/css/legal-footer.css">
<footer class="<?= $legalFooterClass ?>">
    <nav aria-label="Site information">
        <ul>
            <li><a href="/parents">For Parents</a></li>
            <li><a href="/privacy">Privacy</a></li>
            <li><a href="/privacy#cookies">Cookies</a></li>
            <li><a href="/terms">Terms</a></li>
        </ul>
    </nav>
</footer>
