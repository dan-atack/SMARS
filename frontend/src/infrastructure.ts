// The Infrastructure class is the disembodied list of your buildings, and can call building methods.
import P5 from "p5";
import Module from "./module";
import Connector from "./connector";
import { ConnectorInfo, ModuleInfo } from "./server_functions";
import { constants } from "./constants";
import p5 from "p5";

export default class Infrastructure {
    // Infrastructure class types:
    _p5: P5;
    _modules: Module[];
    _connectors: Connector[];
    _justBuilt: ModuleInfo | ConnectorInfo | null;
    _horizontalOffset: number;  // Value is in pixels
    // _missingResources: [];
    // _productionTick: number;

    constructor(p5: P5) {
        this._p5 = p5;
        this._modules = [];
        this._connectors = [];
        this._justBuilt = null; // When a building has just been added, set this to the building's data
        this._horizontalOffset = 0;
        // this._missingResources = []  // When a building fails the cost check, list the resources needed
        // this._productionTick = 0;
    }

    setup(center: number) {
        const x = center / constants.BLOCK_WIDTH;
    }

    addBuilding (x: number, y: number, data: ModuleInfo | ConnectorInfo) {
        if (this.isModule(data)) {
            console.log("module");
            this.addModule(x, y, data);
        } else {
            console.log("connector");
            this.addConnector(x, y, data);
        }
    }

    // Determines if the new building is a module or a connector:
    isModule (building: ModuleInfo | ConnectorInfo): building is ModuleInfo {
        return (building as ModuleInfo).pressurized !== undefined
    }

    addModule (x: number, y: number, moduleInfo: ModuleInfo) {
        console.log(moduleInfo.name);
        this._modules.push(new Module(this._p5, x, y, moduleInfo));
    }

    addConnector (x: number, y: number, connectorInfo: ConnectorInfo) {
        console.log(connectorInfo);
        this._connectors.push(new Connector(this._p5, x, y, connectorInfo));
    }

    // Mouse click handler to determine if a click event should be interpreted as a building placement request:
    // checkForClick(mouseX: number, mouseY: number, buildingData, economy) {
    //     // Only act on mouse click events if a building type has been selected:
    //     if (buildingData.name) {
    //         this.placeBuilding(mouseX, mouseY, buildingData, economy);
    //     }
    //     // Check for clicks on existing structures:
    //     this.buildings.forEach((building) => {
    //         building.checkForClick(mouseX, mouseY);
    //     })
    // }

    // Handles the whole building process, from pre-build checks (cost, obstruction) to payment and setting just built flag:
    // placeBuilding(x, y, buildingData, economy) {
    //     // Ensure building is within the map:
    //     if (x < WORLD_WIDTH * BLOCK_WIDTH && y < WORLD_HEIGHT * BLOCK_WIDTH) {
    //         // Round mouse position to nearest grid location:
    //         const gridX = Math.floor(mouseX / BLOCK_WIDTH) * BLOCK_WIDTH;
    //         const gridY = Math.floor(mouseY / BLOCK_WIDTH) * BLOCK_WIDTH;
    //         // Ensure there are sufficient resources to pay for building
    //         if (this.determineBuildingIsAffordable(economy, buildingData)) {
    //             // Ensure building site is not obstructed
    //             if (!this.checkForBuildingObstructions(gridX, gridY, buildingData)) {
    //                 const building = new Building(gridX, gridY, buildingData);
    //                 this.buildings.push(building);
    //                 this.payForBuilding(economy, buildingData.costs);
    //                 this.justBuilt = buildingData;
    //             } else {
    //                 console.log('Obstruction detected: building in the way');
    //             }
    //         } else {
    //             console.log('shortage reported'); // TODO: Add in-game visual display of missing resources list
    //         }
    //     } else {
    //         console.log('out of bounds'); // TODO: Add in-game visual display of this message
    //     }
    // }

