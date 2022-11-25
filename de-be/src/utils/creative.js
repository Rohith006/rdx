import {
    audioAdCreative as AudioAdCreative,
    creativeTag as CreativeTag,
    videoAdCreative as VideoAdCreative
} from '../models';

export const getCampaignCreativeTag = async function(cid) {
  const tag = await CreativeTag.findOne({where: {campaignId: cid}});
  return tag;
};

export const getCampaignVideoCreative = async function(cid) {
  const creative = await VideoAdCreative.findOne({where: {campaignId: cid}});
  if (creative) {
    creative.videoCreativeUrl = encodeURI(creative.videoCreativeUrl);
    return creative;
  } else return null;
};

export const getCampaignAudioCreative = async (cid) => {
  const creative = await AudioAdCreative.findOne({where:{campaignId:cid}});
  if(creative){
    creative.audioCreativeUrl = encodeURI(creative.audioCreativeUrl);
    return creative;
  }else return null;
}