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
import DropPod from "./dropPod";
import MouseShadow from "./mouseShadow";
import Sky from "./sky";
// Component display shapes for Inspect Tool
import Block from "./block";
import Colonist from "./colonist";
import Connector from "./connector";
import Module from "./module";
// Helper/server functions
import { ModuleInfo, ConnectorInfo, getOneModule, getOneConnector, getRandomEvent } from "./server_functions";
import { constants, modalData, randomEventsData } from "./constants";
// Types
import { ConnectorSaveInfo, ModuleSaveInfo, SaveInfo, GameTime } from "./saveGame";
import { GameData } from "./newGameSetup";
import { Coords } from "./connector";
import { Resource } from "./economyData";

export default class Engine extends View {
    // Engine types
    _p5: P5;                    // Although the View class no longer uses it in the constructor, the Engine still does
    _sidebar: Sidebar;
    _sidebarExtended: boolean;
    _gameData: GameData | null  // Data object for a new game
    _saveInfo: SaveInfo | null  // Data object for a saved game
    _difficulty: string         // Imported from either the new game or the loaded game
    _randomEventsEnabled: boolean   // Imported from either the new game or the loaded game
    _mapType: string            // Imported from either the new game or the loaded game
    _map: Map;
    _infrastructure: Infrastructure;
    _industry: Industry;
    _economy: Economy;
    _population: Population;
    _modal: Modal | null;
    _animation: Lander | DropPod | null; // This field holds the current entity being used to control animations, if there is one
    _mouseShadow: MouseShadow | null;    // This field will hold a mouse shadow entity if a building is being placed
    _sky: Sky;                  // The animations component for the sky, including sunlight levels and atmospheric effects
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
    // Event control
    _currentEvent: {
        type: string,       // Type aka name (e.g. colonist-landing, meteor, etc)
        coords: Coords,     // The location of the event
        value: number       // Intensity of the event (number of colonists, power of meteor strike, etc)
    };
    // Record the last random event's data
    _randomEvent: {
        karma: string,
        magnitude: number,
        data: EventData
    } | null;                   // Random event starts as null
    // In-game time control
    gameOn: boolean;            // If the game is on then the time ticker advances; if not it doesn't
    _tick: number;              // Updated every frame; keeps track of when to advance the game's clock
    _waitTime: number;          // Counts down to an unpause action if the game needs to wait for an event or animation to finish
    _gameTime: GameTime;            // The Game's time can now be stored as a GameTime-type object.
    ticksPerMinute: number;
    _minutesPerHour: number;
    _hoursPerClockCycle: number;    // One day = two trips around the clock
    _solsPerYear: number;
    _daytime: boolean;              // Keep track of whether it is day or night
    _sunlight: number;              // Percent value (0 to 100) of how strongly the sun is shining
    // In-game flag for when the player has chosen their landing site, and grid location of landing site's left edge and altitude
    _hasLanded: boolean;
    _landingSiteCoords: [number, number];
    _provisioned: boolean;          // Flag to know when to stop trying to fill up the initial structures with resources
    switchScreen: (switchTo: string) => void;   // App-level SCREEN switcher (passed down via drill from the app)
    updateEarthData: () => void;    // Updater for the date on Earth (for starters)
    getModuleInfo: (setter: (selectedBuilding: ModuleInfo, locations: number[][], ids?: number[], resources?: Resource[][]) => void, category: string, type: string, name: string, locations: number[][], ids?: number[], resources?: Resource[][], crews?: number[][], maintenanceStatuses?: boolean[]) => void;        // Getter function for loading individual structure data from the backend
    getConnectorInfo: (setter: (selectedConnector: ConnectorInfo, locations: {start: Coords, stop: Coords}[][], ids?: number[]) => void, category: string, type: string, name: string, locations: {start: Coords, stop: Coords}[][], ids?: number[]) => void;
    getRandomEvent: (event_request: [string, number], setter: (ev: {karma: string, magnitude: number, data: EventData}) => void) => void;

