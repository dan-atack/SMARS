import { constants } from "./constants";

// Request body custom types:

// Standardize expectation for what a login (or signup) request body should contain:
type LoginObject = {
    username: string,
    password: string
}

// Now-deprecated test function: to be commented out once login and signup functions are operational
export const signalServer = () => {
    const url = `${constants.URL_PREFIX}/test`;
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
        console.log(response.data);
    })
}

export const sendLoginRequest = (loginRequest: LoginObject) => {
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
        console.log(response);
    })
}

export const sendSignupRequest = (signupRequest: LoginObject) => {
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
        console.log(response);
    })
}