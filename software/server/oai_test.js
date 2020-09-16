


const oaipmh_lib = require('oai-pmh');

async function main () {
  const oaiPmh = new oaipmh_lib.OaiPmh('http://data.digar.ee:8080/repox/OAIHandler?verb=ListRecords&set=journal&metadataPrefix=edm')
  const identifierIterator = oaiPmh.listIdentifiers()
  for await (const identifier of identifierIterator) {
    console.log(identifier.identifier)
  }
}

main().catch(console.error)

http://data.digar.ee:8080/repox/OAIHandler?verb=GetRecord&identifier=oai:data.digar.ee.journal:nlib-digar:101698&set=journal&metadataPrefix=edm


https://dea.digar.ee/cgi-bin/dea?a=is&type=pagetileimage&oid=rahvasona19380923.1.1&width=256&crop=0,0,256,256

kuidas saada lehtede arvu openarchvie kaudu?


originaal resolutsioon

vastavus ocr-text

https://dea.digar.ee/cgi-bin/dea?a=da&command=getSectionText&d=postimeesew18860329.2.1&srpos=&f=XML&e=-------et-25--1--txt-txIN%7ctxTI%7ctxAU%7ctxTA-------------

1997 - trykifailid




https://dea.digar.ee/cgi-bin/dea?a=d&d=ukslteataja193w71001.2.6&dliv=none&e=-------et-25--1--txt-txIN%7ctxTI%7ctxAU%7ctxTA-------------