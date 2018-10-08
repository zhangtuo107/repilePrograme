var http = require('http');
var fs = require('fs');
var cheerio = require('cheerio');
var request = require('request');
var i = 0;
var url = 'http://www.ss.pku.edu.cn/index.php/newscenter/news/2391';
function startRequest(x){
    http.get(x, function(res){  
        var html = '';
        var titles = [];
        res.setEncoding('utf-8');
        res.on('data', function(chunk){
            html += chunk;
        });
        res.on('end', function(){
            var $ = cheerio.load(html);
            var time = $('.article-info a:first-child').next().text().trim();
            var news_item = {
                title :  $('div.article-title a').text().trim(),
                Time : time,
                link : "http://www.ss.pku.edu.cn" + $("div.article-title a").attr('href'),
                author : $('[title=供稿]').text().trim(),
                i : i++
            };
            console.log(news_item);
            var news_title = $('div.article-title a').text().trim();
            savedContent($, news_title);
            savedImg($, news_title);
            var nextLink = "http://www.ss.pku.edu.cn" + $("li.next a").attr('href');
            var str1 = nextLink.split('-');
            var str = encodeURI(str1[0]);
            if(i < 500){
                fetchPage(str);
            }
        })
    }).on('error', function(err){
        console.log(err);
    })
};
function savedContent($, news_title){
    $('.article-content p').each(function(index, item){
        var x = $(this).text();
        var y = x.substring(0, 2).trim();
        if(y == ''){
            x += '\n';
            fs.appendFile('./data/' + news_title + '.txt', x , 'utf-8', function(err){
                if(err){
                    console.log(err);
                }
            })
        }
    })
};
function savedImg($, news_title){
    $('.article-content img').each(function(index, item){
        var img_title = $(this).parent().next().text().trim();
        if(img_title.length > 35 || img_title == ''){
            img_title = 'Null';
        };
        var img_fileName = img_title + '.jpg';
        var img_src = 'http://www.ss.pku.edu.cn' + $(this).attr('src');
        request.head(img_src, function(err, res, body){
            if(err){
                console.log(err);
            }
        });
        request(img_src).pipe(fs.createWriteStream('./image/'+news_title + '---' + img_fileName))
    })
};
startRequest(url);