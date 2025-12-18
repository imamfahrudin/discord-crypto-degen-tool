// Chart generation utilities using Chart.js and Canvas
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

// Import and register Chart.js date adapter
require('chartjs-adapter-moment');

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
    // Create chart canvas
    const width = 800;
    const height = 400;
    const chartJSNodeCanvas = new ChartJSNodeCanvas({
      width,
      height,
      chartCallback: (ChartJS) => {
        ChartJS.defaults.responsive = false;
        ChartJS.defaults.maintainAspectRatio = false;
      }
    });

    // Prepare data for Chart.js
    const labels = ohlcData.map(item => new Date(item.timestamp * 1000));
    const openData = ohlcData.map(item => item.open);
    const highData = ohlcData.map(item => item.high);
    const lowData = ohlcData.map(item => item.low);
    const closeData = ohlcData.map(item => item.close);

    const configuration = {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Close Price',
            data: closeData,
            borderColor: '#00D4AA',
            backgroundColor: 'rgba(0, 212, 170, 0.1)',
            borderWidth: 2,
            fill: false,
            pointRadius: 0,
            pointHoverRadius: 0,
          }
        ]
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: `${tokenName} (${symbol}) - ${timeframe} Chart`,
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
        },
        elements: {
          point: {
            radius: 0
          }
        }
      }
    };

    // Return PNG buffer
    return await chartJSNodeCanvas.renderToBuffer(configuration);

  } catch (error) {
    console.error('Error generating chart:', error);
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