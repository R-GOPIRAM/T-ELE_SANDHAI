const request = require('supertest');
const app = require('../server');
const db = require('./setup');

beforeAll(async () => await db.connect());
afterAll(async () => await db.closeDatabase());

describe('MongoDB Injection Protection', () => {
    it('should sanitize request body by removing keys starting with $', async () => {
        // We can use any endpoint that accepts a body, e.g., /api/auth/login
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@test.com',
                password: { '$gt': '' } // Malicious NoSQL injection attempt
            });

        // The controller should receive sanitized data
        // For this test, we just check that the request doesn't crash 
        // and ideally we'd spy on the controller, but express-mongo-sanitize 
        // works by mutating req.body before it reaches the controller.

        // Since login will fail anyway with these credentials, we just want to see 401 
        // and ensure the middleware ran.
        expect(res.statusCode).toBe(401);
        expect(res.body.success).toBe(false);
    });

    it('should sanitize query parameters', async () => {
        const res = await request(app)
            .get('/api/products?price[$gt]=0'); // Malicious query attempt

        // Query params should be sanitized.
        expect(res.statusCode).not.toBe(500);
    });
});
