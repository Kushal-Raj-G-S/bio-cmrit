/**
 * QR Bridge
 *
 * Receives QR URL payloads and immediately generates QR PNG files
 * for frontend usage in this same for_integration project.
 *
 * Default port: 8080
 * Endpoints:
 * - GET  /health
 * - POST /create-qr
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const QRCode = require('qrcode');

const app = express();
const PORT = Number(process.env.QR_BRIDGE_PORT || 8080);
const FRONTEND_APP_URL = process.env.FRONTEND_APP_URL || 'http://localhost:3005';

const qrDir = path.join(__dirname, '..', 'public', 'qr-codes');

app.use(cors());
app.use(express.json({ limit: '2mb' }));

function ensureQrDir() {
  fs.mkdirSync(qrDir, { recursive: true });
}

function extractQrUrl(body) {
  return (
    body?.qrUrl ||
    body?.url ||
    body?.qrCodeUrl ||
    body?.qr_code_url ||
    body?.qrCode?.qrUrl ||
    null
  );
}

app.get('/health', (_req, res) => {
  ensureQrDir();
  res.json({
    success: true,
    service: 'qr-bridge',
    port: PORT,
    outputDir: qrDir,
    timestamp: new Date().toISOString()
  });
});

app.post('/create-qr', async (req, res) => {
  try {
    const body = req.body || {};
    const qrUrl = extractQrUrl(body);
    const batchId = String(body.batchId || body.batch || 'unknown-batch');

    if (!qrUrl) {
      return res.status(400).json({
        success: false,
        error: 'Missing qrUrl (or equivalent field) in request body'
      });
    }

    ensureQrDir();

    const safeBatch = batchId.replace(/[^a-zA-Z0-9-_]/g, '-');
    const filename = `qr-${safeBatch}-${Date.now()}.png`;
    const absolutePath = path.join(qrDir, filename);
    const publicPath = `/qr-codes/${filename}`;
    const publicUrl = `${FRONTEND_APP_URL}${publicPath}`;

    await QRCode.toFile(absolutePath, qrUrl, {
      type: 'png',
      width: 420,
      margin: 2,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    });

    console.log('\n🎯 QR PNG GENERATED');
    console.log('─────────────────────────────────────────────────────────────');
    console.log(`   Source QR URL: ${qrUrl}`);
    console.log(`   Batch ID: ${batchId}`);
    console.log(`   File: ${absolutePath}`);
    console.log(`   Public Path: ${publicPath}`);
    console.log('─────────────────────────────────────────────────────────────');

    return res.json({
      success: true,
      qrUrl,
      batchId,
      qrImagePath: publicPath,
      qrImageUrl: publicUrl,
      absolutePath,
      message: 'QR PNG created successfully'
    });
  } catch (error) {
    console.error('❌ QR Bridge error:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  ensureQrDir();
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║                     🔲 QR BRIDGE STARTED                    ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');
  console.log(`   🌐 Server: http://localhost:${PORT}`);
  console.log('   📍 Endpoints:');
  console.log('      - GET  /health');
  console.log('      - POST /create-qr');
  console.log(`   📂 Output Folder: ${qrDir}`);
  console.log('   ⏳ Waiting for QR URL payloads...\n');
});
