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
// import * as tf from '@tensorflow/tfjs';
const tf = require('@tensorflow/tfjs-node');

router.get('/', getAll);
module.exports = router;

async function getAll(req, res) {
   try {
       // Function to preprocess data and create tensors
function preprocessData(logs, destinations) {
    // Create a mapping of destination IDs to their indices
    const destinationIndices = new Map();
    destinations.forEach((destination, index) => {
      destinationIndices.set(destination.id, index);
    });
  
    // Create empty arrays to store user indices and destination indices
    const userIndices = [];
    const destinationIndicesArray = [];
  
    // Preprocess logs data
    logs.forEach((log) => {
      const { user_id, destination_id } = log;
      const userIndex = userIndices.indexOf(user_id);
      const destinationIndex = destinationIndices.get(destination_id);
  
      // If user index does not exist, add it
      if (userIndex === -1) {
        userIndices.push(user_id);
        userIndex = userIndices.length - 1;
      }
  
      userIndices.push(userIndex);
      destinationIndicesArray.push(destinationIndex);
    });
  
    // Create tensors from preprocessed data
    const userTensor = tf.tensor1d(userIndices, 'int32');
    const destinationTensor = tf.tensor1d(destinationIndicesArray, 'int32');
  
    return { userTensor, destinationTensor };
  }
  
  // Load logs and destinations data
  const logs = [
    { user_id: 1, destination_id: 1 },
    { user_id: 1, destination_id: 2 },
    // Add more logs data as needed
  ];
  
  const destinations = [
    { id: 1, name: 'Destination 1' },
    { id: 2, name: 'Destination 2' },
    // Add more destinations data as needed
  ];
  
  // Preprocess data
  const { userTensor, destinationTensor } = preprocessData(logs, destinations);
  
  // Define the recommendation model
  const numUsers = userTensor.max().dataSync()[0] + 1;
  const numDestinations = destinationTensor.max().dataSync()[0] + 1;
  const embeddingSize = 10;
  
  const userEmbeddingLayer = tf.layers.embedding({
    inputDim: numUsers,
    outputDim: embeddingSize,
  });
  const destinationEmbeddingLayer = tf.layers.embedding({
    inputDim: numDestinations,
    outputDim: embeddingSize,
  });
  
  const userInput = tf.input({ shape: [1] });
  const destinationInput = tf.input({ shape: [1] });
  
  const userEmbedding = userEmbeddingLayer.apply(userInput);
  const destinationEmbedding = destinationEmbeddingLayer.apply(destinationInput);
  
  const userFlatten = tf.layers.flatten().apply(userEmbedding);
  const destinationFlatten = tf.layers.flatten().apply(destinationEmbedding);
  
  const dotProduct = tf.layers.dot({ axes: -1 }).apply([userFlatten, destinationFlatten]);
  const output = tf.layers.dense({ units: 1 }).apply(dotProduct);
  
  const model = tf.model({ inputs: [userInput, destinationInput], outputs: output });
  
  // Compile the model
  model.compile({ loss: 'meanSquaredError', optimizer: 'adam' });
  
  // Train the model
  model.fit([userTensor, destinationTensor], destinationTensor, { epochs: 10 }).then(() => {
    // Generate recommendations for a user
    const userId = 1; // Example user ID
    const userIndex = userTensor.dataSync().indexOf(userId);
  
    const userTensorPredict = tf.tensor1d([userIndex], 'int32');
    const destinationTensorPredict = tf.tensor1d(Array.from({ length: numDestinations }, (_, i) => i), 'int32');
  
    const predictions = model.predict([userTensorPredict, destinationTensorPredict]);
    const recommendations = Array.from(predictions.dataSync());
  
    // Display recommendations
    console.log(recommendations);
  });
    
   } catch (error) {
       console.log(error)
        return response.wrapper_error(res, httpError.INTERNAL_ERROR, error);
   }
}
