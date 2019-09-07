

exports.handler = function(event, context, callback) {
    // your server-side functionality
    callback(null,
             {body:`The secret is ${process.env.TESTKEY}`,
              statusCode:200,
             });
}
