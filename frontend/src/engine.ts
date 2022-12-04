// Top-level component for the game environment (as opposed to game interface, which is in game.ts)
import P5 from "p5";
// Components
import View from "./view";
import Sidebar from "./sidebar";
import Map from "./map";
import Infrastructure from "./infrastructure";
import Industry from "./industry";
import Economy from "./economy";
import Population from "./population";
import Modal, { EventData } from "./modal";
import Lander from "./lander";
import MouseShadow from "./mouseShadow";
// Component shapes for Inspect Tool
import Block from "./block";
import Colonist from "./colonist";
import Connector from "./connector";
import Module from "./module";
// Helper/server functions
import { ModuleInfo, ConnectorInfo, getOneModule, getOneConnector } from "./server_functions";
import { constants, modalData } from "./constants";
// Types
import { ConnectorSaveInfo, ModuleSaveInfo, SaveInfo, GameTime } from "./saveGame";
import { GameData } from "./newGameSetup";
import { Coords } from "./connector";
import { Resource } from "./economyData";

// TODO: Load Environment variables
if (process.env.ENVIRONMENT) console.log(process.env.ENVIRONMENT);

export default class Engine extends View {
    // Engine types
    _p5: P5;                    // Although the View class no longer uses it in the constructor, the Engine still does
    _sidebar: Sidebar;
    _sidebarExtended: boolean;
    _gameData: GameData | null  // Data object for a new game
    _saveInfo: SaveInfo | null  // Data object for a saved game
    _map: Map;
    _infrastructure: Infrastructure;
    _industry: Industry;
    _economy: Economy;
    _population: Population;
    _modal: Modal | null;
    _animation: Lander | null;  // This field holds the current entity being used to control animations, if there is one
    _mouseShadow: MouseShadow | null;   // This field will hold a mouse shadow entity if a building is being placed
    // Map scrolling control
    _horizontalOffset: number;  // This will be used to offset all elements in the game's world, starting with the map
    _scrollDistance: number;    // Pixels from the edge of the world area in which scrolling occurs
    _scrollingLeft: boolean;    // Flags for whether the user is currently engaged in scrolling one way or the other
    _scrollingRight: boolean;
    _mouseInScrollRange: number // Counts how long the mouse has been within scroll range of the edge
    _scrollThreshold: number    // Determines the number of frames that must elapse before scrolling begins
    _fastScrollThreshold: number    // How many frames before fast scrolling occurs
    // Mouse click control
    mouseContext: string;       // Mouse context tells the Engine's click handler what to do when the mouse is pressed.
    selectedBuilding: ModuleInfo | ConnectorInfo | null;    // Data storage for when the user is about to place a new structure
    selectedBuildingCategory: string    // String name of the selected building category (if any)
    inspecting: Colonist | Connector | Module | Block | null;   // Pointer to the current item being inspected, if any
    // In-game time control
    gameOn: boolean;            // If the game is on then the time ticker advances; if not it doesn't
    _tick: number;              // Updated every frame; keeps track of when to advance the game's clock
    _waitTime: number;          // Counts down to an unpause action if the game needs to wait for an event or animation to finish
    _gameTime: GameTime;            // The Game's time can now be stored as a GameTime-type object.
    ticksPerMinute: number;
    _minutesPerHour: number;
    _hoursPerClockCycle: number;    // One day = two trips around the clock
    _solsPerYear: number;
    // In-game flag for when the player has chosen their landing site, and grid location of landing site's left edge and altitude
    _hasLanded: boolean;
    _landingSiteCoords: [number, number];
    _provisioned: boolean;          // Flag to know when to stop trying to fill up the initial structures with resources
    switchScreen: (switchTo: string) => void;   // App-level SCREEN switcher (passed down via drill from the app)
    updateEarthData: () => void;    // Updater for the date on Earth (for starters)
    getModuleInfo: (setter: (selectedBuilding: ModuleInfo, locations: number[][], ids?: number[], resources?: Resource[][]) => void, category: string, type: string, name: string, locations: number[][], ids?: number[], resources?: Resource[][], crews?: number[][]) => void;        // Getter function for loading individual structure data from the backend
    getConnectorInfo: (setter: (selectedConnector: ConnectorInfo, locations: {start: Coords, stop: Coords}[][], ids?: number[]) => void, category: string, type: string, name: string, locations: {start: Coords, stop: Coords}[][], ids?: number[]) => void;

