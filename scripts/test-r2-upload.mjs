/**
 * Test R2 upload directly.
 * Run: node --env-file=.env scripts/test-r2-upload.mjs
 */
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";

const region = process.env.S3_REGION || "auto";
const endpoint = process.env.S3_ENDPOINT;
const bucket = process.env.S3_BUCKET;
const accessKeyId = process.env.S3_ACCESS_KEY_ID;
const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;

console.log("R2 Config:");
console.log(`  Region: ${region}`);
console.log(`  Endpoint: ${endpoint}`);
console.log(`  Bucket: ${bucket}`);
console.log(`  AccessKey: ${accessKeyId?.slice(0, 8)}...`);
console.log("");

if (!endpoint || !bucket || !accessKeyId || !secretAccessKey) {
  console.error("❌ Missing S3/R2 env vars");
  process.exit(1);
}

const client = new S3Client({
  region,
  endpoint,
  credentials: { accessKeyId, secretAccessKey },
  forcePathStyle: true,
});

const testKey = "pdfs/test-upload.pdf";
const testData = Buffer.from("%PDF-1.4 test content for R2 upload verification");

console.log(`Uploading to ${bucket}/${testKey}...`);

try {
  await client.send(new PutObjectCommand({
    Bucket: bucket,
    Key: testKey,
    Body: testData,
    ContentType: "application/pdf",
  }));
  console.log("✅ Upload successful!");

  // Verify by reading back
  console.log("Verifying download...");
  const getResp = await client.send(new GetObjectCommand({
    Bucket: bucket,
    Key: testKey,
  }));

  const chunks = [];
  for await (const chunk of getResp.Body) {
    chunks.push(chunk);
  }
  const downloaded = Buffer.concat(chunks);
  console.log(`✅ Download successful! Size: ${downloaded.length} bytes`);
  console.log(`   Content matches: ${downloaded.toString() === testData.toString()}`);
} catch (err) {
  console.error("❌ Failed:", err.message);
  if (err.$metadata) console.error("   HTTP:", err.$metadata.httpStatusCode);
}
