// In-game view for displaying the tech tree
import P5 from "p5";
import View from "./view";
import Infrastructure from "./infrastructure";
import Industry from "./industry";
import Population from "./population";
import { constants } from "./constants";

export default class IndustryView extends View {
    // Industry overview Types:
    // FORMATTING
    _leftBoxEdge: number;
    _rightBoxEdge: number;
    _boxTop: number;
    _boxWidth: number;
    _boxHeight: number;
    _margin: number;            // Specifically for positioning left-aligned text within the two big boxes
    // DATA TO BE DISPLAYED
    _miningZones: number;
    _miningZonesInUse: number;
    _miners: number;
    _productionModules: number;
    _moduleWorkers: number;

    constructor(changeView: (newView: string) => void) {
        super(changeView);
        this._leftBoxEdge = 64;
        this._rightBoxEdge = constants.SCREEN_WIDTH / 2 + 64;
        this._boxTop = 128;
        this._boxWidth = constants.SCREEN_WIDTH / 2 - 128;
        this._boxHeight = constants.SCREEN_HEIGHT - 320;
        this._margin = 16;
        this._miningZones = 0;
        this._miningZonesInUse = 0;
        this._miners = 0;
        this._productionModules = 0;
        this._moduleWorkers = 0;
    }

    setup = (infra: Infrastructure, industry: Industry, population: Population) => {
        this.currentView = true;
        // Get data from the 3 engine components
        // TODO: Fill this out to allow more types of resources to be seen individually
        this._miningZones = industry._miningLocations.water.length;
        this._miningZonesInUse = industry._miningCoordinatesInUse.water.length;
        this._miners = population._colonists.filter((col) => col._data._role[0] === "miner").length;
        this._productionModules = infra._modules.filter((mod) => mod._moduleInfo.type === "Production").length;
        // TODO: Fill this out to allow more types of workers to be seen individually
        this._moduleWorkers = population._colonists.filter((col) => col._data._role[0] === "farmer").length;
    }

    render = (p5: P5) => {
        p5.textSize(28);
        p5.textAlign(p5.CENTER);
        p5.background(constants.APP_BACKGROUND);
        p5.fill(constants.GREEN_TERMINAL);
        p5.text("Colony Industry Report", constants.SCREEN_WIDTH / 2, 64);
        this._buttons.forEach((button) => {
            button.render(p5);
        })
        p5.fill(constants.GREEN_DARKEST);
        p5.rect(this._leftBoxEdge, this._boxTop, this._boxWidth, this._boxHeight);
        p5.rect(this._rightBoxEdge, this._boxTop, this._boxWidth, this._boxHeight);
        p5.fill(constants.BLUEGREEN_CRYSTAL);
        p5.text("Mining Zones", this._leftBoxEdge + this._boxWidth / 2, this._boxTop + 48);
        p5.fill(constants.PURPLE_LIGHT);
        p5.text("Production Modules", this._rightBoxEdge + this._boxWidth / 2, this._boxTop + 48);
        p5.textSize(20);
        p5.fill(constants.GREEN_TERMINAL);
        p5.textAlign(p5.LEFT);
        p5.text(`Water Mining Zones: ${this._miningZones}`, this._leftBoxEdge + this._margin, this._boxTop + 100);
        p5.text(`Mining Zones in use: ${this._miningZonesInUse}`, this._leftBoxEdge + this._margin, this._boxTop + 140);
        p5.text(`Number of Miners: ${this._miners}`, this._leftBoxEdge + this._margin, this._boxTop + 180);
        p5.text(`Total Production Modules: ${this._productionModules}`, this._rightBoxEdge + this._margin, this._boxTop + 100);
        p5.text(`Number of production workers: ${this._moduleWorkers}`, this._rightBoxEdge + this._margin, this._boxTop + 140);

    }

}