    constructor(p5: P5, switchScreen: (switchTo: string) => void, changeView: (newView: string) => void, updateEarthData: () => void) {
        super(changeView);
        this._p5 = p5;
        this.switchScreen = switchScreen;
        this.updateEarthData = updateEarthData;
        this.getModuleInfo = getOneModule;
        this.getConnectorInfo = getOneConnector;
        this._sidebar = new Sidebar(p5, this.switchScreen, this.changeView, this.setMouseContext, this.setGameSpeed);
        this._sidebarExtended = true;   // Side bar can be partially hidden to expand map view - should this be here or in the SB itself??
        this._gameData = null;
        this._saveInfo = null;  // Saved game info is loaded from the Game module when it calls the setupSavedGame method
        this._map = new Map();
        this._infrastructure = new Infrastructure();
        this._industry = new Industry();
        this._economy = new Economy(p5);
        this._population = new Population();
        this._modal = null;
        this._animation = null;
        this._mouseShadow = null;
        this._horizontalOffset = 0;
        this._scrollDistance = 50;
        this._scrollingLeft = false;
        this._scrollingRight = false;
        this._mouseInScrollRange = 0;   // Counts how many frames have passed with the mouse within scroll distance of the edge
        this._scrollThreshold = 10;     // Controls the number of frames that must pass before the map starts to scroll
        this._fastScrollThreshold = 60; // Number of frames to pass before fast scroll begins
        this.mouseContext = "inspect"    // Default mouse context allows user to select ('inspect') whatever they click on
        this.selectedBuilding = null;   // There is no building info selected by default.
        this.selectedBuildingCategory = "";  // Keep track of whether the selected building is a module or connector
        this.inspecting = null;         // Keep track of selected item; default is null
        // Time-keeping:
        // TODO: Make the clock its own component, to de-clutter the Engine.
        this.gameOn = true;             // By default the game is on when the Engine starts
        this._tick = 0;
        this._waitTime = 0;             // By default there is no wait time
        this._gameTime = {
            minute: 0,
            hour: 12,
            cycle: "AM",
            sol: 1,
            year: 0
        };                              // New take on the old way of storing the game's time
        this.ticksPerMinute = 20        // Medium "fast" speed is set as the default
        this._minutesPerHour = 60;      // Minutes go from 0 - 59, so this should really be called max minutes
        this._hoursPerClockCycle = 12;
        this._solsPerYear = 4;
        this._hasLanded = false;            // At the Engine's creation, the player is presumed not to have landed yet
        this._landingSiteCoords = [-1, -1]; // Default value of -1, -1 indicates landing site has not yet been selected
        this._provisioned = false;          // Stays negative until all basic modules have been loaded with starting resources
    }

    //// SETUP METHODS ////

    setup = () => {
        this.currentView = true;
        this._sidebar.setup();
        this.selectedBuilding = null;
        this._sidebar._detailsArea._minimap.updateTerrain(this._map._mapData);
        // Sidebar minimap display - does it only need it during 'setup' or does it also need occasional updates?
    }

    setupNewGame = (gameData: GameData) => {
        this._gameData = gameData;  // gameData object only needs to be set for new games
        this._map.setup(this._gameData.mapTerrain);
        this._economy._data.addMoney(this._gameData.startingResources[0][1]);
        this._horizontalOffset = this._map._maxOffset / 2;   // Put player in the middle of the map to start out
        this._infrastructure.setup(this._map._mapData.length);
        this.createNewGameModal();
    }

    setupSavedGame = (saveInfo: SaveInfo) => {
        this._saveInfo = saveInfo;
        this.setClock(saveInfo.game_time);
        this._map.setup(this._saveInfo.terrain);
        // TODO: Extract the map expansion/sidebar pop-up (and the reverse) into a separate method
        this._map.setExpanded(false);   // Map starts in 'expanded' mode by default, so it must tell it the sidebar is open
        this._economy._data.addMoney(saveInfo.resources[0][1]); // Reload money from save data
        // TODO: Update the economy's load sequence to re-load rate-of-change data instead of resource quantities
        // DON'T DO IT HERE THOUGH - Do it at the end of the loadModuleFromSave method (2 down from this one)
        this._economy._data.setResourceChangeRates();           // Reset money rate-of-change indicator
        this._horizontalOffset = this._map._maxOffset / 2;
        this._infrastructure.setup(this._map._mapData.length);
        this._population.loadColonistData(saveInfo.colonists);
        this.loadModulesFromSave(saveInfo.modules);
        this.loadConnectorsFromSave(saveInfo.connectors);
        this._hasLanded = true;     // Landing sequence has to take place before saving is possible
        this._provisioned = true;   // Ditto for initial structure provisioning. If you're here already, God help ya.
        this._sidebar.setDate(this._gameTime.sol, this._gameTime.year);   // Update sidebar date display to saved date
        this.createLoadGameModal(saveInfo.username);
    }

    // Top-level saved module importer
    loadModulesFromSave = (modules: ModuleSaveInfo[]) => {
        // Only operate if there actually are modules to load:
        if (modules.length > 0) {
            // Sort the list by name to avoid over-calling the backend to get module data
            modules.sort(function(a, b){
                if (a.name < b.name) { return -1; }
                if (a.name > b.name) { return 1; }
                return 0;
            })
            // Separate modules by name
            let modTypes: string[] = [];
            modules.forEach((mod) => {
                if (!modTypes.includes(mod.name)) {
                    modTypes.push(mod.name)
                }
            });
            // For each type of module, get all coordinates, serials, etc for all instances of that module, then re-populate them
            modTypes.forEach((mT) => {
                const mods = modules.filter((mod) => mod.name === mT);
                const modType = mods[0].type != undefined ? mods[0].type : "test";
                const coords: number[][] = [];      // List of every module's coordinates
                const serials: number[] = [];
                const resources: Resource[][] = [];
                const crews: number[][] = [];         // List of IDs of colonists present in each module 
                mods.forEach((mod) => {
                    coords.push([mod.x, mod.y]);
                    serials.push(mod.id);   // Get ID in separate list, to be used alongside the coordinates
                    resources.push(mod.resources);  // Ditto resource data
                    crews.push(mod.crewPresent);
                })
                this.getModuleInfo(this.loadModuleFromSave, "modules", modType, mT, coords, serials, resources, crews);
            })
        }  
    }

