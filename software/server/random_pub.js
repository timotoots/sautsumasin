
// Create random article image

const fs = require('fs')
const terminalImage = require('terminal-image');

const https = require('https');
var convert = require('xml-js');
var colors = require('colors');


const { createCanvas, loadImage, Image } = require('canvas')
const canvas = createCanvas(255, 255)
const ctx = canvas.getContext('2d')
 

 

// // Draw cat with lime helmet
// loadImage('postimees255.jpg').then((image) => {
//   ctx.drawImage(image, 50, 0, 70, 70)
 
//  // console.log('<img src="' + canvas.toDataURL() + '" />')

// const buffer = canvas.toBuffer('image/png')
// fs.writeFileSync('./test6.png', buffer)
// })

/////////////////////////////////////////////////////////////////////////////////////////////////

// Possible dates

var imageGlobals = {};

imageGlobals.count = 0;
imageGlobals.sectionsCount = 0;

imageGlobals.totalHeight = 0;

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

	imageGlobals.file = "data/printouts/" +  random_publication_date + "_"+ pubDates[random_publication_date][random_publication]	;

	imageGlobals.date = pubDates[random_publication_date][random_publication];

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
					    imageGlobals.allSections = out.allSections;
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
					    imageGlobals.pages = out.allPages;

					}

					console.log(imageGlobals);

					addNextImage();



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
		getRandomPublication();
},3000)

////////////////////



function imageFailed(){
	console.log("Image download failed");	
}

function processImage(){
	console.log(imageGlobals);
	console.log("Writing to image: " +imageGlobals.file);

	var img = new Image;
	img.src = imageGlobals.base64;
	ctx.drawImage(img, 0, 70);

	imageGlobals.sectionsCount++;

	const buffer = canvas.toBuffer('image/png')
	fs.writeFileSync(imageGlobals.file + ".png", buffer);

	// printTest(imageGlobals.file + ".png");


(async () => {
	console.log(await terminalImage.buffer(buffer, {width: '50%', height: '50%'}));
})();

	//var imageGlobals = {};
}


function addNextImage(){

	if(imageGlobals.count==0){
		// add text to image
		console.log("Add text to canvas");
		// Draw line under text
		var text = ctx.measureText('SÄUTSUMASIN')

		// Write "Awesome!"
		ctx.font = '15px Impact'
		//ctx.fillText('SÄUTSUMASIN', 0, 10,255)

		// ctx.strokeStyle = 'rgba(0,0,0,0.5)'
		// ctx.beginPath()
		// ctx.lineTo(50, 102)
		// ctx.lineTo(50 + text.width, 102)
		// ctx.stroke()
 

		imageGlobals.count++;
		addNextImage();

	} else {

		if(imageGlobals.totalHeight < 500){

			if(imageGlobals.allSections){

				// imageGlobals.sectionsCount = imageGlobals.allSections.length-2;

				imageGlobals.sectionsCount = 3;

				var s = imageGlobals.allSections[imageGlobals.sectionsCount];
				imageGlobals.url = "https://dea.digar.ee/cgi-bin/dea?a=is&oid="+ s.id +"&type=blockimage&area=1&width=255"
				imageGlobals.sectionsCount++;
				addDigarImage();

			} else if(imageGlobals.pages){
				var p = imageGlobals.pages[0];

				imageGlobals.url = "https://dea.digar.ee/cgi-bin/dea?a=is&oid="+ p.id +"&type=blockimage&area=1&width=255"
				addDigarImage();
			}
		} else {
			console.log("Canvas full");
		}

		

	}

	



}


function addDigarImage(){


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

// getDigarImage("postimeesew18870808.1.4");


//////////////////////

function printTest(file){


	const path = require('path');
	const escpos = require('escpos');
	escpos.USB = require('escpos-usb');


	const device  = new escpos.USB(0x067b,0x2305);
	const printer = new escpos.Printer(device);

	const tux = path.join(file);
	escpos.Image.load(tux, function(image){

	  device.open(function(){

	    printer.align('ct')
	           .text('SAUTSUMASIN\n')
	           .text(imageGlobals.date + '\n')
	           .image(image, 's8')
	           .then(() => { 
	           	printer.cut().close(); 
	              
	           });

	    // OR non-async .raster(image, "mode") : printer.text("text").raster(image).cut().close();

	  });

	});
}
