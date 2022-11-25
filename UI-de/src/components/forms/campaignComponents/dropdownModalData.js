import React, { useEffect, useState } from "react";
import Search from "./CampaignTagsComponents/Search";
import List from "./CampaignTagsComponents/list";
import { confirmAlert } from "react-confirm-alert";
import CustomConfirm from "../../common/Views/Confirm";

const ReportsModalForm = (props) => {
  const { tagsListCampaign = [], newTag, actions } = props;
  const [filteredList, setFilteredList] = useState([]);
  const [filterValue, setFilterValue] = useState("");

  useEffect(() => {
    actions.loadCampaignTagsList();
  }, []);

  useEffect(() => {
    setFilteredList(checkedTags());
  }, [tagsListCampaign, props.idsList]);

  function handleFilter({ target: { value } }) {
    setFilterValue(value);
    const newArr = getTagsList();
    setFilteredList(
      newArr.filter(({ name }) => {
        name = name.toLowerCase();
        return name.includes(value);
      })
    );
  }

  function getTagsList() {
    const { idsList = [] } = props;
    let newIdsList = idsList ? [...idsList] : [];
    const newArr = [];
    newIdsList = newIdsList.map((el) => +el);
    tagsListCampaign.forEach((el) => {
      if (newIdsList.includes(el.id)) {
        newArr.push({ ...el, isChecked: true });
      } else {
        newArr.push(el);
      }
    });
    return newArr;
  }

  function checkedTags() {
    const newArr = getTagsList();
    setFilteredList(newArr);
    props.change("tagsList", newArr);
    return newArr;
  }

  function handleClick(id) {
    const newArr = getTagsList();
    const newList = newArr.map((el) =>
      el.id === id ? { ...el, isChecked: !el.isChecked } : el
    );
    const newIdsList = newList
      .map((el) => (el.isChecked ? el.id : null))
      .filter((el) => el);
    setFilterValue("");
    props.actions.changeIdsList(newIdsList);
    props.change("tagsList", newList);
    props.titleHandler(newList);
  }

  function handleDeleteLogic(id) {
    const newList = filteredList.map((el) =>
      el.id === id ? { ...el, delete: true } : el
    );
    setFilteredList(newList);
    props.change("tagsList", newList);
    props.titleHandler(newList);
    props.setIsOpenModal(true);
  }

  function handleDelete(id) {
    confirmAlert({
      customUI: ({ onClose }) => {
        return (
          <CustomConfirm
            onConfirm={() => handleDeleteLogic(id)}
            onClose={onClose}
            msg="You will remove label of this campaign"
          />
        );
      },
    });
  }

  return (
    <div className="dropdown__menu tags">
      <div className="form__text-field input-md">
        <Search onChange={handleFilter} value={filterValue} />
        <div className="form__text-field__wrapper">
          <List
            filteredList={filteredList}
            handleClick={handleClick}
            handleDelete={handleDelete}
          />
          <div className="btn add create" onClick={() => newTag()}>
            ADD
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsModalForm;
