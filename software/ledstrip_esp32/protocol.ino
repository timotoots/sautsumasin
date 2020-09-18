


void protocolTask(void *pvParameters) {

    Serial.begin(115200);

  Serial.println("DEVICE_ID: 10005");


    while(1){
     while (Serial.available() > 0) {
                   
        int a = Serial.parseInt();

        // identify
        if (a==10000){
          
          Serial.println("DEVICE_ID: 10005");
          
        } else if(a == 10005){
        
           int cmd = Serial.parseInt();
          
           
            /////////////////////
            // 501 - white light brightness
            // protocol: 10005 501 light_id brightness_level
            // example: 10005 501 1 1
            // example: 10005 101 1 255
            // example: 10005 101 2 1
  
          if (cmd==501){

              int b = Serial.parseInt();
              
              if(b > 0 && b <= 3){

                 uint8_t c = Serial.parseInt();

                   if(c > 0 && c <= 256){
                 
                     if(SERIAL_DEBUG==1){
    
                       Serial.print("[PROTOCOL] ");
                       Serial.print("Set white light ");
                       Serial.print(b);
                       Serial.print(" brightness to ");
                       Serial.println(c);
                       
                     }
                     
                     if(b==1){
                        if(SERIAL_DEBUG==1){
                        Serial.println("Setting light: title to " + title_brightness);
                        }
                        rgb.setRed(c-1);
                     } else if(b==2){
                      if(SERIAL_DEBUG==1){
                       Serial.println("Setting light: label to " + label_brightness);
                      }
                        rgb.setGreen(c-1);
                     }else if(b==3){
                      if(SERIAL_DEBUG==1){
                       Serial.println("Setting light: button to " + button_brightness);
                      }
                       rgb.setBlue(c-1);
                     } else {
                        if(SERIAL_DEBUG==1){
                       Serial.println("Wrong light: " + b);
                      }
                     }
                
                    
                     
                   }

                 
              }
              
          /////////////////////
          // 102 - change spiral light mode
          // protocol: device_id 502 mode_id
          // example: 10005 502 1
          // example: 10005 102 2
          // example: 10005 102 3
          // example: 10005 102 4
                                
          } else if (cmd==502){

              int b = Serial.parseInt();


              if(b >= 1 && b <= ARRAY_SIZE( gPatterns)){
                
                    if(SERIAL_DEBUG==1){
                      Serial.print("Changing to state:");
                      Serial.println(b);
                    }
                    gCurrentPatternNumber = b-1;

              }
              
         }
          }  
         delay(10);
    
     } // while
     } // while
     
    } // protocol
