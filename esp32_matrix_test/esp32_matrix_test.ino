/*
 * ICN2053 - ESP32 - LED Wall
 * Copyright (c) 2019 TimeWaster
 */

// the dimensions of your "screen", means the pixel size of all your modules you want to use put together in one row
#define DISPLAY_WIDTH       128*1
#define DISPLAY_HEIGHT      64*1
#define DISPLAY_SCAN_LINES  32 // scan lines are usually half the display height
#define PANELS 3
#define EFFECT              1  // 1: Gray gradient (static)  2: Random gray static  3: Random color static  4: Animated Rainbow  5: Animated random gray static 6: custom
#define IMAGE_WIDTH 374
#define IMAGE_HEIGHT 24
#define IMAGE_POSY 0
#define STRIPES 4
#define OFFSET_BUFFERS 2

#define NUM_STOPS 11 // How many stop positions on a stripe
#define SERIAL_DEBUG 1

#define PANEL_NR 2 // 0,1,2

// panel 0
#define PANEL_0_BEGIN_X 0
#define PANEL_0_END_X IMAGE_WIDTH-1
#define PANEL_0_BEGIN_Y 0
#define PANEL_0_END_Y 63

#define PANEL0_STRIPE0_WIDTH 24
#define PANEL0_STRIPE0_OFFSET_X 292
#define PANEL0_STRIPE0_OFFSET_Y 0

#define PANEL0_STRIPE1_WIDTH 24
#define PANEL0_STRIPE1_OFFSET_X 292
#define PANEL0_STRIPE1_OFFSET_Y 24

#define PANEL0_STRIPE2_WIDTH 16
#define PANEL0_STRIPE2_OFFSET_X 292
#define PANEL0_STRIPE2_OFFSET_Y 48

#define PANEL0_STRIPE3_WIDTH 0
#define PANEL0_STRIPE3_OFFSET_X 292
#define PANEL0_STRIPE3_OFFSET_Y 0

// panel 1
#define PANEL_1_BEGIN_X 0
#define PANEL_1_END_X IMAGE_WIDTH-1
#define PANEL_1_BEGIN_Y 64
#define PANEL_1_END_Y 127

#define PANEL1_STRIPE0_WIDTH 8
#define PANEL1_STRIPE0_OFFSET_X 292
#define PANEL1_STRIPE0_OFFSET_Y -16

#define PANEL1_STRIPE1_WIDTH 24
#define PANEL1_STRIPE1_OFFSET_X 292
#define PANEL1_STRIPE1_OFFSET_Y 8

#define PANEL1_STRIPE2_WIDTH 24
#define PANEL1_STRIPE2_OFFSET_X 292
#define PANEL1_STRIPE2_OFFSET_Y 32

#define PANEL1_STRIPE3_WIDTH 8
#define PANEL1_STRIPE3_OFFSET_X 292
#define PANEL1_STRIPE3_OFFSET_Y 56

// panel 2
#define PANEL_2_BEGIN_X 0
#define PANEL_2_END_X IMAGE_WIDTH-1
#define PANEL_2_BEGIN_Y 128
#define PANEL_2_END_Y 191

#define PANEL2_STRIPE0_WIDTH 16
#define PANEL2_STRIPE0_OFFSET_X 292
#define PANEL2_STRIPE0_OFFSET_Y -8

#define PANEL2_STRIPE1_WIDTH 24
#define PANEL2_STRIPE1_OFFSET_X 292
#define PANEL2_STRIPE1_OFFSET_Y 16

#define PANEL2_STRIPE2_WIDTH 24
#define PANEL2_STRIPE2_OFFSET_X 292
#define PANEL2_STRIPE2_OFFSET_Y 40

#define PANEL2_STRIPE3_WIDTH 0
#define PANEL2_STRIPE3_OFFSET_X 292
#define PANEL2_STRIPE3_OFFSET_Y 0

// panel 3
#define PANEL_3_BEGIN_X 0
#define PANEL_3_END_X IMAGE_WIDTH-1
#define PANEL_3_BEGIN_Y 192
#define PANEL_3_END_Y 255

#define PANEL3_STRIPE0_WIDTH 16
#define PANEL3_STRIPE0_OFFSET_X 0
#define PANEL3_STRIPE0_OFFSET_Y -8

#define PANEL3_STRIPE1_WIDTH 24
#define PANEL3_STRIPE1_OFFSET_X 300
#define PANEL3_STRIPE1_OFFSET_Y 16

#define PANEL3_STRIPE2_WIDTH 24
#define PANEL3_STRIPE2_OFFSET_X 0
#define PANEL3_STRIPE2_OFFSET_Y 40

#define PANEL3_STRIPE3_WIDTH 0
#define PANEL3_STRIPE3_OFFSET_X 0
#define PANEL3_STRIPE3_OFFSET_Y 0

/*
#if (( PANEL1_STRIPE0_WIDTH + PANEL1_STRIPE1_WIDTH + PANEL1_STRIPE2_WIDTH + PANEL1_STRIPE3_WIDTH ) > DISPLAY_HEIGHT )
#error PANEL1_STRIPE0_WIDTH + PANEL1_STRIPE1_WIDTH + PANEL1_STRIPE2_WIDTH + PANEL1_STRIPE3_WIDTH should be <=  DISPLAY_HEIGHT
#endif
#if (( PANEL2_STRIPE0_WIDTH + PANEL2_STRIPE1_WIDTH + PANEL2_STRIPE2_WIDTH + PANEL2_STRIPE3_WIDTH ) > DISPLAY_HEIGHT )
#error PANEL2_STRIPE0_WIDTH + PANEL2_STRIPE1_WIDTH + PANEL2_STRIPE2_WIDTH + PANEL2_STRIPE3_WIDTH should be <=  DISPLAY_HEIGHT
#endif
*/
// leave this like it is, the pins are carefully selected to not interfere with special purpose pins
// also pins with the same function are grouped together so they can be set with one command to save CPU cycles
/*
#define PIN_CLK 4
#define PIN_LE  5
#define PIN_OE  3
#define PIN_A   22
#define PIN_B   23
#define PIN_C   25
#define PIN_D   26 // leave this even if you don't use pin D
#define PIN_E   27 // leave this even if you don't use pin E
#define PIN_R1  2
#define PIN_G1  16
#define PIN_B1  17
#define PIN_R2  18
#define PIN_G2  19
#define PIN_B2  21
*/

