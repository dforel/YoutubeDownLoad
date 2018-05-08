var https = require('https');
var http = require('http');
var url = require('url');
var fs= require("fs") ;
var request = require('request');


var youtubeUrl = "https://www.youtube.com/watch?v=";
// var youtubeUrl = "http://wow.dforel.site/down/1.html";
// var str = "";
var autoVideo = null;


var videoMap = {
        "13" : ["3GP", "Low Quality - 176x144"],
		"17": ["3GP", "Medium Quality - 176x144"],
		"36": ["3GP", "High Quality - 320x240"],
		"5" : ["FLV", "Low Quality - 400x226"],
		"6" : ["FLV", "Medium Quality - 640x360"],
		"34": ["FLV", "Medium Quality - 640x360"],
		"35": ["FLV", "High Quality - 854x480"],
		"43": ["WEBM", "Low Quality - 640x360"],
		"44": ["WEBM", "Medium Quality - 854x480"],
		"45": ["WEBM", "High Quality - 1280x720"],
		"18": ["MP4", "Medium Quality - 480x360"],
		"22": ["MP4", "High Quality - 1280x720"],
		"37": ["MP4", "High Quality - 1920x1080"],
		"38": ["MP4", "High Quality - 4096x230"]
}



function spider(u,cb){
    https.get( url.parse(u), function(res){
        var d = ''
        res.on('data',function(chunk){
            d += chunk;
        })
        res.on('end',function(){ 
            cb(d);
        })
    });
};

// 2jSWMme12ik
var u = "";
var typeIndex = -1;
if( require.main === module ) {
    u = process.argv[2]
    
    // 第二个参数
    var n = parseInt(process.argv[3]);
    if (!isNaN(n))
    {
        typeIndex = n;
    } 
}; 
 

spider(youtubeUrl+u,function( data ){
　　//这个返回的是网页内 下载地址 的信息;
    // console.log( data ); 
    // 获取标题
    var regExpTitle = /\"title\":\"(.*?)\"/ 
    var titleData = regExpTitle.exec(data)
    titleData = (titleData[0].split("\":\"")[1])
    // 将空格替换为下划线 
    titleData = titleData.substr(0,titleData.length-1).replace(/\s/g, "_") 

    

    var regExp = /\"url_encoded_fmt_stream_map\":\"(.*?)\"/ 
    var res = regExp.exec(data) 
    var resData = res[0].split("\":\"")[1].split(",");
    
   // console.log( resData );
    var videoList = []; 
    for (var element of resData) {
	// console.log(element);
        element = element.replace(/\\u0026/g, "&")
        var arr = element.split("&")
        var video =new VideoObj();
        
        for (var e of arr) {
	   // console.log(e) 
	   if( /^sig/.test(e) ){
                video.sig = e.slice(4,e.length);
                 
            }
            if( /^url/.test(e) ){ 
                video.url = UrlDecode(e.slice(4,e.length));
            }
            if( /^itag/.test(e) ){
                video.itag = e.slice(5,e.length);
                video.type = videoMap[video.itag][0]
                video.quality = videoMap[video.itag][1]
            }
        }
	// console.log(video);
	//console.log(video)
        if(video.itag == "18" ){
	    console.log(video);
            autoVideo = video;
        }
        videoList.push(video);
    }

    var date = dateFtt("yyyyMMdd",  new Date());
     
    fs.exists("you2res/"+date,exists=>{
        if(!exists){
            fs.mkdir("you2res/"+date) 
        }
	fs.exists("you2res/"+date+"/"+titleData,isExists=>{
	    if(!isExists){
		fs.mkdir("you2res/"+date+"/"+titleData)
	    }
        })
        var downVideo = autoVideo;
        if(typeIndex!=-1){
            downVideo = videoList[typeIndex]
        }
	console.log(autoVideo);
	//console.log(videoList);
        downloadFile( downVideo.url , "./you2res/"+date+"/"+ titleData+"/"+downVideo.itag+"."+downVideo.type ,function(){
            console.log( titleData +'下载完毕');
        }); 
    });


    // console.log(videoList); 
});

// 录像对象
function VideoObj() { 

    // url地址
    this.url = "";

    // 
    this.sig = "";

    // 类型 --编号
    this.itag = "";

    // 质量
    this.type = "";

    // 类型
    this.quality = "";

    // 文件夹
    this.path = "";
}

function str2asc(str){ 
    return str.charCodeAt(0).toString(16); 
    } 
function asc2str(str){ 
    return String.fromCharCode(str); 
} 

function UrlDecode(str){ 
    var ret=""; 
    for(var i=0;i<str.length;i++){ 
        var chr = str.charAt(i); 
        if(chr == "+"){ 
            ret+=" "; 
        }else if(chr=="%"){ 
            var asc = str.substring(i+1,i+3); 
            if(parseInt("0x"+asc)>0x7f){ 
                ret+=asc2str(parseInt("0x"+asc+str.substring(i+4,i+6))); 
                i+=5; 
            }else{ 
                ret+=asc2str(parseInt("0x"+asc)); 
                i+=2; 
            } 
        }else{ 
            ret+= chr; 
        } 
    } 
    return ret; 
} 


/**************************************时间格式化处理************************************/
function dateFtt(fmt,date)   
{ //author: meizz   
  var o = {   
    "M+" : date.getMonth()+1,                 //月份   
    "d+" : date.getDate(),                    //日   
    "h+" : date.getHours(),                   //小时   
    "m+" : date.getMinutes(),                 //分   
    "s+" : date.getSeconds(),                 //秒   
    "q+" : Math.floor((date.getMonth()+3)/3), //季度   
    "S"  : date.getMilliseconds()             //毫秒   
  };   
  if(/(y+)/.test(fmt))   
    fmt=fmt.replace(RegExp.$1, (date.getFullYear()+"").substr(4 - RegExp.$1.length));   
  for(var k in o)   
    if(new RegExp("("+ k +")").test(fmt))   
  fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));   
  return fmt;   
} 


/*
* url 网络文件地址
* filename 文件名
* callback 回调函数
*/
function downloadFile(uri,filename,callback){
    var stream = fs.createWriteStream(filename);
    request(uri).pipe(stream).on('close', callback); 
}
