import { exec, formatBlock, queryCommandState, createIMGFileBox, createZipFile, createModal, createColorInput, closeDropDown, initMenu } from "./utilities.js";
import threeDFileLoader from "./threeDFileLoader.js";

function closeDropdowns() {
    const dropdowns = document.querySelectorAll('.Menu-dropdown');
    dropdowns.forEach(dropdown => {
        dropdown.style.display = 'none';
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
    icon: 'Ξ',
    result: () => {},
    init: ( button ) => initMenu( button, 'mogl3d-content', [leftAlign, rightAlign, centerAlign], 'AlignMenu-dropdown' ),
    title: 'TextAlignDropDown'
}

export const image = {

    icon: '<icon style="font-size:16px;">🖼️</icon>',
    result: () => {
        createIMGFileBox( 'image/*' )
        closeDropdowns(); // 드랍다운 닫기
    },
    title: 'Image',

};

export const files = {
    icon: '<icon style="font-size:16px;">🗃️</icon>',
    result: () => {
        createZipFile();
        closeDropdowns();
    },

    title: 'files',

};

export const video = {
    icon: '<icon style="font-size:16px;">🎬</icon>',
    result: () => {
        
        createModal( 'video' );
        
    },
    title: 'Video'
};

export const filesMenu = {

    icon: '<icon>&#x1F4C1;</icon><icon style="font-size:7px;margin-left:2px;">&#x25BC;</icon>',
    result: () => {},
    init: ( button ) => initMenu( button, 'mogl3d-content', [image, files, video], 'FileMenu-dropdown' ),
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