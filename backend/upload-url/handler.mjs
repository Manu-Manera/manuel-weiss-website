import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({ region: process.env.AWS_REGION || "eu-central-1" });
const MAX_SIZE = Number(process.env.MAX_UPLOAD_BYTES || 15 * 1024 * 1024);
const ALLOWED_TYPES = (process.env.ALLOWED_TYPES || 'application/pdf,image/jpeg,image/png').split(',');

function baseHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin || process.env.ALLOWED_ORIGIN || "*",
    "Access-Control-Allow-Methods": "OPTIONS,POST",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
  };
}

export const handler = async (event) => {
  const origin = event.headers?.origin || event.headers?.Origin;
  const headers = baseHeaders(origin);
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers };

  try {
    const user = authUser(event);
    const { filename, contentType, size } = JSON.parse(event.body || '{}');
    if (!filename || !contentType) return resp(400, { message:'filename & contentType required' }, headers);
    if (size && size > MAX_SIZE) return resp(413, { message:'file too large', sizeLimit: MAX_SIZE }, headers);
    if (!ALLOWED_TYPES.includes(contentType)) return resp(415, { message:'type not allowed', allowed: ALLOWED_TYPES }, headers);

    const safe = filename.replace(/[^a-zA-Z0-9_.-]/g, '_').slice(0,140);
    const key = `uploads/${user.userId}/${Date.now()}-${safe}`;

    const cmd = new PutObjectCommand({ Bucket: process.env.BUCKET, Key: key, ContentType: contentType });
    const url = await getSignedUrl(s3, cmd, { expiresIn: 90 });
    return resp(200, { url, key, sizeLimit: MAX_SIZE }, headers);
  } catch (e) {
    return resp(500, { message: String(e) }, headers);
  }
};

function authUser(event){
  const token = (event.headers?.authorization || event.headers?.Authorization || '').replace(/^Bearer\s+/,'');
  if (!token) throw new Error('unauthorized');
  const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString('utf8'));
  return { userId: payload.sub, email: payload.email };
}
function resp(code, body, headers){ return { statusCode: code, headers, body: JSON.stringify(body) }; }
