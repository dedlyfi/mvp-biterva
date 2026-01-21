#!/bin/bash
set -e

echo "🚀 Setting up LNBits locally..."

# 1. Check/Install uv
UV_CMD="uv"
if ! command -v uv &> /dev/null; then
    echo "📦 'uv' not found globally. Setting up local bootstrap..."
    
    if [ ! -d "venv-bootstrap" ]; then
        echo "   Creating bootstrap venv..."
        python3 -m venv venv-bootstrap
    fi
    
    echo "   Installing 'uv' into bootstrap venv..."
    ./venv-bootstrap/bin/pip install uv
    
    UV_CMD="./venv-bootstrap/bin/uv"
else
    echo "✅ 'uv' is installed."
fi

# 1.5 Install System Dependencies (macOS) to build secp256k1
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🍎 macOS detected. Checking for build tools..."
    if ! command -v pkg-config &> /dev/null || ! command -v pg_config &> /dev/null; then
        echo "📦 Build tools (pkg-config or pg_config) missing. Installing dependencies..."
        # postgresql required for pg_config (psycopg2)
        brew install automake libtool pkg-config postgresql libsodium
    else
        echo "✅ Build tools are installed."
    fi
    
    # Ensure pg_config is in PATH (required for psycopg2)
    if ! command -v pg_config &> /dev/null; then
        echo "⚠️ pg_config not found in PATH. Checking common Homebrew locations..."
        if [ -d "/opt/homebrew/opt/postgresql@14/bin" ]; then
            export PATH="/opt/homebrew/opt/postgresql@14/bin:$PATH"
            echo "   Added postgresql@14 to PATH."
        elif [ -d "/opt/homebrew/opt/postgresql/bin" ]; then
             export PATH="/opt/homebrew/opt/postgresql/bin:$PATH"
             echo "   Added postgresql to PATH."
        fi
    fi
fi

# 2. Build Frontend Assets (Required for UI)
echo "📦 Installing Node dependencies and building assets..."
npm install
# v0.12.1 does not have a 'bundle' script, running steps manually:
npm run sass
npm run vendor_copy
npm run vendor_json
npm run vendor_bundle_css
npm run vendor_bundle_js
npm run vendor_minify_css
npm run vendor_minify_js

# 3. Cleanup Port 8008
echo "🧹 Checking for processes on port 8008..."
lsof -ti:8008 | xargs kill -9 2>/dev/null || true

# 3. Install Python Dependencies
echo "📦 Installing Python dependencies..."
# psycopg2-binary 2.9.7 fails on Python 3.13, ensuring 3.11 via Homebrew
if ! command -v /opt/homebrew/opt/python@3.11/bin/python3.11 &> /dev/null; then
    echo "📦 Installing Python 3.11..."
    brew install python@3.11
fi

echo "📦 Creating venv with Python 3.11..."
/opt/homebrew/opt/python@3.11/bin/python3.11 -m venv .venv

# Activate venv for the following commands or direct uv to use it
source .venv/bin/activate

echo "📦 Upgrading pip..."
pip install --upgrade pip

echo "📦 Installing dependencies via pip..."
pip install -e .
pip install "uvicorn[standard]"

# Set env vars to ensure settings are picked up
export LNBITS_PORT=8008
export LNBITS_HOST=0.0.0.0

# Run uvicorn directly to bypass multiprocessing issues
uvicorn lnbits.__main__:app --host 0.0.0.0 --port 8008
