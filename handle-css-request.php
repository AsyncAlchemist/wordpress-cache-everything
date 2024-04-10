<?php

require_once(plugin_dir_path(__FILE__) . 'helpers.php');

/**
 * Handles the request for the dynamic CSS file.
 */
function cache_everything_handle_css_request() {
    if (get_query_var('cache_everything_css')) {
        header("Content-Type: text/css; charset=UTF-8");

        // Get all user rules
        $all_roles = cache_everything_get_role_slugs(); 

        // Get the site prefix by calling the new function
        $site_prefix = get_site_prefix();

        // Add 'guest' and 'user' to the array of roles to be hidden
        array_push($all_roles, 'guest', 'user');

        foreach ($all_roles as $slug) {
            // Only apply the rule when the Elementor editor is not active
            echo "body:not(.elementor-editor-active) .$site_prefix-$slug { display: none !important; }\n";

            // Ensure the parent element is positioned relatively
            echo "body.elementor-editor-active .$site_prefix-$slug { position: relative; }\n";

            // Apply the rule specifically when the Elementor editor is active
            echo "body.elementor-editor-active .$site_prefix-$slug::after {
                content: '👁️';
                position: absolute;
                top: 0;
                right: 0;
                font-size: 20px; /* Adjust size as needed */
                z-index: 1000; /* Ensure it's above other content */
                pointer-events: none; /* Allows clicking through the icon */
            }\n";
        }
        exit;
    }
}