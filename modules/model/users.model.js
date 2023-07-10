const { destinations } = require(".");

module.exports = (sequelize, Sequelize) => {
  const Users = sequelize.define("users", {
    full_name: {
      type: Sequelize.STRING
    },
    email: {
      type: Sequelize.STRING
    },
    password: {
      type: Sequelize.STRING
    },
    phone: {
      type: Sequelize.STRING
    },
    profile_pic_url: {
      type: Sequelize.STRING
    }
  });

  return Users;
};
