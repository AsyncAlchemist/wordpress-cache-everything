const DYNAMIC_SHEET_ID = 'cache-everything-dynamic-css';
const STATIC_SHEET_ID = 'cache-everything-css';

document.addEventListener('DOMContentLoaded', function() {
    debugPrint('DOM fully loaded and parsed at:', getTimestampWithMilliseconds());
});

/**
 * Creates and appends a prefetch link element to the document head.
 * 
 * This function dynamically creates a link element with the rel attribute set to 'prefetch',
 * allowing the browser to prefetch the specified resource. Prefetching a resource can improve
 * performance by loading parts of a web page before they are needed.
 * 
 * @param {string} url - The URL of the resource to prefetch.
 */
function addPrefetchLink(url) {
    // Check if a prefetch link for this URL already exists to avoid duplicates
    if (!document.querySelector(`link[rel="prefetch"][href="${url}"]`)) {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        document.head.appendChild(link);
    }
}

/**
 * Logs messages to the console if debug mode is enabled. Supports multiple arguments.
 * 
 * @param {...any} messages - The messages to log, can be multiple arguments.
 */
function debugPrint(...messages) {
    if (wce_Data.debugMode === '1') {
        console.log("Debug:", ...messages);
    }
}
/**
 * Generates a timestamp including milliseconds.
 * 
 * @returns {string} A string representing the current timestamp with milliseconds.
 */
function getTimestampWithMilliseconds() {
    const now = new Date();
    return now.getFullYear() + '-' +
           String(now.getMonth() + 1).padStart(2, '0') + '-' +
           String(now.getDate()).padStart(2, '0') + ' ' +
           String(now.getHours()).padStart(2, '0') + ':' +
           String(now.getMinutes()).padStart(2, '0') + ':' +
           String(now.getSeconds()).padStart(2, '0') + '.' +
           String(now.getMilliseconds()).padStart(3, '0');
}

/**
 * Deletes all CSS rules matching a given selector from a specified stylesheet and logs the deletion.
 * 
 * This function searches for the stylesheet by its ID. If the stylesheet is found, the function iterates through all its rules
 * in reverse order (to handle the shifting indices upon rule deletion) and deletes
 * any rule that matches the given selector, logging each deletion.
 * 
 * @param {string} selectorText - The CSS selector text of the rules to delete.
 * @param {string} stylesheetId - The ID of the stylesheet from which to delete the rules.
 */
function deleteCSSRules(selectorText, stylesheetId) {
    // Modify the selector to include the new condition
    const modifiedSelectorText = `body:not(.elementor-editor-active) ${selectorText}`;

    // Find the specified stylesheet by ID
    const styleSheet = [...document.styleSheets].find(
        sheet => sheet.ownerNode.id === stylesheetId
    );

    if (!styleSheet) {
        console.warn('Stylesheet not found.');
        return;
    }

    // Get the rules from the found stylesheet
    const rules = styleSheet.cssRules;
    let found = false;

    // Since deleting a rule shifts subsequent rules' indices, iterate backwards
    for (let i = rules.length - 1; i >= 0; i--) {
        if (rules[i].selectorText === modifiedSelectorText) {
            // Log the rule that is about to be deleted
            debugPrint(`Deleting CSS rule: ${rules[i].cssText}`);
            // Delete the rule
            styleSheet.deleteRule(i);
            found = true;
        }
    }

    if (!found) {
        console.warn(`No CSS rule found for selector "${modifiedSelectorText}" in stylesheet with ID "${stylesheetId}".`);
    }
}

/**
 * Adds a CSS rule to a specified stylesheet, but only if the selector does not already exist.
 * 
 * This function searches for the stylesheet by its ID. If the stylesheet is found, the function checks if a rule with the given
 * selector already exists. If not, it adds the new rule to the stylesheet.
 * 
 * @param {string} selectorText - The CSS selector text of the rule to add.
 * @param {string} stylesheetId - The ID of the stylesheet to which to add the rule.
 * @param {string} ruleContent - The content of the CSS rule to add.
 */
