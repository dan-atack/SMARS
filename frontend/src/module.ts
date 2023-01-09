// The Module class represents the basic building block of the colony; roughly speaking, one room or compartment
import P5 from "p5";
import { Resource } from "./economyData";
import { ModuleInfo } from "./server_functions";
import { constants } from "./constants";

export type ResourceRequest = {
    modId: number,
    resource: Resource
}

export default class Module {
    // Module types:
    _id: number;            // A unique serial number assigned by the Infra class at the object's creation
    _x: number;     // Buildings' x and y positions will be in terms of GRID LOCATIONS to act as fixed reference points
    _y: number;
    _moduleInfo: ModuleInfo;
    _resourceSharing: boolean;  // Yes or no policy, for whether to grant the resource requests of other modules
    _resourceAcquiring: number; // 0 to 1, representing how much of the max capacity of each resource the module tries to maintain
    _resources : Resource[];    // Represents the current tallies of each type of resource stored in this module
    _isMaintained: boolean;     // Represents whether or not the module's maintenance needs are being
    _crewPresent: number[];     // If the module has a crew capacity, keep track of which colonists are currently inside
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
        // Determine resource sharing policies via module type data
        switch (this._moduleInfo.type) {
            case "Life Support":  // Life support does not share and tries to always be full (it is the end of the production line)
                this._resourceSharing = false;
                this._resourceAcquiring = 1;
                break;
            case "Storage":     // Storage wants to share and does not try to top itself up
                this._resourceSharing = true;
                this._resourceAcquiring = 0;
                break;
            case "Production":  // Production is willing to share its output and tries to keep a good supply of input resources
                this._resourceSharing = false;  // Production modules will have a rule so that they share their output resource/s
                this._resourceAcquiring = 0.5;  // Similarly, they will have another rule to only try to acquire input resource/s
                break;
            case "Power":
                this._resourceSharing = true;
                this._resourceAcquiring = 0;
                break;
            default:            // All other modules are instructed to try to fill up to 50%, and not share
                this._resourceSharing = false;
                this._resourceAcquiring = 0.5;
        }
        this._resources = [];
        this._isMaintained = true;  // By default every module's needs are assumed to have been met
        this._crewPresent = [];
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

    // SECTION 1: RESOURCE INFO GETTERS

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

    // Takes a resource name and returns the amount of space available, if any, for adding more of that resource
    getResourceCapacityAvailable = (resource: string) => {
        const capacity = this._moduleInfo.storageCapacity.find((r) => r[0] === resource);
        const res = this._resources.find((r) => r[0] === resource);
        if (capacity && res) {
            return capacity[1] - res[1];
        } else {
            return 0;   // If the capacity does not exist or the resource is not found, return a 0
        }
    }

    // Called by the Industry class to determine if a module can produce (convert inputs to outputs) right now
    hasProductionInputs () {
        let provisioned = true;
        // Check each input resource against the current quantity; if any resource is lacking, return false
        this._moduleInfo.productionInputs?.forEach((res) => {
            if (this.getResourceQuantity(res[0]) < res[1]) provisioned = false;
        });
        return provisioned;
    }

    // Called by the Inspect Display to quickly verify which resources are needed for maintenance (includes oxygen if pressurized)
    getMaintenanceResourceNames = () => {
        let needs: string[] = [];
        this._moduleInfo.maintenanceCosts.forEach((res) => {
            needs.push(res[0]);
        });
        if (this._moduleInfo.pressurized) needs.push("oxygen");
        return needs;
    }

    // SECTION 2: RESOURCE SHIPPING/RECEIVING METHODS

