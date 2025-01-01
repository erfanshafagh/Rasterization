import { Framebuffer } from './framebuffer.js';
import { Rasterizer } from './rasterizer.js';
// DO NOT CHANGE ANYTHING ABOVE HERE



// take two vertices defining line and rasterize to framebuffer
Rasterizer.prototype.drawLine = function(v1, v2) {
  const [x1, y1, [r1, g1, b1]] = v1;
  const [x2, y2, [r2, g2, b2]] = v2;
  
  // helper function to interpolate color
  function interpolateColor(x1, y1, r1, g1, b1, x2, y2, r2, g2, b2, x, y) {
    const d1 = Math.sqrt((x - x1) ** 2 + (y - y1) ** 2);
    const d2 = Math.sqrt((x - x2) ** 2 + (y - y2) ** 2);
    const totalDistance = d1 + d2;
    const r = (d1 / totalDistance) * r2 + (d2 / totalDistance) * r1;
    const g = (d1 / totalDistance) * g2 + (d2 / totalDistance) * g1;
    const b = (d1 / totalDistance) * b2 + (d2 / totalDistance) * b1;
    return [r, g, b];
  }
  
  // Modified DDA algorithm
  if (x1 === x2) { // Check if the line is vertical
    for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
      // Interpolate the color
      const [r, g, b] = interpolateColor(x1, y1, r1, g1, b1, x2, y2, r2, g2, b2, x1, y);
      // Set the pixel
      this.setPixel(Math.floor(x1), Math.floor(y), [r, g, b]);
    }
  } else { // Line is not vertical
    // Calculate the slope of the line
    const m = (y2 - y1) / (x2 - x1);
    
    if(m > 1 || m < -1) { // Check if the line is steep
      let x = y1 < y2 ? x1 : x2;
      for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); ++y) {
        // Interpolate the color
        const [r, g, b] = interpolateColor(x1, y1, r1, g1, b1, x2, y2, r2, g2, b2, x, y);
        // Set the pixel
        this.setPixel(Math.floor(x), Math.floor(y), [r, g, b]);
        x += (1 / m);
      }
    } else { // Line is not steep
      let y = x1 < x2 ? y1 : y2;
      for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); ++x) {
        // Interpolate the color
        const [r, g, b] = interpolateColor(x1, y1, r1, g1, b1, x2, y2, r2, g2, b2, x, y);
        // Set the pixel
        this.setPixel(Math.floor(x), Math.floor(y), [r, g, b]);
        y += m;
      }
    }
  }

  // Set the endpoints
  this.setPixel(Math.floor(x1), Math.floor(y1), [r1, g1, b1]);
  this.setPixel(Math.floor(x2), Math.floor(y2), [r2, g2, b2]);
}