function addCSSRules(selectorText, stylesheetId, ruleContent) {
    // Modify the selector to include the new condition
    const modifiedSelectorText = `body:not(.elementor-editor-active) ${selectorText}`;

    // Find the specified stylesheet by ID
    const styleSheet = [...document.styleSheets].find(
        sheet => sheet.ownerNode.id === stylesheetId
    );

    if (!styleSheet) {
        console.warn('Stylesheet not found.');
        return;
    }

    // Check if a rule with the given selector already exists
    const existingRuleIndex = Array.from(styleSheet.cssRules).findIndex(
        rule => rule.selectorText === modifiedSelectorText
    );

    // If the rule does not already exist, add it
    if (existingRuleIndex === -1) {
        const fullRule = `${modifiedSelectorText} { ${ruleContent} }`;
        styleSheet.insertRule(fullRule, styleSheet.cssRules.length);
        debugPrint(`Added new CSS rule: ${fullRule}`);
    } else {
        debugPrint(`CSS rule for selector "${modifiedSelectorText}" already exists. No action taken.`);
    }
}

/**
 * Checks if the current user status is 'guest'.
 * @returns {boolean} True if the user status is 'guest', false otherwise.
 */
function isGuest() {
    return window.wce_userRoles && window.wce_userRoles.status && window.wce_userRoles.status.toLowerCase() === 'guest';
}

/**
 * Checks if the current user status is 'user'.
 * @returns {boolean} True if the user status is 'user', false otherwise.
 */
function isUser() {
    return window.wce_userRoles && window.wce_userRoles.status && window.wce_userRoles.status.toLowerCase() === 'user';
}

/**
 * Checks if the user is an administrator and either rewrites every link on the page to use a cachebuster
 * or reloads the current page with a cachebuster, depending on whether the WordPress admin bar is present.
 * This function utilizes the isRole function to determine if the user has an administrator role.
 * If the user is an administrator, the current page is not in the wp-admin directory, and the Elementor editor is not active,
 * and if the wp-admin bar is not present, it reloads the current page with a cachebuster. Otherwise, it appends a timestamp
 * as a query parameter to each link on the page to ensure the content is not served from cache.
 */
function rewriteLinksOrReloadForAdmin() {
    const isEditorActive = document.querySelector('.elementor-editor-active') !== null;
    const isWpAdminBarPresent = document.getElementById('wpadminbar') !== null;
    const isInAdminPanel = window.location.href.includes('/wp-admin/') || window.location.href.includes('elementor');
    debugPrint(`Checking admin role and page conditions for cachebuster application. Admin: ${isRole('administrator')}, WP Admin: ${isInAdminPanel}, Editor Active: ${isEditorActive}, WP Admin Bar Present: ${isWpAdminBarPresent}`);

    if (isRole('administrator') && !isInAdminPanel && !isEditorActive) {
        const currentUrl = window.location.href;
        const hasQueryParams = currentUrl.includes('?');
        const hasCachebuster = currentUrl.includes('cachebuster');

        if (!isWpAdminBarPresent && !hasCachebuster) {
            // Reload the current page with a cachebuster if the wp-admin bar is not present and no cachebuster exists
            const cachebusterUrl = `${currentUrl}${hasQueryParams ? '&' : '?'}cachebuster=${new Date().getTime()}`;
            debugPrint(`Reloading page for admin without WP Admin Bar: ${cachebusterUrl}`);
            window.location.href = cachebusterUrl;
        } else if (isWpAdminBarPresent) {
            // Get all the links on the page and append a cachebuster to each if the wp-admin bar is present
            const links = document.querySelectorAll('a:not(#wpadminbar a)');
            const timestamp = new Date().getTime();

            links.forEach(link => {
                const currentUrl = link.href;
                const hasQueryParams = currentUrl.includes('?');
                const newUrl = `${currentUrl}${hasQueryParams ? '&' : '?'}cachebuster=${timestamp}`;
                link.href = newUrl;
            });
            debugPrint(`Appended cachebuster to links for admin with WP Admin Bar present.`);
        }
    }
}

/**
 * Checks if the specified role is included for the user, case-insensitively.
 * @param {string} roleName - The name of the role to check.
 * @returns {boolean} True if the role is included for the user, false otherwise.
 */
function isRole(roleName) {
    if (window.wce_userRoles && window.wce_userRoles.roles) {
        return window.wce_userRoles.roles.some(role => role.toLowerCase() === roleName.toLowerCase());
    }
    return false;
}