#define PIN_CLK 2
#define PIN_LE  27
#define PIN_OE  5
#define PIN_A   21
#define PIN_B   22
#define PIN_C   23
#define PIN_D   25 // leave this even if you don't use pin D
#define PIN_E   26 // leave this even if you don't use pin E
#define PIN_R1  14//14
#define PIN_G1  15//15
#define PIN_B1  25//16
#define PIN_R2  26//17
#define PIN_G2  18//18
#define PIN_B2  19//19

#include <esp_task_wdt.h>
//#include "riba1.h"
#include "riba_uus.h"

const unsigned long MASK_PINS = (1<<PIN_R1)|(1<<PIN_G1)|(1<<PIN_B1)|(1<<PIN_R2)|(1<<PIN_G2)|(1<<PIN_B2);
const unsigned long MASK_R1 = (1<<PIN_R1);
const unsigned long MASK_G1 = (1<<PIN_G1);
const unsigned long MASK_B1 = (1<<PIN_B1);
const unsigned long MASK_R2 = (1<<PIN_R2);
const unsigned long MASK_G2 = (1<<PIN_G2);
const unsigned long MASK_B2 = (1<<PIN_B2);

// global variables
unsigned int  displayBufferSize      = DISPLAY_WIDTH * DISPLAY_SCAN_LINES * 16; // the buffers need to hold 16 bit of image data per pixel over 6 outputs (RGB1 + RGB2)
unsigned int  displayBufferLineSize  = DISPLAY_WIDTH * 16;
unsigned int  imageBufferLineSize	 = IMAGE_WIDTH * 16;
unsigned int  displayNumberChips     = DISPLAY_WIDTH / 16;
unsigned char pins[14]               = {PIN_CLK, PIN_LE, PIN_OE, PIN_A, PIN_B, PIN_C, PIN_D, PIN_E, PIN_R1, PIN_G1, PIN_B1, PIN_R2, PIN_G2, PIN_B2};
unsigned int  Translate8To16Bit[256] = {0,46,92,139,186,233,280,327,375,422,470,519,567,615,664,713,762,812,861,911,961,1011,1061,1112,1163,1214,1265,1317,1368,1420,1473,1525,1578,1631,1684,1737,1791,1844,1899,1953,2007,2062,2117,2173,2228,2284,2340,2397,2453,2510,2568,2625,2683,2741,2799,2858,2917,2976,3036,3096,3156,3216,3277,3338,3399,3461,3523,3586,3648,3711,3775,3838,3902,3967,4032,4097,4162,4228,4294,4361,4428,4495,4563,4631,4699,4768,4838,4907,4978,5048,5119,5191,5262,5335,5407,5481,5554,5628,5703,5778,5853,5929,6006,6083,6160,6238,6317,6396,6476,6556,6636,6718,6799,6882,6965,7048,7132,7217,7302,7388,7475,7562,7650,7739,7828,7918,8008,8099,8191,8284,8377,8472,8567,8662,8759,8856,8954,9053,9153,9253,9355,9457,9560,9664,9769,9875,9982,10090,10199,10309,10420,10532,10645,10760,10875,10991,11109,11228,11348,11469,11591,11715,11840,11967,12094,12223,12354,12486,12620,12755,12891,13030,13169,13311,13454,13599,13746,13895,14045,14198,14352,14509,14667,14828,14991,15157,15324,15494,15667,15842,16020,16200,16383,16569,16758,16951,17146,17345,17547,17752,17961,18174,18391,18612,18837,19067,19301,19539,19783,20032,20286,20546,20812,21083,21361,21646,21938,22237,22544,22859,23183,23516,23859,24211,24575,24950,25338,25739,26153,26583,27029,27493,27975,28478,29003,29553,30130,30736,31375,32051,32767,33530,34345,35221,36167,37195,38322,39567,40959,42537,44359,46514,49151,52551,57343,65535};
unsigned char activeScreenBuffer     = 0;
unsigned char imageScreenBuffer      = 2;
unsigned char *screenBuffer[3];
unsigned int displayBufferWidth = max(IMAGE_WIDTH,DISPLAY_WIDTH);
unsigned int panelBufferOffsetX = 0;
unsigned int displayBufferOffsetY = 0;
int stripes_Y[PANELS][STRIPES][8]; // beginY , endY, width, id, start, stop, current offset, roll counter
unsigned int offsetMatrix[PANELS][OFFSET_BUFFERS][DISPLAY_HEIGHT]; // x offsets
unsigned int panels_parm[PANELS][2];
unsigned int stripe_actions[PANELS*4][4]; // start, stop, current offset,roll counter
bool offsetOK = true;
volatile bool timertick = false;
/*
 * methods that are loaded into IRAM with IRAM_ATTR to avoid being loaded on call from flash (ESP-IDF command)
 * these methods need to be defined before they are used (order of calls)
 */
volatile int interruptCounter;
int totalInterruptCounter;

hw_timer_t * timer = NULL;
portMUX_TYPE timerMux = portMUX_INITIALIZER_UNLOCKED;

void IRAM_ATTR onTimer() {
  portENTER_CRITICAL_ISR(&timerMux);
//  interruptCounter++;
  timertick = true;
  portEXIT_CRITICAL_ISR(&timerMux);

}
void IRAM_ATTR digitalWriteFast(unsigned char pinNum, boolean value) {
    // GPIO.out_w1ts sets a pin high, GPIO.out_w1tc sets a pin low (ESP-IDF commands)
    if(value) GPIO.out_w1ts = 1 << pinNum;
    else GPIO.out_w1tc = 1 << pinNum;
}

