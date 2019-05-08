'use strict';
const { alert, error } = require("./lib/dialogs.js");
const { Line, Rectangle, Ellipse, Text, Color } = require("scenegraph");
const commands = require("commands");

const CSV = require("./lib/csv");
const fs = require("uxp").storage.localFileSystem;
var assets = require("assets");


const palette = [
    ["Side Panel", '#6F777B'],
    ["Side Text", '#DEE0E2'],
    ["Tasks", '#A7488C'],
    ["Personas", '#35C0BD'],
    [],
    ["Touch Points", '#2C3E50'],
    ["Pain Points", '#F15159'],
    ["Dark Text", '#4C4743']
];

const sidePanelFill = palette[0][1];
const sidePanelText = palette[1][1];
const titleText = '#ffffff';
const defaultText = palette[7][1];



var ht_row = 170;
const wd_row = 30;
const wd_full = 1920;
const wd_offset = 330;
const ht_offset = 170;

const ht = 100;
const wd = 160;
const gutter = 10;
const gutterX = 5;
const gutterY = 32;

var row_x;
var row_y;

var offsetX = 2 * wd + gutterX;
var offsetY = 110;

var fontSize = 12;
var fontHeaderSize = 18;
var fontLargeSize = 48;
var allColors;



async function createUserJourney(selection) {
    var i, j;

    const aFile = await fs.getFileForOpening({ types: ["txt", "csv"] });
    if (!aFile) {
        return;
    }

    const contents = await aFile.read();
    const arr = CSV.parse(contents);
    offsetY = 110;


    if(arr.length<6 ){
        showError('Not enough Data');
    }else if(arr.length>20 ){
        showError('Too Many Rows');
    }else{
        drawSidePanel(arr.slice(0,5), selection);

        drawJourney(arr.slice(5), selection);
    }
}


function drawJourney(arr, selection) {
    console.log(arr);
    var rows = arr.length;
    var cols;
    var text;
    var i,j;

    // draw background rows and title blocks
    var str = " ";
    for (j = 0; j < rows; j++) {
        // calculate row 'origin'
        row_x = wd_offset + gutter + wd_row;
        row_y = ht_offset + j * (ht_row + gutter);

        if (j === 2){
            ht_row = 340;
        }else{
            ht_row = 170
        }

        if (j !== 3){
            // draw row
            var rect = new Rectangle();
            rect.width = wd_full;
            rect.height = ht_row;
            rect.fill = new Color(palette[j+2][1], 0.1);
            rect.stroke = null;
            selection.insertionParent.addChild(rect);
            rect.moveInParentCoordinates(row_x, row_y );

            // draw header
            var rect = new Rectangle();
            rect.width = wd_row;
            rect.height = ht_row;
            rect.fill = new Color(palette[j+2][1]);
            rect.stroke = null;
            selection.insertionParent.addChild(rect);
            // NB x position of tile block is offset
            rect.moveInParentCoordinates(wd_offset, row_y);

            // row title text

            // add a node and rotate 270 degrees

            if (arr[j][0] !== null && arr[j][0] !== ""){
                str = String(arr[j][0]);
            }
            text = new Text();
            text.text = str;
            text.styleRanges = [{
                length: str.length,
                fill: new Color(titleText),
                fontSize: fontHeaderSize
            }];

            selection.insertionParent.addChild(text);
            text.moveInParentCoordinates(wd_offset, (ht_offset + j * (ht_row + gutter)));
        }

        if (j === 2){
            // add emotion points
            drawEmotions(arr[2], selection);
        }

        // add the text blocks
        str = " ";
        cols = arr[j].length;
        for (i = 0; i < cols; i++) {
          if (arr[j][i] !== null && i > 0 && j !== 2) {
                if (arr[j][i] !== "") {
                    var str = String(arr[j][i]); // cast to string so we can get length
                    text = new Text();
                    text.areaBox = { width: wd - gutterX * 3, height: ht };
                    text.text = str;
                    text.styleRanges = [{
                        length: str.length,
                        fill: new Color(defaultText),
                        fontSize: fontSize
                    }];

                    row_y = ht_offset + j * (ht_row + gutter) + gutter*2;
                    selection.insertionParent.addChild(text);
                    text.moveInParentCoordinates(row_x + (i - 1) * (wd + gutter) + gutter, row_y);
                }
            }
        }
    }

}


