import React from 'react'
import ReactDOM from 'react-dom'

import Main from './components/Main'
import Card from './components/Card'

const Index = () => {
  return (
    <Main>
      <Card cardTitle="Great Golen" cardDescription="Powerfull Golen" />
    </Main>
  )
}

ReactDOM.render(<Index />, document.getElementById('root'))
