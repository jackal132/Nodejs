var fs = require('fs');

/*
console.log('A');
var result = fs.readFileSync('sync/sample.txt','utf8');
console.log(result);
console.log('C');
*/

console.log('A');
fs.readFile('sync/sample.txt','utf8', function(err, result){
    console.log(result);
});
console.log('C');