    // Called by the above method, this will actually use the data from the backend to re-create loaded modules
    loadModuleFromSave = (selectedBuilding: ModuleInfo, locations: number[][], ids?: number[], resources?: Resource[][], crews?: number[][]) => {
        if (selectedBuilding != null) {
            locations.forEach((space, idx) => {
                if (ids && resources && crews) {    // For newest saves
                    this._infrastructure.addModule(space[0], space[1], selectedBuilding, this._map._topography, this._map._zones, ids[idx]); // Create module with ID
                    resources[idx].forEach((resource) => {
                        this._infrastructure.addResourcesToModule(ids[idx], resource);  // Provision with saved resources
                    })
                    const mod = this._infrastructure.getModuleFromID(ids[idx]);
                    if (mod) {
                        mod._crewPresent = crews[idx] || [];  // Re-add crew roster
                    }
                } else if (ids && resources) {     // For saves without module crew data
                    this._infrastructure.addModule(space[0], space[1], selectedBuilding, this._map._topography, this._map._zones, ids[idx]); // Create module with ID
                    resources[idx].forEach((resource) => {
                        this._infrastructure.addResourcesToModule(ids[idx], resource);  // Provision with saved resources
                    })
                } else {                            // For ancient saves (no crew OR resource data)
                    this._infrastructure.addModule(space[0], space[1], selectedBuilding, this._map._topography, this._map._zones,);
                }
            })
        }
        this.updateEconomyDisplay();    // Update economy display after each module is loaded
        this._economy._data.setResourceChangeRates();
    }

    // Top-level saved module importer
    loadConnectorsFromSave = (connectors: ConnectorSaveInfo[]) => {
        // Only operate if there actually are connectors to load:
        if (connectors.length > 0) {
            // Sort the list by name to avoid over-calling the backend to get connector data
            connectors.sort(function(a, b){
                if (a.name < b.name) { return -1; }
                if (a.name > b.name) { return 1; }
                return 0;
            })
            // Separate connectors by name
            let conTypes: string[] = [];
            connectors.forEach((con) => {
                if (!con.segments) {
                    console.log("Deprecated Warning: A Connector with no 'segments' data has been loaded. Ignoring the affected elements.");
                }
                // Only include connectors that have the segments property
                if ((!conTypes.includes(con.name)) && (con.segments != undefined)) {
                    conTypes.push(con.name)
                }
            });
            // For each name (type) of connector, get all the segment data for the instances of that type, and create them
            conTypes.forEach((cT) => {
                const cons = connectors.filter((con) => con.name === cT);
                const conType = cons[0].type != undefined ? cons[0].type : "test";
                // Each set of 'coords' in this list is an array containing a single object with start/stop coordinates
                let coords: {start: Coords, stop: Coords}[][] = [];
                let serials: number[] = [];
                cons.forEach((con) => {
                    coords.push(con.segments);
                    if (con.id) serials.push(con.id);       // Get ID in a separate list, to be used alongside the coordinates
                })
                this.getConnectorInfo(this.loadConnectorFromSave, "connectors", conType, cT, coords, serials);
            })
        }  
    }

    loadConnectorFromSave = (selectedConnector: ConnectorInfo, locations: {start: Coords, stop: Coords}[][], ids?: number[]) => {
        if (selectedConnector != null) {
            locations.forEach((space, idx) => {
                const start: Coords = space[0].start;
                const stop: Coords = space[0].stop;
                if (ids) {     // Use the saved serial number only if it is available
                    this._infrastructure.addConnector(start, stop, selectedConnector,this._map, ids[idx]);
                } else {
                    this._infrastructure.addConnector(start, stop, selectedConnector, this._map);
                }
                
            })
        }
    }

    //// MOUSE AND CLICK HANDLER METHODS ////

    handleClicks = (mouseX: number, mouseY: number) => {
        // Click is in sidebar (unless modal is open or the player has not chosen a landing site, or mouse context is wait):
        if (mouseX > constants.SCREEN_WIDTH - this._sidebar._width && !this._modal && this._hasLanded && this.mouseContext != "wait") {
            // console.log("Click in sidebar");
            this._sidebar.handleClicks(mouseX, mouseY);
        } else {
            // Click is over the map
            if (mouseX > 0 && mouseX < constants.SCREEN_WIDTH && mouseY > 0 && mouseY < constants.SCREEN_HEIGHT) {
                const [gridX, gridY] = this.getMouseGridPosition(mouseX, mouseY);
                switch (this.mouseContext) {
                    case "inspect":
                        console.log(`(${gridX}, ${gridY})`);
                        this.handleInspect({ x: gridX, y: gridY });
                        break;
                    case "placeModule":
                        this.handleModulePlacement(gridX, gridY);
                        break;
                    case "connectorStart":
                        this.handleConnectorStartPlacement(gridX, gridY)
                        break;
                    case "connectorStop":
                        this.handleConnectorStopPlacement();
                        break;
                    case "resource":
                        console.log("Resource Mode selected.");
                        break;
                    case "modal":
                        this._modal?.handleClicks(mouseX, mouseY);
                        break;
                    case "landing":
                        this.confirmLandingSequence(mouseX, mouseY);
                        break;
                    case "wait":
                        // TODO: Add UI explanation (or sound effect!) indicating that the player can't click during 'wait' mode
                        // console.log("Mouse click response suppressed. Reason: 'In wait mode'");
                        break;
                    default:
                        console.log(`Unknown mouse context used: ${this.mouseContext}`);
                }
                this.getMouseGridPosition(mouseX, mouseY);
            } 
        }
    }