// take 3 vertices defining a solid triangle and rasterize to framebuffer
Rasterizer.prototype.drawTriangle = function(v1, v2, v3) {
  const [x1, y1, [r1, g1, b1]] = v1;
  const [x2, y2, [r2, g2, b2]] = v2;
  const [x3, y3, [r3, g3, b3]] = v3;

  // Compute the bounding box of the triangle for efficiency
  const minX = Math.floor(Math.min(x1, x2, x3));
  const maxX = Math.ceil(Math.max(x1, x2, x3));
  const minY = Math.floor(Math.min(y1, y2, y3));
  const maxY = Math.ceil(Math.max(y1, y2, y3));

  // Helper function to interpolate color using barycentric coordinates
  function barycentric(px, py, r1, g1, b1, r2, g2, b2, r3, g3, b3) {
    const denom = ((y2 - y3) * (x1 - x3) + (x3 - x2) * (y1 - y3));
    const u = ((y2 - y3) * (px - x3) + (x3 - x2) * (py - y3)) / denom;
    const v = ((y3 - y1) * (px - x3) + (x1 - x3) * (py - y3)) / denom;
    const w = 1 - u - v;
    const r = u * r1 + v * r2 + w * r3;
    const g = u * g1 + v * g2 + w * g3;
    const b = u * b1 + v * b2 + w * b3;
    return [r, g, b];
  }

  // Helper for finding the counterclockwise orientation of the triangle
  function counterclockwiseOrder(x1, y1, x2, y2, x3, y3) {
    const orientation = (x2 - x1) * (y3 - y1) - (y2 - y1) * (x3 - x1);
    if (orientation > 0) {
        return true; 
    } else if (orientation < 0) {
        return false;
    }
  }

  // Helper function to check if a point is inside the triangle
  function isInside(x1, y1, x2, y2, x3, y3, x, y) {
    const a1 = (y2 - y1); 
    const b1 = (x1 - x2);
    const c1 = (x2 * y1 - x1 * y2);
    const a2 = (y3 - y2);
    const b2 = (x2 - x3);
    const c2 = (x3 * y2 - x2 * y3);
    const a3 = (y1 - y3);
    const b3 = (x3 - x1);
    const c3 = (x1 * y3 - x3 * y1);
    if (counterclockwiseOrder(x1, y1, x2, y2, x3, y3)) {
      return (a1 * x + b1 * y + c1 <= 0 && a2 * x + b2 * y + c2 <= 0 && a3 * x + b3 * y + c3 <= 0);
    } else {
      return (a1 * x + b1 * y + c1 >= 0 && a2 * x + b2 * y + c2 >= 0 && a3 * x + b3 * y + c3 >= 0);
    }
  }

  // Helper function to check if a point is on the triangles edge
  function isOnTriangle(x1, y1, x2, y2, x3, y3, x, y) {
    if (!isInside(x1, y1, x2, y2, x3, y3, x, y)) {
      return false;
    }
    const a1 = (y2 - y1);
    const b1 = (x1 - x2);
    const c1 = (x2 * y1 - x1 * y2);
    const a2 = (y3 - y2);
    const b2 = (x2 - x3);
    const c2 = (x3 * y2 - x2 * y3);
    const a3 = (y1 - y3);
    const b3 = (x3 - x1);
    const c3 = (x1 * y3 - x3 * y1);
    return (a1 * x + b1 * y + c1 === 0) || (a2 * x + b2 * y + c2 === 0) || (a3 * x + b3 * y + c3 === 0);
  }

  // Check if the point is on the top edge
  function isOnTopEdge(px, py, xA, yA, xB, yB, xC, yC) {
    return (yA === yB && py === yA && ((xA < px && px < xB) || (xB < px && px < xA)) && (yA < yC))
        || (yB === yC && py === yB && ((xB < px && px < xC) || (xC < px && px < xB)) && (yB < yA))
        || (yC === yA && py === yC && ((xC < px && px < xA) || (xA < px && px < xC)) && (yC < yB));
  }

  // Check if the point is on the left edge
  function isOnLeftEdge(px, py, xA, yA, xB, yB, xC, yC) {
    if (!counterclockwiseOrder(xA, yA, xB, yB, xC, yC)) {
      if(  (yB > yA && ((xA < px && px < xB) || (xB < px && px < xA) || (xA === px && xB === px)) && ((yA < py && py < yB) || (yB < py && py < yA)))
        || (yC > yB && ((xB < px && px < xC) || (xC < px && px < xB) || (xB === px && xC === px)) && ((yB < py && py < yC) || (yC < py && py < yB))) 
        || (yA > yC && ((xC < px && px < xA) || (xA < px && px < xC) || (xC === px && xA === px)) && ((yC < py && py < yA) || (yA < py && py < yC))) ) {
        return true;
      }else{
        return false;
      }
    } else {
      if(  (yC > yA && ((xA < px && px < xC) || (xC < px && px < xA) || (xC === px && xA === px)) && ((yA < py && py < yC) || (yC < py && py < yA))) 
        || (yB > yC && ((xC < px && px < xB) || (xB < px && px < xC) || (xB === px && xC === px)) && ((yC < py && py < yB) || (yB < py && py < yC)))  
        || (yA > yB && ((xB < px && px < xA) || (xA < px && px < xB) || (xA === px && xB === px)) && ((yB < py && py < yA) || (yA < py && py < yB))) ) {
        return true;
      }else{
        return false;
      }
    }
  }

  // Iterate over bounding box
  for (let i = minX; i <= maxX; i++) {
    for (let j = minY; j <= maxY; j++) {

      if ((i === x1 && j === y1) || (i === x2 && j === y2) || (i === x3 && j === y3)) {
        continue;
      }

      // Check if the point (i, j) is only inside the triangle
      if (isInside(x1, y1, x2, y2, x3, y3, i, j) && !isOnTriangle(x1, y1, x2, y2, x3, y3, i, j)) {
        // Interpolate the color using barycentric coordinates
        const colors = barycentric(i, j, r1, g1, b1, r2, g2, b2, r3, g3, b3);
        // Set the pixel
        this.setPixel(i, j, colors);
      }

      // Check if the point (i, j) is on the top edge or left edge
      if (isOnTriangle(x1, y1, x2, y2, x3, y3, i, j) && (isOnTopEdge(i, j, x1, y1, x2, y2, x3, y3) || isOnLeftEdge(i, j, x1, y1, x2, y2, x3, y3))) {
        // Interpolate the color using barycentric coordinates
        const colors = barycentric(i, j, r1, g1, b1, r2, g2, b2, r3, g3, b3);
        // Set the pixel
        this.setPixel(i, j, colors);
      }
    }
  }

  // Set the vertices
  if (!counterclockwiseOrder(x1, y1, x2, y2, x3, y3)) {
    if (y2 > y1 && (y1 > y3 || y1 === y3)) {
      this.setPixel(Math.floor(x1), Math.floor(y1), [r1, g1, b1]);
    } 
    if (y3 > y2 && (y2 > y1 || y2 === y1)) {
      this.setPixel(Math.floor(x2), Math.floor(y2), [r2, g2, b2]);
    } 
    if (y1 > y3 && (y3 > y2 || y3 === y2)) {
      this.setPixel(Math.floor(x3), Math.floor(y3), [r3, g3, b3]);
    } 
  } else {
    if (y3 > y1 && (y1 > y2 || y1 === y2)) {
      this.setPixel(Math.floor(x1), Math.floor(y1), [r1, g1, b1]);
    } 
    if (y2 > y3 && (y3 > y1 || y3 === y1)) {
      this.setPixel(Math.floor(x3), Math.floor(y3), [r3, g3, b3]);
    } 
    if (y1 > y2 && (y2 > y3 || y2 === y3)) {
      this.setPixel(Math.floor(x2), Math.floor(y2), [r2, g2, b2]);
    }
  }

}



