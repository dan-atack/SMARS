// In-game view for displaying the tech tree
import P5 from "p5";
import View from "./view";
import Population from "./population";
import { constants } from "./constants";
import PopulationRow from "./populationRow";

export default class PopulationView extends View {
    // Population Overview page Types:
    _population: Population | null;                 // Start with very basic info about the colony's population
    _rows: PopulationRow[];
    _rowIndent: number;                             // Distance from the left edge of the screen for rows to be rendered
    _colWidths: number[];                           // List of column widths, in pixels
    _colHeaderPositions: number[];                        // For ease of use, the positions for each column header (label)

    constructor(p5: P5, changeView: (newView: string) => void) {
        super(p5, changeView);
        this._population = null;           // By default there is zero population (gets set by the setup routine)
        this._rows = [];
        this._rowIndent = 64;
        const rowPercent = (constants.SCREEN_WIDTH - 160) / 100;      // With default values one percent is 8 pixels wide
        this._colWidths = [rowPercent * 10, rowPercent * 20, rowPercent * 20, rowPercent * 50];
        this._colHeaderPositions = [];
        let cur = 0;
        this._colWidths.forEach((col) => {
            this._colHeaderPositions.push(cur + col / 2);   // Ensure each column header is at the middle of the column
            cur += col;
        })
    }

    setup = (population: Population) => {
        this.currentView = true;
        this.setPopulation(population);
        // Create population rows anew each time setup is called
        this._population?._colonists.forEach((colonist, idx) => {
            const row = new PopulationRow(colonist, this._rowIndent, idx, this._colWidths, this.setExplorer, this.setFarmer, this.setMiner);
            this._rows.push(row);
        })
        const p5 = this._p5;
        p5.background(constants.APP_BACKGROUND);
        p5.text("Population page", constants.SCREEN_WIDTH / 2, 128);
    }

    setPopulation = (population: Population) => {
        this._population = population;
    }

    // Button handlers for Role assignments: All need just the Colonist's ID as an argument

    setExplorer = (id: number) => {
        console.log(`Assigning colonist ${id} to new role: Explorer.`);
    }

    setFarmer = (id: number) => {
        console.log(`Assigning colonist ${id} to new role: Farmer.`);
    }

    setMiner = (id: number) => {
        console.log(`Assigning colonist ${id} to new role: Miner.`);
    }

    handleClicks = (mouseX: number, mouseY: number) => {
        this._buttons.forEach((button) => {
            button.handleClick(mouseX, mouseY);
        });
        this._rows.forEach((row) => {
            row.handleClicks(mouseX, mouseY);
        })
    }

    // Button handler for 'Return to Game'
    handleReturnToGame = () => {
        this.cleanupPopulationRows();
        this.changeView("engine");
    }

    // Cleans up the Colonist Rows so we don't waste any memory when they are not needed
    cleanupPopulationRows = () => {
        this._rows = [];
    }

    render = () => {
        const p5 = this._p5;
        p5.background(constants.APP_BACKGROUND);
        p5.stroke(constants.ALMOST_BLACK);
        p5.fill(constants.GREEN_TERMINAL);
        p5.text("SMARS Colonist Roster", constants.SCREEN_WIDTH / 2, 64);
        p5.textSize(20);
        p5.text("ID", this._colHeaderPositions[0] + this._rowIndent, 144);
        p5.text("Name", this._colHeaderPositions[1] + this._rowIndent, 144);
        p5.text("Current Role", this._colHeaderPositions[2] + this._rowIndent, 144);
        p5.text("Role Options", this._colHeaderPositions[3] + this._rowIndent, 144);
        p5.textAlign(p5.LEFT, p5.CENTER);
        p5.text(`Number of Colonists: ${this._population?._colonists.length}`, constants.SCREEN_WIDTH / 8, 500);
        p5.text("Colony health rating: Fair", constants.SCREEN_WIDTH / 8, 520);
        p5.text("Colony morale rating: Plucky", constants.SCREEN_WIDTH / 8, 540);
        this._buttons.forEach((button) =>{
            button.render(p5);
        });
        this._rows.forEach((row) => {
            row.render(p5);
        })
    }

}