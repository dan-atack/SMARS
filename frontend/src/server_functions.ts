import { constants } from "./constants";
import { SaveInfo } from "./saveGame";
import { SaveSummary } from "./loadGame";

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
    buildCosts: { money: number }         // Just a simple object for now, but more keys can be added in future
    maintenanceCosts: Object[]    // Same idea as above
    storageCapacity: Object[]     // Once again, the amount of each type of resource (if any) that can be stored in this module
    crewCapacity: number    // How many humans can fit into a phone booth??
    shapes: {
        shape: string,          // Options are "rect", "quad", "triangle", "ellipse" and "arc"
        color: string,          // Hex codes only, please
        params: number[]        // The arguments for creating the shape - Values are all in terms of GRID SPACES, not pixels!!
        mode?: string           // For optional non-numeric arguments to arc shapes
    }[]
}

export type ConnectorInfo = {
    name: string            // Name of the connector; First Letters Capitalized
    type: string            // Feed this into Engine switch case  - again, ALL IN LOWERCASE!!!
    resourcesCarried: string[]    // Which kinds of things can flow through this connector
    maxFlowRate: number     // Maximum amount of transferrable resource (including people) that can pass per unit of time
    buildCosts: { money: number }         // For connectors, this is the price for one unit of length
    maintenanceCosts: Object[]  // Ditto
    vertical: boolean       // Can this go up/down? Ladders can, rails cannot.
    horizontal: boolean     // Can this go from side to side? Rails can, but elevators cannot (some things can do both)
    width: number           // We'll keep this at 1 for most of the basic connectors, but later ones may need to be thicker
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

// Returns an individual structure, based on the category, type and name... And the list of coordinates, since this will be passed directly to the Infrastructure function that will actually re-produce the buildings. It's weird, but it works!
export const getOneModule = (setter: (selectedBuilding: ModuleInfo, locations: number[][]) => void, category: string, type: string, name: string, locations: number[][]) => {

    const url = `${constants.URL_PREFIX}/${category}/${type}/${name}`;

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
        setter(response.data, locations);
    })
}

export const getOneConnector = (setter: (selectedConnector: ConnectorInfo, locations: number[][]) => void, category: string, type: string, name: string, locations: number[][]) => {

    const url = `${constants.URL_PREFIX}/${category}/${type}/${name}`;

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
        setter(response.data, locations);
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

export const sendSaveGame = (saveInfo: SaveInfo, setter: (status: boolean) => void) => {
    const url = `${constants.URL_PREFIX}/save`;
    
    fetch(url, {
        method: "POST",
        body: JSON.stringify(saveInfo),
        headers: {
            Accept: "application/json",
            'Content-Type': "application/json",
        }
    })
    .then((res) => {
        return res.json();
    })
    // We really should return the response to the Save Game screen to be displayed in the game's interface
    .then((response) => setter(response));
}

// Send a GET request with the current user's username as a req parameter, to fetch all saved game files associated with that user
export const getSavedGames = (username: string, setter: (saves: SaveSummary[]) => void) => {
    const url = `${constants.URL_PREFIX}/load-games/${username}`;

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
        setter(response.saves);
    })
}

export const loadGameData = (game_id: string, setter: (saveInfo: SaveInfo) => void) => {
    const url = `${constants.URL_PREFIX}/load/${game_id}`;

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

export const addition = (x: number, y: number) => {
    return (x + y);
}