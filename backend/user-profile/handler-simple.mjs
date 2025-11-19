export const handler = async (event) => {
  console.log('Event received:', JSON.stringify(event, null, 2));
  
  const origin = event.headers?.origin || event.headers?.Origin || '*';
  const method = event.httpMethod || event.requestContext?.http?.method || '';
  
  const hdr = {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "OPTIONS,GET,POST,PUT",
    "Access-Control-Allow-Headers": "Content-Type,Authorization"
  };
  
  if (method === 'OPTIONS' || method === 'options') {
    console.log('Returning OPTIONS response');
    return { 
      statusCode: 200, 
      headers: hdr, 
      body: '' 
    };
  }
  
  return {
    statusCode: 200,
    headers: hdr,
    body: JSON.stringify({ message: 'OK', method })
  };
};