    // Handler for when the mouse button is being held down (not currently in use)
    handleMouseDown = (mouseX: number, mouseY: number) => {
        // TODO: Add rules for something that starts the minute the mouse is pressed
        // Add rules for what to do when the mouse is released to handleClicks (the method right above this one)
    }

    handleMouseScroll = () => {
        const mouseX = this._p5.mouseX;
        // Don't allow scrolling if a modal is open:
        if (!this._modal) {
            // Handle scroll range for expanded map area:
            if (!this._hasLanded) {
                // Check if mouse is within range of the edge:
                if (mouseX < this._scrollDistance) {
                    this._mouseInScrollRange++;     // Increase scroll frame count
                    if (this._mouseInScrollRange >= this._scrollThreshold) {
                        this._scrollingLeft = true;     // Start scrolling if past the threshold
                    }
                } else if (mouseX > constants.SCREEN_WIDTH - this._scrollDistance) {
                    this._mouseInScrollRange++;
                    if (this._mouseInScrollRange >= this._scrollThreshold) {
                        this._scrollingRight = true;     // Start scrolling if past the threshold
                    }
                } else {    // Reset everything and stop scrolling if the mouse is not within scroll range of either side
                    this.stopScrolling();
                }
            } else {    // If the map is in normal mode (sidebar is present)
                if (!(mouseX > constants.SCREEN_WIDTH - this._sidebar._width)) {    // No scrolling from sidebar
                    if (mouseX < this._scrollDistance) {
                        this._mouseInScrollRange++;
                        if (this._mouseInScrollRange >= this._scrollThreshold) {
                            this._scrollingLeft = true;
                        }   // Use world view width instead of screen width when sidebar is open
                    } else if (mouseX > constants.WORLD_VIEW_WIDTH - this._scrollDistance) {
                        this._mouseInScrollRange++;
                        if (this._mouseInScrollRange >= this._scrollThreshold) {
                            this._scrollingRight = true;
                        }
                    } else {
                        this.stopScrolling();   // Stop scrolling if outside scroll area (but on the map)
                    }
                } else {
                    this.stopScrolling();       // Stio scrolling if mouse is over the sidebar
                }
            }
        } else {
            this.stopScrolling();               // Stop scrolling if a modal is open
        }
        // Increase scoll speed if player has been hovering in the scroll zone for longer than one second
        if (this._scrollingLeft && this._horizontalOffset > 0) {
            this._mouseInScrollRange > this._fastScrollThreshold ? this._horizontalOffset -= 2 : this._horizontalOffset--;
            this._horizontalOffset = Math.max(this._horizontalOffset, 0);   // Ensure scroll does not go too far left
        } else if (this._scrollingRight && this._horizontalOffset < this._map._maxOffset){
            this._mouseInScrollRange > this._fastScrollThreshold ? this._horizontalOffset += 2 : this._horizontalOffset++;
            this._horizontalOffset = Math.min(this._horizontalOffset, this._map._maxOffset);   // Ensure scroll does not go too far right
        }
    }

    stopScrolling = () => {
        this._mouseInScrollRange = 0;
        this._scrollingLeft = false;
        this._scrollingRight = false;
    }

    createMouseShadow = () => {
        const w = this.selectedBuilding?.width || constants.BLOCK_WIDTH;
        let h = this.selectedBuilding?.width || constants.BLOCK_WIDTH;
        // If structure is a module, find its height parameter; otherwise just use its height twice
        if (this.selectedBuilding != null && this._infrastructure._data.isModule(this.selectedBuilding)) {
            h = this.selectedBuilding.height;
        }
        this._mouseShadow = new MouseShadow(w, h);
    }

    createInspectToolMouseShadow = () => {
        this._mouseShadow = new MouseShadow(1, 1, true);
    }

    destroyMouseShadow = () => {
        this._mouseShadow = null;
    }

    // Evaluates whether the current mouse position is at an acceptable building site or not
    validateMouseLocationForPlacement = (x: number, y: number) => {
        // TODO: Improve the way this prevents out-of-bounds exceptions
        if (this.selectedBuilding && this._mouseShadow && x >= 0) {   // Only check if a building is selected and a mouse shadow exists
            if (this._infrastructure._data.isModule(this.selectedBuilding)) {    // If we have a module, check its placement
                const clear = this._infrastructure.checkModulePlacement(x, y, this.selectedBuilding, this._map._mapData);
                this._mouseShadow.setColor(clear);
            } else if (!this._mouseShadow._connectorStartCoords) { // If we have a Connector with NO start coords
                // If no start coords exist, this is the start placement
                const clear = this._infrastructure._data.checkConnectorEndpointPlacement(x, y, this._map._mapData);
                this._mouseShadow.setColor(clear);
            } else if (this._mouseShadow._connectorStopCoords) {
                const xStop = this._mouseShadow._connectorStopCoords.x;
                const yStop = this._mouseShadow._connectorStopCoords.y;
                const clear = this._infrastructure._data.checkConnectorEndpointPlacement(xStop, yStop, this._map._mapData);
                this._mouseShadow.setColor(clear);
            }
        }
    }

