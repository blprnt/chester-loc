var currentObject;
var colors;
var sectionElement;
var titleElement;
var countElement;
var clickerElement;

var w = 10;
var totalWidth = 1920 * 4;
var stack = 0;
var stacking = false;
var speed = 10;

var palette;
var blocks = [];
var focusBlocks = [];

var currentDisplay;

var scr = 0;
var tscr = 0;
var fi = 0;
var fstack = 0;
var stickpos = 0;
var sceneCount = 0;
var sceneMax = 20;

var SUNRISE;
var SUNSET;

var timeQ;

var currentScene;

//Data URLs
var vizMaterials = {
  url: "/data/colorsVisualMaterials_all.json",
  name: "Visuals",
};

var maps = {
  url: "/data/colorsMaps_all.json",
  name: "Maps",
};

var music = {
  url: "/data/colorsMusic_all.json",
  name: "Music",
};

var usLit = {
  url: "/data/colorsBooks_all.json",
  name: "US Literature",
};

var sunrise = {
  url: "/data/rise2.json",
  name: "Sunrise",
};

var sunset = {
  url: "/data/set3.json",
  name: "Sunset",
};

var sections = [vizMaterials, usLit, music, maps, sunrise, sunset];
var sectionMap = {};

function setup() {
  //Sunrise/Sunset
  setTimes();

  //HTML elements
  container = createDiv("");
  container.class("contain");

  palette = createDiv("");
  palette.parent(container);
  palette.class("palette");

  countElement = createDiv("1000 items");
  countElement.class("count");

  //Load a dataset
  loadColors(0);
}

function draw() {
  //timer
  var now = new Date();
  var timeStr = now.getHours() + ":" + nf(now.getMinutes(), 2);
  //if (frameCount % 100 == 0) console.log(timeStr + ":" + timeQ[0].time);
  if (timeStr == timeQ[0].time) {
    timeQ[0].trigger();
    timeQ.push(timeQ.shift());
    console.log(timeQ);
  }

  if (stacking) {
    for (var i = 0; i < speed; i++) {
      if (stack < colors.length) {
        addColorBlock(stack);
        stack++;
        if (speed < 50) speed++;
      }
    }
    countElement.html(sections[currentScene].name + ": " + stack + " items");
    if (stack == colors.length) {
      advance(true);
      stacking = false;
    }
  }
}

function setTimes() {
  //Set sunrise and sunset times
  var times = SunCalc.getTimes(
    new Date(),
    40.10129566841417,
    -88.22205461585865
  );

  // format sunrise time from the Date object
  SUNRISE = times.sunrise.getHours() + ":" + times.sunrise.getMinutes();
  SUNSET = times.sunset.getHours() + ":" + times.sunset.getMinutes();

  console.log(SUNRISE + ":" + SUNSET);

  //Timing
  timeQ = [
    {
      time: SUNRISE,
      trigger: sunRise,
    },
    {
      time: SUNSET,
      trigger: sunSet,
    },
    {
      time: "0:01",
      trigger: setTimes,
    },
  ];

  //Spin to the correct order
  var now = new Date();
  //Get a fractional hour - ie. 12.5
  var hf = now.getHours() + now.getMinutes() / 60;

  while (
    hf >
    parseFloat(timeQ[0].time.split(":")[0]) +
      parseFloat(timeQ[0].time.split(":")[1]) / 60
  ) {
    timeQ.push(timeQ.shift());
  }

  console.log("-----------SPUN TO: " + timeQ[0].time);
}

function advance(force) {
  console.log("ADVANCE");

  if (sceneCount == sceneMax) {
    sceneCount = 0;
    stacking = true;
    stack = 0;
    fstack = 0;
    blocks = [];
    loadColors(floor(random(4)));
    palette.html("");
  } else if (currentScene < 4) {
    
    var dice = force == true ? 0 : random(100);

    if (dice < 40 || fi >= blocks.length - 1) {
      console.log("------------RANDOM");
      focusRandomBlock();
      fstack = 0;
    } else if (dice < 80) {
      console.log("------------NEXT");
      focusNextBlock();
      if (fstack <= 2) fstack++;
    } else if (dice < 90) {
      console.log("------------RAIN");
      makeItRain();
      fstack = 0;
    } else {
      console.log("------------CLOSE");
      closeAllBlocks();
      fstack = 0;
    }
    sceneCount++;
  } else {
    sunRiseSet();
  }
}

