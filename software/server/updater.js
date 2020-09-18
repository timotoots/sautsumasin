

const https = require('https');
const fs = require('fs');
var moment = require('moment');
var convert = require('xml-js');
var colors = require('colors');
var currentDate = new Date();


var publications = {};
var publicationList = ["postimeesew","eestipaevaleht"];






/*
publications.eestipaevaleht = {"year_start":"1995", "year_end":currentDate.getFullYear().toString()};
publications.postimeesew = {"year_start":"1886", "year_end":"1944"};

*/

//publications.otepaateataja = {"year_start":"2009", "year_end":currentDate.getFullYear().toString()};

/*

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
*/


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

// downloadNextPublication();

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



//////////////////////////////////////////////////////////////////////////////////////////////

getPublicationList("postimeesew");
getPublicationList("eestipaevaleht");
getPublicationList("otepaateataja");
getPublicationList("parnupostimees");
getPublicationList("otepaateatajaew");
getPublicationList("aadressleht");
getPublicationList("eluvoruvalgapetseri");
getPublicationList("parnumaateataja");
getPublicationList("sonumilehtsl");
getPublicationList("aripaev");
getPublicationList("revelskieizvestija");
getPublicationList("postimees");
getPublicationList("olewik");
getPublicationList("eestiekspress");
getPublicationList("maaleht");
getPublicationList("opetajatelehtew");
getPublicationList("opetajateleht");



function getPublicationList(id){

	console.log("------------------------------------------------");
	
	fs.exists('data/publications_lists/'+id+'.json', function(exists) {

	  if (exists) { 
	    console.log("Publication List already exists: " +id);
	  }  else {

	  		var out = {"title":"","dates":[]};

			console.log("Downloading " + id);
			var url = "https://dea.digar.ee/cgi-bin/dea?a=cl&cl=CL1&sp="+ id +"&f=XML"
			var filename = "data/publications_lists/"+ id + ".json";

			//const file = fs.createWriteStream("data/publications_lists/"+ id + "/"+ date + ".xml");
			const request = https.get(url, function(res) {

				//res.pipe(file);

				var body = '';
				res.on('data', function(chunk) {
					body += chunk;
				});
				res.on('end', function() {
					var json = convert.xml2js(body, {compact: true, spaces: 4});
					console.log(json.VeridianXMLResponse.DocumentsResponse.ArrayOfDocument[0]);
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
							
						} else if(json.VeridianXMLResponse.DocumentsResponse){
							console.log("DATA: Publication List found!".green);


							for (const key in json.VeridianXMLResponse.DocumentsResponse.ArrayOfDocument.Document) {
								
								out.title = json.VeridianXMLResponse.DocumentsResponse.ArrayOfDocument.Document[key].DocumentMetadata.DocumentTitle._text

								var doc_id = json.VeridianXMLResponse.DocumentsResponse.ArrayOfDocument.Document[key].DocumentMetadata.DocumentID._text;
								var date = doc_id.replace(id,"");
								out.dates.push(date);

							}
							console.log("Writing " + out.dates.length + " items to "+ id+", title:" + out.title);
							out = JSON.stringify(out, null, 4);
							fs.writeFile(filename, out, (err) => {
							    if (err) {
							        throw err;
							    }
							    console.log("JSON data is saved.");
							});
						    // console.log(out);


						} else {
						//	console.log(body);
							console.log("ERROR: Some other error.".red);
							process.exit();
						}

					} else {
						//console.log(body);
						console.log("ERROR: VeridianXMLResponse not found".red);
						process.exit();
					}

					//downloadNextPublication();
				});
			  
			});


	  } // not exists
	}); 



}


//////////////////////////////////////////////////////////////////////////////////////////////


function getPublicationEditions(id,date){

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


