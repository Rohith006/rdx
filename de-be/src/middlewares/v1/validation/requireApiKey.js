import {user as User} from '../../../models';

export default async (req, res, next) => {
  try {
    const {key} = req.query;

    if (!key) throw 'You must specify apiKey parameter';

    const user = await User.findOne({
      where: {apiKey: key},
    });

    if (user) {
      res.locals = {user};
      next();
    } else throw 'Invalid Api key';
  } catch (e) {
    res.send(e);
  }
};
