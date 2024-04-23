import { defaultActions } from '../js/Utils/actions.js'

import {
    addEventListener,
    appendChild,
    createElement,
    defaultParagraphSeparatorString,
    exec,
    formatBlock,
    queryCommandValue,
} from '../js/Utils/utilities.js'
    
const defaultClasses = {
    actionbar: 'mogl3d-actionbar',
    button: 'mogl3d-button',
    content: 'mogl3d-content',
    selected: 'mogl3d-button-selected',
}
    
export const init = settings => {

    const actions = settings.actions
        ? ( settings.actions.map( action => {

            if ( typeof action === 'string' ) return defaultActions[action]
            else if ( defaultActions[action.name] ) return { ...defaultActions[action.name], ...action }
                return action
            })

        )
        : Object.keys( defaultActions ).map( action => defaultActions[action] );
    
    const classes = { ...defaultClasses, ...settings.classes }
    
    const defaultParagraphSeparator = settings[defaultParagraphSeparatorString] || 'div'
    
    const actionbar = createElement('div')
    actionbar.className = classes.actionbar
    
    appendChild(settings.element, actionbar)
    
    const content = settings.element.content = createElement('div')
    content.contentEditable = true
    content.className = classes.content
    content.oninput = ({ target: { firstChild } }) => {

        if (firstChild && firstChild.nodeType === 3) exec(formatBlock, `<${defaultParagraphSeparator}>`)
        else if (content.innerHTML === '<br>') content.innerHTML = ''
        settings.onChange(content.innerHTML)
    }

    content.onkeydown = event => {

        if (event.key === 'Enter' && queryCommandValue(formatBlock) === 'blockquote') {
            setTimeout(() => exec(formatBlock, `<${defaultParagraphSeparator}>`), 0)
        }

    }
    appendChild( settings.element, content )

    actions.forEach( action => {
    
        const button = createElement('button');
        button.className = classes.button
        button.innerHTML = action.icon
        button.title = action.title
        button.setAttribute('type', 'button')
        button.onclick = () => action.result() && content.focus()
    
        if ( action.state ) {

            const handler = () => button.classList[action.state() ? 'add' : 'remove'](classes.selected)
            addEventListener(content, 'keyup', handler)
            addEventListener(content, 'mouseup', handler)
            addEventListener(button, 'click', handler)

        }
    
        appendChild(actionbar, button)
    });

    Object.keys( defaultActions ).forEach(( actionKey ) => {

        const action = defaultActions[actionKey];

        if ( action.init ) {

            const button = document.querySelector(`button[title="${action.title}"]`);
            if (button) action.init(button);
            
        }
    });

    // 기존의 코드에 이벤트 리스너 추가
    document.addEventListener('click', function(event) {
        const editor = document.querySelector('.mogl3d-content');
        const textColorDropdown = document.querySelector('.textColorMenu-dropdown');

    // 에디터 내부를 클릭했을 때 드롭다운을 숨깁니다.
    if (editor.contains(event.target) && textColorDropdown.style.display === 'block') {
        textColorDropdown.style.display = 'none';
    }
    });


    if (settings.styleWithCSS) exec('styleWithCSS')
    exec(defaultParagraphSeparatorString, defaultParagraphSeparator)

    return settings.element
    }
    
    export default {
    init,
}