void IRAM_ATTR digitalWriteEvenFaster(unsigned long data, unsigned long mask) {
    // GPIO.out writes multiple pins at the same time (ESP-IDF command)
    GPIO.out = (GPIO.out & ~mask) | data;
}

void IRAM_ATTR sendClock() {
    digitalWriteFast(PIN_CLK, 1);
    digitalWriteFast(PIN_CLK, 0);
}

void IRAM_ATTR sendPwmClock(unsigned char clocks) {
    while (clocks--) {
        digitalWriteFast(PIN_OE, 1);
        digitalWriteFast(PIN_OE, 0);
    }
}

void IRAM_ATTR sendLatch(unsigned char clocks) {
    digitalWriteFast(PIN_LE, 1);
    while(clocks--) {
        sendClock();
    }
    digitalWriteFast(PIN_LE, 0);
}

void IRAM_ATTR sendScanLine(unsigned char line) {
/*
    unsigned long scanLine = 0x00000000;

    if(line & 0x1) scanLine += 1;
    if(line >> 1 & 0x1) scanLine += 2;
    if(line >> 2 & 0x1) scanLine += 4;
    if(line >> 3 & 0x1) scanLine += 16;
    if(line >> 4 & 0x1) scanLine += 32;

    digitalWriteEvenFaster(scanLine << 21, 0x06E00000);
*/
//	unsigned long scanLine = 0x00000001;
	unsigned long scanLine = 0x80000000;
	uint8_t clocks = 32;
// EN out
    digitalWriteFast(PIN_B, 1);
   	scanLine = 0x80000000 >> line;
    while (clocks--){
 // DATA out
    		digitalWriteFast(PIN_C, scanLine & 0x1);

//  LCK out
    		digitalWriteFast(PIN_A, 1);
    		digitalWriteFast(PIN_A, 0);

    		scanLine = scanLine >> 1;
    	}
    digitalWriteFast(PIN_B, 0);

}
void IRAM_ATTR LedWallRefresh() {
    unsigned char *activeBuffer = screenBuffer[activeScreenBuffer]; // save a reference to the active buffer to avoid sending data from a different cycle in between
    unsigned long pos,pos1,offset;
    long bufferPos,bufferPos1,bufferPos_t,bufferPos1_t;
    unsigned long sendBuffer;
    unsigned char sendTemp;
    unsigned int pix_addr;
//    offset = displayBufferOffsetX;
    if ( offsetOK){
//    	memcpy(offsetMatrix[0],offsetMatrix[1],DISPLAY_HEIGHT*2);
    	for ( unsigned short j = 0; j < PANELS ; j++)
    		for ( unsigned short i = 0; i < DISPLAY_HEIGHT ; i++)
    			offsetMatrix[j][0][i] = offsetMatrix[j][1][i]; // X offset
    }
    sendLatch(3); // send vsync
 //   unsigned int displayBufferOffsetX = 0;
 //   unsigned int displayBufferOffsetY = 0;

    // since the generation of the output signal in the ICN2053 chips is directly tied to the input clock signal when receiving pixel data,
    // the order and amount of clock cycles, latches, PWM clock and so on can not be changed.
    for(unsigned int y = 0; y < DISPLAY_SCAN_LINES; y++) { // 0-N scan lines * 2 = pixel height
        bufferPos_t = (y * imageBufferLineSize)+ offsetMatrix[PANEL_NR][0][y] * 16;
        bufferPos1_t = (y * imageBufferLineSize)+ offsetMatrix[PANEL_NR][0][y + DISPLAY_SCAN_LINES] * 16;

    	for(unsigned int x = 0; x < 16; x++) { // 0-15 because 1 chip has 16 outputs
            sendScanLine(y % 2 * DISPLAY_SCAN_LINES /2  + x); // sends 0-N scan lines in every 2 (4 combined) data lines
            sendPwmClock(138); // send 138 clock cycles for PWM generation inside the ICN2053 chips - this needs to be exactly 138 pulses
            bufferPos = bufferPos_t + x * 16;
            bufferPos1 = bufferPos1_t + x * 16;
            for(unsigned int sect = 0; sect < displayNumberChips; sect++) { // 0-N number of chips
//            	pos = bufferPos + sect * 16 * 16;
//                pos1 = bufferPos1 + sect * 16 * 16;
            	pix_addr = sect * 16 * 16;
            	if ( 16 * sect + x + offsetMatrix[PANEL_NR][0][y] >= IMAGE_WIDTH)
                	pix_addr -= IMAGE_WIDTH * 16;
            	pos = bufferPos + pix_addr;
            	pix_addr = sect * 16 * 16;
            	if ( 16 * sect + x + offsetMatrix[PANEL_NR][0][y + DISPLAY_SCAN_LINES] >= IMAGE_WIDTH)
                	pix_addr -= IMAGE_WIDTH * 16;
                pos1 = bufferPos1 + pix_addr;

                for(unsigned char bit = 0; bit < 16; bit++) { // 0-16 bits of pixel data

                	sendBuffer = 0;
                	sendTemp = activeBuffer[pos + bit];
// remap B1 & R2 for esp32-Wroom ( io 16,17 busy for PSRAM )
                	if (sendTemp & 0x1) sendBuffer |= MASK_R1;
                	if (sendTemp & 0x2) sendBuffer |= MASK_G1;
                	if (sendTemp & 0x4) sendBuffer |= MASK_B1;

                	sendTemp = activeBuffer[pos1 + bit];

                	if (sendTemp & 0x8) sendBuffer |= MASK_R2;
                	if (sendTemp & 0x10) sendBuffer |= MASK_G2;
                	if (sendTemp & 0x20) sendBuffer |= MASK_B2;
                    digitalWriteEvenFaster(sendBuffer, MASK_PINS);


//                    digitalWriteEvenFaster(activeBuffer[pos + bit] << 14, 0x000FC000);

                    if(sect == displayNumberChips - 1 && bit == 15) digitalWriteFast(PIN_LE, 1); // send a latch for 1 clock after every chip was written to
                    sendClock();
                }

                digitalWriteFast(PIN_LE, 0);
            }
        }
    }
}
void IRAM_ATTR cacheWrite(unsigned char *buffer, unsigned int posX, unsigned int posY, unsigned char red, unsigned char green, unsigned char blue) {
    unsigned long bufferPos = posX * 16 + posY * imageBufferLineSize;
    unsigned int inputMask = 0x8000;
    unsigned char outputmask = 0x07;
    unsigned char rgb = 0x00;
    unsigned int red16Bit = Translate8To16Bit[red];
    unsigned int green16Bit = Translate8To16Bit[green];
    unsigned int blue16Bit = Translate8To16Bit[blue];

    if(posY > DISPLAY_SCAN_LINES - 1) {
        outputmask = 0x38;
        bufferPos -= DISPLAY_SCAN_LINES * imageBufferLineSize;
    }

    // data is saved in a format where the refresh method just needs to send it out instead of formatting it first, which makes it 7 fps faster
    // the highest bit of each color is saved in a char and written into the buffer, then the second highest bit and so on
    // since the RGB values of two different lines are sent at the same time, when y is bigger than the scan line area the data is written into different bits of the buffer data
    for(unsigned char x = 0; x < 16; x++) {
        rgb = 0x00;
        inputMask = 0x8000 >> x;

        if(red16Bit & inputMask) rgb += 1;
        if(green16Bit & inputMask) rgb += 2;
        if(blue16Bit & inputMask) rgb += 4;

        if(posY > DISPLAY_SCAN_LINES - 1) rgb <<= 3;

        // write data without changing the surrounding bits
        buffer[bufferPos + x] = (buffer[bufferPos + x] & ~outputmask) | rgb;
    }
}
void logMemory() {
  log_d("Used PSRAM: %d", ESP.getPsramSize() - ESP.getFreePsram());
  log_d("Largest free memory block: %d", ESP.getFreeHeap());
}

