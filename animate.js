// animate.js


//----------- declare globals  ------------------------------------------------------

//Info for marking
var myName = "Scott Pidzarko";
var myStudentNumber = "33730128";
var myCSID = "w2p8";
var assignmentNum = "Assignment 1";

//My defined variables for this assignment

//Set below for background Colour of the grid, [R,G,B,Alpha]
var backgroundColourRGBAlpha = [1,1,0,1] //do 1) f)
//For function arguments (don't change the folllowing four)
var backgroundColourR = backgroundColourRGBAlpha[0];
var backgroundColourG = backgroundColourRGBAlpha[1];
var backgroundColourB = backgroundColourRGBAlpha[2];
var backgroundColourAlpha = backgroundColourRGBAlpha[3];
//Now continue to change these
var gridSize = 10.0;    // grid size, assume grid is a square, with the maximum x any y being +/- gridSize
                        // also scales the square size so that it can fit in the canvas
//var houseVertices = [ 0,0,0, 2,0,0, 2,2,0, 1,3,0, 0,2,0 ]; //bottom left, bottom right, top right, peak, top left
var houseVertices = [ 0,0,0, 2,0,0, 2,2,0, 1,4,0, 0,2,0 ]; //do 1) g)
var secondHouseColor; //do 1) i)

// Other variables
var gl;              // GL rendering context
var u_FragColor;     // (address of the)  4x1 color vector, in the fragment shader
var u_xformMatrix;   // (address of the)  4x4 modeling transformation, in the vertex shader
var nVert;           // number of vertices in the WebGLBuffer object

var startIndex_house;
var startIndex_arrows;
var startIndex_grid;
var startIndex_xAxis;
var startIndex_yAxis;

var numVerts_house;
var numVerts_arrows;
var numVerts_grid;
var numVerts_xAxis;
var numVertx_yAxis;

var vertices = new Float32Array(400);    // allocate an array of floats, for vertex x1,y1,z1,x2,y2,z2,.. storage
var drawCount = 0;
var modelMatrix = new Matrix4();  // create new 4x4 matrix
var g_theta = 0;

/////////////////////////////////////////////////////////////////
// main():   code entry point
/////////////////////////////////////////////////////////////////

function main() {
  console.log(assignmentNum + ' (' + myName + ') ');
  canvas = mySetup();       // setup shaders, send vertices to the GPU
  //Uncomment for 1) k)
  //draw();                 // draw the scene once
  animate();                // draw the scene many times (animate calls draw anyways)
}

/////////////////////////////////////////////////////////////////
// animate():   sets up the "tick" callback function, which the browser will call as often as possible
/////////////////////////////////////////////////////////////////

function animate() {
  var tick = function() {                // create the callback function
    update();
    draw();
    requestAnimationFrame(tick, canvas); // Request that the browser calls tick
  };
  tick();                // now call it once. Further calls will be via the requests
}

/////////////////////////////////////////////////////////////////
// update():  updates the scene, i.e., the state variables, for the current timestep
/////////////////////////////////////////////////////////////////

var g_lastFrameTime = Date.now();   // last time the function was called

function update() {
  var spinRate = 90.0;   // spin rate, in degrees-per-second
  var now = Date.now();
  var dt = (now - g_lastFrameTime)/1000;    // compute elapsed time, in seconds
  g_lastFrameTime = now;

    // update state variables that change over time
  g_theta += dt*spinRate;
}

/////////////////////////////////////////////////////////////////
// draw():   draws the entire scene
/////////////////////////////////////////////////////////////////

