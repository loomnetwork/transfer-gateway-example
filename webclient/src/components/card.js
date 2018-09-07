import React from 'react'

// the actual js for the card
export default class Card extends React.Component {
  render() {
    return (
      <div className="card" style={{ width: 286, height: 300, float: 'left', margin: 4 }}>
        <h5 className="card-header">{this.props.title}</h5>
        <div className="card-body">
          <p className="card-text">
            <strong>Qtd:</strong> 1
          </p>
          <p className="card-text">
            <strong>Desc:</strong> {this.props.description}
          </p>
        </div>
        <div className="card-footer">
          <button
            disabled={this.props.disabled}
            type="button"
            className="btn btn-primary"
            onClick={() => this.props.handleOnClick()}>
            {this.props.action}
          </button>
        </div>
      </div>
    )
  }
}
