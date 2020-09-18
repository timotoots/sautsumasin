

'use strict';
const path = require('path');
const escpos = require('escpos');
escpos.USB = require('escpos-usb');



const device  = new escpos.USB(0x067b,0x2305);
const printer = new escpos.Printer(device);

const tux = path.join(__dirname, 'data/printouts/19211019_postimeesew.png');
escpos.Image.load(tux, function(image){

  device.open(function(){

    printer.align('ct')
          
            .qrimage('https://github.com/song940/node-escpos', {type: 'png', mode: 'dhdw' ,"size":3}, function(err){
    this.cut();
    this.close();
  });

    // OR non-async .raster(image, "mode") : printer.text("text").raster(image).cut().close();

  });

});