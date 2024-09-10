<?php
/*
Plugin Name: Customer Support Bot
Description: Customer Support Bot is designed to help users when the assistant is not available.
Version: 0.0.1
Author: Admin
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

// Register settings page
function vacw_register_settings_page() {
    add_options_page('Chat Widget Settings', 'Chat Widget', 'manage_options', 'vacw-settings', 'vacw_settings_page');
}
add_action('admin_menu', 'vacw_register_settings_page');

// Register settings
function vacw_register_settings() {
    register_setting('vacw_settings_group', 'vacw_avatar_url');
    register_setting('vacw_settings_group', 'vacw_assistant_name');
}
add_action('admin_init', 'vacw_register_settings');
