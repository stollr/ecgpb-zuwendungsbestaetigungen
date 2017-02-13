function parseDate(dateString) {
    var splitted = dateString.split('.');
    return new Date(splitted[2] + '-' + splitted[1] + '-' + splitted[0]);
}

function parseLocaleNumber(stringNumber) {
    var thousandSeparator = (1111).toLocaleString().replace(/1/g, '');
    var decimalSeparator = (1.1).toLocaleString().replace(/1/g, '');

    return parseFloat(stringNumber
        .replace(new RegExp('\\' + thousandSeparator, 'g'), '')
        .replace(new RegExp('\\' + decimalSeparator), '.')
    );
}

var OpenButton = React.createClass({
    getInitialState: function() {
      return {
          file: null,
          openFileInput: {
              style: {
                  display: 'none'
              }
          }
      };
    },

    open: function() {
        this.openFileInput.click();
    },

    fileOpened: function() {
        if (this.openFileInput.files.length > 0) {
            this.state.file = this.openFileInput.files[0];

            if (this.props.onFileOpened) {
                this.props.onFileOpened(this.state.file);
            }
        }
    },

    render: function() {
        var $this = this;

        return (
            <div>
                <input
                    type="file"
                    id="open-file"
                    style={this.state.openFileInput.style}
                    onChange={this.fileOpened}
                    ref={function (element) {
                        $this.openFileInput = element;
                    }}
                />
                <button type="button" className="btn btn-default navbar-btn" onClick={this.open}>
                    <span className="glyphicon glyphicon-folder-open"></span>&nbsp; Öffnen
                </button>
            </div>
        );
    }
});

var GenerateDonationReceiptsButton = React.createClass({
    getInitialState: function() {
        this.props.activeStateSetter(this.setActive);

        return {
            active: false
        };
    },

    onClick: function() {
        this.props.onClick && this.props.onClick();
    },

    setActive: function(status) {
        this.setState({active: status}); 
    },

    render: function() {
        return (
            <button
                type="button"
                className="btn btn-default navbar-btn"
                disabled={!this.state.active}
                onClick={this.onClick}
            >
                <span className="glyphicon glyphicon-share"></span>
                &nbsp; Zuwendungsbestätigungen generieren
            </button>
        );
    }
});

var CsvTable = React.createClass({
    propTypes: {
        csvRows: React.PropTypes.instanceOf(Array).isRequired
    },

    getInitialState: function () {
        return {};
    },

    render: function() {
        return (
            <table className="table table-condensed table-bordered table-striped">
                <thead>
                    <tr>
                        <th>{this.props.csvRows[0]['NAME']}</th>{/* name */}
                        <th>{this.props.csvRows[0]['VORNAME']}</th>{/* vorname */}
                        <th>{this.props.csvRows[0]['BETRAG']}</th>{/* betrag */}
                        <th>{this.props.csvRows[0]['BEMERKUNG']}</th>{/* bemerkung */}
                        <th>{this.props.csvRows[0]['DATUM']}</th>{/* datum */}
                        <th>{this.props.csvRows[0]['KONTO']}</th>{/* konto */}
                        <th>{this.props.csvRows[0]['GELD']}</th>{/* geldkonto */}
                        <th>{this.props.csvRows[0]['MITNUM']}</th>{/* mitgliedernr. */}
                    </tr>
                </thead>
                <tbody>{(function($this) {
                    var csvRows = [];

                    for (var i = 1; i < $this.props.csvRows.length; i++) {
                        csvRows.push(
                            <tr key={i}>
                                <td>{$this.props.csvRows[i]['NAME']}</td>{/* name */}
                                <td>{$this.props.csvRows[i]['VORNAME']}</td>{/* vorname */}
                                <td>{$this.props.csvRows[i]['BETRAG']}</td>{/* betrag */}
                                <td>{$this.props.csvRows[i]['BEMERKUNG']}</td>{/* bemerkung */}
                                <td>{$this.props.csvRows[i]['DATUM']}</td>{/* datum */}
                                <td>{$this.props.csvRows[i]['KONTO']}</td>{/* konto */}
                                <td>{$this.props.csvRows[i]['GELD']}</td>{/* geldkonto */}
                                <td>{$this.props.csvRows[i]['MITNUM']}</td>{/* mitgliedernr. */}
                            </tr>
                        );
                    }
                    return csvRows; 
                })(this)}</tbody>
            </table>
        );
    }
});

