const axios = require('axios');
const { liveramp } = require('../../../config');
const qs = require('qs');
const fs = require('fs');
// const log = require('../../../logger'); //TODO: Fix this

// Documentation Link:
// https://developers.liveramp.com/datamarketplace-buyer-api/reference


// get liveramp access token
const getAccessToken = async() => {
    console.log('get access token called')
    try {
        const url = liveramp.tokenURI;
        const data = qs.stringify({
            grant_type: 'password',
            username:liveramp.accountID,
            password:liveramp.secretKey,
            client_id: liveramp.clientID,
            response_type: 'token',
            scope: 'openid',
        });
        const response = await axios({
            method: 'POST',
            headers: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            url: url,
            data: data
        });
        const lrcd = {...response.data, exptime : Date.now() + (response.data.expires_in * 1000)};
        fs.writeFileSync('lrcred.json', JSON.stringify(lrcd));
        return lrcd;
    } catch (error) {
        console.log('getAccessToken error:', error);
        // log.error(error);
    }
}

// common function to make axios request to given endpoint with bearer token
const makeRequest = async(endpoint, method, data, queryParams) => {
    try {
        let lrcd = fs.existsSync('lrcred.json')? JSON.parse(fs.readFileSync('lrcred.json')) : await getAccessToken();
        if (lrcd.exptime < Date.now()|| !lrcd.access_token) {
            console.log('token expired/unavailable requesting new token...');
            lrcd = await getAccessToken();
        }
        const url = `${liveramp.apiURI}${endpoint}`;
        const options = method!=="POST" ? {
            method: method,
            headers: {
                'content-type': 'application/json',
                'Authorization': `Bearer ${lrcd.access_token}`,
                'LR-Org-Id': liveramp.ownerOrg,
            },
            url: url,
            params: queryParams
        }
        : {
            method: method,
            headers: {
                'content-type': 'application/json',
                'Authorization': `Bearer ${lrcd.access_token}`,
                'LR-Org-Id': liveramp.ownerOrg,
            },
            url: url,
            data: data,
            params: queryParams
        };
        const response = await axios(options);
        return response.data;
    }
    catch (error) {
        console.log('makeRequest error:', error);
        // log.error(error);
    }
}


// list all segments '/v2/segments'
const getAllSegmentsLR = async (after=null, limit=10, advertiserName=null) =>{ //limit(1-100)
    const endpoint = '/v2/segments';
    console.log('getAllSegmentsLR called');
    const response = await makeRequest(endpoint, 'GET', null, {limit, after, advertiserName}).then(response => {
        // fs.writeFileSync('getAllSegments.json', JSON.stringify(response));
        return response;
    }
    ).catch(error => {
        console.log('getAllSegments error:', error);
    }
    );
    return response;
}

// get details of particular segment '/v2/segments/{v2SegmentsId}/details'
const getParticularSegmentLR = async (segmentId) =>{ 
    const endpoint = `/v2/segments/${segmentId}/details`;
    const response = await makeRequest(endpoint, 'GET').then(response => {
        // fs.writeFileSync('particularSegment.json', JSON.stringify(response));
        return response;
    }
    ).catch(error => {
        console.log('getParticularSegment error:', error);
    }
    );
    return response
}

// get segment updates since a particular timestamp(max 90 days) '/v1/segment-updates'
const getSegmentUpdatesLR = async (since, limit=10, after=null) =>{ 
    const endpoint = `/v1/segment-updates`;
    const response = await makeRequest(endpoint, 'GET', null, {limit, after, since}).then(response => {
        // fs.writeFileSync('segmentUpdates.json', JSON.stringify(response));
        return response;
    }
    ).catch(error => {
        console.log('getSegmentUpdates error:', error);
    }
    );
    return response
}

// get a list of all available destinations '/v2/destinations'
const getAllAvailableDestinationsLR = async() =>{ 
    const endpoint = `/v2/destinations`;
    const response = await makeRequest(endpoint, 'GET').then(response => {
        // fs.writeFileSync('destinations.json', JSON.stringify(response));
        return response
    }
    ).catch(error => {
        console.log('getAllAvailableDestinations error:', error);
    }
    );
    return response
}

// START/STOP a segment distribution '/v2/segments/{v2SegmentsId}/start'
// TODO: make entry into db everytime a new segment starts distributing
const startStopDistributionLR = async (segmentIds, action, destinationId=liveramp.destinationId) =>{ 
    const endpoint = `v2/distribute-segments`;
    action = action.toUpperCase();
    const response = await makeRequest(endpoint, 'POST', {segmentIds, destinationId, action}).then(response => {
        // fs.writeFileSync('distribution.json', JSON.stringify(response));
        return response;
    }
    ).catch(error => {
        console.log('getAllAvailableDestinations error:', error);
    }
    );
    return response;
}

// get list of the segments that have been requested to be distributed to a particular destination, along with each segment’s delivery status.
const getDeliveryStatusLR = async (destinationId) =>{ 
    const endpoint = `/v2/destinations/${destinationId}/delivery-statuses`;
    const response = await makeRequest(endpoint, 'GET').then(response => {
        // fs.writeFileSync('deliverystatus.json', JSON.stringify(response));
        return response;
    }
    ).catch(error => {
        console.log('getAllAvailableDestinations error:', error);
    }
    );
    return response;
}

module.exports = {
    getAllSegmentsLR,
    getParticularSegmentLR,
    getSegmentUpdatesLR,
    getAllAvailableDestinationsLR,
    startStopDistributionLR,
    getDeliveryStatusLR
}