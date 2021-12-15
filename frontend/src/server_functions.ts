// Proof-of-concept server interaction:
import { constants } from "./constants";

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