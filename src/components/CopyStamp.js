import React from 'react';
import './CopyStamp.css';

class CopyStamp extends React.Component {
    constructor(props) {
        super(props);

        // Make the stamp look more real with a variable position :-)
        this.marginLeft = 13; // unit is 'rem'
        this.marginLeft += Math.random() * 6 - 3; // random value between -3 and +3
    }

    render() {
        return (
            <div className={'copy-stamp ' + (this.props.show ? 'd-block' : 'd-none')}
                 style={{marginLeft: this.marginLeft + 'rem'}}>
                Kopie
            </div>
        );
    }
}

export default CopyStamp;