import { getIllustrationsByUserId } from './src/services/postgres-database.js';

async function checkIllustrations() {
  try {
    const illustrations = await getIllustrationsByUserId('742b6d33-f1fc-4f71-b1d2-96e71cdbc1c6');
    console.log('Total illustrations:', illustrations.length);
    console.log('\nFirst 2 illustrations:');
    illustrations.slice(0, 2).forEach((ill, index) => {
      console.log(`\nIllustration ${index + 1}:`);
      console.log('  ID:', ill.id);
      console.log('  image_path:', ill.image_path);
      console.log('  image_url:', ill.image_url);
      console.log('  file_path:', ill.file_path);
      console.log('  session_id:', ill.session_id);
    });
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkIllustrations();