import uuidv4 from 'uuid/v4';
import moment from 'moment';
import {clickhouseCluster, wlid} from '../../config';
import {audience as Audience, Sequelize} from '../models';
import chCluster from '../utils/client/chCluster';

class AudienceService {
  /**
   * Add users to the audience
   * @param audience - unique Audience ID
   * @returns {Promise<void>}
   */
  static async addUsersToAudience(audience) {
    console.time('addUsersToAudience')
    const dateNow = moment.utc().format('YYYY-MM-DD HH:mm:ss');
    let data = null;

    if (!audience.ifas || !audience.ifas.length) {
      console.log('no audience IFA found')
      return;
    }

    try {
      const stream = chCluster.query(`INSERT INTO dsp.${clickhouseCluster.AUDIENCE_USERS}`, {format: 'JSONEachRow'});
      audience.ifas.map((ifa) => {
        data = {};
        data.id = uuidv4();
        data.ifa = ifa;
        data.wlid = wlid.toString();
        data.audienceId = audience.audienceId;
        data.createdAt = dateNow;
        data.updatedAt = dateNow;

        stream.write(data);
      });
      console.log('stream audience end')
      stream.end();
      console.timeEnd('addUsersToAudience')
    } catch (e) {
      console.error(`Error saving users to audience: ${e.message}`);
    }
  }

  static async addIPtoAudience(audience){
    console.time('addIPtoAudience');
    const now = moment.utc().format('YYYY-MM-DD HH:mm:ss');
    let data = null;

    if (!audience.ips || !audience.ips.length) {
      console.log('no audience IP found')
      return;
    }

    try {
      const stream = chCluster.query(`INSERT INTO dsp.${clickhouseCluster.IP_USERS}`, {format: 'JSONEachRow'});
      audience.ips.map((ip) => {
        data = {};
        data.id = uuidv4();
        data.ip = ip;
        data.wlid = wlid.toString();
        data.audienceId = audience.audienceId;
        data.createdAt = now;
        data.updatedAt = now;

        stream.write(data);
      });
      console.log('stream audience end')
      stream.end();
      console.timeEnd('addIPtoAudience')
    } catch (e) {
      console.error(`Error saving IPs to audience: ${e.message}`);
    }
  }

  static async getAudiences() {
    console.log('getAudiences called')
    try {
      const audiences = await Audience.findAll({
        where: {status: {[Sequelize.Op.not]: 'REMOVED'}},
        attributes: ['id', 'name'],
      });
      console.log('receieved audiences', JSON.stringify(audiences))
      return audiences;
    } catch (e) {
      console.error(`Error get all audiences: ${e.message}`);
    }
  }

  static async loadAudienceUsers(audienceId) {
    console.time(`Audience ID:${audienceId}`)
    const rows = [];
    return new Promise( async (resolve, reject) => {
      const query = `SELECT DISTINCT ifa FROM dsp.${clickhouseCluster.AUDIENCE_USERS} WHERE wlid='${wlid}' and audienceId = ${audienceId}`;
      const stream = await chCluster.query(query);
      stream.on('data', (row) => {
        rows.push(row)
      });
      stream.on('end', () => {
        console.timeEnd(`Audience ID:${audienceId}`)
        resolve(rows);
      });
      stream.on('error', (e) => {
        reject(e);
      });
    });
  }
}

module.exports = AudienceService;