// do two loops one to set line beneath all circles
function drawEmotions(arr, selection) {
    var i, j;
    var x, y;
    var lastX = null;
    var lastY = null;
    var value;
    var len = arr.length;
    var offsetChart = (wd - gutterX * 3)/2;

    let lines = [];
    for (i = 1; i < len; i++) {
        // default value
        value = 1;
        if(arr[i]!==null){
            value = parseInt(arr[i]);
        }

        x = offsetX + offsetChart + ((i - 1) * (wd + gutterX)) + wd / 2 - wd / 5;
        y = (offsetY + 3 * (ht + gutterY)) + value * ht_row / 5;

        //add line back to previous item
        if(lastX!==null){
            const line = new Line();

            line.setStartEnd(
                x + wd/5,
                y + wd/5,
                lastX + wd/5,   // correct for anchor point of ellipse
                lastY + wd/5
            );

            line.strokeEnabled = true;
            line.strokeDashArray = [3, 10];
            line.stroke = new Color("black");
            line.strokeWidth = 3;

            lines.push(line);
            //selection.editContext.addChild(line)
            selection.insertionParent.addChild(line);
        }

        selection.items = lines;
        commands.group();

        lastX = x;
        lastY = y;
    }

    for (i = 1; i < len; i++) {
        // default value
        value = 1;
        if(arr[i]!==null){
            value = parseInt(arr[i]);
        }
        x = offsetX + offsetChart + ((i - 1) * (wd + gutterX)) + wd / 2 - wd / 5;
        y = (offsetY + (3) * (ht + gutterY)) + value * ht_row / 5;
        const circ = new Ellipse();
        circ.radiusX = 6;
        circ.radiusY = 6;
        circ.fill = new Color(defaultText);
        //circ.stroke = new Color('white');
        circ.strokeWidth = 1;

        selection.insertionParent.addChild(circ);
        circ.moveInParentCoordinates(x, y);
    }

}


function drawSidePanel(arr, selection) {
    const len = 5; // get first four rows to use as side-bar content
    const rect = new Rectangle();
    rect.width = wd * 2;
    rect.height = 1080;
    rect.fill = new Color(sidePanelFill);
    rect.stroke = null;
    rect.opacity = 1;
    selection.insertionParent.addChild(rect);
    //persona icon placeholder
    const circ = new Ellipse();
    circ.radiusX = wd / 2 - gutterX;
    circ.radiusY = wd / 2 - gutterX;
    circ.fill = null;
    circ.stroke = new Color(sidePanelText);
    circ.strokeWidth = 3;
    selection.insertionParent.addChild(circ);
    circ.moveInParentCoordinates(gutterX + wd / 2, gutterY);

    // use Persona value as page title
    var str = "Default Persona title";
    if(arr[0][1]!==null && arr[0][1]!==""){
        str = String(arr[0][1]);
    }
    var text = new Text();
    text.text = str;
    text.styleRanges = [{
        length: str.length,
        fill: new Color(defaultText),
        fontSize: fontLargeSize
    }];

    selection.insertionParent.addChild(text);
    text.moveInParentCoordinates((offsetX + gutterX), (2*gutterY + ht / 2));

    var i, j, displayFont;
    var rowLength = 0;
    for (j = 1; j < len; j++) {
        rowLength = arr[j].length;
        for (i = 0; i < rowLength; i++) {
            // TODO: loop thru items and built a bullet list
            // add as an areabox.
            // get height?
            if (arr[j][i] !== null && arr[j][i] !== "") {
                str = String(arr[j][i]);
                if (i === 0) {
                    displayFont = fontHeaderSize;
                } else {
                    displayFont = fontSize;
                }
                text = new Text();
                text.text = str;
                text.styleRanges = [{
                    length: str.length,
                    fill: new Color(sidePanelText),
                    fontSize: displayFont
                }];

                selection.insertionParent.addChild(text);
                text.moveInParentCoordinates(gutterX, offsetY - 2 * gutterX + j * (ht + gutterY) + i*16 );
            }
        }
    }

}


async function showError(header) {
    /* we'll display a dialog here */
    await error("CSV File Import Failed: " + header,
        "Failed to load the selected file. Please check the file format:",
        "* There needs to be 5 rows: for Persona, Roles, Goals, Needs and Expectations",
        "* Then there needs to be 6 rows: for Tasks, Persona, Emotion, Touch points and Pain points",
        "* See the plugin help page for more information");}



module.exports = {
    commands: {
        "createUserJourney": createUserJourney
    }
};