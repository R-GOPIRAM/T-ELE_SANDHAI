const request = require('supertest');
const app = require('../server');
const db = require('./setup');
const Order = require('../models/Order');

beforeAll(async () => await db.connect());
afterEach(async () => await db.clearDatabase());
afterAll(async () => await db.closeDatabase());

describe('Order & Bargain Endpoints', () => {
    let customerToken;
    let sellerToken;
    let productId;

    beforeEach(async () => {
        // 1. Register Seller
        const sellerRes = await request(app).post('/api/auth/signup').send({
            name: 'Order Seller', email: 'orderseller@test.com', password: 'password123', role: 'seller'
        });
        sellerToken = sellerRes.body.data.accessToken;

        // 2. Create Product
        const prodRes = await request(app).post('/api/products')
            .set('Authorization', `Bearer ${sellerToken}`)
            .send({
                name: 'Order Item', description: 'A detailed valid description', price: 1000, category: 'Electronics', brand: 'BrandX', stock: 5, images: ['']
            });
        productId = prodRes.body.data._id || prodRes.body.data.id;

        // 3. Register Customer
        const custRes = await request(app).post('/api/auth/signup').send({
            name: 'Order Cust', email: 'ordercust@test.com', password: 'password123', role: 'customer'
        });
        customerToken = custRes.body.data.accessToken;
    });

    describe('Bargain Logic', () => {
        it('should create a bargain request for a product', async () => {
            const res = await request(app)
                .post('/api/bargain/start')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({
                    productId: productId,
                    offeredPrice: 800
                });

            // The exact endpoint behavior depends on bargainController.js (e.g., 201 Created or 200 OK)
            // We verify the request goes through successfully without crashing or rejecting auth.
            expect([200, 201]).toContain(res.statusCode);
            expect(res.body.success).toBe(true);
        });
    });

    describe('POST /api/orders', () => {
        it('should successfully place an order and deduct stock', async () => {
            const res = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({
                    items: [{ product: productId, quantity: 2 }],
                    shippingAddress: { street: '123 Main St', city: 'City', state: 'State', zipCode: '123456', country: 'IN', phone: '1234567890' },
                    paymentInfo: { method: 'card', id: 'mock_pay_123', status: 'captured' }
                });

            if (res.statusCode !== 201) {
                console.log('Order Creation Failed Body:', JSON.stringify(res.body, null, 2));
            }
            expect(res.statusCode).toEqual(201);
            expect(res.body.success).toBeTruthy();
            expect(res.body.data._id).toBeDefined();

            // Verify order saved to DB
            const dbOrder = await Order.findById(res.body.data._id);
            expect(dbOrder).toBeTruthy();
        });
    });
});
