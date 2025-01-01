# Rasterization
A JavaScript-based project that implements rasterization algorithms to draw lines and triangles with color interpolation. Features include line rendering, triangle rasterization using barycentric coordinates, and creative graphical outputs.


## Features

- **Line Rasterization**: Implemented line drawing using the DDA algorithm, supporting lines with slopes both less than and greater than one.
- **Color Interpolation**: Implemented linear color interpolation along the line from the start to the end point.
- **Triangle Rasterization**: Implemented triangle rasterization with an inside-outside test using the half-plane algorithm.
- **Barycentric Color Interpolation**: Applied barycentric coordinates for color interpolation inside a triangle.

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/erfanshafagh/Rasterization.git
   cd Rasterization
   ```

2. Start a local HTTP server:

     ```bash
     python3 -m http.server
     ```

3. Open the project in a browser:
   Navigate to `http://localhost:8000/a3.html` to view the output.

## Input Syntax

The input syntax for specifying vertices, points, lines, and triangles is as follows:

- `v,x,y,r,g,b;` - Specifies a vertex at `(x, y)` with RGB color `(r, g, b)`.
- `p,i;` - Specifies a point defined by vertex index `i`.
- `l,i,j;` - Specifies a line from vertex `i` to vertex `j`.
- `t,i,j,k;` - Specifies a triangle with vertices `i`, `j`, and `k`.

## Functions Implemented

1. `drawLine(x1, y1, x2, y2, colorStart, colorEnd)` - Rasterizes a line with color interpolation.
2. `pointIsInsideTriangle(v1, v2, v3, p)` - Determines if a point is inside a triangle.
3. `drawTriangle(v1, v2, v3)` - Rasterizes a triangle.
4. `barycentricCoordinates(p, v1, v2, v3)` - Calculates barycentric coordinates for color interpolation.


## License

This project is for educational purposes only and follows the academic integrity guidelines of the SFU CMPT 361 course.


