import React,{useState} from 'react'
import { useDispatch } from 'react-redux'
import { reduxForm } from 'redux-form'
import { Link } from 'react-router-dom'
import localization from '../../../localization';
import { ExtraDatePicker, Search, ApplyButton, HeaderSection } from '../../UI'
import DropDownFilter from '../../UI/DropDownFilter'
import { selectConfig, validate } from '../Utils'
import { loadAudiences } from '../../../actions/audience'
import DisplayCheck from '../../../permissions'
import {  THIRD_PARTY_SEGEMENTS} from "../../../constants/app";
import Select from "react-select";
import { styles } from "../../UI/selectStyles";
import { thirdPartyFilters } from '../../UI/ThirdParty';

import {
  ACCOUNT_MANAGER,
  ADMIN,
  ADVERTISER,
  OWNER,
} from '../../../constants/user'

function ControlPanel(props) {
  const { setSearchValue, setFilters, filters, setRowData, setPartnerFilter, thirdPartyData } = props
  const [filterName, setFilterName] = useState({status:null})
  // const [rowData, setRowData] = useState('')
  const dispatch = useDispatch()

  function onSearchInputChange({ target: { value } }) {
    setSearchValue(value)
  }

  function handleSubmit() {
    if (!props.valid) return
    dispatch(loadAudiences(filters))
  }

  function onChangeFilter(value, type) {
    // TODO Change logic when new filters will be added
    const filterValue = type === 'status' ? value : value.value.format('YYYY-MM-DD')
    setFilters({ ...filters, [type]: filterValue.value ? filterValue.value: null })
    setFilterName({...filters, [type]: filterValue.value ? filterValue:null})
  }

  function onChangeDate(value,type) {
    const filterValue = value.format('YYYY-MM-DD')
    setFilters({ ...filters, [type]: filterValue})
  }

  return (
    <div className="card"  style={{marginBottom:0, marginTop:8, borderRadius:'4px 4px 0 0'}}>
      { props.name === "My segments" ? 
        <form className="form_cover">
          <div className="form_cover_audience">
            <Search onSearch={onSearchInputChange} />
            <DropDownFilter
              name="Status"
              placeholder="Status"
              options={selectConfig.status}
              onChange={(data) => onChangeFilter(data, 'status')}
              value={filterName.status}
            />
            <ExtraDatePicker
              startDate={filters.startDate}
              endDate={filters.endDate}
              showRanges={false}
              onSelectTimeChange={onChangeDate}
            />
            <ApplyButton onClick={handleSubmit} />
          </div>

          <DisplayCheck roles={[ADMIN, OWNER, ADVERTISER, ACCOUNT_MANAGER]}>
            <Link to="/audiences/create">
              <button type="button" className="btn neutral add">
              {localization.forms.addNew}
              </button>
            </Link>
          </DisplayCheck>
        </form> : 
        <form className="form_cover">
          <div className="form_cover_audience">
            <Search onSearch={onSearchInputChange} />
            <div className="form-group">
              <div  style = {{width:200}}>
                <Select
                    name= "partner"
                    placeholder="Partner"
                    className="country-select"
                    options={thirdPartyFilters.filterData}
                    onChange={onChangePartnerFilter}
                    selectedValue = {filterName}
                    styles={styles}
                    theme={(theme) => ({
                        ...theme,
                        colors: {
                        ...theme.colors,
                        primary: "#000000",
                        },
                    })}
                  />
              </div>
            </div>
                                                                
          </div>
        </form>
      }
    </div>
  )
}
export default reduxForm({
  form: 'AudienceFilterForm',
  validate,
})(ControlPanel)

