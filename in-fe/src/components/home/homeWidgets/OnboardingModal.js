import React, {Component, Fragment} from 'react';
import Modal from 'react-modal';
import PropTypes from 'prop-types';
import { FaTimes } from 'react-icons/fa';
import classNames from 'classnames';
import axios from 'axios';

Modal.setAppElement('#root');

class ModalContainer extends Component {
  render() {
    const { isOpen, onCloseModal, modalTitle, bodyClassName, children } = this.props;
    return (
      <Modal
        isOpen={isOpen}
        className={bodyClassName}
        overlayClassName="modal-container"
      >
        <div className="onboarding_modal">
          <FaTimes size={20} className="close-btn2" onClick={onCloseModal} />
          <div className="onboarding_content">
            {children}
          </div>
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
