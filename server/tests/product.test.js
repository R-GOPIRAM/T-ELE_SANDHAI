const request = require('supertest');
const app = require('../server');
const db = require('./setup');
const Product = require('../models/Product');

beforeAll(async () => await db.connect());
afterEach(async () => await db.clearDatabase());
afterAll(async () => await db.closeDatabase());

describe('Product Endpoints', () => {
    let sellerToken;
    let sellerId;

    beforeEach(async () => {
        // Register and login a seller to get a token
        const res = await request(app).post('/api/auth/signup').send({
            name: 'Test Seller',
            email: 'seller@test.com',
            password: 'password123',
            role: 'seller'
        });
        sellerToken = res.body.data.accessToken;
        sellerId = res.body.data.user._id || res.body.data.user.id;
    });

    describe('GET /api/products', () => {
        it('should get an empty array when no products exist', async () => {
            const res = await request(app).get('/api/products');
            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBeTruthy();
            expect(res.body.data).toEqual([]);
        });
    });

    describe('POST /api/products', () => {
        it('should allow a seller to create a product', async () => {
            const productData = {
                name: 'Test Product',
                description: 'A great product',
                price: 1500,
                category: 'Electronics',
                brand: 'BrandX',
                stock: 10,
                images: ['image1.jpg']
            };

            const res = await request(app)
                .post('/api/products')
                .set('Authorization', `Bearer ${sellerToken}`)
                .send(productData);

            expect(res.statusCode).toEqual(201);
            expect(res.body.success).toBeTruthy();
            expect(res.body.data.name).toEqual('Test Product');

            // Verify in db
            const p = await Product.findOne({ name: 'Test Product' });
            expect(p).toBeTruthy();
            expect(p.price).toEqual(1500);
        });

        it('should reject unauthorized customer creation attempts', async () => {
            // Register a customer
            const custRes = await request(app).post('/api/auth/signup').send({
                name: 'Customer',
                email: 'customer@test.com',
                password: 'password123',
                role: 'customer'
            });
            const customerToken = custRes.body?.data?.accessToken;

            const res = await request(app)
                .post('/api/products')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({
                    name: 'Hacked Product',
                    price: 100,
                    category: 'Electronics',
                    brand: 'Hack',
                    stock: 1
                });

            // 403 Forbidden or 401 Unauthorized
            expect([401, 403]).toContain(res.statusCode);
            expect(res.body.success).toBeFalsy();
        });
    });
});
