import BaseRepository from './base.repository';
// DB models
import {publisher as Publisher} from '../../models';

// Constants

class PublisherRepository extends BaseRepository {
  constructor() {
    super(Publisher);
  }
}

export default new PublisherRepository();
