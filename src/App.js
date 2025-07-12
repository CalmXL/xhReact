const App = {
  type: 'div',
  props: {
    id: 'app',
    style: "background: red; width: 100px; height: 100px;",
    children: [
      {
        type: 'TEXT_ELEMENT',
        props: {
          nodeValue: 'xulei',
          children: []
        }
      }
    ]
  }
}

export default App