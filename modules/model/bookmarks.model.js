module.exports = (sequelize, Sequelize) => {
    const Destinations = sequelize.define("bookmarks", {
      destination_id: {
        type: Sequelize.STRING
      },
      user_id: {
        type: Sequelize.STRING
      }
    });

    return Destinations;
  };
  