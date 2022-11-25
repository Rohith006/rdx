import {Router} from 'express';
import carriers from '../../../assets/files/carriers/carriers';
import {loadCampaignTagsList} from '../../middlewares/v1/campaigns';
import {getAudiences} from '../../middlewares/v1/audiences';
import {getCategories, getCitiesSearch, getLanguages,} from '../../middlewares/v1/utils';
import {loadBudgets, loadCreativesInfo, loadInventories} from '../../middlewares/v1/database/load';
import {alpha2} from '../../../assets/files/countries';

const router = Router();

router.get('/campaign-carrier', (req, res) => {
    try {
      res.send(carriers);
    } catch (err) {
      log.error(`external ${err}`);
    }
});

router.get('/audiences', getAudiences);

router.get('/tags', loadCampaignTagsList);

router.get('/categories', getCategories);

router.get('/languages', getLanguages);

router.get('/inventories', loadInventories);

router.get('/budgets', loadBudgets);

router.get('/countries', (req,res) => {
  try{
    res.send(alpha2);
  } catch(err) {
    console.error(err);
  }
});

router.get('/cities',getCitiesSearch);

router.get('/creatives-info/:campaignId',loadCreativesInfo);

export default router;