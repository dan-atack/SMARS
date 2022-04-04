// The Infrastructure class is the disembodied list of your buildings, and can call building methods.
import P5 from "p5";
import Module from "./module";
import Connector from "./connector";
import { ConnectorInfo, ModuleInfo } from "./server_functions";
import { constants } from "./constants";

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

    addBuilding (x: number, y: number, data: ModuleInfo | ConnectorInfo, terrain: number[][]) {
        if (this.isModule(data)) {
            console.log("module");
            this.addModule(x, y, data, terrain);
        } else {
            console.log("connector");
            this.addConnector(x, y, data);
        }
    }

    // Determines if the new building is a module or a connector:
    isModule (building: ModuleInfo | ConnectorInfo): building is ModuleInfo {
        return (building as ModuleInfo).pressurized !== undefined
    }

    addModule (x: number, y: number, moduleInfo: ModuleInfo, terrain: number[][]) {
        console.log(moduleInfo.name);
        const moduleArea = this.calculateModuleArea(moduleInfo, x, y);
        const modClear = this.checkOtherModulesForObstructions(moduleArea);
        const mapClear = this.checkTerrainForObstructions(moduleArea, terrain); // If clear is true, the building can be placed
        if (mapClear === true && modClear === true) {
            this._modules.push(new Module(this._p5, x, y, moduleInfo));
        } else {
            console.log(modClear);
            console.log(mapClear); // If clear is not equal to true it is a list of the terrain tiles that are in the way
        }
        
    }

    addConnector (x: number, y: number, connectorInfo: ConnectorInfo) {
        console.log(connectorInfo.name);
        this._connectors.push(new Connector(this._p5, x, y, connectorInfo));
    }

    // Takes in data for a new module and grid coordinates for its location, returns a list of the grid locations it will occupy
    calculateModuleArea (moduleInfo: ModuleInfo, mouseX: number, mouseY: number) {
        const w = moduleInfo.width;
        const h = moduleInfo.height;
        let coords: {x: number, y: number}[] = [];
        for (let i = 0; i < w; i++) {
            for (let k = 0; k < h; k++)  {
                coords.push({x: i + mouseX, y: k + mouseY});
            }
        }
        return coords;
    }

    // Takes in data for a new module's location and the game's terrain data and looks for any overlaps
    checkTerrainForObstructions (moduleArea: {x: number, y: number}[], terrain: number[][], ) {
        let clear = true;               // Set to false if there is any overlap between the map and the proposed new module
        let collisions: number[][] = [];  // Keep track of the coordinates of any collisions (obstructions) that are detected
        const rightEdge = moduleArea[0].x;  // Get x coordinates of the right and left edges of the module
        const leftEdge = moduleArea[moduleArea.length - 1].x;
        // Check only the map columns that match the module area's x coordinates:
        const cols: number[][] = [];
        for (let i = 0; i < terrain.length; i++) {
            if (i >= rightEdge && i <= leftEdge) {
                cols.push(terrain[i]);
            }
        }
        cols.forEach((column, idx) => {
            moduleArea.forEach((coordPair) => {
                // Match each module column with each terrain column
                if (coordPair.x === rightEdge + idx) {
                    // Invert y value from the mouse click
                    const y = constants.SCREEN_HEIGHT / constants.BLOCK_WIDTH - coordPair.y - 1;
                    column.forEach((block, jdx) => {
                        if (block && jdx === y) {
                            collisions.push([rightEdge + idx, coordPair.y])
                            clear = false;
                        }
                    })
                }
            })
        })
        // If there is no obstruction we get a 'true' here; otherwise return the coordinates that overlap.
        if (clear) {
            return true;
        } else {
            return collisions;
        }
    }

    //  Takes in data for a new module's location and compares it to all of the other existing modules to look for overlaps
    checkOtherModulesForObstructions (moduleArea: {x: number, y: number}[]) {
        let clear = true;               // Set to false if there is any overlap between the map and the proposed new module
        let collisions: number[][] = [];
        this._modules.forEach((mod) => {
            // TODO: Improve efficiency by only checking modules with the same X coordinates?
            const modArea = this.calculateModuleArea(mod._moduleInfo, mod._x, mod._y);
            modArea.forEach((coordPair) => {
                moduleArea.forEach((coords) => {
                    if (coordPair.x === coords.x && coordPair.y === coords.y) {
                        clear = false;
                        collisions.push([coordPair.x, coordPair.y]);
                    }
                })
            })
        })
        // If there is no obstruction we get a 'true' here; otherwise return the coordinates that overlap.
        if (clear) {
            return true;
        } else {
            return collisions;
        }
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
            if (module._x + module._width >= leftEdge && module._x < rightEdge) {
                module.render(this._horizontalOffset);
                module._isRendered = true;
            } else {
                module._isRendered = false;
            }
        });
        this._connectors.forEach((connector) => {
            if (connector._x >= leftEdge && connector._y < rightEdge) {
                connector.render(this._horizontalOffset);
            }
        });
    }

    reset() {
        this._modules = [];
        this._connectors = [];
        this._justBuilt = null;
    }

}