void prepareImage() {
    unsigned char *imageBuffer = screenBuffer[imageScreenBuffer];
    unsigned int posX=0,posY=0,maxX,maxY;
    unsigned int stripeRow;

//    unsigned int offsetMatrix[PANELS][OFFSET_BUFFERS][DISPLAY_HEIGHT];
//	offsetMatrix[0][0][x][1] = PANEL0_STRIPE0_OFFSET_Y;
    posX = IMAGE_WIDTH -1;
// stripe 0
    if (stripes_Y[PANEL_NR][0][2]){ // stripe width > 0
    	posY = stripes_Y[PANEL_NR][0][0]; // stripe begin
    	for ( unsigned int i=0; i < sizeof(testriba); i=i+3){
    		if ( posY >= 0  && posY < DISPLAY_HEIGHT)
    			cacheWrite(imageBuffer,posX,posY,testriba[i],testriba[i+1],testriba[i+2]);
    		posY++;
    		if ( posY == IMAGE_HEIGHT + stripes_Y[PANEL_NR][0][0]){
    	    	posY = stripes_Y[PANEL_NR][0][0]; // stripe begin
    			posX--;
    		}
    	}
    }
// stripe 1
    if (stripes_Y[PANEL_NR][1][2]){ // stripe width > 0
    	posY = stripes_Y[PANEL_NR][1][0]; // stripe begin
    	posX = IMAGE_WIDTH -1;
    	for ( unsigned int i=0; i < sizeof(testriba); i=i+3){
    		if ( posY >= 0  && posY < DISPLAY_HEIGHT)
    			cacheWrite(imageBuffer,posX,posY,testriba[i],testriba[i+1],testriba[i+2]);
    		posY++;
    		if ( posY ==  IMAGE_HEIGHT + stripes_Y[PANEL_NR][1][0]){
    			posY=stripes_Y[PANEL_NR][1][0];
    			posX--;
    		}
    	}
	}
// stripe 2
    if (stripes_Y[PANEL_NR][2][2]){ // stripe width > 0
    	posY = stripes_Y[PANEL_NR][2][0]; // stripe begin
    	posX = IMAGE_WIDTH -1;
    	for ( unsigned int i=0; i < sizeof(testriba); i=i+3){
    		if ( posY >= 0  && posY < DISPLAY_HEIGHT)
    			cacheWrite(imageBuffer,posX,posY,testriba[i],testriba[i+1],testriba[i+2]);
    		posY++;
    		if ( posY == IMAGE_HEIGHT + stripes_Y[PANEL_NR][2][0]){
    			posY=stripes_Y[PANEL_NR][2][0];
    			posX--;
    		}
    	}
    }
// stripe 3
    if (stripes_Y[PANEL_NR][3][2]){ // stripe width > 0
    	posY = stripes_Y[PANEL_NR][3][0]; // stripe begin
    	posX = IMAGE_WIDTH -1;
    	for ( unsigned int i=0; i < sizeof(testriba); i=i+3){
    		if ( posY >= 0  && posY < DISPLAY_HEIGHT)
    			cacheWrite(imageBuffer,posX,posY,testriba[i],testriba[i+1],testriba[i+2]);
    		posY++;
    		if ( posY == IMAGE_HEIGHT + stripes_Y[PANEL_NR][3][0]){
    			posY=stripes_Y[PANEL_NR][3][0];
    			posX--;
    		}
    	}
    }

}
void setup() {
    // create screen buffers (uses ESP-IDF malloc command to find a piece of dynamic memory to hold the buffer)
    // we use double buffering to be able to manipulate one buffer while the display refresh uses the other buffer
    Serial.begin(115200);

	logMemory();
	screenBuffer[0] = (unsigned char*)ps_malloc(10);
	logMemory();
    screenBuffer[1] = (unsigned char*)ps_malloc(10);
    logMemory();


    screenBuffer[imageScreenBuffer] = (unsigned char*)ps_malloc(displayBufferWidth*DISPLAY_SCAN_LINES*16); // 16 bytes for each pixel
    logMemory();

    // fill buffers with 0
//    for (unsigned int x = 0; x < displayBufferSize; x++) {
//        screenBuffer[0][x] = 0;
//        screenBuffer[1][x] = 0;
//    }
    for (unsigned int x = 0; x < displayBufferWidth*DISPLAY_SCAN_LINES*16; x++) {
        screenBuffer[2][x] = 0;
    }

//int stripes_Y[PANELS][STRIPES][8]; // beginY , endY, width, id, start, stop, current offset, roll counter
// fill stripe_actions
    for ( unsigned int i=0; i< PANELS*4; i++){
    	stripe_actions[i][0] = 0; //start
    	stripe_actions[i][1] = 0; //stop
    	stripe_actions[i][2] = 0; //current offset
    	stripe_actions[i][3] = 0; //speed
    }
// fill rows offset matrix
#if ( PANELS > 0)

    stripes_Y[0][0][0] = PANEL0_STRIPE0_OFFSET_Y;
    stripes_Y[0][0][1] = 0;
    stripes_Y[0][0][2] = PANEL0_STRIPE0_WIDTH;
    stripes_Y[0][0][3] = 0;
    stripes_Y[0][0][4] = -1;
    stripes_Y[0][0][5] = -1;
    stripes_Y[0][0][6] = PANEL0_STRIPE0_OFFSET_X;
    stripes_Y[0][1][0] = PANEL0_STRIPE1_OFFSET_Y;
    stripes_Y[0][1][1] = 0;
    stripes_Y[0][1][2] = PANEL0_STRIPE1_WIDTH;
    stripes_Y[0][1][3] = 1;
    stripes_Y[0][1][4] = -1;
    stripes_Y[0][1][5] = -1;
    stripes_Y[0][1][6] = PANEL0_STRIPE2_OFFSET_X;
    stripes_Y[0][2][0] = PANEL0_STRIPE2_OFFSET_Y;
    stripes_Y[0][2][1] = 0;
    stripes_Y[0][2][2] = PANEL0_STRIPE2_WIDTH;
    stripes_Y[0][2][3] = 2;
    stripes_Y[0][2][4] = -1;
    stripes_Y[0][2][5] = -1;
    stripes_Y[0][2][6] = PANEL0_STRIPE2_OFFSET_X;
    stripes_Y[0][3][0] = PANEL0_STRIPE3_OFFSET_Y;
    stripes_Y[0][3][1] = 0;
    stripes_Y[0][3][2] = PANEL0_STRIPE3_WIDTH;
    stripes_Y[0][3][3] = -1;
    stripes_Y[0][3][4] = -1;
    stripes_Y[0][3][5] = -1;
    stripes_Y[0][3][6] = PANEL0_STRIPE0_OFFSET_X;

    for ( unsigned int x = 0; x < DISPLAY_HEIGHT; x++){
    	if ( x < PANEL0_STRIPE0_WIDTH){
    		offsetMatrix[0][0][x] = PANEL0_STRIPE0_OFFSET_X;
    		offsetMatrix[0][1][x] = PANEL0_STRIPE0_OFFSET_X;
    	}
    	else if ( x >= PANEL0_STRIPE0_WIDTH && x < PANEL0_STRIPE1_WIDTH + PANEL0_STRIPE0_WIDTH){
    		offsetMatrix[0][0][x] = PANEL0_STRIPE1_OFFSET_X;
    		offsetMatrix[0][1][x] = PANEL0_STRIPE1_OFFSET_X;
    	}
    	else if ( x >= PANEL0_STRIPE0_WIDTH + PANEL0_STRIPE1_WIDTH && x < PANEL0_STRIPE2_WIDTH + PANEL0_STRIPE1_WIDTH + PANEL0_STRIPE0_WIDTH){
    		offsetMatrix[0][0][x] = PANEL0_STRIPE2_OFFSET_X;
    		offsetMatrix[0][1][x] = PANEL0_STRIPE2_OFFSET_X;
    	}
    	else if ( x >= PANEL0_STRIPE0_WIDTH + PANEL0_STRIPE1_WIDTH + PANEL0_STRIPE2_WIDTH && x < DISPLAY_HEIGHT){
    		offsetMatrix[0][0][x] = PANEL0_STRIPE3_OFFSET_X;
    		offsetMatrix[0][1][x] = PANEL0_STRIPE3_OFFSET_X;
    	}
    	else{
    		offsetMatrix[0][0][x] = 0;
    		offsetMatrix[0][1][x] = 0;
    	}
    }
#endif
#if  ( PANELS > 1)
    stripes_Y[1][0][0] = PANEL1_STRIPE0_OFFSET_Y;
    stripes_Y[1][0][1] = 0;
    stripes_Y[1][0][2] = PANEL1_STRIPE0_WIDTH;
    stripes_Y[1][0][3] = 2;
    stripes_Y[1][0][4] = -1;
    stripes_Y[1][0][5] = -1;
    stripes_Y[1][0][6] = PANEL1_STRIPE0_OFFSET_X;
    stripes_Y[1][1][0] = PANEL1_STRIPE1_OFFSET_Y;
    stripes_Y[1][1][1] = 0;
    stripes_Y[1][1][2] = PANEL1_STRIPE1_WIDTH;
    stripes_Y[1][1][3] = 3;
    stripes_Y[1][1][4] = -1;
    stripes_Y[1][1][5] = -1;
    stripes_Y[1][1][6] = PANEL0_STRIPE1_OFFSET_X;
    stripes_Y[1][2][0] = PANEL1_STRIPE2_OFFSET_Y;
    stripes_Y[1][2][1] = 0;
    stripes_Y[1][2][2] = PANEL1_STRIPE2_WIDTH;
    stripes_Y[1][2][3] = 4;
    stripes_Y[1][2][4] = -1;
    stripes_Y[1][2][5] = -1;
    stripes_Y[1][2][6] = PANEL0_STRIPE2_OFFSET_X;
    stripes_Y[1][3][0] = PANEL1_STRIPE3_OFFSET_Y;
    stripes_Y[1][3][1] = 0;
    stripes_Y[1][3][2] = PANEL1_STRIPE3_WIDTH;
    stripes_Y[1][3][3] = 5;
    stripes_Y[1][3][4] = -1;
    stripes_Y[1][3][5] = -1;
    stripes_Y[1][3][6] = PANEL0_STRIPE3_OFFSET_X;

    for ( unsigned int x = 0; x < DISPLAY_HEIGHT; x++){
    	if ( x < PANEL1_STRIPE0_WIDTH){
    		offsetMatrix[1][0][x] = PANEL1_STRIPE0_OFFSET_X;
    		offsetMatrix[1][1][x] = PANEL1_STRIPE0_OFFSET_X;
    	}
    	else if ( x >= PANEL1_STRIPE0_WIDTH && x < PANEL1_STRIPE1_WIDTH + PANEL1_STRIPE0_WIDTH){
    		offsetMatrix[1][0][x] = PANEL1_STRIPE1_OFFSET_X;
    		offsetMatrix[1][1][x] = PANEL1_STRIPE1_OFFSET_X;
    	}
    	else if ( x >= PANEL1_STRIPE0_WIDTH + PANEL1_STRIPE1_WIDTH && x < PANEL1_STRIPE2_WIDTH + PANEL1_STRIPE1_WIDTH + PANEL1_STRIPE0_WIDTH){
    		offsetMatrix[1][0][x] = PANEL1_STRIPE2_OFFSET_X;
    		offsetMatrix[1][1][x] = PANEL1_STRIPE2_OFFSET_X;
    	}
    	else if ( x >= PANEL1_STRIPE0_WIDTH + PANEL1_STRIPE1_WIDTH + PANEL1_STRIPE2_WIDTH && x < DISPLAY_HEIGHT){
    		offsetMatrix[1][0][x] = PANEL1_STRIPE3_OFFSET_X;
    		offsetMatrix[1][1][x] = PANEL1_STRIPE3_OFFSET_X;
    	}
    	else{
    		offsetMatrix[1][0][x] = 0;
    		offsetMatrix[1][1][x] = 0;
    	}
    }
#endif
#if  ( PANELS > 2)
    stripes_Y[2][0][0] = PANEL2_STRIPE0_OFFSET_Y;
    stripes_Y[2][0][1] = 0;
    stripes_Y[2][0][2] = PANEL2_STRIPE0_WIDTH;
    stripes_Y[2][0][3] = 5;
    stripes_Y[2][0][4] = -1;
    stripes_Y[2][0][5] = -1;
    stripes_Y[2][1][0] = PANEL2_STRIPE1_OFFSET_Y;
    stripes_Y[2][1][1] = 0;
    stripes_Y[2][1][2] = PANEL2_STRIPE1_WIDTH;
    stripes_Y[2][1][3] = 6;
    stripes_Y[2][2][4] = -1;
    stripes_Y[2][2][5] = -1;
    stripes_Y[2][2][0] = PANEL2_STRIPE2_OFFSET_Y;
    stripes_Y[2][2][1] = 0;
    stripes_Y[2][2][2] = PANEL2_STRIPE2_WIDTH;
    stripes_Y[2][2][3] = 7;
    stripes_Y[2][2][4] = -1;
    stripes_Y[2][2][5] = -1;
    stripes_Y[2][3][0] = PANEL2_STRIPE3_OFFSET_Y;
    stripes_Y[2][3][1] = 0;
    stripes_Y[2][3][2] = PANEL2_STRIPE3_WIDTH;
    stripes_Y[2][3][3] = -1;
    stripes_Y[2][2][4] = -1;
    stripes_Y[2][2][5] = -1;

    for ( unsigned int x = 0; x < DISPLAY_HEIGHT; x++){
    	if ( x < PANEL2_STRIPE0_WIDTH){
    		offsetMatrix[2][0][x] = PANEL2_STRIPE0_OFFSET_X;
    		offsetMatrix[2][1][x] = PANEL2_STRIPE0_OFFSET_X;
    	}
    	else if ( x >= PANEL2_STRIPE0_WIDTH && x < PANEL2_STRIPE1_WIDTH + PANEL2_STRIPE0_WIDTH){
    		offsetMatrix[2][0][x] = PANEL2_STRIPE1_OFFSET_X;
    		offsetMatrix[2][1][x] = PANEL2_STRIPE1_OFFSET_X;
     	}
    	else if ( x >= PANEL2_STRIPE0_WIDTH + PANEL2_STRIPE1_WIDTH && x < PANEL2_STRIPE2_WIDTH + PANEL2_STRIPE1_WIDTH + PANEL2_STRIPE0_WIDTH){
    		offsetMatrix[2][0][x] = PANEL2_STRIPE2_OFFSET_X;
    		offsetMatrix[2][1][x] = PANEL2_STRIPE2_OFFSET_X;
    	}
    	else if ( x >= PANEL2_STRIPE0_WIDTH + PANEL2_STRIPE1_WIDTH + PANEL2_STRIPE2_WIDTH && x < DISPLAY_HEIGHT){
    		offsetMatrix[2][0][x] = PANEL2_STRIPE3_OFFSET_X;
    		offsetMatrix[2][1][x] = PANEL2_STRIPE3_OFFSET_X;
    	}
    	else{
    		offsetMatrix[2][0][x] = 0;
    		offsetMatrix[2][1][x] = 0;
    	}
    }
#endif
#if  ( PANELS > 3)
    stripes_Y[3][0][0] = PANEL3_STRIPE0_OFFSET_Y;
    stripes_Y[3][0][1] = 0;
    stripes_Y[3][0][2] = PANEL3_STRIPE0_WIDTH;
    stripes_Y[3][0][3] = -1;
    stripes_Y[3][0][4] = -1;
    stripes_Y[3][0][5] = -1;
    stripes_Y[3][1][0] = PANEL3_STRIPE1_OFFSET_Y;
    stripes_Y[3][1][1] = 0;
    stripes_Y[3][1][2] = PANEL3_STRIPE1_WIDTH;
    stripes_Y[3][1][3] = -1;
    stripes_Y[3][1][4] = -1;
    stripes_Y[3][1][5] = -1;
    stripes_Y[3][2][0] = PANEL3_STRIPE2_OFFSET_Y;
    stripes_Y[3][2][1] = 0;
    stripes_Y[3][2][2] = PANEL3_STRIPE2_WIDTH;
    stripes_Y[3][2][3] = -1;
    stripes_Y[3][2][4] = -1;
    stripes_Y[3][2][5] = -1;
    stripes_Y[3][3][0] = PANEL3_STRIPE3_OFFSET_Y;
    stripes_Y[3][3][1] = 0;
    stripes_Y[3][3][2] = PANEL3_STRIPE3_WIDTH;
    stripes_Y[3][3][3] = -1;
    stripes_Y[3][3][4] = -1;
    stripes_Y[3][3][5] = -1;

    for ( unsigned int x = 0; x < DISPLAY_HEIGHT; x++){
    	if ( x < PANEL3_STRIPE0_WIDTH){
    		offsetMatrix[3][0][x] = PANEL3_STRIPE0_OFFSET_X;
    		offsetMatrix[3][1][x] = PANEL3_STRIPE0_OFFSET_X;
     	}
    	else if ( x >= PANEL3_STRIPE0_WIDTH && x < PANEL3_STRIPE1_WIDTH + PANEL3_STRIPE0_WIDTH){
    		offsetMatrix[3][0][x] = PANEL3_STRIPE1_OFFSET_X;
    		offsetMatrix[3][1][x] = PANEL3_STRIPE1_OFFSET_X;
     	}
    	else if ( x >= PANEL3_STRIPE0_WIDTH + PANEL3_STRIPE1_WIDTH && x < PANEL3_STRIPE2_WIDTH + PANEL3_STRIPE1_WIDTH + PANEL3_STRIPE0_WIDTH){
    		offsetMatrix[3][0][x] = PANEL3_STRIPE2_OFFSET_X;
    		offsetMatrix[3][1][x] = PANEL3_STRIPE2_OFFSET_X;
    	}
    	else if ( x >= PANEL3_STRIPE0_WIDTH + PANEL3_STRIPE1_WIDTH + PANEL3_STRIPE2_WIDTH && x < DISPLAY_HEIGHT){
    		offsetMatrix[3][0][x] = PANEL3_STRIPE3_OFFSET_X;
    		offsetMatrix[3][1][x] = PANEL3_STRIPE3_OFFSET_X;
    	}
    	else{
    		offsetMatrix[3][0][x] = 0;
    		offsetMatrix[3][1][x] = 0;
    	}
    }
#endif

    prepareImage();

    // setup pins
    for (unsigned char x = 0; x < 14; x++) {
        pinMode(pins[x], OUTPUT);
        digitalWrite(pins[x], LOW);
    }
    // send screen configuration to the ICN2053 chips
    // this configuration was created by @ElectronicsInFocus https://www.youtube.com/watch?v=nhCGgTd7OHg
    // also the original C++ code this Arduino version is based on was created by him
    // it is unknown to me what this configuration does, there is no information about
    // it whatsoever on the internet (not that I could find)
    // if someone has a document describing the configuration registers please send it to me!
    sendLatch(14); // Pre-active command
    sendLatch(12); // Enable all output channels
    sendLatch(3); // Vertical sync
    sendLatch(14); // Pre-active command
    sendConfiguration(0b0001111101110000, 4); // Write config register 1 (4 latches)
    sendLatch(14); // Pre-active command
    sendConfiguration(0xffff, 6); // Write config register 2 (6 latches)
    sendLatch(14); // Pre-active command
    sendConfiguration(0b0100000011110011, 8); // Write config register 3 (8 latches)
    sendLatch(14); // Pre-active command
    sendConfiguration(0x0000, 10); // Write config register 4 (10 latches)
    sendLatch(14); // Pre-active command
    sendConfiguration(0x0000, 2); // Write debug register (2 latches)

    activeScreenBuffer = imageScreenBuffer;

    timer = timerBegin(0, 80, true);
    timerAttachInterrupt(timer, &onTimer, true);
    timerAlarmWrite(timer, 3000, true);
    timerAlarmEnable(timer);

    // initialize the refresh and data "acquisition" tasks to run on separate CPU cores
    // this is an ESP-IDF feature to run tasks (endless loops) on different cores
    // callback, name, stack size, null, priority 3-0 (0 lowest), null, core (0 or 1)
    xTaskCreatePinnedToCore(refreshTask, "refreshTask", 2048, NULL, 3, NULL, 0);
    xTaskCreatePinnedToCore(dataTask, "dataTask", 2048, NULL, 1, NULL, 1);
    xTaskCreatePinnedToCore(protocolTask, "protocolTask", 2048, NULL, 1, NULL, 1);
    
}

