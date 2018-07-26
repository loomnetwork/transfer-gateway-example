import React from 'react'

interface PropsType {
  children?: Array<JSX.Element> | JSX.Element
}

export default class Main extends React.Component<PropsType, {}> {
  render() {
    return <div className="container">{this.props.children}</div>
  }
}
