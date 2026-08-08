const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function calculateCRC32(buf) {
  let c;
  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) {
      c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
    }
    crcTable[n] = c;
  }
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ (-1)) >>> 0;
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const totalBuf = Buffer.concat([typeBuf, data]);
  const crc = calculateCRC32(totalBuf);

  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc, 0);

  return Buffer.concat([lenBuf, totalBuf, crcBuf]);
}

function createMedicalIconPNG(width, height) {
  const rawRows = [];
  const cx = width / 2;
  const cy = height / 2;
  const crossArmLength = width * 0.28;
  const crossThickness = width * 0.12;

  for (let y = 0; y < height; y++) {
    const row = [0]; // Filter 0
    for (let x = 0; x < width; x++) {
      const dx = x - cx;
      const dy = y - cy;

      let r = 15, g = 23, b = 42, a = 255; // #0F172A dark background

      const nx = Math.abs(dx) / (width * 0.46);
      const ny = Math.abs(dy) / (height * 0.46);
      const squircleVal = Math.pow(nx, 4) + Math.pow(ny, 4);

      if (squircleVal <= 1.0) {
        // Gradient #0EA5E9 to #0284C7
        const t = (x + y) / (width + height);
        r = Math.round(14 * (1 - t) + 2 * t);
        g = Math.round(165 * (1 - t) + 132 * t);
        b = Math.round(233 * (1 - t) + 199 * t);

        const inVerticalArm = Math.abs(dx) <= crossThickness / 2 && Math.abs(dy) <= crossArmLength;
        const inHorizontalArm = Math.abs(dy) <= crossThickness / 2 && Math.abs(dx) <= crossArmLength;

        if (inVerticalArm || inHorizontalArm) {
          r = 255; g = 255; b = 255; a = 255; // White cross
        }
      }

      row.push(r, g, b, a);
    }
    rawRows.push(Buffer.from(row));
  }

  const decompressed = Buffer.concat(rawRows);
  const compressed = zlib.deflateSync(decompressed);

  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 6;
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;

  return Buffer.concat([
    signature,
    makeChunk('IHDR', ihdrData),
    makeChunk('IDAT', compressed),
    makeChunk('IEND', Buffer.alloc(0))
  ]);
}

const publicDir = path.join(__dirname, 'public');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'logo192.png'), createMedicalIconPNG(192, 192));
fs.writeFileSync(path.join(publicDir, 'logo512.png'), createMedicalIconPNG(512, 512));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createMedicalIconPNG(180, 180));
fs.writeFileSync(path.join(publicDir, 'favicon.png'), createMedicalIconPNG(64, 64));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), createMedicalIconPNG(64, 64));

console.log('Successfully created all medical app PNG icons in public directory!');
