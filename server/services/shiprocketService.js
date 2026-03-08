const axios = require('axios');

class ShiprocketService {
    constructor() {
        this.baseUrl = 'https://apiv2.shiprocket.in/v1/external';
        this.email = process.env.SHIPROCKET_EMAIL;
        this.password = process.env.SHIPROCKET_PASSWORD;
        this.token = null;
        this.tokenExpiry = null;
    }

    async generateShiprocketToken() {
        if (this.token && this.tokenExpiry && new Date() < this.tokenExpiry) {
            return this.token;
        }

        try {
            const response = await axios.post(`${this.baseUrl}/auth/login`, {
                email: this.email,
                password: this.password
            });

            this.token = response.data.token;

            // Cache token for 9 days (Shiprocket tokens usually last 10 days)
            const expiry = new Date();
            expiry.setDate(expiry.getDate() + 9);
            this.tokenExpiry = expiry;

            return this.token;
        } catch (error) {
            console.error('Shiprocket auth failed:', error.response?.data || error.message);
            throw new Error('Failed to authenticate with Shiprocket');
        }
    }

    async createShipment(orderData) {
        const token = await this.generateShiprocketToken();
        try {
            const response = await axios.post(`${this.baseUrl}/orders/create/adhoc`, orderData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            console.error('Shiprocket create shipment failed:', error.response?.data || error.message);
            throw new Error('Failed to create shipment');
        }
    }

    async trackShipment(awb) {
        const token = await this.generateShiprocketToken();
        try {
            // Based on docs, tracking is GET /courier/track/awb/:awb
            const response = await axios.get(`${this.baseUrl}/couriers/track/awb/${awb}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            console.error('Shiprocket tracking failed:', error.response?.data || error.message);
            throw new Error('Failed to track shipment for AWB: ' + awb);
        }
    }

    async checkServiceability(data) {
        const token = await this.generateShiprocketToken();
        try {
            const response = await axios.get(`${this.baseUrl}/courier/serviceability/`, {
                params: {
                    pickup_postcode: data.pickup_postcode,
                    delivery_postcode: data.delivery_postcode,
                    weight: data.weight || 0.5,
                    cod: data.cod || 0
                },
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            console.error('Shiprocket serviceability failed:', error.response?.data || error.message);
            throw new Error('Failed to check serviceability');
        }
    }
}

module.exports = new ShiprocketService();
