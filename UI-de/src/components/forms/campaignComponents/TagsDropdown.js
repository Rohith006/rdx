import React, {useEffect, useState} from 'react';
import classNames from 'classnames';
import DropdownModalData from './dropdownModalData';
import CreateTagModal from './createTagModal';
import onClickOutside from 'react-onclickoutside';
import {bindActionCreators} from 'redux';
import {
  changeIdsList,
  createCampaignTag,
  deleteCampaignTag,
  loadCampaignTagsList,
} from '../../../actions/campaigns&budgets';
import {connect} from 'react-redux';
import TitleList from './CampaignTagsComponents/titleList';

const TagsDropdown = (props) => {
  const {tagsList = []} = props.formData;
  const {tagsListCampaign = []} = props;
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isOpenCreateTag, setIsOpenCreateTag] = useState(false);
  const [titleList, setTitleList] = useState([]);

  const toggle = () => {
    setIsOpenModal(!isOpenModal);
    setIsOpenCreateTag(false);
  };
  TagsDropdown.handleClickOutside = () => {
    setIsOpenCreateTag(false);
    setIsOpenModal(false);
  };

  function titleHandler(arr) {
    setTitleList(arr.filter((el) => el.isChecked).map((el) => el.name));
  }

  useEffect(() => {
    let {idsList = []} = props;
    const newArr = [];
    idsList = idsList ? idsList.map((el) => +el) : [];
    tagsListCampaign.forEach((el) => {
      if (idsList.includes(el.id)) {
        newArr.push({...el, isChecked: true});
      }
    });

    titleHandler(newArr);
  }, [tagsListCampaign.length, props.idsList]);

  function newTag() {
    setIsOpenModal(false);
    setIsOpenCreateTag(true);
  }

  async function addTag(name, color) {
    if (name.trim() === '') return;
    let isReturn = false;
    tagsList.forEach((el) => {
      if (el.name === name) {
        isReturn = true;
      }
    });
    if (isReturn) return;
    await props.actions.createCampaignTag(props.campaignId, {name, color});
    await props.actions.loadCampaignTagsList();
    setIsOpenModal(true);
    setIsOpenCreateTag(false);
    let tags;
    if (!tagsList) {
      tags = [{name, color: color.hex, isChecked: false}];
    } else {
      tags = [...tagsList, {name, color: color.hex, isChecked: false}];
    }

    props.change('tagsList', tags);
  }

  function cancelHandler() {
    setIsOpenModal(true);
    setIsOpenCreateTag(false);
  }

  return (
    <div className="dropdown-cover tags-cover">
      <div
        className={classNames('dropdown columns bordered', {'opened': isOpenModal})}>
        <button
          onClick={() => toggle()}
          className="dropdown__button"
          tabIndex="0"
          type="button">
          <TitleList titleList={titleList}/>
          <span className="dropdown__button-value">
            <span>{isOpenModal}</span>
          </span>
          <span className="dropdown__arrow"/>
        </button>
        <DropdownModalData
          {...props}
          newTag={newTag}
          tagsList={tagsList}
          titleHandler={titleHandler}
          setIsOpenModal={setIsOpenModal}
          renderCheckboxField
        />
        <CreateTagModal
          {...props}
          addTag={addTag}
          cancelHandler={cancelHandler}
          isOpenCreateTag={isOpenCreateTag}
        />
      </div>
    </div>
  );
};

const clickOutsideConfig = {
  handleClickOutside: () => TagsDropdown.handleClickOutside,
};

const mapStateToProps = (state) => ({
  tagsListCampaign: state.campaigns.tagsList,
  idsList: state.campaigns.currentCampaign.listTags,
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    loadCampaignTagsList,
    createCampaignTag,
    deleteCampaignTag,
    changeIdsList,
  }, dispatch),
});


export default connect(mapStateToProps, mapDispatchToProps)(onClickOutside(TagsDropdown, clickOutsideConfig));
