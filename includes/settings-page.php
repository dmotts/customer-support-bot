<?php
// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Display the plugin's settings page in the admin dashboard
function vacw_settings_page() {
    try {
        // Include the settings.php file
        include(plugin_dir_path(__FILE__) . 'settings.php');
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

// Register plugin settings, including the new color picker field
function vacw_register_settings() {
    // Avatar URL field
    register_setting(
        'vacw_settings_group',
        'vacw_avatar_url',
        'sanitize_text_field'
    );

    // Assistant Name field
    register_setting(
        'vacw_settings_group',
        'vacw_assistant_name',
        'sanitize_text_field'
    );

    // OpenAI API Key field
    register_setting(
        'vacw_settings_group',
        'vacw_openai_api_key',
        'sanitize_text_field'
    );

    // Bot Greeting field
    register_setting(
        'vacw_settings_group',
        'vacw_bot_greeting',
        'sanitize_text_field'
    );

    // Primary Theme Color field (with sanitization for hex color values)
    register_setting(
        'vacw_settings_group',
        'vacw_theme_color',
        array(
            'type' => 'string',
            'default' => '#dbe200', // Default primary color
            'sanitize_callback' => 'sanitize_hex_color' // Sanitize hex color value
        )
    );
}
add_action('admin_init', 'vacw_register_settings');