import { readFile, mkdir, writeFile, rename } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const MAX_BYTES = 1_048_576;

function readDimensions(
  bytes: Uint8Array,
  isPng: boolean,
): { width: number; height: number } | undefined {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

  if (isPng) {
    // The IHDR chunk follows the 8-byte signature and its 4-byte length
    // and 4-byte type, so width and height sit at offsets 16 and 20.
    if (bytes.length < 24) return undefined;
    return { width: view.getUint32(16), height: view.getUint32(20) };
  }

  // JPEG: segments follow the SOI marker at offset 0. Walk them until a
  // Start Of Frame segment turns up and read its geometry.
  let offset = 2;
  while (offset + 9 < bytes.length) {
    if (bytes[offset] !== 0xff) return undefined;
    const segmentStart = offset;
    let cursor = offset + 1;
    while (cursor < bytes.length && bytes[cursor] === 0xff) cursor += 1;
    if (cursor + 2 >= bytes.length) return undefined;
    const marker = bytes[cursor];

    const isStartOfFrame =
      marker >= 0xc0 &&
      marker <= 0xcf &&
      marker !== 0xc4 &&
      marker !== 0xc8 &&
      marker !== 0xcc;
    if (isStartOfFrame) {
      return {
        height: view.getUint16(segmentStart + 5),
        width: view.getUint16(segmentStart + 7),
      };
    }

    // Standalone markers carry no length field or payload.
    const isStandalone =
      marker === 0xd8 || marker === 0xd9 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7);
    if (isStandalone) {
      offset = cursor + 1;
      continue;
    }

    const segmentLength = view.getUint16(cursor + 1);
    if (segmentLength < 2) return undefined;
    offset = cursor + 1 + segmentLength;
  }
  return undefined;
}

const sourcePath = fileURLToPath(new URL("./entry.png", import.meta.url));
const data = await readFile(sourcePath);

if (data.length === 0) {
  throw new Error("entry.png is empty");
}
if (data.length > MAX_BYTES) {
  throw new Error(`entry.png is ${data.length} bytes, over the ${MAX_BYTES} byte limit`);
}

const looksLikePng =
  data.length >= 8 &&
  data[0] === 0x89 &&
  data[1] === 0x50 &&
  data[2] === 0x4e &&
  data[3] === 0x47 &&
  data[4] === 0x0d &&
  data[5] === 0x0a &&
  data[6] === 0x1a &&
  data[7] === 0x0a;
const looksLikeJpeg = data.length >= 3 && data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff;

if (!looksLikePng && !looksLikeJpeg) {
  throw new Error("entry.png is neither a PNG nor a JPEG image");
}

const format = looksLikePng ? "PNG" : "JPEG";
const dimensions = readDimensions(data, looksLikePng);

const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
await mkdir(outputDir, { recursive: true });

const finalPath = join(outputDir, "entry.png");
const tempPath = join(outputDir, ".entry.png.tmp");
await writeFile(tempPath, data);
await rename(tempPath, finalPath);

if (dimensions) {
  console.log(
    `Wrote ${data.length} bytes to ${finalPath} (${format}, ${dimensions.width}x${dimensions.height})`,
  );
} else {
  console.log(`Wrote ${data.length} bytes to ${finalPath} (${format})`);
}
