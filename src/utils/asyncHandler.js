const asynHandler = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((e) => {
      return next(new Error(e.message));
    });
  };
};
export default asynHandler;
