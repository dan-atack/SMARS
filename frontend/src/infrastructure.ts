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

    // runBuildingProduction(consumes, outputs, economy) {
    //     // Go through a building's outputs and add each one to the economy stockpile AND reduce stockpiles for resources consumed
    //     Object.keys(consumes).forEach((resource) => {
    //         economy[resource] -= consumes[resource];
    //     })
    //     Object.keys(outputs).forEach((resource) => {
    //         economy[resource] += outputs[resource];
    //     })
    // }

    // calculateBuildingConsumption(consumes, economy) {
    //     // Go though a buildings consumption list, and if all needs are met return object with success status
    //     const response = {
    //         success: true,
    //         shortages: []
    //     }
    //     const resources = Object.keys(consumes);
    //     // If there is a shortage, add the name of the missing resource to the shortages list
    //     resources.forEach((resource) => {
    //         if (economy[resource] < consumes[resource]) {
    //             response.shortages.push(resource);
    //         }
    //     })

    //     // If there are any shortages, set success status to false before returning the response object
    //     if (response.shortages.length > 0) {
    //         response.success = false;
    //     }

    //     return response;
    // }

    // Top level economic function loops thru buildings list and for each one carries out the production/consumption routines
    // handleProduction(economy) {
    //     // Advance production ticker if it is not on the max tick (which is the equivalent of the economy's "interval" value
    //     if (this.productionTicker < ECONOMY_TICK_INTERVAL) {
    //         this.productionTicker ++;
    //     } else {
    //         // Go through buildings list; for each building check its resource output fields AND resource consumption fields
    //         this.buildings.forEach((building) => {
    //             if (!building.productionToggled) {  // Only calculate buildings that aren't toggled
    //                 const consumes = building.consumes;
    //                 const outputs = building.outputs;
    //                 // Check if consumption needs can be met:
    //                 const response = this.calculateBuildingConsumption(consumes, economy);
    //                 if (response.success === true) {    // If so, run the production function to update the game's economy
    //                     this.runBuildingProduction(consumes, outputs, economy)
    //                     building.shortfalls = [];   // If the building was showing a shortfall before, clean it up
    //                 } else {
    //                     building.shortfalls = response.shortages;
    //                 }
    //             } 
    //         })
    //         this.productionTicker = 0;
    //     }        
    // }

    render(horizontalOffset: number) {
        this._horizontalOffset = horizontalOffset;
        // Only render one screen width's worth, taking horizontal offset into account:
        const leftEdge = Math.floor(this._horizontalOffset / constants.BLOCK_WIDTH);    // Edges are in terms of columns
        const rightEdge = (this._horizontalOffset + constants.WORLD_VIEW_WIDTH) / constants.BLOCK_WIDTH;
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
    }

    reset() {
        this._modules = [];
        this._connectors = [];
        this._justBuilt = null;
    }

}