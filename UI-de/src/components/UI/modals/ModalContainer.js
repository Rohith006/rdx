import React, {Component, Fragment} from 'react';
import Modal from 'react-modal';
import PropTypes from 'prop-types';
import {FaTimes, FaInfoCircle, FaFile, FaPlayCircle} from 'react-icons/fa';
import classNames from 'classnames';
import {PUBLISHER} from '../../../constants/user';
import axios from 'axios';

Modal.setAppElement('#root');

class ModalContainer extends Component {
  render() {
    const {
      entity, entityId, isOpen, onCloseModal, modalTitle, bodyClassName,
      children, refreshBidreqFormat, pending, auth} = this.props;
    const refreshBtnClass = classNames({
      'close-btn': true,
      'disabled': pending,
    });
    async function takeBidreqFormat() {
      const {data} = await axios.get(`/dsp/take-bidreq/${entity}/${entityId}`);
    }

    return (
      <Modal
        isOpen={isOpen}
        className={bodyClassName}
        overlayClassName="modal-container"
      >
        <div className="card_header bordered-2">
          <div className="subheading_cover">
            <h2 className="heading">{modalTitle}</h2>
            <div style={{display: 'flex', justifyContent: 'space-between'}}>
              {
                auth && auth.currentUser.role === 'ADMIN' &&
                    entity &&
                      <Fragment>
                        <div className="close-btn" onClick={takeBidreqFormat}>
                          <FaPlayCircle size={20}/>
                        </div>
                        <a href={`/req${entity[0]}${entityId}.txt`} target="_blank" style={{margin: '0 5px'}}>
                          <div className="close-btn">
                            <FaFile size={20}/>
                          </div>
                        </a>
                      </Fragment>
              }
              {/* <div className={refreshBtnClass} onClick={refreshBidreqFormat}>*/}
              {/* <FaInfoCircle size={20}/>*/}
              {/* </div>*/}
              <div className="close-btn" onClick={onCloseModal}>
                <FaTimes size={20}/>
              </div>
            </div>
          </div>
        </div>
        <div className="card_body-2">
          {children}
        </div>
      </Modal>
    );
  }
}

ModalContainer.propTypes = {
  isOpen: PropTypes.bool,
  onCloseModal: PropTypes.func,
  modalTitle: PropTypes.string,
  bodyClassName: PropTypes.string,
};

export default ModalContainer;
