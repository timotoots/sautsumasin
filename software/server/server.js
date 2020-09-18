
// 'use strict';

const colors = require('colors');
const http = require('http');
const fs = require('fs');
const spawn = require( 'child_process' );
const { exec } = require("child_process");
const path = require('path');
const request = require('request');

console.log('///////////////////////////////////////////////'.blue);
console.log('SAUSTUMASIN START'.blue);
console.log('///////////////////////////////////////////////\n'.blue);



var secrets = JSON.parse(fs.readFileSync('secrets.json', 'utf8'));

var states = {
    "handle_trigger":false, 
    "print_button":false, 
    "game":"booted", 
    "inviter":true, 
    "readyForPrinting":false,
    "reelStopPlayed":[]
}

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

// GAME LOGIC

var waitingTimer;

function initGame(){

    console.log("[GAME] Init game".green);

    getNextPrintout();

    states.game = "stopped";
    states.inviter = true;
    states.game = "initialised";

    clearReelStopSounds();

    changeBacklight("title",100);
    changeBacklight("label",100);
    changeBacklight("print_button",1);
    changeBacklight("spiral","standby");

    releaseHandleLock();

}



function startGame(){





    if(states.game=="playing"){
        console.log("🍒 [GAME] Already active")
        return false;
    }

    console.log("\n\n\n🍒 [GAME] NEW GAME 🍒🍒🍒🍒🍒🍒🍒🍒🍒🍒🍒🍒🍒🍒🍒🍒🍒🍒🍒🍒🍒🍒🍒🍒🍒".red)

    stopSounds();

    clearTimeout(waitingTimer);

    states.inviter = false;
    states.readyForPrinting = false;

    changeBacklight("spiral","rolling");

    changeBacklight("print_button",1);

    getNextPrintout();   

    var timer = 0;

    console.log("[GAME] Start game for date " + states.currentPrintDate)

    clearReelStopSounds();

    console.log("[GAME] Spin reels".green)

    for (var i = 1; i <= 8; i++) {
        setTimeout(spinReel,i*100,i)
    }

    setTimeout(playSound,10,"reels");

    setTimeout(function(){ console.log("[GAME] Stop reels".green) },5000)

    timer += 3000;

    for (var i = 1; i <= 8; i++) {
        setTimeout(stopReel,i*1000+timer,i,parseInt(states.currentDisplayDate[i-1]));
    }

    timer += 8*1000 + 3000;

    setTimeout(function(){ 

        states.game = "waiting";
        console.log("[GAME] Print or pull handle? ".green)
      
        playSound("coins");

        changeBacklight("print_button",100);
        states.readyForPrinting = true;

        setTimeout(function(){
            if(states.game!="playing" && states.readyForPrinting==true){
                playSound("tryki");
            }
        },10000)
        ;
        releaseHandleLock();

        waitingTimer = setTimeout(function(){
                //initGame();
                changeBacklight("spiral","standby");
                states.inviter = true;

        },20000);
    
     },timer);


}

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

// Serial

var ports = [];

var SerialPort = require('serialport');
const Readline = SerialPort.parsers.Readline;

var num_ports = 4;

var parsers = [];

parsers[0] = new Readline({delimiter: '\n'});
parsers[0].on('data', function(data){
    globalSerialParser(trim(data),0);      
});

parsers[1] = new Readline({delimiter: '\n'});
parsers[1].on('data', function(data){
    globalSerialParser(trim(data),1);      
});

parsers[2] = new Readline({delimiter: '\n'});
parsers[2].on('data', function(data){
    globalSerialParser(trim(data),2);      
});

parsers[3] = new Readline({delimiter: '\n'});
parsers[3].on('data', function(data){
    globalSerialParser(trim(data),3);      
});

parsers[4] = new Readline({delimiter: '\n'});
parsers[4].on('data', function(data){
    globalSerialParser(trim(data),4);      
});

parsers[5] = new Readline({delimiter: '\n'});
parsers[5].on('data', function(data){
    globalSerialParser(trim(data),5);      
});

/////////////////////////////////////////////////

var portMapping = {};


function globalSerialParser(data, parser_id){

    if(data.substr(0,10)=="DEVICE_ID:"){

        var id = data.replace(/\D/g, "");

        if(id>10000 && id<10006){
            console.log("[SERIAL] New device id: " + parser_id + " to " + id);
            portMapping[id] = parser_id;
            ports[parser_id].deviceId = id;
        } else {
            console.log("[SERIAL] No device id at port: " + parser_id + " to " + id);
        }

    } else if(data.substr(0,12)=="STRIPE_STOP:"){

        //console.log("STRIPE_STOP:" + parseInt(data.substr(12)));
        playReelStopSound(parseInt(data.substr(12)))    

    } else {
       // console.log("[SERIAL " +  ports[parser_id].deviceId + "]: "+data);
    }

}

