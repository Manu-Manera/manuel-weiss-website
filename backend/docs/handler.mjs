import { DynamoDBClient, PutItemCommand, QueryCommand, DeleteItemCommand } from "@aws-sdk/client-dynamodb";
import { S3Client, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
const ddb = new DynamoDBClient({ region: process.env.AWS_REGION || "eu-central-1" });
const s3  = new S3Client({ region: process.env.AWS_REGION || "eu-central-1" });

function headers(origin){ return {
  "Access-Control-Allow-Origin": origin || process.env.ALLOWED_ORIGIN || "*",
  "Access-Control-Allow-Methods": "OPTIONS,GET,POST,DELETE",
  "Access-Control-Allow-Headers": "Content-Type,Authorization"
};}

export const handler = async (event) => {
  const origin = event.headers?.origin || event.headers?.Origin;
  const hdr = headers(origin);
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: hdr };

  try {
    const u = authUser(event);
    const route = event.resource || '';
    if (event.httpMethod === 'GET' && route.endsWith('/docs')) {
      const items = await listDocs(u.userId);
      return json(200, items, hdr);
    }
    if (event.httpMethod === 'POST' && route.endsWith('/docs')) {
      const b = JSON.parse(event.body||'{}');
      if (!b.key || !b.name) return json(400, {message:'key & name required'}, hdr);
      const id = `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
      await ddb.send(new PutItemCommand({
        TableName: process.env.TABLE,
        Item: {
          pk: { S: `user#${u.userId}` },
          sk: { S: `doc#${id}` },
          id: { S: id },
          key: { S: b.key },
          name: { S: b.name },
          type: { S: b.type || '' },
          size: { N: String(b.size || 0) },
          createdAt: { N: String(Date.now()) }
        }
      }));
      return json(201, { id, ...b }, hdr);
    }
    if (event.httpMethod === 'DELETE' && /\/docs\/[^/]+$/.test(route)) {
      const id = event.pathParameters?.id;
      if (!id) return json(400, {message:'id required'}, hdr);
      const items = await listDocs(u.userId);
      const doc = items.find(x=>x.id===id);
      if (!doc) return json(404, {message:'not found'}, hdr);
      await s3.send(new DeleteObjectCommand({ Bucket: process.env.BUCKET, Key: doc.key }));
      await ddb.send(new DeleteItemCommand({
        TableName: process.env.TABLE,
        Key: { pk: { S:`user#${u.userId}` }, sk: { S:`doc#${id}` } }
      }));
      return json(204, null, hdr);
    }
    if (event.httpMethod === 'GET' && route.endsWith('/download-url')) {
      const key = event.queryStringParameters?.key;
      if (!key || !key.startsWith(`uploads/${u.userId}/`)) return json(403, {message:'forbidden'}, hdr);
      const url = await getSignedUrl(s3, new GetObjectCommand({ Bucket: process.env.BUCKET, Key: key }), { expiresIn: 60 });
      return json(200, { url }, hdr);
    }
    return json(404, {message:'not found'}, hdr);
  } catch(e){ return json(401, {message:String(e)}, hdr); }
};

function authUser(event){
  const token = (event.headers?.authorization || event.headers?.Authorization || '').replace(/^Bearer\s+/,'');
  if (!token) throw new Error('unauthorized');
  const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString('utf8'));
  return { userId: payload.sub, email: payload.email };
}
async function listDocs(userId){
  const out = await ddb.send(new QueryCommand({
    TableName: process.env.TABLE,
    KeyConditionExpression: 'pk = :pk AND begins_with(sk, :p)',
    ExpressionAttributeValues: { ':pk':{S:`user#${userId}`}, ':p':{S:'doc#'} }
  }));
  return (out.Items||[]).map(i => ({
    id: i.id.S, key: i.key.S, name: i.name.S, type: i.type?.S||'', size: Number(i.size?.N||0), createdAt: Number(i.createdAt?.N||0)
  }));
}
function json(code, body, headers){ return { statusCode: code, headers, body: body===null? '': JSON.stringify(body) }; }
