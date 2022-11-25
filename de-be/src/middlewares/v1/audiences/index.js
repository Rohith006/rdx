import {advertiser as Advertiser, audience as Audience, sequelize, Sequelize,} from '../../../models';
import AudienceService from '../../../services/audience.service';
import {roles} from '../../../constants/user';
import moment from 'moment';
import {IFA, IP} from "../../../constants/audience";

const Op = Sequelize.Op;

export const saveAudience = async (req, res, next) => {
  try {
    const audience = {
      ...req.body,
      advertiserId: req.body.advertiserId || req.user.id,
      status: 'NEW',
    };

    if(audience.type === IFA) {
      const created = await Audience.create(audience, {returning: true});
      if (audience.ifas && audience.ifas.length) {
        const data = {
          ifas: audience.ifas,
          audienceId: created.id,
        };
        await AudienceService.addUsersToAudience(data);
        res.send({success: true});
      } else {
        res.json({
          success:true,
          message:'Audience created but no IFA were uploaded.'
        });
      }
    } else if (audience.type === IP) {
      const created = await Audience.create(audience, {returning: true});
      if(audience.ips && audience.ips.length){
        const data = {
          ips: audience.ips,
          audienceId: created.id
        };
        await AudienceService.addIPtoAudience(data);
        res.send({success: true});
      } else {
        res.json({
          success: true,
          message:'Audience created but no IP were uploaded.'
        })
      }
    } else {
      res.json({
        success: false,
        message:'Invalid audience type'
      });
    }
  } catch (e) {
    next(e);
  }
};

export const saveExternalAudience = async (req, res, next) => {
  try {
    const audience = {
      ...req.body,
      advertiserId: req.user.id,
      status: 'NEW',
    };

    const created = await Audience.create(audience, {returning: true});

    if (audience.ifas && audience.ifas.length) {
      const data = {
        ifas: audience.ifas,
        audienceId: created.id,
      };
      await AudienceService.addUsersToAudience(data);
    }
    res.send({success: true});
  } catch (e) {
    next(e);
  }
};

export const updateAudience = async (req, res, next) => {
  try {
    const audience = {
      ...req.body,
      advertiserId: req.body.advertiserId || req.user.id,
    };

    const updated = await Audience.update(audience, {where: {id: req.params.id}, returning: true});

    if(audience.type === IFA){
      if(audience.ifas && audience.ifas.length){
        const data = {
          audienceId: updated[1][0].id,
          ifas: audience.ifas,
        };
        await AudienceService.addUsersToAudience(data);
        res.send({success: true});
      } else {
        res.send({success:true});
      }
    } else if (audience.type === IP){
        if(audience.ips && audience.ips.length){
          const data = {
            ips: audience.ips,
            audienceId: updated[1][0].id
          };
          await AudienceService.addIPtoAudience(data);
          res.send({success: true});
        }else {
          res.send({success:true});
        }
    }
  } catch (e) {
    next(e);
  }
};


export const changeAudienceStatus = async (req, res, next) => {
  try {
    const {ids, status} = req.body;
    const {id, role} = req.user;

    await Audience.update({status}, {
      where: {id: ids},
    });

    const options = {
      where: {status: {[Op.ne]: 'REMOVED'}},
      include: [
        {
          model: Advertiser,
          attributes: ['name'],
        },
      ],
    };

    if (role === 'ADVERTISER') {
      options.where.advertiserId = id;
    }

    // remove audience from campaigns
    if (status === 'REMOVED') {
      await sequelize.query(`UPDATE campaigns SET audiences=(SELECT array(SELECT unnest(audiences) EXCEPT SELECT unnest('{${ids.toString()}}'::int[])))`);
    }

    const audiences = await Audience.findAll(options);

    res.send({data: audiences});
  } catch (err) {
    next(err);
  }
};
/*
export const downloadAudience = async (req, res, next) => {
  const id = +req.params.id;

  if (!id || !Number(id)) {
    return res.status(ResponseStatus.BAD_REQUEST).send({});
  }

  try {
    const users = await AudienceService.loadAudienceUsers(id);
    res.send({users});
  } catch (e) {
    next(e);
  }
};
 */

export const getAudiences = async (req, res, next) => {
  try {
    const {id, role} = req.user;
    const {limit, offset, status, startDate, endDate} = req.query;
    const where = {
      status: {
        [Op.and]: [status ? status : {[Op.ne]: 'REMOVED'}],
      },
    };

    if (role === 'ADVERTISER') {
      where.advertiserId = id;
    } else if (role === 'ACCOUNT_MANAGER') {
      const managerAdvertisers = await Advertiser.findAll({
        where: {managerId: id},
        attributes: ['id'],
      });

      where.advertiserId = managerAdvertisers.map((item) => item.get().id);
    }

    let options = {
      order: [['id', 'DESC']],
      where,
      attributes: ['id', 'status', 'name', 'createdAt', 'collectFromIds', 'peopleWith'],
      include: [
        {
          model: Advertiser,
          attributes: ['id','name'],
        },
      ],
    };

    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [startDate, moment(endDate).format('YYYY-MM-DD 23:59')],
      };
    }

    if (offset) {
      options = {...options, limit, offset};
    }

    const count = await Audience.count({where});
    const audiences = await Audience.findAll(options);

    res.send({data: audiences, count});
  } catch (err) {
    next(err);
  }
};

export const getAudience = async (req, res, next) => {
  try {
    const {id} = req.params;
    const audience = await Audience.findOne({
      where: {id},
    });

    let result;

    if (req.user.role === roles.ACCOUNT_MANAGER) {
      const managerAdvertisers = await Advertiser.findAll({
        where: {managerId: req.user.id},
        attributes: ['id'],
      });

      const assignedAdvIds = managerAdvertisers ? managerAdvertisers.map((item) => item.get().id) : [];

      result = audience ? (assignedAdvIds.includes(audience.advertiserId) ? audience.get() : null) : null;
    } else {
      result = audience ? audience.get() : null;
    }

    res.json({audience: result});
  } catch (err) {
    next(err);
  }
};
