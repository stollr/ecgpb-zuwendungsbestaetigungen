function parseDate(dateString) {
    var splitted = dateString.split('.');
    return new Date(splitted[2] + '-' + splitted[1] + '-' + splitted[0]);
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
                        <th>{this.props.csvRows[0][1]}</th>{/* name */}
                        <th>{this.props.csvRows[0][2]}</th>{/* vorname */}
                        <th>{this.props.csvRows[0][3]}</th>{/* betrag */}
                        <th>{this.props.csvRows[0][6]}</th>{/* bemerkung */}
                        <th>{this.props.csvRows[0][8]}</th>{/* datum */}
                        <th>{this.props.csvRows[0][15]}</th>{/* konto */}
                        <th>{this.props.csvRows[0][16]}</th>{/* geldkonto */}
                        <th>{this.props.csvRows[0][22]}</th>{/* mitgliedernr. */}
                    </tr>
                </thead>
                <tbody>{(function($this) {
                    var csvRows = [];

                    for (var i = 1; i < $this.props.csvRows.length; i++) {
                        csvRows.push(
                            <tr>
                                <td>{$this.props.csvRows[i][1]}</td>{/* name */}
                                <td>{$this.props.csvRows[i][2]}</td>{/* vorname */}
                                <td>{$this.props.csvRows[i][3]}</td>{/* betrag */}
                                <td>{$this.props.csvRows[i][6]}</td>{/* bemerkung */}
                                <td>{$this.props.csvRows[i][8]}</td>{/* datum */}
                                <td>{$this.props.csvRows[i][15]}</td>{/* konto */}
                                <td>{$this.props.csvRows[i][16]}</td>{/* geldkonto */}
                                <td>{$this.props.csvRows[i][22]}</td>{/* mitgliedernr. */}
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
            total += parseFloat(this.props.donationRows[i][3].toString().replace(',', '.'));
        }
        return total;
    },

    guessNumberOfAttachmentPages: function() {
        var numberOfPages = 1;

        // about 31 rows fit on the first page
        var numberOfRows = this.props.donationRows.length - 31;

        if (numberOfRows > 0) {
            // about 33 rows fit on the other pages
            numberOfPages += Math.ceil(numberOfRows / 33)
        }

        return numberOfPages;
    },

    generateAttachmentPagePlaceholder: function() {
        var placeholderElements = [];
        for (var i = this.guessNumberOfAttachmentPages(); i > 0; i--) {
            placeholderElements.push(<div className="attachment-page-placeholder">&nbsp;</div>);
        }
        return placeholderElements;
    },

    render: function() {
        var firstRow     = this.props.donationRows[0];
        var currentDate  = (new Date()).toLocaleDateString();
        var donationDate = parseDate(firstRow[8]);
        var salutation   = firstRow[33];
        var firstname    = firstRow[2];
        var lastname     = firstRow[1];
        var street       = firstRow[24];
        var zip          = firstRow[26];
        var city         = firstRow[27];
        var country      = firstRow[25];
        var total        = this.calculateTotal();

        var translator = new T2W("DE_DE");
        var totalInWords = translator.toWords(Math.round(total));
        var totalDecInWords = translator.toWords((total * 100) % 100);

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
                            {this.props.donationRows.map(function (row) {
                                var amount = parseFloat(row[3].toString().replace(',', '.'));
                                return (
                                    <tr>
                                        <td>
                                            {
                                                parseDate(row[8]).toLocaleDateString('de-DE', {
                                                    year: 'numeric',
                                                    month: '2-digit',
                                                    day: '2-digit'
                                                })
                                            }
                                        </td>
                                        <td>Geldzuwendung</td>
                                        <td>nein</td>
                                        <td>{row[6]}</td>
                                        <td className="text-right">{amount.toFixed(2)} &euro;</td>
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
                {this.generateAttachmentPagePlaceholder()}
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
            var account = row[15];
            var donatorId = row[22];
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
                <DonationReceipt donationRows={donationRows} />
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