    // Called by the Infra class every hour, returns a list of the resource requests for this Module
    determineResourceRequests () {
        const reqs: ResourceRequest[] = [];
        // Determine whether to make requests based on resource getter policy value (And whether there is any storage capacity)
        if (this._resourceAcquiring > 0 && this._resources.length > 0) {
            this._moduleInfo.storageCapacity.forEach((res) => {
                const par = Math.ceil(this._resourceAcquiring * res[1]);    // Par = 'acquiring' fraction times max capacity
                let current = this.getResourceQuantity(res[0]);
                // Override 'current' value for production modules' output resources (set to equal the par to cancel the order)
                if (this._moduleInfo.productionOutputs) {
                    this._moduleInfo.productionOutputs.forEach((r) => {
                        if (res[0] === r[0]) current = par;
                    })
                }
                if (par > current) {
                    reqs.push({
                        modId: this._id, 
                        resource: [res[0], par - current]
                    })
                }
            })
        }
        return reqs;
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
                    console.log(`Warning: Was only able to add ${spaceAvail} ${resource[0]} to module ${this._id}.`);
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

    // SECTION 3: MAINTENANCE METHODS

    // Top-level maintenance method: determines maintenance status by calling the oxygen and general maintenance methods every hour
    handleMaintenance = () => {
        const hasResources = this.handleResourceUse();
        const noAirShortage = this.handleOxygenLeakage();  // Negative variable name: no shortage means maintenance check passes
        if (hasResources && noAirShortage) {
            this._isMaintained = true;
        } else {
            console.log(`Module ${this._id} failed maintenance check due to missing resources.`);
            this._isMaintained = false;
        }
    }

    // Handles general resource-consumption due to module maintenance costs
    handleResourceUse = () => {
        let maintained = true;      // Any failures below will set this to false - and modules with no needs will always be true
        this._moduleInfo.maintenanceCosts.forEach((resource) => {
            const needed = resource[1];
            const used = this.deductResource(resource);     // Get the amount that was used
            if (needed > used) maintained = false;          // If need exceeds amount used, there is a shortage
        })
        return maintained;
    }

    // Handles oxygen leakage (for pressurized modules only)
    handleOxygenLeakage = () => {
        const leakage = this._width * this._height;         // The bigger the volume, the greater the leakage!
        if (this._moduleInfo.pressurized) {
            this.deductResource(["oxygen", leakage]);
            if (this.getResourceQuantity("oxygen") <= 0) {
                return false;   // If there is no oxygen left, the module is depressurized
            } else {
                return true;    // If there is at least some oxygen left, the module is pressurized
            }
        } else {
            return true;        // If the module is not pressurized, the module has no oxygen to leak
        }
    }

    // SECTION 4: WORK-RELATED METHODS (FOR PRODUCTION MODULES ONLY)

    // Allows a Colonist to enter the module if it isn't already at max capacity, and it is maintained
    punchIn = (colonistId: number) => {
        if (this._isMaintained && this._crewPresent.length < this._moduleInfo.crewCapacity) {
            this._crewPresent.push(colonistId);
            return true;    // Let the Colonist know if their punch-in attempt has succeeded
        } else {
            return false;   // Let the Colonist know if their punch-in attempt has failed
        }
    }

    punchOut = (colonistId: number) => {
        this._crewPresent = this._crewPresent.filter((id) => id !== colonistId);
    }

    // For Production class modules only
    produce = () => {
        // Reduce quantities of each input resource
        let shortages = false;
        this._moduleInfo.productionInputs?.forEach((resource) => {
            const used = this.deductResource(resource);
            if (used !== resource[1]) shortages = true;
        });
        // If all inputs were present, increase quantity of each output resource
        if (!(shortages)) {
            this._moduleInfo.productionOutputs?.forEach((resource) => {
                this.addResource(resource);
            })
        }
    }

    // For Power class modules only (sunlight percent is value from 0 to 100; used for solar panels only)
    generatePower = (sunlightPercent?: number) => {
        // For solar panels (stipulate that sunlight must be defined, but allow falsy value 0)
        if (sunlightPercent !== undefined && this._moduleInfo.productionOutputs) {
            // Assume that power modules can only produce power, and get their first (and only) output resource
            const generated = Math.ceil(this._moduleInfo.productionOutputs[0][1] * sunlightPercent / 100);
            this.addResource(["power", generated]);
            return generated;   // Return the amount of power that was produced
        } else if (this._moduleInfo.productionInputs && this._moduleInfo.productionOutputs) {
            // For nuclear reactors / anything that consumes fuel
            let shortages = false;
            this._moduleInfo.productionInputs.forEach((resource) => {
                const used = this.deductResource(resource);
                if (used !== resource[1]) shortages = true;
            });
            if (!(shortages)) {
                this.addResource(["power", this._moduleInfo.productionOutputs[0][1]]);
                return this._moduleInfo.productionOutputs[0][1] // Return the amount of power that was produced
            } else {
                console.log(`Module ${this._id} cannot produce power due to supply shortage.`);
                return 0;
            }
        } else {
            console.log(`Error: Module ${this._id} cannot generate power!`);
            return null;    // If no power is produced due to an error, return a null
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
        // If the module falls into 'unmaintained' status, render a shadow over it
        if (!this._isMaintained) {
            p5.fill(0, 0, 200, 100);
            p5.rect(x, y, w, h);
        }
    }

}