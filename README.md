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

## Install new node.js
```
sudo bash  
curl -sL https://deb.nodesource.com/setup_12.x | bash -  
sudo apt-get install -y nodejs  
node -v  
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
cd /opt/sautsumasin && node server.js
```


## Run the server
```
cd /opt/sautsumasin/server && node server.js
```


## Add to rc.local
```
su pi -c  '/opt/sautsumasin/startup.sh  &'
```

## Add to crontab
```
sudo crontab -e
0 4   *   *   *    /sbin/shutdown -r +5
```


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

