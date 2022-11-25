import fs from 'fs';
import {clients} from '../clients';

export const execTaskFromBidder = async () => {
  const multi = clients.redisClient.multi();
  let data = null;
  const queue = 'task-from-bidder-queue';

  const len = await clients.redisClient.llenAsync(queue);
  if (!len) {
    return;
  }
  for (let i = 0; i < len; i++) {
    multi.lpop(queue);
  }
  data = await multi.execAsync();
  data.forEach(async (item) => {
    if (!item) return;
    const obj = JSON.parse(item);
    switch (obj.type) {
      case 'log-bidreq': {
        const data = new Date().toISOString().slice(0, 19) + '\n' + JSON.stringify(obj.bidreq) + '\n\n';
        fs.appendFile(`public/req${obj.entity[0]}${obj.id}.txt`, data, (err) => {
          if (err) throw err;
        });
      }
    }
  });
};
