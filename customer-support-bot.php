<?php
/*
Plugin Name: Customer Support Bot
Description: Customer Support Bot is designed to help users when the assistant is not available.
Version: 0.1.5
Author: Admin
Text Domain: customer-support-bot
Domain Path: /languages
*/

// Define Agentive API key and Assistant ID securely on the server-side
if (!defined('AGENTIVE_API_KEY')) {
    define('AGENTIVE_API_KEY', '664c990c-f470-4c0f-a67c-98056db461ae');
}

if (!defined('AGENTIVE_ASSISTANT_ID')) {
    define('AGENTIVE_ASSISTANT_ID', '66ca9fa5-d934-4cf5-8dde-c73173b1a0cc');
}

// Load text domain for translations
function vacw_load_textdomain() {
    load_plugin_textdomain('customer-support-bot', false, basename(dirname(__FILE__)) . '/languages');
}
add_action('plugins_loaded', 'vacw_load_textdomain');

// Enqueue scripts and styles for the front end
function vacw_enqueue_scripts() {
    $timestamp = time();  // Cache busting

    wp_enqueue_style('vacw-style', plugins_url('assets/assets/style.css', __FILE__), array(), $timestamp);
    wp_enqueue_script('vacw-script', plugins_url('assets/assets/script.js', __FILE__), array('jquery'), $timestamp, true);
    wp_localize_script('vacw-script', 'vacw_settings', array(
        'ajax_url'   => admin_url('admin-ajax.php'),
        'avatar_url' => esc_url(get_option('vacw_avatar_url', plugins_url('assets/default-avatar.png', __FILE__))),
        'bot_greeting' => __('Hi! How can I assist you today?', 'customer-support-bot'),
        'security'   => wp_create_nonce('vacw_nonce_action'),
    ));
}
add_action('wp_enqueue_scripts', 'vacw_enqueue_scripts');

// Enqueue admin styles for custom admin bar styling
function vacw_enqueue_admin_bar_styles() {
    // Check if the admin bar is showing and load the CSS only for admins or users with proper capability
    if (is_admin_bar_showing() && current_user_can('manage_options')) {
        wp_enqueue_style('vacw-admin-bar-styles', plugins_url('assets/assets/admin-styles.css', __FILE__), array(), time());
    }
}
add_action('wp_enqueue_scripts', 'vacw_enqueue_admin_bar_styles');
add_action('admin_enqueue_scripts', 'vacw_enqueue_admin_bar_styles');

// Add chat widget settings link to the admin bar (front-end and back-end)
function vacw_add_chat_widget_settings_to_admin_bar($wp_admin_bar) {
    // Check if the user is logged in and has the capability to manage options (usually admins)
    if (current_user_can('manage_options')) {
        // Add the custom menu item for Chat Widget settings
        $wp_admin_bar->add_node(array(
            'id'    => 'vacw_chat_widget_settings',  // Unique ID for the menu item
            'title' => '<span class="dashicons dashicons-format-chat"></span> ' . __('Chat Widget Settings', 'customer-support-bot'),  // Menu title with icon
            'href'  => admin_url('options-general.php?page=vacw-settings'),  // Link to the settings page of the chat widget
            'meta'  => array(
                'class' => 'vacw-chat-widget-settings',  // Custom class for the menu item
                'title' => __('Chat Widget Settings', 'customer-support-bot')  // Tooltip text for the menu item
            ),
        ));
    }
}
add_action('admin_bar_menu', 'vacw_add_chat_widget_settings_to_admin_bar', 999);

// Add Chat Widget Settings to the WordPress Settings menu
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

// Display the settings page
function vacw_settings_page() {
    try {
        include(plugin_dir_path(__FILE__) . 'includes/settings.php');
    } catch (Exception $e) {
        error_log('Error loading settings page: ' . $e->getMessage());
        echo '<div>' . __('Error loading settings page. Please contact the administrator.', 'customer-support-bot') . '</div>';
    }
}

// Register settings for the plugin
function vacw_register_settings() {
    register_setting('vacw_settings_group', 'vacw_avatar_url', 'sanitize_text_field');
    register_setting('vacw_settings_group', 'vacw_assistant_name', 'sanitize_text_field');
    register_setting('vacw_settings_group', 'vacw_openai_api_key', 'vacw_sanitize_and_encrypt_api_key');
}
add_action('admin_init', 'vacw_register_settings');

// Sanitize and encrypt the OpenAI API key
function vacw_sanitize_and_encrypt_api_key($api_key) {
    $api_key = sanitize_text_field($api_key);
    if (!empty($api_key) && defined('VACW_ENCRYPTION_KEY')) {
        $encrypted_key = openssl_encrypt($api_key, 'AES-256-CBC', VACW_ENCRYPTION_KEY, 0, substr(VACW_ENCRYPTION_KEY, 0, 16));
        return $encrypted_key;
    }
    return '';
}

// Decrypt the OpenAI API key
function vacw_get_decrypted_api_key() {
    $encrypted_key = get_option('vacw_openai_api_key');
    if (!empty($encrypted_key) && defined('VACW_ENCRYPTION_KEY')) {
        $decrypted_key = openssl_decrypt($encrypted_key, 'AES-256-CBC', VACW_ENCRYPTION_KEY, 0, substr(VACW_ENCRYPTION_KEY, 0, 16));
        return $decrypted_key;
    }
    return '';
}

// Create custom backend endpoint to handle Agentive API communication
function vacw_get_bot_response() {
    // Verify nonce for security
    check_ajax_referer('vacw_nonce_action', 'security');

    // Check user capability
    if (!current_user_can('read')) {
        wp_send_json_error('Unauthorized user');
        wp_die();
    }

    // Use the defined constants for the Agentive API key and Assistant ID
    $api_url = 'https://agentivehub.com/api/chat';
    $api_key = AGENTIVE_API_KEY;
    $assistant_id = AGENTIVE_ASSISTANT_ID;
    $session_id = sanitize_text_field($_POST['session_id']);
    $user_message = sanitize_text_field($_POST['message']);

    // Prepare the request body for the Agentive API
    $args = array(
        'headers' => array(
            'Content-Type'  => 'application/json; charset=utf-8',
        ),
        'body'    => json_encode(array(
            'api_key'      => $api_key,
            'session_id'   => $session_id,
            'type'         => 'custom_code',
            'assistant_id' => $assistant_id,
            'messages'     => array(
                array('role' => 'user', 'content' => $user_message),
            ),
        )),
    );

    // Send the request to Agentive API
    $response = wp_remote_post($api_url, $args);

    if (is_wp_error($response)) {
        error_log('Error communicating with Agentive API: ' . $response->get_error_message());
        wp_send_json_error('Error communicating with the Agentive API.');
    } else {
        $response_body = wp_remote_retrieve_body($response);
        if (!$response_body) {
            error_log('Empty response from Agentive API.');
            wp_send_json_error('Empty response from the Agentive API.');
        } else {
            wp_send_json_success(json_decode($response_body));
        }
    }
    wp_die();
}
add_action('wp_ajax_vacw_get_bot_response', 'vacw_get_bot_response');