var request = require('request');
var fs = require('fs');

/*
* url �����ļ���ַ
* filename �ļ���
* callback �ص�����
*/
function downloadFile(uri,filename,callback){
    var stream = fs.createWriteStream(filename);
    request(uri).pipe(stream).on('close', callback); 
}

// var fileUrl  = 'http://image.tianjimedia.com/uploadImages/2015/129/56/J63MI042Z4P8.jpg';
// var filename = 'beauty.jpg';
// downloadFile(fileUrl,filename,function(){
//     console.log(filename+'�������');
// });