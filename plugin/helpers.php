<?php

/**
 * Retrieves all user roles as slugs.
 * 
 * @return array An array of role slugs.
 */
function cache_everything_get_role_slugs() {
    global $wp_roles;
    if (!isset($wp_roles)) {
        $wp_roles = new WP_Roles();
    }
    return array_keys($wp_roles->get_names());
}

/**
 * Generates and returns the site prefix based on the second to last part of the domain.
 *
 * @return string The site prefix.
 */
function get_site_prefix() {
    $site_url = get_site_url(); // WordPress function to get site URL
    $parsed_url = parse_url($site_url);
    $host = $parsed_url['host'];

    // Split the host into parts
    $host_parts = explode('.', $host);
    if (count($host_parts) > 2) {
        // Return the second to last part of the domain, excluding TLD
        return $host_parts[count($host_parts) - 2];
    } else {
        // If there are not enough parts for a subdomain, return the first part
        return $host_parts[0];
    }
}