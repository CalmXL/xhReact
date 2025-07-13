function createTextElement(text) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: []
    }
  }
}

function createElement(type, props, ...children) {
  // 使用 ... 语法，即使用户没有传参，会接收到一个空数组
  return {
    type,
    props: {
      ...props,
      children: children.map(child => typeof child === 'object' ? child : createTextElement(child))
    }
  }
}

let nextUnitOfWork, // 下一个工作单元
  wipFiber,
  currentRoot; 

function render(element, container) {
  nextUnitOfWork = {
    dom: container,
    props: {
      children: [element]
    }
  }
  wipFiber = nextUnitOfWork
}

export function update () {
  nextUnitOfWork = {
    ...currentRoot
  }

  wipFiber = nextUnitOfWork;
}

function workLoop(deadline) {
  let shouldYield = false;

  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
    shouldYield = deadline.timeRemaining() < 1
  }

  if (!nextUnitOfWork && wipFiber) {
    // 当链表创建完成，提交 root
    commitRoot()
  }
  requestIdleCallback(workLoop)
}

function commitRoot() {
  commitWork(wipFiber.child)
  currentRoot = wipFiber;
  wipFiber = null
}

function commitWork(fiber) {
  if (!fiber) return
  let parentFiber = fiber.parent
  while (!parentFiber.dom) {
    parentFiber = parentFiber.parent
  }
  const parentDom = parentFiber.dom
  if (fiber.dom) {
    parentDom.append(fiber.dom)
  }

  commitWork(fiber.child)
  commitWork(fiber.sibling)
}


// 将 dom 节点，组装成链表数据结构
function performUnitOfWork(fiber) {
  const isFunctionComponent = fiber.type instanceof Function;
  if (isFunctionComponent) {
    fiber.props.children = [fiber.type(fiber.props)]
  } else {
    if (!fiber.dom) {
      fiber.dom = createDom(fiber)
    }
  }

  const elements = fiber.props.children
  let index = 0;
  let prevSibling = null
  // 遍历子节点
  while (index < elements.length) {
    const element = elements[index]
    const newFiber = {
      type: element.type,
      props: element.props,
      dom: null,
      parent: fiber,
      child: null,
      sibling: null
    }

    if (index === 0) {
      // 构建 child 
      fiber.child = newFiber
    } else {
      // 构建 sibling
      prevSibling.sibling = newFiber
    }

    prevSibling = newFiber
    index++
  }

  if (fiber.child) return fiber.child
  let nextFiber = fiber
  // 当遍历到最深度的子节点，会查找其叔叔节点，没有则会向上查找
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling
    }

    nextFiber = nextFiber.parent
  }
}

const isEvent = key => key.startsWith('on')
const isProperty = key => key !== 'children' && !isEvent(key)
const eventType = key => key.substring(2).toLowerCase()
function createDom(fiber) {
  const dom = fiber.type === 'TEXT_ELEMENT' ? document.createTextNode('') : document.createElement(fiber.type);
  console.log(fiber);
  
  Object.keys(fiber.props).filter(isProperty).forEach((name) => {
    dom[name] = fiber.props[name]
  })

  // 添加事件
  Object.keys(fiber.props).filter(isEvent).forEach((name) => {
    dom.addEventListener(eventType(name), fiber.props[name])
  })
  return dom
}

requestIdleCallback(workLoop)

export default {
  render,
  createElement
}