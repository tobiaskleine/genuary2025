class MultiLine {
  constructor(points) {
    this.points = points;
  }

  get length() {
    let lSum = 0;
    let lastPt;
    this.points.forEach((pt, inx) => {
      if (inx > 0) {
        lSum += pt.dist(lastPt);
      }
      lastPt = pt;
    }
    );
    if (lastPt === undefined) {
      return undefined;
    }
    return lSum;
  }

  getInterpolatedPoint(targetPercentage) {
    const totalLength = this.length;
    let lengthSum = 0.0;
    let lastPt;
    let interpolatedPoint;
    for (let inx = 0; inx < this.points.length; inx++) {
      const pt = this.points[inx];
      if (inx > 0) {
        const segmentLength = pt.dist(lastPt);
        if (lengthSum + segmentLength >= targetPercentage * totalLength) {
          const startSegmentPercentage = lengthSum / totalLength;
          const endSegmentPercentage = (lengthSum + segmentLength) / totalLength;
          const percentageInSegment = (targetPercentage - startSegmentPercentage) / (endSegmentPercentage - startSegmentPercentage);
          return lastPt.copy().add( pt.copy().sub(lastPt).mult(percentageInSegment));
        }
        lengthSum = lengthSum + segmentLength;
      }
      lastPt = pt;
    }
  }


  draw() {
    let plast;
    this.points.forEach((pos) => {
      if (plast !== undefined) {
        line(plast.x, plast.y, pos.x, pos.y);
      }
      plast = pos;
    }
    );
  }
}

class Leaf {
  constructor(start_point, config) {
    if (!config) {
      config = {};
    }
    this.config = {};
    this.config.start_point = start_point;
    this.config.main_length = config.main_length || 100;
    this.config.main_direction = config.main_direction || 0;
    this.config.main_angle = config.main_angle || PI*0.2;

    this.config.segment_count = config.segment_count || 10;
    this.config.segment_length = config.segment_length || 10;
    
    this.config.start_side_length = config.start_side_length || 5;
    //this.config.max_side_length = config.max_side_length || 50; // requires qubic equation solution
    
    this.config.max_side_length_percentage = config.max_side_length_percentage || 0.55;
    
    this.config.start_sides_percentage = config.start_sides_percentage || 0.17;
    this.config.end_sides_percentage = config.end_sides_percentage || 0.99;
    this.config.side_branch_count = config.side_branch_count || 5;
    
    this.config.paper_color = config.paper_color || color(30, 55, 71);
    this.config.branch_color = config.branch_color || color(30, 49, 51);
    
    this.config.paper_radius = config.paper_radius || 15;
    this.updateLeaf();
  }
  
  updateLeaf() {
    const start_point = this.config.start_point;
    const main_direction = this.config.main_direction;
    const main_length = this.config.main_length;
    const main_angle = this.config.main_angle;
    const start_sides_percentage = this.config.start_sides_percentage;
    const end_sides_percentage = this.config.end_sides_percentage;
    const side_branch_count = this.config.side_branch_count;
    const start_side_length = this.config.start_side_length;
    const max_side_length_percentage = this.config.max_side_length_percentage;
    
    this.main_branch = createArcMultiLine(start_point, main_direction, main_length, main_angle, 20);
    this.side_branches = []
    const side_step_size = (end_sides_percentage - start_sides_percentage) / side_branch_count * 0.999;
    for (let t = start_sides_percentage; t <= end_sides_percentage; t += side_step_size) {
      const a = start_side_length / ( 
        start_sides_percentage * start_sides_percentage 
        - 2 * max_side_length_percentage * start_sides_percentage
        - end_sides_percentage * end_sides_percentage 
        + 2 * end_sides_percentage * max_side_length_percentage
      );
      const b = -2 * a * max_side_length_percentage;
      const c = -a * end_sides_percentage * end_sides_percentage + 2 * a * end_sides_percentage * max_side_length_percentage;
      const side_length = a * t * t + b * t + c;
      const sb0 = this.main_branch.getInterpolatedPoint(t);
      this.side_branches.push(createArcMultiLine(sb0, main_direction + t * main_angle  + 0.8*PI/2, side_length, 0.25*main_angle, 10));
      this.side_branches.push(createArcMultiLine(sb0, main_direction + t * main_angle - 0.8*PI/2, side_length, -0.25*main_angle, 10));
    }
  }
    
