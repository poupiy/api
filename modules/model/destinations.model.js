module.exports = (sequelize, Sequelize) => {
    const Destinations = sequelize.define("destinations", {
      name: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.STRING
      },
      category: {
        type: Sequelize.STRING
      },
      price: {
        type: Sequelize.STRING
      },
      rating: {
        type: Sequelize.STRING
      },
      image_url: {
        type: Sequelize.STRING
      },
      maps_url: {
        type: Sequelize.STRING
      }
    });
  
    return Destinations;
  };
  