function draw() {
  drawCount++;                     // console.log('drawCount = ',drawCount);
  gl.clearColor(backgroundColourR, backgroundColourG, backgroundColourB, backgroundColourAlpha); // colour for clearing canvas (change this to change the background colour)
  gl.clear(gl.COLOR_BUFFER_BIT);   // now clear the canvas
  modelMatrix.setIdentity();       // begin with identity transformation matrix

  // draw background grid
  modelMatrix.scale((1.0 / gridSize), (1.0 / gridSize), (1.0 / gridSize));      // setup the transformation matrix
  gl.uniformMatrix4fv(u_xformMatrix, false, modelMatrix.elements); // send Matrix
  drawGrid();

  // draw house
  //house 1 - the cyan one
  modelMatrix.rotate(g_theta, 0,1,0);    // setup the transformation matrix
  modelMatrix.scale(2,2,2) //Do assignment 1) h) - comment out for original size
  gl.uniformMatrix4fv(u_xformMatrix, false, modelMatrix.elements); // send matrix
  drawHouse(0,1,1); // draw the house given an rgb colour
  //house 2 - the red one
  modelMatrix.rotate(g_theta, 0,0.2,0);    // setup the transformation matrix
  gl.uniformMatrix4fv(u_xformMatrix, false, modelMatrix.elements); // send matrix
  drawHouse(1,0,0); // draw the house given an rgb colour
  //house 3 - the random one for 1) l)
  modelMatrix.rotate(g_theta, 0,0.5,0);    // setup the transformation matrix
  gl.uniformMatrix4fv(u_xformMatrix, false, modelMatrix.elements); // send matrix
  drawHouse(Math.random(),Math.random(),Math.random()); // draw the house given an rgb colour
  //gl.translate(Math.random(), Math.random(), Math.random()) //1) l)
}

/////////////////////////////////////////////////////////////////
// drawGrid():   draws the house using a given (r,g,b) colour, and the local basis vectors
/////////////////////////////////////////////////////////////////

function drawHouse(r,g,b) {
  // draw filled house
  setColor(r,g,b);
  //Alter below for 1) j)
  gl.drawArrays(gl.TRIANGLE_FAN, startIndex_house, numVerts_house);    // draw filled triangles

  // draw house vertices
  setColor(0.5,0.3,0);
  gl.drawArrays(gl.POINTS, startIndex_house, numVerts_house);            // draw

  // draw basis vectors
  setColor(0,1,0);
  gl.drawArrays(gl.LINES, startIndex_arrows, numVerts_arrows);          // draw
}

/////////////////////////////////////////////////////////////////
// drawGrid():   draws the background grid in black, and the X,Y axes in red
/////////////////////////////////////////////////////////////////

function drawGrid() {
  // draw grid
  gl.lineWidth(1.0);
  setColor(0,0,0); // this line sets the color of the grid lines (0,0,0) = black, (1,1,1) = white
  gl.drawArrays(gl.LINES, startIndex_grid, numVerts_grid);
  // draw axes
  setColor(1,0,0);
  gl.drawArrays(gl.LINES, startIndex_xAxis, numVerts_xAxis);
  gl.drawArrays(gl.LINES, startIndex_yAxis, numVerts_yAxis);
}

/////////////////////////////////////////////////////////////////
// setColor(r,g,b):  sets the current draw color to be used in the fragment shader
/////////////////////////////////////////////////////////////////

function setColor(r,g,b) {
    alpha = 1.0;
    gl.uniform4f(u_FragColor,r,g,b,alpha);   // send color to GPU
}

/////////////////////////////////////////////////////////////////
// transpose(M):  computes M=M^T   This is useful because WebGL expects matrices in column-major order
/////////////////////////////////////////////////////////////////

function transpose(matrix) {
  for (row=0; row<4; row++) {
      for (col=0; col<4; col++) {
	  if (row<col) {             // swap all off-diagonal elements once
	    i1 = 4*row+col;          // index for row major order
	    i2 = 4*col+row;          // index for col major order
            temp = matrix[i1];       // setup for swap
            matrix[i1] = matrix[i2];
            matrix[i2] = temp;
          }
      }
  }
}

/////////////////////////////////////////////////////////////////
// define the vertex & fragment shaders
/////////////////////////////////////////////////////////////////

var VSHADER_SOURCE =                   // VERTEX SHADER program
  'attribute vec4 a_Position;\n' +
  'uniform mat4 u_xformMatrix;\n' +
  'void main() {\n' +
  '  gl_PointSize = 10.0;\n' +                            // size of the drawn vertices if drawing using gl.Points
  '  gl_Position = u_xformMatrix * a_Position;\n' +       // transforms a vertex:  p' = M*p
  '}\n';

