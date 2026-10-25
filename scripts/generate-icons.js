import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createCrcTable() {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    table[n] = c;
  }
  return table;
}

const crcTable = createCrcTable();

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(8 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  const typeAndData = buf.subarray(4, 8 + len);
  const crc = crc32(typeAndData);
  buf.writeUInt32BE(crc, 8 + len);
  return buf;
}

function createPng(size) {
  const width = size;
  const height = size;

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8 bits per channel
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0; // deflate
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // no interlace

  // Raw image data with row filter 0
  const rowBytes = width * 4;
  const rawData = Buffer.alloc((1 + rowBytes) * height);

  const cx = width / 2;
  const cy = height / 2;
  const r = size * 0.44;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (1 + rowBytes);
    rawData[rowOffset] = 0; // filter type 0: None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = (x - cx) / r;
      const dy = (y - cy) / r;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Shield-like shape formula:
      // Normalized coords from -1 to 1:
      const nx = (x - cx) / (width * 0.42);
      const ny = (y - (cy - size * 0.05)) / (height * 0.45);
      
      const inShield = (
        ny >= -0.8 &&
        ny <= (1.1 - Math.abs(nx) * 0.9) &&
        Math.abs(nx) <= 0.85
      );

      const inInnerShield = (
        ny >= -0.65 &&
        ny <= (0.9 - Math.abs(nx) * 0.85) &&
        Math.abs(nx) <= 0.70
      );

      // Radar / Eye center
      const inEye = (dist < 0.28);

      if (inShield) {
        if (inEye) {
          // Emerald glowing scanner node
          rawData[pxOffset] = 16;     // R
          rawData[pxOffset + 1] = 185; // G
          rawData[pxOffset + 2] = 129; // B
          rawData[pxOffset + 3] = 255; // A
        } else if (inInnerShield) {
          // Deep Indigo Shield interior
          rawData[pxOffset] = 67;      // R: #4338ca
          rawData[pxOffset + 1] = 56;  // G
          rawData[pxOffset + 2] = 202; // B
          rawData[pxOffset + 3] = 255;
        } else {
          // Bright indigo border
          rawData[pxOffset] = 99;      // R: #6366f1
          rawData[pxOffset + 1] = 102; // G
          rawData[pxOffset + 2] = 241; // B
          rawData[pxOffset + 3] = 255;
        }
      } else {
        // Transparent
        rawData[pxOffset] = 0;
        rawData[pxOffset + 1] = 0;
        rawData[pxOffset + 2] = 0;
        rawData[pxOffset + 3] = 0;
      }
    }
  }

  const compressed = zlib.deflateSync(rawData);

  const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([pngSignature, ihdrChunk, idatChunk, iendChunk]);
}

const iconsDir = path.resolve('public/icons');
fs.mkdirSync(iconsDir, { recursive: true });

for (const size of [16, 32, 48, 128]) {
  const buf = createPng(size);
  fs.writeFileSync(path.join(iconsDir, `icon-${size}.png`), buf);
  console.log(`Generated icon-${size}.png (${buf.length} bytes)`);
}
