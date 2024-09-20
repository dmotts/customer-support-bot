<div class="wrap">
    <h1><?php _e('Customer Support Bot Settings', 'customer-support-bot'); ?></h1>
    
    <form method="post" action="options.php">
        <?php settings_fields('vacw_settings_group'); ?>
        <?php do_settings_sections('vacw_settings_group'); ?>
        
        <div class="form-group">
            <label for="vacw_avatar_url"><?php _e('Avatar Image', 'customer-support-bot'); ?></label>
            <div>
                <img id="vacw-avatar-preview" src="<?php echo esc_url(get_option('vacw_avatar_url')); ?>" />
                <button type="button" id="vacw-avatar-upload-button"><?php _e('Upload Image', 'customer-support-bot'); ?></button>
            </div>
            <input type="hidden" id="vacw-avatar-url" name="vacw_avatar_url" value="<?php echo esc_attr(get_option('vacw_avatar_url')); ?>" />
        </div>

        <div class="form-group">
            <label for="vacw_assistant_name"><?php _e('Assistant Name', 'customer-support-bot'); ?></label>
            <input type="text" name="vacw_assistant_name" id="vacw_assistant_name" class="regular-text" value="<?php echo esc_attr(get_option('vacw_assistant_name', 'Customer Support Bot')); ?>" />
        </div>

        <div class="form-group">
            <label for="vacw_openai_api_key"><?php _e('OpenAI API Key', 'customer-support-bot'); ?></label>
            <div>
                <input type="password" name="vacw_openai_api_key" id="vacw_openai_api_key" value="<?php echo esc_attr(vacw_get_decrypted_api_key()); ?>" />
                <button type="button" id="toggle_openai_api_key_visibility">
                    <span class="dashicons dashicons-visibility"></span>
                </button>
            </div>
            <p class="form-text"><?php _e('Click the eye icon to toggle visibility of the API key.', 'customer-support-bot'); ?></p>
        </div>

        <div class="form-group">
            <label for="vacw_bot_greeting"><?php _e('Bot Greeting', 'customer-support-bot'); ?></label>
            <input type="text" name="vacw_bot_greeting" id="vacw_bot_greeting" value="<?php echo esc_attr(get_option('vacw_bot_greeting', 'Hi! How can I assist you today?')); ?>" />
            <p class="form-text"><?php _e('Enter the greeting message that the bot will display when it starts.', 'customer-support-bot'); ?></p>
        </div>
        
        <?php submit_button(__('Save Changes', 'customer-support-bot')); ?>
    </form>
</div>