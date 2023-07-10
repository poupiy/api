const express = require('express');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const router = express.Router();
dotenv.config();

const { ERROR: httpError } = require('../../helpers/httpError');
const response = require('../../helpers/wrapper');
const model = require('../model/index');
const Destinations = model.destinations;
const Bookmarks = model.bookmarks;
const Sequelize = require("sequelize");

router.get('/', getAll);
router.get('/save/:id', save);
module.exports = router;

async function getAll(req, res) {
  try {
    const { params, headers} = req;
    let token = headers.authorization.replace('Bearer ','');
    let decode = jwt.decode(token);
    let userId = decode.sub;
    if(!userId) {
        return response.wrapper_error(res, httpError.UNAUTHORIZED, 'unauthorized');
    }
    Bookmarks.belongsTo(Destinations, {foreignKey: 'destination_id', targetKey: 'id'})
    console.log(userId);
    let command = await Bookmarks.findAll({
      where: { 'user_id': userId },
      include: {
        model: Destinations,
        attributes: [
          [Sequelize.col('id'), 'id'],
          [Sequelize.col('name'), 'name'],
          [Sequelize.col('image_url'), 'image_url']
        ]
      },
      // distinct: true
      // group: ['destination_id']
    });

    const uniqueData = Object.values(command.reduce((acc, obj) => {
      const { destination_id } = obj;
      if (!acc[destination_id]) {
        acc[destination_id] = obj;
      }
      return acc;
    }, {}));

    return response.wrapper_success(res, 200, `Sukses get all bookmarks place`, uniqueData);
  } catch (error) {
    console.log(error)
    return response.wrapper_error(res, 400, error);
  }
}

async function save(req,res) {
  try {
    let { params, headers } = req;
    let destination_id = params.id;
    let token = headers.authorization.replace('Bearer ','');
    let decode = jwt.decode(token);
    let user_id = decode.sub;
    if(!user_id) {
      return response.wrapper_error(res, httpError.UNAUTHORIZED, 'unauthorized');
    }

    let command = await Bookmarks.create({
      destination_id: destination_id,
      user_id: user_id
    });

    return response.wrapper_success(res, 200, `Sukses save destinasi`, command);
  } catch (error) {
    return response.wrapper_error(res, httpError.INTERNAL_ERROR, error);
  }
}