    // Given to various sub-components, this dictates how the mouse will behave when clicked in different situations
    setMouseContext = (value: string) => {
        this.clearInspectSelection();     // Reset inspect data
        this.mouseContext = value;
        // Only update the selected building if the mouse context is 'placeModule' or 'connectorStart'
        if (this.mouseContext === "placeModule" || this.mouseContext === "connectorStart") {
            this.setSelectedBuilding(this._sidebar._detailsArea._buildingSelection);
        } else if (this.mouseContext !== "connectorStop") {
            // If mouse context is neither placeModule nor connectorStart nor connectorStop, no building should be selected
            this.setSelectedBuilding(null);
        }
        // Ensure there is no mouse shadow if no structure is selected
        if (this.selectedBuilding === null) {
            this.destroyMouseShadow();
        }
        // Last, check if the mouse context has been set to 'inspect' and tell it to do the magnifying glass image if so
        if (this.mouseContext === "inspect") {
            this.createInspectToolMouseShadow();
        }
    }

    // Used for placing buildings and anything else that needs to 'snap to' the grid (returns values in grid locations)
    getMouseGridPosition = (mouseX: number, mouseY: number) => {
        // Calculate X position with the offset included to prevent wonkiness
        const mouseGridX = Math.floor((mouseX + this._horizontalOffset) / constants.BLOCK_WIDTH)
        const mouseGridY = Math.floor(mouseY / constants.BLOCK_WIDTH)
        // const horizontalOffGridValue = Math.floor(this._horizontalOffset / constants.BLOCK_WIDTH);
        const gridX = mouseGridX;
        const gridY = mouseGridY;
        // TODO: ADD vertical offset calculation
        // Return coordinates as a tuple:
        return [gridX, gridY];
    }

    // Takes the mouse coordinates and looks for an in-game entity at that location
    handleInspect = (coords: Coords) => {
        if (this._population.getColonistDataFromCoords(coords)) {                   // First check for Colonists
            this.inspecting = this._population.getColonistDataFromCoords(coords);
        } else if (this._infrastructure.getConnectorFromCoords(coords)) {           // Next, check for Connectors
            this.inspecting = this._infrastructure.getConnectorFromCoords(coords);
        } else if (this._infrastructure.getModuleFromCoords(coords)) {              // Then, check for Modules
            this.inspecting = this._infrastructure.getModuleFromCoords(coords);
        } else if (this._map.getBlockForCoords(coords)) {                           // Finally, check for terrain Blocks
            this.inspecting = this._map.getBlockForCoords(coords);
        } else {
            this.inspecting = null;
        }
        this._sidebar._detailsArea.setInspectData(this.inspecting);
    }

    clearInspectSelection = () => {
        this.inspecting = null;
        this._sidebar._detailsArea.setInspectData(this.inspecting);
    }

    //// STRUCTURE PLACEMENT METHODS ////

    setSelectedBuilding = (selectedBuilding: ModuleInfo | ConnectorInfo | null) => {
        this.selectedBuilding = selectedBuilding;
        // New mouse shadow is created when a structure is selected
        this.createMouseShadow();
    }

    // X and Y are already gridified
    handleModulePlacement = (x: number, y: number) => {
        if (this.selectedBuilding != null) {
            // MODULES
            if (this._infrastructure._data.isModule(this.selectedBuilding)) {
                // ASSUMES CASH IS THE ONLY KIND OF COST
                const affordable = this._economy._data.checkResources(this.selectedBuilding.buildCosts[0][1]);
                const clear = this._infrastructure.checkModulePlacement(x, y, this.selectedBuilding, this._map._mapData);
                if (clear && affordable) {
                    this._infrastructure.addModule(x, y, this.selectedBuilding,  this._map._topography, this._map._zones,);
                    this._economy._data.subtractMoney(this.selectedBuilding.buildCosts[0][1]);
                } else {
                    // TODO: Display this info to the player with an in-game message of some kind
                    console.log(`Clear: ${clear}`);
                    console.log(`Affordable: ${affordable}`);
                }
            }
        }
    }

    // Locks the mouse cursor into place at the start location of a new connector (X and Y are already gridified)
    handleConnectorStartPlacement = (x: number, y: number) => {
        // Ensure start location is valid
        if (this._infrastructure._data.checkConnectorEndpointPlacement(x, y, this._map._mapData)) {
            this._mouseShadow?.setLocked(true, {x: x, y: y});   // Lock the shadow's position when start location is chosen
            this.setMouseContext("connectorStop");
        }
    }

    // Completes the purchase and placement of a new connector
    handleConnectorStopPlacement = () => {
        // Ensure there is a building selected, and that it's not a module
        if (this.selectedBuilding != null && !this._infrastructure._data.isModule(this.selectedBuilding) && this._mouseShadow?._connectorStopCoords != null && this._mouseShadow._connectorStartCoords) {
            const baseCost = this.selectedBuilding.buildCosts[0][1];    // Get just the number
            const len = Math.max(this._mouseShadow._deltaX, this._mouseShadow._deltaY) + 1;
            const cost = baseCost * len;  // Multiply cost by units of length
            const affordable = this._economy._data.checkResources(cost); // NOTE: THIS ASSUMES COST IS ONLY EVER IN TERMS OF MONEY
            const start = this._mouseShadow._connectorStartCoords;
            const stop = this._mouseShadow._connectorStopCoords;
            const clear = this._infrastructure._data.checkConnectorEndpointPlacement(stop.x, stop.y, this._map._mapData);
            if (affordable && clear) {
                this._infrastructure.addConnector(start, stop, this.selectedBuilding, this._map);
                this._economy._data.subtractMoney(cost);
            } else {
                // TODO: Display this info to the player with an in-game message of some kind
                console.log(`Clear: ${clear}`);
                console.log(`Affordable: ${affordable}`);
            }
            // Reset mouse context to connector start so another connector can be placed
            this.destroyMouseShadow();
            this.createMouseShadow();
            this.setMouseContext("connectorStart");
        }
    }