document.addEventListener('wce_UpdateCSS', function() {
    debugPrint("wce_UpdateCSS event started.");

    // Access the sitePrefix from the wce_Data variable
    const sitePrefix = wce_Data.sitePrefix;

    // Initialize arrays to hold classes that should be visible or hidden
    let visibleClasses = [];
    let hiddenClasses = [];

    // Determine visibility for guest and user status
    if (isGuest()) {
        visibleClasses.push(`${sitePrefix}-guest`);
        hiddenClasses.push(`${sitePrefix}-guest-hide`);
        hiddenClasses.push(`${sitePrefix}-user`);
        visibleClasses.push(`${sitePrefix}-user-hide`);
    } else if (isUser()) {
        visibleClasses.push(`${sitePrefix}-user`);
        hiddenClasses.push(`${sitePrefix}-user-hide`);
        hiddenClasses.push(`${sitePrefix}-guest`);
        visibleClasses.push(`${sitePrefix}-guest-hide`);
    }

    // Determine visibility for each role
    wce_Data.roles.forEach(role => {
        if (isRole(role)) {
            visibleClasses.push(`${sitePrefix}-${role}`);
            hiddenClasses.push(`${sitePrefix}-${role}-hide`);
        } else {
            hiddenClasses.push(`${sitePrefix}-${role}`);
            visibleClasses.push(`${sitePrefix}-${role}-hide`);
        }
    });

    debugPrint("Visible Classes:", visibleClasses);
    debugPrint("Hidden Classes:", hiddenClasses);

    // Delete CSS rules for classes that should be visible
    visibleClasses.forEach(className => {
        deleteCSSRules(`.${className}`, STATIC_SHEET_ID);
    });

    hiddenClasses.forEach(className => {
        addCSSRules(`.${className}`, STATIC_SHEET_ID, "display: none !important;");
    });

    debugPrint("wce_UpdateCSS finished at " + getTimestampWithMilliseconds());
});

/**
 * Listens for the 'wce_UserRolesUpdate' event and updates the user roles stored in session storage and the global window object.
 * If the new roles received from the event are different from the roles currently stored in session storage,
 * it updates the stored roles and dispatches a 'wce_UpdateCSS' event to trigger a CSS update based on the new roles.
 */
document.addEventListener('wce_UserRolesUpdate', function(event) {
    // Extract new roles from the event detail
    const newRoles = event.detail;

    // Retrieve currently stored roles from session storage
    const storedRoles = retrieveUserRolesFromSessionStorage();

    // Check if the new roles are different from the stored roles
    if (JSON.stringify(newRoles) !== JSON.stringify(storedRoles)) {
        // Log the receipt of new roles and the pre-update stored roles for debugging
        debugPrint(`wce_UserRolesUpdate event received with new roles: ${JSON.stringify(newRoles)}`);
        debugPrint(`Retrieved stored roles before update: ${JSON.stringify(storedRoles)}`);

        // Update the stored roles in session storage and the global window object
        storeUserRolesInSessionStorage(newRoles);
        window.wce_userRoles = newRoles;

        // Log the update of user roles for debugging
        debugPrint(`User roles updated to: ${JSON.stringify(newRoles)}`);

        // Dispatch the 'wce_UpdateCSS' event to trigger a CSS update based on the new roles
        document.dispatchEvent(new CustomEvent('wce_UpdateCSS'));
    }
});

/**
 * Stores the user roles in session storage after verifying their structure.
 * 
 * This function takes an optional roles parameter. If roles are provided and valid, they are stored in session storage.
 * If no roles are provided, the function checks for a global variable `wce_userRoles` and stores its value instead, if valid.
 * The roles object must contain 'status' and 'roles' keys, with 'status' being either 'user' or 'guest', and 'roles' being an array.
 * If neither roles nor the global variable are available or if they do not meet the validation criteria, a warning is logged to the console.
 * Any errors encountered during the storage process are caught and logged as errors.
 * 
 * @param {Object|null} roles - An object with user and roles keys to be stored, or null to use the global `wce_userRoles` variable.
 */
function storeUserRolesInSessionStorage(roles = null) {
    try {
        // Determine the roles to store, preferring the provided roles over the global variable
        let rolesToStore = roles || (typeof wce_userRoles !== 'undefined' ? wce_userRoles : null);

        // Validate the structure of the roles object
        if (rolesToStore !== null && typeof rolesToStore === 'object' && rolesToStore.hasOwnProperty('status') && rolesToStore.hasOwnProperty('roles') && (rolesToStore.status === 'user' || rolesToStore.status === 'guest') && Array.isArray(rolesToStore.roles)) {
            // Serialize the roles object to a JSON string
            const serializedRoles = JSON.stringify(rolesToStore);
            // Store the serialized roles in session storage under the key 'wce_userRoles'
            sessionStorage.setItem('wce_userRoles', serializedRoles);
            debugPrint(`Stored roles in session storage: ${serializedRoles}`);
        } else {
            // Warn if no roles were provided, the global variable is not defined, or the roles object does not meet the validation criteria
            console.warn(`No valid roles provided or wce_userRoles is not defined or invalid. Cannot store in session storage. Attempted to store: ${JSON.stringify(rolesToStore)}`);
        }
    } catch (error) {
        // Log any errors encountered during the storage process
        console.error(`Error storing roles in session storage: ${error}`);
    }
}

