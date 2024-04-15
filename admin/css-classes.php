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
    <h3>Classes to SHOW Elements Based on Roles</h3>
    <p>Elements with the following CSS classes will be hidden FOR ALL USERS on the front end UNLESS the user's role matches the class specified. Each element can only have one of these classes applied; mixing multiple classes on a single element is not supported. Use the hide classes to hide elements for multiple user roles if more than one type of user needs to see the content.</p>
    <ul>
    <?php
    foreach ($css_classes as $class) {
        echo "<li>{$class}</li>";
    }
    ?>
    </ul>
    <h3>Classes to HIDE Elements Based on Roles</h3>
    <p>Elements with the following CSS classes will be hidden ONLY FOR USERS that match the role indicated. Multiple classes per element are supported. If a user matches one or more roles, the element will be hidden.</p>
    <ul>
    <?php
    foreach ($css_classes as $class) {
        echo "<li>{$class}-hide</li>";
    }
    ?>
    </ul>
    </div>
    <?php
}