    //// LANDING SEQUENCE METHODS ////
    
    // This method gets called by any mouse click when the mouse context is 'landing'
    confirmLandingSequence = (mouseX: number, mouseY: number) => {
        // Allow landing sequence only if an acceptable landing path is selected
        const gridX = this.getMouseGridPosition(mouseX, mouseY)[0];
        const flat = this._map.determineFlatness(gridX - 4, gridX + 4);
        // Prompt the player to confirm landing site before initiating landing sequence
        if (flat) {
            this.createModal(false, modalData[0]);
            this._landingSiteCoords[0] = gridX - 4; // Set landing site location to the left edge of the landing area
            this._landingSiteCoords[1] = (constants.SCREEN_HEIGHT / constants.BLOCK_WIDTH) - this._map._columns[gridX].length;
        }    
    }

    // If the player selects the 'proceed with landing' option, we start a wait period and play the landing animation
    startLandingSequence = () => {
        this.setMouseContext("wait");
        const wait = 480;
        const x = (this._landingSiteCoords[0] + 4) * constants.BLOCK_WIDTH;
        const destination = this._landingSiteCoords[1] * constants.BLOCK_WIDTH;
        this.setWaitTime(wait);
        // Setup landing animation with 
        this._animation = new Lander(this._p5, x, -120, destination, wait - 120);
    }

    // This method sets up the UI after the landing animation has finished
    completeLandingSequence = () => {
        this._animation = null;         // Delete the animation when it's finished
        this._map.setExpanded(false);
        this._hasLanded = true;
        this.placeInitialStructures();
        this.createModal(false, modalData[1]);
        // Add three new colonists, spread across the landing zone (Y value is -2 since it is the Colonist's head level)
        this._population.addColonist(this._landingSiteCoords[0], this._landingSiteCoords[1] - 2);
        this._population.addColonist(this._landingSiteCoords[0] + 3, this._landingSiteCoords[1] - 2);
        this._population.addColonist(this._landingSiteCoords[0] + 7, this._landingSiteCoords[1] - 2);
        this._population.addColonist(this._landingSiteCoords[0] + 6, this._landingSiteCoords[1] - 2);
        this._population.addColonist(this._landingSiteCoords[0] + 5, this._landingSiteCoords[1] - 2);
    }

    // Loads the first base structures after the dust clears from the landing sequence
    placeInitialStructures = () => {
        // NOTE: If altering the amount of initial modules (currently 14), update the provision method's first 'if' statement too
        const x = this._landingSiteCoords[0];       // Far left edge
        const y = this._landingSiteCoords[1] - 4;   // Top
        const rY = this._landingSiteCoords[1] - 1   // Rubble layer
        const storeCoords = [[x, y - 3]];
        const tankCoords = [[x + 4, y - 3]];
        const h20Coords = [[x + 6, y - 3]]
        const crewCoords = [[x, y]];
        const canCoords = [[x + 4, y]];
        const antennaCoords = [[x, y - 8]];
        const ladderStart: Coords = { x: x + 4, y: y};
        const ladderStop: Coords = { x: x + 4, y: y + 3};
        const ladderCoords = [[{ start: ladderStart, stop: ladderStop }]];
        // Note: getModuleInfo can print many copies of the same module, hence the double-list for coords at the end there
        this.getModuleInfo(this.loadModuleFromSave, "modules", "Life Support", "Cantina", canCoords);
        this.getModuleInfo(this.loadModuleFromSave, "modules", "Life Support", "Crew Quarters", crewCoords);
        this.getModuleInfo(this.loadModuleFromSave, "modules", "Storage", "Basic Storage", storeCoords);
        this.getModuleInfo(this.loadModuleFromSave, "modules", "Storage", "Oxygen Tank", tankCoords);
        this.getModuleInfo(this.loadModuleFromSave, "modules", "Storage", "Water Tank", h20Coords);
        this.getModuleInfo(this.loadModuleFromSave, "modules", "Communications", "Comms Antenna", antennaCoords);
        this.getConnectorInfo(this.loadConnectorFromSave, "connectors", "transport", "Ladder", ladderCoords);
        let rubbleCoords: number[][] = [];
        for (let i = 0; i < 8; i++) {
            rubbleCoords.push([x + i, rY]);
        }
        this.getModuleInfo(this.loadModuleFromSave, "modules", "test", "Small Node", rubbleCoords);
    }

    // Stocks up the first base structures with resources at the beginning of the game
    provisionInitialStructures = () => {
        // Ensure all structures have been generated
        const startingStructureCount = 14;
        if (this._infrastructure._modules.length >= startingStructureCount) {
            this._infrastructure._modules.forEach((mod) => {
                // Default for now is to just indiscriminately fill 'em all up
                mod._moduleInfo.storageCapacity.forEach((resource) =>  {
                    mod.addResource(resource);
                })
            });
            this.updateEconomyDisplay();    // Update economy display so that the player can see what they have right away
            this._economy._data.setResourceChangeRates();    // Reset the rate-of-change display afterwards
            this._provisioned = true;
        } else {
            console.log(`ERROR: Failed to provision base initial structures. Found only ${this._infrastructure._modules.length} modules - should be ${startingStructureCount}`);
        };
    }

    //// RESOURCE CONSUMPTION METHODS ////

    updateEconomyDisplay = () => {
        const rs = this._infrastructure.getAllBaseResources();
        this._economy._data.updateResources(rs);
    }

