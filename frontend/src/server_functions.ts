import { constants } from "./constants";

// Request body custom types:

// Standardize expectation for what a login (or signup) request body should contain:
type LoginObject = {
    username: string,
    password: string
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

// Send a GET request with the current user's username as a req parameter, to fetch all saved game files associated with that user
export const getSavedGames = (username: string) => {
    console.log(`Getting saved game data for ${username}`);
}
