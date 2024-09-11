<div class="wrap">
    <h1>Customer Support Bot Settings</h1>
    <form method="post" action="options.php">
        <?php settings_fields('vacw_settings_group'); ?>
        <?php do_settings_sections('vacw_settings_group'); ?>
        <table class="form-table">
            <tr valign="top">
                <th scope="row">Avatar URL</th>
                <td><input type="text" name="vacw_avatar_url" value="<?php echo esc_attr(get_option('vacw_avatar_url')); ?>" /></td>
            </tr>
            <tr valign="top">
                <th scope="row">Virtual Assistant Name</th>
                <td><input type="text" name="vacw_assistant_name" value="<?php echo esc_attr(get_option('vacw_assistant_name', 'Support Bot')); ?>" /></td>
            </tr>
            <tr valign="top">
                <th scope="row">GPT-4o API Key</th>
                <td><input type="text" name="vacw_openai_api_key" value="<?php echo esc_attr(get_option('vacw_openai_api_key')); ?>" /></td>
            </tr>
            <tr valign="top">
                <th scope="row">Supported Languages</th>
                <td><input type="text" name="vacw_supported_languages" value="<?php echo esc_attr(get_option('vacw_supported_languages', 'en,es,fr')); ?>" /></td>
            </tr>
        </table>
        <?php submit_button(); ?>
    </form>
</div>
