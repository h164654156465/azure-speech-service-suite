'use strict';

const getToken = async () => {
    let res = await fetch('/token')
    let token = await res.text();

    return token;
}

const getRegion = async () => {
    let res = await fetch('/sub-region')
    let subRegion = await res.text();

    return subRegion;
}

export { getToken, getRegion };