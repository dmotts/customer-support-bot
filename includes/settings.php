<div class="wrap">
    <h1 class="mb-5"><?php _e('Customer Support Bot Settings', 'customer-support-bot'); ?></h1>
    
    <form method="post" action="options.php" class="mb-4">
        <?php settings_fields('vacw_settings_group'); ?>
        <?php do_settings_sections('vacw_settings_group'); ?>
        
        <!-- Avatar Upload Section -->
        <div class="form-group">
            <label for="vacw_avatar_url"><?php _e('Avatar Image', 'customer-support-bot'); ?></label>
            <div class="input-group">
                <img id="vacw-avatar-preview" src="<?php echo esc_url(get_option('vacw_avatar_url')); ?>" class="img-thumbnail" style="width: 100px; height: 100px;" />
                <button type="button" id="vacw-avatar-upload-button" class="btn btn-primary ml-3"><?php _e('Upload Image', 'customer-support-bot'); ?></button>
            </div>
            <input type="hidden" id="vacw-avatar-url" name="vacw_avatar_url" value="<?php echo esc_attr(get_option('vacw_avatar_url')); ?>" />
        </div>

        <!-- Bot Assistant Name Section -->
        <div class="form-group">
            <label for="vacw_assistant_name"><?php _e('Assistant Name', 'customer-support-bot'); ?></label>
            <input type="text" name="vacw_assistant_name" id="vacw_assistant_name" class="form-control" value="<?php echo esc_attr(get_option('vacw_assistant_name', 'Customer Support Bot')); ?>" />
        </div>

        <!-- OpenAI API Key Section -->
        <div class="form-group">
            <label for="vacw_openai_api_key"><?php _e('OpenAI API Key', 'customer-support-bot'); ?></label>
            <div class="input-group">
                <input type="password" name="vacw_openai_api_key" id="vacw_openai_api_key" class="form-control" value="<?php echo esc_attr(vacw_get_decrypted_api_key()); ?>" />
                <div class="input-group-append">
                    <button type="button" id="toggle_openai_api_key_visibility" class="btn btn-outline-secondary">
                        <span class="dashicons dashicons-visibility"></span>
                    </button>
                </div>
            </div>
            <small class="form-text text-muted"><?php _e('Click the eye icon to toggle visibility of the API key.', 'customer-support-bot'); ?></small>
        </div>

        <!-- Bot Greeting Section -->
        <div class="form-group">
            <label for="vacw_bot_greeting"><?php _e('Bot Greeting', 'customer-support-bot'); ?></label>
            <input type="text" name="vacw_bot_greeting" id="vacw_bot_greeting" class="form-control" value="<?php echo esc_attr(get_option('vacw_bot_greeting', 'Hi! How can I assist you today?')); ?>" />
            <small class="form-text text-muted"><?php _e('Enter the greeting message that the bot will display when it starts.', 'customer-support-bot'); ?></small>
        </div>
        
        <?php submit_button(__('Save Changes', 'customer-support-bot'), 'btn btn-primary'); ?>
    </form>
</div>