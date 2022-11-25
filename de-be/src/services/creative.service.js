import {isPlainObject} from 'lodash';
import axios from 'axios';
import https from 'https';
import fs from 'fs';

import {
    audioAdCreative as AudioAdCreative,
    campaign as Campaign,
    creative as Creative,
    creativeTag as CreativeTag,
    nativeAdCreative as NativeAdCreative,
    videoAdCreative as VideoAdCreative
} from '../models';
import {cacheCampaign} from './caching/create';
import {accessToCDN, creatives as creativeConfig, wlid} from '../../config';
import {errorLog} from '../utils/common';

const log = require('../../logger')

const agent = new https.Agent({
  rejectUnauthorized: false,
});

class CreativeService {
  static async upload(campaignId, files) {
    for (const file of files) {
      try {
        const resObj = {};

        const createCreative = async (data) => {
          return Creative.create(data, {
            returning: true,
          });
        };

        const dir = `public/creatives/${campaignId}`;

        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir);
        }

        const base64String = file.creative;

        const imageBuffer = await decodeBase64ToImage(base64String);
        const imagePath = `public/creatives/${campaignId}/${file.name}`;

        await fs.writeFile(imagePath, imageBuffer.data, {encoding: 'base64'}, (data) => {});
        if (accessToCDN.includes(+wlid)) {
          const creative = {
            campaignId,
            creative: file.creative,
            name: file.name,
          };
          await axios.post(`${creativeConfig.host}/dsp/upload/creatives`, {wlid, files: [creative]}, {httpsAgent: agent});
        }
        const data = {
          creativeUrl: `${creativeConfig.host}/creatives/${campaignId}/${file.name}`,
          name: file.name,
          campaignId,
          size: (file.size / 1000).toFixed(2),
          resolution: '-',
          width: file.widthImg,
          height: file.heightImg,
        };
        console.log(`DATA: ${JSON.stringify(data)}`)
        if (accessToCDN.includes(+wlid)) {
          data.creativeUrl = `${creativeConfig.host}/creatives/${wlid}/${campaignId}/${file.name}`;
        }
        const creative = await createCreative(data);

        if (creative) {
          resObj.fileUrl = creative.creativeUrl;
          await addCampaignCreativesItem(campaignId, creative);
        }
      } catch (e) {
        errorLog(`ERROR creating creative \n${e.stack}`);
      }
    }
  }

  static async updateNativeCreatives(campaignId, creatives) {
    const nativeCreative = await NativeAdCreative.findOne({where: {campaignId}});
    if (!nativeCreative) {
      await NativeAdCreative.create({campaignId: campaignId});
    }

    for (const creativeItem of creatives) {
      try {
        const updateCreative = async (data) => {
          const responseDb = await NativeAdCreative.update(data, {
            where: {campaignId},
            returning: true,
          });
          return responseDb[1][0].get();
        };

        const dir = `public/creatives/${campaignId}`;

        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir);
        }

        const mainImageBase64 = CreativeService.isBase64Image(creativeItem.creativeMainImage.img);
        const iconImageBase64 = CreativeService.isBase64Image(creativeItem.creativeIconImage.img);

        const oldMainImage = `public/creatives/${campaignId}/${nativeCreative.mainImageName}`;
        const oldIconImage = `public/creatives/${campaignId}/${nativeCreative.iconImageName}`;

        if (iconImageBase64 && fs.existsSync(oldIconImage)) {
          fs.unlinkSync(oldIconImage);
        }

        if (mainImageBase64 && fs.existsSync(oldMainImage)) {
          fs.unlinkSync(oldMainImage);
        }

        if (mainImageBase64) {
          const base64MainString = creativeItem.creativeMainImage.img;
          const mainImageBuffer = await decodeBase64ToImage(base64MainString);
          const mainImagePath = `public/creatives/${campaignId}/${creativeItem.creativeMainImage.name}`;
          await fs.writeFile(mainImagePath, mainImageBuffer.data, {encoding: 'base64'}, (data) => {});
          if (accessToCDN.includes(+wlid)) {
            const creative = {
              campaignId,
              creative: creativeItem.creativeMainImage.img,
              name: creativeItem.creativeMainImage.name,
            };
            await axios.post(`${creativeConfig.host}/dsp/upload/creatives`, {wlid, files: [creative]}, {httpsAgent: agent});
          }
        }

        if (iconImageBase64) {
          const base64IconString = creativeItem.creativeIconImage.img;
          const iconImageBuffer = await decodeBase64ToImage(base64IconString);
          const iconImagePath = `public/creatives/${campaignId}/${creativeItem.creativeIconImage.name}`;
          await fs.writeFile(iconImagePath, iconImageBuffer.data, {encoding: 'base64'}, (data) => {});
          if (accessToCDN.includes(+wlid)) {
            const creative = {
              campaignId,
              creative: creativeItem.creativeIconImage.img,
              name: creativeItem.creativeIconImage.name,
            };
            await axios.post(`${creativeConfig.host}/dsp/upload/creatives`, {wlid, files: [creative]}, {httpsAgent: agent});
          }
        }

        const data = CreativeService.prepareData(campaignId, creativeItem);

        const creative = await updateCreative(data);

        if (creative) {
          await addCampaignNativeCreativesItem(campaignId, creative);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }

  static async updateVideoCreatives(campaignId, creatives) {
    const videoCreative = await VideoAdCreative.findOne({where: {campaignId}});
    for (const creativeItem of creatives) {
      try {
        const updateCreative = async (data) => {
          return await VideoAdCreative.update(data, {
            where: {campaignId},
          });
        };

        if (!creativeItem.creativeVideo) {
          const creative = await updateCreative(creativeItem);
          if (creative) {
            await addCampaignNativeCreativesItem(campaignId, creative);
          }
          return;
        }

        const dir = `public/creatives/${campaignId}`;

        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir);
        }

        const videoBase64 = CreativeService.isBase64Video(creativeItem.creativeVideo.resource);

        const oldVideo = videoCreative ? `public/creatives/${campaignId}/${videoCreative.videoName}` : null;
        if ((videoBase64) && oldVideo && fs.existsSync(oldVideo)) {
          fs.unlinkSync(oldVideo);
        }

        if (videoBase64) {
          let base64String = creativeItem.creativeVideo.resource;
          base64String = base64String.replace(/^data:(.*?);base64,/, '');
          base64String = base64String.replace(/ /g, '+');
          const videoPath = `public/creatives/${campaignId}/${creativeItem.creativeVideo.name}`;
          await fs.writeFile(videoPath, base64String, 'base64', function(err) {
            console.log(err);
          });
          if (accessToCDN.includes(+wlid)) {
            const creative = {
              campaignId,
              creative: creativeItem.creativeVideo.resource,
              name: creativeItem.creativeVideo.name,
            };
            await axios.post(`${creativeConfig.host}/dsp/upload/creatives`, {wlid, files: [creative]}, {httpsAgent: agent});
          }
        }

        const oldImage = videoCreative ? `public/creatives/${campaignId}/${videoCreative.imageName}` : null;
        if (creativeItem.endCard && isPlainObject(creativeItem.creativeImage) && Object.keys(creativeItem.creativeImage).length) {
          const imageBase64 = CreativeService.isBase64Image(creativeItem.creativeImage.resource);

          if (imageBase64) {
            if (fs.existsSync(oldImage)) {
              fs.unlinkSync(oldImage);
            }

            const base64ImageString = creativeItem.creativeImage.resource;
            const imageBuffer = await decodeBase64ToImage(base64ImageString);
            const imagePath = `public/creatives/${campaignId}/${creativeItem.creativeImage.name}`;
            await fs.writeFile(imagePath, imageBuffer.data, {encoding: 'base64'}, function(err) {
              console.log(err);
            });
          }
        } else if (videoCreative && videoCreative.imageName) {
          if (fs.existsSync(oldImage)) {
            fs.unlinkSync(oldImage);
          }
        }

        const data = CreativeService.prepareVideoData(campaignId, creativeItem);
        const creative = await updateCreative(data);

        if (creative) {
          await addCampaignNativeCreativesItem(campaignId, creative);
        }
      } catch (e) {
        errorLog(`ERROR updateVideoCreatives \n${e.message}`);
      }
    }
  }

  static async updateAudioCreatives(campaignId, creatives){
    const audioCreative = await AudioAdCreative.findOne({where: {campaignId}});
    for (const creativeItem of creatives) {
      try {
        const updateCreative = async (data) => {
          console.log('Updating audioAdCreative table');
          return await AudioAdCreative.update(data, {
            where: {campaignId},
          });
        };

        if (!creativeItem.creativeAudio) {
          console.log('creativeAudio empty for update returning')
          const creative = await updateCreative(creativeItem);
          if (creative) {
            await addCampaignNativeCreativesItem(campaignId, creative);
          }
          return;
        }

        const dir = `public/creatives/${campaignId}`;

        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir);
        }

        const audioBase64 = CreativeService.isBase64Audio(creativeItem.creativeAudio.resource);

        const oldAudio = audioCreative ? `public/creatives/${campaignId}/${audioCreative.audioName}` : null;
        console.log(`Old Audio:${oldAudio}`)
        if ((audioBase64) && oldAudio && fs.existsSync(oldAudio)) {
          fs.unlinkSync(oldAudio);
        }

        if (audioBase64) {
          console.log('new audio base64 parsing')
          let base64String = creativeItem.creativeAudio.resource;
          creativeItem.creativeAudio.audioMimeType = base64String.split(';')[0].split(':')[1];
          base64String = base64String.replace(/^data:(.*?);base64,/, '');
          base64String = base64String.replace(/ /g, '+');
          const audioPath = `public/creatives/${campaignId}/${creativeItem.creativeAudio.name}`;
          await fs.writeFile(audioPath, base64String, 'base64', function(err) {
            if(err){
              log.error(`Error writing updated audio creative to file: ${err}`)
            }
          });
          if (accessToCDN.includes(+wlid)) {
            const creative = {
              campaignId,
              creative: creativeItem.creativeAudio.resource,
              name: creativeItem.creativeAudio.name,
            };
            await axios.post(`${creativeConfig.host}/dsp/upload/creatives`, {wlid, files: [creative]}, {httpsAgent: agent});
          }
        }

        const oldImage = audioCreative ? `public/creatives/${campaignId}/${audioCreative.imageName}` : null;
        if (creativeItem.endCard && isPlainObject(creativeItem.creativeImage) && Object.keys(creativeItem.creativeImage).length) {
          const imageBase64 = CreativeService.isBase64Image(creativeItem.creativeImage.resource);

          if (imageBase64) {
            if (fs.existsSync(oldImage)) {
              fs.unlinkSync(oldImage);
            }

            const base64ImageString = creativeItem.creativeImage.resource;
            const imageBuffer = await decodeBase64ToImage(base64ImageString);
            const imagePath = `public/creatives/${campaignId}/${creativeItem.creativeImage.name}`;
            await fs.writeFile(imagePath, imageBuffer.data, {encoding: 'base64'}, function(err) {
              log.error(`error writing updated audio image to file:${err}`)
            });
          }
        } else if (audioCreative && audioCreative.imageName) {
          if (fs.existsSync(oldImage)) {
            fs.unlinkSync(oldImage);
          }
        }

        const data = CreativeService.prepareAudioData(campaignId, creativeItem);
        const creative = await updateCreative(data);

        if (creative) {
          await addCampaignNativeCreativesItem(campaignId, creative);
        }
      } catch (e) {
        log.error(`ERROR updateAudioCreatives \n${e}`)
      }
    }
  }

  static isBase64Image(str) {
    const base64regex = /^data:image\/[^;]+;base64[^"]+/;
    return base64regex.test(str);
  }

  static isBase64Video(str) {
    const base64regex = /^data:video\/[^;]+;base64[^"]+/;
    return base64regex.test(str);
  }

  static isBase64Audio(str) {
    const base64regex = /^data:audio\/[^;]+;base64[^"]+/;
    return base64regex.test(str);
  }

  static prepareData(campaignId, creativeItem) {
    const data = {
      campaignId,
      name: creativeItem.creativeName,
      cta: creativeItem.creativeCta,
      sponsored: creativeItem.creativeSponsored,
      rating: creativeItem.creativeRating,
      description: creativeItem.creativeDescription,

      mainImageName: creativeItem.creativeMainImage.name,
      mainImageSize: creativeItem.creativeMainImage.size,
      mainImageResolution: `${creativeItem.creativeMainImage.widthImg}x${creativeItem.creativeMainImage.heightImg}`,
      mainImageWidth: creativeItem.creativeMainImage.widthImg,
      mainImageHeight: creativeItem.creativeMainImage.heightImg,
      mainImageCreativeUrl: `${creativeConfig.host}/creatives/${campaignId}/${creativeItem.creativeMainImage.name}`,
      mainImageCreatedAt: creativeItem.creativeMainImage.createdAt,

      iconImageName: creativeItem.creativeIconImage.name,
      iconImageSize: creativeItem.creativeIconImage.size,
      iconImageResolution: `${creativeItem.creativeIconImage.widthImg}x${creativeItem.creativeIconImage.heightImg}`,
      iconImageWidth: creativeItem.creativeIconImage.widthImg,
      iconImageHeight: creativeItem.creativeIconImage.heightImg,
      iconImageCreativeUrl: `${creativeConfig.host}/creatives/${campaignId}/${creativeItem.creativeIconImage.name}`,
      iconImageCreatedAt: creativeItem.creativeIconImage.createdAt,
    };
    if (accessToCDN.includes(+wlid)) {
      data.mainImageCreativeUrl = `${creativeConfig.host}/creatives/${wlid}/${campaignId}/${creativeItem.creativeMainImage.name}`;
      data.iconImageCreativeUrl = `${creativeConfig.host}/creatives/${wlid}/${campaignId}/${creativeItem.creativeIconImage.name}`;
    }
    return data;
  }

  static prepareAudioData(campaignId, creativeItem){
    let data = {
      campaignId,
      tagEnable: creativeItem.tagEnable,
      adTitle: creativeItem.adTitle,
      impressionUrl: creativeItem.impressionUrl,
      audioDuration: creativeItem.audioDuration,
      startDelay: creativeItem.startDelay || null,
      endCard: creativeItem.endCard || false,

      audioName: creativeItem.creativeAudio.name,
      audioSize: creativeItem.creativeAudio.size,
      audioBitrate: creativeItem.creativeAudio.bitrate,
      audioCreativeUrl: `${creativeConfig.host}/creatives/${campaignId}/${creativeItem.creativeAudio.name}`,
      audioCreatedAt: creativeItem.creativeAudio.createdAt,
      audioMimeType: creativeItem.creativeAudio.audioMimeType
    };

    if (accessToCDN.includes(+wlid)) {
      data.audioCreativeUrl = `${creativeConfig.host}/creatives/${wlid}/${campaignId}/${creativeItem.creativeAudio.name}`;
    }
    if (creativeItem.endCard && isPlainObject(creativeItem.creativeImage) && Object.keys(creativeItem.creativeImage).length) {
      data = {...data,
        imageName: creativeItem.creativeImage.name,
        imageSize: creativeItem.creativeImage.size,
        imageResolution: `${creativeItem.creativeImage.width}x${creativeItem.creativeImage.height}`,
        imageWidth: creativeItem.creativeImage.width,
        imageHeight: creativeItem.creativeImage.height,
        imageCreativeUrl: `${creativeConfig.host}/creatives/${campaignId}/${creativeItem.creativeImage.name}`,
        imageCreatedAt: creativeItem.creativeImage.createdAt};
    } else {
      const params = ['imageName', 'imageSize', 'imageResolution', 'imageWidth', 'imageHeight', 'imageCreativeUrl', 'imageCreatedAt'];
      params.forEach((param) => data[param] = null);
    }
    console.log(`DATA: ${JSON.stringify(data)}`)
    return data;
  }

  static prepareVideoData(campaignId, creativeItem) {
    let data = {
      campaignId,
      tagEnable: creativeItem.tagEnable,
      adTitle: creativeItem.adTitle,
      impressionUrl: creativeItem.impressionUrl,
      videoDuration: creativeItem.videoDuration,
      startDelay: creativeItem.startDelay || null,
      endCard: creativeItem.endCard || false,

      videoName: creativeItem.creativeVideo.name,
      videoSize: creativeItem.creativeVideo.size,
      videoResolution: `${creativeItem.creativeVideo.width}x${creativeItem.creativeVideo.height}`,
      videoWidth: creativeItem.creativeVideo.width,
      videoHeight: creativeItem.creativeVideo.height,
      videoCreativeUrl: `${creativeConfig.host}/creatives/${campaignId}/${creativeItem.creativeVideo.name}`,
      videoCreatedAt: creativeItem.creativeVideo.createdAt,
    };
    if (accessToCDN.includes(+wlid)) {
      data.videoCreativeUrl = `${creativeConfig.host}/creatives/${wlid}/${campaignId}/${creativeItem.creativeVideo.name}`;
    }
    if (creativeItem.endCard && isPlainObject(creativeItem.creativeImage) && Object.keys(creativeItem.creativeImage).length) {
      data = {...data,
        imageName: creativeItem.creativeImage.name,
        imageSize: creativeItem.creativeImage.size,
        imageResolution: `${creativeItem.creativeImage.width}x${creativeItem.creativeImage.height}`,
        imageWidth: creativeItem.creativeImage.width,
        imageHeight: creativeItem.creativeImage.height,
        imageCreativeUrl: `${creativeConfig.host}/creatives/${campaignId}/${creativeItem.creativeImage.name}`,
        imageCreatedAt: creativeItem.creativeImage.createdAt};
    } else {
      const params = ['imageName', 'imageSize', 'imageResolution', 'imageWidth', 'imageHeight', 'imageCreativeUrl', 'imageCreatedAt'];
      params.forEach((param) => data[param] = null);
    }
    return data;
  }

  static async uploadNativeCreatives(campaignId, creatives) {
    for (const creativeItem of creatives) {
      try {
        const createCreative = async (data) => {
          return NativeAdCreative.create(data, {
            returning: true,
          });
        };

        const dir = `public/creatives/${campaignId}`;

        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir);
        }

        const base64MainString = creativeItem.creativeMainImage.img;
        const base64IconString = creativeItem.creativeIconImage.img;

        const mainImageBuffer = await decodeBase64ToImage(base64MainString);
        const iconImageBuffer = await decodeBase64ToImage(base64IconString);

        const mainImagePath = `public/creatives/${campaignId}/${creativeItem.creativeMainImage.name}`;
        const iconImagePath = `public/creatives/${campaignId}/${creativeItem.creativeIconImage.name}`;

        await fs.writeFile(mainImagePath, mainImageBuffer.data, {encoding: 'base64'}, (data) => {});
        if (accessToCDN.includes(+wlid)) {
          const creative = {
            campaignId,
            creative: creativeItem.creativeMainImage.img,
            name: creativeItem.creativeMainImage.name,
          };
          await axios.post(`${creativeConfig.host}/dsp/upload/creatives`, {wlid, files: [creative]}, {httpsAgent: agent});
        }

        await fs.writeFile(iconImagePath, iconImageBuffer.data, {encoding: 'base64'}, (data) => {});
        if (accessToCDN.includes(+wlid)) {
          const creative = {
            campaignId,
            creative: creativeItem.creativeIconImage.img,
            name: creativeItem.creativeIconImage.name,
          };
          await axios.post(`${creativeConfig.host}/dsp/upload/creatives`, {wlid, files: [creative]}, {httpsAgent: agent});
        }
        const data = CreativeService.prepareData(campaignId, creativeItem);

        const creative = await createCreative(data);

        if (creative) {
          await addCampaignNativeCreativesItem(campaignId, creative);
        }
      } catch (e) {
        console.error(e.message);
      }
    }
  }


  static async uploadAudioCreatives(campaignId, creatives){
    for (const creativeItem of creatives) {
      try {
        const createCreative = async (data) => {
          return AudioAdCreative.create(data, {
            returning: true,
          });
        };

        if (!creativeItem.creativeAudio) {
          console.log('creativeAudio NOT FOUND')
          creativeItem.audioDuration = 0;
          creativeItem.campaignId = campaignId;
          await createCreative(creativeItem);
          return;
        }

        const dir = `public/creatives/${campaignId}`;

        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir);
        }

        let base64String = creativeItem.creativeAudio.resource;

        creativeItem.creativeAudio.audioMimeType = base64String.split(';')[0].split(':')[1];

        base64String = base64String.replace(/^data:(.*?);base64,/, '');
        base64String = base64String.replace(/ /g, '+');
        const audioPath = `public/creatives/${campaignId}/${creativeItem.creativeAudio.name}`;
        console.log(`AUDIO PATH: ${audioPath}`);

        await fs.writeFile(audioPath, base64String, 'base64', function(err) {
          if(err){
            log.error(`Error writing audioCreative to file: ${err}`);
          }
        });
        if (accessToCDN.includes(+wlid)) {
          const creative = {
            campaignId,
            creative: creativeItem.creativeAudio.resource,
            name: creativeItem.creativeAudio.name,
          };
          await axios.post(`${creativeConfig.host}/dsp/upload/creatives`, {
            wlid,
            files: [creative]
          }, {httpsAgent: agent});
        }
        if (creativeItem.endCard && isPlainObject(creativeItem.creativeImage) && Object.keys(creativeItem.creativeImage).length) {
          const base64ImageString = creativeItem.creativeImage.resource;
          const imageBuffer = await decodeBase64ToImage(base64ImageString);
          const imagePath = `public/creatives/${campaignId}/${creativeItem.creativeImage.name}`;
          await fs.writeFile(imagePath, imageBuffer.data, {encoding: 'base64'}, function (err) {
            if (err) {
              log.error(`Error writing audioCreative image to file: ${err}`);
            }
          });
        }

        const data = CreativeService.prepareAudioData(campaignId, creativeItem);
        console.log(`PREPARED AUDIO DATA:${JSON.stringify(data)}`)
        await createCreative(data);
      } catch (e) {
        log.error(`ERROR uploadAudioCreative \n${e.stack}`)
      }
    }
  }

  static async uploadVideoCreatives(campaignId, creatives) {
    for (const creativeItem of creatives) {
      try {
        const createCreative = async (data) => {
          const responseDb = await VideoAdCreative.create(data, {
            returning: true,
          });
          return responseDb;
        };

        if (!creativeItem.creativeVideo) {
          creativeItem.videoDuration = 0;
          creativeItem.campaignId = campaignId;
          await createCreative(creativeItem);
          return;
        }

        const dir = `public/creatives/${campaignId}`;

        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir);
        }

        let base64String = creativeItem.creativeVideo.resource;

        base64String = base64String.replace(/^data:(.*?);base64,/, '');
        base64String = base64String.replace(/ /g, '+');

        const videoPath = `public/creatives/${campaignId}/${creativeItem.creativeVideo.name}`;

        await fs.writeFile(videoPath, base64String, 'base64', function(err) {
          if(err){
            console.log(`Error writing video file: ${err}`);
          }
        });
        if (accessToCDN.includes(+wlid)) {
          const creative = {
            campaignId,
            creative: creativeItem.creativeVideo.resource,
            name: creativeItem.creativeVideo.name,
          };
          await axios.post(`${creativeConfig.host}/dsp/upload/creatives`, {wlid, files: [creative]}, {httpsAgent: agent});
        }
        if (creativeItem.endCard && isPlainObject(creativeItem.creativeImage) && Object.keys(creativeItem.creativeImage).length) {
          const base64ImageString = creativeItem.creativeImage.resource;
          const imageBuffer = await decodeBase64ToImage(base64ImageString);
          const imagePath = `public/creatives/${campaignId}/${creativeItem.creativeImage.name}`;
          await fs.writeFile(imagePath, imageBuffer.data, {encoding: 'base64'}, function(err) {
            console.log(err);
          });
        }

        const data = CreativeService.prepareVideoData(campaignId, creativeItem);
        await createCreative(data);
      } catch (e) {
        errorLog(`ERROR uploadVideoCreatives \n${e.stack}`);
      }
    }
  }

  static async addCreativeTag(campaignId, data) {
    try {
      await CreativeTag.create({
        campaignId,
        tagEnable: data.tagEnable,
        tagUrl: data.tagUrl,
        impressionUrl: data.impressionUrl,
      });
    } catch (e) {
      console.error(e.message);
    }
  }

  static async updateTag(campaignId, data) {
    try {
      const updateData = {
        campaignId,
        tagEnable: data.tagEnable,
        tagUrl: data.tagUrl,
        impressionUrl: data.impressionUrl,
      };

      await CreativeTag.update(updateData, {
        where: {campaignId},
      });
    } catch (e) {
      console.error(e.message);
    }
  }


}

