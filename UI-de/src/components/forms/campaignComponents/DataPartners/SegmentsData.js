import React, { Fragment, useState } from 'react';
import { Field } from "redux-form";

import { normalizeBoolean } from "../../../../utils/normalizers";
import {AND, OR } from "../../../../constants/campaigns";
import localization from '../../../../localization'
import GroupsData from './GroupsData'


const SegmentsData = (props) => {

    const { formData, clearGroup, renderRadioFields, groups, innerToggle, outerToggle, handleCreateGroup, onDrop, count, dataGroup, CheckGroup, handleExcludeItem, handleDelete, maxCost, minCost} = props;
    
    return(
        <Fragment>
        <div className="data_container_right">
            <div className="toggle-container">
                <div className="toggle_buttons">
                    <div className="form-group">
                        <div className="form-group_row">
                            <Field
                                name="toggle"
                                component={renderRadioFields}
                                id = "or"
                                title="OR"
                                val={OR}
                                checked={
                                    formData.toggle === OR
                                }
                                normalize={normalizeBoolean}
                            />
                            <Field
                            name="toggle"
                            component={renderRadioFields}
                            title="AND"
                            val={AND}
                            checked={formData.toggle === AND}
                            normalize={normalizeBoolean}
                            />
                        </div>
                    </div>
                    <div className="segments_toggle" >
                        <span className="">
                        {localization.campaigns.dataPartners.betweenSegments}
                        </span>
                    </div>
                    <div onClick={clearGroup} className="clear_all">
                        <span >
                        {localization.campaigns.dataPartners.clearAll}
                        </span>
                    </div>
                </div>
            </div>

        <GroupsData 
            groups = {groups}
            innerToggle = {innerToggle}
            outerToggle = {outerToggle}
            onDrop = {onDrop}
            dataGroup = {dataGroup}
            handleExcludeItem = {handleExcludeItem}
            handleDelete = {handleDelete}
            handleCreateGroup = {handleCreateGroup}
            CheckGroup = {CheckGroup}
        />
        
        <div className = "cost_calculate">
            { outerToggle == "and" ? 
            <span> 
                {localization.campaigns.dataPartners.estDataCost} <b>${maxCost} CPM </b>
            </span> : 
            
                (maxCost === minCost ? <text>
                    {localization.campaigns.dataPartners.estDataCost} <b>${maxCost} CPM </b>
                    </text> : 
                    <text>{
                        localization.campaigns.dataPartners.estDataCost} <b>${minCost} - {maxCost} CPM </b>
                    </text>
                )
            }
                
        </div>
    </div>
    </Fragment>
    )
}

export default SegmentsData