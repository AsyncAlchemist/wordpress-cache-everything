<?php

function cache_everything_activate() {
    add_option('cache_everything_debug_mode', '0'); // Default value set to '0' (debug mode off)
    add_option('cache_everything_options', []); // Initialize caching options
    add_option('cache_everything_max_age', '28800'); // Default cache max age set to '28800' seconds
    add_option('cache_everything_stale_while_revalidate', '86400'); // Default stale while revalidate set to '86400' seconds
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
        'dashicons-cloud', // Icon URL
        6 // Position
    );

    add_submenu_page(
        'cache-everything-settings', // Parent slug
        'Available CSS Classes', // Page title
        'CSS Classes', // Menu title
        'manage_options', // Capability
        'cache-everything-css-classes', // Menu slug for CSS Classes
        'cache_everything_display_css_classes' // Function to display the CSS Classes page
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
