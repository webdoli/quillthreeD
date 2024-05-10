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
        this.uploadModels = [];

        this.multiSelection = {};
        this.test_first;
        this.test_last;

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
                icon: '<img src="./css/icons/icons-type-color.png" class="mogl3d-icons-type">',
                result: () => this.createColorInput( 'color', 'foreColor', 'Menu-dropdown' ),
                title: 'Font Color'
            },
            fontType: {
                icon: `
                    <label for="fontfamily">font family:</label>
                    <select id="fontfamily">
                        <option value="Arial">Arial</option>
                        <option value="Verdana">Verdana</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Courier New">Courier New</option>
                        <option value="Georgia">Georgia</option>
                    </select>
                `,
                result: () => { 
                    const select = document.getElementById('fontfamily');
                    select.addEventListener('change', () => {
                        this.exec('fontName', select.value);
                    });
                },
                title: 'Font Color'
            },
            fontSize: {
                icon: `
                    <label for="fontsize">size:</label>
                    <select id="fontsize">
                        <option data-type="placeholder" selected> </option>
                        <option value="12px">Small</option>
                        <option value="16px">Medium</option>
                        <option value="20px">Large</option>
                        <option value="24px">Extra Large</option>
                    </select>
                `,
                result: () => {
                    this.initFontSizeListener()
                    // const select = document.getElementById('fontsize');
                    // this.wrapTextWithSpan( select );
                    
                },
                title: 'Font Color'
            },
            highlight: {
                icon: '<img src="./css/icons/icons-type-bg.png" class="mogl3d-icons-type">',
                result: () => this.createColorInput( 'color', 'backColor', 'Menu-dropdown' ),
                title: 'Highlight Text'
            },
            removeHighlight: {
                icon: '<img src="./css/icons/icons-type-erase.png" class="mogl3d-icons-type">',
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
                icon: '<img src="./css/icons/icons-image-file-add.png" class="mogl3d-icons-type">',
                result: () => {
                    this.createIMGFileBox( 'image/*' );
                    this.closeDropDown( 'Menu-dropdown' );
                },
                title: 'Image',
            },
            files: {
                icon: '<img src="./css/icons/icons-zip.png" class="mogl3d-icons-type">',
                result: () => {
                    this.createZipFile();
                    this.closeDropDown( 'Menu-dropdown' );
                },
                title: 'files',
            },
            video: {
                icon: '<img src="./css/icons/icons-video-upload_.png" class="mogl3d-icons-type">',
                result: () => this.createModal( 'video' ),
                title: 'Video'
            },
            load3DModel: {
                icon: '<img src="./css/icons/icons-3d_.png" class="mogl3d-icons-type">',
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
            fontMenu: {
                icon: '<img src="./css/icons/icons-font_menus.png" class="mogl3d-icons">',
                result: () => {},
                init: ( button ) => {
                    this.initMenu( 
                        button, 
                        'mogl3d-content', 
                        [ 
                            this.dropdownActions().fontType, 
                            this.dropdownActions().fontSize, 
                        ], 
                        'FontMenu-dropdown' 
                    )
                },
                title: 'FontDropDown',
            },
            textColorMenu: {
                icon: '<img src="./css/icons/icons-type-Menus.png" class="mogl3d-icons">',
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
            // link: {
            //     icon: '&#128279;',
            //     result: () => {
            //         const url = window.prompt('Enter the link URL')
            //         if (url) this.exec('createLink', url)
            //     },
            //     divider: true,
            //     title: 'Link',
            // },
            filesMenu: {
                icon: '<img src="./css/icons/icons-upload_menus_.png" class="mogl3d-icons">',
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
                
                    // this.insertImageToEditor( imageUrl );
                    function insertImageToEditor(imageUrl) {
                        const imgTag = `<img src="${imageUrl}" alt="Loaded Image"/>`;
                        // 'contentEditable' 영역에 imgTag를 삽입하는 로직을 추가해야 합니다.
                        document.querySelector('.mogl3d-content').innerHTML += imgTag;
                    }
                
                },
                title: '3D Scene Editor'
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
        // content.oninput = ({ target: { firstChild } }) => {
        //     if (firstChild && firstChild.nodeType === 3) this.exec(this.formatBlock, `<${defaultParagraphSeparator}>`)
        //     else if (content.innerHTML === '<br>') content.innerHTML = '';
        //     if( this.options.onChange ) this.options.onChange( content.innerHTML, this.uploadModels )
        // }
        
        // content.onkeydown = event => {
        //     if (event.key === 'Enter' && this.queryCommandValue(this.formatBlock) === 'blockquote') {
        //         setTimeout(() => this.exec(this.formatBlock, `<${defaultParagraphSeparator}>`), 0)
        //     }
        // }

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

            // 중간 가림막 넣기
            // if( action.divider ) {
            //     const span = document.createElement('span');
            //     span.className = 'divider';
            //     actionbar.appendChild( span );
            // }

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
                
                if( selectNode.style.display === 'flex' ) {
                    selectNode.style.display = 'none';
                } else {
                    selectNode.style.display = 'flex';
                }

                e.stopPropagation(); // 이벤트 버블링 방지

            })

        });

        document.addEventListener('click', (e) => {
            
            const editor = document.querySelector('.mogl3d-content');
            let target = e.target;
            dropdownNodesID.map( id => {
                
                let node = document.querySelector(`#${id}`);
                
                if( node.style.display === 'flex' ) node.style.display = 'none';
    
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
                    // if( this.options.on3DLoad ) {
                    //     this.options.on3DLoad( res, this.threeSceneNum );
                    // }
                });
    
            } catch ( err ) {
                console.error('파일 로딩 에러:', err);
            }
        
        }

        fileInput.click();
        this.closeDropDown( 'Menu-dropdown' );

    }

    MOGL3D.prototype.getModels = function() {
        
        if( this.uploadModels.length > 0 ) {
            return this.uploadModels
        }
    }

    MOGL3D.prototype.insert3DModelAtLine = function( modules, res ) {
        
        this.threeSceneNum++;
        
        const editor = this.element;
        const selection = window.getSelection();
        let range;

        // 새 div 요소를 생성하여 3D 씬을 포함하도록 설정합니다.
        let wrapper = document.createElement('div');
        wrapper.style.display = 'inline-block';

        let empty_before = document.createElement('span');
        empty_before.textContent = "\u00A0";
        
        let empty_after = document.createElement('span');
        empty_after.textContent = "\u00A0";

        let sceneContainer = document.createElement('div');
        sceneContainer.title = `threeSceneNum${this.threeSceneNum}`
        sceneContainer.className = `three-scene`;

        
        this.uploadModels.push({
            [sceneContainer.title]: res
        });

        let container = modules.init( sceneContainer, res );
        // this.adjustEditorHeight(this.element, container);

        wrapper.appendChild( empty_before );
        wrapper.appendChild( container );
        wrapper.appendChild( empty_after );

        // 삽입 전에 커서 위치를 위한 빈 div 추가
        const emptyLineBefore = document.createElement('div');
        emptyLineBefore.textContent = "\u00A0";
        
        // 새로운 콘텐츠를 임시 div에 추가
        const tempContent = document.createElement('div');
        tempContent.appendChild(emptyLineBefore);
        tempContent.appendChild(wrapper);
        
        // 삽입 후 커서 위치를 설정할 빈 div 추가
        const emptyLineAfter = document.createElement('div');
        emptyLineAfter.textContent = "\u00A0";
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
            // this.triggerInputEvent(editorContent);
            
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
            // this.triggerInputEvent(editorContent);
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

    // 초기화 함수에서 이벤트 리스너 설정
    MOGL3D.prototype.initFontSizeListener = function() {

        const select = document.getElementById('fontsize');
        if (!select) return;

        select.removeEventListener('change', this.handleFontSizeChange); // 기존 리스너 제거
        this.handleFontSizeChange = ( event ) => {

            const sizeValue = select.value;
            const selection = window.getSelection();
            
            if (!selection.rangeCount) return;
            this.wrapTextWithSpan(selection, "fontSize", sizeValue);
        
        };
        
        select.addEventListener('change', this.handleFontSizeChange);
    
    };

    MOGL3D.prototype.wrapTextWithSpan = function( selection, styleProperty, value  ) {

        let range = selection.getRangeAt(0);
        // const selectedNode = range.cloneContents();
        const multiLine = ( selection.toString().split('\n').length > 1 ) ? true : false;
        
        //단일 라인
        if( !multiLine ) {
            
            let extractContents = range.extractContents();
            let commonNode = range.commonAncestorContainer;
            let motherNode = this.findParentNode( commonNode, 'DIV' );
            
            this.removeChildNode( extractContents, 'span', 'mogl3d-font-span' );

            let newSpan = document.createElement('span');
            newSpan.style[styleProperty] = value;
            newSpan.className = 'mogl3d-font-span';
            newSpan.appendChild( extractContents );
            newSpan.normalize();

            range.insertNode( newSpan );
            this.removeEmptyNodes( motherNode )

        } 
        
        if( multiLine ) {
            
            let cloneNodes = range.cloneContents();
            let startNode = range.startContainer; 
            let endNode = range.endContainer;
            let startMotherNode = this.findParentNode( startNode, 'DIV' );
            let endMotherNode = this.findParentNode( endNode, 'DIV' );
            let rootNode = startMotherNode.parentNode;

            range.deleteContents();
            let newRange = document.createRange();
            
            //선택된 노드 내부의 빈 태그 존재시 > 삭제
            this.removeEmptyNodes( startMotherNode );
            this.removeEmptyNodes( endMotherNode );
            
            let firstNode = cloneNodes.firstChild;
            let lastNode = cloneNodes.lastChild;

            // 선택된 range범위 내 mogl3d-font-span태그가 포함된 경우 삭제
            this.removeChildNode( firstNode, 'span', 'mogl3d-font-span' );
            this.removeChildNode( lastNode, 'span', 'mogl3d-font-span' );

            // 선택 첫 노드
            let firstWrapper = document.createElement('span');
            firstWrapper.className = 'mogl3d-font-span';
            firstWrapper.style[styleProperty] = value;

            // 선택 중간 노드 부분 
            let midWrappers = [];
            
            let tmpMidClone = cloneNodes.cloneNode( true );
            let midNodeLength = tmpMidClone.childNodes.length - 1;
            Array.from( tmpMidClone.childNodes ).forEach( ( midNode, idx ) => {

                if( idx !== 0 && idx !== midNodeLength ) {
                    
                    // 1] 선택된 노드 내부의 빈 태그 존재시 > 삭제
                    this.removeEmptyNodes( midNode );

                    // 2] 중간 노드 받아서 하위 mogl3d-font-span태그 포함되면 모두 삭제
                    this.removeChildNode( midNode, 'span', 'mogl3d-font-span' );
                    
                    // 3] div wrapper를 span으로 변경하기
                    let midWrapper = document.createElement('span');
                    midWrapper.className = 'mogl3d-font-span';
                    midWrapper.style[styleProperty] = value;

                    // 4] div wrapper만들어서 span을 상위에 덮어쓰기
                    let midNodeSpan = this.changeNodeToNode( midNode, midWrapper );
                    let tmpDiv = document.createElement('div');
                    tmpDiv.appendChild( midNodeSpan );

                    // 5] midWrapper 배열에 넣기
                    midWrappers.push( tmpDiv );

                }

            })

            // 선택 마지막 노드
            let lastWrapper = document.createElement('span');
            lastWrapper.className = 'mogl3d-font-span';
            lastWrapper.style[styleProperty] = value;

            //선택된 노드의 wrapper(보통 div)껍데기를 fontSpan으로 변경함
            let firstNodeSpan = this.changeNodeToNode( firstNode, firstWrapper );
            let lastNodeSpan = this.changeNodeToNode( lastNode, lastWrapper );
            firstNodeSpan.normalize();
            lastNodeSpan.normalize();

            startMotherNode.appendChild( firstNodeSpan );
            endMotherNode.insertBefore( lastNodeSpan, endMotherNode.firstChild );

            // 6] midWrapper 배열에서 노드를 꺼내서 motherNode의 lastNode앞에 집어넣기
            midWrappers.map( midNode => {
                midNode.normalize();
                rootNode.insertBefore( midNode, endMotherNode );
            })

            // 범위 재설정
            newRange.setStartBefore( firstNodeSpan );
            newRange.setEndAfter( lastNodeSpan );
            selection.removeAllRanges();
            selection.addRange( newRange );
        }

    }

    MOGL3D.prototype.removeEmptyNodes = function( node ) {

        if (!node) return;

        // 모든 자식 노드를 순회
        for (let i = 0; i < node.childNodes.length; i++) {
            const child = node.childNodes[i];

            // 재귀적으로 자식 노드의 빈 노드를 확인
            this.removeEmptyNodes(child);

            // 자식이 빈 텍스트 노드이거나 빈 요소인 경우 제거
            if ((child.nodeType === Node.ELEMENT_NODE && child.innerHTML === '') ||
                (child.nodeType === Node.TEXT_NODE && child.textContent.trim() === '')) {
                node.removeChild(child);
                i--; // 노드가 제거된 후 인덱스 조정
            }
        }
    }

    MOGL3D.prototype.changeNodeToNode = function( target, convert ) {
        
        // console.log('target: ', target );
        let cloneTarget = target.cloneNode(true);

        while( cloneTarget.firstChild ) {
            convert.appendChild( cloneTarget.firstChild );
        }
        // console.log('convert: ', convert );
        return convert;

    }

    MOGL3D.prototype.findChildIndex = function ( parent, element ) {

        // 부모 노드의 모든 자식 노드를 배열로 변환
        let children = Array.prototype.slice.call(parent.childNodes);
        // let index = children.indexOf( element ) + 1;
        let index = children.indexOf( element );

        return index;

    }

    MOGL3D.prototype.extractText = function( node ) {
        
        let text = '';
        // 노드가 텍스트 노드인 경우, 텍스트를 추가
        if (node.nodeType === Node.TEXT_NODE) {
            text += node.nodeValue;
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            // 요소 노드인 경우, 모든 자식 노드를 재귀적으로 처리
            node.childNodes.forEach(child => {
                text += this.extractText(child);
            });
        }
        return text;

    }

    MOGL3D.prototype.findParentNode = function( node, tag ) {
        
        while( node !== null && node.tagName !== tag ) {
            node = node.parentNode;
        }

        return node;
    }

    MOGL3D.prototype.removeChildNode = function( node, tag, className ) {
        
        let class_ = ( className ) ? className : null;
        const nodes = node.querySelectorAll( tag );

        nodes.forEach( el => {
            
            if( el.className === class_ ) {
                while (el.firstChild) {
                    el.parentNode.insertBefore(el.firstChild, el);
                }
                
                el.parentNode.removeChild(el);
            }
            
        });

        // return node;

    }

    MOGL3D.prototype.removeNullNode = function( node ) {

        Array.from( node.childNodes ).forEach( child => {

            this.removeNullNode( child );

            if( this.isNodeEmpty( child ) ) {
                node.removeChild( child );
            }

        })

    }

    MOGL3D.prototype.isNodeEmpty = function ( node ) {

        if (node.nodeType === Node.ELEMENT_NODE) {
            
            return node.childNodes.length === 0 || this.areAllChildrenEmpty( node );
        
        } else if (node.nodeType === Node.TEXT_NODE) {

            return !node.textContent.trim();

        }

        return false;

    }

    MOGL3D.prototype.areAllChildrenEmpty = function( node ) {

        for (let i = 0; i < node.childNodes.length; i++) {
            if (! this.isNodeEmpty( node.childNodes[i]) ) {
                return false;
            }
        }

        return true;
    
    }

    MOGL3D.prototype.removeUpToTagName = function( startNode, tagName ) {

        let parent;
        // 부모 노드 탐색하여 지정된 tagName의 직접적인 자식 요소 찾기
        while ( startNode.parentNode && startNode.parentNode.nodeName !== tagName.toUpperCase()) {
            startNode = startNode.parentNode;
        }

        // 찾은 요소가 지정된 태그의 직접적인 자식인지 확인하고, 조건을 만족하면 제거
        if ( startNode.parentNode && startNode.parentNode.nodeName === tagName.toUpperCase()) {
            
            parent = startNode.parentNode;
            // console.log(`div발견 ${parent.outerHTML }, startNode ${startNode.outerHTML } 제거`)
            startNode.parentNode.removeChild(startNode);
        }

        return parent;

    }

    MOGL3D.prototype.removeParentNode = function( node, tag ){
        // console.log(`${tag}노드 제거`)
        // console.log('node name: ', node.tagName );
        while ( node !== null && node.tagName !== tag ) {
            node = node.parentNode;
        }

        if (node && node.tagName === tag ) {
        
            const parent = node.parentNode;
            console.log('parent: ', parent );
            while (node.firstChild) {
                parent.insertBefore(node.firstChild, node);
            }
            // 모든 자식을 이동한 후, 원래의 'span' 노드 삭제
            parent.removeChild(node);
        }

        return node;

    }

    MOGL3D.prototype.collectNode = function( node, tag, arr ) {
        
        if (node.nodeType === Node.ELEMENT_NODE && node.tagName === tag) {
            arr.push(node);
        }
        Array.from(node.childNodes).forEach(child => this.collectNode( child, tag, arr ));
        return arr;
        
    }

    // Continue to add more prototype methods...

    return MOGL3D;
}));