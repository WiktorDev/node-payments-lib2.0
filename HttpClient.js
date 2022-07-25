const axios = require('axios')

class HttpClient{
    async doRequest(url, data=[], method='GET', header, auth=null){
        method = method.toUpperCase();

        let config = {
            method: method,
            url: url,
            headers: {
                'User-Agent': 'node-payments-lib/2.0'
            },
            data: data,
            maxRedirects: 0
        }
        if(auth){
            config.auth = {
                username: auth[0],
                password: auth[1]
            }
        }
        if(header){
            Object.assign(config.headers, header)
        }

        try {
            let response = await axios(config);
            return response.data
        } catch (error) {
            return error.response.data
        }
    }
}

module.exports = { HttpClient }