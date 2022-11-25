import axios from 'axios'
import { NotificationManager } from 'react-notifications'
import querystring from 'querystring'
import {
  CAMPAIGNS_REQUEST_PENDING,
  CAMPAIGNS_REQUEST_FULFILLED,
  CREATE_CAMPAIGN,
  DELETE_CAMPAIGN,
  LOAD_CAMPAIGNS,
  UPDATE_CAMPAIGN,
  SUBMIT_CAMPAIGN,
  UPDATE_CAMPAIGN_STATUS,
  SET_CURRENT_CAMPAIGN,
  LOAD_INVENTORIES,
  LOAD_CAMPAIGN_BY_ID,
  RESET_CURRENT_CAMPAIGN,
  ACTIVE,
  PAUSED,
  LOAD_CAMPAIGN_CATEGORIES,
  CPM,
  CPC,
  LOAD_CAMPAIGNS_TAGS_LIST,
  CHANGE_TAGS_IDS,
  LOAD_CAMPAIGN_AUDIENCES,
} from '../constants/campaigns'
import {
  BUDGETS_REQUEST_PENDING,
  BUDGETS_REQUEST_FULFILLED,
  CREATE_BUDGET,
  DELETE_BUDGET,
  LOAD_BUDGETS,
  UPDATE_BUDGET,
} from '../constants/budgets'

import { UPDATE_CAMPAIGN_STATISTIC } from '../constants/campaignsStatistics'
import { 
  LOAD_DATA_PARTNERS, 
  DATA_PARTNERS_REQUEST_PENDING, 
  DATA_PARTNERS_REQUEST_FULFILLED
} from '../constants/audiences';

axios.defaults.baseURL = __INTERNAL_API_URL__

export const getCampaignById = (id) => async (dispatch) => {
  const campaignId = ~~id
  try {
    const { data } = await axios.get(
      `/database/load/campaign-details?id=${campaignId}`,
    )

    dispatch({ type: LOAD_CAMPAIGN_BY_ID, payload: data })
  } catch (e) {
    console.error(e)
  }
}

export const createCampaignTag = (id, data) => async () => {
  const {
    name,
    color: { hex },
  } = data
  const campaignId = ~~id
  try {
    return await axios.post(`/campaigns/campaign-create-tag`, {
      campaignId,
      name,
      color: hex,
    })
  } catch (e) {
    console.error(e)
  }
}

export const loadCampaignTagsList = () => async (dispatch) => {
  try {
    const { data } = await axios.get(`/campaigns/campaign-load-tags-list`)
    dispatch({ type: LOAD_CAMPAIGNS_TAGS_LIST, payload: data })
  } catch (e) {
    console.error(e)
  }
}

export const deleteCampaignTag = (data) => async () => {
  try {
    return await axios.delete(`/campaigns/campaign-delete-tag?id=${data.id}`)
  } catch (e) {
    console.error(e)
  }
}

export const createCampaign = (data, role, push) => (dispatch) => {
  dispatch({
    type: CAMPAIGNS_REQUEST_PENDING,
  })
  dispatch({
    type: BUDGETS_REQUEST_PENDING,
  })

  return axios
    .post('/database/create/campaign', data)
    .then(async (response) => {
      const { campaign, budget } = response.data
      campaign.advertiserName = data.campaign.advertiserName
      dispatch({
        type: CREATE_CAMPAIGN,
        data: {
          campaign,
        },
      })
      dispatch({
        type: CREATE_BUDGET,
        data: {
          budget,
        },
      })
      dispatch({
        type: CAMPAIGNS_REQUEST_FULFILLED,
      })
      dispatch({
        type: BUDGETS_REQUEST_FULFILLED,
      })
      if (data.campaign.isDuplicate) {
        return push(`/campaigns`)
      }
      if (
        data.campaign.modelPayment === CPM ||
        data.campaign.modelPayment === CPC
      ) {
        push(`/campaigns`)
      } else if (data.campaign.disableConversionTest) {
        campaign.campaignId = campaign.id
        await dispatch(submitCampaign(campaign, role, push))
        push(`/campaigns`)
      } else {
        push(`/campaigns/test/${campaign.id}`)
      }
    })
    .catch((e) => {
      dispatch({
        type: CAMPAIGNS_REQUEST_FULFILLED,
      })
      dispatch({
        type: BUDGETS_REQUEST_FULFILLED,
      })
    })
}

