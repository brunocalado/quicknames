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
 * Optional: Add a button to the Token Controls (left sidebar) for easy access
 */
Hooks.on("getSceneControlButtons", (controls) => {
    const tokenControls = controls.find(c => c.name === "token");
    if (tokenControls) {
        tokenControls.tools.push({
            name: "quicknames",
            title: "Quick Names",
            icon: "fas fa-book-open",
            onClick: () => window.QuickNames.Open(),
            button: true
        });
    }
});