<?php
/*
Plugin Name: Customer Support Bot
Description: Customer Support Bot is designed to help users when the assistant is not available.
Version: 0.1.2
Author: Admin
*/

// Enqueue scripts and styles
function vacw_enqueue_scripts() {
    wp_enqueue_style('vacw-style', plugins_url('assets/assets/style.css', __FILE__));
    wp_enqueue_script('vacw-script', plugins_url('assets/assets/script.js', __FILE__), array('jquery'), null, true);
    wp_localize_script('vacw-script', 'vacw_settings', array(
        'ajax_url' => admin_url('admin-ajax.php'), // Correct JavaScript variable name
    ));
}
add_action('wp_enqueue_scripts', 'vacw_enqueue_scripts');

// Add chat widget to the footer
function vacw_add_chat_widget() {
    echo '<div id="chatbot-container" style="display:none;">';
    include(plugin_dir_path(__FILE__) . 'assets/index.html');
    echo '</div>';
}
add_action('wp_footer', 'vacw_add_chat_widget');

// Add settings page
function vacw_settings_page() {
    include(plugin_dir_path(__FILE__) . 'includes/settings.php');
}

// Register settings page
function vacw_register_settings_page() {
    add_options_page('Chat Widget Settings', 'Chat Widget', 'manage_options', 'vacw-settings', 'vacw_settings_page');
}
add_action('admin_menu', 'vacw_register_settings_page');

// Register settings
function vacw_register_settings() {
    register_setting('vacw_settings_group', 'vacw_avatar_url', 'sanitize_text_field');
    register_setting('vacw_settings_group', 'vacw_assistant_name', 'sanitize_text_field');
    register_setting('vacw_settings_group', 'vacw_openai_api_key', 'sanitize_text_field'); // Register OpenAI API Key setting
}
add_action('admin_init', 'vacw_register_settings');

// API proxy endpoint to protect sensitive keys
function vacw_api_proxy() {
    if (!current_user_can('manage_options')) {
        wp_send_json_error('Unauthorized user');
        wp_die();
    }

    $api_url = 'https://api.openai.com/v1/chat/completions';
    $openai_api_key = get_option('vacw_openai_api_key'); // Retrieve OpenAI API key from settings

    $args = array(
        'headers' => array(
            'Authorization' => 'Bearer ' . $openai_api_key,
            'Content-Type' => 'application/json; charset=utf-8',
        ),
        'body' => json_encode(array(
            'query' => sanitize_text_field($_POST['query']),
            'lang' => sanitize_text_field($_POST['lang']),
            'sessionId' => sanitize_text_field($_POST['sessionId']),
        )),
    );

    $response = wp_remote_post($api_url, $args);
    if (is_wp_error($response)) {
        wp_send_json_error('Error communicating with API');
    } else {
        wp_send_json_success(wp_remote_retrieve_body($response));
    }
    wp_die();
}
add_action('wp_ajax_vacw_api_proxy', 'vacw_api_proxy');
add_action('wp_ajax_nopriv_vacw_api_proxy', 'vacw_api_proxy');
?>
