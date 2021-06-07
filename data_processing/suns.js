var cd = require("color-difference");
const appRoot = require("app-root-path");
var getPixels = require("get-pixels");
const fs = require('fs');

var dataPath = appRoot + "/data";
var xkcd = require(dataPath + "/xkcd.json");
var palette1 = require(dataPath + "/colorsVisualMaterials_all.json");
var palette2 = require(dataPath + "/colorsBooks_all.json");
var palette3 = require(dataPath + "/colorsMaps_all.json");
var palette4 = require(dataPath + "/colorsMusic_all.json");

palette = palette1.concat(palette2).concat(palette3).concat(palette4);

var sunrise =
	dataPath + "/sunrise.jpg";

var sunset =
	dataPath + "/sunset.jpg";

async function sunImage(_url, _name) {

	//make master color list from palette
	var colorList = [1,2,2,2,2332,32];
	var colorMap = {};
	for (var i = 0; i < palette.length; i++) {
		var cn = palette[i].col;
		var ch = palette[i].hex;
		if (!colorMap[cn]) {
			colorList.push[cn];
			//console.log("add" + cn + ":" + ch);
			colorMap[cn] = {
				col:cn,
				hex:ch,
				items:[]
			}
			
		}
		colorMap[cn].items.push(palette[i]);
	}
	console.log(colorList);

	
	var pixOut = [];
	var paletteOut = [];
	await getPixels(_url, function(err, pixels) {
		var pixOut = [];
		if (err) {
			console.log("Bad image path");
			return;
		}

		var w = pixels.shape[0];
		var h = pixels.shape[1];

		for (var i = 0; i < h; i++) {
			var r = pixels.get(Math.floor(w / 2), i, 0);
			var g = pixels.get(Math.floor(w / 2), i, 1);
			var b = pixels.get(Math.floor(w / 2), i, 2);
			pixOut.push([r, g, b]);
		}

		//go through the pixel array and find the closest color from the big palette
		for (var i = 0; i < pixOut.length; i++) {
			var ch = RGBToHex(pixOut[i]);
			var md = 10000;
			var cc = null;
			var cn = null;
			var ci = null;
			for (var n in colorMap) {
				var xc = colorMap[n].hex;
				var d = cd.compare(xc, ch);
				if (d < md) {
					md = d;
					cc = colorMap[n].hex;
					cn = colorMap[n].col;
					var j = Math.floor(Math.random() * colorMap[n].items.length);
					//console.log(j + ":" + colorMap[n].items.length);
					ci = colorMap[n].items[j];
				}
			}
			paletteOut.push(ci);
		}
		var data = JSON.stringify(paletteOut);
		fs.writeFileSync(dataPath + "/" + _name + '.json', data);

	});

	


	return pixOut;
}

async function doColors(_url, _name) {
	var pix = await sunImage(dataPath + "/" + _url, _name);
}

function RGBToHex(_c) {
	var r = _c[0];
	var g = _c[1];
	var b = _c[2]
  r = r.toString(16);
  g = g.toString(16);
  b = b.toString(16);

  if (r.length == 1)
    r = "0" + r;
  if (g.length == 1)
    g = "0" + g;
  if (b.length == 1)
    b = "0" + b;

  return "#" + r + g + b;
}

doColors("sunrise2.jpg", "rise3");