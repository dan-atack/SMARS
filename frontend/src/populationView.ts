// In-game view for displaying the tech tree
import P5 from "p5";
import View from "./view";
import Button from "./button";
import Population from "./population";
import { constants } from "./constants";
import PopulationRow from "./populationRow";

export default class PopulationView extends View {
    // Population Overview page Types:
    _population: Population | null;                 // Start with very basic info about the colony's population
    _rows: PopulationRow[];
    _rowIndent: number;                             // Distance from the left edge of the screen for rows to be rendered
    _colWidths: number[];                           // List of column widths, in pixels
    _colHeaderPositions: number[];                  // For ease of use, the positions for each column header (label)
    // Pagination
    _optionsShowing: number;                        // Index position for the FIRST load option to be shown
    _optionsPerPage: number;                        // How many index positions to show per 'page'
    // In-view message / notification system
    _message: string;
    _messageColor: string;
    // Colony morale rating adjectives
    _adjectives: string[];
    _moraleIndex: number;                   // The adjectives list index to be used when describing the colony's overall morale

    constructor(changeView: (newView: string) => void) {
        super(changeView);
        this._population = null;           // By default there is zero population (gets set by the setup routine)
        this._rows = [];
        this._rowIndent = 64;
        const rowPercent = (constants.SCREEN_WIDTH - 160) / 100;      // With default values one percent is 8 pixels wide
        this._colWidths = [rowPercent * 25, rowPercent * 10, rowPercent * 15, rowPercent * 50];
        this._colHeaderPositions = [];
        let cur = 0;
        this._colWidths.forEach((col) => {
            this._colHeaderPositions.push(cur + col / 2);   // Ensure each column header is at the middle of the column
            cur += col;
        })
        this._optionsShowing = 0;
        this._optionsPerPage = 4;
        this._message = "";
        this._messageColor = constants.GREEN_TERMINAL;
        this._adjectives = ["Despondent", "Terrible", "Dismal", "Dissatisfied", "Lacking", "Okay", "Plucky", "Fiesty", "Superb", "Ebullient", "Ecstatic"];
        this._moraleIndex = 4;      // Default morale rating is 4 (okay)
        const prev = new Button("PREV", constants.SCREEN_WIDTH - 80, 128, this.handlePrev, 64, 48, constants.GREEN_TERMINAL, constants.GREEN_DARK, 18);
        this._buttons.push(prev);
        const next = new Button("NEXT", constants.SCREEN_WIDTH - 80, 420, this.handleNext, 64, 48, constants.GREEN_TERMINAL, constants.GREEN_DARK, 18);
        this._buttons.push(next);
        // Override default handler function for 'return to game' button
        this._buttons[0].handler = this.handleReturnToGame;
    }

    setup = (population: Population) => {
        this.currentView = true;
        this.setPopulation(population);
        // Create population rows anew each time setup is called
        this.populateRows();
        this.updateMoraleAdjective(population);
    }

    setPopulation = (population: Population) => {
        this._population = population;
    }

    // BUTTON HANDLERS

    handleClicks = (mouseX: number, mouseY: number) => {
        // Reset message FIRST when any click is registered (to clear away error text)
        if (this._population) {
            const min = this._optionsShowing + 1;
            const max = Math.min(this._optionsShowing + this._optionsPerPage, this._population._colonists.length);
            this.setMessage(`Showing colonists ${min} - ${max} out of ${this._population._colonists.length}`, constants.GREEN_TERMINAL);
        }
        this._buttons.forEach((button) => {
            button.handleClick(mouseX, mouseY);
        });
        this._rows.forEach((row) => {
            row.handleClicks(mouseX, mouseY);
        });
    }

    // Button handlers for Role assignments: All need just the Colonist's ID as an argument

    setExplorer = (id: number) => {
        this._population?.assignColonistRole(id, ["explorer", 0]);      // No module ID is needed for exploration role...
    }

    setFarmer = (id: number) => {
        this._population?.assignColonistRole(id, ["farmer", 0]);      // ...In fact, module ID req is slated for deprecation...
    }

    setMiner = (id: number) => {
        this._population?.assignColonistRole(id, ["miner", 0]);      // ... That was fast!
    }

