import React, {useEffect, useState} from 'react';
import Limit from './Limit';
import Paginate from './Paginate';

const PaginationContainer = (props) => {
  const [isOpen, setIsOpen] = useState(false);

  function setLinesSelect(limitData) {
    if (props.changeState) {
      props.actions.changePaginationData(limitData, 0, 1);
    }

    document.querySelector('.pagination-container').children[1].children[0].click();
    hideDropdown();
  }

  function showDropdown() {
    setIsOpen(true);
    document.addEventListener('click', hideDropdown);
  }

  function hideDropdown() {
    setIsOpen(false);
    document.removeEventListener('click', hideDropdown);
  }
  useEffect(() => () => {
    props.actions.changePaginationData(100, 0);
  }, []);

  return (
    <div className="pagination">
      <Limit
        toggleLinesDropdown={showDropdown}
        showLinesDropdown={isOpen}
        setLinesSelect={setLinesSelect}
        {...props}
      />
      {props.page && <Paginate {...props} />}
    </div>
  );
};

export default PaginationContainer;