    constructor(p5: P5, switchScreen: (switchTo: string) => void, changeView: (newView: string) => void, updateEarthData: () => void) {
        super(changeView);
        this._p5 = p5;
        this.switchScreen = switchScreen;
        this.updateEarthData = updateEarthData;
        this.getModuleInfo = getOneModule;
        this.getConnectorInfo = getOneConnector;
        this.getRandomEvent = getRandomEvent;
        this._sidebar = new Sidebar(p5, this.switchScreen, this.changeView, this.setMouseContext, this.setGameSpeed);
        this._sidebarExtended = true;   // Side bar can be partially hidden to expand map view - should this be here or in the SB itself??
        this._gameData = null;
        this._saveInfo = null;  // Saved game info is loaded from the Game module when it calls the setupSavedGame method
        this._difficulty = "medium" // Provide default values in case of loading failure
        this._randomEventsEnabled = true;
        this._mapType = "polar";
        this._map = new Map();
        this._infrastructure = new Infrastructure();
        this._industry = new Industry();
        this._economy = new Economy(p5);
        this._population = new Population();
        this._modal = null;
        this._animation = null;
        this._mouseShadow = null;
        this._sky = new Sky();
        this._horizontalOffset = 0;
        this._scrollDistance = 50;
        this._scrollingLeft = false;
        this._scrollingRight = false;
        this._mouseInScrollRange = 0;    // Counts how many frames have passed with the mouse within scroll distance of the edge
        this._scrollThreshold = 10;         // Controls the number of frames that must pass before the map starts to scroll
        this._fastScrollThreshold = 60;     // Number of frames to pass before fast scroll begins
        this.mouseContext = "inspect"       // Default mouse context allows user to select ('inspect') whatever they click on
        this.selectedBuilding = null;       // There is no building info selected by default.
        this.selectedBuildingCategory = ""; // Keep track of whether the selected building is a module or connector
        this.inspecting = null;             // Keep track of selected item; default is null
        this._currentEvent = {              // Keep track of whether there is an event going on
            type: "",
            coords: { x: 0, y: 0 },
            value: 0
        };
        this._randomEvent = null;
        // Time-keeping:
        // TODO: Make the clock its own component, to de-clutter the Engine.
        this.gameOn = true;                 // By default the game is on when the Engine starts
        this._tick = 0;
        this._waitTime = 0;                 // By default there is no wait time
        this._gameTime = {
            minute: 0,
            hour: 12,
            cycle: "AM",
            sol: 1,
            year: 0
        };                                  // New take on the old way of storing the game's time
        this.ticksPerMinute = 20            // Medium "fast" speed is set as the default
        this._minutesPerHour = 60;          // Minutes go from 0 - 59, so this should really be called max minutes
        this._hoursPerClockCycle = 12;
        this._solsPerYear = 4;
        this._daytime = false;              // It is night time when the game starts
        this._sunlight = 0;                 // No sunshine at night (when the game starts)
        // Flags and game start values
        this._hasLanded = false;            // At the Engine's creation, the player is presumed not to have landed yet
        this._landingSiteCoords = [-1, -1]; // Default value of -1, -1 indicates landing site has not yet been selected
        this._provisioned = false;          // Stays negative until all basic modules have been loaded with starting resources
    }

    //// SETUP METHODS ////

    setup = () => {
        this.currentView = true;
        this._sidebar.setup();
        this.selectedBuilding = null;
        this.updateSidebarGamespeedButtons();   // Ensure sidebar gamespeed buttons always show the right value
        this.setSidebarSelectedButton();   // Ensure sidebar mouse context buttons are correct
        this._sidebar._detailsArea._minimap.updateTerrain(this._map._mapData);
        // Sidebar minimap display - does it only need it during 'setup' or does it also need occasional updates?
    }

    setupNewGame = (gameData: GameData) => {
        this._gameData = gameData;  // gameData object only needs to be set for new games
        this._difficulty = gameData.difficulty;
        this._randomEventsEnabled = gameData.randomEvents;
        this._mapType = gameData.mapType;
        this._map.setup(this._gameData.mapTerrain);
        this._economy._data.addMoney(this._gameData.startingResources[0][1]);
        this._horizontalOffset = this._map._maxOffset / 2;   // Put player in the middle of the map to start out
        this._infrastructure.setup(this._map._mapData.length);
        this.updateDayNightCycle();
        this.createNewGameModal();
    }

