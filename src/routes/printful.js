import express from 'express';
import axios from 'axios';

const router = express.Router();
const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY;
const baseURL = 'https://api.printful.com';

router.get('/store', async (req, res) => {
    try {
        const response = await axios.get(\\/store\, {
            headers: { Authorization: \Bearer \\ }
        });
        res.json(response.data);
    } catch (error) {
        console.error(error.response?.data || error.message);
        res.status(500).json({ error: error.message });
    }
});

router.get('/products', async (req, res) => {
    try {
        const response = await axios.get(\\/products\, {
            headers: { Authorization: \Bearer \\ }
        });
        res.json(response.data);
    } catch (error) {
        console.error(error.response?.data || error.message);
        res.status(500).json({ error: error.message });
    }
});

export default router;