/**
 * Retrieves and verifies the user roles from session storage.
 * 
 * This function attempts to retrieve the serialized user roles stored under the key 'wce_userRoles'
 * in the session storage. It then verifies that the object contains the required 'status' and 'roles' keys,
 * with 'status' being either 'user' or 'guest', and 'roles' being an array. If the roles object is found and
 * verified, it is returned. If no roles are found, if the object does not verify, or if an error occurs during
 * retrieval or parsing, appropriate errors are logged to the console, and null is returned.
 * 
 * @returns {Object|null} The verified user roles object if successful, or null if not found, does not verify, or an error occurs.
 */
function retrieveUserRolesFromSessionStorage() {
    try {
        const serializedRoles = sessionStorage.getItem('wce_userRoles');
        if (serializedRoles !== null) {
            const rolesObject = JSON.parse(serializedRoles);
            // Verify the structure of the roles object
            if (typeof rolesObject === 'object' && rolesObject.hasOwnProperty('status') && rolesObject.hasOwnProperty('roles') && (rolesObject.status === 'user' || rolesObject.status === 'guest') && Array.isArray(rolesObject.roles)) {
                return rolesObject;
            } else {
                throw new Error(`Retrieved roles object does not have the correct structure or values. Retrieved object: ${serializedRoles}`);
            }
        } else {
            console.warn('No wce_userRoles found in session storage.');
            return null;
        }
    } catch (error) {
        console.error(`Error retrieving or verifying wce_userRoles from session storage: ${error}`);
        return null;
    }
}

/**
 * Adds a script to the DOM with its source set to the cacheEverythingUrl specified in the roleData object.
 * The browser will fetch and execute the script automatically.
 */
function addScriptToDOM() {
    // Access the URL from the roleData object
    const url = wce_Data.jsUrl;

    // Create a new script element
    const scriptElement = document.createElement('script');
    scriptElement.src = url; // Set the source of the script element to the URL

    // Optional: Remove any existing script with the same ID to prevent duplicates
    const existingScript = document.getElementById('wce_RoleScript');
    if (existingScript) {
        existingScript.parentNode.removeChild(existingScript);
        debugPrint("Removed existing wce_RoleScript to prevent duplicates.");
    }
    scriptElement.id = 'wce_RoleScript'; // Assign an ID to the new script element

    // Append the script element to the head or body of the document to execute it
    document.head.appendChild(scriptElement);
    debugPrint(`Added new script to DOM with ID 'wce_RoleScript' and src: ${url}`);
}

// Initial fetch and setup process
function initializeUserRoles() {
    const storedRoles = retrieveUserRolesFromSessionStorage();
    if (storedRoles) {
        window.wce_userRoles = storedRoles;
        debugPrint(`User roles initialized from session storage: ${JSON.stringify(storedRoles)}`);
        debugPrint(`Localized script data: ${JSON.stringify(wce_Data)}`);
        document.dispatchEvent(new CustomEvent('wce_UpdateCSS'));
    } else {
        // If no roles are stored, you might want to fetch them or set default roles
        debugPrint("No stored user roles found. Fetching or setting default roles.");
        // This is where you might dispatch an event or directly call a function to fetch roles
    }
}

