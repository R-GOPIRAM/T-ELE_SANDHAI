const request = require('supertest');
const app = require('../server');

describe('App Import Test', () => {
    it('should respond to health check', async () => {
        const res = await request(app).get('/api/health');
        expect(res.statusCode).toBe(200);
    });
});
