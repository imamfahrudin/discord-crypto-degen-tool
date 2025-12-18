// Chart generation utilities using Chart.js and Canvas
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

// Import date adapter using createRequire to handle ES modules
const { createRequire } = require('module');
const { fileURLToPath } = require('url');
const requireESM = createRequire(fileURLToPath(`file://${__filename}`));
requireESM('chartjs-adapter-date-fns');

/**
 * Generates a candlestick chart from OHLC data
 * @param {Array} ohlcData - Array of OHLC objects with timestamp, open, high, low, close, volume
 * @param {string} tokenName - Token name for chart title
 * @param {string} symbol - Token symbol
 * @param {string} timeframe - Chart timeframe (e.g., '1h', '4h', '1d')
 * @returns {Promise<Buffer>} PNG image buffer
 */
async function generateCandlestickChart(ohlcData, tokenName, symbol, timeframe) {
  try {
    // Dynamically import ES module components
    const { CandlestickController, CandlestickElement } = await import('chartjs-chart-financial');

    // Create chart canvas with font configuration
    const width = 800;
    const height = 400;
    const chartJSNodeCanvas = new ChartJSNodeCanvas({
      width,
      height,
      chartCallback: (ChartJS) => {
        ChartJS.defaults.responsive = false;
        ChartJS.defaults.maintainAspectRatio = false;
        // Register candlestick components
        ChartJS.register(CandlestickController, CandlestickElement);
        // Configure fonts for Docker environment
        ChartJS.defaults.font.family = 'Liberation Sans, DejaVu Sans, Arial, sans-serif';
        ChartJS.defaults.font.size = 12;
      }
    });

    // Prepare data for Chart.js candlestick format
    const candlestickData = ohlcData.map(item => ({
      x: item.timestamp * 1000,  // Timestamp in milliseconds
      o: item.open,  // Open
      h: item.high,  // High
      l: item.low,   // Low
      c: item.close  // Close
    }));
    const volumeData = ohlcData.map(item => item.volume);

    const configuration = {
      type: 'candlestick',
      data: {
        datasets: [
          {
            label: 'Price',
            data: candlestickData,
            color: {
              up: '#00D4AA',    // Teal for up candles (matches Python)
              down: '#FF6B6B',  // Coral for down candles
              unchanged: '#e0e0e0'  // Light gray for unchanged
            },
            borderColor: {
              up: '#00D4AA',
              down: '#FF6B6B',
              unchanged: '#e0e0e0'
            }
          },
          {
            label: 'Volume',
            data: volumeData,
            type: 'bar',  // Volume as bars below (like Python volume panel)
            backgroundColor: '#00D4AA',  // Teal bars
            yAxisID: 'volume'
          }
        ]
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: `${tokenName} (${symbol}) - ${timeframe} Candlestick Chart`,
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
            position: 'right',  // Like Python y_on_right
            grid: {
              color: '#e0e0e0'
            },
            ticks: {
              callback: function(value) {
                return '$' + value.toFixed(6);
              }
            }
          },
          volume: {
            type: 'linear',
            position: 'left',
            display: true,  // Show volume scale
            grid: {
              drawOnChartArea: false  // Separate volume area
            }
          }
        },
        layout: {
          padding: 20
        }
      }
    };

    // Return PNG buffer
    return await chartJSNodeCanvas.renderToBuffer(configuration);

  } catch (error) {
    console.error('Error generating candlestick chart:', error);
    throw error;
  }
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