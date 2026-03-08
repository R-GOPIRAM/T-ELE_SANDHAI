const request = require('supertest');
const app = require('../server'); // Express app
const { clearDatabase } = require('./setup');
const User = require('../models/User');

afterEach(async () => await clearDatabase());

describe('Auth Endpoints', () => {

    describe('POST /api/auth/register/customer', () => {
        it('should correctly register a new customer', async () => {
            const res = await request(app)
                .post('/api/auth/register/customer')
                .send({
                    name: 'Test Customer',
                    email: 'test@customer.com',
                    password: 'password123',
                });

            expect([200, 201]).toContain(res.statusCode);
            expect(res.body).toHaveProperty('success', true);
            // The controller returns responseData directly with user object at top level in some cases, 
            // but let's check authController.js again.
            // authController.js: return res.status(200).json(responseData); 
            // responseData = { success: true, user: { id, name, email, role }, role, message }
            expect(res.body.user).toHaveProperty('email', 'test@customer.com');
            expect(res.body.user).toHaveProperty('role', 'customer');

            // Verify db insertion
            const userInDb = await User.findOne({ email: 'test@customer.com' });
            expect(userInDb).toBeTruthy();
        });

        it('should fail with an insecure small password', async () => {
            const res = await request(app)
                .post('/api/auth/register/customer')
                .send({
                    name: 'Failed User',
                    email: 'fail@fail.com',
                    password: '123'
                });

            // Mongoose validation should trigger and block it
            expect(res.statusCode).toEqual(400);
        });
    });

    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            // Seed a user before these login tests
            await request(app).post('/api/auth/register/customer').send({
                name: 'Login User',
                email: 'login@test.com',
                password: 'correctpassword',
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
            expect(res.body.user).toHaveProperty('email', 'login@test.com');
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
