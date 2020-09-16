

const https = require('https');
const fs = require('fs');
var moment = require('moment');
var convert = require('xml-js');
var colors = require('colors');

var currentDate = new Date();


var publications = {};
var publicationList = [];

/*
publications.eestipaevaleht = {"year_start":"1995", "year_end":currentDate.getFullYear().toString()};
publications.postimeesew = {"year_start":"1886", "year_end":"1944"};

*/

publications.otepaateataja = {"year_start":"2009", "year_end":currentDate.getFullYear().toString()};



for(var key in publications){

	publications[key].to_be_downloaded = [];
	publications[key].downloaded = [];
	publicationList.push(key);


	var a = moment(publications[key].year_start + "-01-01");
	var b = moment( publications[key].year_end + "-12-31");

	for (var m = moment(a); m.diff(b, 'days') <= 0; m.add(1, 'days')) {
		var date = m.format('YYYYMMDD')

		if (fs.existsSync("data/"+key+"/" + date + ".xml")) {
			publications[key].downloaded.push(date);
		} else {
			publications[key].to_be_downloaded.push(date);
		}
		
	}


}


var currentPublication = publicationList[0];

console.log(publications);


////////////////////////////////////////////////////////////////////////

// Create directories for publications

for(var key in publications){

	fs.mkdir("data/"+key,(err) => {
	    if (err) {
	        //throw err;
	    } else {
		    console.log("Directory "+ key +" is created.");
	    }
	});

}

////////////////////////////////////////////////////////////////////////


var limit = 0;

downloadNextPublication();

function downloadNextPublication(){

	if(limit>10000){
		console.log("Limit reached!");
		process.exit();
	} else {
		limit++;
	}

	var nextDate = publications[currentPublication].to_be_downloaded.shift();

	if(nextDate==false){
		currentPublication = publicationList.shift();
		if(currentPublication==false){
			console.log("All done!");
			process.exit();
		}
	}

	getPublication(currentPublication,nextDate);


}




//getPublication("postimeesew","18860101");

function getPublication(id,date){

	console.log("------------------------------------------------");
	console.log("Downloading " + id + date);

	var url = "https://dea.digar.ee/cgi-bin/dea?a=d&d="+ id + date + "&st=1&f=XML";
	const file = fs.createWriteStream("data/"+ id + "/"+ date + ".xml");
	const request = https.get(url, function(res) {

		res.pipe(file);

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

			downloadNextPublication();
		});
	  
	});



}




