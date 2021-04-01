import React, { useEffect } from "react";
import { Shader } from "./engine/Shader";
import { SHADER } from "./engine/Constants";
import { Texture2D } from "./engine/Texture";
import "./App.scss";
import { vec3 } from "gl-matrix";
// import img from 'header.jpeg';

function App() {
  let playing = false;
  let timeupdate = false;
  let videoEl: HTMLVideoElement;

  // useEffect(() => {
  //   videoEl = document.getElementById("video") as HTMLVideoElement;
  //   videoEl.onplaying = () => (playing = true);
  //   videoEl.ontimeupdate = () => (timeupdate = true);
  //   // console.log(videoEl);
  // });

  const bindClick = () => {
    navigator.mediaDevices.enumerateDevices().then((res) => {
      console.log(res);
    });
    navigator.mediaDevices
      .getUserMedia({
        // audio: true,
        video: { width: 400, height: 400, facingMode: "user" },
      })
      .then((stream: MediaStream) => {
        videoEl.srcObject = stream;
        videoEl.onloadedmetadata = (e) => {
          console.log("play");
          videoEl.play();
        };
      })
      .catch((e) => {
        console.log("error");
        console.log(e);
      });
  };

  const showGL = () => {
    if (!playing || !timeupdate) {
      console.log("not ready");
      return;
    }
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const gl = canvas.getContext("webgl2")!;

    gl.clearColor(0.6, 0.6, 0.6, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // if (window.devicePixelRatio >= 2) {
    //   canvas.width = canvas.clientWidth * 2;
    //   canvas.height = canvas.clientHeight * 2;
    // }

    const shader = new Shader(gl, SHADER.TEST.vert, SHADER.TEST.frag);
    shader.use();
    shader.setVector3f("spriteColor", vec3.fromValues(0, 1, 0));
    const texture = new Texture2D(gl, videoEl);

    // prettier-ignore
    const vertices = new Float32Array([
    // pos   tex
      -1, 1,   0, 1,
      1, -1,   1, 0,
      -1, -1,   0, 0,
      -1, 1,   0, 1,
      1, 1,   1, 1,
      1, -1,   1, 0,
    ]);

    const VBO = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, VBO);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const draw = () => {
      const vertexLoc = gl.getAttribLocation(shader._program, "vertex");
      gl.enableVertexAttribArray(vertexLoc);
      gl.vertexAttribPointer(
        vertexLoc,
        4,
        gl.FLOAT,
        false,
        4 * Float32Array.BYTES_PER_ELEMENT,
        0
      );

      texture.refresh();

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      requestAnimationFrame(draw);
    };
    draw();
  };

  return (
    <div>
      <p>Media Capture</p>
      <video id="video" width={400} height={400} playsInline={true}></video>
      <canvas id="canvas" width={400} height={400}></canvas>
      <button onClick={bindClick}>点击播放</button>
      <button onClick={showGL}>展示GLCanvas</button>
    </div>
  );
}

export default App;
