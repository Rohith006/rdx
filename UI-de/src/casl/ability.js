import {AbilityBuilder} from '@casl/ability';
// import store from '../store/index';

export default AbilityBuilder.define((can) => {
  can('see', 'CreateCampaignRoutes');
});
