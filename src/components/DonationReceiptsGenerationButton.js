import React from 'react';

class DonationReceiptsGenerationButton extends React.Component {
    constructor(props) {
        super(props);

        this.onClick = this.onClick.bind(this);
    }

    onClick() {
        this.props.onClick && this.props.onClick();
    }

    render() {
        return (
            <button
                type="button"
                className="btn btn-primary"
                disabled={this.props.disabled}
                onClick={this.onClick}
            >
                <i className="fas fa-sticky-note"></i> Zuwendungsbestätigungen generieren
            </button>
        );
    }
}

export default DonationReceiptsGenerationButton;