function sunRise() {
  loadColors(4);
}

function sunSet() {
  loadColors(5);
}

function sunRiseSet() {
  console.log("RISE/SET");
  var sstack = colors.length * w;
  var stime = 3.5 * 60 * 1000;

  anime({
    targets: ".swing",
    opacity: 1,
    easing: "linear",
    delay: 1000,
    duration: 10000,
  });

  if (currentScene == 4) {
    //SUNRISE

    anime({
      targets: ".swing",
      top: 1080 - sstack + "px",
      easing: "linear",
      delay: 1000,
      duration: stime,
      complete: function(anim) {
        palette.removeClass("swing");
        palette.position(0, 0);
        loadColors(floor(random(4)));
      },
    });
  }

  if (currentScene == 5) {
    //SUNSET
    palette.position(palette.position().x, 1080 - sstack);
    //colors = colors.reverse();

    anime({
      targets: ".swing",
      top: 0 + "px",
      easing: "linear",
      delay: 1000,
      duration: stime,
      complete: function(anim) {
        palette.removeClass("swing");
        palette.position(0, 0);
        loadColors(floor(random(4)));
      },
    });
  }

  var rc = 0;
  console.log("sunrain");

  var titles = {};
  //modified rain
  for (var i = 0; i < blocks.length; i++) {
    blocks[i].addClass("rainMaker");
    titles[blocks[i].id()] = colors[blocks[i].cIndex].Title.join(" ");
    rc++;
  }

  //console.log(titles);

  //add text
  var rainMakers = selectAll(".rainMaker");
  for (var i = 0; i < rainMakers.length; i++) {
    try {
      var b = rainMakers[i];
      var t = titles[b.id()];
      var ph = createDiv("");
      ph.class("sunTextHolder");
      ph.parent(b);

      var p = createElement("p", t);
      p.parent(ph);
      p.class("sunText");
      p.position(random(7680));
    } catch (e) {
      console.log(e);
    }
  }
}

function makeItRain() {
  //clear any titled blocks
  for (var i = 0; i < blocks.length; i++) {
    blocks[i].html("");
  }

  var rw = 20;
  var rainChance = 0.5;
  var edge = totalWidth / rw;
  //pick an index with enough space
  var si = floor(random(blocks.length - edge));
  //move to that block

  anime({
    targets: ".palette",
    left: -blocks[si].position().x + "px",
    duration: 3000,
    easing: "cubicBezier(.5, .05, .1, .3)",
  });

  //open the rest of the blocks
  for (var i = 0; i < edge; i++) {
    blocks[si + i].addClass("rainMaker");
  }
  anime({
    targets: ".rainMaker",
    width: rw,
    delay: anime.stagger(10, { start: 3000 }),
    duration: 100,
    easing: "easeOutCubic",
  });
  //add text
  var rainMakers = selectAll(".rainMaker");
  for (var i = 0; i < min(1000, rainMakers.length); i++) {
    if (random(1) > rainChance) {
      try {
        var b = blocks[si + i];
        var t = colors[b.cIndex].Title.join(" ");
        var ph = createDiv("");
        ph.class("rainTextHolder");
        ph.parent(b);

        var p = createElement("p", t);
        p.parent(ph);
        p.class("rainText");
      } catch (e) {}
    }
  }
  //animate
  anime({
    targets: ".rainText",
    left: "0px",
    delay: anime.stagger(100, { start: 5000 }),
    duration: 1000,
    easing: "easeOutCubic",
  });

  anime({
    targets: ".rainTextHolder",
    top: "-1080px",
    opacity: 0,
    delay: anime.stagger(50, { start: 35000 }),
    duration: 500,
    easing: "easeOutCubic",
  });

  anime({
    targets: null,
    duration: 45000,
    complete: endRain,
  });
}

function endRain() {
  anime({
    targets: ".rainMaker",
    width: w,
    delay: anime.stagger(5),
    duration: 20,
    easing: "easeOutCubic",
  });

  anime({
    targets: null,
    duration: 9600,
    complete: function(anim) {
      for (var i = 0; i < blocks.length; i++) {
        blocks[i].removeClass("rainMaker");
        blocks[i].html("");
      }
      advance();
    },
  });
}

