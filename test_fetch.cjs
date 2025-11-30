
const https = require('https');

const url = 'https://test.nicehairvietnam.com/api/list-product-by-category/samsung';

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.data) {
                console.log(json.data.map(item => item.code).join('\n'));
            }
        } catch (e) {
            console.error(e);
        }
    });
}).on('error', (err) => {
    console.error(err);
});
