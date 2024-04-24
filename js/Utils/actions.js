import { exec, formatBlock, queryCommandState, createDropDownMenu } from "./utilities.js";
import threeDFileLoader from "./threeDFileLoader.js";

let content;

function closeDropdowns() {
    const dropdowns = document.querySelectorAll('.Menu-dropdown');
    dropdowns.forEach(dropdown => {
        dropdown.style.display = 'none'; // 모든 드랍다운 숨기기
    });
}

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

export const fontColor = {
    icon: 'T',
    result: () => {
        const input = document.createElement('input');
        input.type = 'color';
        input.oninput = (e) => {
            exec( 'foreColor', e.target.value );
            input.remove(); // 색상 선택 후 input 요소 제거
        };
        input.click(); // 자동으로 색상 선택기 열기
        closeDropdowns();
    },
    title: 'Font Color'
}

export const highlight = {
    icon: '<span style="border:1px solid yellow; padding:2px 6px;">T</span>',
    result: () => {
        // 사용자가 색상을 선택할 수 있도록 input 태그 생성
        const input = document.createElement('input');
        input.type = 'color';
        input.oninput = (e) => {
            // 선택한 색상을 텍스트의 배경색으로 설정
            document.execCommand('backColor', false, e.target.value);
            input.remove(); // 색상 선택 후 input 요소 제거
        };
        input.click(); // 자동으로 색상 선택기 열기
        closeDropdowns();
    },
    title: 'Highlight Text'
}

export const removeHighlight = {
    icon: '<s>T</s>', // 적절한 아이콘을 선택하세요
    result: () => { 
        exec('backColor', 'transparent')
        closeDropdowns();
    },
    title: 'Remove Highlight'
};

export const textColorMenu = {
    icon: 'T',
    result: () => {},
    init: ( button ) => {
        content = document.querySelector('.mogl3d-content');
        let dropdownContainer = createDropDownMenu( button, [ fontColor, highlight, removeHighlight ], content, 'TextMenu-dropdown' );
        button.parentNode.replaceChild(dropdownContainer, button);

    },
    title: 'TextColorDropDown',

}

export const leftAlign = {
    icon: '&#x21E4;',
    result: () => { 
        exec('justifyLeft'); 
        closeDropdowns(); 
    },
    title: 'LeftAlign'
}

export const rightAlign = {
    icon: '&#x21E5;',
    result: () => {
        exec('justifyRight')
        closeDropdowns();
    },
    title: 'RightAlign'
}

export const centerAlign = {
    icon: '&#x21C5;',
    result: () => {
        exec('justifyCenter')
        closeDropdowns();
    },
    title: 'CenterAlign'
}

export const alignMenu = {
    icon: 'Ξ', //정렬 유니코드 필요
    result: () => {},
    init: ( button ) => {
        content = document.querySelector('.mogl3d-content');
        let dropdownContainer = createDropDownMenu( button, [ leftAlign, rightAlign, centerAlign ], content, 'AlignMenu-dropdown' );
        button.parentNode.replaceChild(dropdownContainer, button);

    },
    title: 'TextAlignDropDown'
}

export const image = {
    icon: '<icon style="font-size:16px;">🖼️</icon>',
    result: () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*'; // 이미지 파일만 허용
        fileInput.onchange = (e) => {
        
            const file = e.target.files[0];
        
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
            
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    const range = document.getSelection().getRangeAt(0);
            
                    range.deleteContents(); // 커서 위치의 내용을 제거
                    range.insertNode(img); // 이미지를 삽입

                };

                reader.readAsDataURL(file);

            }

            fileInput.remove(); // 파일 입력 요소 제거

        };

        fileInput.click(); // 파일 선택기 열기
        closeDropdowns(); // 드랍다운 닫기

    },
    title: 'Image',

};


export const files = {
    icon: '<icon style="font-size:16px;">🗃️</icon>',
    result: () => {

        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.zip'; // ZIP 파일만 허용

        fileInput.onchange = (e) => {
        
            const file = e.target.files[0];
        
            if (file) {
                // ZIP 파일에 대한 참조를 에디터 내에 삽입
                
                // 컨테이너 div를 생성합니다.
                const container = document.createElement('div');
                container.contentEditable = false; // 파일 컨테이너는 편집 불가능하도록 설정
                container.style.display = 'inline-block'; // 인라인 블록으로 표시
                container.style.margin = '5px'; // 여백 추가

                const fileNameSpan = document.createElement('span');
                fileNameSpan.textContent = file.name + " "; // 파일 이름 표시
                container.appendChild(fileNameSpan);

                const removeButton = document.createElement('button');
                removeButton.textContent = 'x';
                removeButton.style.marginLeft = '5px';
                removeButton.onclick = () => {
                    container.remove(); // 컨테이너를 에디터에서 삭제
                };
                container.appendChild(removeButton);

                const selection = document.getSelection();
                let range;
        
                if (selection.rangeCount > 0) {
        
                    range = selection.getRangeAt(0);
                    range.deleteContents(); // 현재 커서 위치의 내용을 제거
                    range.insertNode(container); // 파일 이름과 제거 버튼을 포함하는 컨테이너 삽입
        
                } else {
                // 선택된 범위가 없는 경우, 에디터의 첫 부분에 삽입
        
                    const editor = document.querySelector('.mogl3d-content');
                    editor.insertBefore(container, editor.firstChild);
                }
                // 파일 입력 요소를 문서에서 제거합니다.
                fileInput.remove();
            }

        };

        fileInput.click(); // 파일 선택기 열기
        closeDropdowns();

    },

    title: 'files',

};

