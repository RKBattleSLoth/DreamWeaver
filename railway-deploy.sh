#!/bin/bash

# Railway deployment preparation script
echo "Preparing DreamWeaver for Railway deployment..."

# Copy simplified package.json for Railway
cp package-railway.json package.json

echo "✅ Railway deployment files ready!"
echo "Now commit and push these changes to trigger Railway deployment."