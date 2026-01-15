const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * Main application class for Quick Names.
 * Extends ApplicationV2 with Handlebars support.
 */
export class QuickNamesApp extends HandlebarsApplicationMixin(ApplicationV2) {
    
    /** @override */
    static DEFAULT_OPTIONS = {
        id: "quicknames-app",
        tag: "form",
        window: {
            title: "Quick Names",
            icon: "fas fa-book-open",
            resizable: true,
            width: 350,
            height: "auto"
        },
        classes: ["quicknames-app"],
        position: {
            width: 350,
            height: "auto"
        },
        actions: {
            generateName: QuickNamesApp.prototype._onGenerateName,
            copyName: QuickNamesApp.prototype._onCopyName
        }
    };

    /** @override */
    static PARTS = {
        form: {
            template: "modules/quicknames/templates/quicknames.hbs"
        }
    };

    /**
     * Prepares data for the template.
     * Uses a hardcoded list of origins as requested.
     * @override
     */
    async _prepareContext(_options) {
        // Defined list of supported origins
        // UPDATED: Added Angels, Demons, Egyptian, German, Scandinavian
        const origins = [
            "Angels", "Arabic", "Brazilian", "Chinese", "Demons", 
            "Egyptian", "English", "German", "Greek", "Indian", 
            "Japanese", "Latin", "Nigerian", "Scandinavian", "Spanish"
        ];

        return {
            origins: origins,
            result: ""
        };
    }

    /**
     * Handle the Generate button click.
     */
    async _onGenerateName(event, target) {
        const formData = new FormData(this.element);
        
        const origin = formData.get("origin");
        const genderSelection = formData.get("gender"); 
        const hasSurname = formData.get("hasSurname") === "on";

        if (!origin) {
            // Silently return if no origin is selected
            return;
        }

        let firstNameTableName = "";
        let surnameTableName = "";
        let shouldRollSurname = hasSurname;

        // Special handling for "Angels" and "Demons" (Single table, no surname/gender variants)
        if (["Angels", "Demons"].includes(origin)) {
            firstNameTableName = origin;
            shouldRollSurname = false; // These tables don't have surnames
        } else {
            // Standard logic for cultural names (Origin + Gender / Origin + Surname)
            let genderToRoll = genderSelection;
            if (genderSelection === "all") {
                genderToRoll = Math.random() < 0.5 ? "Male" : "Female";
            }
            firstNameTableName = `${origin} ${genderToRoll}`;
            surnameTableName = `${origin} Surname`;
        }

        // Generate names
        const firstName = await this._rollTableByName(firstNameTableName);
        
        let finalName = firstName;

        if (shouldRollSurname) {
            // Attempt to get surname
            const surname = await this._rollTableByName(surnameTableName);
            if (surname) {
                finalName = `${firstName} ${surname}`;
            }
        }

        // Update the UI
        const resultInput = this.element.querySelector("#name-result");
        if (resultInput) {
            resultInput.value = finalName;
        }
    }

    /**
     * Copy the current result to clipboard
     */
    _onCopyName(event, target) {
        const resultInput = this.element.querySelector("#name-result");
        const text = resultInput?.value;

        if (text) {
            game.clipboard.copyPlainText(text);
            // No notification generated
        }
    }

    /**
     * Helper to find a table by name and draw a result.
     * @param {string} tableName 
     */
    async _rollTableByName(tableName) {
        const pack = game.packs.get("quicknames.names");
        if (!pack) return "";

        // Get index to find ID by Name
        const index = await pack.getIndex();
        const entry = index.find(e => e.name === tableName);

        if (!entry) {
            // Silently fail if table not found
            return ""; 
        }

        const table = await pack.getDocument(entry._id);
        const draw = await table.draw({ displayChat: false });
        
        if (!draw.results || draw.results.length === 0) return "";

        // FIXED: V13 Deprecation fix.
        // result.name contains the text content for Text results.
        const result = draw.results[0];
        
        return result.name || "";
    }
}