export const video = {
    icon: '<icon style="font-size:16px;">🎬</icon>',
    result: () => {
        createVideoModal();
        let closeButton = document.querySelector('.close');
        let videoFileModal = document.querySelector('.modal');
        closeButton.onclick = function() {
            document.querySelector('.modal').removeEventListener('click', closeButton.onclick);
            videoFileModal.style.display = "none";
            videoFileModal.remove();
        };
    },
    title: 'Video'
};

function createVideoModal() {
    // 모달 요소 생성
    closeDropdowns();
    const modal = document.createElement('div');
    modal.setAttribute('class', 'modal');

    // 모달 콘텐츠를 위한 Div
    const modalContent = document.createElement('div');
    modalContent.setAttribute('class', 'modal-content');
    modal.appendChild(modalContent);

    // 닫기 버튼
    const closeButton = document.createElement('span');
    closeButton.setAttribute('class', 'close');
    closeButton.innerHTML = '&times;';
    
    modalContent.appendChild(closeButton);

    // 입력 폼
    const formHTML = `
        <h2>Add Video</h2>
        <p><input type='text' id='videoUrlInput' placeholder='Enter video URL' style='width: 90%;'></p>
        <p><input type='file' id='videoFileInput' accept='video/*'></p>
        <button onclick='insertVideoFromModal()'>Insert Video</button>
    `;
    modalContent.innerHTML += formHTML;

    // 모달을 body에 추가
    document.body.appendChild(modal);

    // 모달 보이기
    modal.style.display = "block";
}

window.insertVideoFromModal = () => {
    const url = document.getElementById('videoUrlInput').value;
    const fileInput = document.getElementById('videoFileInput');
    const file = fileInput.files[0];

    if (url) {
        // URL로 iframe 생성
        insertVideoIframe(url);
    } else if (file && file.size <= 30 * 1024 * 1024) { // 30 MB 제한
        // 파일로 비디오 태그 생성
        insertVideoFile(file);
    } else if (file) {
        alert('File is too large. Maximum size is 30MB.');
    }

    document.querySelector('.modal').style.display = 'none'; // 모달 숨기기
};

function insertVideoIframe(url) {
    let embedUrl = url;

    // 사용자가 일반 YouTube URL을 입력한 경우 embed URL로 변환
    if (url.includes('youtube.com/watch?v=')) {
        const videoId = url.split('v=')[1].split('&')[0]; // URL에서 비디오 ID 추출
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
    } else if (url.includes('youtu.be/')) {
        const videoId = url.split('youtu.be/')[1];
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
    }

    const iframe = document.createElement('iframe');
    iframe.src = embedUrl;
    iframe.style.width = "560px";
    iframe.style.height = "315px";
    iframe.frameBorder = "0";
    iframe.allow = "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture";
    iframe.allowFullscreen = true;
    document.querySelector('.mogl3d-content').appendChild(iframe);
}

function insertVideoFile(file) {
    const editorContent = document.querySelector('.mogl3d-content');

    const beforeSpace = document.createElement('p');
    beforeSpace.contentEditable = true;
    beforeSpace.innerHTML = "<br>";  // 비디오 위에 텍스트 입력 공간

    const video = document.createElement('video');
    video.controls = true;
    const source = document.createElement('source');
    source.src = URL.createObjectURL(file);
    source.type = file.type;
    video.appendChild(source);

    const afterSpace = document.createElement('p');
    afterSpace.contentEditable = true;
    afterSpace.innerHTML = "<br>";  // 비디오 아래에 텍스트 입력 공간

    editorContent.appendChild(beforeSpace);
    editorContent.appendChild(video);
    editorContent.appendChild(afterSpace);
}


export const filesMenu = {

    icon: '<icon>&#x1F4C1;</icon><icon style="font-size:7px;margin-left:2px;">&#x25BC;</icon>',
    result: () => {},
    init: ( button ) => {
        content = document.querySelector('.mogl3d-content');
        let dropdownContainer = createDropDownMenu( button, [ image, files, video ], content, 'FileMenu-dropdown' );
        button.parentNode.replaceChild(dropdownContainer, button);
    },
    title: 'FilesDropDown'

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
    icon: '3D', // 적절한 아이콘을 선택하세요
    result: threeDFileLoader,
    title: 'Load 3D Model'
};

export const defaultActions = {
    italic,
    bold,
    underline,
    strikethrough,
    textColorMenu,
    alignMenu,
    // image,
    line,
    link,
    olist,
    paragraph,
    quote,
    ulist,
    filesMenu,
    load3DModel,
    code
}