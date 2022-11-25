import JWT from 'jsonwebtoken';
import {JWT_INTEGRATIONS_SECRET} from '../../config';
import {generateToken} from './signToken';

export const token = (req, res) => {
    try {
        let user = {};
        let response = {};
        const { refreshToken } = req.body;
        JWT.verify(refreshToken, JWT_INTEGRATIONS_SECRET,(err,decoded) => {
            if(!err){
                user.id = decoded.sub;
                user.role = decoded.role;
                const token = generateToken(user);
                response = { token, userId: decoded.sub, userRole: decoded.role};
            } else {
                console.error(err);
            }
        })
        if(response !== {}){
            res.json(response);
        } else {
            res.send('error')
        }
    } catch (err) {
        log.error(`refresh token error : ${err}`);
    }
}; // TODO implement logging