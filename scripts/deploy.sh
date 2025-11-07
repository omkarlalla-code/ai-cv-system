#!/bin/bash

# Quick Deploy Script for Railway/Render
# This will help deploy the app to a cloud service

echo "🚀 Deploying BetterCV to Cloud..."
echo ""
echo "Choose a deployment method:"
echo "1. Railway (recommended - free tier)"
echo "2. Render (free tier)"
echo "3. Vercel (frontend only)"
echo ""

# Railway deployment
deploy_railway() {
    echo "📦 Preparing for Railway deployment..."

    # Check if railway CLI is installed
    if ! command -v railway &> /dev/null; then
        echo "Installing Railway CLI..."
        npm i -g @railway/cli
    fi

    railway login
    railway init
    railway up
}

# Render deployment
deploy_render() {
    echo "📦 Preparing for Render deployment..."
    echo "Visit: https://render.com/deploy"
    echo "Connect your GitHub repo and use render.yaml"
}

# Usage instructions
echo "Or deploy manually:"
echo ""
echo "🔹 Railway:"
echo "   npm i -g @railway/cli"
echo "   railway login"
echo "   railway up"
echo ""
echo "🔹 Render:"
echo "   1. Go to https://dashboard.render.com/"
echo "   2. New > Web Service"
echo "   3. Connect your GitHub repo"
echo ""
echo "🔹 Vercel (Frontend only):"
echo "   cd frontend/dashboard"
echo "   npm i -g vercel"
echo "   vercel"
