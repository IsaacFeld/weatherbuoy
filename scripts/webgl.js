main()

function main() {
  const canvas = document.querySelector(`#modelCanvas`);

  const gl = canvas.getContext("webgl");

  if (gl === null) {
    console.log("ERROR: Loading WebGL Context")
    return;
  }

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
}