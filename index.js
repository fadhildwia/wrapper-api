const express = require('express')
const cors = require('cors')
const http = require('http');
const axios = require('axios');

const app = express()
require('dotenv').config()
const server = http.createServer(app);

app.use(cors())
app.use(express.json())

const rajaOngkirRequest = async (endpoint, params = {}, method = 'GET') => {
  try {
    const config = {
      method,
      url: `${process.env.RAJAONGKIR_BASE_URL}${endpoint}`,
      headers: { key: process.env.RAJAONGKIR_API_KEY },
    };

    if (method === 'POST') {
      config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
      config.data = new URLSearchParams(params).toString();
    } else {
      config.params = params;
    }

    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(error.response?.data || error.message);
    throw new Error(error.response?.data?.rajaongkir?.status?.description || 'Error fetching data from RajaOngkir');
  }
};

app.get('/api/province', async (req, res) => {
  try {
    const data = await rajaOngkirRequest('/province');
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/city', async (req, res) => {
  try {
    const { province } = req.query;
    const data = await rajaOngkirRequest('/city', { province: province });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/cost', async (req, res) => {
  try {
    const { origin, destination, weight, courier } = req.body;
    if (!origin || !destination || !weight || !courier) {
      return res.status(400).json({ error: 'Missing required fields: origin, destination, weight, courier' });
    }

    const data = await rajaOngkirRequest(
      '/cost',
      { origin, destination, weight, courier },
      'POST'
    );
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

server.listen(process.env.PORT, () => {
  console.log(`Server started on port ${process.env.PORT}`)
})
