(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], function() {
            return factory();
        });
        
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        module.exports = factory();
    
    } else {
        // Browser globals (root is window)
        root.MOGL3D = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';
    
    // The actual constructor of the MOGL3D class
    function MOGL3D(element, options = {}) {

        this.name = 'MOGL3D Library';
        this.loader = null;
        this.modules = null;
        this.element = element;
        this.options = options;
        this.threeSceneNum = 0;
        
        if( this.options.plugins && this.options.plugins.length > 0 ) {
            let mogl3d = this;
            this.options.plugins.map( plugin => {
                for( let key in plugin ) {
                    if( key === 'threeModules' ) mogl3d.modules = plugin[key] 
                }
            })
        }
        
        this.actions = options.actions || Object.keys(this.defaultActions());
        this.classes = { ...this.defaultClasses(), ...this.options.classes };
        this.formatBlock = 'formatBlock';
        this.defaultParagraphSeparatorString = 'defaultParagraphSeparator';
        
        this.init();
        this.initDropdownMenu();
        
    }

    MOGL3D.prototype.dropdownActions = function () {
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
            load3DModel: {
                icon: '3D',
                result: () => this.threeDFileLoader(),
                title: 'Load 3D Model'
            },
        }
    };

    MOGL3D.prototype.defaultActions = function () {
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
                            this.dropdownActions().load3DModel
                        ], 
                        'FileMenu-dropdown' 
                    )},
                title: 'FilesDropDown'
            },
            code: {
                icon: '&lt;/&gt;',
                result: () => this.exec('formatBlock', '<pre>'),
                title: 'Code'
            },
        }
    };

    MOGL3D.prototype.init = function () {
        const mogl3d = this;
        const actionbar = document.createElement('div');
        actionbar.className = this.classes.actionbar;
        this.element.appendChild( actionbar );

        const content = document.createElement('div');
        content.contentEditable = true;
        content.className = this.classes.content;

        const defaultParagraphSeparator = this.options[this.defaultParagraphSeparatorString] || 'div';
        content.oninput = ({ target: { firstChild } }) => {
            if (firstChild && firstChild.nodeType === 3) this.exec(this.formatBlock, `<${defaultParagraphSeparator}>`)
            else if (content.innerHTML === '<br>') content.innerHTML = '';
            if( this.options.onChange ) this.options.onChange(content.innerHTML)
        }
        
        content.onkeydown = event => {
            if (event.key === 'Enter' && this.queryCommandValue(this.formatBlock) === 'blockquote') {
                setTimeout(() => this.exec(this.formatBlock, `<${defaultParagraphSeparator}>`), 0)
            }
        }

        this.element.appendChild( content );

        this.actions.forEach( actionKey => {
            
            const action = mogl3d.defaultActions()[ actionKey ];
            const button = document.createElement('button');
            button.className = mogl3d.classes.button;
            button.innerHTML = action.icon;
            button.setAttribute('type', 'button');
            button.title = action.title;
            button.addEventListener('click', e => {
                
                action.result();
                content.focus();
            })

            if( action.state ) {
                const handler = () => button.classList[action.state() ? 'add' : 'remove'](mogl3d.classes.selected);
                content.addEventListener( 'keyup', handler );
                content.addEventListener( 'mouseup', handler );
                button.addEventListener( 'click', handler );
                
            }

            if( action.divider ) {
                const span = document.createElement('span');
                span.className = 'divider';
                actionbar.appendChild( span );
            }

            actionbar.appendChild(button);
        });

        this.actions.forEach(( actionKey ) => {

            const action = mogl3d.defaultActions()[ actionKey ];
            
            if ( action.init ) {
    
                const button = document.querySelector(`button[title="${action.title}"]`);
                if (button) action.init(button);
                
            }
        });
    };

    MOGL3D.prototype.initDropdownMenu = function () {
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
    };

    // Add more methods as needed
    MOGL3D.prototype.insertImageToEditor = function (imageUrl) {
        const imgTag = `<img src="${imageUrl}" alt="Loaded Image"/>`;
        document.querySelector('.mogl3d-content').innerHTML += imgTag;
    };

    MOGL3D.prototype.defaultClasses = function () {
        return {
            actionbar: 'mogl3d-actionbar',
            button: 'mogl3d-button',
            content: 'mogl3d-content',
            selected: 'mogl3d-button-selected',
        };
    };

    MOGL3D.prototype.exec = function( command, value = null ) {
        document.execCommand( command, false, value );
    }

    MOGL3D.prototype.queryCommandState = function( command ) {
        return document.queryCommandState( command );
    }

    MOGL3D.prototype.queryCommandValue = function( command ) {
        return document.queryCommandValue( command );
    }

    MOGL3D.prototype.closeDropDown = function( elName ) {
        const dropdowns = document.querySelectorAll(`.${ elName }`);
        dropdowns.forEach( dropdown => {
            dropdown.style.display = 'none'; // 모든 드랍다운 숨기기
        });
    }

    MOGL3D.prototype.createColorInput = function( type, execName, closeNodeName ) {
        const input = document.createElement('input');
        const mogl3d = this;
        input.type = type;
        input.oninput = (e) => {
            mogl3d.exec( execName, e.target.value );
            input.remove(); // 색상 선택 후 input 요소 제거
        };
        input.click();
        this.closeDropDown( closeNodeName );
    }

    // 3D
    MOGL3D.prototype.threeDFileLoader = function() {

        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.multiple = true;
        fileInput.onchange = async e => {

            const files = e.target.files;
            
            try {
                let filesMap = null;
                let modules = new this.modules({
                    editor: this.element
                });
                // let newLoader = new this.loader();
                
                modules.loadFiles( files, filesMap, ( res ) => {
    
                    this.insert3DModelAtLine( modules, res );
                    if( this.options.on3DLoad ) {
                        this.options.on3DLoad( res, this.threeSceneNum );
                    }
                });
    
            } catch ( err ) {
                console.error('파일 로딩 에러:', err);
            }
        
        }

        fileInput.click();
        this.closeDropDown( 'Menu-dropdown' );

    }

    MOGL3D.prototype.insert3DModelAtLine = function( modules, res ) {
        
        this.threeSceneNum++;
        console.log('res: ', res );
        const editor = this.element;
        const selection = window.getSelection();

        // 씬을 포함하는 컨테이너 전에 편집 가능한 div 추가
        // const editableDivBefore = document.createElement('div');
        // editableDivBefore.contentEditable = true;
        // editableDivBefore.style.width = '60%'; // 또는 적절한 비율
        // editableDivBefore.style.display = 'inline-block';
        // editableDivBefore.style.float = 'left';
        // editableDivBefore.style.marginRight = '10px'; // 3D 씬과의 간격을 위한 마진
        // editableDivBefore.innerHTML = '&nbsp;'; // Non-breaking space, 커서를 위한 공간

    

        // 새 div 요소를 생성하여 3D 씬을 포함하도록 설정합니다.
        let sceneContainer = document.createElement('div');
        sceneContainer.title = `threeSceneNum${this.threeSceneNum}`
        sceneContainer.className = `three-scene`;

        let container = modules.init( sceneContainer, res );
        // this.adjustEditorHeight(this.element, container);

        // 삽입 전에 커서 위치를 위한 빈 div 추가
        const emptyLineBefore = document.createElement('div');
        // emptyLineBefore.contentEditable = true;
        emptyLineBefore.innerHTML = '<br>';
        
        // 새로운 콘텐츠를 임시 div에 추가
        const tempContent = document.createElement('div');
        tempContent.appendChild(emptyLineBefore);
        tempContent.appendChild(container);
        
        // 삽입 후 커서 위치를 설정할 빈 div 추가
        const emptyLineAfter = document.createElement('div');
        // emptyLineAfter.contentEditable = true;
        emptyLineAfter.innerHTML = '<br>';
        tempContent.appendChild(emptyLineAfter);
        
        if (!selection.rangeCount) {
            // 첫 번째 텍스트 라인이 도구 상자가 아닌 경우에만 처리
            // 커서를 첫 줄로 설정
            const editorContent = document.querySelector('.mogl3d-content');
            const range = document.createRange();
            range.selectNodeContents(emptyLineBefore);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
            editorContent.appendChild( tempContent );
            // 새로운 콘텐츠 삽입 후 input 이벤트 발생시키기
            this.triggerInputEvent(editorContent);
            
        } else {
            // 사용자가 선택한 위치에 삽입
            const editorContent = document.querySelector('.mogl3d-content');
            const range = selection.getRangeAt(0);
            range.deleteContents();  // 현재 선택된 컨텐츠를 제거
            range.insertNode(tempContent);
            
            // 삽입된 내용 뒤에 커서 위치 조정
            range.setStartAfter(emptyLineAfter);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
            this.triggerInputEvent(editorContent);
        }

    }

    MOGL3D.prototype.triggerInputEvent = function(element) {
        // input 이벤트 생성
        const event = new Event('input', {
            bubbles: true,
            cancelable: true,
        });
    
        // 이벤트 디스패치
        element.dispatchEvent(event);
    };

    // 3D End

    MOGL3D.prototype.initMenu = function( button, editor, execArray, name ) {
        let content = document.querySelector(`.${ editor }`);
        let dropdownContainer = this.createDropDownMenu( button, execArray, content, name );
        button.parentNode.replaceChild( dropdownContainer, button );
    }

    MOGL3D.prototype.createDropDownMenu = function( button, itemsArray, content, id ) {
        const mogl3d = this;
        const dropdownContainer = document.createElement('div');
        dropdownContainer.className = 'dropdown';

        // 기존 버튼 복제
        const newButton = button.cloneNode(true);

        // 드롭다운 컨테이너 생성
        const dropdown = document.createElement('div');
        dropdown.id = id;
        dropdown.className = 'Menu-dropdown';

        
        Array.from( itemsArray ).forEach( action => {
            
            const button = document.createElement('button');
            button.className = 'mogl3d-button';
            button.innerHTML = action.icon;
            button.title = action.title;
            button.setAttribute('type', 'button');
            button.onclick = () => action.result() && content.focus()
        
            dropdown.appendChild( button );
            // mogl3d.appendChild( dropdown, button )

        });

        // 새로운 부모 div에 복제한 버튼과 드롭다운 메뉴를 추가
        dropdownContainer.appendChild( newButton );
        dropdownContainer.appendChild( dropdown );

        return dropdownContainer
    }

    MOGL3D.prototype.createIMGFileBox = function( accept ) {
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

    MOGL3D.prototype.createZipFile = function() {
        const mogl3d = this
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
                container.appendChild( fileNameSpan );
    
                const removeButton = document.createElement('button');
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

    MOGL3D.prototype.createModal = function( type ) {

        this.closeDropDown( 'Menu-dropdown' )
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
            let form = this.videoForm( modalContent, modal );
            modal.appendChild(form);
        }
    
        document.body.appendChild( modal );
        modal.style.display = "block";
        return modal;
    }

    MOGL3D.prototype.videoForm = function( modalContent, modal ) {
        
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
        insertButton.addEventListener('click', e => this.insertVideoFromModal( modal ))
    
        // Adding elements to modal content
        modalContent.appendChild( header );
        modalContent.appendChild( inputURL );
        modalContent.appendChild( inputFile );
        modalContent.appendChild( insertButton) ;
    
        return modalContent
    }

    MOGL3D.prototype.closeModal = function( modal ) {
        modal.style.display = "none";
        modal.remove();
    }

    MOGL3D.prototype.insertVideoFromModal = function( modal ) {
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
    }

    MOGL3D.prototype.insertVideoIframe = function( url ) {
        let embedUrl = url;
    
        // 사용자가 일반 YouTube URL을 입력한 경우 embed URL로 변환
        if ( url.includes('youtube.com/watch?v=') ) {

            const videoId = url.split('v=')[1].split('&')[0]; // URL에서 비디오 ID 추출
            embedUrl = `https://www.youtube.com/embed/${videoId}`;
        
        } else if ( url.includes('youtu.be/') ) {
            
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
        document.querySelector('.mogl3d-content').appendChild( iframe );

        return iframe;
    }

    MOGL3D.prototype.insertVideoFile = function( file ) {
        
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

        return editorContent;
    }

    MOGL3D.prototype.chkDropID = function( el ) {
        return new Promise( resolve => {
            
            for( let i = 0; i < el.childNodes.length; i++ ) {
                
                if( el.childNodes[i].id !== '') {
                    resolve( el.childNodes[i].id );
                } 
            }
            
        })
    }

    // Continue to add more prototype methods...

    return MOGL3D;
}));
