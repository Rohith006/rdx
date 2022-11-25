import {getAllSegmentsDS} from "../../../services/dmp/digiseg";
import {getAllSegmentsLR, getParticularSegmentLR} from "../../../services/dmp/liveramp";

export const getDMPSegments = async (req, res, next) => {
  //TODO: add margin to segment price once margins available
  const { dmp } = req.params;
  const { limit, after } = req.query;
  if(dmp.toLowerCase()==='liveramp'){
    console.log('getting DMP segments for liveramp');
    try {
      const response = await getAllSegmentsLR(after, limit);
      res.send(response);
    } catch (e) {
      log.error(`error getting DMP segments for liveramp \n ${e}`);
      next(e);
    }
  } else if(dmp.toLowerCase()==='digiseg'){
    console.log('getting DMP segments for digiseg');
    try {
      const response = await getAllSegmentsDS();
      res.send(response);
    } catch (e) {
      log.error(`error getting DMP segments for digiseg \n ${e}`);
      next(e);
    }
  }
   else {
    res.send('Segment not found');
  }
};

export const getSegmentDetails = async (req, res, next) => {
    //TODO: add margin to segment price once margins available
    const { dmp, segmentId } = req.params;
    if(dmp.toLowerCase()==='liveramp'){
      try {
        const response = await getParticularSegmentLR(segmentId);
        res.send(response);
      } catch (e) {
        log.error(`loading campaign audience \n ${e}`);
        next(e);
      }
    } else {
      res.send('Segment not found');
    }
};
