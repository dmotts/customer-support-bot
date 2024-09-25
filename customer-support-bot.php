<?php
/*
Plugin Name: Customer Support Bot
Description: A WordPress plugin that provides an AI-powered customer support chatbot with appointment scheduling capabilities.
Version: 0.2.1
Author: Admin
Text Domain: customer-support-bot
Domain Path: /languages
*/

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Load text domain for translations
function vacw_load_textdomain() {
    load_plugin_textdomain('customer-support-bot', false, basename(dirname(__FILE__)) . '/languages');
}
add_action('plugins_loaded', 'vacw_load_textdomain');

// Enqueue scripts and styles for the settings page
function vacw_enqueue_color_picker($hook_suffix) {
    // Check if we're on the settings page for the plugin
    if ($hook_suffix != 'settings_page_vacw-settings') {
        return;
    }

    // Enqueue the WordPress color picker script and style
    wp_enqueue_style('wp-color-picker');
    wp_enqueue_script('wp-color-picker');

    // Add a custom script to initialize the color picker
    wp_enqueue_script('vacw-color-picker-script', plugins_url('assets/admin-color-picker.js', __FILE__), array('wp-color-picker'), false, true);
}
add_action('admin_enqueue_scripts', 'vacw_enqueue_color_picker');

// Include required files
require_once plugin_dir_path(__FILE__) . 'includes/enqueue-scripts.php';
require_once plugin_dir_path(__FILE__) . 'includes/chatbot-widget.php';
require_once plugin_dir_path(__FILE__) . 'includes/settings-page.php';
require_once plugin_dir_path(__FILE__) . 'includes/ajax-handlers.php';
require_once plugin_dir_path(__FILE__) . 'includes/prompt-builder.php';
require_once plugin_dir_path(__FILE__) . 'includes/function-handlers.php';

// Add the chosen theme color to the frontend
function vacw_add_custom_color_to_chatbot() {
    // Retrieve the theme color from the settings, with a fallback to the default
    $theme_color = esc_attr(get_option('vacw_theme_color', '#dbe200'));
    
    // Output dynamic CSS to apply the theme color to the chatbot widget
    echo "<style>
        #chatbot_toggle { background-color: {$theme_color}; }
        .chat-message-sent { background-color: {$theme_color}; }
        .chat-message-received { background-color: {$theme_color}; }
        .main-title { background-color: {$theme_color}; }
    </style>";
}
add_action('wp_footer', 'vacw_add_custom_color_to_chatbot');