    // Button handlers for pagination

    handleNext = () => {
        if (this._population && this._population._colonists.length > this._optionsShowing + this._optionsPerPage) {
            this._optionsShowing += this._optionsPerPage;
            this.populateRows();
        } else {
            this.setMessage("You are at the end of the list.", constants.RED_ERROR);
        }
    }

    handlePrev = () => {
        if (this._optionsShowing > 0) {
            this._optionsShowing -= this._optionsPerPage;
            if (this._optionsShowing < 0) this._optionsShowing = 0; // Don't go past zero
            this.populateRows();
        } else {
            this.setMessage("You are at the start of the list", constants.RED_ERROR);
        }
    }

    populateRows = () => {
        this._rows = [];            // Reset rows list each time it is populated
        if (this._population) {
            this._population._colonists.forEach((colonist, idx) => {
                // Restrict options to the range specified by the pagination limits:
                if (idx >= this._optionsShowing && idx < this._optionsShowing + this._optionsPerPage) {
                    let c = new PopulationRow(colonist, this._rowIndent, idx - this._optionsShowing, this._colWidths, this.setExplorer, this.setFarmer, this.setMiner);
                this._rows.push(c);
                c.setRoleButtonSelection(this.determineRoleButton(colonist._data._role[0]));
                }
            });
        // Update message text
        const min = this._optionsShowing + 1;
        const max = Math.min(this._optionsShowing + this._optionsPerPage, this._population._colonists.length);
        this.setMessage(`Showing colonists ${min} - ${max} out of ${this._population._colonists.length}`, constants.GREEN_TERMINAL);
        }
    }

    // Ensures each colonist's current role button is highlighted when the page loads
    determineRoleButton = (role: string) => {
        switch (role) {
            case "explorer":
                return 0;
            case "farmer":
                return 1;
            case "miner":
                return 2;
            default:
                console.log(`Error: Role ${role} not recognized. Defaulting to 'Explorer.'`);
                return 0;
        }
    }

    // Button handler for 'Return to Game': cleans up population rows and message text, and resets pagination
    handleReturnToGame = () => {
        this.cleanupPopulationRows();
        this.changeView("engine");
        this.setMessage("", constants.GREEN_TERMINAL);
        this._optionsShowing = 0;
    }

    // Internal message/notification controller

    // Color string is red for negative or green for positive
    setMessage = (message: string, color: string) => {
        this._message = message;
        this._messageColor = color;
    }

    // Cleans up the Colonist Rows
    cleanupPopulationRows = () => {
        this._rows = [];
    }

    // Updates the index value of the morale adjectives list to be shown when the view is opened
    updateMoraleAdjective = (population: Population) => {
        this._moraleIndex = Math.floor(population._averageMorale / 10);
    }

    render = (p5: P5) => {
        p5.background(constants.APP_BACKGROUND);
        p5.stroke(constants.ALMOST_BLACK);
        p5.fill(constants.GREEN_TERMINAL);
        p5.textSize(32);
        p5.text("SMARS Colonist Roster", constants.SCREEN_WIDTH / 2, 64);
        p5.textSize(20);
        p5.text("Name", this._colHeaderPositions[0] + this._rowIndent, 144);
        p5.text("Morale", this._colHeaderPositions[1] + this._rowIndent, 144);
        p5.text("Role", this._colHeaderPositions[2] + this._rowIndent, 144);
        p5.text("Role Options", this._colHeaderPositions[3] + this._rowIndent, 144);
        p5.textAlign(p5.LEFT, p5.CENTER);
        p5.text(`Number of Colonists: ${this._population?._colonists.length}`, constants.SCREEN_WIDTH / 16, 480);
        p5.text("Colony health rating: Fair", constants.SCREEN_WIDTH / 16, 500);
        p5.text(`Colony morale rating: ${this._adjectives[this._moraleIndex]} (${this._population?._averageMorale})`, constants.SCREEN_WIDTH / 16, 520);
        this._buttons.forEach((button) =>{
            button.render(p5);
        });
        this._rows.forEach((row) => {
            row.render(p5);
        })
        // Render error/info message:
        p5.textSize(18);    
        p5.fill(this._messageColor);
        p5.text(this._message, 800, 500);
    }

}