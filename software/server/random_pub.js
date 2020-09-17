const fs = require('fs')
const terminalImage = require('terminal-image');

const https = require('https');
var convert = require('xml-js');
var colors = require('colors');


const { createCanvas, loadImage, Image } = require('canvas')
const canvas = createCanvas(255, 255)
const ctx = canvas.getContext('2d')
 
// Write "Awesome!"
ctx.font = '30px Impact'
ctx.fillText('15.09.1982 Postimees\nSÄUTSUMASIN', 50, 100,255)
 
// Draw line under text
var text = ctx.measureText('15.09.1982 Postimees\nSÄUTSUMASIN')
ctx.strokeStyle = 'rgba(0,0,0,0.5)'
ctx.beginPath()
ctx.lineTo(50, 102)
ctx.lineTo(50 + text.width, 102)
ctx.stroke()
 
// // Draw cat with lime helmet
// loadImage('postimees255.jpg').then((image) => {
//   ctx.drawImage(image, 50, 0, 70, 70)
 
//  // console.log('<img src="' + canvas.toDataURL() + '" />')

// const buffer = canvas.toBuffer('image/png')
// fs.writeFileSync('./test6.png', buffer)
// })

/////////////////////////////////////////////////////////////////////////////////////////////////

// Possible dates



var dir = "data/publications_lists";

var pubDates = {};
var pubTitles = {};

fs.readdir(dir, (err, files) => {
    if (err) {
        throw err;
    }

    // files object contains all files names
    // log them on console
    files.forEach(file => {
        console.log("Reading file: " + file);
       
        var id = file.replace(".json","");
		var rawdata = fs.readFileSync(dir + "/"+file);
		var json = JSON.parse(rawdata);
		pubTitles[id] = json.title;
		
		for (var i = 0; i < json.dates.length; i++) {
			if(json.dates[i].length == 8){
				if(!pubDates[json.dates[i]]){
					pubDates[json.dates[i]] = [];
				}
				pubDates[json.dates[i]].push(id);
			} else {
				console.log("Wrong length for date" + json.dates[i]);
			}
			
		}



        
    });
});

function randomIntInc(low, high) {
  return Math.floor(Math.random() * (high - low + 1) + low)
}


var randomPublications = [];

function getRandomPublication(){

	var count = 0;
    for (var key in pubDates){
    	if (Math.random() < 1/++count){
        	random_publication_date = key;
         	random_publications = pubDates[key];
        }
    }

	var random_publication = randomIntInc(0,pubDates[random_publication_date].length-1);
	var random_publication_id = pubDates[random_publication_date][random_publication]	 + random_publication_date;

	console.log("Try random date: " + random_publication_date + " " + random_publication_id );

	var url = "https://dea.digar.ee/cgi-bin/dea?a=d&d="+ random_publication_id + "&st=1&f=XML";
	const request = https.get(url, function(res) {

		var body = '';
		res.on('data', function(chunk) {
			body += chunk;
		});
		res.on('end', function() {
			var json = convert.xml2js(body, {compact: true, spaces: 4});
			
			if(json.VeridianXMLResponse){

				if(json.VeridianXMLResponse.Error){
					if(json.VeridianXMLResponse.Error._text.indexOf("Invalid value") > -1){
						console.log("DATA: Publication does not exists!".red);
					} else if(json.VeridianXMLResponse.Error._text.indexOf("Pead olema sisse logitud.") > -1){
						console.log("DATA: Publication restricted!".red);
					} else {
						console.log(body);
						console.log("ERROR: Some other VeridianXMLResponse error.".red);
						process.exit();
					}
					
				} else if(json.VeridianXMLResponse.DocumentResponse){

					console.log("DATA: Publication found!".green);

					var out = {};
					
					if(json.VeridianXMLResponse.DocumentResponse.Document.DocumentContent.ArrayOfLogicalSection){


						var sections = json.VeridianXMLResponse.DocumentResponse.Document.DocumentContent.ArrayOfLogicalSection;
						console.log("Sections found!");
						// console.log(sections);
						
					    out.allSections = []; 
					    for (var key in sections.LogicalSection){
							var o = {};
							o.id =sections.LogicalSection[key].LogicalSectionMetadata.LogicalSectionID._text
					    	 out.allSections.push(o);
					    	//console.log(sections.LogicalSection[key].LogicalSectionMetadata);
					    }
					    // console.log(out);
					    

					} else if(json.VeridianXMLResponse.DocumentResponse.Document.DocumentContent.ArrayOfPage){

						console.log("Pages found!");
					    out.allPages = []; 

						var pages = json.VeridianXMLResponse.DocumentResponse.Document.DocumentContent.ArrayOfPage;
						// console.log(pages.Page);
					    for (var key in pages.Page){
					    	var o = {};
					    	o.id = pages.Page[key].PageMetadata.PageID._text;
					    	o.h = pages.Page[key].PageMetadata.PageImageHeight._text;
					    	o.w = pages.Page[key].PageMetadata.PageImageWidth._text;
					    	o.ocr = pages.Page[key].PageMetadata.PageOCRAccuracy._text;
					    	o.title = pages.Page[key].PageMetadata.PageTitle._text;
					    	out.allPages.push(o);
					    	
					    }

					}

					console.log(out);
					 generateImage(out);



				} else {
					console.log(body);
					console.log("ERROR: Some other error.".red);
					process.exit();
				}

			} else {
				console.log(body);
				console.log("ERROR: VeridianXMLResponse not found".red);
				process.exit();
			}

			// downloadNextPublication();
		});
	  
	});





}

////////////////////

setTimeout(function(){
	for (var i = 0; i < 3; i++) {
		getRandomPublication();
	}
},5000)

////////////////////

var imageGlobals = {};


function imageFailed(){
	console.log("Image download failed");	
}

function processImage(){
	console.log(imageGlobals);

	var img = new Image;
	img.src = imageGlobals.base64;
	ctx.drawImage(img, 0, 40);

	const buffer = canvas.toBuffer('image/png')
	fs.writeFileSync('./toprinter9.png', buffer);


(async () => {
	console.log(await terminalImage.buffer(buffer, {width: '50%', height: '50%'}));
})();

	//var imageGlobals = {};
}





function getDigarImage(id){

	imageGlobals.url = "https://dea.digar.ee/cgi-bin/dea?a=is&oid=" + id + "&type=blockimage&area=4&width=255";

	var https = require('https');
	var imagesize = require('imagesize');

	console.log("[IMAGE] Getting image dimensions " + imageGlobals.url);
	var request = https.get(imageGlobals.url, function (response) {
	  imagesize(response, function (err, result) {
	    if (!err) {
	    	
	    	imageGlobals.size = result;

	    	console.log("[IMAGE] Dimensions ");
	    	console.log(imageGlobals.size);
    	

			var request = require('request').defaults({ encoding: null });

			console.log("[IMAGE] Downloading image " + imageGlobals.url);


			request.get(imageGlobals.url, function (error, response, body) {
			    if (!error && response.statusCode == 200) {
			        data = "data:" + response.headers["content-type"] + ";base64," + Buffer.from(body).toString('base64');
			        imageGlobals.base64 = data;
			    	processImage(); // {type, width, height}

			    } else {
			    	imageFailed();
			    }
			});


	    	
	  	} else {
	  		imageFailed();
	  	}


	  });
	});


} // getImage

getDigarImage("postimeesew18870808.1.4");



