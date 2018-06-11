import logger from '../../../logger';
import config from '../../../config';

const login = async (req, res) => {
  // logger.info('Entered login');
  // const data = {
  //   name: req.body.credentials.user_name,
  // };
  // res.json(data);
  const user = req.body.credentials.user_name;
  const pass = req.body.credentials.password;
  if (config.users.username.includes(user) && config.users.password === pass) {
    logger.info('Authorized login');
    res.send('Authorized');
    res.status(200).end();
  } else {
    logger.info('Unauthorized login');
    res.send('Unauthorized');
    res.status(401).end();
  }
};

export default login;
