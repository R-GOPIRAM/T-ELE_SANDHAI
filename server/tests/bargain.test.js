const request = require('supertest');
const app = require('../server');
const db = require('./setup');
const Product = require('../models/Product');
const Bargain = require('../models/Bargain');

beforeAll(async () => await db.connect());
afterEach(async () => await db.clearDatabase());
afterAll(async () => await db.closeDatabase());

describe('Bargain Endpoints', () => {
    let customerToken;
    let sellerToken;
    let sellerId;
    let customerId;
    let productId;

    beforeEach(async () => {
        const sellerRes = await request(app).post('/api/auth/signup').send({
            name: 'B Seller', email: 'bseller@test.com', password: 'password123', role: 'seller'
        });
        sellerToken = sellerRes.body.data.accessToken;
        sellerId = sellerRes.body.data.user.id;

        const custRes = await request(app).post('/api/auth/signup').send({
            name: 'B Cust', email: 'bcust@test.com', password: 'password123', role: 'customer'
        });
        customerToken = custRes.body.data.accessToken;
        customerId = custRes.body.data.user.id;

        const prodRes = await request(app).post('/api/products')
            .set('Authorization', `Bearer ${sellerToken}`)
            .send({
                name: 'Laptop', description: 'A detailed valid description', price: 50000, category: 'Electronics', brand: 'BrandX', stock: 5, images: [''],
                minBargainPrice: 45000 // Secret minimum threshold
            });
        productId = prodRes.body.data._id || prodRes.body.data.id;
    });

    describe('POST /api/bargain/start', () => {
        it('should automatically reject an offer drastically below the minimum threshold', async () => {
            const res = await request(app)
                .post('/api/bargain/start')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({
                    productId: productId,
                    offeredPrice: 1000 // Very low offer
                });

            // The lowest offers throw a 400 Bad Request dynamically via AppError
            // The global error handler maps this AppError to status = 'fail' in res.body natively
            expect(res.statusCode).toEqual(400);
            expect(res.body.status).toBe('fail');
        });

        it('should allow seller to accept an offer above the minimum threshold', async () => {
            // Customer starts negotiation
            const initRes = await request(app)
                .post('/api/bargain/start')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({
                    productId: productId,
                    offeredPrice: 48000 // Above 45k min threshold
                });

            expect([200, 201]).toContain(initRes.statusCode);

            // Get the bargain ID directly from the creation response or DB query
            const allBargains = await Bargain.find();
            const bargainId = allBargains[0]._id;

            // Seller accepts the offer explicitly
            const actionRes = await request(app)
                .post('/api/bargain/action')
                .set('Authorization', `Bearer ${sellerToken}`)
                .send({
                    bargainId: bargainId,
                    status: 'accepted'
                });

            expect(actionRes.statusCode).toEqual(200);

            const finalBargain = await Bargain.findById(bargainId);
            expect(finalBargain).toBeTruthy();
            expect(finalBargain.status).toBe('accepted'); // Assert accepted state
        });
    });
});
