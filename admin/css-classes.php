<?php

/**
 * Display the CSS Classes page content.
 */
function cache_everything_display_css_classes() {
    // Retrieve the CSS classes based on roles
    $css_classes = generate_css_classes_based_on_roles();

    ?>
    <div class="wrap">
    <h2>Available CSS Classes</h2>
    <p>Below are the CSS classes available for use, based on your site and user roles, including generic guest and user status.</p>
    <p>Elements with the following CSS classes will be hidden FOR ALL USERS on the front end UNLESS the user's role matches the class specified. Each element can only have one of these classes applied; mixing multiple classes on a single element is not supported.</p>
    <ul>
    <?php
    foreach ($css_classes as $class) {
        echo "<li>{$class}</li>";
    }
    echo '</ul>';
    echo '</div>';
}