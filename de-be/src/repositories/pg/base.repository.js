import {DEFAULT_OFFSET, DEFAULT_ROWS_LIMIT} from '../../constants/common';
import {get} from 'lodash';

/**
 * This class contains base common used methods to work with DB
 */
class BaseRepository {
  constructor(model) {
    this.model = model;
    this.DEFAULT_ROWS_LIMIT = DEFAULT_ROWS_LIMIT;
    this.DEFAULT_OFFSET = DEFAULT_OFFSET;
  }

  async findOne(options) {
    if (!options) {
      return null;
    }

    const data = await this.model.findOne(options);

    return data ? data.get() : null;
  }

  async findByPk(id, options) {
    return this.model.findByPk(id, options);
  }

  async findAll(options) {
    return this.model.findAll(options);
  }

  async findAndCountAll() {
    return this.model.findAndCountAll();
  }

  async save(data, options = {}) {
    const result = await this.model.create(data, options);
    return result && result.get() || null;
  }

  async update(data, options) {
    try {
      const results = await this.model.update(data, options);
      return get(results, '[1][0]', null);
    } catch (err) {
      console.error(`Error update ${this.model.tableName}: ${err}`);
    }
  }

  async saveOrUpdate(data, options = {}) {
    if (data.id) {
      const returning = true;
      const baseOptions = {where: {id: data.id}, returning, ...options};
      return this.update(data, baseOptions);
    } else {
      return this.save(data, options);
    }
  }
  async delete(options) {
    return this.model.destroy(options);
  }
}

export default BaseRepository;
