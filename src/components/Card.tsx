import React from 'react'

interface PropsType {
  cardTitle: string
  cardDescription: string
}

export default class Card extends React.Component<PropsType, {}> {
  render() {
    const style = {
      width: '260px',
      height: '325px'
    }

    return (
      <div className="card" style={style}>
        <img className="card-img-top" />
        <div className="card-body">
          <h5 className="card-title">{this.props.cardTitle}</h5>
          <p className="card-text">{this.props.cardDescription}</p>
        </div>
      </div>
    )
  }
}
