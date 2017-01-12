// a0.js

//----------- declare globals  ---------------------------------------------------

var gl;              // GL rendering context
var u_FragColor;     // 4x1 color vector on GPU
var u_xformMatrix;   // 4x4 modeling transformation matrix on GPU
var nVert;           // number of vertices
var vertices;        // vertex coord array

// var vertices = new Float32Array([  0,0,  2,0,  2,2,  1,3,  0,2  ]);
var vertices = new Float32Array([  0,0,1,  2,0,1,  2,2,1,  1,3,1,  0,2,1  ]);

var xformMatrix = new Float32Array([
      0.1,  0.0, 0.0, -1,
      0.0,  0.1, 0.0, 0.0,
      0.0,  0.0, 0.1, -1.0,
      0.0,  0.0, 0.0, 1.0
  ]);

//----------- main()   -----------------------------------------------------------

function main() {
  var foo;
  console.log('hello world', '1+1=', foo);
  mySetup();                       // setup shaders, send vertices to the GPU
  transpose(xformMatrix);          // change from row-major to column-major

  gl.clearColor(1, 1, 1, 1);       // color for clearing canvas
  gl.clear(gl.COLOR_BUFFER_BIT);   // now clear the canvas

  setColor(0,0,0);
  gl.uniformMatrix4fv(u_xformMatrix, false, xformMatrix); // send to GPU
  gl.drawArrays(gl.LINE_LOOP, 0, nVert);                     // draw

  setColor(1,0,0);
  for (theta=0; theta<6.28; theta+=0.1) {
    xformMatrix[12] += 0.02;
    xformMatrix[13] += 0.02*Math.sin(theta);
    gl.uniformMatrix4fv(u_xformMatrix, false, xformMatrix); // send to GPU
    gl.drawArrays(gl.LINE_LOOP, 0, nVert);
  }
}

//----------- setColor()   --------------------------------------------------------

function setColor(r,g,b) {
    alpha = 1.0;
    gl.uniform4f(u_FragColor,r,g,b,alpha);   // send color to GPU
}

//----------- transpose()   -------------------------------------------------------

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

//----------- mySetup()   ---------------------------------------------------------

var VSHADER_SOURCE =                   // VERTEX SHADER program
  'attribute vec4 a_Position;\n' +
  'uniform mat4 u_xformMatrix;\n' +
  'void main() {\n' +
  '  gl_PointSize = 10.0;\n' +
  '  gl_Position = u_xformMatrix * a_Position;\n' +
  '}\n';

var FSHADER_SOURCE =                   // FRAGMENT SHADER program
  'precision mediump float;\n' +
  'uniform vec4 u_FragColor;\n' +
  'void main() {\n' +
  '  gl_FragColor = u_FragColor;\n' +
  '}\n';

function mySetup() {
  var canvas = document.getElementById('webgl');
  gl = getWebGLContext(canvas);          // get rendering context
  if (!gl) throw 'Failed to get the rendering context for WebGL';

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    throw ' ';
  }

  // Write the positions of vertices to a vertex shader
  nVert = initVertexBuffers(gl);
  if (nVert < 0) throw 'Failed to set positions of vertices';

  // Get location of transformation matrix
  u_xformMatrix = gl.getUniformLocation(gl.program, 'u_xformMatrix');
  if (!u_xformMatrix) throw 'Failed to get storage locn of u_xformMatrix';

  // Get location of color vector
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) throw 'Failed to get storage locn of u_FragColor';
}

//----------- initVertexBuffers()  -----------------------------------------------

function initVertexBuffers(gl) {
  var n = vertices.length/3;               // number of vertices
  var vertexBuffer = gl.createBuffer();    // create buffer object
  if (!vertexBuffer) throw 'Failed to create the buffer object';

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);             // bind buffer
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW); // write to buffer

  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) throw 'Failed to get location of a_Position';

  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);
  return n;
}
