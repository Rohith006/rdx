import axios from 'axios'
import moment from 'moment';

import {geoEdgeAccessToken} from '../../config';
import log from '../../logger';
import {campaign as Campaign} from '../models'
import {getGeoEdgeLocationCode} from './geoEdgeLocations';

// import { logger } from'../../../../logger';

const scanTimesPerDay = 6 // possible values: 1, 2, 3, 4, 6, 8, 12, 24, 48, 72, 96, 120, 144, 168, 192, 216, 240, 480, 720

const scanTypes = {
    TrackAds:1,
    TrackLandingPage:2,
    TrackVASTXML:3,
    RTBResponse:5,
    XMLFeed:8
}

const autoScan = {
    enable: 1,
    disable: 0
}


const prepareCodedLocationArray = (locations) => {
    const codedLocations = ["IN", "AE"]
    if(locations){
        locations.forEach(location => {
            const locationCode = getGeoEdgeLocationCode(location)
            if(locationCode&&(!codedLocations.includes(locationCode))){
                codedLocations.push(locationCode)
            }
        })
    }
    return `${codedLocations.join()}`;
}

const prepareAdObj = (campaignInfo, newCampaign) => {
    const {id, monetizationType, campaignName, trackingUrl, topLevelDomain, creatives, geography} = campaignInfo;
    let adObj;

    const dTStamp = moment().format('DDMMYYYY-HHmmss')

    log.info(`campaign Info: ${JSON.stringify(campaignInfo)}`)

    if(monetizationType==='BANNER'){
        log.info('sendForAdQualityCheck adtype: banner')
        const allCreatives = Object.values(creatives);
        adObj = allCreatives.map(creative=>{
            return {
                name: `${newCampaign?'':'UPD['+dTStamp+']-'}${campaignName}-BANNER-${creative.id}`,
                tag: `<img src='${String(creative.url).replace(/\s+/g, "%20")}' />`,
                auto_scan: autoScan.enable,
                scan_type: scanTypes.TrackAds,
                locations: prepareCodedLocationArray(geography),
                demand_id: id,
                demand_name: campaignName,
                demand_creative_id: creative.id,
                times_per_day: scanTimesPerDay,
                top_urls: [topLevelDomain]
            }
        })
        const landingPage = {
            name: `${newCampaign?'':'UPD['+dTStamp+']-'}${campaignName}-BANNER-LP`,
            tag: trackingUrl,
            auto_scan: autoScan.enable,
            scan_type: scanTypes.TrackLandingPage,
            locations: prepareCodedLocationArray(geography),
            demand_id: id,
            demand_name: campaignName,
            demand_creative_id: trackingUrl,
            times_per_day: scanTimesPerDay,
            top_urls: [topLevelDomain]
        }
        adObj.push(landingPage)
        log.info(`adObj banner: ${JSON.stringify(adObj)}`)
        return adObj;
    }
    if(monetizationType==='NATIVE'){
        log.info('sendForAdQualityCheck adtype: native')
        let finalAdTag = []
        const imageAdTag = {
            name: `${newCampaign?'':'UPD['+dTStamp+']-'}${campaignName}-NATIVE-IMAGE`,
            tag: `<img src='${String(creatives.mainImageCreativeUrl).replace(/\s+/g, "%20")}' />`,
            auto_scan: autoScan.enable,
            scan_type: scanTypes.TrackAds,
            locations: prepareCodedLocationArray(geography),
            demand_id: id,
            demand_name: campaignName,
            demand_creative_id: creatives.id,
            times_per_day: scanTimesPerDay,
            top_urls: [topLevelDomain]
        }
        finalAdTag.push(imageAdTag);
        if(creatives.iconImageCreativeUrl){
            const iconAdTag = {
                name: `${newCampaign?'':'UPD['+dTStamp+']-'}${campaignName}-NATIVE-ICON`,
                tag: `<img src='${String(creatives.iconImageCreativeUrl).replace(/\s+/g, "%20")}' />`,
                auto_scan: autoScan.enable,
                scan_type: scanTypes.TrackAds,
                locations: prepareCodedLocationArray(geography),
                demand_id: id,
                demand_name: campaignName,
                demand_creative_id: creatives.id,
                times_per_day: scanTimesPerDay,
                top_urls: [topLevelDomain]
            }
            finalAdTag.push(iconAdTag)
        }
        const landingPage = {
            name: `${newCampaign?'':'UPD['+dTStamp+']-'}${campaignName}-NATIVE-LP`,
            tag: trackingUrl,
            auto_scan: autoScan.enable,
            scan_type: scanTypes.TrackLandingPage,
            locations: prepareCodedLocationArray(geography),
            demand_id: id,
            demand_name: campaignName,
            demand_creative_id: trackingUrl,
            times_per_day: scanTimesPerDay,
            top_urls: [topLevelDomain]
        }
        finalAdTag.push(landingPage)
        log.info(`adObj native: ${JSON.stringify(finalAdTag)}`)
        return finalAdTag;
    }
    if(monetizationType==='VIDEO'){
        log.info('sendForAdQualityCheck adtype: video')
        let finalAd =[]
        const landingPage = {
            name: `${newCampaign?'':'UPD['+dTStamp+']-'}${campaignName}-VIDEO-LP`,
            tag: trackingUrl,
            auto_scan: autoScan.enable,
            scan_type: scanTypes.TrackLandingPage,
            locations: prepareCodedLocationArray(geography),
            demand_id: id,
            demand_name: campaignName,
            demand_creative_id: trackingUrl,
            times_per_day: scanTimesPerDay,
            top_urls: [topLevelDomain]
        }
        finalAd.push(landingPage)
        log.info(`adObj landing page for video: ${JSON.stringify(finalAd)}`)
        return finalAd;
    }
    if(monetizationType === 'AUDIO'){
        log.info('sendForAdQualityCheck adtype: audio')
        let  finalAd = []
        const landingPage = {
            name: `${newCampaign?'':'UPD['+dTStamp+']-'}${campaignName}-AUDIO-LP`,
            tag: trackingUrl,
            auto_scan: autoScan.enable,
            scan_type: scanTypes.TrackLandingPage,
            locations: prepareCodedLocationArray(geography),
            demand_id: id,
            demand_name: campaignName,
            demand_creative_id: trackingUrl,
            times_per_day: scanTimesPerDay,
            top_urls: [topLevelDomain]
        }
        finalAd.push(landingPage)
        log.info(`adObj landing page for audio: ${JSON.stringify(finalAd)}`)
        return finalAd;
    }
}

