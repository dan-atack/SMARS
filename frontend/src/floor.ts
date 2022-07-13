// The Floor represents a single walkable surface within the base, and accompanying information about the modules that comprise it
import { constants } from "./constants";

export default class Floor {
    // Floor types:
    _id: number;                // Assigned as a serial number at the Floor's creation by the Infra class
    _leftSide: number;          // Grid location of the floor's left-most column
    _rightSide: number;         // Grid location of the floor's right-most column
    _elevation: number;         // Grid location of the floor's altitude, on the y-axis
    _modules: number[];         // List of UIDs all the modules that form this floor
    _connectors: number[];      // List of UIDs of all the transit connectors that intersect with this floor
    _groundFloor: boolean;      // Set to true if this is the ground floor; if so, no connectors are needed to access this floor

    constructor(id: number, leftSide: number, rightSide: number, elevation: number) {
        this._id = id;
        this._leftSide = leftSide;
        this._rightSide = rightSide;
        this._elevation = elevation;
        this._modules = [];
        this._connectors = [];
        this._groundFloor = false;
    }

    // Take a list of columns' indices and uses them to redetermine the edges
    updateFootprint = (footprint: number[]) => {
        // Recalculates the left/right side when given the footprint for a new module
    }

    // Take a list of columns' indices and see if they are positioned to the immediate right or left of the floor's current edges
    checkIfAdjacent = (footprint: number[]) => {
        let adjacent = false;
        // Given a footprint (list of column indices), should first sort them and then if they are close enough to either side, adjust the left/right edge values as needed.
        // Should return true if the operation is a success, and false if not possible (including if the footprint of the proposed new module overlaps with the floor's current footprint (indicating an error))
        console.log(footprint);
        // TODO: Write the code after coming up with unit tests for it!
        return adjacent;
    }

    // Top level expander function: Updates the footprint and adds the new module ID to the list
    addModule = (moduleId: number, footprint: number[]) => {
        this._modules.push(moduleId);
        this.updateFootprint(footprint);
    }

    addConnector = (connectorId: number) => {
        this._connectors.push(connectorId);
    }

    // TODO: Add removal functions for Modules and Connectors
}