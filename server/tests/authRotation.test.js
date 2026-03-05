const request = require('supertest');
const app = require('../server');
const db = require('./setup');
const User = require('../models/User');

beforeAll(async () => await db.connect());
afterEach(async () => await db.clearDatabase());
afterAll(async () => await db.closeDatabase());

describe('Auth Token Rotation and Secure Cookies', () => {
    const userData = {
        name: 'Rotation User',
        email: 'rotation@test.com',
        password: 'password123',
        role: 'customer'
    };

    it('should set httpOnly cookies on login', async () => {
        await request(app).post('/api/auth/signup').send(userData);

        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: userData.email,
                password: userData.password
            });

        expect(res.statusCode).toEqual(200);

        // Check for cookies in set-cookie header
        const cookies = res.headers['set-cookie'];
        expect(cookies).toBeDefined();

        const cookieString = cookies.join(';');
        expect(cookieString).toContain('accessToken');
        expect(cookieString).toContain('refreshToken');
        expect(cookieString).toContain('HttpOnly');
    });

    it('should rotate refresh token on /auth/refresh', async () => {
        await request(app).post('/api/auth/signup').send(userData);

        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: userData.email,
                password: userData.password
            });

        const initialCookies = loginRes.headers['set-cookie'];
        const refreshTokenCookie = initialCookies.find(c => c.startsWith('refreshToken='));
        const refreshToken = refreshTokenCookie.split(';')[0].split('=')[1];

        // 1st Refresh
        const refreshRes1 = await request(app)
            .post('/api/auth/refresh')
            .set('Cookie', [refreshTokenCookie]);

        expect(refreshRes1.statusCode).toEqual(200);

        const cookies1 = refreshRes1.headers['set-cookie'];
        const newRefreshTokenCookie1 = cookies1.find(c => c.startsWith('refreshToken='));
        const newRefreshToken1 = newRefreshTokenCookie1.split(';')[0].split('=')[1];

        expect(newRefreshToken1).not.toBe(refreshToken);

        // Verify old token is invalidated in DB (it should be replaced by the new one)
        const user = await User.findOne({ email: userData.email }).select('+refreshToken');
        expect(user.refreshToken).toBe(newRefreshToken1);

        // 2nd Refresh with the same OLD token should fail (Reuse Detection)
        const refreshRes2 = await request(app)
            .post('/api/auth/refresh')
            .set('Cookie', [refreshTokenCookie]);

        expect(refreshRes2.statusCode).toEqual(401);
        expect(refreshRes2.body.message).toContain('reuse detected');

        // After reuse detection, the current token should also be cleared (nuclear option for security)
        const userAfterReuse = await User.findOne({ email: userData.email }).select('+refreshToken');
        expect(userAfterReuse.refreshToken).toBeNull();
    });

    it('should fail if refresh token is missing or invalid', async () => {
        const res = await request(app).post('/api/auth/refresh');
        expect(res.statusCode).toEqual(401);
        expect(res.body.message).toContain('required');

        const resInvalid = await request(app)
            .post('/api/auth/refresh')
            .set('Cookie', ['refreshToken=invalidtoken']);
        expect(resInvalid.statusCode).toEqual(401);
    });
});
