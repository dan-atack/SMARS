import { constants } from "./constants";
import Button from "../src/button";

// Request body custom types:

// Standardize expectation for what a login (or signup) request body should contain:
type LoginObject = {
    username: string,
    password: string
}

// Standardize expectations for fetches to building options database collections (for a good time, sync with World Editor files)
export type ModuleInfo = {
    name: string            // Unique name of the module; First Letters Capitalized
    width: number           // Width in blocks, not pixels
    height: number          // ditto
    type: string            // Type name will feed into Engine switch case; type names are all LOWERCASE (UNLIKE THESE LETTERS)
    pressurized: boolean    // Give dees people eaaair!
    columnStrength: number  // How many more modules can fit on top of each column of this structure
    durability: number      // Basically hitpoints
    buildCosts: Object[]         // List of simple objects, e.g. {minerals: 10}, {money: 100}, etc.
    maintenanceCosts: Object[]    // Same idea as above
    storageCapacity: Object[]     // Once again, the amount of each type of resource (if any) that can be stored in this module
    crewCapacity: number    // How many humans can fit into a phone booth??
    // TODO: SHAPES!
}

export type ConnectorInfo = {
    name: string            // Name of the connector; First Letters Capitalized
    type: string            // Feed this into Engine switch case  - again, ALL IN LOWERCASE!!!
    resourcesCarried: string[]    // Which kinds of things can flow through this connector
    maxFlowRate: number     // Maximum amount of transferrable resource (including people) that can pass per unit of time
    buildCosts: Object[]    // List of simple objects, e.g. {minerals: 10}, {money: 100}, etc.
    maintenanceCosts: Object[]  // Ditto
    vertical: boolean       // Can this go up/down? Ladders can, rails cannot.
    horizontal: boolean     // Can this go from side to side? Air ducts can, elevators cannot.
    // TODO: WIDTH!
}

// Send login request with req body consisting of a username and password to the game's server
export const sendLoginRequest = (loginRequest: LoginObject, setter: (status: number, username?: string) => void) => {
    const url = `${constants.URL_PREFIX}/login`;
    fetch(url, {
        method: "POST",
        body: JSON.stringify(loginRequest),
        headers: {
            Accept: "application/json",
            'Content-Type': "application/json",
        }
    })
    .then((res) => {
        return res.json();
    })
    .then((response) => {
        if (response.username) {
            setter(response.status, response.username)  // Send the status and the username if the login is successful
        } else {
            setter(response.status);    // Otherwise just send status code
        }
    })
}

// Send sign-up request with req body consisting of a username and password to the game's server
export const sendSignupRequest = (signupRequest: LoginObject, setter: (status: number, username?: string) => void) => {
    const url = `${constants.URL_PREFIX}/signup`;
    fetch(url, {
        method: "POST",
        body: JSON.stringify(signupRequest),
        headers: {
            Accept: "application/json",
            'Content-Type': "application/json",
        }
    })
    .then((res) => {
        return res.json();
    })
    .then((response) => {
        if (response.username) {
            setter(response.status, response.username)  // Send the status and the username if the login is successful
        } else {
            setter(response.status);    // Otherwise just send status code
        }
    })
}

// Send a map type as part of the request parameters to get back a map of that type
export const getMap = (mapType: string, setter: (terrain: number[][]) => void) => {
    const url = `${constants.URL_PREFIX}/maps/${mapType}`;
    fetch(url, {
        method: "GET",
        headers: {
            Accept: "application/json",
            'Content-Type': "application/json",
        }
    })
    .then((res) => {
        return res.json();
    })
    .then((response) => {
        setter(response.mapInfo.terrain);
    })
}

// Category = either 'modules' or 'connectors' and type = string name of the type of new structure (e.g. transport, power, etc.)
export const getStructures = (setter: (options: ModuleInfo[] | ConnectorInfo[]) => void, category: string, type: string) => {
    
    const url = `${constants.URL_PREFIX}/${category}/${type}`;
    
    fetch(url, {
        method: "GET",
        headers: {
            Accept: "application/json",
            'Content-Type': "application/json",
        }
    })
    .then((res) => {
        return res.json();
    })
    .then((response) => {
        setter(response.data);
    })
}

// Gets just the list of structure TYPES, which are strings, and sets the detailsArea's typeOptions list:
export const getStructureTypes = (setter: (options: string[]) => void, category: string) => {

    const url = `${constants.URL_PREFIX}/${category}`;
    
    fetch(url, {
        method: "GET",
        headers: {
            Accept: "application/json",
            'Content-Type': "application/json",
        }
    })
    .then((res) => {
        return res.json();
    })
    .then((response) => {
        setter(response.data);
    })
}

// Send a GET request with the current user's username as a req parameter, to fetch all saved game files associated with that user
export const getSavedGames = (username: string) => {
    console.log(`Getting saved game data for ${username}`);
}

export const addition = (x: number, y: number) => {
    return (x + y);
}