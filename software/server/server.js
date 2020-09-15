
// 'use strict';

var colors = require('colors');

console.log('///////////////////////////////////////////////'.blue);
console.log('SAUSTUMASIN START'.blue);
console.log('///////////////////////////////////////////////\n'.blue);

const spawn = require( 'child_process' );

var fs = require('fs');

var request = require('request');
const { exec } = require("child_process");

////////////////////////////////////////////////////////////////////////////////////////////////////
// Serial

var SerialPort = require('serialport');
const Readline = SerialPort.parsers.Readline;
/*
try{
	var serialport = new SerialPort("/dev/ttyUSB0", {
	  baudRate: 115200
	});

} catch(e){
  console.log("No Arduino connected to /dev/ttyUSB0");
  process.exit();
}

serialport.on('open', function(){
  console.log('Serial port opened'.green);
  // writeToSerial();

 
});


const parser = new Readline({delimiter: '\n'});
serialport.pipe(parser);


 parser.on('data', function(data){

   // DEBUG

    if(trim(data)=="READY"){
    	console.log("Serial port READY".green);
    	setTimeout(silence, 5000);
    	// writeToSerial();
    	

    } else {
    	// console.log('data received:', data);

    }

    });
*/

//////////////////////////////////

function trim(str){

  str = str.replace(/^\s+|\s+$/g,'');
  return str;

}

////////////////////////////////////////////////////////////////////////////////////////////////////

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



////////////////////////////////////////////

// GPIO



var gpio = require('rpi-gpio');

gpio.setMode(gpio.MODE_BCM);
gpio.setup(23, gpio.DIR_IN);

//"raspi-gpio set 23 pd"
// var sd = spawn( 'raspi-gpio', [ 'set','23','pd' ] );

// trigger
shellCmd("raspi-gpio set 23 pu");

// pir
gpio.setup(25, gpio.DIR_IN);

function openRelay(){

    gpio.write(17, true, function(err) {
        if (err) throw err;
        console.log('[RELAY] Open');
    });

}


function closeRelay(){

    gpio.write(17, false, function(err) {
        if (err) throw err;
        console.log('[RELAY] Close');
    });

}




gpio.setup(17, gpio.DIR_OUT);


setTimeout(openRelay,1000);
// setTimeout(closeRelay,3000);

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
    console.log(`stdout: ${stdout}`);
});

}

setInterval(function(){

    gpio.read(23,function(channel, value){

    if(value==false){
        console.log("TRIGGER");
    }

});

},1000);


setInterval(function(){

	gpio.read(25,function(channel, value){

	if(value==true){
    console.log("PIR");
} else {
    console.log("..");

}

});

},1000);
