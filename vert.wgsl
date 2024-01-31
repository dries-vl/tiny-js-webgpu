struct VertexInput {
    @location(0) position: vec3<f32>,
    @location(1) tex_coords: vec2<f32>,
};

struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) tex_coords: vec2<f32>,
};

struct CameraUniform {
    view_proj: mat4x4<f32>,
};

// BEFORE VERTEX FUNCTION:
// Input Assembly: read vertex + index buffer and gather vertex for each index
// Use 'vertex pulling': cache result of vertex function when vertex used more than once

@group(0) @binding(0)
var<uniform> camera: CameraUniform;

@group(0) @binding(1)
var<storage, read> indices: array<u32>;

@vertex
fn vertex(VERTEX_IN: VertexInput, @builtin(vertex_index) vert_index: u32) -> VertexOutput {
    var VERTEX_OUT: VertexOutput;
    VERTEX_OUT.position = camera.view_proj * vec4<f32>(VERTEX_IN.position.x*0.5, VERTEX_IN.position.y*0.5 - 0.5, VERTEX_IN.position.z*0.5 - 1.0, 1.0);
    VERTEX_OUT.tex_coords = VERTEX_IN.tex_coords;
    return VERTEX_OUT;
}
