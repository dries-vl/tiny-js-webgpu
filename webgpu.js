// Fetch the wasm module and add JS functions to it that it can call
const game = await WebAssembly.instantiateStreaming(
    fetch("lib.wasm"),
    {
        "env": {
            "myJavaScriptFunction": myJavaScriptFunction
        }
    }
);

const vert_shader = await (await fetch("vert.wgsl")).text();
const frag_shader = await (await fetch("frag.wgsl")).text();
import { cubeIndices, cubeVertices } from './cube.js';

// Take the memory of the wasm module and read it as an array of 32bit blocks
// By default received pointers will convert to an index in this array (why?)
// 8bit array: index still works for pointer, but each next index is 8bit block
const memoryViewAsInt32 = new Uint32Array(game.instance.exports.memory.buffer);
const memoryViewAsFloat32 = new Float32Array(game.instance.exports.memory.buffer);

// Global variables for reuse
let device, pipeline, context, format;
let colorBuffer, colorBindGroup;

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

function createRenderPipeline(device, format) {
    const bindGroupLayout = createUniformBuffer(device);
    return device.createRenderPipeline({
        layout: device.createPipelineLayout({bindGroupLayouts: [bindGroupLayout]}),
        vertex: {
            module: device.createShaderModule({
                code: vert_shader, // Your vertex shader code
            }),
            entryPoint: 'vertex',
            buffers: [
                // Vertex input layout
                {
                    arrayStride: 5 * 4, // Size for position + tex_coords
                    attributes: [
                        { shaderLocation: 0, offset: 0, format: "float32x3" }, // position
                        { shaderLocation: 1, offset: 3 * 4, format: "float32x2" }, // tex_coords
                    ]
                },
                // Instance input layout
                {
                    arrayStride: 4 * 4 * 4, // 4 rows of 4x float32
                    stepMode: 'instance',
                    attributes: [
                        { shaderLocation: 5, offset: 0, format: "float32x4" },
                        { shaderLocation: 6, offset: 4 * 4, format: "float32x4" },
                        { shaderLocation: 7, offset: 2 * 4 * 4, format: "float32x4" },
                        { shaderLocation: 8, offset: 3 * 4 * 4, format: "float32x4" },
                    ]
                }
            ]
        },
        fragment: {
            module: device.createShaderModule({
                code: frag_shader, // Your fragment shader code
            }),
            entryPoint: 'main',
            targets: [{ format: format }],
        },
        primitive: {
            topology: 'triangle-list',
        },
    });
}

function createUniformBuffer(device) {
    // Create a buffer to hold a single RGBA color
    colorBuffer = device.createBuffer({
        size: 4 * Float32Array.BYTES_PER_ELEMENT,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });

    const bindGroupLayout = device.createBindGroupLayout({
        entries: [{
            binding: 0,
            visibility: GPUShaderStage.FRAGMENT,
            buffer: {
                type: "uniform",
            },
        }],
    });

    colorBindGroup = device.createBindGroup({
        layout: bindGroupLayout,
        entries: [{
            binding: 0,
            resource: {
                buffer: colorBuffer,
            },
        }],
    });

    return bindGroupLayout;
}

async function renderColor(color) {
    // Update the uniform buffer with the new color
    device.queue.writeBuffer(
        colorBuffer,
        0,
        new Float32Array([color.r, color.g, color.b, 1.0])
    );

    // Create cube buffers
    const vertexBuffer = device.createBuffer({
        size: cubeVertices.byteLength,
        usage: GPUBufferUsage.VERTEX,
        mappedAtCreation: true,
    });
    new Float32Array(vertexBuffer.getMappedRange()).set(cubeVertices);
    vertexBuffer.unmap();

    const indexBuffer = device.createBuffer({
        size: cubeIndices.byteLength,
        usage: GPUBufferUsage.INDEX,
        mappedAtCreation: true,
    });
    new Uint16Array(indexBuffer.getMappedRange()).set(cubeIndices);
    indexBuffer.unmap();
    // end cube buffers

    const commandEncoder = device.createCommandEncoder();

    const textureView = context.getCurrentTexture().createView();
    const renderPassDescriptor = {
        colorAttachments: [{
            view: textureView,
            loadOp: 'clear',
            clearColor: { r: 0, g: 0, b: 0, a: 1.0 },
            storeOp: 'store',
        }],
    };

    const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
    passEncoder.setPipeline(pipeline);
    passEncoder.setBindGroup(0, colorBindGroup);
    passEncoder.setVertexBuffer(0, vertexBuffer);
    passEncoder.setIndexBuffer(indexBuffer, 'uint16');
    passEncoder.drawIndexed(cubeIndices.length); // draw call
    passEncoder.end();

    device.queue.submit([commandEncoder.finish()]);
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
const canvas = document.getElementById('game-canvas');
await initWebGPU(canvas);
renderColor({r: 1.0, g: 0.0, b: 0.0}); // Render red color
