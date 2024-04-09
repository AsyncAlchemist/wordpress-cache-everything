<?php

function cache_everything_activate() {
    add_option('cache_everything_debug_mode', '0'); // Default value set to '0' (debug mode off)
}

/**
 * Add an admin menu item for the plugin.
 */
function cache_everything_add_admin_menu() {
    // Settings Page
    add_menu_page(
        'Cache Everything Settings', // Page title
        'Cache Everything', // Menu title
        'manage_options', // Capability
        'cache-everything-settings', // Menu slug for settings
        'cache_everything_settings_page', // Function to display the settings page
        'dashicons-admin-generic', // Icon URL
        6 // Position
    );

    // Readme Page
    add_submenu_page(
        'cache-everything-settings', // Parent slug
        'Cache Everything Readme', // Page title
        'Readme', // Menu title
        'manage_options', // Capability
        'cache-everything-readme', // Menu slug for readme
        'cache_everything_display_readme' // Function to display the readme page
    );

    add_action('admin_init', 'cache_everything_register_settings');
}

add_action('admin_menu', 'cache_everything_add_admin_menu');

/**
 * Register settings for the Cache Everything plugin.
 */
function cache_everything_register_settings() {
    // Register a new setting for Cache Everything to store the debug mode option
    register_setting('cache_everything_settings', 'cache_everything_debug_mode');

    // Add a new section to the Cache Everything admin page
    add_settings_section(
        'cache_everything_settings_section', // ID
        'Cache Everything Settings', // Title
        'cache_everything_settings_section_callback', // Callback
        'cache-everything-settings' // Page
    );

    // Add the debug mode option field to the new section
    add_settings_field(
        'cache_everything_debug_mode', // ID
        'Debug Mode', // Title
        'cache_everything_debug_mode_callback', // Callback
        'cache-everything-settings', // Page
        'cache_everything_settings_section' // Section
    );
}

/**
 * Settings section callback function.
 */
function cache_everything_settings_section_callback() {
    echo '<p>Adjust the settings for Cache Everything.</p>';
}

/**
 * Debug mode field callback function.
 */
function cache_everything_debug_mode_callback() {
    $debug_mode = get_option('cache_everything_debug_mode');
    echo '<input type="checkbox" id="cache_everything_debug_mode" name="cache_everything_debug_mode" value="1" ' . checked(1, $debug_mode, false) . '/>';
    echo '<label for="cache_everything_debug_mode">Enable Debug Mode</label>';
}

// Adjusted function to display settings
function cache_everything_settings_page() {
    echo '<form action="options.php" method="post">';
    settings_fields('cache_everything_settings');
    do_settings_sections('cache-everything-settings'); // Adjusted to match the settings page slug
    submit_button();
    echo '</form>';
}

// Adjusted function to only display the readme content
function cache_everything_display_readme() {
    $readme_path = plugin_dir_path(__FILE__) . '../readme.md';
    if (file_exists($readme_path)) {
        $readme_content = file_get_contents($readme_path);
        // Escape the content for JavaScript
        $readme_content_js = json_encode($readme_content);
        echo '<div id="readmeContent" class="wce_wrap"></div>'; // Container for the converted HTML
        echo "<script src=\"https://cdn.jsdelivr.net/npm/showdown@1.9.1/dist/showdown.min.js\"></script>";
        echo "<script>
            document.addEventListener('DOMContentLoaded', function() {
                var converter = new showdown.Converter(),
                text = $readme_content_js,
                html = converter.makeHtml(text);
                document.getElementById('readmeContent').innerHTML = html;
            });
        </script>";
    } else {
        // Print out the full path attempted for debugging purposes
        echo '<div class="wrap"><h1>Readme File Not Found</h1><p>Attempted path: ' . esc_html($readme_path) . '</p></div>';
    }
}