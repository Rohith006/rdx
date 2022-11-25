import moment from 'moment';
import ch from '../../../utils/clickhouse';
import {clickhouse} from '../../../../config/index';

const {impressions, clicks} = clickhouse;

const checkClick = async (start, end) => {
  const timeStart = moment().subtract(14, 'hours').utc().format('YYYY-MM-DD HH:mm:ss');
  const timeEnd = moment().utc().format('YYYY-MM-DD HH:mm:ss');

  console.log(timeStart, timeEnd);

  const sql = `
    select DISTINCT t1.id, t1.status from (
     select id, bidreqId, status from dsp.distributed_clicks_local_v3 where createdDate=today() and status='REJECTED') as t1
    join (
     select id, bidreqId from dsp.distributed_impressions_local_v3) as t2
    on t1.bidreqId = t2.bidreqId
  `;

  const {data} = await ch.querying(sql);
  const ids = data.map((item) => item.id);
  console.log(data.length);

  let strIds = '';
  ids.map((item) => strIds += `'${item}',`);
  strIds += `'0'`;

  const sqlUpdate = `
    alter table dsp.distributed_clicks_local_v3 update status = 'APPROVED' where id in (${strIds})
  `;
  await ch.querying(sqlUpdate);
};

const IS_CHECK_CLICK = process.env.IS_CHECK_CLICK;
if (IS_CHECK_CLICK) {
  checkClick();
}

export default checkClick;
