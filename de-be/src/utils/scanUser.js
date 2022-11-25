import {admin as Admin, advertiser as Advertiser, Sequelize, users as User} from "../models";
import _ from 'lodash'
import {roles, statuses} from "../constants/user";

const log = require('../../logger')

const Op = Sequelize.Op;

export const getUser = async (request, response, next) => {
    try {
        //fetch the keycloak access token from the request
        const token = request.kauth.grant.access_token.content;
        const k_id = token.sub;
        const email = token.email;
        let entity = {};

        //get the desk user ID from  keycloak user ID
        const mappedUser = await User.findOne({
            where: {
                keycloakId: k_id,
                email: email,
                status: {[Op.ne]: statuses.REMOVED}
            }
        })
        log.debug(`USER: ${JSON.stringify(mappedUser)}`);
        //check if the user exists on Rebid Desk
        if (_.isEmpty(mappedUser)) {
            response.status(403).send({error: 'You are not subscribed to Rebid Desk'})
            return;
        } else {
            const desk_id = mappedUser.userId;
            const desk_role = mappedUser.role;
            if (desk_role === roles.ADMIN) {
                entity = await Admin.findOne({
                    where: {
                        id: desk_id,
                        email: email,
                        status: {[Op.ne]: statuses.REMOVED}
                    }
                });
            } else if (desk_role === roles.ADVERTISER) {
                entity = await Advertiser.findOne({
                    where: {
                        id: desk_id,
                        email: email,
                        status: {[Op.ne]: statuses.REMOVED}
                    }
                });
            }
        }
        request.user = {...entity.dataValues};
        next();
    } catch (e) {
        console.error(`get user method ${e.stack}`);
        next(e);
    }
}