var DonationReceipt = React.createClass({
    propTypes: {
        donationRows: React.PropTypes.instanceOf(Array).isRequired
    },

    calculateTotal: function() {
        var total = 0.0;
        for (var i = 0; i < this.props.donationRows.length; i++) {
            total += parseLocaleNumber(this.props.donationRows[i]['BETRAG'].toString());
        }
        return total;
    },

    guessNumberOfAttachmentPages: function() {
        var numberOfPages = 1;

        // about 31 rows fit on the first page
        var numberOfRows = this.props.donationRows.length - 31;

        if (numberOfRows > 0) {
            // about 33 rows fit on the other pages
            numberOfPages += Math.ceil(numberOfRows / 33);
        }

        return numberOfPages;
    },

    generateAttachmentPagePlaceholder: function() {
        var placeholderElements = [];
        for (var i = this.guessNumberOfAttachmentPages(); i > 0; i--) {
            placeholderElements.push(<div key={i} className="attachment-page-placeholder">&nbsp;</div>);
        }
        return placeholderElements;
    },

    render: function() {
        var currentDate  = (new Date()).toLocaleDateString('de-DE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });

        var firstRow     = this.props.donationRows[0];
        var donationDate = parseDate(firstRow['DATUM']);
        var salutation   = firstRow['ANREDE'];
        var firstname    = firstRow['VORNAME'];
        var lastname     = firstRow['NAME'];
        var street       = firstRow['STRASSE'];
        var zip          = firstRow['PLZ'];
        var city         = firstRow['ORT'];
        var country      = firstRow['LAND'];
        var total        = this.calculateTotal();

        var translator = new T2W("DE_DE");
        var totalInWords = translator.toWords(Math.floor(total));
        var totalDecInWords = translator.toWords(Math.round((total * 100) % 100)); // we have to round here, otherwise we may get problems with floating point precision

        switch (country) {
            case 'D':
            case 'DE': country = ''; break;
        }

        return (
            <div className="donation-receipt">
                <div className="first-page">
                    <div className="text-right">
                        <img className="logo" src="img/logo.png" />
                    </div>
                    {/* this is needed in print view to get the correct margin of address */}
                    <div className="address-margin">&nbsp;</div>
                    <div className="address">
                        <div className="sender">
                            <u>Evangeliums-Christengemeinde e.V. &middot; Karl-Schurz-Str. 28 &middot; 33100 Paderborn</u>
                        </div>
                        {salutation}<br/>
                        {firstname} {lastname}<br/>
                        {street}<br/>
                        {zip} {city}<br/>
                        {country}<br/>
                    </div>
                    <div className="date text-right">Paderborn, den {currentDate}</div>
                    <h2>
                        Sammelbestätigung über Geldzuwendungen für das
                        Kalenderjahr {donationDate.getFullYear()}
                    </h2>
                    <p className="text-small text-justify">
                        im Sinne des § 10b des Einkommensteuergesetzes an eine
                        der in § 5 Abs. 1 Nr. 9 des Körperschaftsteuersesetzes
                        bezeichneten Körperschaften, Personenvereinigungen oder
                        Vermögensmassen.
                    </p>
                    <table className="table table-bordered table-condensed">
                        <thead>
                            <tr>
                                <th>Betrag der Zuwendung - in Ziffern -</th>
                                <th>- in Buchstaben -</th>
                                <th>Datum der Zuwendung</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>{total.toFixed(2).replace('.', ',')} &euro;</td>
                                <td>{totalInWords} Komma {totalDecInWords} &euro;</td>
                                <td>siehe Anlage/Rückseite</td>
                            </tr>
                        </tbody>
                    </table>
                    <p>Es handelt sich um den Verzicht auf die Erstattung von Aufwendungen Ja [ &nbsp; ] Nein [ X ]</p>
                    <br/>
                    <p className="text-small text-justify">
                        Wir sind wegen Förderung gemeinnütziger Zwecke nach dem Freistellungsbescheid bzw. nach der Anlage zum Körperschaftsteuerbescheid des
                        Finanz&shy;amtes Paderborn, StNr. 339/5780/4167 vom 16.03.2015 für den letzten Veranlagungszeitraum 2011 bis 2013 nach § 5 Abs. 1 Nr. 9 des
                        Körperschaft&shy;steuergesetzes von der Körperschaftsteuer und nach § 3 Nr. 6 des Gewerbesteuergesetzes von der Gewerbesteuer befreit.
                    </p>
                    <p className="text-small text-justify">
                        Die Einhaltung der satzungsmäßigen Voraussetzungen nach den §§ 51, 59, 60 und 61 AO wurde vom Finanzamt Paderborn, StNr. 339/5780/4167 mit
                        Bescheid vom 16.03.2015 nach § 60a AO gesondert festgestellt. Wir fördern nach unserer Satzung gemeinnützige Zwecke.
                    </p>
                    <p className="text-small text-justify">
                        Es wird bestätigt, dass die Zuwendungen nur zur Förderung gemeinnütziger Zwecke verwendet werden. Es wird bestätigt, dass es sich nicht um
                        Mit&shy;gliedsbeiträge handelt, dessen Abzug nach § 10b Abs. 1 des Einkommensteuergesetzes ausgeschlossen ist.
                    </p>
                    <p className="text-small text-justify">
                        Es wird bestätigt, dass über die in der Gesamtsumme enthaltenen Zuwendungen keine weiteren Bestätigungen, weder formelle
                        Zuwendungsbestäti&shy;gungen noch Beitragsquittungen oder ähnliches, ausgestellt wurden und werden.
                    </p>
                    <p className="signature">
                        Christian Stoller, Buchhaltung
                    </p>
                    <p className="text-small text-justify">
                        <b>Hinweis:</b><br/>
                        Wer vorsätzlich oder grob fahrlässig eine unrichtige Zuwendungsbestätigung erstellt oder veranlasst, dass Zuwendungen nicht zu den in der
                        Zuwendungsbestätigung angegebenen steuerbegünstigten Zwecken verwendet werden, haftet für die entgangene Steuer (§ 10b Abs. 4 EStG, § 9 Abs.
                        3 KStG, § 9 Nr. 5 GewStG).
                    </p>
                    <p className="text-small text-justify">
                        Diese Bestätigung wird nicht als Nachweis für die steuerliche Berücksichtigung der Zuwendung anerkannt, wenn das Datum des
                        Freistellungsbescheides länger als 5 Jahre bzw. das Datum der Feststellung der Einhaltung der satzungsmäßigen Voraussetzungen nach § 60a Abs. 1
                        AO länger als 3 Jahre seit Ausstellung des Bescheides zurückliegt (§ 63 Abs. 5 AO).
                    </p>
                    <table className="footer">
                        <tbody>
                            <tr>
                                <td className="text-small">
                                    Evangeliums-Christengemeinde e.V.<br/>
                                    Karl-Schurz-Straße 28<br/>
                                    33100 Paderborn
                                </td>
                                <td className="text-small">
                                    Tel.: 05251 - 59134<br/>
                                    E-Mail: info@ecg-paderborn.de<br/>
                                    www.ecg-paderborn.de
                                </td>
                                <td className="text-small">
                                    IBAN: DE12 4765 0130 0028 0013 03<br/>
                                    BIC: WELADE3LXXX<br/>
                                    Sparkasse Paderborn-Detmold
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className="attachment">
                    <h2>Anlage zur Sammelbestätigung</h2>
                    <p>
                        vom {currentDate} der Evangeliums-Christengemeinde e.V.
                        für den Zuwendenden {firstname} {lastname}, {street}, {zip} {city}
                    </p>
                    <table className="donations table table-bordered table-condensed">
                        <thead>
                            <tr>
                                <th>Datum der<br/>Zuwendung</th>
                                <th>Art der Zuwendung</th>
                                <th>Verzicht auf<br/>Erstattung</th>
                                <th>Verwendungszweck</th>
                                <th className="text-right">Betrag</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.props.donationRows.map(function (row, index) {
                                var amount = parseLocaleNumber(row['BETRAG']);
                                return (
                                    <tr key={index}>
                                        <td>
                                            {
                                                parseDate(row['DATUM']).toLocaleDateString('de-DE', {
                                                    year: 'numeric',
                                                    month: '2-digit',
                                                    day: '2-digit'
                                                })
                                            }
                                        </td>
                                        <td>Geldzuwendung</td>
                                        <td>nein</td>
                                        <td>{row['BEMERKUNG']}</td>
                                        <td className="text-right">{amount.toFixed(2).replace('.', ',')} &euro;</td>
                                    </tr>
                                );
                            })}
                            <tr>
                                <td colSpan="4">
                                    <strong>Gesamtsumme</strong>
                                </td>
                                <td className="text-right">
                                    <strong>{total.toFixed(2).replace('.', ',')} &euro;</strong>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                {/*this.generateAttachmentPagePlaceholder()*/}
            </div>
        );
    }
});

