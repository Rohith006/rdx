import {
  CAMPAIGNS_REQUEST_PENDING,
  CAMPAIGNS_REQUEST_FULFILLED,
  CREATE_CAMPAIGN,
  DELETE_CAMPAIGN,
  LOAD_CAMPAIGNS,
  UPDATE_CAMPAIGN,
  UPDATE_CAMPAIGN_STATUS,
  SUBMIT_CAMPAIGN,
  LOAD_CAMPAIGN_BY_ID,
  RESET_CURRENT_CAMPAIGN,
  LOAD_INVENTORIES,
  LOAD_CAMPAIGN_CATEGORIES,
  LOAD_CAMPAIGNS_TAGS_LIST, CHANGE_TAGS_IDS,
  LOAD_CAMPAIGNS_DROPDOWN_LIST, LOAD_CAMPAIGN_AUDIENCES,
} from '../constants/campaigns';
import {os, LIVERAMP, DIGISEG} from '../constants/campaigns';
import {RESET_REDUX_STATE} from '../constants/auth';
import {LOAD_DATA_PARTNERS, DATA_PARTNERS_REQUEST_PENDING, 
  DATA_PARTNERS_REQUEST_FULFILLED} from '../constants/audiences';

const {IOS, ANDROID} = os.mobile;

const initialState = {
  
  isRequestPending: false,
  categoriesList: [],
  categories: [],
  campaignsList: [],
  inventoryList: [],
  tagsList: [],
  dropdownList: [],
  currentCampaign: {
    goals: [],
  },
  publishers: [],
  audiences: [],
  liveRampData: [],
  digiseg: [],
  paginationValue: [],
  newCampaign: {},
  selectOs: [
    {label: '-', value: null},
    {label: 'iOS', value: IOS},
    {label: 'Android', value: ANDROID},
  ],
};

export default (state = initialState, action) => {
  switch (action.type) {
    case CAMPAIGNS_REQUEST_PENDING:
      return {
        ...state,
        inventoryList: [],
        isRequestPending: true,
      };
    case CAMPAIGNS_REQUEST_FULFILLED:
      return {
        ...state,
        isRequestPending: false,
      };
    case LOAD_CAMPAIGNS_DROPDOWN_LIST:
      return {
        ...state,
        dropdownList: action.payload,
      };
    case CREATE_CAMPAIGN:
      return {
        ...state,
        campaignsList: [...state.campaignsList, action.data.campaign],
      };
    case DELETE_CAMPAIGN:
      return {
        ...state,
        campaignsList: state.campaignsList.map((campaign) => action.data.ids.find((id) => id === campaign.id) ? {
          ...campaign,
          status: 'REMOVED',
        } : campaign),
      };
    case LOAD_CAMPAIGNS:
      return {
        ...state,
        campaignsList: action.data.campaigns,
      };
    case LOAD_INVENTORIES:
      return {
        ...state,
        inventoryList: action.data.inventories,
        isRequestPending: false,
      };
    case LOAD_CAMPAIGN_AUDIENCES:
      // const formatted = action.data.map((el) => ({label: el.name, value: el.id}));
      return {
        ...state,
        isRequestPending: false,
        audiences: action.data,
      };
    case DATA_PARTNERS_REQUEST_PENDING:
      return {
        ...state,
        isRequestPending: true
      }
    case LOAD_DATA_PARTNERS:
      switch (action.filter){
        case LIVERAMP :
          let thirdPartyData = action.data['v2/Segments'].map((el) => ({
            name:el.name.replace(/[*]/g, ''),
            id: el.id,
            price: Number(el.pricing.digitalAdTargeting.value.amount)/100,
        }) )
        let pagination = action.data["_pagination"]["after"]   
        return { 
          ...state,
          liveRampData: thirdPartyData,
          paginationValue : pagination,
          isRequestPending: false,
        }
        case DIGISEG :
          let digisegData = Object.entries(action.data).map(([k, v]) =>{
            // console.log("digiseg fun qq", k, v)
              const name = (`${[v]}`)
              const id = (`${k}`)
              // console.log("id =====> qq", id)
              return ({ name: name, id: id})  
          })
          return {
            ...state,
            digiseg: digisegData,
            isRequestPending: false,
          }
    }
    case DATA_PARTNERS_REQUEST_FULFILLED: 
      return {
        ...state,
        isRequestPending: false,
      }
         
        
          // console.log("digiseg reducer  qq =====>",   digisegData)
          // console.log("liveramp reducer  qq =====>",   thirdPartyData)

      //   let digisegData = Object.entries(action.data).map(([k, v]) =>{
      //     console.log("digiseg fun qq", k, v)
      //       const name = (`${[v]}`)
      //       const id = (`${k}`)
      //       console.log("id =====> qq", id)
      //       return ({ name: name, id: id})
            
      //   })
    
      // return {
      //   ...state,
      //   liveRampData: thirdPartyData,
      //   paginationValue : pagination, 
      //   digiseg: digisegData,
      //   // digiseg: action.data,
      //   isRequestPending: false,
      // }

    case UPDATE_CAMPAIGN:
      return {
        ...state,
        campaignsList: state.campaignsList.map((campaign) => campaign.id === action.data.campaign.id ? action.data.campaign : campaign),
      };
    case UPDATE_CAMPAIGN_STATUS:
      return {
        ...state,
        campaignsList: state.campaignsList.map((campaign) => action.data.ids.find((id) => id === campaign.id) ? {
          ...campaign,
          status: action.data.status,
          statusReason: action.data.statusReason,
        } : campaign),
      };
    case SUBMIT_CAMPAIGN:
      return {
        ...state,
        currentCampaign: Object.assign({}, state.currentCampaign, {campaignId: action.data.id}),
        campaignsList: state.campaignsList.map((campaign) => campaign.id === action.data.id ? {
          ...campaign,
          status: action.data.status,
        } : campaign),
      };
    case LOAD_CAMPAIGN_BY_ID: {
      return {
        ...state,
        currentCampaign: Object.assign({}, state.currentCampaign, action.payload.campaign),
        isRequestPending: false,
      };
    }
    case LOAD_CAMPAIGN_CATEGORIES: {
      const categories = [];
      for (const catKey in action.payload) {
        categories.push(
            ...Object.keys(action.payload[catKey])
                .map((key) => ({
                  label: `${key} - ${action.payload[catKey][key]}`,
                  value: key,
                })),
        );
      }
      return {
        ...state,
        categoriesList: action.payload, // TODO Replace `categoriesList` on categories and use modified list in all components
        categories: categories,
      };
    }
    case LOAD_CAMPAIGNS_TAGS_LIST: {
      return {
        ...state,
        tagsList: action.payload,
      };
    }
    case CHANGE_TAGS_IDS: {
      const {publishers} = action.payload;
      return {
        ...state,
        currentCampaign: {
          ...state.currentCampaign,
          listTags: action.payload,
        },
        publishers,
      };
    }
    case RESET_CURRENT_CAMPAIGN: {
      return {
        ...state,
        currentCampaign: {
          campaignId: state.currentCampaign.id,
        },
        publishers: [],
        inventoryList: [],
      };
    }
    case RESET_REDUX_STATE:
      return initialState;
    default:
      return state;
  }
};
