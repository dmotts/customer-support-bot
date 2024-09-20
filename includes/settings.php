<div class="wrap">
    <h1 class="text-3xl font-bold mb-5"><?php _e('Customer Support Bot Settings', 'customer-support-bot'); ?></h1>
    
    <!-- Include Tailwind CSS CDN for styling -->
    <script>
       tailwind.config = {
          theme: {
             extend: {},
          },
       }
    </script>
    <script src="https://cdn.tailwindcss.com"></script>
    
    <form method="post" action="options.php" class="space-y-6">
        <?php settings_fields('vacw_settings_group'); ?>
        <?php do_settings_sections('vacw_settings_group'); ?>
        
        <!-- Avatar Upload Section -->
        <div class="mb-4">
            <label for="vacw_avatar_url" class="block font-medium text-gray-700"><?php _e('Avatar Image', 'customer-support-bot'); ?></label>
            <div class="flex items-center mt-1">
                <img id="vacw-avatar-preview" src="<?php echo esc_url(get_option('vacw_avatar_url')); ?>" class="h-16 w-16 rounded-full" />
                <button type="button" id="vacw-avatar-upload-button" class="ml-4 px-4 py-2 bg-blue-600 text-white rounded-md"><?php _e('Upload Image', 'customer-support-bot'); ?></button>
            </div>
            <input type="hidden" id="vacw-avatar-url" name="vacw_avatar_url" value="<?php echo esc_attr(get_option('vacw_avatar_url')); ?>" />
        </div>

        <!-- Bot Assistant Name Section -->
        <div class="mb-4">
            <label for="vacw_assistant_name" class="block font-medium text-gray-700"><?php _e('Assistant Name', 'customer-support-bot'); ?></label>
            <input type="text" name="vacw_assistant_name" id="vacw_assistant_name" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" value="<?php echo esc_attr(get_option('vacw_assistant_name', 'Customer Support Bot')); ?>" />
        </div>

        <!-- OpenAI API Key Section -->
        <div class="mb-4 relative">
            <label for="vacw_openai_api_key" class="block font-medium text-gray-700"><?php _e('OpenAI API Key', 'customer-support-bot'); ?></label>
            <div class="mt-1 flex rounded-md shadow-sm">
                <input type="password" name="vacw_openai_api_key" id="vacw_openai_api_key" class="flex-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" value="<?php echo esc_attr(vacw_get_decrypted_api_key()); ?>" />
                <span class="inline-flex items-center px-3 border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                    <button type="button" id="toggle_openai_api_key_visibility" class="px-3 py-2">
                        <span class="dashicons dashicons-visibility"></span>
                    </button>
                </span>
            </div>
            <p class="mt-2 text-sm text-gray-500"><?php _e('Click the eye icon to toggle visibility of the API key.', 'customer-support-bot'); ?></p>
        </div>

        <!-- Bot Greeting Section -->
        <div class="mb-4">
            <label for="vacw_bot_greeting" class="block font-medium text-gray-700"><?php _e('Bot Greeting', 'customer-support-bot'); ?></label>
            <input type="text" name="vacw_bot_greeting" id="vacw_bot_greeting" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" value="<?php echo esc_attr(get_option('vacw_bot_greeting', 'Hi! How can I assist you today?')); ?>" />
            <p class="mt-2 text-sm text-gray-500"><?php _e('Enter the greeting message that the bot will display when it starts.', 'customer-support-bot'); ?></p>
        </div>
        
        <?php submit_button(__('Save Changes', 'customer-support-bot'), 'button-primary'); ?>
    </form>
</div>