var App = React.createClass({
    getInitialState: function() {
        return {
            file: null,
            csvRows: [],
            openButton: <OpenButton onFileOpened={this.onFileOpened} />,
            generateDonationReceiptsButton: <GenerateDonationReceiptsButton
                onClick={this.onPrintPreviewClicked}
                activeStateSetter={this.setActiveStateSetter}
            />,
            activeStateSetterFnc: null,
            donationReceipts: []
        };
    },

    getOpenButton: function () {
        return this.state.openButton;
    },

    getGenerateDonationReceiptsButton: function () {
        return this.state.generateDonationReceiptsButton;
    },

    setActiveStateSetter: function (activeStateSetterFnc) {
        this.state.activeStateSetterFnc = activeStateSetterFnc;
    },

    onFileOpened: function(file) {
        var $this = this;

        var reader = new FileReader();
        reader.onload = function(e) {
            CSV.RELAXED = true;
            CSV.COLUMN_SEPARATOR = ';';

            var fileContent = e.target.result;
            //var csvRows = CSV.parse(convertLatin1ToUtf8(fileContent));
            var csvRows = CSV.parse(fileContent);
            var headerRow = csvRows[0];

            // convert rows to objects
            for (var i = 0; i < csvRows.length; i++) {
                var obj = {};
                for (var j = 0; j < csvRows[i].length; j++) {
                    var key = headerRow[j];
                    obj[key] = csvRows[i][j];
                }
                csvRows[i] = obj;
            }

            $this.state.activeStateSetterFnc(true);
            $this.setState({
                file: file,
                csvRows: csvRows,
                donationReceipts: []
            });
        };
        reader.readAsText(file, 'ISO-8859-1');
    },

    onPrintPreviewClicked: function() {
        var groupedByDonator = {};

        for (var i = 1; i < this.state.csvRows.length; i++) {
            var row = this.state.csvRows[i];
            var account = row['KONTO'];
            var donatorId = row['MITNUM'];
            if (account == '3221') {
                if (groupedByDonator[donatorId]) {
                    groupedByDonator[donatorId].push(row);
                } else {
                    groupedByDonator[donatorId] = [row];
                }
            }
        }

        var donationReceipts = [];

        for (var donatorId in groupedByDonator) {
            var donationRows = groupedByDonator[donatorId];
            donationReceipts.push(
                <DonationReceipt key={donatorId} donationRows={donationRows} />
            );
        }

        this.setState({donationReceipts: donationReceipts});
    },

    render: function() {
        if (this.state.donationReceipts.length > 0) {
            return (
                <div>{this.state.donationReceipts}</div>
            );
        }
        
        if (this.state.file) {
            return(
                <div>
                    <CsvTable csvRows={this.state.csvRows}></CsvTable>
                </div>
            );
        }

        return (
            <div></div>
        );
    }
});

//var openButton = <OpenButton />;
//console.log(openButton);
//
//ReactDOM.render(<OpenButton />, document.querySelector('#open-button'));

var renderedApp = ReactDOM.render(<App />, document.querySelector('#donation-list'));

ReactDOM.render(renderedApp.getOpenButton(), document.querySelector('#open-button'));
ReactDOM.render(renderedApp.getGenerateDonationReceiptsButton(), document.querySelector('#generate-donation-receipts-button'));
