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

        this.addFonts();
        this.name = 'MOGL3D Library';
        this.loader = null;
        this.modules = null;
        this.element = element;
        this.options = options;
        this.threeSceneNum = 0;
        this.uploadModels = [];

        if( this.options.plugins && this.options.plugins.length > 0 ) {
            let mogl3d = this;
            this.options.plugins.map( plugin => {
                for( let key in plugin ) {
                    if( key === 'threeModules' ) mogl3d.modules = plugin[key] 
                }
            })
        }
        
        // these.actions values = same as toolbox button
        this.actions = options.actions
            ? (
                options.actions.map( action => {
                    
                    if( typeof action === 'string' ) {
                        return this.defaultActions()[action]; 
                    }
                    else if( this.defaultActions()[ action.name ]) return { ...this.defaultActions()[ action.name ], ...action }
                    return action;

                })
            )
            : Object.keys( this.defaultActions() ).map( action => this.defaultActions()[ action ] );
        
        this.classes = { ...this.defaultClasses(), ...this.options.classes };
        this.formatBlock = 'formatBlock';
        this.defaultParagraphSeparatorString = 'defaultParagraphSeparator';
        
        this.init();
        this.initDropdownMenu();
        
    }


    /* ------------------------- */
    /******* Buttons Funcs *******/
    /* ------------------------- */
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
                    <select id="mogl3d-fontfamily">
                    <option data-type="placeholder" selected> </option>
                        <option value='"Noto Sans KR", sans-serif'>Nano</option>
                        <option value='"Roboto", sans-serif'>Roboto</option>
                        <option value='"Poetsen One"'>Poetsen</option>
                        <option value='"Ubuntu Sans", sans-serif'>Ubuntu</option>
                        <option value='"Open Sans", sans-serif'>Open Sans</option>
                        <option value='"Sedan SC", serif'>Sedan SC</option>
                        <option value='"Lato", sans-serif'>Lato</option>
                        <option value='"Nanum Myeongjo", serif'>Nanum Myeongjo</option>
                        <option value='"Noto Serif KR", serif'>Noto</option>
                        <option value='"Black Han Sans", sans-serif'>Black Han Sans</option>
                        <option value='"Lora", serif'>Lora</option>
                        <option value='"Nanum Gothic", sans-serif'>Nanum Gothic</option>
                    </select>
                `,
                result: () => {
                    this.initFontTypeListener()
                },
                title: 'Font Color'
            },
            fontSize: {
                icon: `
                    <label for="fontsize">size:</label>
                    <select id="mogl3d-fontsize">
                        <option data-type="placeholder" selected> </option>
                        <option value="12px">Small</option>
                        <option value="16px">Medium</option>
                        <option value="20px">Large</option>
                        <option value="24px">Extra Large</option>
                    </select>
                `,
                result: () => {
                    this.initFontSizeListener()
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
                icon: '<img src="./css/icons/icons-font_menus.png" class="mogl3d-icons font-menu">',
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

        this.element.appendChild( content );
        this.actions.forEach( actionKey => {
            
            const button = document.createElement('button');
            button.className = mogl3d.classes.button;
            button.innerHTML = actionKey.icon;
            button.setAttribute('type', 'button');
            button.title = actionKey.title;
            button.addEventListener('click', e => {
                
                actionKey.result();
                content.focus();
            })

            if( actionKey.state ) {
                const handler = () => button.classList[actionKey.state() ? 'add' : 'remove'](mogl3d.classes.selected);
                content.addEventListener( 'keyup', handler );
                content.addEventListener( 'mouseup', handler );
                button.addEventListener( 'click', handler );
            }

            actionbar.appendChild(button);
        });

        this.actions.forEach(( actionKey ) => {
            
            if( actionKey.init ) {
                const button = document.querySelector(`button[title="${ actionKey.title }"]`);
                if (button) actionKey.init(button);
            }
        });
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
            dropdown.style.display = 'none'; // Hode All Dropdown menus
        });
    }

    MOGL3D.prototype.createColorInput = function( type, execName, closeNodeName ) {
        const input = document.createElement('input');
        const mogl3d = this;
        input.type = type;
        input.oninput = (e) => {
            mogl3d.exec( execName, e.target.value );
            input.remove();
        };
        input.click();
        this.closeDropDown( closeNodeName );
    }

    /* -------------------------- */
    /******* DropDown Funcs *******/
    /* -------------------------- */
    MOGL3D.prototype.initDropdownMenu = function () {
        let dropdownWrap = document.querySelectorAll('.dropdown');
        let dropdownNodesID = [ 'TextMenu-dropdown', 'AlignMenu-dropdown', 'FileMenu-dropdown', 'FontMenu-dropdown' ]

        dropdownWrap.forEach( dropEl => {

            let editor = document.querySelector('#editor');
            
            dropEl.addEventListener('click', async e => {
        
                let dropdownWrapper = e.target.parentNode;
                let dropMenuEl = ( dropdownWrapper.nodeName === 'BUTTON') ? dropdownWrapper.parentNode : dropdownWrapper; 
                let dropID = await this.chkDropID( dropMenuEl );
                
                dropdownNodesID.forEach( id => {
                
                    let node = document.querySelector(`#${id}`);
                    if( node ) {
                        if( id !== dropID ) node.style.display = 'none';
                    }
    
                });

                
                let selectNode = document.querySelector(`#${dropID}`);
                
                if( selectNode.style.display === 'flex' ) {
                    selectNode.style.display = 'none';
                } else {
                    selectNode.style.display = 'flex';
                }

                e.stopPropagation(); // to Prevent Event Bubbling

            })

        });

        document.addEventListener('click', (e) => {
            
            const editor = document.querySelector('.mogl3d-content');
            let target = e.target;
            
            if( target.id !== 'mogl3d-fontsize' && target.id !== 'mogl3d-fontfamily' ) {
                dropdownNodesID.map( id => {
                    
                    let node = document.querySelector(`#${id}`);
                    if( node ) {
                        if( node.style.display === 'flex' ) node.style.display = 'none';
                    }
                    
                })
            }

        });
    };

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


    /* -------------------- */
    /******* 3D Funcs *******/
    /* -------------------- */

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
                
                modules.loadFiles( files, filesMap, ( res ) => {
    
                    const currentRange = this.saveCurrentRange();
                    if( currentRange ) {
                        this.insert3DModelAtLine( modules, res, currentRange );
                    } else {
                        this.insert3DModelAtLine( modules, res );
                    }
                    
                });
    
            } catch ( err ) {
                console.error('파일 로딩 에러:', err);
            }
        
        }

        fileInput.click();
        this.closeDropDown( 'Menu-dropdown' );

    }

    MOGL3D.prototype.saveCurrentRange = function() {
        if (window.getSelection().rangeCount > 0) {
            return window.getSelection().getRangeAt(0);
        }
        return null;
    }

    MOGL3D.prototype.getModels = function() {
        
        if( this.uploadModels.length > 0 ) {
            return this.uploadModels
        }
    }

    MOGL3D.prototype.insert3DModelAtLine = function( modules, res, range ) {
        
        this.threeSceneNum++;
        
        const editor = this.element;
        const selection = window.getSelection();

        // Create a new div element and set it to include a 3D scene.
        let sceneContainer = document.createElement('p');
        sceneContainer.title = `threeSceneNum${this.threeSceneNum}`
        sceneContainer.className = `three-scene`;
        
        this.uploadModels.push({
            [sceneContainer.title]: res
        });

        let container = modules.init( sceneContainer, res );
    

        if ( !range ) {
        
            // Process only if the first text line is not a toolbox
            // Set cursor to the first line
            const editorContent = document.querySelector('.mogl3d-content');
            const range = document.createRange();
            let beforeDiv = document.createElement('div');
            beforeDiv.textContent = "\u00A0";
            let afterDiv = document.createElement('div');
            afterDiv.textContent = "\u00A0";
            
            range.selectNodeContents( container );
            range.collapse( true );
            selection.removeAllRanges();
            selection.addRange( range );
            editorContent.appendChild( container );
            editorContent.insertBefore( beforeDiv, container );
            editorContent.appendChild( afterDiv );
            
        } else {
            
            // Insert in the user's selected location
            
            range.deleteContents();
            range.insertNode( container );
            // Adjust cursor position behind inserted content
            let newRange = document.createRange();
            newRange.setStartAfter( container );
            newRange.collapse( true );
            window.getSelection().removeAllRanges();
            window.getSelection().addRange( newRange );
        }

    }

    /* --------------------------- */
    /******* Img Upload Func *******/
    /* --------------------------- */

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


    // Add more methods as needed
    // MOGL3D.prototype.insertImageToEditor = function (imageUrl) {

    //     const imgTag = `<img src="${imageUrl}" alt="Loaded Image"/>`;
    //     document.querySelector('.mogl3d-content').innerHTML += imgTag;

    // };

    /* --------------------------- */
    /******* Zip Upload Func *******/
    /* --------------------------- */
    MOGL3D.prototype.createZipFile = function() {
        const mogl3d = this
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.zip'; // Allow ZIP files only
    
        fileInput.onchange = (e) => {
            
            const file = e.target.files[0];
        
            if (file) {
                
                const container = document.createElement('div');
                container.contentEditable = false; 
                container.style.display = 'inline-block'; 
                container.style.margin = '5px';
    
                const fileNameSpan = document.createElement('span');
                fileNameSpan.textContent = file.name + " ";
                container.appendChild( fileNameSpan );
    
                const removeButton = document.createElement('button');
                removeButton.textContent = 'x';
                removeButton.style.marginLeft = '5px';
                removeButton.onclick = () => {
                    container.remove();
                };
                container.appendChild(removeButton);
    
                const selection = document.getSelection();
                let range;
        
                if ( selection.rangeCount > 0 ) {
        
                    range = selection.getRangeAt(0);
                    range.deleteContents(); 
                    range.insertNode( container );
        
                } else {
                // no selected range:: insert it at the beginning of the editor
                    const editor = document.querySelector('.mogl3d-content');
                    editor.insertBefore( container, editor.firstChild );
                }
                // Remove the file entry element from the document.
                fileInput.remove();
            }
    
        };
    
        fileInput.click();
        return fileInput
    }

    /* ----------------------------- */
    /******* Video Upload Func *******/
    /* ----------------------------- */
    MOGL3D.prototype.createModal = function( type ) {

        let currentRange;
        if (window.getSelection().rangeCount > 0) {
            currentRange = window.getSelection().getRangeAt(0);
        }

        this.closeDropDown( 'Menu-dropdown' )
        const modal = document.createElement('div');
        modal.setAttribute('class', 'modal');
        modal.id = 'videoModal';
    
        const modalContent = document.createElement('div');
        modalContent.setAttribute('class', 'modal-content');
        modal.appendChild(modalContent);
    
        // Close Function
        const closeButton = document.createElement('span');
        closeButton.setAttribute('class', 'modalClose');
        closeButton.id = 'videoModalClose';
        closeButton.textContent = '×';
        closeButton.addEventListener('click', e => {
        
            this.closeModal(modal)
            if( currentRange ) {
                const selection = window.getSelection();
                selection.removeAllRanges();
                selection.addRange(currentRange);
            }
        })
        
        modalContent.appendChild(closeButton);
    
        if( type === 'video' ) {
            let form = this.videoForm( modalContent, modal, currentRange );
            modal.appendChild(form);
        }
    
        document.body.appendChild( modal );
        modal.style.display = "block";

        // Prevent event capture and bubbling
        modal.addEventListener('mousedown', function(e) {
            e.stopPropagation();
        }, true);

        return modal;
    }

    MOGL3D.prototype.videoForm = function( modalContent, modal, range ) {
        
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
        insertButton.addEventListener('click', e => this.insertVideoFromModal( modal, range ))
    
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

    MOGL3D.prototype.insertVideoFromModal = function( modal, range ) {

        const mogl3d = this;
        const url = document.getElementById('videoUrlInput').value;
        const fileInput = document.getElementById('videoFileInput');
        const file = fileInput.files[0];

        if (url) {
            // Creating iframe with URL
            mogl3d.insertVideoIframe( url, range );
        } else if (file && file.size <= 30 * 1024 * 1024) { // File Size: Limit to 30 MB
            // Creating video Tag with file
            mogl3d.insertVideoFile( file );
        } else if (file) {
            alert('File is too large. Maximum size is 30MB.');
        }
    
        this.closeModal( modal );
    }

    MOGL3D.prototype.convertToEmbedUrl = function(url) {

        let embedUrl = url;
        if (url.includes('youtube.com/watch?v=')) {
            const videoId = url.split('v=')[1].split('&')[0];
            embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}`;
        } else if (url.includes('youtu.be/')) {
            const videoId = url.split('youtu.be/')[1];
            embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}`;
        }
        return embedUrl;

    }

    MOGL3D.prototype.insertVideoIframe = function( url, range ) {
        
        let embedUrl = this.convertToEmbedUrl( url );
        const editorContent = document.querySelector('.mogl3d-content');
        let tmpTextNode = document.createTextNode('');
        const wrapper = document.createElement('span');
        wrapper.innerHTML = " ";
        wrapper.appendChild( tmpTextNode );

        const iframe = document.createElement('iframe');
        iframe.src = embedUrl;
        iframe.style.width = "560px";
        iframe.style.height = "315px";
        iframe.frameBorder = "0";
        iframe.allow = "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture";
        iframe.allowFullscreen = true;
        
        wrapper.appendChild( iframe );
        wrapper.style.whiteSpace = 'pre';

        if( !range ) {
            editorContent.insertBefore( wrapper, editorContent.firstChild );
        } else {
            
            range.deleteContents();
            range.insertNode(wrapper);
        }

        // return iframe;
    }

    MOGL3D.prototype.insertVideoFile = function( file ) {
        
        const editorContent = document.querySelector('.mogl3d-content');

        let tmpTextNode = document.createTextNode('');
        const wrapper = document.createElement('span');
        wrapper.innerHTML = " ";
        wrapper.appendChild( tmpTextNode );
    
        const video = document.createElement('video');
        video.controls = true;

        const source = document.createElement('source');
        source.src = URL.createObjectURL(file);
        source.type = file.type;
        video.appendChild(source);
    
        const afterSpace = document.createElement('p');
        afterSpace.contentEditable = true;
        afterSpace.innerHTML = "<br>";  // Text entry space under video

        wrapper.appendChild( video );
        wrapper.style.whiteSpace = 'pre';
        const selection = document.getSelection();
        let range;

        if ( selection.rangeCount > 0 ) {
            range = selection.getRangeAt(0);
            range.deleteContents(); 
            range.insertNode( wrapper ); 
        } else {    
            editorContent.insertBefore( wrapper, editorContent.firstChild );
        }

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

    /* ---------------------- */
    /******* Font Funcs *******/
    /* ---------------------- */

    // Setting Google Font
    MOGL3D.prototype.addFonts = function() {

        // first Link for preconnect
       var link1 = document.createElement('link');
       link1.rel = 'preconnect';
       link1.href = 'https://fonts.googleapis.com';
       document.head.appendChild(link1);

       // second Link for preconnect:: CrosOrgin
       var link2 = document.createElement('link');
       link2.rel = 'preconnect';
       link2.href = 'https://fonts.gstatic.com';
       link2.crossOrigin = 'anonymous';
       document.head.appendChild(link2);

       // Google Fonts Style
       var link3 = document.createElement('link');
       link3.rel = 'stylesheet';
       link3.href = 'https://fonts.googleapis.com/css2?family=Black+Han+Sans&family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&family=Lora:ital,wght@0,400..700;1,400..700&family=Nanum+Gothic&family=Nanum+Myeongjo&family=Noto+Sans+KR:wght@100..900&family=Noto+Serif+KR&family=Open+Sans:ital,wght@0,300..800;1,300..800&family=Poetsen+One&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&family=Sedan+SC&family=Ubuntu+Sans:ital,wght@0,100..800;1,100..800&display=swap';
       document.head.appendChild(link3);

   }

    MOGL3D.prototype.initFontTypeListener = function() {

        const select = document.getElementById('mogl3d-fontfamily');
        if( !select ) return;

        select.removeEventListener( 'change', this.handleFontTypeChange );

        this.handleFontTypeChange = ( event ) => {
            const fontTypeValue = select.value;
            const selection = window.getSelection();

            if( !selection.rangeCount ) return;
            this.wrapTextWithSpan( selection, "fontFamily", fontTypeValue, 'font-family' );
        }

        select.addEventListener( 'change', this.handleFontTypeChange );

    }

    MOGL3D.prototype.initFontSizeListener = function() {

        const select = document.getElementById('mogl3d-fontsize');
        if (!select) return;

        select.removeEventListener('change', this.handleFontSizeChange); // 기존 리스너 제거
        this.handleFontSizeChange = ( event ) => {

            const sizeValue = select.value;
            const selection = window.getSelection();
            
            if (!selection.rangeCount) return;
            this.wrapTextWithSpan(selection, "fontSize", sizeValue, 'font-size');
        
        };
        
        select.addEventListener('change', this.handleFontSizeChange);
    
    };

    MOGL3D.prototype.wrapTextWithSpan = function( selection, styleProperty, value, type  ) {

        let range = selection.getRangeAt(0);
        // const selectedNode = range.cloneContents();
        const multiLine = ( selection.toString().split('\n').length > 1 ) ? true : false;
        
        //단일 라인
        if( !multiLine ) {
            
            let extractContents = range.extractContents();
            let commonNode = range.commonAncestorContainer;
            let motherNode = this.findParentNode( commonNode, 'DIV' );
            
            ( type === 'font-size' ) 
                ? this.removeChildNode( extractContents, 'span', 'mogl3d-font-span' )
                : this.removeChildNode( extractContents, 'span', 'mogl3d-fontfamily-span' );
            // this.removeChildNode( extractContents, 'span', 'mogl3d-font-span' );

            let newSpan = document.createElement('span');
            newSpan.style[styleProperty] = value;
            
            newSpan.className = ( type === 'font-size' ) ? 'mogl3d-font-span' : 'mogl3d-fontfamily-span';
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
            
            // If empty tags exist inside the selected node > Remove
            this.removeEmptyNodes( startMotherNode );
            this.removeEmptyNodes( endMotherNode );
            
            let firstNode = cloneNodes.firstChild;
            let lastNode = cloneNodes.lastChild;

            // If the selected range contains the mgl3d-font-span tag > Remove
            if ( type === 'font-size' ) {
                this.removeChildNode( firstNode, 'span', 'mogl3d-font-span' );
                this.removeChildNode( lastNode, 'span', 'mogl3d-font-span' );
            }
            else if ( type === 'font-family') {
                this.removeChildNode( firstNode, 'span', 'mogl3d-fontfamily-span' );
                this.removeChildNode( lastNode, 'span', 'mogl3d-fontfamily-span' );
            }

            // First node of selection
            let firstWrapper = document.createElement('span');
            firstWrapper.className = ( type === 'font-size' ) ? 'mogl3d-font-span' : 'mogl3d-fontfamily-span';
            firstWrapper.style[styleProperty] = value;

            // Select Intermediate Node Part
            let midWrappers = [];
            
            let tmpMidClone = cloneNodes.cloneNode( true );
            let midNodeLength = tmpMidClone.childNodes.length - 1;
            Array.from( tmpMidClone.childNodes ).forEach( ( midNode, idx ) => {

                if( idx !== 0 && idx !== midNodeLength ) {
                    
                    this.removeEmptyNodes( midNode );

                    ( type === 'font-size' )
                        ? this.removeChildNode( midNode, 'span', 'mogl3d-font-span' )
                        : this.removeChildNode( midNode, 'span', 'mogl3d-fontfamily-span' )

                    let midWrapper = document.createElement('span');
                    midWrapper.className = ( type === 'font-size' ) ? 'mogl3d-font-span' : 'mogl3d-fontfamily-span';
                    midWrapper.style[styleProperty] = value;

                    let midNodeSpan = this.changeNodeToNode( midNode, midWrapper );
                    let tmpDiv = document.createElement('div');
                    tmpDiv.appendChild( midNodeSpan );

                    midWrappers.push( tmpDiv );

                }

            })

            // Last node of selection
            let lastWrapper = document.createElement('span');
            lastWrapper.className = ( type === 'font-size' ) ? 'mogl3d-font-span' : 'mogl3d-fontfamily-span';
            lastWrapper.style[styleProperty] = value;

            //Change the wrapper (usually div) shell of the selected node to fontSpan
            let firstNodeSpan = this.changeNodeToNode( firstNode, firstWrapper );
            let lastNodeSpan = this.changeNodeToNode( lastNode, lastWrapper );
            firstNodeSpan.normalize();
            lastNodeSpan.normalize();

            startMotherNode.appendChild( firstNodeSpan );
            endMotherNode.insertBefore( lastNodeSpan, endMotherNode.firstChild );

            midWrappers.map( midNode => {
                midNode.normalize();
                rootNode.insertBefore( midNode, endMotherNode );
            })

            //reset range
            newRange.setStartBefore( firstNodeSpan );
            newRange.setEndAfter( lastNodeSpan );
            selection.removeAllRanges();
            selection.addRange( newRange );
        }

    }

    MOGL3D.prototype.removeEmptyNodes = function( node ) {

        if (!node) return;

        // Naviagate all child nodes
        for (let i = 0; i < node.childNodes.length; i++) {
            const child = node.childNodes[i];

            this.removeEmptyNodes(child);

            // Remove a child if it is an empty text node or an empty element
            if ((child.nodeType === Node.ELEMENT_NODE && child.innerHTML === '') ||
                (child.nodeType === Node.TEXT_NODE && child.textContent.trim() === '')) {
                node.removeChild(child);
                i--; // Adjust the index after the node is removed
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

        let children = Array.prototype.slice.call(parent.childNodes);
        // let index = children.indexOf( element ) + 1;
        let index = children.indexOf( element );

        return index;

    }

    MOGL3D.prototype.extractText = function( node ) {
        
        let text = '';
        // If the node is a text node, add text
        if (node.nodeType === Node.TEXT_NODE) {
            text += node.nodeValue;
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            // If element nodes, process all child nodes recursively
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

        while ( startNode.parentNode && startNode.parentNode.nodeName !== tagName.toUpperCase()) {
            startNode = startNode.parentNode;
        }

        if ( startNode.parentNode && startNode.parentNode.nodeName === tagName.toUpperCase()) {
            
            parent = startNode.parentNode;
            startNode.parentNode.removeChild(startNode);
        }

        return parent;

    }

    MOGL3D.prototype.removeParentNode = function( node, tag ){
        
        while ( node !== null && node.tagName !== tag ) {
            node = node.parentNode;
        }

        if (node && node.tagName === tag ) {
        
            const parent = node.parentNode;
            console.log('parent: ', parent );
            while (node.firstChild) {
                parent.insertBefore(node.firstChild, node);
            }
            
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