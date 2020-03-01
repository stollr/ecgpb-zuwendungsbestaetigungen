import React from 'react';

class OpenButton extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            file: 22
        };

        this.fileInputRef = React.createRef();
        this.open = this.open.bind(this);
        this.onFileSelected = this.onFileSelected.bind(this);
    }

    open() {
        this.fileInputRef.current.click();
    }

    onFileSelected() {
        if (this.fileInputRef.current.files.length > 0) {
            var file = this.fileInputRef.current.files[0];
            this.setState({file: this.fileInputRef.current.files[0]});

            if (this.props.onFileOpened) {
                //this.props.onFileOpened(this.state.file, 'test-string', typeof(this.state.file));
                this.props.onFileOpened(file, 'test-string', typeof(file));
            }
        }
    }

    render() {
        return (
            <button type="button" className="btn btn-light mr-3" onClick={this.open}>
                <input
                    type="file"
                    className="d-none"
                    onChange={this.onFileSelected}
                    ref={this.fileInputRef}
                />
                <i className="fas fa-folder-open"></i> Öffnen
            </button>
        );
    }
}

export default OpenButton;