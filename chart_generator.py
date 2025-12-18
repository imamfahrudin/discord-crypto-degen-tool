#!/usr/bin/env python3
"""
Chart generator for Discord Crypto Degen Tool
Uses the same logic as discord-crypto-screening-tool/chart_generator.py
"""

import sys
import json
import pandas as pd
from io import BytesIO
import base64
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
import matplotlib.patches as patches
import mplfinance as mpf
from datetime import datetime
import warnings

def generate_candlestick_chart(ohlc_data, token_name, symbol, timeframe):
    """
    Generate a candlestick chart using the same logic as the Python screening tool.

    Args:
        ohlc_data: List of OHLC objects with timestamp, open, high, low, close, volume
        token_name: Token name for chart title
        symbol: Token symbol
        timeframe: Chart timeframe

    Returns:
        Base64 encoded PNG image
    """
    try:
        # Convert to DataFrame
        df = pd.DataFrame(ohlc_data)
        df['timestamp'] = pd.to_datetime(df['timestamp'], unit='s')
        df = df.set_index('timestamp')
        df = df.rename(columns={
            'open': 'Open',
            'high': 'High',
            'low': 'Low',
            'close': 'Close',
            'volume': 'Volume'
        })

        # Limit to last 100 candles for better visibility
        df_plot = df.tail(100).copy()

        # Custom style with modern light theme (matching Python screening tool)
        mc = mpf.make_marketcolors(
            up='#00D4AA', down='#FF6B6B',  # Teal for up, coral for down
            edge='inherit',
            wick={'up':'#00D4AA', 'down':'#FF6B6B'},
            volume={'up':'#00D4AA', 'down':'#FF6B6B'},
            alpha=0.9
        )

        s = mpf.make_mpf_style(
            marketcolors=mc,
            gridcolor='#e0e0e0',
            gridstyle=':',
            y_on_right=True,
            facecolor='#ffffff',
            edgecolor='#000000',
            figcolor='#ffffff',
            gridaxis='both'
        )

        # Create figure with volume panel
        fig, axes = mpf.plot(df_plot,
                           type='candle',
                           style=s,
                           volume=True,
                           volume_panel=1,
                           panel_ratios=(7, 1),
                           ylabel='Price',
                           ylabel_lower='Volume',
                           figsize=(16, 9),
                           returnfig=True,
                           warn_too_much_data=200)

        ax = axes[0]

        # Style volume bars
        if len(axes) > 1:
            volume_ax = axes[1]
            for collection in volume_ax.collections:
                collection.set_alpha(0.7)
            for patch in volume_ax.patches:
                patch.set_alpha(0.7)
            volume_ax.set_facecolor('#ffffff')
            volume_ax.grid(True, alpha=0.2, linestyle=':', linewidth=0.5)

        # Set black borders for all axes
        for axis in axes:
            for spine in axis.spines.values():
                spine.set_edgecolor('black')
                spine.set_linewidth(1.5)

        # Title and formatting
        timestamp = datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')
        ax.set_title(f'{token_name} ({symbol}) - {timeframe.upper()} Candlestick Chart • {timestamp}',
                    color='#212121', fontsize=16, pad=20, fontweight='bold')

        # Grid styling
        ax.grid(True, alpha=0.3, linestyle=':', linewidth=0.5)
        ax.set_facecolor('#ffffff')

        # Adjust layout
        with warnings.catch_warnings():
            warnings.simplefilter("ignore", UserWarning)
            plt.tight_layout()

        # Save to BytesIO and encode as base64
        buf = BytesIO()
        fig.savefig(buf, format='png', dpi=200, facecolor='#ffffff', edgecolor='none', bbox_inches='tight')
        buf.seek(0)

        # Convert to base64
        image_base64 = base64.b64encode(buf.getvalue()).decode('utf-8')

        # Close figure to free memory
        plt.close(fig)

        return image_base64

    except Exception as e:
        print(f"Error generating chart: {e}", file=sys.stderr)
        return None

if __name__ == "__main__":
    # Read JSON data from stdin
    try:
        input_data = json.load(sys.stdin)
        ohlc_data = input_data['ohlcData']
        token_name = input_data['tokenName']
        symbol = input_data['symbol']
        timeframe = input_data['timeframe']

        # Generate chart
        result = generate_candlestick_chart(ohlc_data, token_name, symbol, timeframe)

        if result:
            # Output base64 image
            print(json.dumps({"success": True, "image": result}))
        else:
            print(json.dumps({"success": False, "error": "Chart generation failed"}))

    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}), file=sys.stderr)