// Minimal Node.js script to test Rarible API connectivity
const https = require('https');

const options = {
  hostname: 'api.rarible.com',
  path: '/v0.1/items/byCollection?collection=ETHEREUM:0x295a6a847e3715f224826aa88156f356ac523eef&size=1',
  method: 'GET',
  headers: {
    'Accept': 'application/json',
    'X-API-KEY': process.env.RARIBLE_API_KEY || 'afdf41ce-b697-447c-b5bf-f9340315e7f0',
    'Referer': 'http://localhost:3000',
  },
};

console.log('Testing Rarible API connectivity...');

const req = https.request(options, (res) => {
  console.log('Status Code:', res.statusCode);
  res.on('data', (d) => {
    process.stdout.write(d);
  });
});

req.on('error', (e) => {
  console.error('Error:', e);
});

req.end();
