<?php
// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Custom logging function for the plugin
function vacw_log($message, $level = 'info') {
    if (WP_DEBUG) {
        error_log("[$level] $message");
    }
}
