const express = require('express');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const router = express.Router();
dotenv.config();

const { ERROR: httpError } = require('../../helpers/httpError');
const response = require('../../helpers/wrapper');
const model = require('../model/index');
const Destinations = model.destinations;
const Users = model.users;
const Logs = model.logs;

router.get('/', getAll);
router.get('/category', getCategory);
router.get('/category/:name', getDestinationByCategory);
router.get('/popular', getPopular);
router.get('/recommendation', getRecommendation);
router.get('/:id', getDetail);
module.exports = router;
const { Op } = require('sequelize');

async function getAll(req, res) {
   try {
        const { query } = req;
        query.where = { 'category': query.category }

        if(!query.where) {
            query.where = {}
        }

        let queryConsole = {};
        queryConsole.raw = true;

        query.column = 'rating';
        query.filter = 'desc';
        if(query.column || query.filter) {
            queryConsole.order = [[query.column, query.filter]];
        }
        
        queryConsole = {
            where: {
              [Op.or]: [
                { name: { [Op.like]: `%${query.search}%` } },
                { category: { [Op.like]: `%${query.search}%` } },
              ],
            },
        }

        console.log(JSON.stringify(queryConsole));
        const command = await Destinations.findAll(queryConsole)

        return response.wrapper_success(res, 200, `Sukses get all destinations`, command);
   } catch (error) {
        console.log(error)
        return response.wrapper_error(res, 400, error);
   }
}

async function getDetail(req, res) {
    try {
        const { params, headers} = req;
        let token = headers.authorization.replace('Bearer ','');
        let decode = jwt.decode(token);
        let userId = decode.sub;
        if(!userId) {
            return response.wrapper_error(res, httpError.UNAUTHORIZED, 'unauthorized');
        }
        let getUser = await Users.findOne({
            raw: true,
            where: { 'id': userId }
        });

        const query = await Destinations.findOne({
            raw: true,
            where: { 'id': params.id }
        });

        let model = {
            user_id: userId,
            user_name: getUser.full_name,
            destination_id: params.id,
            destination_name: query.name,
            destination_rating: query.rating,
            destination_category: query.category
        }
        console.log(model)
        await Logs.create(model);
        return response.wrapper_success(res, 200, `Sukses get detail destination`, query);
    } catch (error) {
        console.log(error)
        return response.wrapper_error(res, httpError.INTERNAL_ERROR, error);
    }
}

async function getCategory(req, res) {
   try {
        const category = [
            {
                "category": "Cagar Alam",
                "image_url": "https://res.cloudinary.com/sarjanalidi/image/upload/v1686833248/batours/cagar_alam_es4mih.png"
            },
            {
                "category": "Budaya",
                "image_url": "https://res.cloudinary.com/sarjanalidi/image/upload/v1686833249/batours/budaya_dsyod6.png"
            },
            {
                "category": "Taman Hiburan",
                "image_url": "https://res.cloudinary.com/sarjanalidi/image/upload/v1686833250/batours/tempat_hiburan_uulvbr.png"
            },
            {
                "category": "Tempat Ibadah",
                "image_url": "https://res.cloudinary.com/sarjanalidi/image/upload/v1686833251/batours/tempat_ibadah_zeosvm.png"
            },
            {
                "category": "Pusat Perbelanjaan",
                "image_url": "https://res.cloudinary.com/sarjanalidi/image/upload/v1686833253/batours/pusat_perbelanjaan_qiwwp9.png"
            }
        ]
        return response.wrapper_success(res, 200, `Sukses get all category destinations`, category);
   } catch (error) {
       console.log(error)
        return response.wrapper_error(res, httpError.INTERNAL_ERROR, error);
   }
}

async function getPopular(req, res) {
   try {
        const command = await Destinations.findAll({
            raw: true,
            offset: 1,
            limit: 2,
            order: [['rating', 'desc']]
        })
        return response.wrapper_success(res, 200, `Sukses get all popular destinations`, command);
   } catch (error) {
       console.log(error)
        return response.wrapper_error(res, httpError.INTERNAL_ERROR, error);
   }
}

async function getDestinationByCategory(req, res) {
    const { params} = req;

    const query = await Destinations.findAll({
        raw: true,
        where: { 'category': params.name }
    });

    return response.wrapper_success(res, 200, `Sukses get destination by category`, query);
}

async function getRecommendation (req, res) {
    const { params, headers} = req;
    let token = headers.authorization.replace('Bearer ','');
    let decode = jwt.decode(token);
    let userId = decode.sub;
    if(!userId) {
        return response.wrapper_error(res, httpError.UNAUTHORIZED, 'unauthorized');
    }

    let logs = await Logs.findAll({
        raw: true,
        where: { 'user_id': userId },
    });
    let recommendation = getDestinationRecommendations(userId, logs);

    console.log(recommendation);
    let result = [];
    await Promise.all(
        recommendation.slice(0, 2).map( async (item) => {
            let query = await Destinations.findOne({
                raw: true,
                where: { 'id': item.destinationId }
            });

            result.push(query);
        })
    )

    return response.wrapper_success(res, 200, `Sukses get destination by category`, result);
}

// Function to get destination recommendations for a user
function getDestinationRecommendations(userId, data) {
  // Filter data to get user's visited destinations
  const userDestinations = data.filter((entry) => entry.user_id == userId);

  // Get all unique destination IDs visited by the user
  const visitedDestinationIds = [...new Set(userDestinations.map((entry) => entry.destination_id))];

  // Filter data to get destinations visited by users who visited the same destinations as the user
  const recommendedDestinations = data.filter(
    (entry) => visitedDestinationIds.includes(entry.destination_id) && entry.user_id !== userId
  );

  // Group recommended destinations by destination ID
  const groupedDestinations = recommendedDestinations.reduce((acc, entry) => {
    if (!acc[entry.destination_id]) {
      acc[entry.destination_id] = [];
    }
    acc[entry.destination_id].push(entry);
    return acc;
  }, {});

  // Calculate average ratings for each destination
  const destinationRecommendations = Object.values(groupedDestinations).map((entries) => {
    const destinationId = entries[0].destination_id;
    const destinationName = entries[0].destination_name;
    const destinationCategory = entries[0].destination_category;
    const totalRating = entries.reduce((sum, entry) => sum + parseFloat(entry.destination_rating), 0);
    const averageRating = totalRating / entries.length;
    return { destinationId, destinationName, destinationCategory, averageRating };
  });

  // Sort recommendations by average rating in descending order
  destinationRecommendations.sort((a, b) => b.averageRating - a.averageRating);

  return destinationRecommendations;
}