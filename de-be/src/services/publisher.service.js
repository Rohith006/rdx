import createError from 'http-errors';

import {publisher as Publisher} from '../models';
import PublisherRepository from '../repositories/pg/publisher';
import {cachePublisherUpdate} from './caching/create';

export const getPublisherById = async (publisherId) => {
  if (!publisherId || !Number(publisherId)) {
    throw createError(400, {msg: 'Invalid publisherId'});
  }

  try {
    return PublisherRepository.findOne({
      where: {id: publisherId},
    });
  } catch (err) {
    console.error(err);
  }
};

export const updatePublisher = async (publisherId, data) => {
  try {
    const result = await Publisher.update(data, {where: {id: publisherId}, returning: true});
    const publisher = result ? result[1][0].get() : null;
    if (publisher) {
      await cachePublisherUpdate(publisher);
    }
    return publisher;
  } catch (err) {
    console.error(err);
  }
};

