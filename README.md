# Photo Mosaic

The goal of this project is to implement a client-side photo mosaic app.

Author: Jimmy Chen

## Prerequisites
- node >= 4.4.3 (Tested under 4.4.3)

## Running the program
From the terminal, run the following command from project root directory:
```
npm start
```

## Running the tests
The Jasmine framework is used for unit testing.
From the terminal, run the following command from project root directory:
```
npm install // install the required dev dependencies
npm test
```

## Dependencies
No dependencies are required. This app is written entirely in pure JavaScript and rendered on HTML5 Canvas.
Web Workers are used for parallel processing of image data.

## Note:
- This app uses features supported by current Chrome version - v51.0 at the time of writing. It may not work in older browsers.
