import {Router} from 'express';
import CampaignCtrl from '../../controllers/campaign.controller';
import {createCampaignTag} from '../../middlewares/v1/campaigns';
import {saveExternalAudience} from '../../middlewares/v1/audiences';

const router = Router();

router.post('/campaign', CampaignCtrl.createExternalCampaign, (req, res) => {
    const {response} = res.locals;
    try {
      res.send(response);
    } catch (err) {
      log.error(`external campaign ${err}`);
    }
}); // TODO implement logging

router.post('/campaign-tag', createCampaignTag);

router.post('/audience', saveExternalAudience);

export default router;