import fs from 'fs';

import {resolution as Resolution} from '../../../models';
import {clients} from '../../../services/clients';
import {wlid} from '../../../../config';

export const loadBannerResolutions = async (req, res) => {
  try {
    const data = await Resolution.findAll();
    res.send(data);
  } catch (e) {
    console.error(e);
  }
};

export const startLoggerBidreq = async (req, res) => {
  try {
    const {entity, entityId} = req.params;
    const filePath = `public/req${entity[0]}${entityId}.txt`;
    console.log(filePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    fs.writeFileSync(filePath, '\n');
    const cacheData = await clients.redisClientTraff.lrangeAsync(`${entity}_requests:${wlid}:${entityId}`, 0, 9);
    if (cacheData) {
      const arr = [];
      cacheData.map((d) => arr.push(JSON.parse(d)));
      arr.sort((a, b) => {
        if (a.time > b.time) {
          return 1;
        }
        if (a.time < b.time) {
          return -1;
        }
        return 0;
      });
      arr.map((b) => {
        const req = b.request_url ? decodeURI(b.request_url) : b.request;
        const data = b.time.slice(0, 19) + '\n' + req + '\n\n';
        fs.appendFile(`public/req${entity[0]}${entityId}.txt`, data, (err) => {
          if (err) throw err;
        });
      });
    }
    res.sendStatus(200);
  } catch (e) {
    console.error(e);
  }
};

export const uploadLogo = async (req, res) => {
  try {
    console.log(req.files.logo);
    fs.writeFileSync(`public/images/${wlid}/logo.png`, req.files.logo.data);
    res.sendStatus(200);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
};
