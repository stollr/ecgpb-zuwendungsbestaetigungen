function parseDate(dateString) {
    var splitted = dateString.split('.');
    return new Date(splitted[2] + '-' + splitted[1] + '-' + splitted[0]);
}

function parseLocaleNumber(stringNumber) {
    var thousandSeparator = 1111 .toLocaleString().replace(/1/g, '');
    var decimalSeparator = 1.1.toLocaleString().replace(/1/g, '');

    return parseFloat(stringNumber.replace(new RegExp('\\' + thousandSeparator, 'g'), '').replace(new RegExp('\\' + decimalSeparator), '.'));
}

var OpenButton = React.createClass({
    getInitialState: function () {
        return {
            file: null,
            openFileInput: {
                style: {
                    display: 'none'
                }
            }
        };
    },

    open: function () {
        this.openFileInput.click();
    },

    fileOpened: function () {
        if (this.openFileInput.files.length > 0) {
            this.state.file = this.openFileInput.files[0];

            if (this.props.onFileOpened) {
                this.props.onFileOpened(this.state.file);
            }
        }
    },

    render: function () {
        var $this = this;

        return React.createElement(
            'div',
            null,
            React.createElement('input', {
                type: 'file',
                id: 'open-file',
                style: this.state.openFileInput.style,
                onChange: this.fileOpened,
                ref: function (element) {
                    $this.openFileInput = element;
                }
            }),
            React.createElement(
                'button',
                { type: 'button', className: 'btn btn-default navbar-btn', onClick: this.open },
                React.createElement('span', { className: 'glyphicon glyphicon-folder-open' }),
                '\xA0 \xD6ffnen'
            )
        );
    }
});