var FSHADER_SOURCE =                   // FRAGMENT SHADER program
  'precision mediump float;\n' +
  'uniform vec4 u_FragColor;\n' +
  'void main() {\n' +
  '  gl_FragColor = u_FragColor;\n' +                   // set to a color that can be set in the javascript
//  '  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' +    // alternative: set to a fixed color
  '}\n';

/////////////////////////////////////////////////////////////////
// mySetup():   load the shaders,
/////////////////////////////////////////////////////////////////

function mySetup() {
  var canvas = document.getElementById('webgl');
  gl = getWebGLContext(canvas);          // get rendering context
  if (!gl) throw 'Failed to get the rendering context for WebGL';

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    throw ' ';
  }

  // Write the positions of vertices to a WebGLBuffer object
  nVert = initVertexBuffers(gl);
  if (nVert < 0) throw 'Failed to set positions of vertices';

  // Get the location of the transformation matrix in the vertex shader
  u_xformMatrix = gl.getUniformLocation(gl.program, 'u_xformMatrix');
  if (!u_xformMatrix) throw 'Failed to get storage location of u_xformMatrix';

  // Get location of color vector in the fragment shader
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) throw 'Failed to get storage locn of u_FragColor';

  return canvas;
}

/////////////////////////////////////////////////////////////////
// initVertexBuffers():  fills the vertices[ ] float array with vertex x,y,z values
//                       i.e., vertices[x1,y1,z1,  x2,y2,z2,  x3,y3,z3,  ...]
//                       and then writes this to a WebGLBuffer.
/////////////////////////////////////////////////////////////////

function initVertexBuffers(gl) {
  var i=0;     // keep track of current the index, i.e., vertices[i]

  // house vertices
  startIndex_house = 0;
  vertices.set(houseVertices,0);   // assigns to vertices[0]--vertices[14]
  numVerts_house = 5;
  i += numVerts_house*3;

  // arrow vertices
  startIndex_arrows = startIndex_house + numVerts_house;
  vertices.set([ 0,0,0,   1,0,0,   1,0,0,  0.8,-0.2,0,  1,0,0,  0.8,0.2,0,
                 0,0,0,   0,1,0,   0,1,0,  -0.2,0.8,0,  0,1,0,  0.2,0.8,0 ],i);  // vertices[15]--vertices[15+3*12]
  numVerts_arrows = 12;
  i += numVerts_arrows*3;

  // background grid
  startIndex_grid = startIndex_arrows + numVerts_arrows;

  //2*(gridSize + 1) vertices per axes
  for (y=-gridSize; y<=gridSize; y+=1.0) {    // horizontal grid lines - top to bottom
    //start x,y,z of a grid line
    vertices[i++] = -gridSize; //x-coordinate
    vertices[i++] = y;         //y-coordinate
    vertices[i++] = 0.0;       //z-coordinate
    //end x,y,z of a grid line
    vertices[i++] = gridSize;
    vertices[i++] = y;
    vertices[i++] = 0.0;
  }
  for (x=-gridSize; x<=gridSize; x++) {       // vertical grid lines - left to right
    vertices[i++] = x;
    vertices[i++] = -gridSize;
    vertices[i++] = 0.0;

    vertices[i++] = x;
    vertices[i++] = gridSize;
    vertices[i++] = 0.0;
  }
  numVerts_grid = 4 * (2*gridSize + 1);

  //background grid - axes
  startIndex_xAxis = startIndex_grid + 2*gridSize;
  numVerts_xAxis = 2;

  startIndex_yAxis = startIndex_grid + (numVerts_grid/2) + 2*gridSize;
  numVerts_yAxis = 2;

  // create and intialize a WebGLBuffer to store data such as vertices or colors
  var vertexBuffer = gl.createBuffer();    // create buffer object
  if (!vertexBuffer) throw 'Failed to create the buffer object';
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);             // make this the "current" array buffer
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW); // write to buffer

  // Specify the data formats and locations of vertex attributes in a vertex attributes array
  // In this case, the vertices are groups of 3 floats, which define the "a_Position" attribute
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) throw 'Failed to get location of a_Position';
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);

  // return # of vertices in this Vertex Buffer Object
  var n = startIndex_grid + numVerts_grid;
  console.log('# vertices =', n);
  return n;
}
