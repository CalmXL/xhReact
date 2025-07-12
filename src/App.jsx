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

import React from "./react"

// jsx
const App = <div id="app" style="color: red">xulei { 1 + 2 }</div>

export default App