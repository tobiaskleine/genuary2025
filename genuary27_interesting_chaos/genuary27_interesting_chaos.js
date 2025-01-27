
const scaleX = 300;
const scaleY = 200;
const x0 = 500;
const y0 = 200;
let o = -0.3;
let up = true;

function f(x, o) {
  return x*x-(o);
}

function transformVector(v) {
  return createVector(x0 + v.x * scaleX, y0 - v.y*scaleY);
}

function setup() {
  createCanvas(800, 600);
  colorMode(HSL);
}

let fr = 60;

function draw() {
  background(0,0,0);
  let v_last = undefined;
  
    
  const veloO = 0.005;
  if (up) {
    if (o < 2) {
      o += veloO;
    } else {
      //o -= veloO;
      //up = !up;
    }
  } else {
    if (o > 0) {
      o -= veloO;
    } else {
      o += veloO;
      up = !up;
    }
  }
  //o = 2* mouseY / height;
  frameRate(fr);
  if (o > 1) {
    fr = fr - 0.4;
    console.log(fr, o);
  }
  if (fr < 2) {
    fr = 0;
  }


  // iteration steps
  const t = 0.99;
  v_last = createVector(t, f(t, o));
  strokeWeight(2);
  stroke(0,0,20);
  for (let i = 0; i < 200; i++) {
    let v = createVector(v_last.y, f(v_last.y, o));

    const p_last = transformVector(v_last);
    const p = transformVector(v);
    line(p_last.x, p_last.y, p_last.x, p.y);
    line(p_last.x, p.y, p.x, p.y);
    fill(i*1.67, 90, 70);
    v_last = v;   
  }
  
  // parabolic function
  v_last = undefined;
  stroke(0,0,100);
  strokeWeight(4);
  for(let x = -15; x < 15; x += 0.02) {
    const v = createVector(x, f(x, o));
    if (v_last) {
      const p_last = transformVector(v_last);
      const p = transformVector(v);
      line(p_last.x, p_last.y, p.x, p.y);
    }
    v_last = v;    
  }

  // colorful rectangles
  v_last = createVector(t, f(t, o));
  const halfLength = 30;
  strokeWeight(2);
  stroke(0,0,0);
  for (let i = 0; i < 100; i++) {
    let v = createVector(v_last.y, f(v_last.y, o));

    const p_last = transformVector(v_last);
    const p = transformVector(v);
    fill(i*1.67, 90, 70);
    rect(p_last.x - halfLength, p.y - halfLength, 2* halfLength, 2* halfLength + p_last.y * (i % 3 == 0 ? 1 : -1))
    v_last = v;   
  }
  
  // function text
  fill(0,0,255);
  stroke(0,0,0);
  strokeWeight(8);
  textSize(32);
  //text(`f(x) = x² ${o<0 ? '+' : '-'} ${Math.abs(o).toLocaleString('en-US', {minimumFractionDigits: 3})}`, 50, height-50);
}
