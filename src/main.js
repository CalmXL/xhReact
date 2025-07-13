import App from './App.jsx'
import { createRoot } from './reactDom'

createRoot(document.querySelector('#root')).render(App)

function callback (deadline) {
  // console.log(deadline.timeRemaining());
}

/**
 * 插入一个函数，这个函数将在浏览器空闲时期被调用。
 * callback(IdleDeadline): 一个在事件循环空闲时即将被调用的函数。
 *    IdleDeadline: 回调函数的参数类型，它提供了 timeRemaining 方法，返回一个
 *                  DOMHighTimeStamp, 其为浮点数，用来表示当前限制周期的预估毫秒数。
 */
requestIdleCallback(callback)