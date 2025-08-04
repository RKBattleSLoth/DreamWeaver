// Test JWT functionality
import jwt from 'jsonwebtoken';

console.log('Testing JWT...');

try {
    const token = jwt.sign({ userId: 'test123' }, 'secret-key');
    console.log('✅ JWT sign works:', token.substring(0, 50) + '...');
    
    const decoded = jwt.verify(token, 'secret-key');
    console.log('✅ JWT verify works:', decoded);
} catch (error) {
    console.error('❌ JWT error:', error.message);
}