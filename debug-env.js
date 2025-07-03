// Script para debuggear variables de entorno
require('dotenv').config({ path: '.env.local' });

console.log('=== DEBUG VARIABLES DE ENTORNO ===');
console.log('OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY);
console.log('OPENAI_API_KEY length:', process.env.OPENAI_API_KEY?.length || 0);
console.log('OPENAI_API_KEY prefix:', process.env.OPENAI_API_KEY?.substring(0, 30) || 'none');

// Test directo
const OpenAI = require('openai').default;

async function testDirectly() {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 10,
      messages: [{ role: 'user', content: 'Test' }],
    });
    
    console.log('✅ DIRECT TEST SUCCESS:', response.choices[0]?.message?.content);
  } catch (error) {
    console.log('❌ DIRECT TEST FAILED:', error.message);
    console.log('Error code:', error.code);
  }
}

testDirectly();