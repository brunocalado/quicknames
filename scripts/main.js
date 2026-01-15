import { QuickNamesApp } from "./quick-names-app.js";

/**
 * Initialize Module
 */
Hooks.once("init", () => {
    console.log("Quick Names | Initializing module");

    // Expose the API globally
    window.QuickNames = {
        /**
         * Opens the Quick Names Application window
         */
        Open: () => {
            new QuickNamesApp().render(true);
        }
    };
});

/**
 * Add a button to the Token Controls (left sidebar) for easy access
 */
Hooks.on("getSceneControlButtons", (controls) => {
    let tokenControls;

    // Strategy 1: Standard Array
    if (Array.isArray(controls)) {
        tokenControls = controls.find(c => c.name === "token");
    } 
    // Strategy 2: Object wrapper (SceneControls instance or Dictionary)
    else if (typeof controls === "object" && controls !== null) {
        // Case A: Has a .controls array property
        if (Array.isArray(controls.controls)) {
            tokenControls = controls.controls.find(c => c.name === "token");
        }
        // Case B: Is a dictionary/map where keys are control names (Matches your error log)
        else if (controls.token) {
            tokenControls = controls.token;
        }
    }

    // Only proceed if we successfully found the token layer controls
    if (tokenControls && tokenControls.tools) {
        // Prevent duplicate buttons if hook fires multiple times
        if (!tokenControls.tools.find(t => t.name === "quicknames")) {
            tokenControls.tools.push({
                name: "quicknames",
                title: "Quick Names",
                icon: "fas fa-book-open",
                onClick: () => {
                    if (window.QuickNames) {
                        window.QuickNames.Open();
                    } else {
                        ui.notifications.warn("Quick Names is not fully initialized.");
                    }
                },
                button: true
            });
        }
    }
});