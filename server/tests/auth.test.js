const request = require('supertest');
const app = require('../server'); // Express app
const db = require('./setup');
const User = require('../models/User');

beforeAll(async () => await db.connect());
afterEach(async () => await db.clearDatabase());
afterAll(async () => await db.closeDatabase());

describe('Auth Endpoints', () => {

    describe('POST /api/auth/signup', () => {
        it('should correctly register a new customer', async () => {
            const res = await request(app)
                .post('/api/auth/signup')
                .send({
                    name: 'Test Customer',
                    email: 'test@customer.com',
                    password: 'password123',
                    role: 'customer'
                });

            expect([200, 201]).toContain(res.statusCode);
            expect(res.body).toHaveProperty('success', true);
            expect(res.body.data).toHaveProperty('accessToken');
            expect(res.body.data.user).toHaveProperty('email', 'test@customer.com');
            expect(res.body.data.user).toHaveProperty('role', 'customer');

            // Verify db insertion
            const userInDb = await User.findOne({ email: 'test@customer.com' });
            expect(userInDb).toBeTruthy();
        });

        it('should fail with an insecure small password', async () => {
            const res = await request(app)
                .post('/api/auth/signup')
                .send({
                    name: 'Failed User',
                    email: 'fail@fail.com',
                    password: '123'
                });

            // Mongoose validation should trigger and block it
            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('status', 'error');
        });
    });

    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            // Seed a user before these login tests
            await request(app).post('/api/auth/signup').send({
                name: 'Login User',
                email: 'login@test.com',
                password: 'correctpassword',
                role: 'seller'
            });
        });

        it('should login an existing user', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'login@test.com',
                    password: 'correctpassword'
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('success', true);
            expect(res.body.data).toHaveProperty('accessToken');
        });

        it('should fail on missing email or incorrect password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'login@test.com',
                    password: 'wrongpassword'
                });

            expect(res.statusCode).toEqual(401);
            expect(res.body).toHaveProperty('success', false);
        });
    });
});
