exports.handler = function(event, context, callback) {
    // your server-side functionality
    var apiInfo = {}
    ['API_KEY','CLIENT_ID','secret'].forEach(
        (k)=>apiInfo[k]=process.env[k]
    );
    callback(null,
             {body:JSON.stringify(apiInfo),
              statusCode:200,
             });
}
