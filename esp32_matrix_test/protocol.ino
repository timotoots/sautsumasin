
#define ARRAY_SIZE(A) (sizeof(A) / sizeof((A)[0]))

void protocolTask(void *pvParameters) {

//    Serial.begin(115200);

    while(1){
     while (Serial.available() > 0) {
                   
        int a = Serial.parseInt();

        // message for this controller?
        if(a == 10000){
        	Serial.print("DEVICE_ID: ");
        	Serial.println(PANEL_NR+10001);

        } else if(a == PANEL_NR+10001){
          
          int cmd = Serial.parseInt();

          /////////////////////
          // 101 - start turning
          // protocol: device_id 101 stripe_id
          // example: 10002 101 1
          // example: 10002 101 2
          // example: 10002 101 8
               
          if (cmd==101){

              int b = Serial.parseInt();
              
              if(b > 0 && b <= 8){
                 
                 if(SERIAL_DEBUG==1){

                   Serial.print("[PROTOCOL] ");
                   Serial.print("Starting stripe ");
                   Serial.println(b);
                   
                 }

                 // PAPS
                 startStripe(b-1,2);
              }
              
          /////////////////////
          // 102 - stop turning at position
          // protocol: device_id 102 stripe_id position
          // example: 10002 102 1 2
          // example: 10002 102 2 6
          // example: 10002 102 3 1
          // example: 10002 102 4 10
          // example: 10002 102 5 2
          // example: 10002 102 6 10
          // example: 10002 102 7 9
          // example: 10002 102 8 3
                                                       
          } else if (cmd==102){

              int b = Serial.parseInt();
              
              if(b >= 1 && b <= 8){

                 int c = Serial.parseInt();

                  if(c >= 1 && c <= NUM_STOPS){
    
                      if(SERIAL_DEBUG==1){
                         Serial.print("[PROTOCOL] ");
                         Serial.print("Stopping stripe ");
                         Serial.print(b);
                         Serial.print(" at position ");
                         Serial.println(c);
                      }
                     
                     // PAPS
                     stopStripe(b-1,c-1);

                  }
              }
                          
         
          
          /////////////////////
          // 103 - brightness
          // protocol: device_id 103 brightness_level
          // example: 10002 103 1
          // example: 10002 103 2
          // example: 10002 103 3
                                             
          } else if (cmd==103){

              int b = Serial.parseInt();
              
              if(b >= 1 && b <= 3){

                if(SERIAL_DEBUG==1){
                 Serial.print("[PROTOCOL] ");
                 Serial.println("Brightness to " + b);
                }

                 int factor = 1;
                  
                 if(b==1){
                    factor = 2;
                 } else if(b==2){
                    factor = 3;
                 } 
                 
                 // PAPS
                 // setBrighness(factor);
                 
              }

          /////////////////////
          // 104 - change buffer
          // protocol: device_id 104 x y r g b
          // example: 10002 103 1 1 255 0 0
          // example: 10002 103 100 100 255 255 255
          // example: 10002 103 100 64 0 255 0

          
          }  else if (cmd==104){

              int x = Serial.parseInt();
              
              if(x >= 1 && x <= IMAGE_WIDTH){

                 int y = Serial.parseInt();
                 if(y >= 1 && y <= DISPLAY_HEIGHT){

                    int r = Serial.parseInt();
                    if(r >= 1 && r <= 256){

                        int g = Serial.parseInt();
                        if(g >= 1 && g <= 256){
                          
                            int b = Serial.parseInt();
                              if(b >= 1 && b <= 256){

                                 if(SERIAL_DEBUG==1){
                                     Serial.print("[PROTOCOL] ");
                                     Serial.print("Set buffer pixel at X:");
                                     Serial.print(x);
                                     Serial.print(", Y:");
                                     Serial.print(y);
                                     Serial.print(" to ");
                                     Serial.print(r);
                                     Serial.print(",");
                                     Serial.print(g);
                                     Serial.print(",");
                                     Serial.print(b);
                                     Serial.println(".");
                                  }

                                  // PAPS
                                  // setBufferPixel(x-1,y-1,r-1,g-1,b-1);
                                 
                              } // b
                            
                        } // g
                      
                    } // r
                                
              } // y
                          
          } // x      
    
          
        } // cmd
        
      } // a
    
     } // while
     } // while
     
    } // protocol

