module.exports = (sequelize, Sequelize) => {
    const Logs = sequelize.define("logs", {
      user_id: {
        type: Sequelize.STRING
      },
      user_name: {
        type: Sequelize.STRING
      },
      destination_id: {
        type: Sequelize.STRING
      },
      destination_name: {
        type: Sequelize.STRING
      },
      destination_rating: {
        type: Sequelize.STRING
      },
      destination_category: {
        type: Sequelize.STRING
      }
    });
  
    return Logs;
  };
  