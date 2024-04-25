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
        button.setAttribute('type', 'button');
        button.onclick = () => {
            
            action.result(); 
            content.focus();
        }
    
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

    function dropdownRemoved () {
        console.log('드랍다운 제거');
        let dropdownNodesID = [ 'TextMenu-dropdown', 'AlignMenu-dropdown', 'FileMenu-dropdown' ]
        const editor = document.querySelector('.mogl3d-content');
    
        dropdownNodesID.map( id => {
            
            let node = document.querySelector(`#${id}`);
            if( node.style.display === 'block' ) node.style.display = 'none';
    
        })
    }

    let dropdownWrap = document.querySelectorAll('.dropdown');
    
    dropdownWrap.forEach( dropEl => {
        let dropdownNodesID = [ 'TextMenu-dropdown', 'AlignMenu-dropdown', 'FileMenu-dropdown' ]
        dropEl.addEventListener('click', async e => {
        
            let target = e.target;
            let dropdownWrapper = e.target.parentNode;
            let dropMenuEl = ( dropdownWrapper.nodeName === 'BUTTON') ? dropdownWrapper.parentNode : dropdownWrapper; 
            let dropID = await chkDropID( dropMenuEl );

            dropdownNodesID.forEach( id => {

                if( dropID !== id ) {
                    let node = document.querySelector(`#${id}`);
                    if( editor.contains( target) && node.style.display === 'block' ) node.style.display = 'none';
                }

            })
            
        })
    });

    function chkDropID ( el ) {
        
        return new Promise( resolve => {
            
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

    if (settings.styleWithCSS) exec('styleWithCSS')
    
    exec(defaultParagraphSeparatorString, defaultParagraphSeparator)

        return settings.element
    }
    
    export default {
    init,
}