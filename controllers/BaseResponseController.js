const BaseResponse = (code, status, data) => {
  const response_data = {
    code: code,
    status: status,
    data: data
  };

  return response_data;
};

module.exports = BaseResponse;  