import React from 'react';
import {AND, OR } from "../../../../constants/campaigns";
import exclude from "../../../../../assets/images/icons/exclude.svg";
import excludeActive from "../../../../../assets/images/icons/exclude_active.svg";
import deleteIcon from "../../../../../assets/images/icons/delete2.svg";
import addIcon from "../../../../../assets/images/icons/addIcon.svg"
import localization from '../../../../localization'

const  GroupsData = ({groups, innerToggle, outerToggle, onDrop, dataGroup, handleExcludeItem, CheckGroup, handleDelete, handleCreateGroup}) => {

    const handleDragOver = e => {
        e.preventDefault();
    }
    const handleDragLeave = e => {
        e.preventDefault();
    }
    return(
        <div className = "groups_container">
            <div>
                {groups.length >=1 && groups.map((g1, ind) => 
                    <div className = "groups_data" key={ind}>
                        { ind >= 1 &&
                            <div className = "outer_toggle">
                                {innerToggle}
                            </div>
                        }
                    <div className="Drag-Group"
                        key={ind} 
                        onDragOver={e => handleDragOver(e)}
                        onDragLeave={e => handleDragLeave(e)} 
                        onDrop={e => onDrop(e, ind)}
                    >
                        <div className="group_name">
                            Group {g1.count}
                        </div>
                        
                        <div className = "segments_data">
                            {dataGroup.length >=1 && dataGroup.map((el, index) => (el.group == g1.count &&  !CheckGroup(el.group)) ? 
                                <div 
                                    className = {`${el.exclude == true ? 'segments_data_list_exclude' : 'segments_data_list'}`}
                                    key={index}
                                >
                                    <div className = "segment_name">
                                        <span> {el.name} </span>
                                        {el.cost && <span>${el.cost} </span>}
                                    </div>
                                    <div  className = "action_icons">
                                        <div className = "exclude"
                                            id={`${el.group},${el.name},${el.exclude}`} 
                                            onClick={e => handleExcludeItem(e)}
                                        >
                                            {
                                                el.exclude == true ?
                                                < img src = {excludeActive} />: <img src = {exclude}  /> 
                                            }
                                        </div>
                                    
                                        <div id={`${el.group},${el.name}, ${el.exclude}`} className = "exclude"    onClick={e => handleDelete(e)}>
                                            <img src = {deleteIcon} />
                                        </div>
                                    </div>
                                </div> 
                                : (el.group == g1.count) ?
                                    <div className = "group_second_list" key={index}>
                                        <div className = "inner_toggle" >
                                            {outerToggle}
                                        </div>
                                        <div 
                                            className = {`${el.exclude == true ? 'group_second_list_data_exclude' : 'group_second_list_data'}`}
                                        >
                                            <div className = 'group_second_list_title'>
                                                <span> {el.name} </span>
                                                {el.cost && <span>${el.cost} </span>}
                                            </div>
                                            <div id={`${el.type},${el.name}, ${el.exclude}`} className = 'group_second_list_icon'>
                                            
                                                <div id={`${el.group},${el.name}, ${el.exclude}`} className = "exclude" onClick={e => handleExcludeItem(e)}>
                                                    {
                                                        el.exclude === true ?
                                                            < img src = {excludeActive} />
                                                            : <img src = {exclude} />   
                                                    }
                                                </div>
                                            
                                                <div 
                                                    id={`${el.group},${el.name}, ${el.exclude}`} 
                                                    className = "exclude" onClick={e => handleDelete(e)}
                                                >
                                                    <img src = {deleteIcon} />
                                                </div>
                                            </div>
                                        </div>
                                    </div> : ''
                                )} 
                        </div>
                    </div>
                </div>
                )}
                
                <div id="1" className="create_new_group" onClickCapture={handleCreateGroup}>
                    <div id="2" className = "create_button">
                        <div id="3">
                        <img src = {addIcon} />
                        </div>
                        <div id="4" className = "create_title">
                            {localization.campaigns.dataPartners.createNewGroup}
                        </div>                                                    
                    </div>
                </div>
            </div>            
        </div>
    )
}

export default GroupsData