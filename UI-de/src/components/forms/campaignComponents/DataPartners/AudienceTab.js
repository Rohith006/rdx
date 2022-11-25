import React, { Fragment, useState } from 'react'
import { Button } from 'react-bootstrap';
import {FaTimes} from 'react-icons/fa';
import Modal from 'react-modal';
import { normalizeBoolean } from "../../../../utils/normalizers";
import {AND, OR } from "../../../../constants/campaigns";
import { Field } from "redux-form";
import 'react-confirm-alert/src/react-confirm-alert.css'
import { NotificationManager } from 'react-notifications'
import ListData from './ListData'
import SegmentsData from './SegmentsData'
import localization from '../../../../localization'

const AudModal = (props) => {
    const { show, onCloseModal, segId, filterName, rowValues, onChangeSegId, dataParties, finalGroups, formData, handleOnChange, groupsListdata, mySegmentsData, thirdPartyFilters,isRequestPending, pagination, limit, digiseg, partnerFilter, tableData } = props
    const [innerToggle, setInnerToggle] = useState("or")
    const [outerToggle, setOuterToggle] = useState("and")
    let [draggedRow, setDraggedRow] = useState('');
    let [dataGroup, setDataGroup] = useState(''); 
    let [groups, setGroups] = useState([]); 
    let [count, setCount] = useState(1);
    let [indexing, setIndexing] = useState([]);
    let [minCost, setMinCost] = useState('');
    let [maxCost, setMaxCost] = useState('');
    const [groupCost, setGroupCost] = useState('')
    let [getData, setGetData] = useState([]); 
    let arrGroup = [];

    const handleCreateGroup = e => {
        if(e.target.id == ("1") || e.target.id == ("2")|| e.target.id == ("3") || e.target.id == ("4")) {
            setCount(count + 1);
            if(count > 1) {
                let toggle = outerToggle === OR ? outerToggle : innerToggle;
                groups.push({count, toggle});
                groups.map((el) =>(el.toggle = toggle))
            }else {
                groups.push({count});
            };
        };
    };

    const clearGroup = e => {
        groups = [];
        count = 1;
        maxCost = "" ;
        minCost = "" ;
        setGroups(groups);
        setCount(count);
        setMaxCost(maxCost);
        setMinCost(minCost);
        setGroupCost(groupCost)
        arrGroup = [];
        dataGroup = ''
        setDataGroup(dataGroup);
        setGetData([])
        indexing = [];
        setIndexing(indexing);
        NotificationManager.success("all groups data is cleared")
    }

    const CheckGroup = (el) => {
        const cond = arrGroup.includes(el);
        if(!cond) {
            arrGroup.push(el);
        }
        return cond;
    }

    function insertGroup(group, name, toggle, cost, elid, partnerName) {
        let data =  getData; 
        let condition = false;
        data.map(el => {
            if((el.group == group) && (el.name === name)) {
                condition = true;
            }
        })
        if(!condition) {
            data.push({group, name, cost, toggle, elid, partnerName});
            data.map((item)=> ((item.toggle = toggle)))
            setDataGroup(data)
        }
        estimatedcost(data)
    }    

    const handleAddGroup = (data, index, price, id) => {
        let name = data;
        let group = index + 1;
        let cost = price
        let elid = id
        let toggle
        let partnerName = filterName

        if(outerToggle === "AND") {
            toggle = "OR";
        } else {
            toggle = "AND";
        }
        if(group) {
            insertGroup(group, name, outerToggle, cost, elid, partnerName);
            setGetData([...getdata, {group, name, outerToggle, cost, elid, partnerName}])
        }        
    }

    const handleDraggable = (dragEvent) => {
        if(dragEvent.event.target && dragEvent.event.target.offsetParent.classList.contains('ag-row')) {
            dragEvent.event.target.offsetParent.setAttribute("draggable", "true");
            dragEvent.event.target.offsetParent.addEventListener('dragstart', (event) => {
                event.dataTransfer.setData('data', 'data');
                  draggedRow = dragEvent.data;
                  setDraggedRow(draggedRow);
            }, true);
        }
    }

    const handleDrop = (e, index) => {
        e.preventDefault();
        const {name, price, id} = draggedRow;
        handleAddGroup(name, index, price, id);
        setGetData({id, price, index, name})
    }
    const handleTab = e => {
        onChangeSegId(e.target.id);
    }
 
    let handleExcludeItem = e => {
        let group = "";
        let value = "";
        let arr = [];
        let exclude = false;     

        if(e.target.parentNode.parentNode.id != '') {
            arr = e.target.parentNode.parentNode.id.split(',');
            group = arr[0];
            value = arr[1];
            exclude = arr[2];       
        }
        if(e.target.id != '') {
            arr = e.target.id.split(',');
            group = arr[0];
            value = arr[1];
            exclude = arr[2];
        }
        if(e.target.parentNode.id != '') {
            arr = e.target.parentNode.id.split(',');
            group = arr[0];
            value = arr[1];
            exclude = arr[2];
        }
        let data = getData
        data = data.map((el, index) => {
            if((el.group == group) && (el.name == value)) {
                let exc = !el.exclude;
                return {group: el.group, name: el.name, toggle: el.toggle, cost:el.cost, exclude: exc};
            }
            return el;
        })
        dataGroup = data;
        setDataGroup(data);
        setGetData(data);
    }

    let handleDelete = e => {
        let group = "";
        let value = "";
        let arr = [];
        
        if(e.target.parentNode.parentNode.id != '') {
            arr = e.target.parentNode.parentNode.id.split(',');
            group = arr[0];
            value = arr[1];
        }
       if(e.target.id != '') {
            arr = e.target.id.split(',');
            group = arr[0];
            value = arr[1];
        }
        if(e.target.parentNode.id != '') {
            arr = e.target.parentNode.id.split(',');
            group = arr[0];
            value = arr[1];
        }
        let ind = '';
        dataGroup.map((el, index) => {
            if ((el.group == group) && (el.name === value)) {
                ind = index;   
            }
        });
        let data = dataGroup.slice();
        data.splice(ind, 1);
        dataGroup = data
        setDataGroup(dataGroup);
        estimatedcost(data)
        setGetData(dataGroup)
    }

    const createAudience = () => {
        const groupsData = [...dataGroup && dataGroup.reduce((r, { group, name, toggle, cost }) => {
            r.has(group) || r.set(group, {
              group,
              segments: []
            });
            
            r.get(group).segments.push({ name, toggle, cost});
            
            return r;
          }, new Map).values()];
        finalGroups(dataGroup),
        groupsListdata(innerToggle)
        if(dataGroup == null || dataGroup.length == 0) {
            NotificationManager.error("somethimg went wrong")
        } else{
            NotificationManager.success("successfully created")
        }
    }

    const estimatedcost = (data) => {
        const costArray = data.map((c)=> c.cost)  
        const costValues = costArray.filter((el) => {return el !== undefined})
        const minCostIn = Math.min.apply(null, costValues.map((c)=>  (c)))
        const maxCostIn = Math.max.apply(null, costValues.map((c)=>  (c)))
        minCostIn == Infinity ? setMinCost(null) : setMinCost(minCostIn)
        maxCostIn == -(Infinity) ? setMaxCost(null) : setMaxCost(maxCostIn)  

        const groupsData = [...data && data.reduce((r, { group, name, toggle, cost }) => {
            r.has(group) || r.set(group, {
              group,
              segments: []
            });
            
            r.get(group).segments.push({ name, toggle, cost});
            
            return r;
          }, new Map).values()];
        
        const range = groupsData.map((el)=>el.segments.map((c)=> c.cost))
        const costOR = range.map((el)=>el.reduce((a, b)=> Math.max(a, b)))
        setGroupCost(costOR)
    }

    const renderRadioFields = ({ input, id, val, toggle, title, checked, disabled }) =>{
        if (input.value === OR){
            setInnerToggle("AND")
            setOuterToggle("or")
            
        } else{
            setInnerToggle("OR")
            setOuterToggle("and")
        }
        return (
          <div
            className={`radio-control pill-control ${disabled ? "disabled" : ""}`}
          >
            <input
              {...input}
              type="radio"
              onChange={input.onChange}
              disabled={disabled}
              toggle = {toggle}
              id={id}
              value={val}
              checked={checked}
            />
            <label htmlFor={id}>
              <span className="radio-control__indicator" />
              {title}
            </label>
          </div>
        );
    }

      return (
            <Fragment>
                <div className="overlay" />
                <Modal
                    isOpen={show}
                    className={'logs_modal card aud_tab modal_box_conatiner' }
                    overlayClassName="modal-container"
                >
                    <div className="card_header bordered audience" 
                    >
                        <div className="subheading_cover">
                            <h2 className="heading">
                                {localization.campaigns.dataPartners.segmentActivation}
                            </h2>
                                <div className="close-btn" onClick={onCloseModal}>
                                    <FaTimes size={20} />
                                </div>
                        </div>
                    </div>
                    <div className="card_body aud_modal right_container">
                        <Fragment>
                            <div className = "aud_tabs" >                            
                                <div className = "aud_tabs_title">
                                    <span 
                                        id= "1" 
                                        className = {`aud_tabs_title_name ${segId == "1" ? "tab_active" : "tab_inactive"}`}
                                        onClick={e => handleTab(e)}
                                    >
                                        {localization.campaigns.dataPartners.mySegments}
                                    </span>

                                    <span   
                                        id = "2" 
                                        className = {`aud_tabs_title_name ${segId == "2" ? "tab_active" : "tab_inactive"}`}
                                        onClick={e => handleTab(e)}
                                    >
                                        {localization.campaigns.dataPartners.thirdPartySegments}
                                    </span>
                                </div>
                            </div>
                            <div className = "data_container" >
                                <div className = "data_container_group">

                                    <ListData 
                                        segId = {segId}
                                        handleOnChange = {handleOnChange}
                                        filterName = {filterName}
                                        handleDraggable = {handleDraggable}
                                        mySegmentsData = {mySegmentsData}
                                        dataParties = {dataParties}
                                        thirdPartyFilters = {thirdPartyFilters}
                                        isRequestPending = {isRequestPending}
                                        pagination = {pagination}
                                        rowValues = {rowValues}
                                        limit = {limit}
                                        digiseg = {digiseg}
                                        partnerFilter = {partnerFilter}
                                        // digiseg = {digiseg}
                                        tableData = {tableData}
                                    /> 

                                    <SegmentsData 
                                        clearGroup = {clearGroup}
                                        formData = {formData}
                                        renderRadioFields ={renderRadioFields}
                                        groups ={groups}
                                        innerToggle ={innerToggle}
                                        outerToggle = {outerToggle}
                                        onDrop={handleDrop}
                                        Count = {count}
                                        dataGroup = {dataGroup}
                                        CheckGroup = {CheckGroup}
                                        handleExcludeItem = {handleExcludeItem}
                                        handleDelete = {handleDelete}
                                        handleCreateGroup = {handleCreateGroup}
                                        maxCost = {maxCost}
                                        minCost = {minCost}
                                    />
                                </div>
                            </div>
                            <div className = "modal_footer" >
                                <Button  className = "cancel-aud-btn"   
                                onClick={onCloseModal}>Cancel</Button>
                                <Button 
                                    type = "submit" 
                                    className = "cancel-aud-btn create_audience"
                                    onClick={createAudience}>
                                        {localization.campaigns.dataPartners.createAudience}
                                </Button> 
                            </div>
                        </Fragment>
                    </div>
                </Modal>
            </Fragment>
    )
}
export default AudModal

