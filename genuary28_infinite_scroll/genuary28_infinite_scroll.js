function mulberry32(a) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

function getObjectsByFrame(y0, height0, config) {
  const rectHeight = config.rectHeight;
  const rectGridY = config.rectGridY;
  const firstY = floor(y0 / rectGridY)*rectGridY - rectGridY;
  let objects = [];
  for (let y = firstY; y <= y0 + height0; y += rectGridY) {
    const rnd = mulberry32(round(y));
    const x = rnd() * 400 + 40*config.layer-50;
    objects.push({
      x,
      y,
      w: config.rectWidth,
      h: rectHeight,
      col: color(rnd() * 360, 50, 70-config.layer*4, 0.3)
    });
  }
  return objects;
}


function setup() {
  createCanvas(800, 600);
  colorMode(HSL);

}

let y_offset = 0;

function draw() {
  background(0,0,20);
  
  for (let layer = 12; layer >= 0; layer--) {
    const layer_y_offset = (layer*0.5 + 1) * y_offset;
    
    const objectsConf = {
      layer,
      rectGridY: 200 - layer*10,
      rectHeight: 140 - layer*10,
      rectWidth: 100 - layer*7,
      rectX: 200 + layer * 60,
    };
  
    const objs = getObjectsByFrame(layer_y_offset, height, objectsConf);
    translate(0, -layer_y_offset);
    objs.forEach((obj) => {
      fill(obj.col);
      noStroke();
      for (let blurOff = 10; blurOff > 0; blurOff -= 2.5) {
        rect (obj.x-blurOff, obj.y-blurOff, obj.w+blurOff*2, obj.h+blurOff*2, blurOff, blurOff, blurOff, blurOff);
      }
      stroke(0);
      strokeWeight(4 - layer /4);
      rect (obj.x, obj.y, obj.w, obj.h);
    });
    resetMatrix();
  }
  
  y_offset += 1;
}
