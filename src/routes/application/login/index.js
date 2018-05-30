import logger from '../../../logger';

const login = (req, res) => {
  logger.info('Entered login');
  const data = {
    name: req.body.credentials.user_name,
  };
  res.json(data);
};

export default login;
