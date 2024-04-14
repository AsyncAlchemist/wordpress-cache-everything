<?php 

function cache_everything_display_prefetch_settings() {
    ?>
    <div>
        <form method="post" action="options.php">
            <?php
            settings_fields('cache_everything_prefetch_options');
            do_settings_sections('cache_everything_prefetch');
            submit_button();
            ?>
        </form>
    </div>
    <?php
}

function cache_everything_register_prefetch_settings() {
    // Register a new setting for "Cache Everything" options
    register_setting('cache_everything_prefetch_options', 'cache_everything_prefetch_enabled');
    register_setting('cache_everything_prefetch_options', 'cache_everything_prefetch_patterns', 'cache_everything_sanitize_patterns');

    // Add a new settings section within the "Prefetch Settings" page
    add_settings_section(
        'cache_everything_prefetch_settings_section',
        'Prefetch Settings',
        'cache_everything_prefetch_settings_section_callback',
        'cache_everything_prefetch'
    );

    // Add a new settings field for the enable/disable toggle
    add_settings_field(
        'cache_everything_prefetch_enable',
        'Enable Prefetching',
        'cache_everything_prefetch_enable_callback',
        'cache_everything_prefetch',
        'cache_everything_prefetch_settings_section'
    );

    add_settings_field(
        'cache_everything_prefetch_patterns',
        'Prefetch Exclusion Patterns',
        'cache_everything_prefetch_patterns_callback',
        'cache_everything_prefetch',
        'cache_everything_prefetch_settings_section'
    );
}

function cache_everything_sanitize_patterns($input) {
    $existing_patterns = get_option('cache_everything_prefetch_patterns', []);
    if (!is_array($existing_patterns)) {
        $existing_patterns = [];
    }

    // Handle deletion of patterns
    if (isset($input['delete']) && is_array($input['delete'])) {
        foreach ($input['delete'] as $index => $should_delete) {
            if ($should_delete) {
                unset($existing_patterns[$index]);
            }
        }
        $existing_patterns = array_values($existing_patterns); // Reindex array
    }

    // Check if the new pattern is set and not empty
    if (isset($input['new']) && !empty($input['new']['pattern'])) {
        $new_pattern = [
            'pattern' => sanitize_text_field($input['new']['pattern']),
            'operator' => sanitize_text_field($input['new']['operator']),
            'comment' => sanitize_text_field($input['new']['comment'])
        ];
        $existing_patterns[] = $new_pattern;
    }
    return $existing_patterns;
}

function cache_everything_prefetch_settings_section_callback() {
    echo '<p>Enable or disable prefetching for your site.</p>';
}

function cache_everything_prefetch_enable_callback() {
    $option = get_option('cache_everything_prefetch_enabled');
    $checked = ($option === 'yes') ? 'checked' : '';
    echo '<input type="checkbox" id="cache_everything_prefetch_enable" name="cache_everything_prefetch_enabled" value="yes" ' . $checked . '>';
    echo '<label for="cache_everything_prefetch_enable">Activate Prefetching</label>';
}

function cache_everything_prefetch_patterns_callback() {
    $patterns = get_option('cache_everything_prefetch_patterns', []);
    if (!is_array($patterns)) {
        $patterns = [];
    }
    ?>
    <table>
        <tr>
            <th>Pattern</th>
            <th>Operator</th>
            <th>Comment</th>
            <th>Delete</th>
        </tr>
        <?php foreach ($patterns as $index => $pattern): ?>
        <tr>
            <td><?php echo esc_html($pattern['pattern']); ?></td>
            <td><?php echo esc_html($pattern['operator']); ?></td>
            <td><?php echo esc_html($pattern['comment']); ?></td>
            <td><input type="checkbox" name="cache_everything_prefetch_patterns[delete][<?php echo $index; ?>]" value="1"></td>
        </tr>
        <?php endforeach; ?>
    </table>
    <h3>Add New Pattern</h3>
    <input type="text" name="cache_everything_prefetch_patterns[new][pattern]" placeholder="Pattern" title="Enter a regular expression pattern. Patterns are evaluated using JavaScript's ECMAScript-based regex engine.">
    <select name="cache_everything_prefetch_patterns[new][operator]">
        <option value="starts_with">Starts with</option>
        <option value="contains">Contains</option>
        <option value="regex">Regular Expression</option>
    </select>
    <input type="text" name="cache_everything_prefetch_patterns[new][comment]" placeholder="Comment">
    <div class="operator-descriptions">
        <p><strong>Starts with:</strong> Use this option to match URLs that begin with the specified pattern.</p>
        <p><strong>Contains:</strong> Use this option to match URLs that contain the specified pattern anywhere in the URL.</p>
        <p><strong>Regular Expression:</strong> Use this option for complex patterns. Patterns are evaluated using JavaScript's ECMAScript-based regex engine, allowing for advanced matching conditions.</p>
    </div>
    <?php
}

// Hook into the admin_init action to register the settings
add_action('admin_init', 'cache_everything_register_prefetch_settings');