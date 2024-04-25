import { exec, formatBlock, queryCommandState, createIMGFileBox, createZipFile, createModal, createColorInput, closeDropDown, initMenu } from "./utilities.js";
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

export const fontColor = {
    icon: 'T',
    result: () => createColorInput( 'color', 'foreColor', 'Menu-dropdown' ),
    title: 'Font Color'
}

export const highlight = {
    icon: '<span style="border:1px solid yellow; padding:2px 6px;">T</span>',
    result: () => createColorInput( 'color', 'backColor', 'Menu-dropdown' ),
    title: 'Highlight Text'
}

export const removeHighlight = {
    icon: '<s>T</s>',
    result: () => { 
        exec('backColor', 'transparent')
        closeDropDown( 'Menu-dropdown' );
    },
    title: 'Remove Highlight'
};

export const textColorMenu = {
    icon: 'T',
    result: () => {},
    init: ( button ) => initMenu( button, 'mogl3d-content', [fontColor, highlight, removeHighlight], 'TextMenu-dropdown' ),
    title: 'TextColorDropDown',

}

export const leftAlign = {
    icon: '&#x21E4;',
    result: () => { 
        exec('justifyLeft'); 
        closeDropDown( 'Menu-dropdown' );
    },
    title: 'LeftAlign'
}

export const rightAlign = {
    icon: '&#x21E5;',
    result: () => {
        exec('justifyRight')
        closeDropDown( 'Menu-dropdown' );
    },
    title: 'RightAlign'
}

export const centerAlign = {
    icon: '&#x21C5;',
    result: () => {
        exec('justifyCenter')
        closeDropDown( 'Menu-dropdown' );
    },
    title: 'CenterAlign'
}

export const alignMenu = {
    icon: 'Ξ',
    result: () => {},
    init: ( button ) => initMenu( button, 'mogl3d-content', [leftAlign, rightAlign, centerAlign], 'AlignMenu-dropdown' ),
    title: 'TextAlignDropDown'
}

export const image = {

    icon: '<icon style="font-size:16px;">🖼️</icon>',
    result: () => {
        createIMGFileBox( 'image/*' )
        closeDropDown( 'Menu-dropdown' );
    },
    title: 'Image',

};

export const files = {
    icon: '<icon style="font-size:16px;">🗃️</icon>',
    result: () => {
        createZipFile();
        closeDropDown( 'Menu-dropdown' );
    },

    title: 'files',

};

export const video = {
    icon: '<icon style="font-size:16px;">🎬</icon>',
    result: () => createModal( 'video' ),
    title: 'Video'
};

export const filesMenu = {

    icon: '<icon>&#x1F4C1;</icon><icon style="font-size:7px;margin-left:2px;">&#x25BC;</icon>',
    result: () => {},
    init: ( button ) => initMenu( button, 'mogl3d-content', [image, files, video, load3DModel], 'FileMenu-dropdown' ),
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
    divider: true,
    title: 'Horizontal Line',
}

export const link = {
    icon: '&#128279;',
    result: () => {
        const url = window.prompt('Enter the link URL')
        if (url) exec('createLink', url)
    },
    divider: true,
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
    icon: '3D',
    result: threeDFileLoader,
    title: 'Load 3D Model'
};

export const threeLogEditor = {
    icon: '<i class="fas fa-cube"></i>',
    result: () => {
    
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

export const defaultActions = {
    italic,
    bold,
    underline,
    strikethrough,
    textColorMenu,
    alignMenu,
    line,
    olist,
    paragraph,
    quote,
    ulist,
    link,
    filesMenu,
    threeLogEditor,
    code
}