import { useEffect, useRef } from 'react';
// playcanvas
import * as pc from 'playcanvas';
import { OrbitCamera, OrbitCameraInputMouse, OrbitCameraInputTouch } from '../orbit-camera'
// hook
import { useEventListener } from 'ahooks';
// url
import { baseURL } from '@/config';

pc.basisInitialize({
    glueUrl: `${baseURL}/lib/basis/basis.wasm.js`,
    wasmUrl: `${baseURL}/lib/basis/basis.wasm.wasm`,
    fallbackUrl: `${baseURL}/lib/basis/basis.js`,
    lazyInit: true,
});

pc.WasmModule.setConfig('DracoDecoderModule', {
    glueUrl: `${baseURL}/lib/draco/draco.wasm.js`,
    wasmUrl: `${baseURL}/lib/draco/draco.wasm.wasm`,
    fallbackUrl: `${baseURL}/lib/draco/draco.js`,
});

export default function useViewModel(canvasRef: React.MutableRefObject<HTMLCanvasElement | null>, modelContentUrl: string) {
    const orbitCamera = useRef<OrbitCamera>();

    function getCanvas() {
        if (!canvasRef.current) throw new Error('canvas not initialized');
        return canvasRef.current;
    }
    const setCanvasSize = () => {
        requestAnimationFrame(() => {
            const canvas = getCanvas();
            const parentNode: any = canvas.parentNode;
            const parentWidth = parseFloat(window.getComputedStyle(parentNode).width);
            const parentHeight = parseFloat(window.getComputedStyle(parentNode).height);
            canvas.width = parentWidth;
            canvas.height = parentHeight;
        });
    };

    useEventListener('resize', setCanvasSize, {target:window});

    useEffect(function initialize() {
        window.pc = pc;

        const canvas = getCanvas();
        setCanvasSize();

        const app = new pc.Application(canvas, {
            mouse: new pc.Mouse(canvas),
            touch: new pc.TouchDevice(canvas),
        });

        const winter = new pc.Asset(
            'Winter.dds',
            'cubemap',
            { url: `${baseURL}/cubemaps/Winter.dds` },
            { type: pc.TEXTURETYPE_RGBM }
        );
        winter.on('load', (asset) => {
            app.scene.setSkybox(asset?.resources);
            app.scene.skyboxMip = 4;
            app.scene.toneMapping = pc.TONEMAP_ACES;
            app.scene.skyboxIntensity = 1;
        });
        app.assets.add(winter);
        app.assets.load(winter);

        const modelEntity = new pc.Entity();
        const modelAabb = new pc.BoundingBox();

        app.assets.loadFromUrl(modelContentUrl, 'container', (err, asset) => {
            modelEntity.addComponent('model', {
                type: 'asset',
                asset: asset?.resource.model,
            });
            modelEntity.addComponent('rigidbody', {
                type: 'static',
            });
            const meshInstances = modelEntity.model?.meshInstances;
            meshInstances?.forEach((instance, index) => {
                if (index === 0) {
                    modelAabb.copy(instance.aabb);
                } else {
                    modelAabb.add(instance.aabb);
                }
            });
            const halfExtents = modelAabb.halfExtents;
            const radius = Math.max(halfExtents.x, Math.max(halfExtents.y, halfExtents.z));
            const distance = (radius * 1.5) / Math.sin(0.5 * (camera.camera?.fov || 1) * pc.math.DEG_TO_RAD);

            orbitCamera.current = new OrbitCamera(camera, 0.45, distance);
            const orbitCameraInputMove = new OrbitCameraInputMouse(app, orbitCamera.current);
            const orbitCameraInputTouch = new OrbitCameraInputTouch(app, orbitCamera.current);
            app.on('update', (dt) => {
                orbitCamera.current!.update(dt);
            });
        });

        const camera = new pc.Entity('camera');
        camera.addComponent('camera');
        app.root.addChild(camera);
        app.root.addChild(modelEntity);
        app.start();

        return () => {
            app.destroy();
        };
    }, []);

    return {
        orbitCameraRef: orbitCamera,
    };
}
