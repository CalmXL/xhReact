// const App = {
//   type: 'div',
//   props: {
//     id: 'app',
//     style: "background: red; width: 100px; height: 100px;",
//     children: [
//       {
//         type: 'TEXT_ELEMENT',
//         props: {
//           nodeValue: 'xulei',
//           children: []
//         }
//       }
//     ]
//   }
// }

// const React = {
//   createElement (type, props, children) {
//     console.log(type, props, children);
//   }
// }

// // 可以使用自定义的 a.createElement 
// // import a from "./react"

import React, { update, useState } from "./react"

// jsx
// const App = <div id="app" style="color: pink">
//   <h1>xulei</h1>
//   <h2>xuhong</h2>
// </div>

let a = 1;

function H3(props) {
  return <h3>h3</h3>
}

function H4(props) {
  return <h4>h4</h4>
}

function App(props) {
  const [value, setValue] = useState(0)

  const handleClick = () => {
    console.log('event..');
    // update()
    // a++;
    // setValue(v => v + 1)
    setValue(100)
  }

  return (
    <div id="app" style="color: pink; border: solid 1px #000;" onClick={handleClick}>
      <h2>xuhong: {value}</h2>
      <h2>xulei</h2>
      {/* <h2>{a % 2 === 0 ? <div>'偶数'</div> : <p>'奇数'</p>}</h2> */}
      <h2>{value % 2 ? <H3>'偶数'</H3> : <H4>'奇数'</H4>}</h2>
    </div>
  )
}
/**
 * fiber diff
 * 1. 没有变化， 使用旧的 dom
 * 2. 有变化，使用新的 
 * 3. 旧的删除，移动旧的
 */
export default App