    setupSavedGame = (saveInfo: SaveInfo) => {
        this._saveInfo = saveInfo;
        // Load game time
        this.setClock(saveInfo.game_time);
        this.updateDayNightCycle();
        // Load game settings
        this._difficulty = saveInfo.difficulty;
        this._randomEventsEnabled = saveInfo.random_events;
        this._mapType = saveInfo.map_type;
        this._map.setup(this._saveInfo.terrain);
        console.log(this._difficulty);
        console.log(this._randomEventsEnabled);
        console.log(this._mapType);
        // TODO: Extract the map expansion/sidebar pop-up (and the reverse) into a separate method
        this._map.setExpanded(false);   // Map starts in 'expanded' mode by default, so it must tell it the sidebar is open
        this._economy._data.addMoney(saveInfo.resources[0][1]); // Reload money from save data
        // TODO: Update the economy's load sequence to re-load rate-of-change data instead of resource quantities
        // DON'T DO IT HERE THOUGH - Do it at the end of the loadModuleFromSave method (2 down from this one)
        this._economy._data.setResourceChangeRates();           // Reset money rate-of-change indicator
        this._horizontalOffset = this._map._maxOffset / 2;
        this._infrastructure.setup(this._map._mapData.length);
        this._population.loadColonistData(saveInfo.colonists);
        this._industry.loadSavedMiningLocations(saveInfo.miningLocations, saveInfo.miningLocationsInUse);
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
                const maintenanceStatuses: boolean[] = [];  // List of each module's maintenance status
                mods.forEach((mod) => {
                    coords.push([mod.x, mod.y]);
                    serials.push(mod.id);   // Get ID in separate list, to be used alongside the coordinates
                    resources.push(mod.resources);  // Ditto resource data
                    crews.push(mod.crewPresent);
                    maintenanceStatuses.push(mod.isMaintained);
                })
                this.getModuleInfo(this.loadModuleFromSave, "modules", modType, mT, coords, serials, resources, crews, maintenanceStatuses);
            })
        }  
    }

    // Called by the above method, this will actually use the data from the backend to re-create loaded modules
    loadModuleFromSave = (selectedBuilding: ModuleInfo, locations: number[][], ids?: number[], resources?: Resource[][], crews?: number[][], maintenanceStatuses?: boolean[]) => {
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
                        // If maintenance status data is available, load it
                        if (maintenanceStatuses) {
                            mod._isMaintained = maintenanceStatuses[idx];
                        }
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
                // console.log(`(${gridX}, ${gridY})`);
                switch (this.mouseContext) {
                    case "inspect":
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
                        this.handleResourceZoneSelect({ x: gridX, y: gridY });
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

    createJackhammerMouseShadow = () => {
        this._mouseShadow = new MouseShadow(1, 1, false, true);
    }

    destroyMouseShadow = () => {
        this._mouseShadow = null;
    }

    // Mouse Context Handler for 'resource'
    handleResourceZoneSelect = (coords: Coords) => {
        const b = this._map.getBlockForCoords(coords);
        if (b && this._map.isBlockOnSurface(b)) {   // Ensure block is on the surface
            // TODO: Build this out to allow easy handling of multiple new resource types
            if (b._blockData.resource === "water") {
                this._industry.addMiningLocation(coords, "water"); // Push the coordinates for the mining location
            }
        }
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
        // TODO: Reorganize into a switch case block??
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
        // Next, check if mouse context has been set to 'resource' and show a little jackhammer if so
        if (this.mouseContext === "resource") {
            this.setSidebarSelectedButton();
            this.createJackhammerMouseShadow();
        }
        // Last, check if the mouse context has been set to 'inspect' and tell it to do the magnifying glass image if so
        if (this.mouseContext === "inspect") {
            this.createInspectToolMouseShadow();
            this.setSidebarSelectedButton();
        }
    }

    // Ensures that the sidebar buttons for 'inspect' or 'resource' are always highlighted appropriately
    setSidebarSelectedButton = () => {
        switch (this.mouseContext) {
            case "resource":
                this._sidebar.setSelectedButton(5);
                break;
            case "inspect":
                this._sidebar.setSelectedButton(6);
                break;
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
        // Clear previous inspect target (if any) before determining new display data
        this.clearInspectSelection();
        if (this._population.getColonistDataFromCoords(coords)) {                   // First check for Colonists
            this.inspecting = this._population.getColonistDataFromCoords(coords);
        } else if (this._infrastructure.getConnectorFromCoords(coords)) {           // Next, check for Connectors
            this.inspecting = this._infrastructure.getConnectorFromCoords(coords);
            this._infrastructure.highlightStructure(this.inspecting?._id || 0, false);  // Use ID if available, otherwise reset
        } else if (this._infrastructure.getModuleFromCoords(coords)) {              // Then, check for Modules
            this.inspecting = this._infrastructure.getModuleFromCoords(coords);
            this._infrastructure.highlightStructure(this.inspecting?._id || 0, true);
        } else if (this._map.getBlockForCoords(coords)) {                           // Finally, check for terrain Blocks
            this.inspecting = this._map.getBlockForCoords(coords);
            this._map.setHighlightedBlock(this.inspecting);
        } else {
            this.inspecting = null;
        }
        this._sidebar._detailsArea.setInspectData(this.inspecting);
    }

    clearInspectSelection = () => {
        this.inspecting = null;
        this._sidebar._detailsArea.setInspectData(this.inspecting);
        // Clear selection highlighting for all Engine sub-classes
        this._population.highlightColonist(0);
        this._infrastructure.highlightStructure(0, false);
        this._map.setHighlightedBlock(null);
    }

    //// STRUCTURE PLACEMENT METHODS ////

    setSelectedBuilding = (selectedBuilding: ModuleInfo | ConnectorInfo | null) => {
        this.selectedBuilding = selectedBuilding;
        // New mouse shadow is created when a structure is selected
        if (this.selectedBuilding) {
            this.createMouseShadow();
        }
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
            this.createModal(modalData.find((modal) => modal.id ==="landing-confirm"));
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
        this._animation = new Lander(x, -120, destination, wait - 120);
    }

    // This method sets up the UI after the landing animation has finished
    completeLandingSequence = () => {
        this._animation = null;         // Delete the animation when it's finished
        this._map.setExpanded(false);
        this._hasLanded = true;
        this.placeInitialStructures();
        this.createModal(modalData.find((modal) => modal.id === "landing-touchdown"));
        // Add three new colonists, spread across the landing zone (Y value is -2 since it is the Colonist's head level)
        this._population.addColonist(this._landingSiteCoords[0], this._landingSiteCoords[1] - 2);
        this._population.addColonist(this._landingSiteCoords[0] + 2, this._landingSiteCoords[1] - 2);
        this._population.addColonist(this._landingSiteCoords[0] + 5, this._landingSiteCoords[1] - 2);
        this._population.addColonist(this._landingSiteCoords[0] + 7, this._landingSiteCoords[1] - 2);
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
        this.getModuleInfo(this.loadModuleFromSave, "modules", "test", "Comms Antenna", antennaCoords);
        this.getConnectorInfo(this.loadConnectorFromSave, "connectors", "transport", "Ladder", ladderCoords);
        let batteryCoords: number[][] = [];
        for (let i = 0; i < 8; i += 2) {
            batteryCoords.push([x + i, rY]);
        }
        this.getModuleInfo(this.loadModuleFromSave, "modules", "Storage", "Small Battery", batteryCoords);
    }

    // Stocks up the first base structures with resources at the beginning of the game
    provisionInitialStructures = () => {
        // Ensure all structures have been generated
        const startingStructureCount = 10;
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

    //// LANDING SEQUENCE METHODS FOR NEWLY ARRIVING COLONISTS (SMARS IMMIGRATION) ////

    startNewColonistsLanding = (colonists: number) => {
        // console.log(`${colonists} new colonists are now landing!`);
        // Get a location for the landing
        const direction = Math.random() > 0.5 ? 1 : 0;          // 1 = landing is near to left edge of the map, 0 = right edge
        const distance = Math.floor(Math.random() * 10) + 2;    // Set a distance of 2 - 11 from either edge
        const location = direction ? distance : this._map._topography.length - distance;
        // Get the highest elevation of two adjacent columns as surface altitude to prevent colonists falling into the ground
        const surfaceAltitude = Math.min(this._map._topography[location], this._map._topography[location + 1]);
        // Convert values into pixels for drop pod constructor
        const pixelLocation = location * constants.BLOCK_WIDTH;
        const landingDistance = (surfaceAltitude) * constants.BLOCK_WIDTH;
        // Create event object
        const ev = {
            type: "colonist-drop",
            coords: { x: location, y: surfaceAltitude - 2},
            value: colonists
        }
        const wait = 600;   // Set wait period to be about 10 seconds
        this.setCurrentEvent(ev, wait);
        // Relocate the screen to look at the landing
        this._horizontalOffset = direction ? 0 : this._map._maxOffset;
        const duration = wait - 150;    // Allow the animation to linger a moment before disappearing
        this._animation = new DropPod(pixelLocation, 0, landingDistance, duration);
    }

    //// SPECIAL EVENT AND WAIT-TIME METHODS ////

    // Sets the current event and sets mouse context to 'wait' for an optional specified time
    setCurrentEvent = (ev: { type: string, coords: Coords, value: number }, duration?: number) => {
        if (ev.type !== "") {
            this._currentEvent = ev;
            this.setMouseContext("wait");
            duration ? this.setWaitTime(duration) : this.setWaitTime(120);  // Default to 2.5 second wait time
            this._sidebar.handleFast();       // Set time rate to 'fast' mode (basic standard) via the sidebar
        } else {
            console.log("Error setting current event:");
            console.log(ev);
        }
        
    }

    // Resolves whatever the current event is, and terminates any animation that might have been shown
    resolveCurrentEvent = () => {
        this._currentEvent = { 
            type: "",
            coords: { x : 0, y: 0 },
            value: 0
        };
        this._animation = null;
        this.setMouseContext("inspect");
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

    // Check if additional functions should be called at the end of a wait period (currently just used for new games)
    resolveWaitPeriod = () => {
        if (!this._hasLanded) {
            this.completeLandingSequence();
        } else {
            switch(this._currentEvent.type) {
                case "colonist-drop":
                    for (let i = 0; i < this._currentEvent.value; i++) {
                        this._population.addColonist(this._currentEvent.coords.x + i % 2, this._currentEvent.coords.y);
                    }
                    this.resolveCurrentEvent();
                    break;
            }
        }
    }

    //// RESOURCE CONSUMPTION METHODS ////

    updateEconomyDisplay = () => {
        const rs = this._infrastructure.getAllBaseResources();
        this._economy._data.updateResources(rs);
    }

    //// TIME AND GAMESPEED METHODS ////

    setGameSpeed = (value: string) => {
        // Set this value directly here  instead of using the setter method to preserve buttons' built-in highlight logic
        this.gameOn = true;
        switch (value) {
            case "pause":
                this.setGameOn(false);
                break;
            case "slow":
                this.ticksPerMinute = 40;   // SLOW: One game minute passes for every 40 P5 frame refreshes
                break;
            case "fast":
                this.ticksPerMinute = 20;   // FAST: One game minute passes for every 20 P5 frame refreshes
                break;
            case "blazing":
                this.ticksPerMinute = 1;    // BLAZING: One minute passes for every P5 frame refresh
                break;
        }
    }

    // Handles pausing/unpausing the game
    setGameOn = (gameOn: boolean) => {
        this.gameOn = gameOn;
        this.updateSidebarGamespeedButtons();
    }

    // Ensures the Sidebar's gamespeed buttons display the correct game speed
    updateSidebarGamespeedButtons = () => {
        // Determine gamespeed setting to pass to the Sidebar so the right button is always highlighted
        let gamespeedIndex = 0;
        switch (this.ticksPerMinute) {
            case 40:
                gamespeedIndex = 1;     // SLOW
                break;
            case 20:
                gamespeedIndex = 2;     // FAST
                break;
            case 1:
                gamespeedIndex = 3;     // BLAZING (Keep values here in sync with game speed setting options down below)
                break;
            default:
                gamespeedIndex = 2;
                break;
        };
        if (this.gameOn !== true) {
            gamespeedIndex = 0;       // If the game is paused, use index zero to highlight the pause button
        }
        this._sidebar.setGamespeedButtons(gamespeedIndex);
    }

    // Sets the Smartian time
    setClock = (gameTime: GameTime) => {
        this._gameTime = gameTime;
    }

    // Calls scheduled update events
    handleHourlyUpdates = () => {
        this.updateEarthData();
        this._infrastructure.handleHourlyUpdates(this._sunlight);   // Sunlight level is passed to power generation methods
        this._industry.updateJobs(this._infrastructure);
        this.updateEconomyDisplay();
        this.updateDayNightCycle();
        // Re-activate the 2 lines below to periodically gauge how much, if any, the game's time keeping is slipping as it grows
        // const time = new Date();
        // console.log(time);
    }

    // Updates the day/night cycle and in-game weather
    updateDayNightCycle = () => {
        const day = (this._gameTime.cycle === "AM" && (this._gameTime.hour >= 6 && this._gameTime.hour < 12)) || (this._gameTime.cycle === "PM" && (this._gameTime.hour < 6 || this._gameTime.hour === 12));
        if (day) {
            this._daytime = true;
            this.updateSunlightLevel();
        } else {
            this._daytime = false;
            this._sunlight = 0;
        }
        let hour = this._gameTime.hour;
        if (hour !== 12) {  // At 12 (noon / midnight) sky colour is set to either full daylight / midnight (no alteration needed)
            this._sky.updateSkyColour(day, this._gameTime.cycle);
        }
    }

    // Updates light levels (only called during daytime, so the math does not apply at all hours of the Sol)
    updateSunlightLevel = () => {
        // Who needs grade 8 algebra when you've got a switch case!
        switch (this._gameTime.hour) {
            case 6:                     // 6 AM
            case 5:                     // 5 PM
                this._sunlight = 25;    // Sunlight level is 25% for the hour before sunset and the hour after dawn
                break;
            case 7:                     // 7 AM
            case 4:                     // 4 PM
                this._sunlight = 75;    // Sunlight rises rapidly in the early morning (and fades in the late afternoon)
                break;
            case 8:                     // 8 AM
            case 3:                     // 3 PM
                this._sunlight = 95;    // Sunlight is near max level by mid-morning / afternoon
                break;
            default:
                this._sunlight = 100;   // Any number not in the above list is in the middle of the day (full sunlight)
        }
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
                    this._gameTime.minute = 0;          // Advance hours
                    if (this._gameTime.hour < this._hoursPerClockCycle) {
                        this._gameTime.hour ++;
                        if (this._gameTime.hour === this._hoursPerClockCycle) {  // Advance day/night cycle when hour hits twelve
                            if (this._gameTime.cycle === "AM") {
                                this._gameTime.cycle = "PM"
                            } else {
                                this._gameTime.cycle = "AM";
                                this._sky.setSkyColour(constants.GREEN_DARKEST, false); // Reset sky secondary colour at midnight
                                // Advance date (anything on a daily schedule should go here)
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
                        this._gameTime.hour = 1;    // Hour never resets to zero
                    }
                    // Everything on an hourly schedule should go HERE
                    this.handleHourlyUpdates();             // Handle updates after updating the clock
                    this.generateEvent(99);                 // Every hour there is an 8% chance of a random event
                } 
            }
        }
    }

    //// MODAL CONTROL METHODS ////

    // Prints a welcome-to-the-game message the first time a player begins a game
    createNewGameModal = () => {
        const data: EventData | undefined = modalData.find((modal) => modal.id === "landfall");
        this.createModal(data);
    }

    // Prints a welcome-back modal when the player loads a saved file
    createLoadGameModal = (username: string) => {
        const text = `Welcome back, Commander ${username}!\n The colonists missed you.\nThey look up to you.`
        const data: EventData | undefined = modalData.find((modal) => modal.id === "load-game");
        if (data) {
            data.text = text;
            this.createModal(data);
        } else {
            console.log(`Warning: Event data not found for game loading greeting modal.`);
        }
    }

    // In-game event generator: produces scheduled and/or random events which will create modal popups
    generateEvent = (probability?: number) => {     // Probability is given optionally as a percent value
        if (probability) {
            const rand = Math.floor(Math.random() * 100);                   // Generate random value and express as a percent
            // Fire random event if it exceeds probability threshold and if no wait has already been initiated by another event (e.g. landing pod arrival)
            if (rand < probability && this.mouseContext !== "wait") {
                // If a random event occurs, fetch a random event from the server
                this.getRandomEvent(["good", 10], this.setRandomEvent);
                
                
            }
        } else {
            // If a non-random event is requested it happens here ("midnight" is a placeholder event in the meantime)
            const ev: EventData | undefined = modalData.find((modal) => modal.id === "midnight")
            this.createModal(ev);
        }
    }

    setRandomEvent = (ev: {karma: string, magnitude: number, data: EventData}) => {
        this._randomEvent = ev;
        if (ev !== undefined) {
            this.createModal(ev.data);       // Event occurs if given probability is higher than random value
        } else {
            console.log("ERROR: Random event data not returned from the server.")
        }
    }

    createModal = (data: EventData | undefined) => {
        if (data) {
            this.setGameOn(false);
            this._modal = new Modal(this._p5, this.closeModal, data);
            this.setMouseContext("modal");
        } else {
            console.log(`ERROR: Event data not found for modal creation.`);
        }      
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
                    case "add-resource":    // Adds a quantity of a single type of resource to one module
                        // Ensure outcome is properly formatted: index 1 = quantity, index 2 = resource name
                        if (typeof outcome[1] === "number" && outcome[2]) {
                            const resource: Resource = [outcome[2], outcome[1]];
                            const mod = this._infrastructure.findStorageModule(resource);   // Choose a module
                            if (mod) {
                                console.log(`ADDING ${resource[1]} ${resource[0]} to module ${mod._id}`);
                                // Keep track of resource delta to pass to economy display
                                const r = this._infrastructure.addResourcesToModule(mod._id, resource);
                                this._economy._data.updateOneResource([resource[0], r]);
                            } else {
                                console.log(`Warning: No module found to contain ${resource[0]}`);
                            }
                        } else {
                            console.log("ERROR: Incorrect outcome data format for 'add-resource' event resolution.")
                        }
                        break;
                    case "subtract-money":
                        if (typeof outcome[1] === "number") this._economy._data.subtractMoney(outcome[1]);
                        break;
                    case "subtract-resource":
                        // Ensure outcome is properly formatted: index 1 = quantity, index 2 = resource name
                        if (typeof outcome[1] === "number" && outcome[2]) {
                            const resource: Resource = [outcome[2], outcome[1]];
                            // Choose a module containing the resource (just pick the first one in the list for now)
                            const mods = this._infrastructure.findModulesWithResource(resource);
                            if (mods.length > 0) {
                                const mod = mods[0];
                                console.log(`SUBTRACTING ${resource[1]} ${resource[0]} from module ${mod._id}`);
                                const r = this._infrastructure.subtractResourceFromModule(mod._id, resource);
                                // Update economy display for the affected resource by SUBTRACTING the resource delta
                                this._economy._data.updateOneResource([resource[0], -r]);
                            } else {
                                console.log(`Warning: No module found to contain ${resource[0]}`);
                            }
                        } else {
                            console.log("ERROR: Incorrect outcome data format for 'subtract-resource' event resolution.")
                        }
                        break;
                    case "update-morale":   // Unlike the resource events, morale updates can be positive or negative
                        if (typeof outcome[1] === "number") {
                            this._population.updateColonistsMorale(outcome[1]);
                        } else {
                            console.log("ERROR: Incorrect outcome data format for 'update-morale' event resolution.")
                        }
                        break;
                    default:
                        console.log(`Warning: Unrecognized modal resolution code: ${outcome[0]}`);
                }
            })
        }
        // Clear modal data (and random event data?) and resume the game
        this._modal = null;
        this._randomEvent = null;   // NOTE: You might want to keep this data around so its karma/magnitude can influence the next random event!
        this.setGameOn(true);
    }

    //// RENDER METHODS ////

    // The general-purpose mouse-shadow rendering method
    renderMouseShadow = () => {
        if (this.selectedBuilding !== null) {
            this.renderBuildingShadow();
        } else if (this.mouseContext === "landing") {
            this.renderLandingPath();
        } else if (this.mouseContext === "inspect" || this.mouseContext === "resource") {
            this.renderInspectOrResourceTool();
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

    // For rendering the inspect tool OR the resource tool
    renderInspectOrResourceTool = () => {
        // Only render the Inspect Tool if mouse is over the map area (not the sidebar) and there is no modal
        if (this._p5.mouseX < constants.SCREEN_WIDTH - this._sidebar._width && !this._modal && this._mouseShadow) {
            let [x, y] = this.getMouseGridPosition(this._p5.mouseX, this._p5.mouseY);
            x = x * constants.BLOCK_WIDTH;
            y = y * constants.BLOCK_WIDTH;
            this._mouseShadow.render(this._p5, x, y, this._horizontalOffset);
        }
    }

    // Engine will render the highlight box around blocks if needed, as the Map's render is "below" most other in-game objects
    renderBlockHighlighting = (p5: P5) => {
        if (this._map._highlightedBlock) {
            const x = this._map._highlightedBlock._x * constants.BLOCK_WIDTH - this._horizontalOffset - 2;
            const y = this._map._highlightedBlock._y * constants.BLOCK_WIDTH - 2;
            p5.noFill();
            p5.strokeWeight(4);
            p5.stroke(constants.GREEN_TERMINAL);
            p5.rect(x, y, constants.BLOCK_WIDTH + 4, constants.BLOCK_WIDTH + 4, 4, 4, 4, 4)
        } else {
            console.log("Error: Cannot highlight block - block data not found.");
        }
    }

    render = () => {
        this.advanceClock();        // Always try to advance the clock; it will halt itself if the game is paused
        if (this.mouseContext === "wait") {
            this.advanceWaitTime();
        }
        const p5 = this._p5;
        this._sky.render(this._p5, this._daytime);    // Sky colour changes based on day/night cycle (and eventually... weather?!)
        this.renderMouseShadow();                               // Render mouse shadow first
        if (this._animation) {
            this._animation.render(p5, this._horizontalOffset);     // Render animation second
        }
        this._map.render(p5, this._horizontalOffset);               // Render map third
        this._infrastructure.render(this._p5, this._horizontalOffset);    // Render infrastructure fourth
        if (this.selectedBuilding && !this._infrastructure._data.isModule(this.selectedBuilding)) {
            this.renderMouseShadow(); // If placing a connector, render mouse shadow above the infra layer
        }
        this._economy.render();
        this._industry.render(p5, this._horizontalOffset);
        this._population.render(this._p5, this._horizontalOffset, this.ticksPerMinute, this.gameOn);
        this.handleMouseScroll();   // Every frame, check for mouse scrolling
        // Don't render sidebar until the player has chosen a landing site
        if (this._hasLanded) {
            this._sidebar.render(this._gameTime.minute, this._gameTime.hour, this._gameTime.cycle);
        }
        if (this.mouseContext === "inspect" || this.mouseContext === "resource") {
            this.renderMouseShadow();
        }
        if (this._modal) {
            this._modal.render();
        }
        p5.fill(constants.GREEN_TERMINAL);
        if (this._map._highlightedBlock) {
            this.renderBlockHighlighting(p5);
        }
        // p5.text(`Sunlight: ${this._sunlight}`, 120, 300);
    }
}