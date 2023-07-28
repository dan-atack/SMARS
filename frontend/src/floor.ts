// The Floor represents a single walkable surface within the base, and accompanying information about the modules that comprise it
import P5 from "p5";
import { MapZone } from "./map";
import { constants } from "./constants";

export default class Floor {
    // Floor types:
    _id: number;                // Assigned as a serial number at the Floor's creation by the Infra class
    _leftSide: number;          // Grid location of the floor's left-most column
    _rightSide: number;         // Grid location of the floor's right-most column
    _elevation: number;         // Grid location of the floor's altitude, on the y-axis
    _modules: number[];         // List of UIDs all the modules that form this floor
    _connectors: number[];      // List of UIDs of all the transit connectors that intersect with this floor
    _groundFloorZones: MapZone[] // A list of zero to several map zones that the Floor sits upon

    // To create a floor we need the floor's ID and elevation only; we can add its first module after construction by calling the add module method
    constructor(id: number, elevation: number) {
        this._id = id;
        this._leftSide = 0;
        this._rightSide = 0;
        this._elevation = elevation;
        this._modules = [];
        this._connectors = [];
        this._groundFloorZones = [];
    }

    // Take a list of columns' indices and uses them to redetermine the position of the right/left edges
    updateFootprint = (footprint: number[]) => {
        // Ensure the footprint is well ordered:
        footprint.sort((a, b) => a - b);
        // Update left side if the footprint is further left, or if it has not been set yet (value = 0)
        if (footprint[0] < this._leftSide || this._leftSide === 0) {
            this._leftSide = footprint[0];
        }
        if (footprint[footprint.length - 1] > this._rightSide) {
            this._rightSide = footprint[footprint.length - 1];  // Update right side if the footprint's last index is greater
        }
    }

    // Take a list of columns' indices and see if they are positioned to the immediate right or left of the floor's current edges
    checkIfAdjacent = (footprint: number[]) => {
        let adjacent = false;
        let message = "";     // To display error/non-compatibility issues, or 'left' or 'right' if adjacency is detected
        // Sort footprint first
        footprint.sort((a, b) => a - b);
        if (footprint[0] - this._rightSide === 1) {
            adjacent = true;    // Footprint is adjacent to the right edge
            message = "Adjacent: Right";
        } else if(footprint[0] - this._rightSide > 1) {
            message = "Too far right";
        } else if (this._leftSide - footprint[footprint.length - 1] === 1) {
            adjacent = true;    // Footprint is adjacent to the left side
            message = "Adjacent: Left";
        } else if (this._leftSide - footprint[footprint.length - 1] > 1) {
            message = "Too far left";
        } else {
            message = "ERROR: Overlap detected";
        }
        
        return [adjacent, message];
    }

    // Top level expander function: Updates the footprint and adds the new module ID to the list
    addModule = (moduleId: number, footprint: number[]) => {
        this._modules.push(moduleId);
        this.updateFootprint(footprint);
    }

    addConnector = (connectorId: number) => {
        this._connectors.push(connectorId);
    }

    setGroundFloorZones = (zones: MapZone[]) => {
        zones.forEach((zone) => {
            if (this._groundFloorZones.find((z) => {
                return zone.id === zone.id
            }) === undefined) {
                // console.log(`Added map zone with ID ${zone.id} to Floor ${this._id} ground zones list.`);
                this._groundFloorZones.push(zone);  // Only add the new zone if it is not found in the existing list
            }
        })
    }

    // GETTER METHODS TO PROVIDE COLONISTS WITH PATHFINDING DATA

    // Returns an array containing just the ground zone IDs (if any) that the floor is connected with
    getFloorGroundZones = () => {
        const zoneIds: string[] = [];
        this._groundFloorZones.forEach((zone) => {
            zoneIds.push(zone.id);
        })
        return zoneIds;
    }

    // TODO: Add removal functions for Modules and Connectors

    render = (p5: P5, xOffset: number) => {
        const r = this._rightSide * constants.BLOCK_WIDTH - xOffset + constants.BLOCK_WIDTH;
        const l = this._leftSide * constants.BLOCK_WIDTH - xOffset;
        const e = this._elevation * constants.BLOCK_WIDTH + constants.BLOCK_WIDTH;
        p5.stroke(this._id % 2 === 0 ? constants.GREEN_TERMINAL : constants.YELLOW_TEXT);
        p5.line(r, e, l, e);
    }
}