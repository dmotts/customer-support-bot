<?php
// If uninstall.php is not called by WordPress, exit
if (!defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

// Delete plugin options from the database
delete_option('vacw_avatar_url');
delete_option('vacw_assistant_name');
delete_option('vacw_openai_api_key');
delete_option('vacw_bot_greeting');