var GenerateDonationReceiptsButton = React.createClass({
    getInitialState: function () {
        this.props.activeStateSetter(this.setActive);

        return {
            active: false
        };
    },

    onClick: function () {
        this.props.onClick && this.props.onClick();
    },

    setActive: function (status) {
        this.setState({ active: status });
    },

    render: function () {
        return React.createElement(
            'button',
            {
                type: 'button',
                className: 'btn btn-default navbar-btn',
                disabled: !this.state.active,
                onClick: this.onClick
            },
            React.createElement('span', { className: 'glyphicon glyphicon-share' }),
            '\xA0 Zuwendungsbest\xE4tigungen generieren'
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

    render: function () {
        return React.createElement(
            'table',
            { className: 'table table-condensed table-bordered table-striped' },
            React.createElement(
                'thead',
                null,
                React.createElement(
                    'tr',
                    null,
                    React.createElement(
                        'th',
                        null,
                        this.props.csvRows[0]['NAME']
                    ),
                    React.createElement(
                        'th',
                        null,
                        this.props.csvRows[0]['VORNAME']
                    ),
                    React.createElement(
                        'th',
                        null,
                        this.props.csvRows[0]['BETRAG']
                    ),
                    React.createElement(
                        'th',
                        null,
                        this.props.csvRows[0]['BEMERKUNG']
                    ),
                    React.createElement(
                        'th',
                        null,
                        this.props.csvRows[0]['DATUM']
                    ),
                    React.createElement(
                        'th',
                        null,
                        this.props.csvRows[0]['KONTO']
                    ),
                    React.createElement(
                        'th',
                        null,
                        this.props.csvRows[0]['GELD']
                    ),
                    React.createElement(
                        'th',
                        null,
                        this.props.csvRows[0]['MITNUM']
                    )
                )
            ),
            React.createElement(
                'tbody',
                null,
                function ($this) {
                    var csvRows = [];

                    for (var i = 1; i < $this.props.csvRows.length; i++) {
                        csvRows.push(React.createElement(
                            'tr',
                            { key: i },
                            React.createElement(
                                'td',
                                null,
                                $this.props.csvRows[i]['NAME']
                            ),
                            React.createElement(
                                'td',
                                null,
                                $this.props.csvRows[i]['VORNAME']
                            ),
                            React.createElement(
                                'td',
                                null,
                                $this.props.csvRows[i]['BETRAG']
                            ),
                            React.createElement(
                                'td',
                                null,
                                $this.props.csvRows[i]['BEMERKUNG']
                            ),
                            React.createElement(
                                'td',
                                null,
                                $this.props.csvRows[i]['DATUM']
                            ),
                            React.createElement(
                                'td',
                                null,
                                $this.props.csvRows[i]['KONTO']
                            ),
                            React.createElement(
                                'td',
                                null,
                                $this.props.csvRows[i]['GELD']
                            ),
                            React.createElement(
                                'td',
                                null,
                                $this.props.csvRows[i]['MITNUM']
                            )
                        ));
                    }
                    return csvRows;
                }(this)
            )
        );
    }
});

var DonationReceipt = React.createClass({
    propTypes: {
        donationRows: React.PropTypes.instanceOf(Array).isRequired
    },

    calculateTotal: function () {
        var total = 0.0;
        for (var i = 0; i < this.props.donationRows.length; i++) {
            total += parseLocaleNumber(this.props.donationRows[i]['BETRAG'].toString());
        }
        return total;
    },

    guessNumberOfAttachmentPages: function () {
        var numberOfPages = 1;

        // about 31 rows fit on the first page
        var numberOfRows = this.props.donationRows.length - 31;

        if (numberOfRows > 0) {
            // about 33 rows fit on the other pages
            numberOfPages += Math.ceil(numberOfRows / 33);
        }

        return numberOfPages;
    },

    generateAttachmentPagePlaceholder: function () {
        var placeholderElements = [];
        for (var i = this.guessNumberOfAttachmentPages(); i > 0; i--) {
            placeholderElements.push(React.createElement(
                'div',
                { key: i, className: 'attachment-page-placeholder' },
                '\xA0'
            ));
        }
        return placeholderElements;
    },

    render: function () {
        var currentDate = new Date().toLocaleDateString('de-DE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });

        var firstRow = this.props.donationRows[0];
        var donationDate = parseDate(firstRow['DATUM']);
        var salutation = firstRow['ANREDE'];
        var firstname = firstRow['VORNAME'];
        var lastname = firstRow['NAME'];
        var street = firstRow['STRASSE'];
        var zip = firstRow['PLZ'];
        var city = firstRow['ORT'];
        var country = firstRow['LAND'];
        var total = this.calculateTotal();

        var translator = new T2W("DE_DE");
        var totalInWords = translator.toWords(Math.floor(total));
        var totalDecInWords = translator.toWords(Math.round(total * 100 % 100)); // we have to round here, otherwise we may get problems with floating point precision

        switch (country) {
            case 'D':
            case 'DE':
                country = '';break;
        }

        return React.createElement(
            'div',
            { className: 'donation-receipt' },
            React.createElement(
                'div',
                { className: 'first-page' },
                React.createElement(
                    'div',
                    { className: 'text-right' },
                    React.createElement('img', { className: 'logo', src: 'img/logo.png' })
                ),
                React.createElement(
                    'div',
                    { className: 'address-margin' },
                    '\xA0'
                ),
                React.createElement(
                    'div',
                    { className: 'address' },
                    React.createElement(
                        'div',
                        { className: 'sender' },
                        React.createElement(
                            'u',
                            null,
                            'Evangeliums-Christengemeinde e.V. \xB7 Karl-Schurz-Str. 28 \xB7 33100 Paderborn'
                        )
                    ),
                    salutation,
                    React.createElement('br', null),
                    firstname,
                    ' ',
                    lastname,
                    React.createElement('br', null),
                    street,
                    React.createElement('br', null),
                    zip,
                    ' ',
                    city,
                    React.createElement('br', null),
                    country,
                    React.createElement('br', null)
                ),
                React.createElement(
                    'div',
                    { className: 'date text-right' },
                    'Paderborn, den ',
                    currentDate
                ),
                React.createElement(
                    'h2',
                    null,
                    'Sammelbest\xE4tigung \xFCber Geldzuwendungen f\xFCr das Kalenderjahr ',
                    donationDate.getFullYear()
                ),
                React.createElement(
                    'p',
                    { className: 'text-small text-justify' },
                    'im Sinne des \xA7 10b des Einkommensteuergesetzes an eine der in \xA7 5 Abs. 1 Nr. 9 des K\xF6rperschaftsteuersesetzes bezeichneten K\xF6rperschaften, Personenvereinigungen oder Verm\xF6gensmassen.'
                ),
                React.createElement(
                    'table',
                    { className: 'table table-bordered table-condensed' },
                    React.createElement(
                        'thead',
                        null,
                        React.createElement(
                            'tr',
                            null,
                            React.createElement(
                                'th',
                                null,
                                'Betrag der Zuwendung - in Ziffern -'
                            ),
                            React.createElement(
                                'th',
                                null,
                                '- in Buchstaben -'
                            ),
                            React.createElement(
                                'th',
                                null,
                                'Datum der Zuwendung'
                            )
                        )
                    ),
                    React.createElement(
                        'tbody',
                        null,
                        React.createElement(
                            'tr',
                            null,
                            React.createElement(
                                'td',
                                null,
                                total.toFixed(2).replace('.', ','),
                                ' \u20AC'
                            ),
                            React.createElement(
                                'td',
                                null,
                                totalInWords,
                                ' Komma ',
                                totalDecInWords,
                                ' \u20AC'
                            ),
                            React.createElement(
                                'td',
                                null,
                                'siehe Anlage/R\xFCckseite'
                            )
                        )
                    )
                ),
                React.createElement(
                    'p',
                    null,
                    'Es handelt sich um den Verzicht auf die Erstattung von Aufwendungen Ja [ \xA0 ] Nein [ X ]'
                ),
                React.createElement('br', null),
                React.createElement(
                    'p',
                    { className: 'text-small text-justify' },
                    'Wir sind wegen F\xF6rderung gemeinn\xFCtziger Zwecke nach dem Freistellungsbescheid bzw. nach der Anlage zum K\xF6rperschaftsteuerbescheid des Finanz\xADamtes Paderborn, StNr. 339/5780/4167 vom 16.03.2015 f\xFCr den letzten Veranlagungszeitraum 2011 bis 2013 nach \xA7 5 Abs. 1 Nr. 9 des K\xF6rperschaft\xADsteuergesetzes von der K\xF6rperschaftsteuer und nach \xA7 3 Nr. 6 des Gewerbesteuergesetzes von der Gewerbesteuer befreit.'
                ),
                React.createElement(
                    'p',
                    { className: 'text-small text-justify' },
                    'Die Einhaltung der satzungsm\xE4\xDFigen Voraussetzungen nach den \xA7\xA7 51, 59, 60 und 61 AO wurde vom Finanzamt Paderborn, StNr. 339/5780/4167 mit Bescheid vom 16.03.2015 nach \xA7 60a AO gesondert festgestellt. Wir f\xF6rdern nach unserer Satzung gemeinn\xFCtzige Zwecke.'
                ),
                React.createElement(
                    'p',
                    { className: 'text-small text-justify' },
                    'Es wird best\xE4tigt, dass die Zuwendungen nur zur F\xF6rderung gemeinn\xFCtziger Zwecke verwendet werden. Es wird best\xE4tigt, dass es sich nicht um Mit\xADgliedsbeitr\xE4ge handelt, dessen Abzug nach \xA7 10b Abs. 1 des Einkommensteuergesetzes ausgeschlossen ist.'
                ),
                React.createElement(
                    'p',
                    { className: 'text-small text-justify' },
                    'Es wird best\xE4tigt, dass \xFCber die in der Gesamtsumme enthaltenen Zuwendungen keine weiteren Best\xE4tigungen, weder formelle Zuwendungsbest\xE4ti\xADgungen noch Beitragsquittungen oder \xE4hnliches, ausgestellt wurden und werden.'
                ),
                React.createElement(
                    'p',
                    { className: 'signature' },
                    'Christian Stoller, Buchhaltung'
                ),
                React.createElement(
                    'p',
                    { className: 'text-small text-justify' },
                    React.createElement(
                        'b',
                        null,
                        'Hinweis:'
                    ),
                    React.createElement('br', null),
                    'Wer vors\xE4tzlich oder grob fahrl\xE4ssig eine unrichtige Zuwendungsbest\xE4tigung erstellt oder veranlasst, dass Zuwendungen nicht zu den in der Zuwendungsbest\xE4tigung angegebenen steuerbeg\xFCnstigten Zwecken verwendet werden, haftet f\xFCr die entgangene Steuer (\xA7 10b Abs. 4 EStG, \xA7 9 Abs. 3 KStG, \xA7 9 Nr. 5 GewStG).'
                ),
                React.createElement(
                    'p',
                    { className: 'text-small text-justify' },
                    'Diese Best\xE4tigung wird nicht als Nachweis f\xFCr die steuerliche Ber\xFCcksichtigung der Zuwendung anerkannt, wenn das Datum des Freistellungsbescheides l\xE4nger als 5 Jahre bzw. das Datum der Feststellung der Einhaltung der satzungsm\xE4\xDFigen Voraussetzungen nach \xA7 60a Abs. 1 AO l\xE4nger als 3 Jahre seit Ausstellung des Bescheides zur\xFCckliegt (\xA7 63 Abs. 5 AO).'
                ),
                React.createElement(
                    'table',
                    { className: 'footer' },
                    React.createElement(
                        'tbody',
                        null,
                        React.createElement(
                            'tr',
                            null,
                            React.createElement(
                                'td',
                                { className: 'text-small' },
                                'Evangeliums-Christengemeinde e.V.',
                                React.createElement('br', null),
                                'Karl-Schurz-Stra\xDFe 28',
                                React.createElement('br', null),
                                '33100 Paderborn'
                            ),
                            React.createElement(
                                'td',
                                { className: 'text-small' },
                                'Tel.: 05251 - 59134',
                                React.createElement('br', null),
                                'E-Mail: info@ecg-paderborn.de',
                                React.createElement('br', null),
                                'www.ecg-paderborn.de'
                            ),
                            React.createElement(
                                'td',
                                { className: 'text-small' },
                                'IBAN: DE12 4765 0130 0028 0013 03',
                                React.createElement('br', null),
                                'BIC: WELADE3LXXX',
                                React.createElement('br', null),
                                'Sparkasse Paderborn-Detmold'
                            )
                        )
                    )
                )
            ),
            React.createElement(
                'div',
                { className: 'attachment' },
                React.createElement(
                    'h2',
                    null,
                    'Anlage zur Sammelbest\xE4tigung'
                ),
                React.createElement(
                    'p',
                    null,
                    'vom ',
                    currentDate,
                    ' der Evangeliums-Christengemeinde e.V. f\xFCr den Zuwendenden ',
                    firstname,
                    ' ',
                    lastname,
                    ', ',
                    street,
                    ', ',
                    zip,
                    ' ',
                    city
                ),
                React.createElement(
                    'table',
                    { className: 'donations table table-bordered table-condensed' },
                    React.createElement(
                        'thead',
                        null,
                        React.createElement(
                            'tr',
                            null,
                            React.createElement(
                                'th',
                                null,
                                'Datum der',
                                React.createElement('br', null),
                                'Zuwendung'
                            ),
                            React.createElement(
                                'th',
                                null,
                                'Art der Zuwendung'
                            ),
                            React.createElement(
                                'th',
                                null,
                                'Verzicht auf',
                                React.createElement('br', null),
                                'Erstattung'
                            ),
                            React.createElement(
                                'th',
                                null,
                                'Verwendungszweck'
                            ),
                            React.createElement(
                                'th',
                                { className: 'text-right' },
                                'Betrag'
                            )
                        )
                    ),
                    React.createElement(
                        'tbody',
                        null,
                        this.props.donationRows.map(function (row, index) {
                            var amount = parseLocaleNumber(row['BETRAG']);
                            return React.createElement(
                                'tr',
                                { key: index },
                                React.createElement(
                                    'td',
                                    null,
                                    parseDate(row['DATUM']).toLocaleDateString('de-DE', {
                                        year: 'numeric',
                                        month: '2-digit',
                                        day: '2-digit'
                                    })
                                ),
                                React.createElement(
                                    'td',
                                    null,
                                    'Geldzuwendung'
                                ),
                                React.createElement(
                                    'td',
                                    null,
                                    'nein'
                                ),
                                React.createElement(
                                    'td',
                                    null,
                                    row['BEMERKUNG']
                                ),
                                React.createElement(
                                    'td',
                                    { className: 'text-right' },
                                    amount.toFixed(2).replace('.', ','),
                                    ' \u20AC'
                                )
                            );
                        }),
                        React.createElement(
                            'tr',
                            null,
                            React.createElement(
                                'td',
                                { colSpan: '4' },
                                React.createElement(
                                    'strong',
                                    null,
                                    'Gesamtsumme'
                                )
                            ),
                            React.createElement(
                                'td',
                                { className: 'text-right' },
                                React.createElement(
                                    'strong',
                                    null,
                                    total.toFixed(2).replace('.', ','),
                                    ' \u20AC'
                                )
                            )
                        )
                    )
                )
            )
        );
    }
});

var App = React.createClass({
    getInitialState: function () {
        return {
            file: null,
            csvRows: [],
            openButton: React.createElement(OpenButton, { onFileOpened: this.onFileOpened }),
            generateDonationReceiptsButton: React.createElement(GenerateDonationReceiptsButton, {
                onClick: this.onPrintPreviewClicked,
                activeStateSetter: this.setActiveStateSetter
            }),
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

    onFileOpened: function (file) {
        var $this = this;

        var reader = new FileReader();
        reader.onload = function (e) {
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

    onPrintPreviewClicked: function () {
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
            donationReceipts.push(React.createElement(DonationReceipt, { key: donatorId, donationRows: donationRows }));
        }

        this.setState({ donationReceipts: donationReceipts });
    },

    render: function () {
        if (this.state.donationReceipts.length > 0) {
            return React.createElement(
                'div',
                null,
                this.state.donationReceipts
            );
        }

        if (this.state.file) {
            return React.createElement(
                'div',
                null,
                React.createElement(CsvTable, { csvRows: this.state.csvRows })
            );
        }

        return React.createElement('div', null);
    }
});

//var openButton = <OpenButton />;
//console.log(openButton);
//
//ReactDOM.render(<OpenButton />, document.querySelector('#open-button'));

var renderedApp = ReactDOM.render(React.createElement(App, null), document.querySelector('#donation-list'));

ReactDOM.render(renderedApp.getOpenButton(), document.querySelector('#open-button'));
ReactDOM.render(renderedApp.getGenerateDonationReceiptsButton(), document.querySelector('#generate-donation-receipts-button'));