/////////////////////////////////////////////////


function sendToSerial(device_id, cmd, msg){



    msg = device_id + " " + cmd + " "+ msg;
    ports[portMapping[device_id]].port.write(msg + "\n");
    //console.log(msg);

}

/////////////////////////////////////////////////


for (var i = 0; i < num_ports; i++) {
    
    ports.push({});

    try{

        ports[i].opened = false;
        ports[i].device = "/dev/ttyUSB"+i;
        ports[i].port = new SerialPort(ports[i].device, {
          baudRate: 115200
        });

        ports[i].port.on('open', function(i){

            console.log("[SERIAL] " + this.path + " opened".green);
            var i = parseInt(this.path.replace('/dev/ttyUSB', ''));
            ports[i].opened = true;
            ports[i].deviceId = 10001+i;
            ports[i].port.pipe(parsers[i]);
            ports[i].port.write("10000\n");

        });

    } catch(e){
      console.log("No ESP32 connected to /dev/ttyUSB" + i);
      process.exit();
    }

}


function checkSerialPort(){

    const exec = require('child_process').exec;
    exec("ls /dev/ttyUSB0",{maxBuffer:200*1024*1000},function(error,stdout,stderr){ 
        setTimeout(checkSerialPort,5000);
        
        if(trim(stdout)=="/dev/ttyUSB0"){
            // console.log("USB device alive".green);
        } else {
            console.log("Arduino device not connected! Please call Timo!".red);
        }

    });


}

//checkSerialPort();

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

// Backlights



function changeBacklight(light_id,value){


    // spiral
    // { 1 - rainbow, 2- rainbowWithGlitter, 3- confetti, 4- sinelon, 5- juggle, 6- bpm };


    if(light_id=="title"){
        sendToSerial("10005", "501","1 " + value);
    } else if(light_id=="label"){
        sendToSerial("10005", "501","2 " + value);
    }else if(light_id=="print_button"){
        sendToSerial("10005", "501","3 " + value);
    } else if(light_id=="spiral" ){

        if(value=="rolling"){
            value = 5; // bpm
        } else if(value=="standby"){
            value = 1; // rainbow
        }

        sendToSerial("10005", "502",value);
    }


}

var lightBlinks = {};


function blinkLight(light_id, speed){

    if(!lightBlinks[light_id]){
        lightBlinks[light_id] = {};
    }

    lightBlinks[light_id].status = 1;
    lightBlinks[light_id].current_brightness = 0;
    lightBlinks[light_id].max_brightness = 200;
    lightBlinks[light_id].min_brightness = 10;

    lightBlinks[light_id].timer = setInterval(function(light_id){
        if(lightBlinks[light_id].current_brightness == lightBlinks[light_id].max_brightness){
            lightBlinks[light_id].current_brightness = lightBlinks[light_id].min_brightness
        } else {
            lightBlinks[light_id].current_brightness = lightBlinks[light_id].max_brightness
        }
        changeBacklight(light_id,lightBlinks[light_id].current_brightness);

    },speed,light_id);


}

function stopBlinkLight(light_id){

    if(lightBlinks[light_id].timer){
        clearInterval( lightBlinks[light_id].timer);
    }


}


////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

// Matrix

function spinReel(reel_id){

    var speed = "8";
    for (var i = 1; i <= 3; i++) {
        sendToSerial("1000"+i, "101", reel_id + " " + speed);
    }
}

///

function stopReel(reel_id, slot){

    var stripeId = parseInt(slot)+1;

    for (var i = 1; i <= 3; i++) {
        sendToSerial("1000"+i, "102", reel_id + " " + stripeId);
    }

}

/////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////
// GPIO


var pins = {"handle_trigger":23, "print_button":18, "pir":25, "handle_lock":17};

var gpio = require('rpi-gpio');
gpio.setMode(gpio.MODE_BCM);

// handle trigger
gpio.setup(pins.handle_trigger, gpio.DIR_IN, gpio.EDGE_BOTH);
shellCmd("raspi-gpio set "+ pins.handle_trigger +" pu");

