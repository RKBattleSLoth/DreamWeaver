// Test bcrypt functionality
import bcrypt from 'bcryptjs';

console.log('Testing bcrypt...');

try {
    const hash = bcrypt.hashSync('password123', 10);
    console.log('✅ Bcrypt hash works:', hash.substring(0, 20) + '...');
    
    const isValid = bcrypt.compareSync('password123', hash);
    console.log('✅ Bcrypt compare works:', isValid);
} catch (error) {
    console.error('❌ Bcrypt error:', error.message);
}