void loop() {}

/*
 * tasks
 */
void refreshTask(void *pvParameters) {
    (void) pvParameters;

    while(1) {
        LedWallRefresh();
        vTaskDelay(1); // call ESP-IDF command vTaskDelay to avoid watchdog restarting CPU
    }
}


/////////////////////////////////////////////////////////////////////////////

// Functions from protocol

void setBufferPixel(int x, int y, int r, int g, int b){
    unsigned char *imageBuffer = screenBuffer[imageScreenBuffer];
    int posX,posY;
    return;

    cacheWrite(imageBuffer,posX,posY,r,g,b);
  // x: 0 - DISPLAY_WIDTH -1
  // y: 0 - DISPLAY_HEIGHT -1
  // r,g,b: 0 - 255
  
  
  
}
void setBrighness(int factor){

  // factors: 1 2 3
  // clear screen
}

void hard_restart() {
	esp_task_wdt_init(1,true);
	esp_task_wdt_add(NULL);
	while(true);
}
/////////////////////////////////////////////////////////////////////////////

void dataTask(void *pvParameters) {
    (void) pvParameters;

    // start time measurement
//    unsigned long start = micros();
//    unsigned long time;
//    bool first =  false;
//    unsigned int index=0,index1=0,index2=0,index0=0;
//    Serial.begin(115200);
//    while (1){};
    while (1) {        // calculate time delayed by effect generation, set delay to reach fixed 30 fps
//    	Serial.println("A");
//    	vTaskDelay(5 / portTICK_PERIOD_MS);  // 5ms delay to allow other background tasks to do something
//        time = 28333 - (micros() - start);
//        if(time < 28333) delayMicroseconds(time);
//        time = 2000 - (micros() - start);
//        if(time < 2000) delayMicroseconds(time);
//        start = micros();

    	if ( ! timertick)
    		continue;
    	timertick = false;
//int stripes_Y[PANELS][STRIPES][8]; // beginY , endY, width, id, start, stop, current offset, roll counter

        offsetOK = false;

		for ( unsigned short k = 0; k < STRIPES; k++){
			if ( stripes_Y[PANEL_NR][k][4] == -1 )// not started
				continue;
			stripes_Y[PANEL_NR][k][7]++; // roll counter
			if (stripes_Y[PANEL_NR][k][7] == stripes_Y[PANEL_NR][k][4]){
				stripes_Y[PANEL_NR][k][7] = 0; // counter = 0
				stripes_Y[PANEL_NR][k][6]++;   // increase offset
				if (stripes_Y[PANEL_NR][k][6]  > IMAGE_WIDTH -1)
					stripes_Y[PANEL_NR][k][6] = 0;   // start over
// fille offset matrix
				int startY = stripes_Y[PANEL_NR][k][0];
				if ( startY < 0)
					startY = 0;
//				Serial.println(stripes_Y[PANEL_NR][k][6]);
//				Serial.println(stripes_Y[PANEL_NR][k][0] + stripes_Y[PANEL_NR][k][2]);

//			    for ( int i = startY; i < stripes_Y[PANEL_NR][k][0] + stripes_Y[PANEL_NR][k][2] ; i++){
				for ( int i = startY; i < startY + stripes_Y[PANEL_NR][k][2] ; i++){
					offsetMatrix[PANEL_NR][1][i] = stripes_Y[PANEL_NR][k][6];
				}
//			   Serial.println("OK");
			}
			if (stripes_Y[PANEL_NR][k][5] > -1 && stripes_Y[PANEL_NR][k][5] == stripes_Y[PANEL_NR][k][6]){ // stop
				stripes_Y[PANEL_NR][k][4] = -1; // start = -1
			}

		}
        offsetOK = true;

    };
}

