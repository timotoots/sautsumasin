
// 'use strict';

var colors = require('colors');
const http = require('http');

console.log('///////////////////////////////////////////////'.blue);
console.log('SAUSTUMASIN START'.blue);
console.log('///////////////////////////////////////////////\n'.blue);

const spawn = require( 'child_process' );

// const dir = "/opt/sautsumasin/software/server";

var fs = require('fs');

var request = require('request');
const { exec } = require("child_process");

var fs = require('fs');
var secrets = JSON.parse(fs.readFileSync('secrets.json', 'utf8'));


const path = require('path');
const escpos = require('escpos');
escpos.USB = require('escpos-usb');


var ports = [];


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

////////////////////////////////////////////////////////////////////////////////////////////////////
// GAME LOGIC

setTimeout(initGame,2000);

var currentPrintDate = "";

var waitingTimer;

var nextPrintout = "";

function initGame(){

    console.log("[GAME] Init game".green);

    currentPrintDate = "";

    states.game = "stopped";
     // sendToSerial("10005", "501","1 50");
    changeBacklight("title",100);
    changeBacklight("label",100);
    changeBacklight("print_button",1);
    changeBacklight("spiral","standby");

    releaseHandleLock();

    //startGame();

    // for (var i = 1; i <= 8; i++) {
    //     setTimeout(spinReel,i*100,i)
    
    // }
 
    //  for (var i = 1; i <= 8; i++) {
    //     setTimeout(stopReel,i*100+5000,i,i);
    // }


    // setTimeout(playSound,5000,"sautsumasin");
    // setTimeout(playSound,7000,"tule_minuga_mangima");

}



function startGame(){


    clearTimeout(waitingTimer);

    if(states.game=="playing"){
        console.log("[GAME] Already active")
        return false;
    }

    changeBacklight("spiral","rolling");

    changeBacklight("print_button",1);

    getNextPrintout();   



    var timer = 0;
    var nextDate = nextPrintout.humanDate;

    console.log("[GAME] Start game for date " + nextDate)

    console.log("[GAME] Spin reels".green)

    for (var i = 1; i <= 8; i++) {
        setTimeout(spinReel,i*100,i)
    }

    setTimeout(function(){ console.log("[GAME] Stop reels".green) },5000)

    timer += 3000;

    for (var i = 1; i <= 8; i++) {
        setTimeout(stopReel,i*1000+timer,i,parseInt(nextDate[i-1]));
    }

    timer += 8*1000 + 3000;



    setTimeout(function(nextDate){ 

        states.game = "waiting";
        console.log("[GAME] Print or pull handle? ".green)
        
        playSound("coins");
        currentPrintFile = nextPrintout.file;
        currentPrintDateStr = nextPrintout.printDate;

        changeBacklight("print_button",100);
        setTimeout(playSound,10000,"tryki");

        releaseHandleLock();
        waitingTimer = setTimeout(function(){
                //initGame();
                changeBacklight("spiral","standby");
        },10000);
    
     },timer,nextDate);

    setTimeout(playSound,10,"reels");



}

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

// Serial


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

    } else {
        console.log("[SERIAL " +  ports[parser_id].deviceId + "]: "+data);
    }

}

/////////////////////////////////////////////////


function sendToSerial(device_id, cmd, msg){



    msg = device_id + " " + cmd + " "+ msg;
    ports[portMapping[device_id]].port.write(msg + "\n");
    console.log(msg);

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
var states = {"handle_trigger":false, "print_button":false, "game":"stopped"}

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


gpio.on('change', function(channel, value) {

    if(channel==pins.pir){

        if(value==true){
            console.log("[PIR] Movement detected")
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

function playSound(file){

    console.log("[SOUND] Play sound: " + file)
    var cmd = "mpg123 /opt/sautsumasin/software/server/sound/"+ file +".mp3";

        const exec = require('child_process').exec;
        // console.log(activeDmxCmd);
        exec(cmd,{maxBuffer:200*1024*1000},function(error,stdout,stderr){ 
            // console.log(stdout.blue);

        });

}


function stopSounds(){

    console.log("[SOUND] Stop all sounds")
    shellCmd("killall mpg123");

}


////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

// Printing

const device  = new escpos.USB(0x067b,0x2305);
const printer = new escpos.Printer(device);

function printCurrent(){

    if(currentPrintFile!=""){

        var str = "[PRINT] Printing file: " + currentPrintFile;
        console.log(str.green);
        changeBacklight("print_button",1);

        const tux = path.join(__dirname, "data/printouts/" + currentPrintFile);
        currentPrintFile = "";



        escpos.Image.load(tux, function(image){

          device.open(function(){

            printer.align('ct')
                  
                    .text("SAUTSUMASIN")
                    .text(currentPrintDateStr)
                   .image(image, 's8')
                   .then(() => { 
                    printer.cut().close(); 
                      
                   });

            // OR non-async .raster(image, "mode") : printer.text("text").raster(image).cut().close();
            currentPrintDateStr = "";
          });

        });



    }

}


/////////////////////////////////////////////////////////////////////////////////////////////////

// Creating images


var printOuts = [];

updatePrintouts();

function updatePrintouts(){

    var dir = "data/printouts/"

    fs.readdir(dir, (err, files) => {
        
        if (err) {
            throw err;
        }

        files.forEach(file => {

            date = file.replace(".png","");
            date = date.split("_");
            date = date[0];

            if(date.length==8){
                 var o = {};
                 o.date = date;
                 o.file = file;
                 o.humanDate = date[6] + date[7] + date[4] + date[5] + date[0] + date[1] + date[2] + date[3];
                 o.printDate =  date[6] + date[7] + "." +date[4] + date[5] + "."+date[0] + date[1] + date[2] + date[3];
                 printOuts.push(o);
                 console.log(printOuts);

            }
           
                  
        });

        if(nextPrintout==""){
            console.log("Printout table initalized! Now can play game!");
            getNextPrintout();
        }

    });

}


function randomIntInc(low, high) {
  return Math.floor(Math.random() * (high - low + 1) + low)
}


function getNextPrintout(){

    nextPrintout = printOuts[randomIntInc(0,printOuts.length-1)];
    console.log("Setting next date to " + nextPrintout.date + " and print file to " + nextPrintout.file);


}

/*

const { registerFont, createCanvas } = require('canvas')
registerFont('OCRAStd.otf', { family: 'OCR' })


function createPrintHeader(date,publication){


    const width = 300
    const height = 200

    const canvas = createCanvas(width, height)
    const context = canvas.getContext('2d')

    context.fillStyle = '#ccc'
    context.fillRect(0, 0, width, height)

    // var text = date[0]+ date[1] + "." + date[2]+ date[3] + "." + date[4]+ date[5] + date[6]+ date[7]+ " "  + publication;

    // text += "\nSAUTSUMASIN";
    // var text = "AAA";

const text = 'Hello, World!'

// context.font = 'bold 70pt "OCR"'
context.textAlign = 'center'
context.fillStyle = '#fff'
context.fillText(text, 0, 0,300)

    console.log("[IMAGE] Create headr image for " + text);

    const buffer = canvas.toBuffer('image/png')
    fs.writeFileSync('./test3.png', buffer)

}

createPrintHeader("15091982","Postimees");

*/
/////////////////////////////////////////////////////////////////////////////////////////////////
// Useful functions

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





