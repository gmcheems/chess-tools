# chess-tools

## Purpose

The goal of of this project is to provide useful functionality for those seeking to integrate various chess related datasets.  Currently it supports opening books in ABK,Polyglot and, CTG Format. It also provides the ability to categorize openings using a PGN formatted database.  In future releases I hope to support more data sources and formats.  

## Installation

    npm install chess-tools

## Usage

```
 const ChessTools = require('chess-tools');
```
## Organization

### ChessTools
#### OpeningBooks
Allows for reading opening books in various formats with a generic interface.
##### General Interface
```
    const OpeningBook = ChessTools.OpeningBook.<type>
    const book = new OpeningBook();
    const fen = "rnbqkbnr/pppp1ppp/8/4p3/8/8/PPPPPPPP/RNBQKBNR w KQkq";
    stream = getFileOrBytesStreamSomehow();
    book.load_book(stream);
    book.on("loaded", ()=> {
        let entries = book.find(fen);
        for (let entry of entries) {
            //See entry.js for each module to manage data.
        }
    });
```
##### Supported Formats:
* CTG
* Polyglot
* Arena

#### Other Data Formnats
##### EPD
Allows for loading and parsing EPD files into individual entries organized by position.

```
    const EPD = ChessTools.EPD;
    const epd = new EPD();
    const fen =  '3r1rk1/1p3pnp/p3pBp1/1qPpP3/1P1P2R1/P2Q3R/6PP/6K1 w - -'
    stream = getFileOrBytesStreamSomehow();
    epd.load_stream(stream);
    epd.on("loaded"=>{ 
      let epdEntry = epd.find(fen);
      console.log("Best move is", epd.best_move);
      console.log("Comments are", epd.comments);
      //see epd/entry.js for more details.
    });
```
##### ECO
Allows for openings to be classified based on a pgn string.
```
    const ECO = ChessTools.ECO;
    const eco = new ECO();
    let pgn = "1. e4 e5 2. Nf3 Nc6 3. Bc4 Nf6 4. d3";
    eco.on("loaded", ()=>{ 
        let opening = eco.find(pgn);
        console.log("ECO CODE", opening.eco_code);
        console.log("NAME", opening.name);
        console.log("VARIATION", opening.variation);
        //See entry.js in the eco folder for more details.
    });
    eco.load_default(); //loads a default opening database (see sources below)
    //alternatively eco.load(stream) for a stream of a standard pgn file of openings.
```



## Future Plans / Roadmap

Eventually I want to expand to support various tablebase and game databases. I also want to simplify the interface to send these datasets to chess engines via UCI.  

## References
Note: Sample Files are believed to be in the public domain or licensed under GPL.  Sources are provided below.

* Chess Programming Wiki
  https://chessprogramming.wikispaces.com/


* ABK Format 
  https://chessprogramming.wikispaces.com/ABK

* Polyglot Format
  Sample File https://github.com/michaeldv/donna_opening_books/raw/master/gm2001.bin


* CTG Format
  Forum post .. http://rybkaforum.net/cgi-bin/rybkaforum/topic_show.pl?tid=2319

* CTGReader
  https://github.com/sshivaji/ctgreader/
  Sample file http://americanfoot.free.fr/echecs/ctg-thematique.htm

* ECO Codes
  ftp://ftp.cs.kent.ac.uk/pub/djb/pgn-extract/eco.pgn