export const deleteCampaigns = (data) => (dispatch) => {
  dispatch({
    type: CAMPAIGNS_REQUEST_PENDING,
  })
  dispatch({
    type: BUDGETS_REQUEST_PENDING,
  })

  return axios
    .delete('/database/delete/campaign', { data: { ids: data } })
    .then(() => {
      dispatch({
        type: DELETE_CAMPAIGN,
        data: {
          ids: data,
        },
      })
      dispatch({
        type: DELETE_BUDGET,
        data: {
          ids: data,
        },
      })
      dispatch({
        type: CAMPAIGNS_REQUEST_FULFILLED,
      })
      dispatch({
        type: BUDGETS_REQUEST_FULFILLED,
      })
    })
    .catch(console.log)
}

export const updateCampaignStatus = (data) => async (dispatch) => {
  try {
    if (data.status === ACTIVE) {
      data.statusReason = null
    }
    if (data.status === PAUSED) {
      data.statusReason = 'Campaign stopped by admin'
    }
    const resp = await axios.put('/database/update/campaign-status', data)

    dispatch({
      type: UPDATE_CAMPAIGN_STATUS,
      data,
    })

    NotificationManager[resp.data.message.type](resp.data.message.text)
  } catch (e) {
    console.error(e)
  }
}

export const loadCampaigns = (params) => async (dispatch) => {
  dispatch({
    type: CAMPAIGNS_REQUEST_PENDING,
  })
  const newParams = {}
  if (params) {
    newParams.limit = params.limit
    newParams.offset = params.offset
    if (params.selectedCountry) {
      newParams.selectedCountry = params.selectedCountry.value
    }
    if (params.startDate) {
      newParams.startDate = params.startDate
    }
    if (params.endDate) {
      newParams.endDate = params.endDate
    }
  }

  const paramsStr = newParams ? querystring.stringify(newParams) : ''

  const response = axios
    .get(`/database/load/campaigns?${paramsStr}`)
    .then((response) => {
      const { campaigns } = response.data
      dispatch({
        type: LOAD_CAMPAIGNS,
        data: {
          campaigns,
          count: campaigns.count,
        },
      })
      dispatch({
        type: CAMPAIGNS_REQUEST_FULFILLED,
      })
      return campaigns
    })
    .catch(console.log)
}

export const loadInventories = (criteria) => async (dispatch) => {
  try {
    dispatch({ type: CAMPAIGNS_REQUEST_PENDING })

    const params = querystring.stringify(criteria)
    const apiUrl = `/database/load/inventories?${params}`
    const { data } = await axios.get(apiUrl)

    dispatch({ type: LOAD_INVENTORIES, data })
  } catch (e) {
    console.error(e)
  } finally {
    dispatch({ type: CAMPAIGNS_REQUEST_FULFILLED })
  }
}

export const loadCampaignAudiences = (id) => async (dispatch) => {

  try {
    dispatch({ type: CAMPAIGNS_REQUEST_PENDING })

    const apiUrl = `/audience/load/list?`
    const { data } = await axios.get(apiUrl)
    dispatch({ type: LOAD_CAMPAIGN_AUDIENCES, data: data.data })
  } catch (e) {
    console.error(e)
  } finally {
    dispatch({ type: CAMPAIGNS_REQUEST_FULFILLED })
  }
}

