exports.handler = function(event, context, callback) {
    // your server-side functionality
    callback(null,
             {body:JSON.stringify(process.env),
              statusCode:200,
             });
}
