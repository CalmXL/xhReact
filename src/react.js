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

let nextUnitOfWork, wipFiber, currentRoot;

function render(element, container) {
  nextUnitOfWork = {
    dom: container,
    props: {
      children: [element]
    }
  }
  wipFiber = nextUnitOfWork
}

export function update() {
  nextUnitOfWork = {
    ...currentRoot,
    alternate: currentRoot, // 记录上一次的 fiber
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
  deletions.forEach(commitWork)
  deletions = []
  commitWork(wipFiber.child)
  currentRoot = wipFiber;
  wipFiber = null
}

function commitDeletion(fiber, parentDom) {
  if (fiber.dom) {
    parentDom.removeChild(fiber.dom)
  } else {
    commitDeletion(fiber.child, parentDom)
  }
}

function commitWork(fiber) {
  if (!fiber) return
  let parentFiber = fiber.parent
  while (!parentFiber.dom) {
    parentFiber = parentFiber.parent
  }
  const parentDom = parentFiber.dom

  if (fiber.effectTag === 'DELETION') {
    commitDeletion(fiber, parentDom)
    return
  }

  if (fiber.effectTag === 'UPDATE' && fiber.dom) {
    updateDom(fiber.dom, fiber.alternate.props, fiber.props)
  }

  if (fiber.effectTag === "PLACEMENT" && fiber.dom) {
    parentDom.append(fiber.dom)
  }

  commitWork(fiber.child)
  commitWork(fiber.sibling)
}

// 将 dom 节点，组装成链表数据结构
function performUnitOfWork(fiber) {
  const isFunctionComponent = fiber.type instanceof Function;
  if (isFunctionComponent) {
    updateFunctionComponent(fiber)
  } else {
    updateHostComponent(fiber)
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

function updateFunctionComponent(fiber) {
  fiber.props.children = [fiber.type(fiber.props)]
  reconcileChildren(fiber, fiber.props.children)
}

function updateHostComponent(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber)
  }
  reconcileChildren(fiber, fiber.props.children)
}

let deletions = [];
function reconcileChildren(fiber, elements) {
  let oldFiber = fiber.alternate && fiber.alternate.child;
  let index = 0;
  let prevSibling = null
  let newFiber
  // 遍历子节点
  while (index < elements.length || oldFiber) {
    const element = elements[index]
    const sameType = oldFiber && oldFiber.type === element.type;

    // 如果是同一个类型的节点
    if (sameType) {
      newFiber = {
        type: element.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: fiber,
        alternate: oldFiber, // 记录上一次的 fiber
        child: null,
        sibling: null,
        effectTag: 'UPDATE'
      }
    }

    // 如果不是同一个类型的节点
    if (element && !sameType) {
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: fiber,
        alternate: null,
        child: null,
        sibling: null,
        effectTag: 'PLACEMENT'
      }
    }

    // 如果存在旧的节点，但是类型不同
    if (oldFiber && !sameType) {
      oldFiber.effectTag = 'DELETION'
      deletions.push(oldFiber)
    }

    if (oldFiber) oldFiber = oldFiber.sibling;

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
}


function createDom(fiber) {
  const dom = fiber.type === 'TEXT_ELEMENT'
    ? document.createTextNode('')
    : document.createElement(fiber.type);

  updateDom(dom, {}, fiber.props)

  return dom
}

const isEvent = key => key.startsWith('on')
const isProperty = key => key !== 'children' && !isEvent(key)
const eventType = key => key.substring(2).toLowerCase()
const isGone = (prev, next) => key => !(key in next)
const isNew = (prev, next) => key => prev[key] !== next[key]
function updateDom(dom, prevProps, nextProps) {
  // 删除旧的属性
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach(name => dom[name] = '')

  // 增加属性
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach(name => dom[name] = nextProps[name])

  // 删除事件
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(key => !(key in nextProps) || isNew(prevProps, nextProps)(key))
    .forEach((name) => {
      dom.removeEventListener(eventType(name), prevProps[name])
    })

  // 添加事件
  Object.keys(nextProps)
    .filter(isEvent)
    .forEach((name) => {
      dom.addEventListener(eventType(name), nextProps[name])
    })
}

requestIdleCallback(workLoop)

export default {
  render,
  createElement
}