const postAdProject = async(adData) => {
    try {
        return await axios({
            method: 'post',
            headers: {
                Authorization: geoEdgeAccessToken,
                'Content-Type': 'application/json',
                // 'Content-Length': adData.length
            },
            url: 'https://api.geoedge.com/rest/analytics/v3/projects/bulk',
            data: adData
        });
    } catch (error) {
        log.error(error)
    }
}

export const sendForAdQualityCheck = async(campaignId, newCampaign) =>{
    log.info(`sendForAdQualityCheck called, campaignId: ${JSON.stringify(campaignId)}`)
    try {
        let campaignDetails;
        campaignDetails = await Campaign.findOne({
            where: {id:campaignId},
            attributes: ['id', 'monetizationType', 'campaignName', 'trackingUrl', 'topLevelDomain', 'creatives', 'geography'],
          })
          .then(res=>res.dataValues)
        const adObj = await prepareAdObj(campaignDetails, newCampaign)
        return await postAdProject(adObj);
    } catch (err) {
        log.error(`Ad Quality Check Send Error: ${err} `);
    }
    //1. check ad for creative using campaign id
    //2. check if project already created at geoedge for given campaign id
    //3. if project not created create a new project, if already created then update it
    //4. setup alerting params
}

// other modules
// 1. get scan result

