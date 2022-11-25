import React, { Fragment, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import moment from "moment";
import ControlPanel from "./ControlPanel";
import AudiencesList from "./AudiencesList";
import { loadAudiences } from "../../../actions/audience";
import TopBar from "../../common/TopBar/TopBar";
import localization from "../../../localization";
import { ThirdParty } from "../../UI/ThirdParty"; 

function AudiencesPage(props) {
  
  const thirdPartydata = ThirdParty
  const dispatch = useDispatch();
  const [searchValue, setSearchValue] = useState("");
  const [name, setName] = useState("My segments") // toggle state
  const [partnerFilter, setPartnerFilter] = useState()
  const [rowData, setRowData] = useState(thirdPartydata)
  const [filters, setFilters] = useState({
    startDate: moment().add(-6, "months").format("YYYY-MM-DD"),
    endDate: moment().format("YYYY-MM-DD"),
  });

  useEffect(() => {
    dispatch(loadAudiences());
  }, []);

  return (
    <Fragment>
      <TopBar title={localization.header.nav.audience} />
      <ControlPanel
        {...props}
        filters={filters}
        setFilters={setFilters}
        setSearchValue={setSearchValue}
        setRowData={setRowData}
        thirdPartyData = {thirdPartydata} 
        name = {name}
        setPartnerFilter = {setPartnerFilter} 
      />
      <AudiencesList 
        searchValue={searchValue} 
        {...props} 
        setName = {setName} 
        thirdPartyData = {thirdPartydata} 
        rowData = {rowData}
        partnerFilter = {partnerFilter} 

      />
    </Fragment>
  );
}

export default AudiencesPage;