function focusNextBlock() {
  focusBlock(fi + 1);
}

function focusRandomBlock() {
  var i = floor(random(blocks.length));
  focusBlock(i);
}

function closeAllBlocks() {
  anime({
    targets: ".palette",
    left: 0 + "px",
    duration: 5000,
    easing: "cubicBezier(.5, .05, .1, .3)",
    complete: function(anim) {
      advance(true);
    },
  });

  anime({
    targets: ".openBlock",
    width: w,
    delay: anime.stagger(100),
    duration: 1000,
    easing: "easeOutCubic",
  });

  anime({
    targets: ".titleBlock",
    opacity: 0,
    delay: anime.stagger(100),
  });
}

function openBlock(b, off) {
  var t = display(b.cIndex);
  b.addClass("openBlock");

  anime({
    targets: "#" + b.id(),
    width: 1920,
    delay: off - 500,
    duration: 1500,
    easing: "easeOutCubic",
  });

  anime({
    targets: "#" + t.id(),
    opacity: 1,
    easing: "linear",
    delay: off + 100,
    duration: 500,
  });

  anime({
    targets: "#" + b.id(),
    opacity: 1,
    easing: "linear",
    delay: off + 5000,
    duration: 500,
    complete: advance,
  });
}

function closeBlock(b) {
  var t = display(b);
}

function focusBlock(i, noOpen) {
  //get block
  var b = blocks[i];
  //set focus index
  fi = i;

  //get screen to place in
  var sc = floor(map(i, 0, blocks.length, 0, 4));

  //move to block
  var cpos = palette.position().x;
  var targ = -b.position().x + (sc + fstack) * 1920;
  var offset = targ - cpos;
  var dur = min(8000, 500 + abs(offset));
  anime({
    targets: ".palette",
    left: targ + "px",
    duration: dur,
    easing: "cubicBezier(.5, .05, .1, .3)",
  });

  var openCount = 0;
  if (!noOpen) openBlock(b, dur);

  return dur;
}

function keyTyped() {
  if (key == "a") advance();
  if (key == "b") closeAllBlocks();
  if (key == "f") makeItRain();
  if (key == "s") sunSet();
  if (key == "r") sunRise();

}

function display(_i) {
  var tElement = createElement("p", "");
  tElement.class("titleBlock");
  tElement.id("title" + _i);
  tElement.parent(blocks[_i]);
  tElement.style("opacity", 0);
  tElement.html(_i + ": " + colors[_i].Title.join(" "));

  return tElement;
}

function addColorBlock(i) {
  var d = createDiv(" ");
  blocks.push(d);
  d.parent(palette);
  d.id("block" + i);
  d.class("colorblock");

  d.style("width", w + "px");
  d.style("height", "100%");

  var fc = fuzzColor(colors[i]);
  d.style("background", fc);
  d.cIndex = i;

  for (var j = 0; j < colors[i].Title.length; j++) {
    colors[i].Title[j] = colors[i].Title[j].replace("/", "");
  }
}

function fuzzColor(_c) {
  colorMode(HSB, 100);

  var fc = color(_c.hex);
  var f = 10;
  var nc = color(
    hue(fc) + random(-f, f),
    saturation(fc) + random(-f, f),
    brightness(fc) + random(-f, f)
  );

  return fc;
}

function clearBlocks() {
  for (var i = 0; i < blocks.length; i++) {
    blocks[i].remove();
  }
  blocks = [];
}

function loadColors(_i) {
  var _o = sections[_i];
  currentScene = _i;
  if (_i > 3) {
    palette.addClass("swing");
    w = 20;
  } else {
    w = 10;
  }
  clearBlocks();
  stack = 0;
  stacking = false;
  //Set the requested object to be the current object - used later to set the title, etc.
  currentObject = _o;
  //Load the JSON file, use a callback to know then the data is loaded
  var ja = loadJSON(_o.url, onColorsLoaded);
}

function onColorsLoaded(_j) {
  colors = _j;
  stacking = true;
  //Data is loaded!
  console.log("colors loaded.");
  //palette.size(colors.length * w);
}