    //// GAMESPEED AND TIME METHODS ////

    setGameSpeed = (value: string) => {
        this.gameOn = true;     // Always start by assuming the game is on
        switch (value) {
            case "pause":
                this.gameOn = false;
                break;
            case "slow":
                this.ticksPerMinute = 40;
                break;
            case "fast":
                this.ticksPerMinute = 20;
                break;
            case "blazing":
                this.ticksPerMinute = 1;    // Ultra fast mode in dev mode?!
                break;
        }
    }

    // Sets the Smartian time
    setClock = (gameTime: GameTime) => {
        this._gameTime = gameTime;
    }

    // Calls scheduled update events
    handleHourlyUpdates = () => {
        this.updateEconomyDisplay();
        this.updateEarthData();
        this._infrastructure.handleHourlyUpdates();
        this._industry.updateJobs(this._infrastructure);
    }

    // In-game clock control and general event scheduler
    advanceClock = () => {
        if (this.gameOn) {
            this._tick++;
            if (this._tick >= this.ticksPerMinute) {
                this._tick = 0;     // Advance minutes
                // Update colonists' locations each 'minute', and all of their other stats every hour
                this._population.updateColonists(this._gameTime.minute === 0, this._infrastructure, this._map, this._industry);
                if (this._gameTime.minute < this._minutesPerHour - 1) {  // Minus one tells the minutes counter to reset to zero after 59
                    this._gameTime.minute ++;
                } else {
                    this._gameTime.minute = 0;   // Advance hours (anything on an hourly schedule should go here)
                    this.handleHourlyUpdates();
                         // Advance Earth date every game hour
                    if (this._gameTime.hour < this._hoursPerClockCycle) {
                        this._gameTime.hour ++;
                        if (this._gameTime.hour === this._hoursPerClockCycle) {  // Advance day/night cycle when hour hits twelve
                            if (this._gameTime.cycle === "AM") {
                                this._gameTime.cycle = "PM"
                            } else {
                                this.generateEvent();           // Modal popup appears every time it's a new day.
                                this._gameTime.cycle = "AM";        // Advance date (anything on a daily schedule should go here)
                                if (this._gameTime.sol < this._solsPerYear) {
                                    this._gameTime.sol ++;
                                } else {
                                    this._gameTime.sol = 1;
                                    this._gameTime.year ++;      // Advance year (anything on an yearly schedule should go here)
                                }
                                this._sidebar.setDate(this._gameTime.sol, this._gameTime.year);   // Update sidebar date display
                            }  
                        }
                    } else {
                        this._gameTime.hour = 1;     // Hour never resets to zero
                    }
                } 
            }
        }
    }

    // Methods for controlling wait times
    setWaitTime = (time: number) => {
        this._waitTime = time;  // Time is given in number of frames, so a value of ~ 50 equals 1 second in real time
    }

    advanceWaitTime = () => {
        if (this._waitTime > 0) {
            this._waitTime--;
        }
        if (this._waitTime <= 0) {
            // Resolve wait by resetting mouse context and possibly calling additional functions
            this.setMouseContext("inspect");
            this.resolveWaitPeriod();
        }
    }

    // Check if additional functions should be called at the end of a wait period
    resolveWaitPeriod = () => {
        if (!this._hasLanded) {
            this.completeLandingSequence();
        }
    }

    //// MODAL CONTROL METHODS ////

    // Prints a welcome-to-the-game message the first time a player begins a game
    createNewGameModal = () => {
        const data: EventData = {
            id: 0,
            title: "Landfall!",
            text: "The SMARS corporation welcomes you to your new home! \nYou have been appointed by the board of directors to \noversee the latest attempt to establish a colony on this\ndismal speck of dust. They hope that you will be more\nsuccessful than your predecessors. We absolutely cannot\nafford any more rescue missions this quarter.",
            resolutions: [
                {
                    text: "Sounds good, boss!",
                    outcomes: [["set-mouse-context", "landing"]]
                }
            ],
        }
        this.createModal(false, data);
    }

    // Prints a welcome-back modal when the player loads a saved file
    createLoadGameModal = (username: string) => {
        const data: EventData = {
            id: 1,
            title: "You're back!!!",
            text: `Welcome back, Commander ${username}!\n The colonists missed you.\nThey look up to you.`,
            resolutions: [
                {
                    text: "The feeling is mutual.",
                    outcomes: [["set-mouse-context", "inspect"]]
                } 
            ]
        }
        this.createModal(false, data);
    }

    // In-game event generator: produces scheduled and/or random events which will create modal popups
    generateEvent = (probability?: number) => {     // Probability is given optionally as a percent value
        const example: EventData = {
            id: 2,
            title: "It's a new day on SMARS",
            text: "What a difference... a Sol makes,\n Twenty-four-and-a-half little hours,\nnot much sun, and no flowers (yet)\nnor yet any rain...\n\nYou have received additional funding.",
            resolutions: [
                {
                    text: "How time flies!",
                    outcomes: [["set-mouse-context", "inspect"], ["add-money", 50000]]
                }
            ]
        }
        if (probability) {
            const rand = Math.floor(Math.random() * 100);           // Generate random value and express as a percent
            if (rand <= probability) this.createModal(true, example);     // Fire if given probability is higher than random value
        } else {
            this.createModal(false, example);
        }
    }

    createModal = (random: boolean, data: EventData) => {
        this.gameOn = false;
        this._modal = new Modal(this._p5, this.closeModal, random, data);
        this.setMouseContext("modal");
    }

