import { exec, formatBlock, queryCommandState } from "./utilities.js";
import threeDFileLoader from "./threeDFileLoader.js";

export const bold = {
    icon: '<b>B</b>',
    result: () => exec('bold'),
    state: () => queryCommandState('bold'),
    title: 'Bold',
}

export const code = {
    icon: '&lt;/&gt;',
    result: () => exec(formatBlock, '<pre>'),
    title: 'Code',
}

export const heading1 = {
    icon: '<b>H<sub>1</sub></b>',
    result: () => exec(formatBlock, '<h1>'),
    title: 'Heading 1',
}

export const heading2 = {
    icon: '<b>H<sub>2</sub></b>',
    result: () => exec(formatBlock, '<h2>'),
    title: 'Heading 2',
}

export const image = {
    icon: '&#128247;',
    result: () => {
        const url = window.prompt('Enter the image URL')
        if (url) exec('insertImage', url)
    },
    title: 'Image',
}

export const italic = {
    icon: '<i>I</i>',
    result: () => exec('italic'),
    state: () => queryCommandState('italic'),
    title: 'Italic',
}

export const line = {
    icon: '&#8213;',
    result: () => exec('insertHorizontalRule'),
    title: 'Horizontal Line',
}

export const link = {
    icon: '&#128279;',
    result: () => {
        const url = window.prompt('Enter the link URL')
        if (url) exec('createLink', url)
    },
    title: 'Link',
}

export const olist = {
    icon: '&#35;',
    result: () => exec('insertOrderedList'),
    title: 'Ordered List',
}

export const paragraph = {
    icon: '&#182;',
    result: () => exec(formatBlock, '<p>'),
    title: 'Paragraph',
}

export const quote = {
    icon: '&#8220; &#8221;',
    result: () => exec(formatBlock, '<blockquote>'),
    title: 'Quote',
}

export const strikethrough = {
    icon: '<strike>S</strike>',
    result: () => exec('strikeThrough'),
    state: () => queryCommandState('strikeThrough'),
    title: 'Strike-through',
}

export const ulist = {
    icon: '&#8226;',
    result: () => exec('insertUnorderedList'),
    title: 'Unordered List',
}

export const underline = {
    icon: '<u>U</u>',
    result: () => exec('underline'),
    state: () => queryCommandState('underline'),
    title: 'Underline',
}

export const load3DModel = {
    icon: '&#128253;', // 적절한 아이콘을 선택하세요
    result: threeDFileLoader,
    // result: () => {
        // const fileInput = document.createElement('input');
        // fileInput.type = 'file';
        // fileInput.accept = '.gltf'; // 지원하는 파일 유형을 명시
        // fileInput.onchange = e => {
        //     const file = e.target.files[0];
        //     if (file) {
        //         const reader = new FileReader();
        //         reader.onload = (event) => {
        //             const content = event.target.result;
        //             // GLTFLoader가 임포트되어 있다고 가정
        //             const loader = new THREE.GLTFLoader();
        //             loader.parse(content, '', (gltf) => {
        //                 const scene = gltf.scene;
        //                 const line = window.prompt("Enter the line number where you want the 3D model:");
        //                 insert3DModelAtLine(scene, line);
        //             });
        //         };
        //         reader.readAsArrayBuffer(file);
        //     }
        // };
        // fileInput.click();
    // },
    title: 'Load 3D Model'
};

// function insert3DModelAtLine(scene, lineNumber) {
//     const editorContent = document.querySelector('.mogl3d-content');
//     const lines = editorContent.childNodes;
//     if (lineNumber > lines.length) lineNumber = lines.length; // 줄 번호가 너무 크면 맨 끝에 추가
//     const lineElement = lines[lineNumber - 1];
//     const sceneContainer = document.createElement('div');
//     sceneContainer.className = 'three-scene';
//     lineElement.appendChild(sceneContainer);
//     const renderer = new THREE.WebGLRenderer();
//     renderer.setSize(200, 200); // 크기를 적절히 설정
//     sceneContainer.appendChild(renderer.domElement);
//     renderer.render(scene, new THREE.PerspectiveCamera(75, 1, 0.1, 1000));
// }

export const defaultActions = {
    bold,
    code,
    heading1,
    heading2,
    image,
    italic,
    line,
    link,
    olist,
    paragraph,
    quote,
    strikethrough,
    ulist,
    underline,
    load3DModel
}