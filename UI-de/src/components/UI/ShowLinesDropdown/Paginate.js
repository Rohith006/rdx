import React from 'react'
import ReactPaginate from 'react-paginate'
import SvgChevronLeft from '../../../../assets/images/icons/cheveronLeft.svg'
import SvgChevronRight from '../../../../assets/images/icons/cheveronRight.svg'

const Paginate = (props) => {
  return (
    <ReactPaginate
      previousLabel={<img src={SvgChevronLeft} />}
      nextLabel={<img src={SvgChevronRight} />}
      breakLabel={'...'}
      breakClassName={'break-me'}
      pageCount={props.pageCount}
      marginPagesDisplayed={2}
      pageRangeDisplayed={5}
      onPageChange={props.setOffsetPagination}
      containerClassName={'pagination-container'}
      subContainerClassName={'pages pagination'}
      activeClassName={'active'}
    />
  )
}

export default Paginate
