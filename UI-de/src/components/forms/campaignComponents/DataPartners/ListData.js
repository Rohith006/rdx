import React, { Fragment, useState ,useEffect, } from 'react';
import Select from "react-select";
import { reduxForm, Field, formValueSelector } from "redux-form";
import { bindActionCreators } from "redux";
import {  useDispatch } from "react-redux";
import { AgGridReact, AgGridColumn  } from "ag-grid-react";
import { styles } from "../../../UI/selectStyles";
import {SvgSearch } from '../../../common/Icons';
import PendingContainer from "../../../UI/PendingContainer";
import {loadDataPartners} from '../../../../actions/campaigns&budgets';
import localization from '../../../../localization';
import { set } from 'lodash';

const ListData = (props) => {
  
  const { segId, handleDraggable, isRequestPending, thirdPartyFilters, mySegmentsData, filterName, handleOnChange, pagination, rowValues, limit, digiseg, partnerFilter, } = props;

    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [count, setCount] = useState(1); // page count
    const [pageIndex, setPageIndex] = useState(0)
    const [pageIndexMax, setPageIndexMax] = useState(10);
    const [pageIndexMin, setPageIndexMin] = useState(1)
    const [rowData, setRowData] = useState([]);
    const [prevPage, setPrevPage] = useState([]);
    const [pageValue, setPageValue] = useState([limit])
    const [start, setStart] = useState(10)
    const[end, setEnd] = useState(20)
    const [pageCount, setPageCount] = useState()
    const dispatch = useDispatch();
    const [ DataSegments, setDataSegments] = useState([
      {
        headerName: 'Name',
        field: 'name',
        width: 410, 
        wrapText: true,
        autoHeight: true,
        cellStyle: {
          'white-space': 'pre-line', 
          'text-align': 'left',
          'padding': '0px 4%'
        }     
      }, {
        headerName: 'ID',
        field: 'id',
        width: 110,
      
      }, {
        headerName: 'Price($)',
        field: 'price',
        width: 110,
      }
    ]);

    useEffect(() => {
      setRowData(rowValues)
    }, [rowValues]);

    useEffect(() => {
      setRowData(digiseg.slice(0, 10))
    }, [digiseg]);

    useEffect(() => {
      if(rowValues.length > 0){
        setPrevPage([...prevPage, rowValues])
      } 
    }, [rowValues]);

    const handleSearchFilter = e => {
        gridApi.setQuickFilter(e.target.value);
    };
  
  const onBtNext = (e) => {
    if(pageIndex == prevPage.length-1) {
      const {value} = e.target;
      dispatch(loadDataPartners({limit : pageValue, after : value, filter: partnerFilter}));
      setRowData(rowValues);
    } else {
      setRowData(prevPage[pageIndex+1]); 
    }
    setCount(count+1);
    setPageIndex(pageIndex + 1);
    setPageIndexMax(10)
    setPageIndexMin(0)
  };

  const onBtPrevious = () => {
      setRowData(prevPage[pageIndex-1])
      setPageIndex(pageIndex-1);
      setCount(count-1);
  } 
  const pageSizeSort = (e) => {
      const {value} = e.target;
      setCount(1);
      setPageIndex(0);
      setPrevPage([]);
      setPageIndexMin(1);
      setStart(1)
      if (value == 25){
        if(partnerFilter == "Digiseg"){
          setRowData(digiseg.slice(0,25))
          setEnd(25)
          setStart(0)
          setPageCount(digiseg.length/25)
        } else{
          dispatch(loadDataPartners({limit: 25, filter: partnerFilter}));
          setRowData(rowValues);
        }
        setPageIndexMax(25);
        setPageValue(value);

      } 
      else if(value == 50) {
        if(partnerFilter == "Digiseg"){
          setRowData(digiseg.slice(0,50))
          setPageCount(digiseg.length/50)
        } else{
          dispatch(loadDataPartners({limit: 50, filter: partnerFilter}));
          setRowData(rowValues);
        }
        setPageIndexMax(50);
        setPageValue(value);

      }  
      else if(value == 75) {
        if(partnerFilter == "Digiseg"){
          setRowData(digiseg.slice(0,75))
        } else{
          dispatch(loadDataPartners({limit: 75, filter: partnerFilter}));
          setRowData(rowValues);
        }
      
        setPageIndexMax(75);
        setPageValue(value);

      } 
      else if(value == 100) {
        dispatch(loadDataPartners({limit: 100, filter: partnerFilter}));
        setRowData(rowValues);
        setPageValue(value);
        setPageIndexMax(100);
      } 
  }

  const nextToggle = () => {
    setRowData(digiseg.slice((start + parseInt(pageValue)), (end + parseInt(pageValue)))) 
    setPrevPage([])
    setPageIndex(0)
    setPageIndexMax(10)
    setPageIndexMin(0)
    setCount(count+1);
    if(pageValue  == 25){
      setEnd(end + 25)
      setStart(start + 25)
      let pageCountValue = digiseg.length/25
      setPageCount(Math.ceil(pageCountValue))
    } else if(pageValue  == 50){
      setEnd(end + 50)
      setStart(start + 50)
      let pageCountValue = digiseg.length/50
      setPageCount(Math.ceil(pageCountValue))
    } else if(pageValue  == 75){
      setEnd(end + 75)
      setStart(start + 75)
      let pageCountValue = digiseg.length/75
      setPageCount(Math.ceil(pageCountValue))
    } else if(pageValue  == 100){
      setEnd(end + 100)
      setStart(start + 100)
      let pageCountValue = digiseg.length/100
      setPageCount(Math.ceil(pageCountValue))
    }
    else{
      setEnd(end + 10)
      setStart(start + 10)
      setRowData(digiseg.slice(start, end)) 
      let pageCountValue = digiseg.length/10
      setPageCount(Math.ceil(pageCountValue))
    }
  }

  const prevToggle = (e) => {
    setRowData(digiseg.slice((start - parseInt(pageValue)), (end - parseInt(pageValue)))) 
    setEnd(end - 10)
    setStart(start - 10)
    if(pageValue  == 25){
      setRowData(digiseg.slice((start - parseInt(pageValue)), (end - parseInt(pageValue)))) 
      setEnd(end - 25)
      setStart(start - 25)
    } else if(pageValue  == 50){
      setEnd(end - 50)
      setStart(start - 50)
    } else if(pageValue  == 75){
      setEnd(end - 75)
      setStart(start - 75)
    } else if(pageValue  == 100){
      setEnd(end - 100)
      setStart(start - 100)
    } else {
      setRowData(digiseg.slice(start - 20, end - 20))
      setEnd(end - 10)
      setStart(start - 10)
    }
  }

  const nextHandle = (e) => {
    if(partnerFilter == "Liveramp"){
      onBtNext(e)
    } else if (partnerFilter == "Digiseg"){
      nextToggle()
    }
    if(pageValue  == 25){
      setPageIndexMax(pageIndexMax + 25);
      setPageIndexMin(pageIndexMin + 25);
      setEnd(end + 25)
      setStart(start + 25)
    } else if(pageValue  == 50){
      setPageIndexMax(pageIndexMax + 50);
      setPageIndexMin(pageIndexMin + 50);
    } else if(pageValue  == 75){
      setPageIndexMax(pageIndexMax + 75);
      setPageIndexMin(pageIndexMin + 75);
    } else if(pageValue  == 100){
      setPageIndexMax(pageIndexMax + 100);
      setPageIndexMin(pageIndexMin + 100);
    } else{
      setPageIndexMax(pageIndexMax + 10);
      setPageIndexMin(pageIndexMin + 10);
    }
  }

  const prevHandle = (e) => {
    if(pageValue == 25){
      setPageIndexMax(pageIndexMax - 25);
      setPageIndexMin(pageIndexMin - 25);
    } else if(pageValue  == 50){
      setPageIndexMax(pageIndexMax - 50);
      setPageIndexMin(pageIndexMin - 50);
    } else if(pageValue  == 75){
      setPageIndexMax(pageIndexMax - 75);
      setPageIndexMin(pageIndexMin - 75);
    } else if(pageValue  == 100){
      setPageIndexMax(pageIndexMax - 100);
      setPageIndexMin(pageIndexMin - 100);
    } else{
      setPageIndexMax(pageIndexMax - 10);
      setPageIndexMin(pageIndexMin - 10);
    }
    if(partnerFilter == "Liveramp"){
      onBtPrevious(e)
    } else if (partnerFilter == "Digiseg"){
      prevToggle()
    } else {
    }
  }

  const handleDropDown =  (e) => {
    handleOnChange(e)
    setPageIndexMax(10)
    setPageIndexMin(1)
    setStart(10)
    setEnd(20)
  }


  const gridOptions = ({
    // pagination : true,
    headerHeight : 45,
    enableFilter: true,
    enableSorting : true,
    enableColResize: true,
    paginationPageSize: 10,
    animateRows: true,
  });

  const onGridReady = (params) => {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
  };
   
  
    return(
      <div className ="data_container_left">
        <div className ="aud_filters" >
            <div className ="aud_filters_search" >
                <div className="search_cover" >
                    <span className="icon">
                        <SvgSearch  /> 
                    </span>
                    <input
                        placeholder="Search..."
                        className = "search-input"
                        autoComplete="off"
                        onChange={e => handleSearchFilter(e)}
                    />
                </div>
            </div>
            {segId == "2"  ? 
                <div className="form-group">
                    <div className = "partner_filter">
                      <Select
                        name= "partner"
                        placeholder="Partner"
                        className="country-select"
                        options={thirdPartyFilters.filterData}
                        onChange={handleDropDown}
                        selectedValue = {filterName}
                        value = {filterName}
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
                : ""
            }
        </div>
        { segId == "1" && 
          <div className="ag-grid-table">  
              <div className="aud-List table" >
                  <div className="ag-theme-balham table" >
                      <AgGridReact
                          rowData = {mySegmentsData}
                          gridOptions = {gridOptions}
                          pagination = {true}
                          rowHeight= {39}
                          onGridReady={onGridReady}
                          onCellMouseOver={e => handleDraggable(e)}
                          columnTypes = {{
                              nameColumn: {
                                  width: 530,
                              },
                              idColumn: {
                                  width: 100,
                              },
                          }}
                      >
                          <AgGridColumn headerName = "Name" field="name"  type = "nameColumn" colId ='name' />
                          <AgGridColumn field="id" headerName = "ID" type = "idColumn" colId ='id' />
                      </AgGridReact>
                  </div>
              </div>
          </div>
        } 
        <PendingContainer isPending = {isRequestPending} >
          { segId == "2" && 
            <div className="ag-grid-table " style = {{height: 445}} >
                <div className="aud-List table_third_party" >
                    <div className="ag-theme-balham table" >
                      { !filterName  ? 
                        <div className = "grid_slection_text" >
                          <span>{localization.campaigns.dataPartners.pleaseSelectTheFilter}</span> 
                        </div> :
                        <Fragment>
                          <AgGridReact
                              rowData = {rowData}
                              columnDefs={DataSegments}
                              rowHeight= {39}
                              pagination = {true}
                              suppressPaginationPanel={true}                            
                              onGridReady={onGridReady}
                              onCellMouseOver={e => handleDraggable(e)}
                          >
                          </AgGridReact> 
                          { isRequestPending !== true &&
                            <div className="pagination_container1" >
                              <div className="pagination_container1"  >
                                  <span>showing {pageIndexMin} - {pageIndexMax} segments</span> 
                          
                                <select className = "left" 
                                    onChange = {(e) => pageSizeSort(e)} value = {pageValue}
                                  > 
                                  <option value = '10' >10</option>
                                  <option value = '25'>25</option>
                                  <option value = '50' >50</option>
                                  <option value = "75">75</option>
                                  <option value = "100">100</option>
                                </select>
                              </div>
                              <div className = "pagination_buttons">
                                  <button  onClick={(e) => prevHandle(e)} disabled = {count == 1}>
                                    &#8249;
                                  </button>
                                  <button 
                                    onClick={(e) => nextHandle(e)}
                                    value = {pagination}
                                    disabled = {pageCount == count}
                                  >
                                    &#8250;
                                  </button>
                                </div>
                            </div> 
                          }
                        
                        </Fragment> 
                        
                      }
                  </div>
                </div>
            </div>
          } 
        </PendingContainer>
      </div>
    )
}

export default ListData;