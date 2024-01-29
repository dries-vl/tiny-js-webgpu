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

struct InstanceInput {
    @location(5) model_matrix_0: vec4<f32>,
    @location(6) model_matrix_1: vec4<f32>,
    @location(7) model_matrix_2: vec4<f32>,
    @location(8) model_matrix_3: vec4<f32>,
};

// BEFORE VERTEX FUNCTION:
// Input Assembly: read vertex + index buffer and gather vertex for each index
// Use 'vertex pulling': cache result of vertex function when vertex used more than once

@group(1) @binding(0) // 1.
var<uniform> camera: CameraUniform;

@vertex
fn vertex(VERTEX_IN: VertexInput, INSTANCE: InstanceInput) -> VertexOutput {
    let model_matrix = mat4x4<f32>(
        INSTANCE.model_matrix_0,
        INSTANCE.model_matrix_1,
        INSTANCE.model_matrix_2,
        INSTANCE.model_matrix_3,
    );
    var VERTEX_OUT: VertexOutput;
    VERTEX_OUT.tex_coords = VERTEX_IN.tex_coords;
    VERTEX_OUT.clip_position = camera.view_proj * model_matrix * vec4<f32>(VERTEX_IN.position, 1.0);
    return VERTEX_OUT;
}