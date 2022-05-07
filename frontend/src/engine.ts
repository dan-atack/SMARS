// Top-level component for the game environment (as opposed to game interface, which is in game.ts)
import P5 from "p5";
import * as dotenv from "dotenv";
import View from "./view";
import Sidebar from "./sidebar";
import Map from "./map";
import Infrastructure from "./infrastructure";
import Economy, { Resources } from "./economy";
import Population from "./population";
import Modal, { EventData } from "./modal";
import { ModuleInfo, ConnectorInfo, getOneModule, getOneConnector } from "./server_functions";
import { constants } from "./constants";
import { SaveInfo, GameTime } from "./saveGame";
import { GameData } from "./newGameSetup";

// TODO: Load Environment variables
if (process.env.ENVIRONMENT) console.log(process.env.ENVIRONMENT);


export default class Engine extends View {
    // Engine types
    _sidebar: Sidebar;
    _sidebarExtended: boolean;
    _gameData: GameData | null  // Data object for a new game
    _saveInfo: SaveInfo | null  // Data object for a saved game
    _map: Map;
    _infrastructure: Infrastructure;
    _economy: Economy;
    _population: Population;
    _modal: Modal | null;
    // Map scrolling control
    _horizontalOffset: number;  // This will be used to offset all elements in the game's world, starting with the map
    _scrollDistance: number;    // Pixels from the edge of the world area in which scrolling occurs
    _scrollingLeft: boolean;    // Flags for whether the user is currently engaged in scrolling one way or the other
    _scrollingRight: boolean;
    // Mouse click control
    mouseContext: string;       // Mouse context tells the Engine's click handler what to do when the mouse is pressed.
    selectedBuilding: ModuleInfo | ConnectorInfo | null;    // Data storage for when the user is about to place a new structure
    selectedBuildingCategory: string    // String name of the selected building category (if any)
    // In-game time control
    gameOn: boolean;            // If the game is on then the time ticker advances; if not it doesn't
    _tick: number;
    _gameTime: GameTime;            // The Game's time can now be stored as a GameTime-type object.
    ticksPerMinute: number;
    _minutesPerHour: number;
    _hoursPerClockCycle: number;    // One day = two trips around the clock
    _solsPerYear: number;
    switchScreen: (switchTo: string) => void;   // App-level SCREEN switcher (passed down via drill from the app)
    updateEarthData: () => void;    // Updater for the date on Earth (for starters)
    getModuleInfo: (setter: (selectedBuilding: ModuleInfo, locations: number[][]) => void, category: string, type: string, name: string, locations: number[][]) => void;        // Getter function for loading individual structure data from the backend
    getConnectorInfo: (setter: (selectedConnector: ConnectorInfo, locations: number[][]) => void, category: string, type: string, name: string, locations: number[][]) => void;

