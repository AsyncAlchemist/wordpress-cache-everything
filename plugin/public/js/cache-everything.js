const DYNAMIC_SHEET_ID = 'cache-everything-dynamic-css';
const STATIC_SHEET_ID = 'cache-everything-css';

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

document.addEventListener('DOMContentLoaded', function() {
    debugPrint('DOM fully loaded and parsed at:', getTimestampWithMilliseconds());
});

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
        if (rules[i].selectorText === selectorText) {
            // Log the rule that is about to be deleted
            debugPrint(`Deleting CSS rule: ${rules[i].cssText}`);
            // Delete the rule
            styleSheet.deleteRule(i);
            found = true;
        }
    }

    if (!found) {
        console.warn(`No CSS rule found for selector "${selectorText}" in stylesheet with ID "${stylesheetId}".`);
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
        rule => rule.selectorText === selectorText
    );

    // If the rule does not already exist, add it
    if (existingRuleIndex === -1) {
        const fullRule = `${selectorText} { ${ruleContent} }`;
        styleSheet.insertRule(fullRule, styleSheet.cssRules.length);
        debugPrint(`Added new CSS rule: ${fullRule}`);
    } else {
        debugPrint(`CSS rule for selector "${selectorText}" already exists. No action taken.`);
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
        hiddenClasses.push(`${sitePrefix}-user`);
    } else if (isUser()) {
        visibleClasses.push(`${sitePrefix}-user`);
        hiddenClasses.push(`${sitePrefix}-guest`);
    }

    // Determine visibility for each role
    wce_Data.roles.forEach(role => {
        if (isRole(role)) {
            visibleClasses.push(`${sitePrefix}-${role}`);
        } else {
            hiddenClasses.push(`${sitePrefix}-${role}`);
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

debugPrint(`Script Starting: ${getTimestampWithMilliseconds()}`);


// Initial call to set up roles on page load
initializeUserRoles();

// Fetch the role data
addScriptToDOM();