export const loadDataPartners = (params) => async (dispatch) =>{
  dispatch({
    type:   DATA_PARTNERS_REQUEST_PENDING,
  })
  const newParams = {}
  if(params) {
    newParams.limit = params.limit
    if(params.after){
    newParams.after = params.after
    }
  }

  const paramsStr = newParams ? querystring.stringify(newParams) : ''
  // console.log("params qq", params.filter)
  try{
     const { data } = await axios.get(`/dmp/segments/${params.filter}?${paramsStr}`)
    //  console.log("digiseg act qq", data)
    dispatch({
      type: LOAD_DATA_PARTNERS, 
      filter: params.filter,
      data 
    });
  } catch (e) {
    console.error(e);
  } finally {
    dispatch({ type: DATA_PARTNERS_REQUEST_FULFILLED })
  }
}


export const loadBudgets = () => (dispatch) => {
  dispatch({
    type: BUDGETS_REQUEST_FULFILLED,
  })

  axios
    .get('/database/load/budgets')
    .then((response) => {
      const { budgets } = response.data

      dispatch({
        type: LOAD_BUDGETS,
        data: {
          budgets,
        },
      })
      dispatch({
        type: BUDGETS_REQUEST_FULFILLED,
      })
    })
    .catch(console.log)
}

export const updateCampaign = (data) => (dispatch) => {
  dispatch({
    type: CAMPAIGNS_REQUEST_PENDING,
  })
  dispatch({
    type: BUDGETS_REQUEST_PENDING,
  })

  if (data.status === ACTIVE) {
    data.statusReason = null
  }
  if (data.status === PAUSED) {
    data.statusReason = 'Campaign stopped by admin'
  }

  return axios.put('/database/update/campaign', data).then((response) => {
    const { campaign, budget, success, msg } = response.data

    if (!success) {
      NotificationManager.error(msg)
    } else {
      dispatch({
        type: UPDATE_CAMPAIGN,
        data: {
          campaign,
        },
      })
      dispatch({
        type: UPDATE_CAMPAIGN_STATISTIC,
        data: {
          campaign,
        },
      })
      dispatch({
        type: UPDATE_BUDGET,
        data: {
          budget,
        },
      })
      NotificationManager.success(
        `${data.campaign.campaignName} (id: ${data.campaign.campaignId}) campaign is updated`,
      )
    }
    dispatch({
      type: CAMPAIGNS_REQUEST_FULFILLED,
    })
    dispatch({
      type: BUDGETS_REQUEST_FULFILLED,
    })
    window.history.back()
  })
}

export const submitCampaign = (params, role, push) => async (dispatch) => {
  try {
    const {
      data: { data, success, msg },
    } = await axios.put('/database/update/submit-campaign', params)

    dispatch({
      type: SUBMIT_CAMPAIGN,
      data,
    })
    if (params.disableTestLink) {
      if (!success) {
        await dispatch(
          updateCampaignStatus({
            ids: [data.id],
            status: PAUSED,
          }),
        )
        msg && NotificationManager.error(msg)
      }
      if (success) {
        await dispatch(
          updateCampaignStatus({
            ids: [data.id],
            status: ACTIVE,
          }),
        )
        NotificationManager.success('Campaign activated!')
      }
      push(`/campaigns`)
    } else {
      push(`/verify-tracking-link`)
    }
  } catch (e) {
    console.log(e)
  }
}

export const setCurrentCampaign = (data) => ({
  type: SET_CURRENT_CAMPAIGN,
  payload: data,
})

export const changeIdsList = (list) => async (dispatch) => {
  dispatch({ type: CHANGE_TAGS_IDS, payload: list })
}

export const resetCurrentCampaign = () => ({ type: RESET_CURRENT_CAMPAIGN })

export const loadCategories = () => async (dispatch) => {
  try {
    const { data } = await axios.get(`/utils/categories`)
    dispatch({ type: LOAD_CAMPAIGN_CATEGORIES, payload: data })
  } catch (e) {
    console.error(e)
  }
}

export const getCountCampaigns = (options) => {
  return axios.post(`/database/load/count-campaigns`, options)
}