    // Resolution parameter tells the Engine, by index position, which resolution to enact
    closeModal = (resolution: number) => {
        if (this._modal) {
            // Carry out each outcome instruction for the modal's resolution. TODO: Allow user to choose among up to 3 options
            this._modal._resolutions[resolution].outcomes.forEach((outcome) => {
                switch (outcome[0]) {
                    case "start-landing-sequence":
                        // TODO: Add in-game message in place of console log
                        // console.log('Landing sequence initiated.');
                        this.startLandingSequence();
                        break;
                    case "provision-base-structures":
                        this.provisionInitialStructures();
                        break;
                    case "set-mouse-context":
                        this.setMouseContext(outcome[1].toString());
                        break;
                    case "add-money":
                        if (typeof outcome[1] === "number") this._economy._data.addMoney(outcome[1]);
                        break;
                    default:
                        console.log(`Unrecognized modal resolution code: ${outcome[0]}`);
                }
            })
        }
        // Clear modal data and resume the game
        this._modal = null;
        this.gameOn = true;
    }

    //// RENDER METHODS ////

    // The general-purpose mouse-shadow rendering method
    renderMouseShadow = () => {
        if (this.selectedBuilding !== null) {
            this.renderBuildingShadow();
        } else if (this.mouseContext === "landing") {
            this.renderLandingPath();
        } else if (this.mouseContext === "inspect") {
            this.renderInspectTool();
        }
    }

    // For the landing sequence
    renderLandingPath = () => {
        const p5 = this._p5;
        if (!this._modal) {
            let [x, y] = this.getMouseGridPosition(p5.mouseX, p5.mouseY);
            const flat = this._map.determineFlatness(x - 4, x + 4);  // Check the surface beneath the proposed LZ
            // Set the mouse in the middle of the landing path
            x = x * constants.BLOCK_WIDTH - this._horizontalOffset - (4 * constants.BLOCK_WIDTH);
            y = 0;
            const w = 8 * constants.BLOCK_WIDTH;
            const h = constants.SCREEN_HEIGHT;
            flat ? p5.fill(constants.GREEN_DARK) : p5.fill(constants.RED_BG);
            p5.rect(x, y, w, h);
        }
    }

    // For building placement
    renderBuildingShadow = () => {
        const p5 = this._p5;
        // Only render the building shadow if mouse is over the map area (not the sidebar) and there is no modal
        if (p5.mouseX < constants.SCREEN_WIDTH - this._sidebar._width && !this._modal && this._mouseShadow) {
            let [x, y] = this.getMouseGridPosition(p5.mouseX, p5.mouseY);
            // Set mouse shadow color based on current position's validity, and render it:
            this.validateMouseLocationForPlacement(x, y);
            x = x * constants.BLOCK_WIDTH;
            y = y * constants.BLOCK_WIDTH;
            if (this.selectedBuilding !== null) {
                if (this._infrastructure._data.isModule(this.selectedBuilding)) {
                    this._mouseShadow.render(this._p5, x, y, this._horizontalOffset);
                } else {
                    if (this.mouseContext === "connectorStart") {
                        this._mouseShadow.render(this._p5, x, y, this._horizontalOffset);
                    } else if (this.mouseContext === "connectorStop") {
                        this._mouseShadow.resizeForConnector(x, y, this.selectedBuilding.horizontal, this.selectedBuilding.vertical);
                        this._mouseShadow.render(this._p5, x, y, this._horizontalOffset);
                    }
                }
            }
        }    
    }

    // For rendering the inspect tool
    renderInspectTool = () => {
        // Only render the Inspect Tool if mouse is over the map area (not the sidebar) and there is no modal
        if (this._p5.mouseX < constants.SCREEN_WIDTH - this._sidebar._width && !this._modal && this._mouseShadow) {
            let [x, y] = this.getMouseGridPosition(this._p5.mouseX, this._p5.mouseY);
            x = x * constants.BLOCK_WIDTH;
            y = y * constants.BLOCK_WIDTH;
            this._mouseShadow.render(this._p5, x, y, this._horizontalOffset);
        }
    }

    render = () => {
        this.advanceClock();        // Always try to advance the clock; it will halt itself if the game is paused
        if (this.mouseContext === "wait") {
            this.advanceWaitTime();
        }
        const p5 = this._p5;
        p5.background(constants.APP_BACKGROUND);
        this.renderMouseShadow();                               // Render mouse shadow first
        if (this._animation) {
            this._animation.render(this._horizontalOffset);     // Render animation second
        }
        this._map.render(p5, this._horizontalOffset);               // Render map third
        this._infrastructure.render(this._p5, this._horizontalOffset);    // Render infrastructure fourth
        if (this.selectedBuilding && !this._infrastructure._data.isModule(this.selectedBuilding)) {
            this.renderMouseShadow(); // If placing a connector, render mouse shadow above the infra layer
        }
        this._economy.render();
        this._population.render(this._p5, this._horizontalOffset, this.ticksPerMinute, this.gameOn);
        this.handleMouseScroll();   // Every frame, check for mouse scrolling
        // Don't render sidebar until the player has chosen a landing site
        if (this._hasLanded) {
            this._sidebar.render(this._gameTime.minute, this._gameTime.hour, this._gameTime.cycle);
        }
        if (this.mouseContext === "inspect") {
            this.renderMouseShadow();
        }
        if (this._modal) {
            this._modal.render();
        }
    }
}