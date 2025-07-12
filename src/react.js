
function createTextElement (text) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: []
    }
  }
}

function createElement (type, props, ...children) {
  // 使用 ... 语法，即使用户没有传参，会接收到一个空数组
  return {
    type,
    props: {
      ...props,
      children: children.map(child => typeof child === 'object' ? child : createTextElement(child))
    }
  }
}

const isProperty = key => key !== 'children'

function render(element, container) {
  const dom = element.type === 'TEXT_ELEMENT' ? document.createTextNode('') : document.createElement(element.type);
  Object.keys(element.props).filter(isProperty).forEach((name) => {
    dom[name] = element.props[name]
  })

  container.appendChild(dom)
  element.props.children.forEach((child) => render(child, dom))
}

export default {
  render,
  createElement
}