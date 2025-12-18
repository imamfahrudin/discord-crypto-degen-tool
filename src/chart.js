// Chart generation utilities using Python backend
const { spawn } = require('child_process');
const path = require('path');

/**
 * Generates a candlestick chart using Python backend
 * @param {Array} ohlcData - Array of OHLC objects with timestamp, open, high, low, close, volume
 * @param {string} tokenName - Token name for chart title
 * @param {string} symbol - Token symbol
 * @param {string} timeframe - Chart timeframe (e.g., '1h', '4h', '1d')
 * @returns {Promise<Buffer>} PNG image buffer
 */
async function generateCandlestickChart(ohlcData, tokenName, symbol, timeframe, contractAddress = null, network = null) {
  return new Promise((resolve, reject) => {
    try {
      // Prepare data for Python script
      const inputData = {
        ohlcData,
        tokenName,
        symbol,
        timeframe,
        contractAddress,
        network
      };

      // Spawn Python process
      const pythonProcess = spawn('python3', [path.join(__dirname, '..', 'chart_generator.py')], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      // Send data to Python script via stdin
      pythonProcess.stdin.write(JSON.stringify(inputData));
      pythonProcess.stdin.end();

      // Collect output
      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      // Handle process completion
      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          console.error('Python chart generator failed:', stderr);
          reject(new Error(`Python process exited with code ${code}: ${stderr}`));
          return;
        }

        try {
          const result = JSON.parse(stdout.trim());

          if (result.success && result.image) {
            // Convert base64 back to buffer
            const imageBuffer = Buffer.from(result.image, 'base64');
            resolve(imageBuffer);
          } else {
            reject(new Error(result.error || 'Chart generation failed'));
          }
        } catch (parseError) {
          console.error('Failed to parse Python output:', stdout);
          reject(new Error(`Failed to parse Python output: ${parseError.message}`));
        }
      });

      pythonProcess.on('error', (error) => {
        console.error('Failed to start Python process:', error);
        reject(new Error(`Failed to start Python process: ${error.message}`));
      });

    } catch (error) {
      console.error('Error in generateCandlestickChart:', error);
      reject(error);
    }
  });
}

/**
 * Generates a simple price chart (line chart) from OHLC data
 * @param {Array} ohlcData - Array of OHLC objects
 * @param {string} tokenName - Token name
 * @param {string} symbol - Token symbol
 * @param {string} timeframe - Chart timeframe
 * @returns {Promise<Buffer>} PNG image buffer
 */
async function generatePriceChart(ohlcData, tokenName, symbol, timeframe) {
  try {
    const width = 800;
    const height = 400;
    const chartJSNodeCanvas = new ChartJSNodeCanvas({
      width,
      height,
      chartCallback: (ChartJS) => {
        ChartJS.defaults.responsive = false;
        ChartJS.defaults.maintainAspectRatio = false;
        // Configure fonts for Docker environment
        ChartJS.defaults.font.family = 'Liberation Sans, DejaVu Sans, Arial, sans-serif';
        ChartJS.defaults.font.size = 12;
      }
    });

    // Prepare data
    const labels = ohlcData.map(item => new Date(item.timestamp * 1000));
    const prices = ohlcData.map(item => item.close);

    const configuration = {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Price',
          data: prices,
          borderColor: '#00BFFF',
          backgroundColor: 'rgba(0, 191, 255, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.1
        }]
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: `${tokenName} (${symbol}) Price Chart - ${timeframe}`,
            font: {
              size: 16,
              weight: 'bold'
            },
            padding: 20
          },
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            type: 'time',
            time: {
              displayFormats: {
                hour: 'HH:mm',
                day: 'MMM dd'
              }
            },
            grid: {
              color: '#e0e0e0'
            }
          },
          y: {
            grid: {
              color: '#e0e0e0'
            },
            ticks: {
              callback: function(value) {
                return '$' + value.toFixed(6);
              }
            }
          }
        }
      }
    };

    return await chartJSNodeCanvas.renderToBuffer(configuration);

  } catch (error) {
    console.error('Error generating price chart:', error);
    throw error;
  }
}

module.exports = {
  generateCandlestickChart,
  generatePriceChart,
};