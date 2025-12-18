// Quick test for GeckoTerminal API integration
const { fetchOHLCData, searchPoolsByToken } = require('./src/geckoterminal');

async function testGeckoTerminal() {
  try {
    console.log('Testing GeckoTerminal API...');

    // Test with a popular token (WETH on Ethereum)
    const testAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'; // WETH
    const network = 'eth';

    console.log(`Fetching pools for ${testAddress} on ${network}...`);
    const pools = await searchPoolsByToken(network, testAddress);

    if (pools && pools.length > 0) {
      const poolAddress = pools[0].id.split('_')[1]; // Extract pool address from ID
      console.log(`Found pool: ${poolAddress}`);

      console.log('Fetching OHLC data...');
      const ohlcData = await fetchOHLCData(network, poolAddress, '1h', 10);

      console.log(`Retrieved ${ohlcData.length} OHLC data points`);
      if (ohlcData.length > 0) {
        console.log('Sample data point:', ohlcData[0]);
        console.log('✅ GeckoTerminal API integration working!');
      }
    } else {
      console.log('❌ No pools found for test token');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testGeckoTerminal();