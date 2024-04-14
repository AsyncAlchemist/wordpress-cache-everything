<?php

function cache_everything_settings_wrapper_page() {
    // Determine the current tab. Default to 'settings' if not set.
    $current_tab = isset($_GET['tab']) ? $_GET['tab'] : 'cache_settings';

    // Output the tabs
    cache_everything_admin_tabs($current_tab);

    // Switch to determine which content to load based on the current tab
    switch ($current_tab) {
        case 'cache_settings':
            cache_everything_cache_settings_page();
            break;
        case 'css_classes':
            cache_everything_display_css_classes();
            break;
        case 'readme':
            cache_everything_display_readme();
            break;
        case 'prefetch_settings': // New case for the new tab
            cache_everything_display_prefetch_settings();
            break;
        default:
            cache_everything_cache_settings_page(); // Default to settings if the tab is unrecognized
            break;
    }
}

function cache_everything_activate() {
    add_option('cache_everything_debug_mode', '0'); // Default value set to '0' (debug mode off)
    add_option('cache_everything_cache_options', []); // Initialize caching options
    add_option('cache_everything_max_age', '28800'); // Default cache max age set to '28800' seconds
    add_option('cache_everything_stale_while_revalidate', '86400'); // Default stale while revalidate set to '86400' seconds
    add_option('cache_everything_prefetch_enabled', 'no');

}

/**
 * Add an admin menu item for the plugin.
 */
function cache_everything_add_admin_menu() {
    add_submenu_page(
        'options-general.php', // Parent slug for Settings menu
        'Cache Everything', // Page title
        'Cache Everything', // Menu title
        'manage_options', // Capability
        'cache-everything', // Menu slug
        'cache_everything_settings_wrapper_page' // Function to display the wrapper settings page
    );

    add_action('admin_init', 'cache_everything_register_cache_settings');
}

add_action('admin_menu', 'cache_everything_add_admin_menu');

function cache_everything_admin_tabs( $current = 'settings' ) {
    // Display the plugin title and version
    echo '<h1>Cache Everything v' . CACHE_EVERYTHING_VERSION . '</h1>';

    $tabs = array(
        'cache_settings' => 'Cache Settings',
        'prefetch_settings' => 'Prefetch Settings',
        'css_classes' => 'CSS Classes',
        'readme' => 'Readme'
    );
    echo '<h2 class="nav-tab-wrapper">';
    foreach( $tabs as $tab => $name ){
        $class = ( $tab == $current ) ? ' nav-tab-active' : '';
        echo "<a class='nav-tab$class' href='?page=cache-everything&tab=$tab'>$name</a>";
    }
    echo '</h2>';
}

function cache_everything_enqueue_admin_styles() {
    wp_enqueue_style('wp-admin');
}

add_action('admin_enqueue_scripts', 'cache_everything_enqueue_admin_styles');