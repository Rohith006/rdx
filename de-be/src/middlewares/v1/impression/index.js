import ch from '../../../utils/clickhouse';
import log from '../../../../logger';

/**
 * @api {post} /v1/impression/get-status/:id
 * @apiVersion 0.1.0
 * @apiName GetImpresssionStatus
 * @apiDescription Check impression
 * @apiGroup Impression
 */
export const getImpressionStatus = async (req, res, next) => {
  try {
    const {id} = req.params;

    const sql = `select status, viewType as count from dsp.distributed_impressions_local_v3 where bidreqId='${id}'`;
    const {data} = await ch.querying(sql);
    console.log(data);
    res.send({
      data,
      count: data.length,
    });
  } catch (e) {
    log.error(`getting impression status \n ${e.stack}`);
    next(e);
  }
};
