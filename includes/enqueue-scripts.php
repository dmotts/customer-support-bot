<?php
// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Enqueue frontend styles and scripts
function vacw_enqueue_frontend_assets() {
    $timestamp = time(); // Cache busting

    // Enqueue chatbot styles
    wp_enqueue_style(
        'vacw-style',
        plugins_url('assets/assets/style.css', __DIR__ . '/'),
        array(),
        $timestamp
    );

    // Enqueue Axios library
    wp_enqueue_script(
        'axios',
        'https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js',
        array(),
        null,
        true
    );

    // Enqueue chatbot script
    wp_enqueue_script(
        'vacw-script',
        plugins_url('assets/assets/script.js', __DIR__ . '/'),
        array('jquery', 'axios'),
        $timestamp,
        true
    );

    // Localize script with settings
    $bot_greeting = get_option('vacw_bot_greeting', __('Hi! How can I assist you today?', 'customer-support-bot'));
    $avatar_url = get_option('vacw_avatar_url');
    if (empty($avatar_url)) {
        $avatar_url = plugins_url('assets/default-avatar.png', __DIR__ . '/../');
    }

    wp_localize_script('vacw-script', 'vacw_settings', array(
        'ajax_url'     => admin_url('admin-ajax.php'),
        'avatar_url'   => esc_url($avatar_url),
        'bot_greeting' => esc_html($bot_greeting),
        'security'     => wp_create_nonce('vacw_nonce_action'),
    ));
}
add_action('wp_enqueue_scripts', 'vacw_enqueue_frontend_assets');

// Enqueue admin styles and scripts, including the color picker for the settings page
function vacw_enqueue_admin_assets($hook) {
    if ($hook != 'settings_page_vacw-settings') {
        return;
    }

    // Enqueue Bootstrap CSS and JS
    wp_enqueue_style(
        'bootstrap-css',
        'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css'
    );

    wp_enqueue_script(
        'bootstrap-js',
        'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js',
        array('jquery'),
        null,
        true
    );

    // Enqueue WordPress media uploader
    wp_enqueue_media();

    // Enqueue custom admin styles and scripts
    wp_enqueue_style(
        'vacw-admin-styles',
        plugins_url('assets/assets/admin-styles.css', __DIR__ . '/../')
    );

    wp_enqueue_script(
        'vacw-admin-script',
        plugins_url('assets/assets/admin-script.js', __DIR__ . '/../'),
        array('jquery'),
        null,
        true
    );

    // Enqueue the WordPress color picker script and style
    wp_enqueue_style('wp-color-picker');
    wp_enqueue_script('wp-color-picker');

    // Add a custom script to initialize the color picker
    wp_enqueue_script(
        'vacw-color-picker-script',
        plugins_url('assets/admin-color-picker.js', __DIR__ . '/../'),
        array('wp-color-picker'),
        false,
        true
    );
}
add_action('admin_enqueue_scripts', 'vacw_enqueue_admin_assets');
