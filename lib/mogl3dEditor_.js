export class MOGL3D {
    
    constructor( element, options = {} ) {

        this.element = element;
        this.options = options;
        this.actions = options.actions || Object.keys( this.defaultActions() );
        this.classes = { ...this.defaultClasses(), ...this.options.classes };
        this.formatBlock = 'formatBlock';
        this.defaultParagraphSeparatorString = 'defaultParagraphSeparator';
        this.init();
        this.initDropdownMenu()
    }

    dropdownActions () {
        return {
            fontColor: {
                icon: 'T',
                result: () => this.createColorInput( 'color', 'foreColor', 'Menu-dropdown' ),
                title: 'Font Color'
            },
            highlight: {
                icon: '<span style="border:1px solid yellow; padding:2px 6px;">T</span>',
                result: () => this.createColorInput( 'color', 'backColor', 'Menu-dropdown' ),
                title: 'Highlight Text'
            },
            removeHighlight: {
                icon: '<s>T</s>',
                result: () => { 
                    this.exec('backColor', 'transparent')
                    this.closeDropDown( 'Menu-dropdown' );
                },
                title: 'Remove Highlight'
            },
            leftAlign: {
                icon: '&#x21E4;',
                result: () => { 
                    this.exec( 'justifyLeft' ); 
                    this.closeDropDown( 'Menu-dropdown' );
                },
                title: 'LeftAlign'
            },
            rightAlign: {
                icon: '&#x21E5;',
                result: () => {
                    this.exec( 'justifyRight' );
                    this.closeDropDown( 'Menu-dropdown' );
                },
                title: 'RightAlign'
            },
            centerAlign: {
                icon: '&#x21C5;',
                result: () => {
                    this.exec( 'justifyCenter' )
                    this.closeDropDown( 'Menu-dropdown' );
                },
                title: 'CenterAlign'
            },
            image: {
                icon: '<icon style="font-size:16px;">🖼️</icon>',
                result: () => {
                    this.createIMGFileBox( 'image/*' );
                    this.closeDropDown( 'Menu-dropdown' );
                },
                title: 'Image',
            },
            files: {
                icon: '<icon style="font-size:16px;">🗃️</icon>',
                result: () => {
                    this.createZipFile();
                    this.closeDropDown( 'Menu-dropdown' );
                },
                title: 'files',
            },
            video: {
                icon: '<icon style="font-size:16px;">🎬</icon>',
                result: () => this.createModal( 'video' ),
                title: 'Video'
            },
        }
    }

    defaultActions () {
        return {

            italic: {
                icon: '<i>I</i>',
                result: () => this.exec('italic'),
                state: () => this.queryCommandState('italic'),
                title: 'Italic',
            },
            bold: {
                icon: '<b>B</b>',
                result: () => this.exec('bold'),
                state: () => this.queryCommandState('bold'),
                title: 'Bold'
            },
            underline: {
                icon: '<u>U</u>',
                result: () => this.exec('underline'),
                state: () => this.queryCommandState('underline'),
                title: 'Underline',
            },
            strikethrough: {
                icon: '<strike>S</strike>',
                result: () => this.exec('strikeThrough'),
                state: () => this.queryCommandState('strikeThrough'),
                title: 'Strike-through',
            },
            textColorMenu: {
                icon: 'T',
                result: () => {},
                init: ( button ) => {
                    this.initMenu( 
                        button, 
                        'mogl3d-content', 
                        [ 
                            this.dropdownActions().fontColor, 
                            this.dropdownActions().highlight, 
                            this.dropdownActions().removeHighlight
                        ], 
                        'TextMenu-dropdown' 
                    )
                },
                title: 'TextColorDropDown',
            },
            alignMenu: {
                icon: 'Ξ',
                result: () => {},
                init: ( button ) => {
                    this.initMenu( 
                        button, 
                        'mogl3d-content', 
                        [
                            this.dropdownActions().leftAlign, 
                            this.dropdownActions().rightAlign, 
                            this.dropdownActions().centerAlign
                        ], 
                        'AlignMenu-dropdown' 
                    )
                },
                title: 'TextAlignDropDown'
            },
            line: {
                icon: '&#8213;',
                result: () => this.exec('insertHorizontalRule'),
                divider: true,
                title: 'Horizontal Line',
            },
            olist: {
                icon: '&#35;',
                result: () => this.exec('insertOrderedList'),
                title: 'Ordered List',
            },
            paragraph: {
                icon: '&#182;',
                result: () => this.exec( this.formatBlock, '<p>'),
                title: 'Paragraph',
            },
            quote: {
                icon: '&#8220; &#8221;',
                result: () => this.exec( this.formatBlock, '<blockquote>'),
                title: 'Quote',
            },
            ulist: {
                icon: '&#8226;',
                result: () => this.exec('insertUnorderedList'),
                title: 'Unordered List',
            },
            link: {
                icon: '&#128279;',
                result: () => {
                    const url = window.prompt('Enter the link URL')
                    if (url) this.exec('createLink', url)
                },
                divider: true,
                title: 'Link',
            },
            filesMenu: {
                icon: '<icon>&#x1F4C1;</icon><icon style="font-size:7px;margin-left:2px;">&#x25BC;</icon>',
                result: () => {},
                init: ( button ) => {
                    this.initMenu( 
                        button, 
                        'mogl3d-content', 
                        [
                            this.dropdownActions().image, 
                            this.dropdownActions().files, 
                            this.dropdownActions().video, 
                            // this.defaultActions().load3DModel
                        ], 
                        'FileMenu-dropdown' 
                    )},
                title: 'FilesDropDown'
            },
            threeLogEditor: {
                icon: '<i class="fas fa-cube"></i>',
                result: () => {
                
                    const logEditorWindow = window.open('popup/threeLogEditorWindow.html', 'threeLogWindow', 'width=800,height=600');

                    // 메시지 이벤트 리스너를 메인 윈도우에 추가합니다.
                    window.addEventListener('message', (event) => {
                        // 올바른 출처의 메시지인지 검사합니다.
                        console.log('event origin: ', event.origin );
                        if ( event.origin !== "http://127.0.0.1:5500" ) return; // 'http://올바른-출처'는 새 창의 URL 출처와 일치해야 합니다.
                        if ( event.data.action === 'insertImage') {
                            // 이미지 URL을 에디터에 삽입하는 코드를 여기에 작성합니다.
                            const imageUrl = event.data.imageUrl;
                            insertImageToEditor(imageUrl);
                        }
                    }, false);
                
                    this.insertImageToEditor( imageUrl );
                    // function insertImageToEditor(imageUrl) {
                    //     const imgTag = `<img src="${imageUrl}" alt="Loaded Image"/>`;
                    //     // 'contentEditable' 영역에 imgTag를 삽입하는 로직을 추가해야 합니다.
                    //     document.querySelector('.mogl3d-content').innerHTML += imgTag;
                    // }
                
                },
                title: '3D Scene Editor'
            },
            code: {
                icon: '&lt;/&gt;',
                result: () => this.exec('formatBlock', '<pre>'),
                title: 'Code'
            },
            // load3DModel: {
            //     icon: '3D',
            //     result: threeDFileLoader,
            //     title: 'Load 3D Model'
            // },
        };
    }

    insertImageToEditor( imageUrl ) {
        const imgTag = `<img src="${ imageUrl }" alt="Loaded Image"/>`;
        document.querySelector('.mogl3d-content').innerHTML += imgTag;
    }

    defaultClasses () {
        return {
            actionbar: 'mogl3d-actionbar',
            button: 'mogl3d-button',
            content: 'mogl3d-content',
            selected: 'mogl3d-button-selected',
        };
    }

    addEventListener( parent, type, listener ) {
        parent.addEventListener( type, listener );
    }

    appendChild( parent, child ) {
        parent.appendChild( child );
    }

    exec( command, value = null ) {
        document.execCommand( command, false, value );
    }

    queryCommandState( command ) {
        return document.queryCommandState( command );
    }

    queryCommandValue( command ) {
        return document.queryCommandValue( command );
    }

    createElement( tag ) {
        return document.createElement( tag );
    }

    closeDropDown( elName ) {
        const dropdowns = document.querySelectorAll(`.${ elName }`);
        dropdowns.forEach( dropdown => {
            dropdown.style.display = 'none'; // 모든 드랍다운 숨기기
        });
    }

    createColorInput( type, execName, closeNodeName ) {
        const input = this.createElement('input');
        const mogl3d = this;
        input.type = type;
        input.oninput = (e) => {
            mogl3d.exec( execName, e.target.value );
            input.remove(); // 색상 선택 후 input 요소 제거
        };
        input.click();
        this.closeDropDown( closeNodeName );
    }

    initMenu( button, editor, execArray, name ) {
        
        let content = document.querySelector(`.${ editor }`);
        let dropdownContainer = this.createDropDownMenu( button, execArray, content, name );
        button.parentNode.replaceChild( dropdownContainer, button );
    }

    createDropDownMenu( button, itemsArray, content, id ) {
        const mogl3d = this;
        const dropdownContainer = this.createElement('div');
        dropdownContainer.className = 'dropdown';

        // 기존 버튼 복제
        const newButton = button.cloneNode(true);

        // 드롭다운 컨테이너 생성
        const dropdown = this.createElement('div');
        dropdown.id = id;
        dropdown.className = 'Menu-dropdown';

        
        Array.from( itemsArray ).forEach( action => {
            
            const button = mogl3d.createElement('button');
            button.className = 'mogl3d-button';
            button.innerHTML = action.icon;
            button.title = action.title;
            button.setAttribute('type', 'button');
            button.onclick = () => action.result() && content.focus()
        
            mogl3d.appendChild( dropdown, button )

        });

        // 새로운 부모 div에 복제한 버튼과 드롭다운 메뉴를 추가
        dropdownContainer.appendChild( newButton );
        dropdownContainer.appendChild( dropdown );

        return dropdownContainer
    }

    createIMGFileBox ( accept ) {

        const fileInput = this.createElement('input');
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
    
                    if ( selection.rangeCount > 0 ) {
            
                        range = selection.getRangeAt(0);
                        range.deleteContents(); // 현재 커서 위치의 내용을 제거
                        range.insertNode(img); // 파일 이름과 제거 버튼을 포함하는 컨테이너 삽입
            
                    } else {
                    // 선택된 범위가 없는 경우, 에디터의 첫 부분에 삽입
                        const editor = document.querySelector('.mogl3d-content');
                        editor.insertBefore( img, editor.firstChild );
                    }
    
                };
    
                reader.readAsDataURL(file);
    
            }
    
            fileInput.remove(); // 파일 입력 요소 제거
    
        };
    
        fileInput.click(); // 파일 선택기 열기
        return fileInput
    }

    createZipFile () {

        const mogl3d = this
        const fileInput = this.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.zip'; // ZIP 파일만 허용
    
        fileInput.onchange = (e) => {
            
            const file = e.target.files[0];
        
            if (file) {
                // ZIP 파일에 대한 참조를 에디터 내에 삽입
                
                // 컨테이너 div를 생성합니다.
                const container = mogl3d.createElement('div');
                container.contentEditable = false; // 파일 컨테이너는 편집 불가능하도록 설정
                container.style.display = 'inline-block'; // 인라인 블록으로 표시
                container.style.margin = '5px'; // 여백 추가
    
                const fileNameSpan = mogl3d.createElement('span');
                fileNameSpan.textContent = file.name + " "; // 파일 이름 표시
                container.appendChild( fileNameSpan );
    
                const removeButton = mogl3d.createElement('button');
                removeButton.textContent = 'x';
                removeButton.style.marginLeft = '5px';
                removeButton.onclick = () => {
                    container.remove(); // 컨테이너를 에디터에서 삭제
                };
                container.appendChild(removeButton);
    
                const selection = document.getSelection();
                let range;
        
                if ( selection.rangeCount > 0 ) {
        
                    range = selection.getRangeAt(0);
                    range.deleteContents(); // 현재 커서 위치의 내용을 제거
                    range.insertNode( container ); // 파일 이름과 제거 버튼을 포함하는 컨테이너 삽입
        
                } else {
                // 선택된 범위가 없는 경우, 에디터의 첫 부분에 삽입
                    const editor = document.querySelector('.mogl3d-content');
                    editor.insertBefore( container, editor.firstChild );
                }
                // 파일 입력 요소를 문서에서 제거합니다.
                fileInput.remove();
            }
    
        };
    
        fileInput.click(); // 파일 선택기 열기
        return fileInput
    }

    createModal ( type ) {
        // 모달 요소 생성
        closeDropDown( 'Menu-dropdown' )
        const mogl3d = this;
        const modal = this.createElement('div');
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
    
        document.body.appendChild( modal );
        modal.style.display = "block";
        return modal;
    
    }

    videoForm ( modalContent, modal ) {

        const mogl3d = this;
        const header = this.createElement('h2');
        header.textContent = 'Add Video';
    
        const inputURL = this.createElement('input');
        inputURL.type = 'text';
        inputURL.id = 'videoUrlInput';
        inputURL.placeholder = 'Enter video URL';
    
        const inputFile = this.createElement('input');
        inputFile.type = 'file';
        inputFile.id = 'videoFileInput';
        inputFile.accept = 'video/*';
    
        const insertButton = this.createElement('button');
        insertButton.textContent = 'Insert Video';
        insertButton.addEventListener('click', e => this.insertVideoFromModal( modal ))
    
        // Adding elements to modal content
        modalContent.appendChild( header );
        modalContent.appendChild( inputURL );
        modalContent.appendChild( inputFile );
        modalContent.appendChild( insertButton) ;
    
        return modalContent
    }

    closeModal( modal ) {
        
        modal.style.display = "none";
        modal.remove();
    }

    insertVideoFromModal = ( modal ) => {

        const mogl3d = this;
        const url = document.getElementById('videoUrlInput').value;
        const fileInput = document.getElementById('videoFileInput');
        const file = fileInput.files[0];

        if (url) {
            // URL로 iframe 생성
            mogl3d.insertVideoIframe( url );
        } else if (file && file.size <= 30 * 1024 * 1024) { // 30 MB 제한
            // 파일로 비디오 태그 생성
            mogl3d.insertVideoFile( file );
        } else if (file) {
            alert('File is too large. Maximum size is 30MB.');
        }
    
        this.closeModal( modal );
        // document.querySelector('.modal').style.display = 'none'; // 모달 숨기기
    }

    insertVideoIframe( url ) {

        let embedUrl = url;
    
        // 사용자가 일반 YouTube URL을 입력한 경우 embed URL로 변환
        if ( url.includes('youtube.com/watch?v=') ) {

            const videoId = url.split('v=')[1].split('&')[0]; // URL에서 비디오 ID 추출
            embedUrl = `https://www.youtube.com/embed/${videoId}`;
        
        } else if ( url.includes('youtu.be/') ) {
            
            const videoId = url.split('youtu.be/')[1];
            embedUrl = `https://www.youtube.com/embed/${videoId}`;

        }
    
        const iframe = this.createElement('iframe');
        iframe.src = embedUrl;
        iframe.style.width = "560px";
        iframe.style.height = "315px";
        iframe.frameBorder = "0";
        iframe.allow = "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture";
        iframe.allowFullscreen = true;
        document.querySelector('.mogl3d-content').appendChild( iframe );

        return iframe;

    }

    insertVideoFile( file ) {

        const editorContent = document.querySelector('.mogl3d-content');
    
        const beforeSpace = this.createElement('p');
        beforeSpace.contentEditable = true;
        beforeSpace.innerHTML = "<br>";  // 비디오 위에 텍스트 입력 공간
    
        const video = this.createElement('video');
        video.controls = true;

        const source = this.createElement('source');
        source.src = URL.createObjectURL(file);
        source.type = file.type;
        video.appendChild(source);
    
        const afterSpace = this.createElement('p');
        afterSpace.contentEditable = true;
        afterSpace.innerHTML = "<br>";  // 비디오 아래에 텍스트 입력 공간
    
        editorContent.appendChild(beforeSpace);
        editorContent.appendChild(video);
        editorContent.appendChild(afterSpace);

        return editorContent;
    }

    chkDropID ( el ) {
        
        return new Promise( resolve => {
            
            for( let i = 0; i < el.childNodes.length; i++ ) {
                
                if( el.childNodes[i].id !== '') {
                    resolve( el.childNodes[i].id );
                } 
            }
            
        }) 

    }

    init() {

        const mogl3d = this;
        const actionbar = this.createElement('div');
        actionbar.className = this.classes.actionbar;
        this.element.appendChild( actionbar );

        const content = this.createElement('div');
        content.contentEditable = true;
        content.className = this.classes.content;
        this.element.appendChild( content );

        this.actions.forEach( actionKey => {
            
            const action = mogl3d.defaultActions()[ actionKey ];
            const button = mogl3d.createElement('button');
            button.className = mogl3d.classes.button;
            button.innerHTML = action.icon;
            button.setAttribute('type', 'button');
            button.title = action.title;
            button.addEventListener('click', e => {
                console.log('버튼 클릭');
                action.result();
                content.focus();
            })

            if( action.state ) {
                const handler = () => button.classList[action.state() ? 'add' : 'remove'](mogl3d.classes.selected)
                mogl3d.addEventListener( content, 'keyup', handler )
                mogl3d.addEventListener( content, 'mouseup', handler )
                mogl3d.addEventListener( button, 'click', handler )
            }

            if( action.divider ) {
                const span = mogl3d.createElement('span');
                span.className = 'divider';
                mogl3d.appendChild( actionbar, span );
            }

            actionbar.appendChild(button);
        });

        this.actions.forEach(( actionKey ) => {

            const action = mogl3d.defaultActions()[ actionKey ];
            // console.log('action: ', action );
            if ( action.init ) {
    
                const button = document.querySelector(`button[title="${action.title}"]`);
                if (button) action.init(button);
                
            }
        });

    }

    initDropdownMenu() {

        let dropdownWrap = document.querySelectorAll('.dropdown');
        let dropdownNodesID = [ 'TextMenu-dropdown', 'AlignMenu-dropdown', 'FileMenu-dropdown' ]

        dropdownWrap.forEach( dropEl => {

            let editor = document.querySelector('#editor');
            
            dropEl.addEventListener('click', async e => {
        
                let target = e.target;
                let dropdownWrapper = e.target.parentNode;
                let dropMenuEl = ( dropdownWrapper.nodeName === 'BUTTON') ? dropdownWrapper.parentNode : dropdownWrapper; 
                let dropID = await this.chkDropID( dropMenuEl );
                
                dropdownNodesID.forEach( id => {
                    
                    let node = document.querySelector(`#${id}`);
                    if( id !== dropID ) node.style.display = 'none';
                    
    
                });

                let selectNode = document.querySelector(`#${dropID}`);
                console.log( '선택노드: ', selectNode.style.display )
                if( selectNode.style.display === 'block' ) {
                    selectNode.style.display = 'none';
                } else {
                    selectNode.style.display = 'block';
                }

                e.stopPropagation(); // 이벤트 버블링 방지

            })

        });

        document.addEventListener('click', (e) => {
            const editor = document.querySelector('.mogl3d-content');
            let target = e.target;
            dropdownNodesID.map( id => {
            
                let node = document.querySelector(`#${id}`);
                if( editor.contains( target) && node.style.display === 'block' ) node.style.display = 'none';
    
            })
        });

    }

    

}