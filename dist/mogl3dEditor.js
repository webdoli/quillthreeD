(function( global, factory) {

    ( typeof exports === 'object' && typeof module !== 'undefined' )
        ? module.exports = factory() 
        : ( typeof define === 'function' && define.amd )
            ? define(factory) 
            : ( global = global || self, global.mogl3d = factory() );

}( this, function() {

    'use strict';
    function _defineProperty( obj, key, value ) {

        if ( key in obj ) {
        
            Object.defineProperty( obj, key, {
            
                value: value,
                enumerable: true,
                configurable: true,
                writable: true
        
            });
        
        } else {
            obj[key] = value;
        }
    
        return obj;
    
    }

    function _objectSpread( target ) {
        
        for ( var i = 1; i < arguments.length; i++ ) {
        
            var source = arguments[i] != null ? arguments[i] : {};
            var ownKeys = Object.keys( source );
    
            if (typeof Object.getOwnPropertySymbols === 'function') {
    
                ownKeys = ownKeys.concat( Object.getOwnPropertySymbols( source ).filter( function (sym) {
                    return Object.getOwnPropertyDescriptor( source, sym ).enumerable;
            }));
        
        }
    
        ownKeys.forEach( function ( key ) {
            _defineProperty( target, key, source[key] );

        });

    }
    
        return target;

    }

    var addEventListener = function addEventListener ( parent, type, listener ) {
        return parent.addEventListener( type, listener )
    }

    var appendChild = function appendChild ( parent, child ) {
        return parent.appendChild( child )
    }

    var createElement = function createElement ( tag ) { 
        return document.createElement( tag )
    }

    var defaultParagraphSeparatorString = 'defaultParagraphSeparator';

    var exec = function exec ( command, value = null ) { 
        return document.execCommand( command, false, value )
    }

    var formatBlock = 'formatBlock';

    var queryCommandState = function queryCommandState ( command ) { 
        return document.queryCommandState( command )
    }

    var queryCommandValue = function queryCommandValue( command ) { 
        return document.queryCommandValue(command)
    }

    var closeDropDown = function closeDropDown ( elName ) {
    
        const dropdowns = document.querySelectorAll(`.${elName}`);
        dropdowns.forEach( dropdown => {
            dropdown.style.display = 'none'; // 모든 드랍다운 숨기기
        });
    
    }

    var createColorInput = function createColorInput ( type, execName, closeNodeName ) {

        const input = createElement('input');
        input.type = type;
        input.oninput = function(e) {
            exec( execName, e.target.value );
            input.remove(); // 색상 선택 후 input 요소 제거
        };
        input.click(); // 자동으로 색상 선택기 열기
        closeDropDown( closeNodeName );
        return input;

    }

    var initMenu = function initMenu ( button, editor, execArray, name ) {
    
        let content = document.querySelector(`.${ editor }`);
        let dropdownContainer = createDropDownMenu( button, execArray, content, name );
        button.parentNode.replaceChild( dropdownContainer, button );
    
    }

    var createDropDownMenu = function createDropDownMenu ( button, itemsArray, content, id ) {

        const dropdownContainer = createElement('div');
        dropdownContainer.className = 'dropdown';
    
        // 기존 버튼 복제
        const newButton = button.cloneNode(true);
    
        // 드롭다운 컨테이너 생성
        const dropdown = createElement('div');
        dropdown.id = id;
        dropdown.className = 'Menu-dropdown';
    
        Array.from( itemsArray ).forEach( action => {
            
            const button = createElement('button');
            button.className = 'mogl3d-button';
            button.innerHTML = action.icon;
            button.title = action.title;
            button.setAttribute('type', 'button');
            button.onclick = function() { return action.result() && content.focus() };
        
            appendChild( dropdown, button )
    
        });
    
        // 새로운 부모 div에 복제한 버튼과 드롭다운 메뉴를 추가
        dropdownContainer.appendChild( newButton );
        dropdownContainer.appendChild( dropdown );
    
        return dropdownContainer
    
    }

    var bold = {
        icon: '<b>B</b>',
        result: function result () { 
            return exec('bold') 
        },
        state: function state() {
            return queryCommandState('bold')
        },
        title: 'Bold',
    }

    var italic = {
        icon: '<i>I</i>',
        result: function result() {
            return exec('italic');
        },
        state: function state() {
            return queryCommandState('italic');
        },
        title: 'Italic'
    };

    var line = {
        icon: '&#8213;',
        result: function result() {
            return exec('insertHorizontalRule');
        },
        title: 'Horizontal Line'
    };
    
    var link = {
        icon: '&#128279;',
        result: function result() {
            var url = window.prompt('Enter the link URL');
            if (url) exec('createLink', url);
        },
        title: 'Link'
    };

    var olist = {
        icon: '&#35;',
        result: function result() {
            return exec('insertOrderedList');
        },
        title: 'Ordered List'
    };
    
    var paragraph = {
        icon: '&#182;',
        result: function result() {
            return exec(formatBlock, '<p>');
        },
        title: 'Paragraph'
    };

    var quote = {
        icon: '&#8220; &#8221;',
        result: function result() {
            return exec(formatBlock, '<blockquote>');
        },
        title: 'Quote'
    };
    
    var strikethrough = {
        icon: '<strike>S</strike>',
        result: function result() {
            return exec('strikeThrough');
        },
        state: function state() {
            return queryCommandState('strikeThrough');
        },
        title: 'Strike-through'
    };
    
    var ulist = {
        icon: '&#8226;',
        result: function result() {
            return exec('insertUnorderedList');
        },
        title: 'Unordered List'
    };

    var underline = {
        icon: '<u>U</u>',
        result: function result() {
            return exec('underline');
        },
        state: function state() {
            return queryCommandState('underline');
        },
        title: 'Underline'
    };

    var code = {
        icon: '&lt;/&gt;',
        result: function result () {
            return exec(formatBlock, '<pre>')
        },
        title: 'Code',
    }

    var fontColor = {
        icon: 'T',
        result: function result() {
            return createColorInput( 'color', 'foreColor', 'Menu-dropdown' )
        },
        title: 'Font Color'
    }
    
    var highlight = {
        icon: '<span style="border:1px solid yellow; padding:2px 6px;">T</span>',
        result: function result() {
            return createColorInput( 'color', 'backColor', 'Menu-dropdown' )
        },
        title: 'Highlight Text'
    }
    
    var removeHighlight = {
        icon: '<s>T</s>',
        result: function result() {

            closeDropDown( 'Menu-dropdown' );
            return exec('backColor', 'transparent')
            
        },
        title: 'Remove Highlight'
    };
    
    var textColorMenu = {
        icon: 'T',
        result: function result() {},
        init: ( button ) => initMenu( button, 'mogl3d-content', [fontColor, highlight, removeHighlight], 'TextMenu-dropdown' ),
        title: 'TextColorDropDown',
    
    }
    
    var leftAlign = {
        icon: '&#x21E4;',
        result: function result() { 
            closeDropDown( 'Menu-dropdown' );
            return exec('justifyLeft'); 
        },
        title: 'LeftAlign'
    }
    
    var rightAlign = {
        icon: '&#x21E5;',
        result: function result() {

            closeDropDown( 'Menu-dropdown' );
            return exec('justifyRight')
            
        },
        title: 'RightAlign'
    }
    
    var centerAlign = {
        icon: '&#x21C5;',
        result: function result() {

            closeDropDown( 'Menu-dropdown' );
            return exec('justifyCenter')
            
        },
        title: 'CenterAlign'
    }
    
    var alignMenu = {
        icon: 'Ξ',
        result: function result() {},
        init: ( button ) => initMenu( button, 'mogl3d-content', [leftAlign, rightAlign, centerAlign], 'AlignMenu-dropdown' ),
        title: 'TextAlignDropDown'
    }
    
    var image = {
    
        icon: '<icon style="font-size:16px;">🖼️</icon>',
        result: function result() {
            closeDropDown( 'Menu-dropdown' );
            return createIMGFileBox( 'image/*' )
            
        },
        title: 'Image',
    
    };
    
    var files = {
        icon: '<icon style="font-size:16px;">🗃️</icon>',
        result: function result() {
            closeDropDown( 'Menu-dropdown' );
            return createZipFile();
        },
    
        title: 'files',
    
    };
    
    var video = {
        icon: '<icon style="font-size:16px;">🎬</icon>',
        result: function result() {
            return createModal( 'video' )
        },
        title: 'Video'
    };
    
    var filesMenu = {
    
        icon: '<icon>&#x1F4C1;</icon><icon style="font-size:7px;margin-left:2px;">&#x25BC;</icon>',
        result: function result() {},
        init: ( button ) => initMenu( button, 'mogl3d-content', [image, files, video, load3DModel], 'FileMenu-dropdown' ),
        title: 'FilesDropDown'
    
    }

    // var load3DModel = {
    //     icon: '3D',
    //     result: threeDFileLoader,
    //     title: 'Load 3D Model'
    // };

    var threeLogEditor = {
        icon: '<i class="fas fa-cube"></i>',
        result: function result() {
        
            const logEditorWindow = window.open('popup/threeLogEditorWindow.html', 'threeLogWindow', 'width=800,height=600');
            
            // 메시지 이벤트 리스너를 메인 윈도우에 추가합니다.
            window.addEventListener('message', (event) => {
                // 올바른 출처의 메시지인지 검사합니다.
                console.log('event origin: ', event.origin );
                if (event.origin !== "http://127.0.0.1:5500") { // 'http://올바른-출처'는 새 창의 URL 출처와 일치해야 합니다.
                    return;
                }
                if (event.data.action === 'insertImage') {
                    // 이미지 URL을 에디터에 삽입하는 코드를 여기에 작성합니다.
                    const imageUrl = event.data.imageUrl;
                    insertImageToEditor(imageUrl);
                }
            }, false);
    
            function insertImageToEditor(imageUrl) {
                const imgTag = `<img src="${imageUrl}" alt="Loaded Image"/>`;
                // 'contentEditable' 영역에 imgTag를 삽입하는 로직을 추가해야 합니다.
                document.querySelector('.mogl3d-content').innerHTML += imgTag;
            }
    
        },
        title: '3D Scene Editor'
    }

    var defaultActions = {
        italic: italic,
        bold: bold,
        underline: underline,
        strikethrough: strikethrough,
        textColorMenu: textColorMenu,
        alignMenu: alignMenu,
        line: line,
        olist: olist,
        paragraph: paragraph,
        quote: quote,
        ulist: ulist,
        link: link,
        filesMenu: filesMenu,
        threeLogEditor: threeLogEditor,
        code: code
    }

    var defaultClasses = {
        actionbar: 'mogl3d-actionbar',
        button: 'mogl3d-button',
        content: 'mogl3d-content',
        selected: 'mogl3d-button-selected',
    };

    var init = function init( settings ) {

        var actions = settings.actions
            ? settings.actions.map( function ( action ) {
    
                if ( typeof action === 'string' ) return defaultActions[action]
                else if ( defaultActions[action.name] ) return _objectSpread( {}, defaultActions[action.name], action );
            
                return action;
                    
            })
            : Object.keys( defaultActions ).map( function ( action ) { 

                return defaultActions[action];
            
            });
        
        var classes = _objectSpread({}, defaultClasses, settings.classes );
        
        var defaultParagraphSeparator = settings[ defaultParagraphSeparatorString ] || 'div';
        var actionbar = createElement('div');
        actionbar.className = classes.actionbar;
        appendChild( settings.element, actionbar );
        
        var content = settings.element.content = createElement('div');
        content.contentEditable = true;
        content.className = classes.content;

        content.oninput = function ( _ref ) {

            var firstChild = _ref.target.firstChild;
            if ( firstChild && firstChild.nodeType === 3 ) exec( formatBlock, "<".concat( defaultParagraphSeparator, ">"));
            else if ( content.innerHTML === '<br>' ) content.innerHTML = '';
            settings.onChange(content.innerHTML);

        }
    
        content.onkeydown = function ( event ) {
    
            if ( event.key === 'Enter' && queryCommandValue(formatBlock) === 'blockquote') {
                setTimeout( function () { 
                    return exec( formatBlock, "<".concat(defaultParagraphSeparator, ">") );
                }, 0)
            }
    
        };

        appendChild( settings.element, content )
    
        actions.forEach( function ( action ) {
            
            var button = createElement('button');
            button.className = classes.button;
            button.innerHTML = action.icon;
            button.title = action.title;
            button.setAttribute('type', 'button');
            button.onclick = function () {
                
                return action.result() & content.focus();
            }
        
            if ( action.state ) {
    
                const handler = function () { 
                    return button.classList[action.state() ? 'add' : 'remove'](classes.selected);
                }
                addEventListener(content, 'keyup', handler)
                addEventListener(content, 'mouseup', handler)
                addEventListener(button, 'click', handler)
    
            }
        
            if( action.divider ) {
                const span = document.createElement('span');
                span.className = 'divider';
                appendChild( actionbar, span );
            }
    
            appendChild( actionbar, button );
            
        });
    
        Object.keys( defaultActions ).forEach( function ( actionKey ) {
    
            const action = defaultActions[actionKey];
    
            if ( action.init ) {
    
                const button = document.querySelector(`button[title="${action.title}"]`);
                if (button) action.init( button );
                
            }
        });
    
        var dropdownWrap = document.querySelectorAll('.dropdown');
        
        dropdownWrap.forEach( function( dropEl ) {

            let dropdownNodesID = [ 'TextMenu-dropdown', 'AlignMenu-dropdown', 'FileMenu-dropdown' ]
            dropEl.addEventListener('click', async function(e) {
            
                let target = e.target;
                let dropdownWrapper = e.target.parentNode;
                let dropMenuEl = ( dropdownWrapper.nodeName === 'BUTTON') ? dropdownWrapper.parentNode : dropdownWrapper; 
                let dropID = await chkDropID( dropMenuEl );
    
                dropdownNodesID.forEach( function( id ) {
    
                    if( dropID !== id ) {
                        let node = document.querySelector(`#${id}`);
                        if( editor.contains( target) && node.style.display === 'block' ) node.style.display = 'none';
                    }
    
                })
                
            })
        });
    
        function chkDropID ( el ) {
            
            return new Promise( function ( resolve ) {
                
                for( let i = 0; i < el.childNodes.length; i++ ) {
                    
                    if( el.childNodes[i].id !== '') {
                        resolve( el.childNodes[i].id );
                    } 
                }
                
            }) 
    
        }
        
        // 텍스트 에디터 내 빈공간 클릭시, 드랍다운 메뉴 해제
        document.addEventListener('click', function(event) {
            
            let dropdownNodesID = [ 'TextMenu-dropdown', 'AlignMenu-dropdown', 'FileMenu-dropdown' ]
            const editor = document.querySelector('.mogl3d-content');
            let target = event.target;
    
            dropdownNodesID.map( id => {
                
                let node = document.querySelector(`#${id}`);
                if( editor.contains( target) && node.style.display === 'block' ) node.style.display = 'none';
    
            })
        
        });
    
        if ( settings.styleWithCSS ) exec('styleWithCSS');
        
        exec( defaultParagraphSeparatorString, defaultParagraphSeparator );
        
        return settings.element
        
        
    }


    var mogl3d = {
        init: init
    };
    
    return mogl3d;

}));