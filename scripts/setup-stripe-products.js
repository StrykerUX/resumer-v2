const Stripe = require('stripe');
require('dotenv').config({ path: '.env.local' });

// Configurar Stripe con la clave secreta
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Configuración de productos
const products = [
  // Productos MXN
  {
    name: 'Plan Básico - Resumer v2',
    description: '50 créditos para mejorar CVs con IA',
    currency: 'mxn',
    price: 6900, // $69.00 MXN en centavos
    credits: 50,
    plan: 'basic'
  },
  {
    name: 'Plan Pro - Resumer v2',
    description: '120 créditos para mejoras profesionales de CVs',
    currency: 'mxn',
    price: 12900, // $129.00 MXN en centavos
    credits: 120,
    plan: 'pro'
  },
  {
    name: 'Plan Premium - Resumer v2',
    description: '200 créditos para optimización avanzada de CVs',
    currency: 'mxn',
    price: 19900, // $199.00 MXN en centavos
    credits: 200,
    plan: 'premium'
  },
  // Productos USD
  {
    name: 'Basic Plan - Resumer v2',
    description: '50 credits for AI-powered CV enhancement',
    currency: 'usd',
    price: 370, // $3.70 USD en centavos
    credits: 50,
    plan: 'basic'
  },
  {
    name: 'Pro Plan - Resumer v2',
    description: '120 credits for professional CV improvements',
    currency: 'usd',
    price: 690, // $6.90 USD en centavos
    credits: 120,
    plan: 'pro'
  },
  {
    name: 'Premium Plan - Resumer v2',
    description: '200 credits for advanced CV optimization',
    currency: 'usd',
    price: 1070, // $10.70 USD en centavos
    credits: 200,
    plan: 'premium'
  }
];

async function createStripeProducts() {
  console.log('🚀 Creando productos en Stripe...\n');
  
  const createdPrices = {};
  
  for (const productData of products) {
    try {
      console.log(`📦 Creando: ${productData.name} (${productData.currency.toUpperCase()})`);
      
      // Crear producto
      const product = await stripe.products.create({
        name: productData.name,
        description: productData.description,
        metadata: {
          credits: productData.credits.toString(),
          plan: productData.plan,
          currency: productData.currency
        }
      });
      
      console.log(`   ✅ Producto creado: ${product.id}`);
      
      // Crear precio
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: productData.price,
        currency: productData.currency,
        metadata: {
          credits: productData.credits.toString(),
          plan: productData.plan
        }
      });
      
      console.log(`   💰 Precio creado: ${price.id}`);
      
      // Guardar price ID para el .env
      const envKey = `STRIPE_PRICE_${productData.plan.toUpperCase()}_${productData.currency.toUpperCase()}`;
      createdPrices[envKey] = price.id;
      
      console.log(`   🔑 ${envKey}="${price.id}"\n`);
      
    } catch (error) {
      console.error(`❌ Error creando ${productData.name}:`, error.message);
    }
  }
  
  // Mostrar resumen para copiar al .env.local
  console.log('\n🎉 ¡Productos creados exitosamente!');
  console.log('\n📋 Copia estas líneas a tu .env.local:\n');
  console.log('# Precios Stripe (generados automáticamente)');
  
  Object.entries(createdPrices).forEach(([key, value]) => {
    console.log(`${key}="${value}"`);
  });
  
  console.log('\n✨ ¡Listo! Ahora puedes usar el sistema de pagos.');
}

// Ejecutar script
createStripeProducts().catch(console.error);