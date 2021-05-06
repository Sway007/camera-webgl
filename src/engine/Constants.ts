/**
 * shader 中属性的位置
 */
export namespace SHADER_LOC {
  export const VERTEX: number = 0; // vertex
}

export namespace SHADER_VAR_NAME {
  export const MAT_MODEL = "modelMatrix"; // 模型矩阵
  export const MAT_PROJECT = "projectMatrix"; // 投影矩阵
  export const TEX_0 = "texture_0"; // 0号纹理

  export namespace SPRITE {
    export const COLOR = "spriteColor";
  }
}

export namespace SHADER {
  export const SPRITE: IShaderPair = {
    vert: `#version 300 es

precision mediump float;

layout (location = 0) in vec4 vertex; // <vec2 position, vec2 texCoords>

out vec2 TexCoords;

uniform mat4 modelMatrix;
uniform mat4 projectMatrix;

void main()
{
    TexCoords = vertex.zw;
    gl_Position = projectMatrix * modelMatrix * vec4(vertex.xy, 0.0, 1.0);
}
  `,
    frag: `#version 300 es

precision mediump float;

in vec2 TexCoords;
out vec4 color;

uniform sampler2D texture_0;
uniform vec3 spriteColor;

void main()
{
    vec4 tColor = texture(texture_0, TexCoords);
    if (tColor.a < 0.01) discard;

    color = vec4(spriteColor, 1.0) * tColor;
}
  `,
  };

  export const TEST: IShaderPair = {
    vert: `#version 300 es

precision mediump float;

layout (location = 0) in vec4 vertex; // <vec2 position, vec2 texCoords>

out vec2 TexCoords;

void main()
{
    TexCoords = vertex.zw;
    gl_Position = vec4(vertex.xy, 0.0, 1.0);
}
    `,

    frag: `#version 300 es

precision mediump float;

in vec2 TexCoords;
out vec4 color;

uniform sampler2D texture_0;
uniform vec3 spriteColor;

void main()
{
    vec4 tColor = texture(texture_0, TexCoords);
    // if (tColor.a < 0.01) discard;

    color = vec4(spriteColor, 1.0) * tColor;
}
    `,
  };

  export const GREY_1_0: IShaderPair = {
    vert: `precision mediump float;

attribute vec4 vertex; 

varying vec2 TexCoords;

void main()
{
    TexCoords = vertex.zw;
    gl_Position = vec4(vertex.xy, 0.0, 1.0);
}`,
    frag: `precision mediump float;

varying vec2 TexCoords;

uniform sampler2D texture_0;
uniform vec3 spriteColor;

void main()
{
    vec4 tColor = texture2D(texture_0, TexCoords);
    // if (tColor.a < 0.01) discard;
    float avg = (tColor.r + tColor.g + tColor.b) / 3.0;

    gl_FragColor = vec4(vec3(avg), 1.0);
}`,
  };

  export const TEST_1_0: IShaderPair = {
    vert: `
precision mediump float;

attribute vec4 vertex; 

varying vec2 TexCoords;

void main()
{
    TexCoords = vertex.zw;
    gl_Position = vec4(vertex.xy, 0.0, 1.0);
}`,
    frag: `
precision mediump float;

varying vec2 TexCoords;

uniform float u_time;
uniform sampler2D texture_0;
uniform vec3 spriteColor;

void main()
{
    vec2 textureCoord = TexCoords;
    textureCoord.x += sin(textureCoord.y * 25.0) * cos(textureCoord.x * 25.0) * (cos(u_time * 1000.0 / 50.0)) / 25.0;

    vec4 tColor = texture2D(texture_0, textureCoord);
    // if (tColor.a < 0.01) discard;

    gl_FragColor = vec4(spriteColor, 1.0) * tColor;
}`,
  };

  export const TILE: IShaderPair = {
    vert: `precision mediump float;

attribute vec4 vertex; 

varying vec2 TexCoords;

void main()
{
    TexCoords = vertex.zw;
    gl_Position = vec4(vertex.xy, 0.0, 1.0);
}`,
    frag: `#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

varying vec2 TexCoords;

uniform sampler2D texture_0;
uniform vec3 spriteColor;

vec2 brickTile(vec2 _st, float _zoom, float offset){
    _st *= _zoom;
    
    float t = step(2.0, mod(offset, 4.));
    
    float offset_x = step(1., mod(_st.y, 2.0)) * fract(offset)
        + (1.0 - step(1., mod(_st.y, 2.))) * -fract(offset);
    float offset_y = step(1., mod(_st.x, 2.0)) * fract(offset)
        + (1.0 - step(1., mod(_st.x, 2.))) * -fract(offset);
    
    _st += vec2(t * offset_x, (1. - t) * offset_y);

    return fract(_st);
}

float geo(vec2 _st, float _size){
    float d = distance(_st, vec2(0.5));
    return step(_size, d);
}

void main(void){
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    vec3 color = vec3(0.0);

    // Modern metric brick of 215mm x 102.5mm x 65mm
    // http://www.jaharrison.me.uk/Brickwork/Sizes.html
    // st /= vec2(2.15,0.65)/1.5;

    // Apply the brick tiling
    st = brickTile(st,5.0, u_time);

    color = vec3(geo(st, 0.2));

    vec4 tColor = texture2D(texture_0, TexCoords);

    gl_FragColor = vec4(color,1.0) * tColor;
}`,
  };
}