/*
 * normal methods
 */
void sendConfiguration(unsigned int data, unsigned char latches) {
    unsigned char num = displayNumberChips;
    unsigned int dataMask;
    unsigned long zero = 0x00000000;
//    unsigned long rgbrgbMask = 0x000FC000; // all 6 RGB pins high
    unsigned long rgbrgbMask = MASK_PINS; // all 6 RGB pins high

    latches = 16 - latches;

    // send config data to all chips involved (4 per 64 pixel), then latch for 1 clock
    while(num--) {
        for(unsigned char x = 0; x < 16; x++) {
            dataMask = 0x8000 >> x;

            digitalWriteEvenFaster(data & dataMask ? rgbrgbMask : zero, rgbrgbMask);
            if(num == 0 && x == latches) digitalWriteFast(PIN_LE, 1);
            sendClock();
        }

        digitalWriteFast(PIN_LE, 0);
    }
}
//unsigned short stripe_actions[PANELS*4][2];
//int stripes_Y[PANELS][STRIPES][8]; // beginY , endY, width, id, start, stop, current offset, roll counter
void startStripe(unsigned short stripe_id, unsigned int speed){ // stripes 0...7, speed 1...10
	short stripe = -1;
	for ( unsigned int i = 0; i < STRIPES; i++){
		if (stripes_Y[PANEL_NR][i][3] == stripe_id){
			stripe =  i;
			break;
		}
	}
	if ( stripe == -1)
		return;
	Serial.print("STRIPE_START: ");
	Serial.println(stripe_id + 1);
	stripes_Y[PANEL_NR][stripe][7] = 0; // roll counter
	stripes_Y[PANEL_NR][stripe][5] = -1; // stop
//	Serial.println(stripe);
/*
	switch (stripe){
		case 0: //
			stripes_Y[PANEL_NR][stripe][4] = 1; // start with speed speed
			break;
		case 1: //
			stripes_Y[PANEL_NR][stripe][4] = 1; // start with speed speed
			break;
		case 2: //
			stripes_Y[PANEL_NR][stripe][4] = 1; // start with speed speed
			break;
		case 3:	 //
			stripes_Y[PANEL_NR][stripe][4] = 11; // start with speed speed
			break;
	}
*/
	stripes_Y[PANEL_NR][stripe][4] = 11 - speed; // start with speed

}

void stopStripe(int stripe_id,int number){
		short stripe = -1;
//		Serial.println("stopOK");
		for ( unsigned int i = 0; i < STRIPES; i++){
			if (stripes_Y[PANEL_NR][i][3] == stripe_id){
				stripe =  i;
				break;
			}
		}
		if ( stripe == -1)
			return;
		Serial.print("STRIPE_STOP: ");
		Serial.println(stripe_id + 1);
		int offset = 292 - 34 * number;
		if ( offset < 0)
			offset += IMAGE_WIDTH;
		stripes_Y[PANEL_NR][stripe][5] = offset; // stop

}


