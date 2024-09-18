<div class="wrap">
    <h1>Customer Support Bot Settings</h1>
    <form method="post" action="options.php">
        <?php 
            settings_fields('vacw_settings_group'); 
            do_settings_sections('vacw_settings_group'); 
        ?>
        <table class="form-table">
            <!-- Existing fields for Avatar and Assistant Name -->

            <!-- Agentive API Key field -->
            <tr valign="top">
                <th scope="row">Agentive API Key</th>
                <td>
                    <input type="text" name="vacw_agentive_api_key" value="<?php echo esc_attr(get_option('vacw_agentive_api_key')); ?>" />
                    <p class="description">Enter your Agentive API key for chatbot functionality.</p>
                </td>
            </tr>
        </table>
        <?php submit_button(); ?>
    </form>
</div>