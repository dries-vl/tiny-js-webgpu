// Fetch the wasm module and add JS functions to it that it can call
const game = await WebAssembly.instantiateStreaming(
    fetch("tiny_js_webgpu.wasm"),
    {
        "env": {
            "myJavaScriptFunction": myJavaScriptFunction
        }
    }
);

const vert_shader = await (await fetch("vert.wgsl")).text();
const frag_shader = await (await fetch("frag.wgsl")).text();
import {cubeIndices, cubeIndicesLines, cubeVertices} from './cube.js';

// Take the memory of the wasm module and read it as an array of 32bit blocks
// By default received pointers will convert to an index in this array (why?)
// 8bit array: index still works for pointer, but each next index is 8bit block
const memoryViewAsInt32 = new Uint32Array(game.instance.exports.memory.buffer);
const memoryViewAsFloat32 = new Float32Array(game.instance.exports.memory.buffer);

// It works, yay!
const matrixPtr = game.instance.exports.get_view_proj_array();
const viewProjMatrix = memoryViewAsFloat32.slice(matrixPtr / 4, matrixPtr/4 + 16);

// Global JS objects for reuse
/** @type {HTMLCanvasElement} */
export const canvas = document.getElementById('game-canvas');
/** @type {GPUDevice}*/
let device;
/** @type {GPUCanvasContext}*/
let context;
/** @type {GPUTextureFormat}*/
let format;
/** @type {GPURenderPipeline}*/
let pipeline;

let cameraBuffer, cameraBindGroup;
/** @param canvas {HTMLCanvasElement} */
async function initWebGPU(canvas) {
    if (!navigator.gpu) {
        console.error("WebGPU is not supported by this browser.");
        return;

    }
    const adapter = await navigator.gpu.requestAdapter();

    device = await adapter.requestDevice();
    context = canvas.getContext('webgpu');

    format = 'bgra8unorm';

    context.configure({
        device: device,
        format: format
    });
    pipeline = createRenderPipeline(device, format);

}

/** @param device {GPUDevice}
 *  @param format {GPUTextureFormat}*/
function createRenderPipeline(device, format) {
    const cameraBindGroupLayout = createCameraBindgroup(device);
    /** @type {GPUPipelineLayoutDescriptor}*/
    let bindgroupLayouts = {bindGroupLayouts: [cameraBindGroupLayout]};
    /** @type {GPUVertexState} */
    let vertexState = {
        module: device.createShaderModule({
            code: vert_shader, // Your vertex shader code
        }),
        entryPoint: 'vertex',
        buffers: [
            // Vertex input layout
            {
                arrayStride: 5 * 4, // 3 x 4byte for vertex, 2 x 4byte for uv, 1x4byte for vertex_id
                attributes: [
                    { shaderLocation: 0, offset: 0, format: "float32x3" }, // position
                    { shaderLocation: 1, offset: 3 * 4, format: "float32x2" }, // tex_coords
                ]
            }
        ]
    }
    /** @type {GPUFragmentState} */
    let fragmentState = {
        module: device.createShaderModule({
            code: frag_shader, // Your fragment shader code
        }),
        entryPoint: 'main',
        targets: [{ format: format }],
    }
    return device.createRenderPipeline({
        layout: device.createPipelineLayout(bindgroupLayouts),
        vertex: vertexState,
        fragment: fragmentState,
        primitive: {topology: 'line-list', cullMode: 'back', frontFace: 'cw'}
    });

}

function createCameraBindgroup(device) {
    // identity matrix to set it at baseline to avoid the maths for now

    const cameraMatrix = new Float32Array([
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0,
    ]);
    cameraBuffer = device.createBuffer({
        size: cameraMatrix.byteLength,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(cameraBuffer, 0, viewProjMatrix);

    const cameraBindGroupLayout = device.createBindGroupLayout({
        entries: [
            {
                binding: 0,
                visibility: GPUShaderStage.VERTEX,
                buffer: {
                    type: 'uniform',
                    hasDynamicOffset: false,
                    minBindingSize: 64, // Size of your view_proj matrix
                },
            }
        ]
    });

    cameraBindGroup = device.createBindGroup({
        layout: cameraBindGroupLayout,
        entries: [
            { binding: 0, resource: { buffer: cameraBuffer } }
        ],
    });
    return cameraBindGroupLayout;

}

/** @return GPUBuffer*/
function createVertexBuffer() {
    let vertexBuffer = device.createBuffer({
        size: cubeVertices.byteLength,
        usage: GPUBufferUsage.VERTEX,
        mappedAtCreation: true,
    });
    new Float32Array(vertexBuffer.getMappedRange()).set(cubeVertices);
    vertexBuffer.unmap();

    return vertexBuffer;
}

/** @return GPUBuffer*/
function createIndexBuffer() {
    let indexBuffer = device.createBuffer({
        size: cubeIndicesLines.byteLength,
        usage: GPUBufferUsage.INDEX,
        mappedAtCreation: true,
    });
    new Uint16Array(indexBuffer.getMappedRange()).set(cubeIndicesLines);
    indexBuffer.unmap();

    return indexBuffer;
}

async function frame(vertexBuffer, indexBuffer) {
    const commandEncoder = device.createCommandEncoder();
    // getCurrentTexture is a different texture each frame, to avoid being blocked by the gpu
    const textureView = context.getCurrentTexture().createView();
    const renderPassDescriptor = {
        colorAttachments: [{
            view: textureView,
            loadOp: 'clear',
            clearColor: {r: 0, g: 0, b: 0, a: 1.0},
            storeOp: 'store',
        }],
    };
    const renderPass = commandEncoder.beginRenderPass(renderPassDescriptor);
    renderPass.setPipeline(pipeline);
    renderPass.setVertexBuffer(0, vertexBuffer);
    renderPass.setIndexBuffer(indexBuffer, 'uint16');
    renderPass.setBindGroup(0, cameraBindGroup);
    renderPass.drawIndexed(cubeIndices.length);
    renderPass.end();
    device.queue.submit([commandEncoder.finish()]);
    await device.queue.onSubmittedWorkDone();
}

async function start() {
    game.instance.exports.myExportedWasmFunction();
}

/**@Param address {number}*/
function myJavaScriptFunction(address) {
    // divide pointer address by four because it is an index based on u8 chunks
    let field1 = memoryViewAsInt32.at(address / 4);
    let field2 = memoryViewAsFloat32.at((address / 4) + 1);
    console.log("Called from WASM with field 1:", field1);
    console.log("Called from WASM with field 2:", field2);
}

start();
await initWebGPU(canvas);
let vertexBuffer = createVertexBuffer();
let indexBuffer = createIndexBuffer();
// while (true) {
    let startTime = performance.now();
    await frame(vertexBuffer, indexBuffer);
    let endTime = performance.now();
    document.getElementById('fps-label').textContent =`FPS: ${1000.00 / (endTime - startTime)}`
// }
