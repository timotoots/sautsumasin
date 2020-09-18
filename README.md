# Säutsumasin (News Casino)

Source code for art installation "Säutsumasin" by Timo Toots.

Just for self documentation.

# Hardware:

1x Raspberry Pi 3  
1x Wemos D1 Mini  
1x PIR
1x Slot machine handle
1x Flexible LED screen
1x Epson Thermal Printer
1x WS81XX RGB LEDs
32x LED Module 12V white

# Software

## Install packages
```
sudo apt install git minicom
sudo raspi-config
```
## Set static DNS

```
sudo nano /etc/dhcpcd.conf
```
set line
static domain_name_servers=1.1.1.1 8.8.8.8


## Install new node.js
```
sudo bash  
curl -sL https://deb.nodesource.com/setup_12.x | bash -  
sudo apt-get install -y nodejs  
node -v  

```

## Install node canvas requirements
https://github.com/Automattic/node-canvas/wiki/Installation%3A-Ubuntu-and-other-Debian-based-systems
```
sudo apt install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev 
```

## Clone this repository
```
sudo apt get install git
sudo mkdir /opt/sautsumasin
sudo chown pi:pi /opt/sautsumasin
cd /opt && git clone https://github.com/timotoots/sautsumasin.git
```



## Install Node packages
```

sudo apt-get install build-essential libudev-dev
cd /opt/sautsumasin && node server.js
```

## Install Arduino CLI
https://arduino.github.io/arduino-cli/latest/installation/

```
cd /opt/sautsumasin/arduino
curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | BINDIR=/opt/sautsumasin/arduino/ sh
./arduino-cli --config-file ./arduino-cli.yaml core update-index  
./arduino-cli --config-file ./arduino-cli.yaml core install esp32:esp32
./arduino-cli --config-file ./arduino-cli.yaml lib install "FastLED"

```


## Compile and upload Arduino code
```

/opt/sautsumasin/ledstrip_esp32/upload.sh 
```

## Test Arduino Serial
```
minicom -b 115200 -o -D /dev/ttyUSB0
```

## Test sound
```
speaker-test -c2 -twav -l7 -D plughw:0,0
```

## Run the server
```
cd /opt/sautsumasin/server && node server.js
```

## Install Wireguard from testing repo
https://www.sigmdel.ca/michel/ha/wireguard/wireguard_03_en.html
```
...
```

## Add to rc.local
```
/usr/bin/screen -dmS app /opt/sautsumasin/software/server/start.sh &
```

## Add to crontab nightly reboot
```
sudo crontab -e
0 4   *   *   *    /sbin/shutdown -r +5



```
# Credits

## Icons
receipt by Creaticca Creative Agency from the Noun Project  
Newspaper by Gonzalo Bravo from the Noun Project  
joker face by Phạm Thanh Lộc from the Noun Project


# Data

## Estonian Newspapers are collected from Digar database.


## Example URLs:

http://data.digar.ee:8080/repox/OAIHandler?verb=ListRecords&set=journal&metadataPrefix=edm

https://dea.digar.ee/cgi-bin/dea?a=d&d=aripaev20170502.2.1&st=1&f=XML

https://dea.digar.ee/cgi-bin/dea?a=d&d=postimeesew18860329.1.2&st=1&f=XML

https://dea.digar.ee/cgi-bin/dea?a=d&d=postimeesew18860329&st=1&f=XML

https://dea.digar.ee/cgi-bin/dea?a=is&type=pagetileimage&oid=rahvasona19380923.1.1&width=256&crop=0,0,256,256

https://dea.digar.ee/cgi-bin/dea?a=da&command=getSectionText&d=postimeesew18860329.2.1&srpos=&f=XML&e=-------et-25--1--txt-txIN%7ctxTI%7ctxAU%7ctxTA-------------

https://dea.digar.ee/cgi-bin/dea?a=d&d=ukslteataja19371001.2.6&dliv=none&e=-------et-25--1--txt-txIN%7ctxTI%7ctxAU%7ctxTA-------------

https://dea.digar.ee/cgi-bin/dea?a=is&oid=postimeesew18860329.1.4&type=pageimage

