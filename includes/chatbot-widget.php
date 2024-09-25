<?php
// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Add chat widget to the footer
function vacw_add_chat_widget() {
    try {
        echo '<div id="chatbot-container">';
        // Include the chatbot's PHP file to allow processing of PHP code
        include(plugin_dir_path(__DIR__) . 'assets/index.php');
        echo '</div>';
    } catch (Exception $e) {
        error_log('Error displaying chat widget: ' . $e->getMessage());
        echo '<div>' . __('Error loading chat widget. Please contact the administrator.', 'customer-support-bot') . '</div>';
    }
}
add_action('wp_footer', 'vacw_add_chat_widget');
