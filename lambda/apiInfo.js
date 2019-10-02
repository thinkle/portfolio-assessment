exports.handler = function(event, context, callback) {
    // your server-side functionality
    var apiInfo = {}
    var keys = ['API_KEY','CLIENT_ID','secret']
    keys.forEach(
        (k)=>apiInfo[k]=process.env[k]
    );
    callback(null,
             {body:JSON.stringify(apiInfo),
              statusCode:200,
             });
}
