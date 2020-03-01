import React from 'react';
import PropTypes from 'prop-types';

class CsvTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <table className="table table-sm table-bordered table-striped">
                <thead>
                    <tr>
                        <th comment="name">{this.props.rows[0]['NAME']}</th>
                        <th comment="vorname">{this.props.rows[0]['VORNAME']}</th>
                        <th comment="betrag">{this.props.rows[0]['BETRAG']}</th>
                        <th comment="bemerkung">{this.props.rows[0]['BEMERKUNG']}</th>
                        <th comment="datum">{this.props.rows[0]['DATUM']}</th>
                        <th comment="konto">{this.props.rows[0]['KONTO']}</th>
                        <th comment="geldkonto">{this.props.rows[0]['GELD']}</th>
                        <th comment="mitgliedernr.">{this.props.rows[0]['MITNUM']}</th>
                    </tr>
                </thead>
                <tbody>{this.props.rows.slice(1).map(function(row, i) {
                    return (
                        <tr key={i}>
                            <td>{row['NAME']}</td>
                            <td>{row['VORNAME']}</td>
                            <td>{row['BETRAG']}</td>
                            <td>{row['BEMERKUNG']}</td>
                            <td>{row['DATUM']}</td>
                            <td>{row['KONTO']}</td>
                            <td>{row['GELD']}</td>
                            <td>{row['MITNUM']}</td>
                        </tr>
                    );
                })}</tbody>
            </table>
        );
    }
}

CsvTable.propTypes = {
    rows: PropTypes.array.isRequired
};

export default CsvTable;