const DEF_INPUT = [
  // background
  "v,0,0,0.5,0.0,0.5;",
  "v,64,0,0.0,0.5,0.0;",
  "v,64,64,0.0,0.0,0.5;",
  "v,0,64,0.0,0.5,0.5;",
  "t,0,1,2;",
  "t,2,3,0;",

  // Triangles for solid red background
  "v,11,11,0.8,0.0,0.1;",    
  "v,55,11,0.8,0.0,0.1;", 
  "v,55,39,0.8,0.0,0.1;",
  "v,11,39,0.8,0.0,0.1;",
  "t,4,5,6;", 
  "t,4,6,7;",

  // Letter F
  "v,28,15,1.0,1.0,1.0;",    
  "v,38,15,1.0,1.0,1.0;",    
  "v,28,25,1.0,1.0,1.0;",    
  "v,38,25,1.0,1.0,1.0;",    
  "v,28,35,1.0,1.0,1.0;",   
  "l,8,9;", 
  "l,8,12;", 
  "l,10,11;",

  // Letter U
  "v,41,15,1.0,1.0,1.0;",    
  "v,51,15,1.0,1.0,1.0;",  
  "v,41,35,1.0,1.0,1.0;",  
  "v,51,35,1.0,1.0,1.0;",    
  "l,13,15;", 
  "l,14,16;", 
  "l,15,16;",

  // Letter S
  "v,15,15,1.0,1.0,1.0;",   
  "v,25,15,1.0,1.0,1.0;",   
  "v,15,25,1.0,1.0,1.0;",   
  "v,25,25,1.0,1.0,1.0;",    
  "v,15,35,1.0,1.0,1.0;",   
  "v,25,35,1.0,1.0,1.0;",   
  "l,17,18;", 
  "l,19,20;", 
  "l,17,19;", 
  "l,21,22;", 
  "l,20,22;",

  // Triangles for gray butterfly
  "v,11,45,0.0,0.0,0.0;",
  "v,11,55,0.0,0.0,0.0;",
  "v,33,50,1.0,1.0,1.0;",
  "v,55,45,0.0,0.0,0.0;", 
  "v,55,55,0.0,0.0,0.0;",
  "t,23,24,25;",
  "t,27,25,26;"
].join("\n");



// DO NOT CHANGE ANYTHING BELOW HERE
export { Rasterizer, Framebuffer, DEF_INPUT };
