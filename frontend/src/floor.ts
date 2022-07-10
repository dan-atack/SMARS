// The Floor represents a single walkable surface within the base, and accompanying information about the modules that comprise it
import Module from "./module";
import Connector from "./connector";
import { constants } from "./constants";

export default class Floor {
    // Floor types:
    _id: number;                // Assigned as a serial number at the Floor's creation by the Infra class
    _leftSide: number;          // Grid location of the floor's left-most column
    _rightSide: number;         // Grid location of the floor's right-most column
    _elevation: number;         // Grid location of the floor's altitude, on the y-axis
    _modules: Module[];         // List of pointers to all the modules that form this floor
    _connectors: Connector[];   // List of all the connectors that intersect with this floor

    constructor(id: number, leftSide: number, rightSide: number, elevation: number) {
        this._id = id;
        this._leftSide = leftSide;
        this._rightSide = rightSide;
        this._elevation = elevation;
        this._modules = [];
        this._connectors = [];
    }
}