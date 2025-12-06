const https = require('https');
const http = require('http');

/**
 * Trigger n8n webhook when a new user signs up
 * @param {Object} userData - User data to send to n8n
 */
const triggerN8nWebhook = async (userData) => {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.log('N8N_WEBHOOK_URL not configured. Skipping webhook trigger.');
    return;
  }

  try {
    const url = new URL(webhookUrl);
    const isHttps = url.protocol === 'https:';
    const httpModule = isHttps ? https : http;
    
    const postData = JSON.stringify({
      event: 'user_signup',
      timestamp: new Date().toISOString(),
      user: {
        name: userData.name,
        email: userData.email,
        createdAt: userData.createdAt
      }
    });

    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    return new Promise((resolve, reject) => {
      const req = httpModule.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log('n8n webhook triggered successfully');
            resolve(data);
          } else {
            console.error(`n8n webhook failed with status ${res.statusCode}`);
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        });
      });

      req.on('error', (error) => {
        console.error('Error triggering n8n webhook:', error.message);
        reject(error);
      });

      req.write(postData);
      req.end();
    });
  } catch (error) {
    console.error('Error in n8n webhook trigger:', error.message);
    // Don't throw error - webhook failure shouldn't break signup
  }
};

module.exports = { triggerN8nWebhook };

