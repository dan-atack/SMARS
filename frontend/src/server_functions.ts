// Proof-of-concept server interaction:
export const signalServer = () => {
    fetch("http://localhost:7000/api/test", {
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