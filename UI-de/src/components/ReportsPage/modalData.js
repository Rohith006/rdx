import {ADMIN, ACCOUNT_MANAGER, ADVERTISER} from '../../constants/user';
import {ADVERTISERS, APPS, DAILY, HOURLY, PUBLISHERS, SITES, SUB_ID} from '../../constants/reports';

class ModalData {
  constructor() {
    this.data = [];
    this.state = [];
  }

  setDataAtType(type) {
    switch (type) {
      case DAILY:
        this.data = [
          {check: ADMIN, name: 'publisher', value: 'publisher', title: 'Publisher', cellRenderer: '', after: 0},
          {check: ACCOUNT_MANAGER, name: 'publisher', value: 'publisher', title: 'Publisher', cellRenderer: '', after: 0},
        ];
        break;
      case HOURLY:
        this.data = [
          {check: ADMIN, name: 'publisher', value: 'publisher', title: 'Publisher', cellRenderer: '', after: 0},
          {check: ACCOUNT_MANAGER, name: 'publisher', value: 'publisher', title: 'Publisher', cellRenderer: '', after: 0},
        ];
        break;
      case ADVERTISERS:
        this.data = [
          {check: ADMIN, name: 'publisherId', value: 'publisherId', title: 'Publisher', cellRenderer: 'publisherCellRenderer'},
          {check: ADMIN, name: 'subId', value: 'subId', title: 'Sub id'},
          {check: ADMIN, name: 'site', value: 'site', title: 'Site'},
          {check: ADMIN, name: 'app', value: 'app', title: 'App'},
          {check: ADMIN, name: 'os', value: 'os', title: 'os'},
          {check: ADMIN, name: 'ip', value: 'ip', title: 'Country'}
        ];
        break;
      case PUBLISHERS:
        this.data = [
        ];
        break;
      case APPS:
        this.data = [
          {check: ADMIN, name: 'publisher', value: 'publisher', title: 'Publisher', after: 0},
        ];
        break;
      case SITES:
        this.data = [
          {check: ADMIN, name: 'publisher', value: 'publisher', title: 'Publisher', after: 0},
        ];
        break;
      case SUB_ID:
        this.data = [
          {check: ADMIN, name: 'publisher', value: 'publisher', title: 'Publisher', after: 0},
        ];
        break;
      default: this.data = [];
    }
  }

  set set(data) {
    this.data = data;
  }

  set setState(data) {
    this.state = data;
  }

  get getState() {
    return this.state;
  }

  get get() {
    return this.data;
  }
}

const modalData = new ModalData();

export default modalData;

