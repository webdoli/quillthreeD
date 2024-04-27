import * as THREE from 'three';
import { Loader } from '../../lib/Loader.js';
import { OrbitControls } from 'https://unpkg.com/three@0.159.0/examples/jsm/controls/OrbitControls.js';
import { closeDropDown } from './utilities.js';

export default function() { 

    const fileInput = document.createElement('input');

    fileInput.type = 'file';
    fileInput.multiple = true;
    fileInput.onchange = async e => {

        const files = e.target.files;
        
        try {
            let filesMap = null;
            const loader = new Loader();
            loader.loadFiles( files, filesMap, ( res ) => {

                insert3DModelAtLine( res );

            } );

        } catch ( err ) {

            console.error('파일 로딩 에러:', err);
        
        }
    
    }

    fileInput.click();
    closeDropDown( 'Menu-dropdown' );
    
}

function insert3DModelAtLine( object ) {

    const editor = document.getElementById('editor');
    const selection = window.getSelection();

    // 새 div 요소를 생성하여 3D 씬을 포함하도록 설정합니다.
    const sceneContainer = document.createElement('div');
    sceneContainer.style.height = '250px';
    sceneContainer.className = 'three-scene';

    // Range 객체를 사용하여 새 div를 커서 위치에 삽입합니다.
    // range.insertNode( sceneContainer );

    const scene = new THREE.Scene();

    const grid = new THREE.GridHelper(10);
    scene.add( grid );
    scene.add( object );

    const light = new THREE.PointLight(0xffffff, 50)
    light.position.set(0.8, 1.4, 1.0)
    scene.add(light)

    const ambientLight = new THREE.AmbientLight()
    scene.add(ambientLight)

    const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    sceneContainer.appendChild( renderer.domElement );

    const controls = new OrbitControls( camera, renderer.domElement);
    controls.enableDamping = true

    function animate() {

        requestAnimationFrame(animate);
        controls.update()
        renderer.render(scene, camera);

    }

    animate();

    // 사용자 선택이 없거나 선택된 텍스트가 없을 경우, 에디터의 첫 번째 위치에 삽입
    if (!selection.rangeCount) {
        // 첫 번째 텍스트 라인이 도구 상자가 아닌 경우에만 처리
        const firstTextLine = editor.children[1]; // 0번째는 도구 상자일 수 있으므로 1번째 자식을 선택
        const range = document.createRange();
        const sel = window.getSelection();
        range.setStart(firstTextLine, 0);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
        editor.insertBefore( sceneContainer, firstTextLine );
        
    } else {
        // 사용자가 선택한 위치에 삽입
        const range = selection.getRangeAt(0);
        range.insertNode(sceneContainer);
        range.collapse(false);
    }

}