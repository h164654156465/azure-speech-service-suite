'use strict';

// Exchange subscription key for access token
const getToken = async () => {
    let res = await fetch('/token')
    let token = await res.text();

    return token;
}

// Get subscription region
const getRegion = async () => {
    let res = await fetch('/sub-region')
    let subRegion = await res.text();

    return subRegion;
}

export { getToken, getRegion };