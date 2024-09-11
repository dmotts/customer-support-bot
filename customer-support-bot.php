<?php
/**
 * Plugin Name: Customer Support Bot
 * Description: Customer Support Bot for handling customer inquiries with GPT-4o integration.
 * Version:     0.0.2
 * Author:      Admin
 */

// Enqueue scripts and styles
function vacw_enqueue_scripts() {
    wp_enqueue_style('vacw-style', plugins_url('assets/assets/style.css', __FILE__));
    wp_enqueue_script('vacw-script', plugins_url('assets/assets/script.js', __FILE__), array(), null, true);
}
add_action('wp_enqueue_scripts', 'vacw_enqueue_scripts');

// Add chat widget to the footer
function vacw_add_chat_widget() {
    include(plugin_dir_path(__FILE__) . 'assets/index.html');
}
add_action('wp_footer', 'vacw_add_chat_widget');

// Add settings page
function vacw_settings_page() {
    include(plugin_dir_path(__FILE__) . 'includes/settings.php');
}
add_action('admin_menu', 'vacw_register_settings_page');

// Register settings page
function vacw_register_settings_page() {
    add_options_page('Customer Support Bot Settings', 'Chat Widget', 'manage_options', 'vacw-settings', 'vacw_settings_page');
}
add_action('admin_menu', 'vacw_register_settings_page');

// Register settings
function vacw_register_settings() {
    register_setting('vacw_settings_group', 'vacw_avatar_url');
    register_setting('vacw_settings_group', 'vacw_assistant_name');
    // Additional settings for GPT-4o API key and functionality.
    register_setting('vacw_settings_group', 'vacw_openai_api_key');
    register_setting('vacw_settings_group', 'vacw_supported_languages');
}
add_action('admin_init', 'vacw_register_settings');

// Function to handle GPT-4o API
function vacw_gpt4_response($message) {
    $api_key = get_option('vacw_openai_api_key');
    if (!$api_key) {
        return "API key missing. Please configure the settings.";
    }

    $curl = curl_init();
    curl_setopt_array($curl, array(
        CURLOPT_URL => "https://api.openai.com/v1/completions",
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => array(
            "Authorization: Bearer $api_key",
            "Content-Type: application/json",
        ),
        CURLOPT_POSTFIELDS => json_encode(array(
            "model" => "gpt-4",
            "prompt" => $message,
            "max_tokens" => 150,
            "temperature" => 0.7,
        )),
    ));

    $response = curl_exec($curl);
    curl_close($curl);
    $response_data = json_decode($response, true);

    if (isset($response_data['choices'][0]['text'])) {
        return $response_data['choices'][0]['text'];
    } else {
        return "I'm sorry, I'm unable to assist right now.";
    }
}
