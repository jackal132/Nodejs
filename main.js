var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');

function templateHTML(title, list, body){
    return `
    <!doctype html>
    <html>
    <head>
        <title>${title}</title>
        <meta charset="utf-8">
    </head>
    <body>
        <h1><a href="/">WEB</a></h1>
        ${list}
        <a href="/create">create</a>
        ${body}
    </body>
    </html>`;
}

function templateList(filelist){
    var list = '<ul>';
    var i = 0;
    while(i < filelist.length){
        list = list + `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`;
        i = i + 1;
    }
    
    list = list + '</ul>';
    return list;
}

var app = http.createServer(function(request, response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;
    
    if(pathname === '/'){

        if(queryData.id === undefined){

            fs.readdir('./data', function(error, filelist){
                var title = 'Welcome';
                var description = 'Hello, Node.js';
                var list = templateList(filelist);
                var template = templateHTML(title, list, `<h2>${title}</h2>${description}`);
        
                response.writeHead(200);
                response.end(template);
            });

        } else {

            fs.readdir('./data', function(error, filelist){
                
                fs.readFile(`data/${queryData.id}`,'utf8', function(err,description){
                    var title = queryData.id;
                    var list = templateList(filelist);
                    var template = templateHTML(title, list, `<h2>${title}</h2>${description}`);
            
                    response.writeHead(200);
                    response.end(template);
                });
            });
        }

    } else if(pathname === '/create') {

        fs.readdir('./data', function(error, filelist){
            var title = 'WEB - create';
            var list = templateList(filelist);
            var template = templateHTML(title, list, `
            <form action="http://localhost:3000/create_process" method="post">
                <p><input type="text" name="title" placeholder="title"></p>
                <p><textarea name="description" placeholder="description"></textarea></p>
                <p><input type="submit"></p>
            </form>
            `);
    
            response.writeHead(200);
            response.end(template);
        });

    } else if(pathname === '/create_process') {

        var body = '';
        request.on('data', function(data){
            body = body + data;
            // Too much POST data, kill the connection! 데이터가 많은경우 접속을 끊음
            // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
            /*
            if (body.length > 1e6)
                request.connection.destroy();
            */    
        });

        request.on('end', function(){
            var post = qs.parse(body);
            var title = post.title;
            var description = post.description;
            
            fs.writeFile(`data/${title}`, description, 'utf8', function(err){
                // 200 성공 301 url변경 302 리다이렉트
                response.writeHead(302, {Location:`/?id=${title}`});
                response.end();
            });
        });

    } else {

        response.writeHead(404);
        response.end('Not Found');

    }

});
app.listen(3000);