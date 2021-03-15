const fs = require('fs');
const http = require('http');
const url = require('url');
//used to create slugs (last)
const slugify = require('slugify');

const replaceTemplate = require('./modules/templateReplace');

///using readFileSYNC to save the data only once on load
const data = fs.readFileSync("./data.json", 'utf-8');
//parsing the JSON data read in an OBJ
const dataObj = JSON.parse(data);

//reading the overview/card/product html page first on load
const overview = fs.readFileSync('./templates/overview.html', 'utf-8');
const card = fs.readFileSync('./templates/card.html', 'utf-8');
const product = fs.readFileSync('./templates/product.html', 'utf-8');

const slugs = dataObj.map(item => slugify(item.productName, { lower: true }));
console.log(slugs)

//SERVER//
const server = http.createServer((req, res) => {
    const { query, pathname } = url.parse(req.url, true)

    //OVERVIEW PAGE
    if(pathname === '/' || pathname === '/overview') {
        res.writeHead(200, { 'Content-type': 'text/html'})
        // loop thru dataObj to replace the HTML placeholders w/ our data
        const cardsHtml = dataObj.map(item => {
            return replaceTemplate(card, item)
        }).join('');

        let output = overview.replace('{%PRODUCT_CARDS%}', cardsHtml)
        res.end(output);

    //PRODUCT PAGE
    } else if (pathname === '/product') {
        const foundProduct = dataObj.find(item => item.id === parseInt(query.id));
        const productHtml = replaceTemplate(product, foundProduct)
        res.end(productHtml)

    //API
    } else if (pathname === '/api'){
    // writeHead will apply an HTTP status code and obj of content type
       res.writeHead(200, { 'Content-type': 'application/json'});
       res.end(data);
    }

    //NOT FOUND
    else {
        res.writeHead(404, {
            'content-type': 'text/html'
        })
        res.end('<h1>page not found</h1>')
    }
});

// listens to arg1: port, arg2: localhost standard IP address
// arg3: callback function as soon as the server starts listening
server.listen(8000, '127.0.0.1', () => {
    console.log('listening to requests on port 8000')
});