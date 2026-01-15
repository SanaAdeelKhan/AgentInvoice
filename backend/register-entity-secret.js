require('dotenv').config();
const { registerEntitySecretCiphertext } = require('@circle-fin/developer-controlled-wallets');

async function register() {
  console.log('🔐 Registering Entity Secret with Circle...\n');

  try {
    const response = await registerEntitySecretCiphertext({
      apiKey: process.env.CIRCLE_API_KEY,
      entitySecret: process.env.CIRCLE_ENTITY_SECRET,
      recoveryFileDownloadPath: './' // Save recovery file in current directory
    });

    console.log('✅ Entity Secret registered successfully!\n');
    console.log('📄 Recovery file saved!');
    console.log('⚠️  IMPORTANT: Save the recovery file securely!\n');
    
    if (response.data?.recoveryFile) {
      console.log('Recovery File Data:');
      console.log(response.data.recoveryFile);
    }

    console.log('\n🎉 You can now create wallets!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

register();