// print button
gpio.setup(pins.print_button, gpio.DIR_IN, gpio.EDGE_BOTH);
shellCmd("raspi-gpio set "+ pins.print_button +" pu");

// pir
gpio.setup(pins.pir, gpio.DIR_IN, gpio.EDGE_BOTH);

// handle lock
gpio.setup(pins.handle_lock, gpio.DIR_OUT);

var d = new Date();
var lastPirTrigger = Date.now();


gpio.on('change', function(channel, value) {

    if(channel==pins.pir){

        if(value==true){
            playInviter();
        } 

    } else if(channel==pins.handle_trigger){

        if(value==false){ //  && 
            if(states.handle_trigger == false){
                 console.log("[HANDLE] Handle pulled down")
                 states.handle_trigger = true;
                 startGame();
            }
           
        } else {
            if(states.handle_trigger == true){
                console.log("[HANDLE] Handle released")
                states.handle_trigger = false;
                lockHandle();
            }
           
        }

    } else if(channel==pins.print_button){

        if(value==true){
            console.log("[BUTTON] Print button released.")
        } else {
            console.log("[BUTTON] Print button pressed.")
            printCurrent();
            releaseHandleLock();
        }

    } else {
        console.log('[GPIO] PIN ' + channel + ' value is now ' + value);
    }

});

function releaseHandleLock(){

    gpio.write(pins.handle_lock, true, function(err) {
        if (err) throw err;
        console.log('[HANDLE] Handle lock released.');
    });

}


function lockHandle(){

    gpio.write(pins.handle_lock, false, function(err) {
        if (err) throw err;
        console.log('[HANDLE] Handle locked.');
    });

}



/////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////

// Sound

var lastInviterPlayed = Date.now();


function playInviter(){

    var d = Date.now();

    if(states.inviter == true &&  d - lastInviterPlayed > 30000){

        playSound("inviter");
        lastInviterPlayed = d;
    }  

}

function playSound(file){

    str = "🔔 [SOUND] Play sound: " + file;
    console.log(str.yellow);

    var cmd = "mpg123 /opt/sautsumasin/software/server/sound/"+ file +".mp3";

        const exec = require('child_process').exec;
        exec(cmd,{maxBuffer:200*1024*1000},function(error,stdout,stderr){ 
        });

}


function stopSounds(){

    console.log("🔔 [SOUND] Stop all sounds")
    shellCmd("killall mpg123");

}

function clearReelStopSounds(){
    for (var i = 0; i < 8; i++) {
        states.reelStopPlayed[i] = false;
    }
}
function playReelStopSound(reel_id){

    if(states.reelStopPlayed[reel_id-1] == false){
        states.reelStopPlayed[reel_id-1] = true;
        playSound("ding");
        var str = "Stopped reel: " + reel_id;
        console.log(str.green);

    }

}


/////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////

// Content

// var printOuts = [];

var urlExists = require('url-exists');

var pubDates = {};
var pubTitles = {};



updatePrintouts();

///////////////////////

var dir = "data/publications_lists"

fs.readdir(dir, (err, files) => {
    
    if (err) {
        throw err;
    }

    files.forEach(file => {

        var id = file.replace(".json","");
        var rawdata = fs.readFileSync(dir + "/"+file);
        var json = JSON.parse(rawdata);
        var title = json.title;
        title = title.split(":",1);
        title = title[0].split(";",1);
        title = trim(title[0]);

        pubTitles[id] = title;
    })
    console.log("[CONTENT] Publication titles loaded".green)
    console.log(pubTitles);
});

///////////////////////


var pubDatesTemp = {};

function updatePrintouts(){

    var dir = "data/printouts/"

    pubDatesTemp = {};

    fs.readdir(dir, (err, files) => {
        
        if (err) {
            throw err;
        }

        files.forEach(file => {

            file = file.replace(".png","");
            str = file.split("_");
            date = str[0];
            title = str[1];

            if(date.length==8){

                 // var o = {};
                 // o.date = date;
                 // o.file = file;
                 // o.title = title;
                 // o.humanDate = date[6] + date[7] + date[4] + date[5] + date[0] + date[1] + date[2] + date[3];
                 // o.printDate =  date[6] + date[7] + "." +date[4] + date[5] + "."+date[0] + date[1] + date[2] + date[3];
                 // printOuts.push(o);

                 var displayDate =  date[6] + date[7] + date[4] + date[5] + date[0] + date[1] + date[2] + date[3];

                 if(!pubDatesTemp[displayDate]){
                    pubDatesTemp[displayDate] = [];
                 }

                 pubDatesTemp[displayDate].push(file);
                


            }
           
                  
        });

        pubDates = pubDatesTemp;

        console.log("[CONTENT] Publication printouts updated.".green);
        console.log(pubDates);


        if(states.game=="booted"){  
            setTimeout(initGame,5000);
        }



    });

}

