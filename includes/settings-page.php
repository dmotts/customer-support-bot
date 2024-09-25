<?php
// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Display the plugin's settings page in the admin dashboard
function vacw_settings_page() {
    try {
        include(plugin_dir_path(__DIR__) . 'includes/settings.php');
    } catch (Exception $e) {
        error_log('Error loading settings page: ' . $e->getMessage());
        echo '<div>' . __('Error loading settings page. Please contact the administrator.', 'customer-support-bot') . '</div>';
    }
}

// Register the settings page under the "Settings" menu
function vacw_register_settings_page() {
    add_options_page(
        __('Chat Widget Settings', 'customer-support-bot'),
        __('Chat Widget', 'customer-support-bot'),
        'manage_options',
        'vacw-settings',
        'vacw_settings_page'
    );
}
add_action('admin_menu', 'vacw_register_settings_page');

// Register plugin settings
function vacw_register_settings() {
    register_setting(
        'vacw_settings_group',
        'vacw_avatar_url',
        'sanitize_text_field'
    );

    register_setting(
        'vacw_settings_group',
        'vacw_assistant_name',
        'sanitize_text_field'
    );

    register_setting(
        'vacw_settings_group',
        'vacw_openai_api_key',
        'vacw_sanitize_api_key'
    );

    register_setting(
        'vacw_settings_group',
        'vacw_bot_greeting',
        'sanitize_text_field'
    );
}
add_action('admin_init', 'vacw_register_settings');

// Sanitize the OpenAI API key input
function vacw_sanitize_api_key($api_key) {
    return sanitize_text_field($api_key);
}
