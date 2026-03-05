import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

async function runVerification() {
    console.log('🚀 Starting Backend Verification...\n');

    // 1. Health Check
    try {
        console.log('1️⃣  Testing Health Check...');
        const healthRes = await axios.get(`${API_URL}/health`);
        if (healthRes.status === 200) {
            console.log('✅ Health Check Passed:', healthRes.data);
        } else {
            console.error('❌ Health Check Failed:', healthRes.status);
        }
    } catch (error) {
        console.error('❌ Health Check Error:', error.message);
    }

    // 2. Fetch Public Products
    try {
        console.log('\n2️⃣  Testing Get Products (Public)...');
        const prodRes = await axios.get(`${API_URL}/products`);
        if (prodRes.status === 200) {
            console.log(`✅ Get Products Passed. Found ${prodRes.data?.data?.length || 0} products.`);
        } else {
            console.error('❌ Get Products Failed:', prodRes.status);
        }
    } catch (error) {
        console.error('❌ Get Products Error:', error.message);
    }

    // 3. Register New User
    const randomStr = Math.random().toString(36).substring(7);
    const testUser = {
        name: `Test User ${randomStr}`,
        email: `test_${randomStr}@example.com`,
        password: 'password123',
        role: 'customer'
    };

    let token = null;

    try {
        console.log(`\n3️⃣  Testing Registration (${testUser.email})...`);
        const regRes = await axios.post(`${API_URL}/auth/signup`, testUser);
        if (regRes.status === 200 || regRes.status === 201) {
            console.log('✅ Registration Passed:', regRes.data.user?.email);
            token = regRes.data.accessToken;
        } else {
            console.error('❌ Registration Failed:', regRes.status, regRes.data);
        }
    } catch (error) {
        console.error('❌ Registration Error:', error.response?.data?.message || error.message);
    }

    // 4. Verify Protected Route (Get Me)
    if (token) {
        try {
            console.log('\n4️⃣  Testing Protected Route (/auth/me)...');
            const meRes = await axios.get(`${API_URL}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (meRes.status === 200) {
                console.log('✅ Protected Route Passed. User:', meRes.data.user.email);
            } else {
                console.error('❌ Protected Route Failed:', meRes.status);
            }
        } catch (error) {
            console.error('❌ Protected Route Error:', error.response?.data?.message || error.message);
        }
    } else {
        console.log('\n⚠️  Skipping Protected Route test (no token).');
    }

    console.log('\n🏁 Verification Complete.');
}

runVerification();
