const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const BASE_URL = 'https://us-central1-blackbox-cosc.cloudfunctions.net';
const endpoints = [
  { path: '/data', method: 'POST' },
  { path: '/fizzbuzz', method: 'POST' },
  { path: '/zap', method: 'POST' },
  { path: '/alpha', method: 'POST' },
  { path: '/glitch', method: 'POST' },
  { path: '/time', method: 'GET' },
];

const testInputs = [
  'example',
  '12345',
  'abc123',
  '',
  '!@#$%',
  'dGVzdA==', // 'test' in Base64
  'hello world',
  'true',
  'false',
  '{"foo":1}',
  '你好',
  'é',
  'a',
  'ab',
  'abc',
  '0',
  '-15',
  '1000000',
  // Additional 7 test cases:
  'cat',        // string
  'OpenAI',     // string
  'sunshine',   // string
  '42',         // number (string)
  '-999',       // number (string)
  '314159',     // number (string)
  'user2023',   // alphanumeric
];

async function testEndpoint(endpoint, input) {
  const url = BASE_URL + endpoint.path;
  let options = {
    method: endpoint.method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (endpoint.method === 'POST') {
    options.body = JSON.stringify({ data: input });
  }
  if (endpoint.method === 'GET') {
    // /time does not use input
    return fetch(url, options)
      .then(res => res.json())
      .then(json => ({ endpoint: endpoint.path, input: null, output: json }))
      .catch(e => ({ endpoint: endpoint.path, input: null, error: e.message }));
  }
  return fetch(url, options)
    .then(res => res.json())
    .then(json => ({ endpoint: endpoint.path, input, output: json }))
    .catch(e => ({ endpoint: endpoint.path, input, error: e.message }));
}

async function runTests() {
  for (const endpoint of endpoints) {
    if (endpoint.method === 'GET') {
      const result = await testEndpoint(endpoint, null);
      console.log(`\nEndpoint: ${endpoint.path} (GET)`);
      console.log('Output:', result.output || result.error);
      continue;
    }
    console.log(`\nEndpoint: ${endpoint.path} (POST)`);
    for (const input of testInputs) {
      const result = await testEndpoint(endpoint, input);
      console.log(`Input: ${JSON.stringify(input)} => Output:`, result.output || result.error);
    }
  }
}

runTests();