    constructor(p5: P5, switchScreen: (switchTo: string) => void, changeView: (newView: string) => void, updateEarthData: () => void) {
        super(p5, changeView);
        this.switchScreen = switchScreen;
        this.updateEarthData = updateEarthData;
        this.getModuleInfo = getOneModule;
        this.getConnectorInfo = getOneConnector;
        this._sidebar = new Sidebar(p5, this.switchScreen, this.changeView, this.setMouseContext, this.setGameSpeed);
        this._sidebarExtended = true;   // Side bar can be partially hidden to expand map view - should this be here or in the SB itself??
        this._gameData = null;
        this._saveInfo = null;  // Saved game info is loaded from the Game module when it callse the setupSavedGame method
        this._map = new Map(this._p5);
        this._infrastructure = new Infrastructure(p5);
        this._economy = new Economy(p5);
        this._population = new Population(p5);
        this._modal = null;
        this._horizontalOffset = 0;
        this._scrollDistance = 50;
        this._scrollingLeft = false;
        this._scrollingRight = false;
        this.mouseContext = "select"    // Default mouse context is the user wants to select what they click on (if they click on the map)
        this.selectedBuilding = null;   // There is no building info selected by default.
        this.selectedBuildingCategory = "";  // Keep track of whether the selected building is a module or connector
        // Time-keeping:
        // TODO: Make the clock its own component, to de-clutter the Engine.
        this.gameOn = true;             // By default the game is on when the Engine starts
        this._tick = 0;
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
    }

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
        this._economy.setResources(this._gameData.startingResources);
        this._horizontalOffset = this._map._maxOffset / 2;   // Put player in the middle of the map to start out
        this._infrastructure.setup(this._horizontalOffset);
        // Add two new colonists
        this._population.addColonist(Math.floor(this._horizontalOffset / constants.BLOCK_WIDTH), 20);
        this._population.addColonist(Math.floor(this._horizontalOffset / constants.BLOCK_WIDTH) + 22, 20);
    }

    setupSavedGame = (saveInfo: SaveInfo) => {
        this._saveInfo = saveInfo;
        this.setClock(saveInfo.game_time);
        this._map.setup(this._saveInfo.terrain);
        this._economy.setResources(saveInfo.resources);
        this._horizontalOffset = this._map._maxOffset / 2;
        this._infrastructure.setup(this._horizontalOffset);
        this._population.loadColonistData(saveInfo.colonists);
        this.loadModulesFromSave(saveInfo.modules);
        this.loadConnectorsFromSave(saveInfo.connectors);
        // Check if game has colonist data and if it doesn't, render an alternate welcome back message
        if (!saveInfo.colonists) {
            this.createLoadGameModal(saveInfo.username, true);
            // Add one colonist if the save file has no colonist data
            console.log("Adding two colonists.");
            if (this._saveInfo.modules.length > 0) {
                const { x, y } = this._saveInfo.modules[0];
                // this._population.addColonist(x - 2, y - 1);
                this._population.addColonist(x - 2, y - 4);
                this._population.addColonist(x + 2, y - 4);
            } else {
                this._population.addColonist(Math.floor(this._horizontalOffset / constants.BLOCK_WIDTH), 20);
                this._population.addColonist(Math.floor(this._horizontalOffset / constants.BLOCK_WIDTH + 2), 20);
            }
        } else {
            this.createLoadGameModal(saveInfo.username, false);
        }
    }

    // Top-level saved module importer
    loadModulesFromSave = (modules: {name: string, type?: string, x: number, y: number}[]) => {
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
            // For each name (type) of module, get all the coordinates for all instances of that module, then re-populate them
            modTypes.forEach((mT) => {
                const mods = modules.filter((mod) => mod.name === mT);
                const modType = mods[0].type != undefined ? mods[0].type : "test";
                let coords: number[][] = [];
                mods.forEach((mod) => {
                    coords.push([mod.x, mod.y]);
                })
                this.getModuleInfo(this.loadModuleFromSave, "modules", modType, mT, coords);
            })
        }  
    }

    // Called by the above method, this will actually use the data from the backend to re-create loaded modules
    loadModuleFromSave = (selectedBuilding: ModuleInfo, locations: number[][]) => {
        if (selectedBuilding != null) {
            locations.forEach((space) => {
                this._infrastructure.addModule(space[0], space[1], selectedBuilding)
            })
        }
    }

    // Top-level saved module importer
    loadConnectorsFromSave = (connectors: {name: string, type?: string, x: number, y: number}[]) => {
        // Only operate if there actually are modules to load:
        if (connectors.length > 0) {
            // Sort the list by name to avoid over-calling the backend to get module data
            connectors.sort(function(a, b){
                if (a.name < b.name) { return -1; }
                if (a.name > b.name) { return 1; }
                return 0;
            })
            // Separate modules by name
            let conTypes: string[] = [];
            connectors.forEach((con) => {
                if (!conTypes.includes(con.name)) {
                    conTypes.push(con.name)
                }
            });
            // For each name (type) of module, get all the coordinates for all instances of that module, then re-populate them
            conTypes.forEach((cT) => {
                const cons = connectors.filter((con) => con.name === cT);
                const conType = cons[0].type != undefined ? cons[0].type : "test";
                let coords: number[][] = [];
                cons.forEach((con) => {
                    coords.push([con.x, con.y]);
                })
                this.getConnectorInfo(this.loadConnectorFromSave, "connectors", conType, cT, coords);
            })
        }  
    }

    loadConnectorFromSave = (selectedConnector: ConnectorInfo, locations: number[][]) => {
        if (selectedConnector != null) {
            locations.forEach((space) => {
                this._infrastructure.addConnector(space[0], space[1], selectedConnector);
            })
        }
    }

    handleClicks = (mouseX: number, mouseY: number) => {
        // Since the 'click' event occurs on the mouseup part of the button press, a click always signals the end of any scrolling:
        this._scrollingRight = false;
        this._scrollingLeft = false;
        // Click is in sidebar (not valid if modal is open):
        if (mouseX > constants.SCREEN_WIDTH - this._sidebar._width && !this._modal) {
            this._sidebar.handleClicks(mouseX, mouseY);
        } else {
            // Click is on the map, between the scroll zones
            switch (this.mouseContext) {
                case "select":
                    console.log("Select");
                    break;
                case "place":
                    console.log("Place");
                    this.handleStructurePlacement(mouseX, mouseY);
                    break;
                case "resource":
                    console.log("Resource");
                    break;
                case "modal":
                    this._modal?.handleClicks(mouseX, mouseY);
                    break;
            }
            this.getMouseGridPosition(mouseX, mouseY);
        }
    }

    // Handler for when the mouse button is being held down (for scrolling))
    handleMouseDown = (mouseX: number, mouseY: number) => {
        // Do not allow scrolling when modal is opened or during building placement
        if (!this._modal && !(this.mouseContext === 'place')) {
            if (!(mouseX > constants.SCREEN_WIDTH - this._sidebar._width)) {    // Do not allow scrolling from the sidebar
                if (mouseX < this._scrollDistance) {
                    this._scrollingLeft = true;
                } else if (mouseX > constants.WORLD_VIEW_WIDTH - this._scrollDistance) {
                    this._scrollingRight = true;
                }
            } 
        } 
    }

    // Given to various sub-components, this dictates how the mouse will behave when clicked in different situations
    setMouseContext = (value: string) => {
        this.mouseContext = value;
        this.setSelectedBuilding(this._sidebar._detailsArea._buildingSelection);
    }

    setSelectedBuilding = (selectedBuilding: ModuleInfo | ConnectorInfo | null) => {
        this.selectedBuilding = selectedBuilding;
    }

    // Used for placing buildings and anything else that needs to 'snap to' the grid (returns values in grid locations)
    getMouseGridPosition(mouseX: number, mouseY: number) {
        const mouseGridX = Math.floor(mouseX / constants.BLOCK_WIDTH)
        const mouseGridY = Math.floor(mouseY / constants.BLOCK_WIDTH)
        const horizontalOffGridValue = Math.floor(this._horizontalOffset / constants.BLOCK_WIDTH);
        const gridX = mouseGridX + horizontalOffGridValue;
        const gridY = mouseGridY;
        // TODO: ADD vertical offset calculation
        // Return coordinates as a tuple:
        return [gridX, gridY];
    }

    handleStructurePlacement = (mouseX: number, mouseY: number) => {
        const [x, y] = this.getMouseGridPosition(mouseX, mouseY);
        if (this.selectedBuilding != null) {
            const affordable = this._economy.checkResources(this.selectedBuilding.buildCosts);
            if (this._infrastructure.isModule(this.selectedBuilding)) {
                const clear = this._infrastructure.checkModulePlacement(x, y, this.selectedBuilding, this._map._mapData);
                if (clear && affordable) {
                    this._infrastructure.addModule(x, y, this.selectedBuilding);
                    this._economy.subtractMoney(this.selectedBuilding.buildCosts);
                } else {
                    console.log(`Clear: ${clear}`);
                    console.log(`Affordable: ${affordable}`);
                }
            } else {    // For connector placement
                if (affordable) {
                    this._infrastructure.addConnector(x, y, this.selectedBuilding);
                    this._economy.subtractMoney(this.selectedBuilding.buildCosts);
                }
            }
        }
    }

    handleResourceConsumption = () => {
        const leakage = this._infrastructure.calculateModulesOxygenLoss();
        const { air, water, food } = this._population.calculatePopulationResourceConsumption(this._gameTime.hour);
        this._economy.updateResource("oxygen", air + leakage);
        this._economy.updateResource("water", water);
        this._economy.updateResource("food", food);
    }

    setGameSpeed = (value: string) => {
        this.gameOn = true;     // Always start by assuming the game is on
        switch (value) {
            case "pause":
                this.gameOn = false;
                break;
            case "slow":
                this.ticksPerMinute = 60;
                break;
            case "fast":
                this.ticksPerMinute = 20;
                break;
            case "blazing":
                this.ticksPerMinute = 1;    // Ultra fast mode in dev mode?!
                break;
        }
    }

    // Prints a welcome-back modal when the player loads a saved file. Updates means the game has been updated since the save
    createLoadGameModal = (username: string, updates: boolean) => {
        const messageUpdates: string = `Welcome back, Commander ${username}! While you\nwere away there may have been a few changes made\nhere and there, but your save data is like, totally safe.\nLike, Nintety... eight percent guaranteed it's all there.`;
        const messageNoUpdates: string = `Welcome back, Commander ${username}!\n The colonists missed you.\nThey look up to you.`;
        const data = {
            id: 1,
            title: "You're back!!!",
            text: updates ? messageUpdates : messageNoUpdates,
            resolutions: [
                updates ? "I like those odds!" : "The feeling is mutual."
            ]
        }
        this.createModal(false, data);
    }

    // In-game event generator: produces scheduled and/or random events which will create modal popups
    generateEvent = (probability?: number) => {     // Probability is given optionally as a percent value
        const example: EventData = {
            id: 0,
            title: "It's a new day on SMARS",
            text: "What a difference... a Sol makes,\n Twenty-four-and-a-half little hours,\nnot much sun, and no flowers (yet)\nnor yet any rain...",
            resolutions: [
                "How time flies!"
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

    closeModal = () => {
        this.gameOn = true;
        this._modal = null;
        // Reset mouse context to 'select' unless a building has been selected for construction:
        if (this.selectedBuilding) {
            this.setMouseContext("place");
        } else {
            this.setMouseContext("select");
        }
    }

    // Sets the Smartian time
    setClock = (gameTime: GameTime) => {
        this._gameTime = gameTime;
    }

    advanceClock = () => {
        if (this.gameOn) {
            this._tick++;
            if (this._tick >= this.ticksPerMinute) {
                this._tick = 0;     // Advance minutes
                // Update colonists' locations each 'minute', and all of their other stats every hour
                this._population.updateColonists(this._map._mapData, this._gameTime.minute === 0);
                if (this._gameTime.minute < this._minutesPerHour - 1) {  // Minus one tells the minutes counter to reset to zero after 59
                    this._gameTime.minute ++;
                } else {
                    this._gameTime.minute = 0;   // Advance hours (anything on an hourly schedule should go here)
                    this.handleResourceConsumption();
                    this.updateEarthData();     // Advance Earth date every game hour
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

    // For building placement
    renderBuildingShadow = () => {
        const p5 = this._p5;
        // Only render the building shadow if mouse is over the map area (not the sidebar)
        if (p5.mouseX < constants.SCREEN_WIDTH - this._sidebar._width && !this._modal) {
            let [x, y] = this.getMouseGridPosition(p5.mouseX, p5.mouseY);
            x = x * constants.BLOCK_WIDTH - this._horizontalOffset;
            y = y * constants.BLOCK_WIDTH;
            if (this.selectedBuilding !== null) {
                if (this._infrastructure.isModule(this.selectedBuilding)) {
                    const w = this.selectedBuilding.width * constants.BLOCK_WIDTH;
                    const h = this.selectedBuilding.height * constants.BLOCK_WIDTH;
                    p5.rect(x, y, w, h);
                } else {
                    p5.rect(x, y, constants.BLOCK_WIDTH, constants.BLOCK_WIDTH);
                }
            }
        }        
    }

    render = () => {
        // Scroll over 1 pixel per refresh cycle if mouse is pressed and the game is not yet at the right or left edge of the map:
        if (this._scrollingLeft && this._horizontalOffset > 0) {
            this._horizontalOffset --;
        } else if (this._scrollingRight && this._horizontalOffset < this._map._maxOffset){
            this._horizontalOffset ++;
        }
        this.advanceClock();
        const p5 = this._p5;
        p5.background(constants.APP_BACKGROUND);
        p5. fill(constants.GREEN_TERMINAL);
        this._map.render(this._horizontalOffset);
        this._infrastructure.render(this._horizontalOffset);
        this._economy.render();
        this._population.render(this._horizontalOffset, this.ticksPerMinute, this.gameOn);
        this._sidebar.render(this._gameTime.minute, this._gameTime.hour, this._gameTime.cycle);
        // Mouse pointer is shadow of selected building, to help with building placement:
        if (this.selectedBuilding !== null) {
            this.renderBuildingShadow();
        }
        if (this._modal) {
            this._modal.render();
        }
    }

}