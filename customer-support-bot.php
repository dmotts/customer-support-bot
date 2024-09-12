<?php
/**
 * Plugin Name: Customer Support Bot
 * Description: Customer Support Bot for handling customer inquiries with GPT-4o integration.
 * Version:     0.0.3
 * Author:      Admin
**/

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

// Define constants
define('CUSTOMER_SUPPORT_BOT_VERSION', '0.0.3');

// Include required files
require_once plugin_dir_path(__FILE__) . 'includes/settings.php';

// Enqueue plugin assets
function vacw_enqueue_assets() {
    wp_enqueue_style('customer-support-bot-style', plugin_dir_url(__FILE__) . 'assets/assets/style.css', array(), NULL);
    wp_enqueue_script('customer-support-bot-script', plugin_dir_url(__FILE__) . 'assets/assets/script.js', array('jquery'), NULL, true);
}
add_action('wp_enqueue_scripts', 'vacw_enqueue_assets');

function vacw_enqueue_scripts() {
    wp_enqueue_script(
        'vacw-script', 
        plugins_url('/assets/assets/script.js', __FILE__), 
        array('jquery'), 
        '0.0.3', 
        true
    );
    
    // Localize the script with data
    $api_key = 'YOUR_OPENAI_API_KEY'; // Replace this with your actual OpenAI API key
    wp_localize_script('vacw-script', 'vacw_settings', array(
        'openai_api_key' => $api_key,
    ));
}
add_action('wp_enqueue_scripts', 'vacw_enqueue_scripts');


// Load API key securely
function vacw_get_openai_api_key() {
    return get_option('vacw_openai_api_key');
}
// Register the settings page
function vacw_register_settings_page() {
    add_options_page(
        'Customer Support Bot Settings',
        'Customer Support Bot',
        'manage_options',
        'customer-support-bot',
        'vacw_settings_page'
    );
}
add_action('admin_menu', 'vacw_register_settings_page');