    // Takes the economy object plus the prospective new building's data to establish if you have enough of all required resources:
    // determineBuildingIsAffordable(economy, buildingData) {
    //     const affordable = true;
    //     const shortages = []; // Keep track of any shortages - if you have insufficient of a resource it will be noted.
    //     const costs = Object.keys(buildingData.costs);    // Get the names of the resources you will need
    //     costs.forEach((resource) => {
    //         if (economy[resource] < buildingData.costs[resource]) {
    //             shortages.push(resource);   // If you have less of a resource than is needed, record the name of the resource
    //         }
    //     })
    //     if (shortages.length > 0) {
    //         this.missingResources = shortages;   // If there are shortages, keep track of their names
    //     } else {
    //         return affordable;  // Otherwise return true, meaning green-light the building
    //     }
    // }

    // WORK IN PROGRESS: NEEDS THE BUILDING OBJECT FIRST
    // Looks through the list of existing buildings to ensure no overlap will occur upon placement of new structure:
    // checkForBuildingObstructions(x:number, y:number, buildingData: ModuleInfo | ConnectorInfo) {
    //     let obstruction = false;
    //     this._buildings.forEach((building) => {
    //         // Find x and y start and end points for existing structure (for now assume all buildings are rectangles)
    //         const xRange = [building.x, building.x + building.width];
    //         // Since Y values are 'upside down', the 'roof' of the structure is its y value, and its 'floor' is y - height. Intuitive!
    //         const yRange = [building.y + building.height, building.y];
    //         const right = x + buildingData.width * BLOCK_WIDTH;
    //         const bottom = y + buildingData.height * BLOCK_WIDTH;
    //         const leftInRange = x >= xRange[0] && x < xRange[1];
    //         const topInRange = y < yRange[0] && y >= yRange[1];
    //         const rightInRange = right > xRange[0] && right < xRange[1];
    //         const bottomInRange = bottom > yRange[1] && bottom < yRange[0];
    //         // console.log(y);
    //         // console.log(yRange);
    //         // console.log(leftInRange);
    //         // console.log(topInRange);
    //         // console.log(rightInRange);
    //         // console.log(bottomInRange);
    //         // Obstruction is true if: x is in range AND (y OR y + height) is also in range
    //         // Set obstruction to true if any part of new building's proposed location overlaps existing structure
    //         if (leftInRange && (topInRange || bottomInRange)) obstruction = true;
    //         // console.log(obstruction);
    //         if (topInRange && (leftInRange || rightInRange)) obstruction = true;
    //         // console.log(obstruction);
    //         if (rightInRange && (topInRange || bottomInRange)) obstruction = true;
    //         // console.log(obstruction);
    //         if (bottomInRange && (leftInRange || rightInRange)) obstruction = true;
    //         console.log(obstruction);
    //     })
    //     return obstruction;
    // }

    // For the payment, economy is the economy object and costs is a the building's costs dictionary object:
    // payForBuilding(economy, costs) {
    //     const resources = Object.keys(costs);
    //     resources.forEach((resource) => {
    //         economy.addResource(resource, -costs[resource]);
    //     })
    // }

    // Unset missing resources and just built flags:
    resetFlags() {
        this._justBuilt = null;
    }

    render(horizontalOffset: number) {
        const p5 = this._p5
        this._horizontalOffset = horizontalOffset;
        // Only render one screen width's worth, taking horizontal offset into account:
        const leftEdge = Math.floor(this._horizontalOffset / constants.BLOCK_WIDTH);    // Edges are in terms of columns
        const rightEdge = Math.floor(this._horizontalOffset + constants.WORLD_VIEW_WIDTH) / constants.BLOCK_WIDTH;
        this._modules.forEach((module) => {
            if (module._x >= leftEdge && module._x < rightEdge) {
                module.render(this._horizontalOffset);
            }
        });
        this._connectors.forEach((connector) => {
            if (connector._x >= leftEdge && connector._y < rightEdge) {
                connector.render(this._horizontalOffset);
            }
        })
        p5.text(this._modules.length, 100, 100);
        p5.text(`Left edge: ${leftEdge}`, 300, 100);
        p5.text(`Right edge: ${rightEdge}`, 300, 200);
        this._modules.forEach((module, idx) => {
            p5.text(`${module._x}, ${module._y}`, 100, 120 + idx * 20);
        })

    }

    reset() {
        this._modules = [];
        this._connectors = [];
        this._justBuilt = null;
    }

}