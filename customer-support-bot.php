<?php
/*
Plugin Name: Customer Support Bot
Description: Customer Support Bot is designed to help users when the assistant is not available.
Version: 0.2.0
Author: Admin
*/

// Enqueue scripts and styles for the front end
function vacw_enqueue_scripts() {
    $timestamp = time(); // Current timestamp

    wp_enqueue_style('vacw-style', plugins_url('assets/assets/style.css', __FILE__), array(), $timestamp);
    wp_enqueue_script('vacw-script', plugins_url('assets/assets/script.js', __FILE__), array('jquery'), $timestamp, true);

    wp_localize_script('vacw-script', 'vacw_settings', array(
        'ajax_url' => admin_url('admin-ajax.php'),
        'avatar_url' => esc_url(get_option('vacw_avatar_url', plugins_url('assets/default-avatar.png', __FILE__))), // Pass avatar URL to JavaScript
        'api_key' => esc_attr(get_option('vacw_agentive_api_key')),  // Agentive API key passed to JavaScript
        'assistant_id' => '66ca9fa5-d934-4cf5-8dde-c73173b1a0cc' // Replace with your actual assistant ID
    ));
}
add_action('wp_enqueue_scripts', 'vacw_enqueue_scripts');

// Enqueue scripts and styles for the admin settings page
function vacw_enqueue_admin_scripts($hook) {
    if ($hook !== 'settings_page_vacw-settings') {
        return;
    }

    // Enqueue the WordPress media uploader
    wp_enqueue_media();

    // Enqueue custom script to handle media uploader
    wp_enqueue_script('vacw-admin-script', plugins_url('assets/assets/admin-script.js', __FILE__), array('jquery'), null, true);
}
add_action('admin_enqueue_scripts', 'vacw_enqueue_admin_scripts');

// Add chat widget to the footer
function vacw_add_chat_widget() {
    try {
        echo '<div id="chatbot-container">';
        include(plugin_dir_path(__FILE__) . 'assets/index.html');
        echo '</div>';
    } catch (Exception $e) {
        error_log('Error displaying chat widget: ' . $e->getMessage());
        echo '<div>Error loading chat widget. Please contact the administrator.</div>';
    }
}
add_action('wp_footer', 'vacw_add_chat_widget');

// Register settings page
function vacw_settings_page() {
    try {
        include(plugin_dir_path(__FILE__) . 'includes/settings.php');
    } catch (Exception $e) {
        error_log('Error loading settings page: ' . $e->getMessage());
        echo '<div>Error loading settings page. Please contact the administrator.</div>';
    }
}

// Register settings page in the admin menu
function vacw_register_settings_page() {
    add_options_page('Chat Widget Settings', 'Chat Widget', 'manage_options', 'vacw-settings', 'vacw_settings_page');
}
add_action('admin_menu', 'vacw_register_settings_page');

// Register settings
function vacw_register_settings() {
    register_setting('vacw_settings_group', 'vacw_avatar_url', 'sanitize_text_field');
    register_setting('vacw_settings_group', 'vacw_assistant_name', 'sanitize_text_field');
    register_setting('vacw_settings_group', 'vacw_agentive_api_key', 'sanitize_text_field'); // Register Agentive API key
     register_setting('vacw_settings_group', 'vacw_openai_api_key', 'sanitize_text_field'); // Register OpenAI API key (optional)
}
add_action('admin_init', 'vacw_register_settings');

// API proxy endpoint to interact with Agentive
function vacw_agentive_proxy() {
    if (!current_user_can('manage_options')) {
        wp_send_json_error('Unauthorized user');
        wp_die();
    }

    $api_key = get_option('vacw_agentive_api_key'); // Fetch the Agentive API key from settings
    $assistant_id = '66ca9fa5-d934-4cf5-8dde-c73173b1a0cc'; // Set your assistant ID

    // Create a session with Agentive API
    $chat_session = wp_remote_post(
        'https://agentivehub.com/api/chat/session',
        array(
            'body' => json_encode(array(
                'api_key' => $api_key,
                'assistant_id' => $assistant_id
            )),
            'headers' => array('Content-Type' => 'application/json'),
            'method' => 'POST',
        )
    );

    if (is_wp_error($chat_session)) {
        wp_send_json_error('Error creating session: ' . $chat_session->get_error_message());
    }

    $session_response = json_decode(wp_remote_retrieve_body($chat_session), true);
    $chat_session_id = $session_response['session_id'];

    // Send a message to the session
    $user_message = sanitize_text_field($_POST['message']);
    $chat_response = array(
        'api_key' => $api_key,
        'session_id' => $chat_session_id,
        'type' => 'custom_code',
        'assistant_id' => $assistant_id,
        'messages' => array(array('role' => 'user', 'content' => $user_message))
    );

    $response = wp_remote_post(
        'https://agentivehub.com/api/chat',
        array(
            'body' => json_encode($chat_response),
            'headers' => array('Content-Type' => 'application/json'),
            'method' => 'POST',
        )
    );

    if (is_wp_error($response)) {
        wp_send_json_error('Error fetching chat response: ' . $response->get_error_message());
    }

    $bot_response = json_decode(wp_remote_retrieve_body($response), true);
    wp_send_json_success($bot_response);
    wp_die();
}
add_action('wp_ajax_vacw_agentive_proxy', 'vacw_agentive_proxy');
add_action('wp_ajax_nopriv_vacw_agentive_proxy', 'vacw_agentive_proxy');
?>