import random

points = []
border = 40 

def setup():
    global points, border
    size(600, 600)
    max_velocity = 10
    for i in range (80):
        pt = {
          "x": border +random.random() * (width - 2*border), 
          "y": border +random.random() * (height - 2*border),
          "vx": (random.random()-0.5) * max_velocity * 2,
          "vy": (random.random()-0.5) * max_velocity * 2,
          "nearest": []
        }
        points.append(pt)   
    
def draw():
    global points, border
    connect_nearest_max = 12
    dt = 0.1
    background(255)
    # move points
    for pinx, point in enumerate(points):
        point["x"] = point["x"] + point["vx"] * dt 
        point["y"] = point["y"] + point["vy"] * dt
        if point["x"] < border or point["x"] > width - border:
             point["vx"] *= -1
        if point["y"] < border or point["y"] > height - border:
             point["vy"] *= -1
    # calculate nearest
    for pinx, point in enumerate(points):
        nearest = [(pi, dist(point['x'], point['y'], p['x'], p['y'])) for (pi, p) in enumerate(points) if pi != pinx ]
        nearest.sort(key=lambda (i, d): d)
        points[pinx]['nearest'] = nearest
        #print(nearest)
    for pinx, point in enumerate(points[:]):
        #circle(point['x'], point['y'], 100)
        for ninx, (pi, d) in enumerate(point['nearest'][:connect_nearest_max]):
            if pi < pinx:
                continue
            p = points[pi]
            strokeWeight(1.0 + 4.0 * (connect_nearest_max - ninx) / connect_nearest_max)
            
            #line(point['x'], point['y'], p['x'], p['y'])
            p0_x, p0_y = point['x'], point['y']
            p1_x, p1_y = p['x'], p['y']
            
            pa0_angle = 2 * PI * ninx / connect_nearest_max
            a0_dist = 30 + d * 0.5
            pa0_x = p0_x - a0_dist * 0.7 * cos(pa0_angle)
            pa0_y = p0_y + a0_dist * 0.3 * sin(pa0_angle)
            
            pa1_x = p0_x * 0.3 + p1_x * 0.7
            pa1_y = p0_y * 0.3 + p1_y * 0.7
            noFill()
            bezier(p0_x, p0_y, pa0_x, pa0_y, pa1_x, pa1_y, p1_x, p1_y)
            
    strokeWeight(2)
    for p in points:
        pass
        fill(255)
        #circle(p['x'], p['y'], 5)
    saveFrame("frames/####.png")
