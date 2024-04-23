import { exec, formatBlock, queryCommandState, createElement, queryCommandValue, appendChild } from "./utilities.js";
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
    result: () => {
        const input = document.createElement('input');
        input.type = 'color';
        input.oninput = (e) => {
            exec( 'foreColor', e.target.value );
            input.remove(); // 색상 선택 후 input 요소 제거
        };
        input.click(); // 자동으로 색상 선택기 열기
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
    },
    title: 'Highlight Text'
}

export const removeHighlight = {
    icon: '<s>T</s>', // 적절한 아이콘을 선택하세요
    result: () => { console.log('벡 삭제'); exec('backColor', 'transparent') },
    title: 'Remove Highlight'
};

export const textColorMenu = {
    icon: 'T',
    title: 'Text Color Menu',
    result: () => {
        const dropdown = document.querySelector('.textColorMenu-dropdown');
        dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';

    },
    init: ( button ) => {

        let content = document.querySelector('.mogl3d-content');
        const dropdownContainer = document.createElement('div');
        dropdownContainer.className = 'dropdown';

        // 기존 버튼을 복제하여 새로운 버튼을 만듭니다.
        const newButton = button.cloneNode(true);

        // 드롭다운 컨테이너 생성
        const dropdown = document.createElement('div');
        dropdown.className = 'textColorMenu-dropdown';
        // dropdown.style.display = 'none';

        Array.from([ fontColor, highlight, removeHighlight ]).forEach( action => {
            
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

        // 기존의 버튼 위치에 새로운 부모 div를 삽입하고 기존 버튼 제거
        button.parentNode.replaceChild(dropdownContainer, button);

    },
    title: 'TextColorDropDown',

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
    icon: '3D', // 적절한 아이콘을 선택하세요
    result: threeDFileLoader,
    title: 'Load 3D Model'
};

export const defaultActions = {
    bold,
    code,
    textColorMenu,
    // fontColor,
    // highlight,
    // removeHighlight,
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