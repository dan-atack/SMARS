// The Inspect Display component sits in the Details Area and displays data about whatever entity has been selected by the Engine's Inspect tool
import P5 from "p5";
import Block from "./block";
import Colonist from "./colonist";
import Connector from "./connector";
import { constants } from "./constants";
import Module from "./module";

export default class InspectDisplay {
    // Inspect Display types
    _rightEdge: number;
    _top: number;
    _width: number;
    _height: number;
    _center: number;        // Derived from the X position plus width over two; for convenience in positioning text elements
    _headerHeight: number;  // Good position for the header displaying the selected Object type, name and ID (when applicable)
    _currentSelection: Block | Colonist | Connector | Module | null;
    _selectionName: string;     // Quick way for the renderer to know what type of object is selected

    constructor(x: number, y: number) {
        this._rightEdge = x;
        this._top = y;
        this._width = constants.SCREEN_WIDTH - x;
        this._height = constants.SCREEN_HEIGHT - y;
        this._center = this._rightEdge + this._width / 2;
        this._headerHeight = this._top + 24;
        this._currentSelection = null;
        this._selectionName = "";
    }

    // SECTION 1 - GENERAL UPDATE AND TYPE IDENTIFICATION METHODS

    updateSelection = (data: Block | Colonist | Connector | Module | null) => {
        this._currentSelection = data;
        if (data) {
            console.log(this._currentSelection);
            if (this.isBlock(data)) this._selectionName = "block";
            if (this.isColonist(data)) this._selectionName = "colonist";
            if (this.isConnector(data)) this._selectionName = "connector";
            if (this.isModule(data)) this._selectionName = "module";
        } else {
            this._selectionName = "";
        }
    }

    isColonist (obj: Block | Colonist | Connector | Module): obj is Colonist {
        return (obj as Colonist).drawHead !== undefined;
    }

    isConnector (obj: Block | Colonist | Connector | Module): obj is Connector {
        return (obj as Connector)._segments !== undefined;
    }

    isModule (obj: Block | Colonist | Connector | Module): obj is Module {
        return (obj as Module).addResource !== undefined;
    }

    isBlock (obj: Block | Colonist | Connector | Module): obj is Block {
        return (obj as Block)._blockData !== undefined;
    }

    // SECTION 2 - CLASS-SPECIFIC DISPLAY TEMPLATES

    displayColonistData = (p5: P5) => {
        p5.text("Colonist Details", this._center, this._headerHeight);
    }

    displayConnectortData = (p5: P5) => {
        p5.text("Connector Details", this._center, this._headerHeight);
    }

    displayModuleData = (p5: P5) => {
        p5.text("Module Details", this._center, this._headerHeight);
    }

    displayBlockData = (p5: P5) => {
        p5.text("Terrain Block Details", this._center, this._headerHeight);
    }

    render = (p5: P5) => {
        p5.fill(constants.GREEN_TERMINAL);
        if (this._currentSelection) {
            switch (this._selectionName) {
                case "block":
                    this.displayBlockData(p5);
                    break;
                case "colonist":
                    this.displayColonistData(p5);
                    break;
                case "connector":
                    this.displayConnectortData(p5);
                    break;
                case "module":
                    this.displayModuleData(p5);
                    break;
                default:
                    p5.fill(constants.RED_ERROR);
                    p5.text("Warning: Inspect Data Missing", this._rightEdge + 48, this._top);
            }
        }
    }
}