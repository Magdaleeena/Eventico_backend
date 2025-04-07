exports.psqlErrorHandlerOne = async (error, request, response, next) => {
    try {
      if (error.code === '23502') {
        return response.status(400).send({ msg: 'Bad request' });
      }
      next(error);  // Continue to the next middleware if error code doesn't match
    } catch (err) {
      next(err);  // Pass any unexpected error to the error handler
    }
  };
  
  exports.psqlErrorHandlerTwo = async (error, request, response, next) => {
    try {
      if (error.code === '22P02') {
        return response.status(400).send({ msg: 'Invalid type' });
      }
      next(error);
    } catch (err) {
      next(err);  // Pass any unexpected error to the error handler
    }
  };
  
  exports.psqlErrorHandlerThree = async (error, request, response, next) => {
    try {
      if (error.code === '23503') {
        return response.status(404).send({ msg: 'Not found' });
      }
      next(error);
    } catch (err) {
      next(err);  // Pass any unexpected error to the error handler
    }
  };
  
  exports.customErrorHandler = async (error, request, response, next) => {
    try {
      if (error.status && error.msg) {
        return response.status(error.status).send({ msg: error.msg });
      }
      next(error);  // Pass the error if it doesn't match the expected structure
    } catch (err) {
      next(err);  // Pass any unexpected error to the error handler
    }
  };
  
  exports.serverErrorHandler = async (error, request, response, next) => {
    try {
      return response.status(500).send({ msg: 'Internal server error' });
    } catch (err) {
      next(err);  // Pass any unexpected error to the error handler
    }
  };
  