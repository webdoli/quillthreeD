import * as THREE from 'three';
import { Loader } from '../../lib/Loader.js';

export default function() {

    const fileInput = document.createElement('input');

    fileInput.type = 'file';
    fileInput.multiple = true;
    fileInput.onchange = async e => {

        const files = e.target.files;
        
        try {
            let filesMap = null;
            const loader = new Loader();
            await loader.loadFiles( files, filesMap, ( res ) => {
                console.log( `gltf결과값 res: ${ res }`);
                insert3DModelAtLine( res, 2 )
            } ); // 로드된 GLTF 장면 객체를 반환한다고 가정
            // const lineNumber = prompt("3D 모델을 삽입할 줄 번호를 입력하세요:");
            // insert3DModelAtLine( gltf.scene, lineNumber);

        } catch ( err ) {

            console.error('파일 로딩 에러:', err);
        
        }
    
    }

    fileInput.click();
    
}

function insert3DModelAtLine( gltfScene, lineNumber ) {

    const editorContent = document.querySelector('.mogl3d-content');
    const lines = editorContent.childNodes;
    if (lineNumber > lines.length) lineNumber = lines.length;

    // const lineElement = lines[lineNumber - 1];
    const sceneContainer = document.createElement('div');
    sceneContainer.style.height = '500px;'
    sceneContainer.className = 'three-scene';
    document.body.appendChild( sceneContainer );
    // lineElement.appendChild(sceneContainer);

    const scene = new THREE.Scene();
    scene.add( gltfScene );
    const directionalLight = new THREE.DirectionalLight( 0xffffff, 1.0 );
    scene.add( directionalLight );
    const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    camera.position.y = 2;
    camera.position.z = 3;

    const geometry = new THREE.BoxGeometry( 1, 1, 1 );
    const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    const cube = new THREE.Mesh( geometry, material );
    scene.add( cube );

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    function animate() {
        requestAnimationFrame(animate);
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        renderer.render(scene, camera);
    }

    animate();

}