const decodeBase64ToImage = async (base64String) => {
  if (!base64String) {
    return null;
  }

  const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  const response = {};

  if (matches == null || matches.length !== 3) {
    return null;
  }

  response.type = matches[1];
  response.data = matches[2];

  return response;
};

const addCampaignNativeCreativesItem = async (campaignId, creative) => {
  let campaign = await Campaign.findOne({where: {id: campaignId}});

  campaign = campaign.get();

  if (!campaign.creatives) {
    campaign.creatives = {};
  }

  campaign.creatives = creative;

  campaign = await Campaign.update({creatives: campaign.creatives}, {where: {id: campaignId}, returning: true});

  await cacheCampaign(campaign[1][0].get());
};

const addCampaignCreativesItem = async (campaignId, creative) => {
  let campaign = await Campaign.findOne({where: {id: campaignId}});
  campaign = campaign.get();
  if (!campaign.creatives) {
    campaign.creatives = {};
  }
  campaign.creatives[creative.id] = {
    id: creative.id,
    url: creative.creativeUrl,
    width: creative.width,
    height: creative.height,
  };
  campaign = await Campaign.update({creatives: campaign.creatives}, {where: {id: campaignId}, returning: true});
  await cacheCampaign(campaign[1][0].get());
};

module.exports = CreativeService;
