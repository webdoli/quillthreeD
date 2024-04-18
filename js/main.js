import * as THREE from 'three';
import { GLTFLoader } from 'https://unpkg.com/three@0.159.0/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'https://unpkg.com/three@0.159.0/examples/jsm/loaders/DRACOLoader.js';
import { FBXLoader } from 'https://unpkg.com/three@0.159.0/examples/jsm/loaders/FBXLoader.js';

document.addEventListener('DOMContentLoaded', function() {
    const quill = new Quill('#editor-container', {
        theme: 'snow',
        modules: {
            toolbar: ['bold', 'italic', 'underline', 'strike']
        }
    });

    document.getElementById('upload-btn').addEventListener('click', function() {
        document.getElementById('file-input').click();
    });

    document.getElementById('file-input').addEventListener('change', function(event) {
        const file = event.target.files[0];

        if (!file) return;
        
        const url = URL.createObjectURL(file);
        console.log('url: ', url );
        loadModel( url );
    });

    function loadModel(url, contents ) {
        console.log('url: ', url );
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer();
        let light = new THREE.DirectionalLight();

        // 큐브 생성
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);


        scene.add( light );
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        camera.position.z = 5;

        const gltfLoader = new GLTFLoader();
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath("https://unpkg.com/three@0.159.0/examples/jsm/libs/draco/");
        gltfLoader.setDRACOLoader( dracoLoader );

        gltfLoader.load( '/src/threeDFiles/rohan/rohan.gltf', function(gltf) {
            scene.add(gltf.scene);
            animate();
        }, undefined, function(error) {
            console.error('Error loading GLTF model:', error);
        });

        function animate() {
            requestAnimationFrame(animate);
            // cube.rotation.y += 0.01;
            renderer.render(scene, camera);
        }
    }
});
