export const addEventListener = (parent, type, listener) => parent.addEventListener(type, listener)

export const appendChild = (parent, child) => parent.appendChild(child)

export const createElement = tag => document.createElement(tag)

export const defaultParagraphSeparatorString = 'defaultParagraphSeparator'

export const exec = (command, value = null) => document.execCommand(command, false, value)

export const formatBlock = 'formatBlock'

export const queryCommandState = command => document.queryCommandState(command)

export const queryCommandValue = command => document.queryCommandValue(command)

export const createColorInput = ( type, execName, closeNodeName ) => {

    const input = document.createElement('input');
    input.type = type;
    input.oninput = (e) => {
        exec( execName, e.target.value );
        input.remove(); // 색상 선택 후 input 요소 제거
    };
    input.click(); // 자동으로 색상 선택기 열기
    closeDropDown( closeNodeName );
}

export const closeDropDown = ( elName ) => {
    
    const dropdowns = document.querySelectorAll(`.${elName}`);
    dropdowns.forEach( dropdown => {
        dropdown.style.display = 'none'; // 모든 드랍다운 숨기기
    });

}

export const initMenu = ( button, editor, execArray, name ) => {
    
    let content = document.querySelector(`.${ editor }`);
    let dropdownContainer = createDropDownMenu( button, execArray, content, name );
    button.parentNode.replaceChild(dropdownContainer, button);

}

export const createDropDownMenu = ( button, itemsArray, content, id ) => {

    const dropdownContainer = document.createElement('div');
    dropdownContainer.className = 'dropdown';

    // 기존 버튼 복제
    const newButton = button.cloneNode(true);

    // 드롭다운 컨테이너 생성
    const dropdown = document.createElement('div');
    dropdown.id = id;
    dropdown.className = 'Menu-dropdown';

    Array.from( itemsArray ).forEach( action => {
        
        const button = createElement('button');
        button.className = 'mogl3d-button';
        button.innerHTML = action.icon;
        button.title = action.title;
        button.setAttribute('type', 'button');
        button.onclick = () => action.result() && content.focus()
    
        appendChild( dropdown, button )

    });

    // 새로운 부모 div에 복제한 버튼과 드롭다운 메뉴를 추가
    dropdownContainer.appendChild( newButton );
    dropdownContainer.appendChild( dropdown );

    return dropdownContainer

}

export const createIMGFileBox = ( accept ) => {

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = accept //'image/*';
    fileInput.onchange = (e) => {
        
        const file = e.target.files[0];
    
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
        
                const img = document.createElement('img');
                img.src = e.target.result;

                const selection = document.getSelection();
                let range;

                if (selection.rangeCount > 0) {
        
                    range = selection.getRangeAt(0);
                    range.deleteContents(); // 현재 커서 위치의 내용을 제거
                    range.insertNode(img); // 파일 이름과 제거 버튼을 포함하는 컨테이너 삽입
        
                } else {
                // 선택된 범위가 없는 경우, 에디터의 첫 부분에 삽입
        
                    const editor = document.querySelector('.mogl3d-content');
                    editor.insertBefore(img, editor.firstChild);
                }

            };

            reader.readAsDataURL(file);

        }

        fileInput.remove(); // 파일 입력 요소 제거

    };

    fileInput.click(); // 파일 선택기 열기

}

export const createZipFile = () => {

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

}

export const createModal = ( type ) => {
    // 모달 요소 생성
    closeDropDown( 'Menu-dropdown' )
    const modal = document.createElement('div');
    modal.setAttribute('class', 'modal');
    modal.id = 'videoModal';

    // 모달 콘텐츠를 위한 Div
    const modalContent = document.createElement('div');
    modalContent.setAttribute('class', 'modal-content');
    modal.appendChild(modalContent);

    // 닫기 버튼
    const closeButton = document.createElement('span');
    closeButton.setAttribute('class', 'modalClose');
    closeButton.id = 'videoModalClose';
    closeButton.textContent = '×';
    closeButton.addEventListener('click', e => closeModal(modal))
    
    modalContent.appendChild(closeButton);

    if( type === 'video' ) {
        let form = videoForm( modalContent, modal );
        modal.appendChild(form);
    }

    document.body.appendChild(modal);
    modal.style.display = "block";

}

function videoForm ( modalContent, modal ) {

    const header = document.createElement('h2');
    header.textContent = 'Add Video';

    const inputURL = document.createElement('input');
    inputURL.type = 'text';
    inputURL.id = 'videoUrlInput';
    inputURL.placeholder = 'Enter video URL';

    const inputFile = document.createElement('input');
    inputFile.type = 'file';
    inputFile.id = 'videoFileInput';
    inputFile.accept = 'video/*';

    const insertButton = document.createElement('button');
    insertButton.textContent = 'Insert Video';
    insertButton.addEventListener('click', e => insertVideoFromModal( modal ))

    // Adding elements to modal content
    modalContent.appendChild(header);
    modalContent.appendChild(inputURL);
    modalContent.appendChild(inputFile);
    modalContent.appendChild(insertButton);

    return modalContent
}

function closeModal( modal ) {
    console.log('e modal: ', modal );
    modal.style.display = "none";
    modal.remove();
}

window.insertVideoFromModal = ( modal ) => {

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

    closeModal( modal );
    // document.querySelector('.modal').style.display = 'none'; // 모달 숨기기
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