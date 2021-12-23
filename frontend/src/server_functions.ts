import { constants } from "./constants";

// Request body custom types:

// Standardize expectation for what a login (or signup) request body should contain:
type LoginObject = {
    username: string,
    password: string
}

export const sendLoginRequest = (loginRequest: LoginObject, setter: (status: number) => void) => {
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
        console.log(response.status);
        setter(response.status);
    })
}

export const sendSignupRequest = (signupRequest: LoginObject, setter: (status: number) => void) => {
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
        setter(response.status);
    })
}