///////////////////////




function getNextPrintout(){

    console.log("[CONTENT] Selecting next game content:".green);

    // Select random date

    var dateFiles = [];
    var randomDate = "";

    var count = 0;
    for (var d in pubDates){
        if (Math.random() < 1/++count){
            randomDate = d;
        }
    }

    

    var randomPrintout = "";
    var datePublicationList = {};
    var count = 0;

    for (var file in pubDates[randomDate]){

        var str = pubDates[randomDate][file].split("_");
        var title = str[1];

        // Add to list of possible publications for this date
        if(!datePublicationList[title]){
            datePublicationList[title] = pubTitles[title];
        }

        // Select random printout on a date      
        if (Math.random() < 1/++count){
            randomPrintout = pubDates[randomDate][file];
        }

    }

    
    var str = randomPrintout.split("_");




    states.currentDigarId =  str[1] + str[0];
    states.currentDigarLink = "https://dea.digar.ee/cgi-bin/dea?a=is&type=staticpdf&oid=" + str[1] +str[0];

    urlExists(states.currentDigarLink, function(err, exists) {
        if(exists==false){
            console.log("[CONTENT] Changing Digar link PDF to web")
            states.currentDigarLink  = "https://dea.digar.ee/cgi-bin/dea?a=d&d=" + states.currentDigarId;
        } 
    });

    states.currentPublicationTitle = pubTitles[str[1]];
    states.currentDisplayDate = randomDate;
    states.currentPrintDate = randomDate[0] + randomDate[1] + "." + randomDate[2] + randomDate[3] + "." + randomDate[4] + randomDate[5] + randomDate[6] + randomDate[7];
    states.currentPublicationList = datePublicationList;
    states.currentPrintFile = randomPrintout + ".png";
   
    console.log(states);

    //random_publication_date = randomDate;
    //var random_publication = randomIntInc(0,pubDates[random_publication_date].length-1);
    //var random_publication_id = pubDates[random_publication_date][random_publication]    + random_publication_date;
    //nextPrintout = printOuts[randomIntInc(0,printOuts.length-1)];


}


////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

// Printing

const escpos = require('escpos');
escpos.USB = require('escpos-usb');

const device  = new escpos.USB(0x067b,0x2305);
const printer = new escpos.Printer(device);

function printCurrent(){

    if(states.readyForPrinting==true && states.currentPrintFile){

        var str = "🖨️  [PRINT] Printing file: " + states.currentPrintFile;
        console.log(str.green);
        changeBacklight("print_button",1);
        states.readyForPrinting = false;

        const tux = path.join(__dirname, "data/printouts/" + states.currentPrintFile);

        escpos.Image.load(tux, function(image){

            device.open(function(){

                printer.align('ct')
                  .encode('UTF-8') // set encode globally
                   .text("SAUTSUMASIN")
                   .text(states.currentPrintDate)
                   .text(states.currentPublicationTitle)
                   .image(image, 's8')
                   .then(() => { 
                     printer. text("VAATA LEHTE:").qrimage(states.currentDigarLink, {type: 'png', mode: 'dhdw' ,"size":3}, function(err){
                        this.text("\n")
                        this.cut();
                        this.close();
                      });

                        //printer.cut().close();  
                   });
            });
        });
    }

} // function printCurrent

/////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////

// Logging

function sendHearbeat(){

    var url = secrets.logero_url + "?heartbeat=1";
    console.log("[HEARTBEAT] Sending heartbeat to logero.")
    try{
        const request = http.get(url, function(res) {
            setTimeout(sendHearbeat,60000);
            // res.on('end', function() {
            //     setTimeout(sendHearbeat,10000);
            // });
        });
    } catch(e){
      console.log("Logero problem" + e);
      setTimeout(sendHearbeat,60000);
    }

}

// sendHearbeat();

/////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////

// Useful functions


function randomIntInc(low, high) {
  return Math.floor(Math.random() * (high - low + 1) + low)
}


function trim(str){

  str = str.replace(/^\s+|\s+$/g,'');
  return str;

}


function shellCmd(cmd){

    exec(cmd, (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        if(stdout!=""){
           console.log(`stdout: ${stdout}`);
        }
    });

}





