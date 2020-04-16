# COVID-19 Data Browser
#### Technology Stack: NodeJS, ExpressJS, AJAX, HTML, CSS

A web application which facilitates searching through the COVID-19 kaggle corpus. The primary purpose of this project is to provide the non-data-scientists, a way to understand the documents. However, it might also be helpful in encouraging relevant research.

    - This application is written using Node.js and Express.js. It helps the users search through the articles and papers present in Kaggle's COVID-19 corpus.    
    
    - A few important features of this application:
        - On-demand document summarization
        - Keywords and Key-phrases generation
        - Searching through the documents based on keywords

A few notes on running this application:
    
    - Install all the dependencies mentioned in package.json using 'npm install <DEPENDENCY>'
    - All the data should go in the public/data/ directory
    - The entire corpus needs to be indexed in order to support searching (index files haven't been included in this repository because of their sizes)
    - Run the application using 'node app.js'. If the application fails because of insufficient Javascript Heap Memory, run the following command: node --max-old-space-size=1024 app.js
    - node --version = v12.16.1
    - npm --version = 6.14.4
