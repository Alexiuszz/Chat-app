export const RegisterStart = () => ({
  type: "REGISTER_START",
});

export const RegisterSuccess = (user) => ({
  type: "REGISTER_SUCCESS",
  payload: user,
});

export const RegisterFailure = () => ({
  type: "REGISTER_FAILURE",
});
