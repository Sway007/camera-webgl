import React, { useEffect } from "react";
import { Shader } from "./engine/Shader";
import { SHADER } from "./engine/Constants";
import { Texture2D } from "./engine/Texture";
import "./App.scss";
import { vec3 } from "gl-matrix";

function App() {
  let playing = false;
  let timeupdate = false;
  let videoEl: HTMLVideoElement;
  let shaders: Shader[];
  let gl: WebGLRenderingContext;
  let canvas: HTMLCanvasElement;
  let stream: MediaStream | undefined;
  let stop: boolean = false;

  // const shaders = [SHADER.TEST_1_0, SHADER.TILE]
  let curShaderIdx = 0;

  useEffect(() => {
    videoEl = document.getElementById("video") as HTMLVideoElement;
    videoEl.onplaying = () => (playing = true);
    videoEl.ontimeupdate = () => (timeupdate = true);
    canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const _gl = canvas.getContext("webgl");
    if (!_gl) throw new Error("no webgl context");
    gl = _gl;

    shaders = [
      new Shader(gl, SHADER.TEST_1_0.vert, SHADER.TEST_1_0.frag),
      new Shader(gl, SHADER.TILE.vert, SHADER.TILE.frag),
      new Shader(gl, SHADER.GREY_1_0.vert, SHADER.GREY_1_0.frag),
    ];
  });

  const switchShader = () => {
    curShaderIdx = (curShaderIdx + 1) % shaders.length;
  };

  const switchOffCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => {
        track.stop();
      });
      stream = undefined;
      videoEl.srcObject = null;
      stop = true;
      gl.clearColor(1, 1, 1, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
    } else {
      stop = false;
      bindClick();
      showGL();
    }
  };

  const bindClick = () => {
    navigator.mediaDevices.enumerateDevices().then((res) => {
      console.log(res);
    });
    navigator.mediaDevices
      .getUserMedia({
        // audio: true,
        video: { width: 400, height: 400, facingMode: "user" },
      })
      .then((_stream: MediaStream) => {
        stream = _stream;
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

    if (!gl) throw new Error("no gl context!");

    gl.clearColor(0.6, 0.6, 0.6, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

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

    const draw = (time: number = 0) => {
      if (stop) return;
      const shader = shaders[curShaderIdx];
      shader.use();

      shader.setVector2f("u_resolution", [400, 400]);
      shader.setFloat("u_time", time / 1000);
      shader.setVector3f("spriteColor", vec3.fromValues(1, 1, 0));

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
      <div>
        <button onClick={bindClick}>点击播放</button>
        <button onClick={showGL}>展示GLCanvas</button>
        <button onClick={switchShader}>切换Shader</button>
        <button onClick={switchOffCamera}>暂停/继续</button>
      </div>
    </div>
  );
}

export default App;
