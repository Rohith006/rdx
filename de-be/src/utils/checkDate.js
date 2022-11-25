import moment from 'moment';

export default function checkDate(obj) {
  if (obj.startDate === null) {
    obj.startDate = moment();
  }
  if (obj.endDate === null) {
    obj.endDate = moment().add(1, 'year');
  }
}
