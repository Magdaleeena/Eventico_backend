exports.psqlErrorHandlerOne = async (error, request, response, next) => {
    try {
      if (error.code === '23502') {
        return response.status(400).send({ msg: 'Bad request' });
      }
      next(error);  
    } catch (err) {
      next(err);  
    }
  };
  
  exports.psqlErrorHandlerTwo = async (error, request, response, next) => {
    try {
      if (error.code === '22P02') {
        return response.status(400).send({ msg: 'Invalid type' });
      }
      next(error);
    } catch (err) {
      next(err);  
    }
  };
  
  exports.psqlErrorHandlerThree = async (error, request, response, next) => {
    try {
      if (error.code === '23503') {
        return response.status(404).send({ msg: 'Not found' });
      }
      next(error);
    } catch (err) {
      next(err);  
    }
  };
  
  exports.customErrorHandler = async (error, request, response, next) => {
    try {
      if (error.status && error.msg) {
        return response.status(error.status).send({ msg: error.msg });
      }
      next(error);  
    } catch (err) {
      next(err);  
    }
  };
  
  exports.serverErrorHandler = async (error, request, response, next) => {
    try {
      return response.status(500).send({ msg: 'Internal server error' });
    } catch (err) {
      next(err);  
    }
  };
  