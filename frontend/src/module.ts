// The Module class represents the basic building block of the colony; roughly speaking, one room or compartment
import P5 from "p5";
import { Resource } from "./economyData";
import { ModuleInfo } from "./server_functions";
import { constants } from "./constants";

export default class Module {
    // Module types:
    _id: number;            // A unique serial number assigned by the Infra class at the object's creation
    _x: number;     // Buildings' x and y positions will be in terms of GRID LOCATIONS to act as fixed reference points
    _y: number;
    _moduleInfo: ModuleInfo;
    _resources : Resource[];    // Represents the current tallies of each type of resource stored in this module
    _width: number;             // Width and height are in terms of blocks (grid spaces), not pixels
    _height: number;
    _xOffset: number;           // The offset value will be in terms of PIXELS, to allow for smoother scrolling
    _yOffset: number;
    _color: string;
    _isRendered: boolean;

    constructor(id: number, x: number, y: number, moduleInfo: ModuleInfo) {
        this._id = id;
        this._x = x;
        this._y = y;
        this._moduleInfo = moduleInfo;
        this._resources = [];                       
        this._moduleInfo.storageCapacity.forEach((res) => {
            const r: Resource = [ res[0], 0 ];
            this._resources.push(r); // Add resource capacity
        })
        this._width = this._moduleInfo.width;       // Width and height are in terms of grid spaces, not pixels!
        this._height = this._moduleInfo.height;
        this._xOffset = 0;
        this._yOffset = 0;
        // Determined by matching block type to entry in the blocktionary:
        this._color = constants.ALMOST_BLACK    // Default value for now; in the future modules will be of no specific color
        this._isRendered = false;
    }

    // Pseudo-property to quickly get just the names of the resources in this module's capacity
    _resourceCapacity () {
        let r: string[] = [];
        this._moduleInfo.storageCapacity.forEach((res) => r.push(res[0]));
        return r;
    }

    // Takes a resource name and returns the quantity, if any, of that resource if it is present in the module
    getResourceQuantity (resource: string) {
        let qty = 0;
        this._resources.forEach((res) => {
            if (res[0] === resource) {
                qty = res[1];
            }
        })
        return qty;
    }

    // Try to add a resource and return the quantity actually added
    addResource (resource: Resource) {
        // Check if resource is in the module's capacity list
        if (this._resourceCapacity().includes(resource[0])) {
            // Check how much capacity remains for that resource
            const r = this._resources.find(res => res[0] === resource[0]);
            const max = this._moduleInfo.storageCapacity.find(res => res[0] === resource[0]);
            if (r !== undefined && max !== undefined) {
                const currentQty = r[1];
                const capacity = max[1];
                const spaceAvail = capacity - currentQty;
                const toBeAdded = resource[1];
                if (spaceAvail >= toBeAdded) {  // If there is more space available than resource to add, add the full amount
                    // @ts-ignore
                    this._resources.find(res => res[0] === resource[0])[1] += toBeAdded;
                    return toBeAdded;       // Return the amount added
                } else {           // If capacity does not match amount to be added, set to max capacity and return the difference
                    // @ts-ignore
                    this._resources.find(res => res[0] === resource[0])[1] = capacity;
                    return spaceAvail;  // Return the amount added (in this case, the total amount of space available)
                }
            }
        } else {
            // console.log(`Cannot add resource ${resource[0]} to module ${this._moduleInfo.name} ${this._id}`);
            return 0;   // Always return the quantity added
        }
    }

    // Try to remove a resource, and return the quantity that is actually removed
    deductResource (resource: Resource) {
        if (this._resourceCapacity().includes(resource[0])) {
            const r = this._resources.find(res => res[0] === resource[0]);
            if (r !== undefined) {
                const currentQty = r[1];
                const needed = resource[1];
                if (currentQty >= needed) {     // If enough resource is available, return the entire amount requested
                    // @ts-ignore
                    this._resources.find(res => res[0] === resource[0])[1] -= needed;
                    return needed;
                } else {                    // Otherwise return all that's left instead (set qty to zero)
                    // @ts-ignore
                    this._resources.find(res => res[0] === resource[0])[1] = 0;
                    return currentQty;
                }
            } else {
                return 0;
            }
        }
        else {
            // console.log(`Cannot find resource ${resource[0]} in module ${this._moduleInfo.name} ${this._id}`);
            return 0;
        }
    }

    render = (p5: P5, xOffset: number) => {    // TODO: Block gets y offset values as arguments to renderer
        this._xOffset = xOffset;    // Offset is in terms of pixels
        // HERE IS WHERE X AND Y COORDINATES AND WIDTH AND HEIGHT ARE CONVERTED TO PIXEL VALUES:
        const x = this._x * constants.BLOCK_WIDTH - this._xOffset;
        const y = this._y * constants.BLOCK_WIDTH - this._yOffset;
        const w = this._width * constants.BLOCK_WIDTH;
        const h = this._height * constants.BLOCK_WIDTH;
        p5.fill(this._color);
        p5.strokeWeight(2);
        p5.stroke(constants.ALMOST_BLACK);
        if (this._moduleInfo.shapes != undefined) {
            this._moduleInfo.shapes.forEach((shape) => {
                const p = shape.params;
                const b = constants.BLOCK_WIDTH;
                p5.fill(shape.color);
                switch (shape.shape) {
                    case "triangle":
                        p5.triangle(p[0] * b + x, p[1] * b + y, p[2] * b + x, p[3] * b + y, p[4] * b + x, p[5] * b + y);
                        break;
                    case "rect":
                        if (shape.params.length === 4) {
                            p5.rect(p[0] * b + x, p[1] * b + y, p[2] * b, p[3] * b);
                        } else {
                            p5.rect(p[0] * b + x, p[1] * b + y, p[2] * b, p[3] * b, p[4] * b, p[5] * b, p[6] * b, p[7] * b);    // Rounded corners
                        }
                        break;
                    case "quad":
                        p5.quad(p[0] * b + x, p[1] * b + y, p[2] * b + x, p[3] * b + y, p[4] * b + x, p[5] * b + y, p[6] * b + x, p[7] * b + y);
                        break;
                    case "ellipse":
                        p5.ellipse(p[0] * b + x, p[1] * b + y, p[2] * b, p[3] ? p[3] * b : p[2] * b);
                        break;
                    case "arc":
                        let mode: any;
                        if (shape.mode === "OPEN") {
                            mode = p5.OPEN;
                        } else if (shape.mode === "PIE") {
                            mode = p5.PIE;
                        } else if (shape.mode = "CHORD") {
                            mode = p5.CHORD;
                        }
                        p5.arc(p[0] * b + x, p[1] * b + y, p[2] * b, p[3] * b, p[4], p[5], mode);
                        break;
                }
            })
        } else {
            p5.rect(x, y, w, h);    // If no image is provided, render a black box:
        }
    }

}