  getTipInfo() {
    return {
      tip_position: this.main_branch.getInterpolatedPoint(1),
      tip_angle: this.config.main_direction + this.config.main_angle,
      tip_direction: p5.Vector.fromAngle(this.config.main_direction + this.config.main_angle),
      mid_position: this.main_branch.getInterpolatedPoint(0.5),
      mid_direction: p5.Vector.fromAngle(this.config.main_direction + this.config.main_angle * 0.5),
    }
  }

  draw() {
    const paper_radius = this.config.paper_radius;
    const paper_color = this.config.paper_color;
    const branch_color = this.config.branch_color;
    noStroke();
    fill(paper_color);
    this.side_branches.forEach((sb) => {
      for (let z = 0.1; z < 1; z+=0.1) {
        const sbp = sb.getInterpolatedPoint(z);
        circle(sbp.x, sbp.y, paper_radius);
      }
    });
    const main_branch_tip = this.main_branch.getInterpolatedPoint(1);
    circle(main_branch_tip.x, main_branch_tip.y, paper_radius);
    strokeWeight(2);
    stroke(branch_color);
    this.main_branch.draw();
    this.side_branches.forEach((sb) => {
      sb.draw();
    });
  }
}

function createArcMultiLine(start_point, start_angle, total_length, angle, segments_count) {
    let multi_line = new MultiLine([start_point]);
    let bp = start_point;
    const segment_length = total_length / segments_count;
    for (let i = 1; i < segments_count; i++) {
      let vdir = p5.Vector.fromAngle(start_angle + i * angle/segments_count, segment_length);
      bp = bp.copy().add(vdir);
      multi_line.points.push(bp);
    }
    return multi_line;
}

let leaf;
let t = 0;
let leaves = []

let wind_speed
let wind_speed_steadyness = false;
let next_wind_speed
let next_wind_speed_time

function setup() {
  createCanvas(800, 600);
  colorMode(HSL);
  wind_speed = p5.Vector.fromAngle(0.1 * PI, 0);
  next_wind_speed = p5.Vector.fromAngle(random(-0.4, 0.4)*PI, random(10,20));
  next_wind_speed_time = 1;
  for (let i = 0; i < 300; i++) {
    const p0 = new p5.Vector(random(0, width), random(0,height));
    const main_direction = random(0, TWO_PI);
    const main_angle = 0; random(-0.1*TWO_PI, 0.1*TWO_PI);
    const hue = random(21, 82);
    const main_length = random(40,100);
    let leaf = new Leaf(p0, {
      main_length,
      main_direction,
      main_angle,
      paper_color: color(hue, 55, 61),
      branch_color: color(hue, 59, 46),
      paper_radius: 20,
      side_branch_count: round(main_length/10),
    });
    leaves.push({
      leaf,
      angle_velo: 0,
    });
  }

}


function draw() {
  const deltaT = 0.03;
  background(114, 36, 69);
  strokeWeight(2);
  const wind_speed_time_left = next_wind_speed_time - t;
  if (wind_speed_time_left > 0) {
    wind_speed.add( next_wind_speed.copy().sub(wind_speed).mult(deltaT/wind_speed_time_left));
  } else {
    next_wind_speed_time = t + random(0.5, 1);
    wind_speed_steadyness = !wind_speed_steadyness;
    if (wind_speed_steadyness) {
        next_wind_speed = p5.Vector.fromAngle(wind_speed.heading() + random(-0.2, 0.2)*PI, max(min(wind_speed.mag() + random(-3,3), 20),0));
    } else {
        next_wind_speed = p5.Vector.fromAngle(wind_speed.heading() + random(-1, 1)*PI, random(0,25));
    }
  }
  leaves.forEach((leaf_obj) => {
    const {leaf, angle_velo} = leaf_obj;
    const info = leaf.getTipInfo();
    //const leaf_pos = info.mid_position;
    const leaf_dir = info.tip_direction;
    const angle_diff = leaf_dir.angleBetween(wind_speed);
    const angle_force = (angle_diff) * 0.01 * wind_speed.mag() - 0.1 * leaf.config.main_angle;
    leaf_obj.angle_velo = (leaf_obj.angle_velo + angle_force)*0.98;
    leaf.config.main_angle += leaf_obj.angle_velo;
    leaf.updateLeaf();
    leaf.draw();
    stroke(0)
    strokeWeight(2);
  });
  stroke(0)
  strokeWeight(3);
  //line(width/2, height/2, width/2 + wind_speed.x * 10, height/2 + wind_speed.y * 10);
  t += deltaT;
}

function keyPressed() {
  if (key === 's') {
    saveFrames('frame', 'png', 5, 24);
  }
}
