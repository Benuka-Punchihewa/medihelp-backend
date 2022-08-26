const save = async (auth, session) => {
  return await auth.save({ session });
};

module.exports = { save };
