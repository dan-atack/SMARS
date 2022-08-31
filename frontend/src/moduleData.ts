// The ModuleData class handles all of the data processing for the module class, without any of the rendering tasks
import { ModuleInfo } from "./server_functions";
import { constants } from "./constants";
import { Resource } from "./economyData";

export default class ModuleData {
    // Module Data types
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
            }
        }
        else {
            // console.log(`Cannot find resource ${resource[0]} in module ${this._moduleInfo.name} ${this._id}`);
            return 0;
        }
    }
    
}