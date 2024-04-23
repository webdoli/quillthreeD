export const addEventListener = (parent, type, listener) => parent.addEventListener(type, listener)

export const appendChild = (parent, child) => parent.appendChild(child)

export const createElement = tag => document.createElement(tag)

export const defaultParagraphSeparatorString = 'defaultParagraphSeparator'

export const exec = (command, value = null) => document.execCommand(command, false, value)

export const formatBlock = 'formatBlock'

export const queryCommandState = command => document.queryCommandState(command)

export const queryCommandValue = command => document.queryCommandValue(command)

export const createDropDownMenu = ( button, itemsArray, content, id ) => {

    const dropdownContainer = document.createElement('div');
    dropdownContainer.className = 'dropdown';

    // 기존 버튼을 복제하여 새로운 버튼을 만듭니다.
    const newButton = button.cloneNode(true);

    // 드롭다운 컨테이너 생성
    const dropdown = document.createElement('div');
    dropdown.id = id;
    dropdown.className = 'Menu-dropdown';

    Array.from( itemsArray ).forEach( action => {
        
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

    return dropdownContainer

}