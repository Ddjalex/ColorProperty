<?php
// PHP fallback for serving static assets with correct MIME types
// Use this if .htaccess doesn't work on your server

$request_uri = $_SERVER['REQUEST_URI'];
$file_path = __DIR__ . $request_uri;

// Define MIME types
$mime_types = [
    'css' => 'text/css',
    'js' => 'application/javascript',
    'json' => 'application/json',
    'png' => 'image/png',
    'jpg' => 'image/jpeg',
    'jpeg' => 'image/jpeg',
    'gif' => 'image/gif',
    'svg' => 'image/svg+xml',
    'webp' => 'image/webp',
    'woff' => 'font/woff',
    'woff2' => 'font/woff2',
    'ttf' => 'font/ttf',
    'otf' => 'font/otf'
];

// Get file extension
$extension = strtolower(pathinfo($request_uri, PATHINFO_EXTENSION));

// Check if file exists and has a known extension
if (file_exists($file_path) && isset($mime_types[$extension])) {
    // Set correct MIME type
    header('Content-Type: ' . $mime_types[$extension]);
    
    // Set cache headers for static assets
    header('Cache-Control: public, max-age=31536000'); // 1 year
    header('Expires: ' . gmdate('D, d M Y H:i:s', time() + 31536000) . ' GMT');
    
    // Output the file
    readfile($file_path);
    exit;
}

// If file doesn't exist or is not a static asset, serve index.html
if (!file_exists($file_path) || is_dir($file_path)) {
    header('Content-Type: text/html; charset=utf-8');
    readfile(__DIR__ . '/index.html');
    exit;
}

// Fallback - serve the file as is
readfile($file_path);
?>