function setupPrefetching() {
    const isEditorActive = document.querySelector('.elementor-editor-active') !== null;
    const isInAdminPanel = window.location.href.includes('/wp-admin/');
    const isWpAdminBarPresent = document.getElementById('wpadminbar') !== null;
    const isPrefetchingGloballyEnabled = wce_Data.prefetchEnabled == '1';

    const shouldPrefetch = isPrefetchingGloballyEnabled && !isWpAdminBarPresent && !isInAdminPanel && !isEditorActive;
    debugPrint(`Prefetching is ${shouldPrefetch ? 'enabled' : 'disabled'}.`);
    if (shouldPrefetch) {
        const links = document.querySelectorAll('a');
        // Get the current page's origin once, before the loop
        const currentPageOrigin = window.location.origin;

        // Start with predefined exclude conditions
        const excludeConditions = [
            url => !url, // Exclude if URL is falsy
            url => url.startsWith('#'), // Exclude if URL is an anchor link
            url => url.includes('?'), // Exclude if URL has query parameters
            url => /\/login|\/signin/.test(url), // More specific: Exclude if URL path contains /login or /signin
            url => /\/logout|\/signout/.test(url), // More specific: Exclude if URL path contains /logout or /signout
            url => url.startsWith('javascript:'), // Exclude if URL is a JavaScript call
            url => /\.(pdf|zip|rar|exe|doc|docx|xls|xlsx)$/i.test(url), // Exclude common file downloads
            url => /\.(jpg|jpeg|png|webp|avif|gif|svg|mp4|mp3)$/i.test(url), // Exclude common media files
            url => url.includes('#!'), // Exclude URLs with hashbangs (ajax)
            url => url.includes('/subscribe'), // Example: Exclude subscription URLs
            url => {
                try {
                    const linkOrigin = new URL(url, currentPageOrigin).origin;
                    return linkOrigin !== currentPageOrigin; // Exclude if URL is from another domain
                } catch (e) {
                    return true; // Exclude if URL is malformed
                }
            },
            url => url.startsWith('mailto:'), // Example: Exclude if URL is a mailto link
            url => url.startsWith('tel:'), // Exclude telephone links
            url => url.startsWith('sms:'), // Exclude SMS links
            url => url.startsWith('file:'), // Exclude local file links
            url => url.startsWith('ftp:'), // Exclude FTP links
            url => url.startsWith('blob:'), // Exclude blob URLs
            url => url.startsWith('data:'), // Exclude data URLs
            url => url.startsWith('chrome-extension:'), // Exclude Chrome extension links
            url => url.startsWith('about:'), // Exclude browser internal pages
            // Additional conditions can be added here
        ];

        // Function to extract path and query from a URL
        const getPathAndQuery = url => {
            const urlObj = new URL(url, currentPageOrigin);
            return urlObj.pathname + urlObj.search;
        };

        // Print all exclusion conditions
        excludeConditions.forEach((condition, index) => {
            debugPrint(`Exclusion condition ${index + 1}: ${condition.toString()}`);
        });

        // Add "Starts With" exclusions
        (wce_Data.prefetchStartsWith || []).forEach(pattern => {
            excludeConditions.push(url => getPathAndQuery(url).startsWith(pattern));
            debugPrint(`Exclusion condition: url => getPathAndQuery(url).startsWith('${pattern}')`);
        });

        // Add "Contains" exclusions
        (wce_Data.prefetchContains || []).forEach(pattern => {
            excludeConditions.push(url => getPathAndQuery(url).includes(pattern));
            debugPrint(`Exclusion condition: url => getPathAndQuery(url).includes('${pattern}')`);
        });

        // Add "Regex Patterns" exclusions
        (wce_Data.prefetchRegex || []).forEach(pattern => {
            const regex = new RegExp(pattern);
            excludeConditions.push(url => regex.test(getPathAndQuery(url)));
            debugPrint(`Exclusion condition: url => getPathAndQuery(url).matches Regex('${pattern}')`);
        });

        links.forEach(link => {
            const url = link.getAttribute('href');
            // Use the array to check if any condition applies
            if (excludeConditions.some(condition => condition(url))) {
                return;
            }

            // Named function for mouseover event
            function handleMouseOver() {
                addPrefetchLink(url);
                // Remove the event listener after prefetching
                link.removeEventListener('mouseover', handleMouseOver);
            }

            // Add the event listener
            link.addEventListener('mouseover', handleMouseOver);
        });
    }
}

// Log the start time
debugPrint(`Script Starting: ${getTimestampWithMilliseconds()}`);

// Initial call to set up roles on page load
initializeUserRoles();

// Fetch the role data
addScriptToDOM();

// Check if the DOM is already loaded
if (document.readyState === "loading") {
    document.addEventListener('DOMContentLoaded', setupPrefetching);
    document.addEventListener('DOMContentLoaded', rewriteLinksOrReloadForAdmin);

} else {
    // DOMContentLoaded has already fired, call the function directly
    setupPrefetching();
    rewriteLinksOrReloadForAdmin();
}