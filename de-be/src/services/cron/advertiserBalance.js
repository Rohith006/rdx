import moment from 'moment';
import _ from 'lodash';
import {advertiser as Advertiser, campaign as Campaign} from '../../models';
import chCluster from '../../utils/client/chCluster';
import {getAdvertiserSql} from '../../utils/clickhouseQq2';
import {SUSPENDED} from '../../constants/campaign';

export default async function syncAdvertiserBalance() {
  try {
    const startDate = '2020-01-01';
    const endDate = moment().format('YYYY-MM-DD');
    let advs = await Advertiser.findAll({attributes: ['id', 'balance', 'remainingBudget']});
    advs = advs.map((item) => item.get());
    const adverIds = advs.map((a) => a.id);

    if (!adverIds.length) {
      return;
    }

    const response = await chCluster.querying(getAdvertiserSql(adverIds, startDate, endDate));
    if (response) {
      advs.map((a) => {
        const obj = response.data.find((i) => i.advertiserId === a.id);
        if (obj && _.isNumber(obj.spend) && _.isNumber(a.balance)) {
          const newBudget = a.balance - obj.spend;
          Advertiser.update({remainingBudget: newBudget}, {where: {id: a.id}});
          if (newBudget <= 0) {
            Advertiser.update({status: SUSPENDED}, {where: {id: a.id}});
            Campaign.update({status: SUSPENDED, statusReason: 'Advertiser budget is over'}, {where: {advertiserId: a.id}});
          }
        }
      });
    }
  } catch (e) {
    console.error(e);
  }
}
