const axios = require('axios');
const HttpError = require('../models/http-error');

const API_KEY = process.env.GOOGLE_API_KEY; // ❗ move to env in real apps
async function getCoordsForAddress(address) {
  // If you want to use the real Google API, ensure it's enabled in your console.
  // For now, we'll return mock coordinates if the API fails or is restricted.

  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        address
      )}&key=${API_KEY}`
    );

    const data = response.data;

    if (data.status === 'OK' && data.results && data.results.length > 0) {
      return data.results[0].geometry.location;
    }

    console.log('Google API Error Status:', data.status);
    if (data.error_message) console.log('Message:', data.error_message);
  } catch (err) {
    console.log('Network error or other issue calling Google API');
  }

  // FALLBACK: Return dummy coordinates (New York City) so the app doesn't crash
  console.log('Using mock coordinates for:', address);
  return {
    lat: 40.7484474,
    lng: -73.9871516
  };
}

module.exports = getCoordsForAddress;
