import { NextRequest, NextResponse } from 'next/server';

/**
 * Test directo de OpenAI para identificar el problema exacto
 */
export async function GET() {
  try {
    console.log('🧪 TESTING - Test directo de OpenAI...');
    
    // Test 1: Verificar API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        error: 'OPENAI_API_KEY not found'
      }, { status: 500 });
    }
    
    console.log('✅ API Key found, length:', apiKey.length);
    
    // Test 2: Importar OpenAI
    const { default: OpenAI } = await import('openai');
    console.log('✅ OpenAI imported');
    
    // Test 3: Crear cliente
    const openai = new OpenAI({
      apiKey: apiKey,
    });
    console.log('✅ OpenAI client created');
    
    // Test 4: Test simple con gpt-4o-mini
    console.log('🔍 Testing gpt-4o-mini...');
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.7,
      max_tokens: 50,
      messages: [
        { role: 'system', content: 'Eres un asistente útil.' },
        { role: 'user', content: 'Di "Hola mundo" brevemente.' }
      ],
    });
    
    console.log('✅ OpenAI response received');
    
    return NextResponse.json({
      success: true,
      test: 'openai_direct_success',
      response: {
        model: response.model,
        content: response.choices[0]?.message?.content,
        usage: response.usage
      },
      apiKeyLength: apiKey.length,
      message: '✅ OpenAI funcionando perfectamente'
    });
    
  } catch (error: any) {
    console.error('❌ Error en test directo:', error);
    
    return NextResponse.json({
      success: false,
      test: 'openai_direct_failed',
      error: {
        message: error.message,
        code: error.code,
        type: error.type,
        status: error.status,
        stack: error.stack
      },
      apiKeyExists: !!process.env.OPENAI_API_KEY,
      apiKeyLength: process.env.OPENAI_API_KEY?.length || 0
    }, { status: 500 });
  }
}