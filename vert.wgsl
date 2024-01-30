struct VertexInput {
    @location(0) position: vec3<f32>,
    @location(1) tex_coords: vec2<f32>,
};

struct VertexOutput {
    @builtin(position) clip_position: vec4<f32>,
    @location(0) tex_coords: vec2<f32>,
};

struct CameraUniform {
    view_proj: mat4x4<f32>,
};

// BEFORE VERTEX FUNCTION:
// Input Assembly: read vertex + index buffer and gather vertex for each index
// Use 'vertex pulling': cache result of vertex function when vertex used more than once

@group(0) @binding(0) // 1.
var<uniform> camera: CameraUniform;

@vertex
fn vertex(VERTEX_IN: VertexInput) -> VertexOutput {
    var VERTEX_OUT: VertexOutput;
    VERTEX_OUT.tex_coords = VERTEX_IN.tex_coords;
    VERTEX_OUT.clip_position = camera.view_proj * vec4<f32>(VERTEX_IN.position.x, VERTEX_IN.position.y, VERTEX_IN.position.z + 0.6, 1.0);
    return VERTEX_OUT;
}
