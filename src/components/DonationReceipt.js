import React from 'react';
import T2W from 'numbers2words';
import PropTypes from 'prop-types';
import './DonationReceipt.css';
import logoImg from '../img/logo.png';
import signatureImg from '../img/signature.png';
import { parseGermanDate } from './DateParser.js';
import { parseLocaleNumber } from './NumberParser.js';

class DonationReceipt extends React.Component {
    calculateTotal() {
        var total = 0.0;
        for (var i = 0; i < this.props.donationRows.length; i++) {
            total += parseLocaleNumber(this.props.donationRows[i]['BETRAG'].toString());
        }
        return total;
    }

    guessNumberOfAttachmentPages() {
        var numberOfPages = 1;

        // about 31 rows fit on the first page
        var numberOfRows = this.props.donationRows.length - 31;

        if (numberOfRows > 0) {
            // about 33 rows fit on the other pages
            numberOfPages += Math.ceil(numberOfRows / 33);
        }

        return numberOfPages;
    }

    generateAttachmentPagePlaceholder() {
        var placeholderElements = [];
        for (var i = this.guessNumberOfAttachmentPages(); i > 0; i--) {
            placeholderElements.push(<div key={i} className="attachment-page-placeholder">&nbsp;</div>);
        }
        return placeholderElements;
    }

    render() {
        var currentDate  = (new Date()).toLocaleDateString('de-DE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });

        var firstRow     = this.props.donationRows[0];
        var donationDate = parseGermanDate(firstRow['DATUM']);
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
            default: break;
        }

        return (
            <div className="donation-receipt">
                <div className="first-page">
                    <div className="text-right">
                        <img className="logo" src={logoImg} alt="logo" />
                    </div>
                    <comment c="this is needed in print view to get the correct margin of address"/>
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
                    <table className="table table-bordered table-sm">
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
                        Wir sind wegen Förderung gemeinnütziger Zwecke nach dem Freistellungsbescheid bzw.
                        nach der Anlage zum Körperschaftsteuerbescheid des Finanz&shy;amtes Paderborn,
                        StNr. 339/5780/4167 vom 27.06.2017 für den letzten Veranlagungszeitraum 2014 bis 2016
                        nach § 5 Abs. 1 Nr. 9 des Körperschaft&shy;steuergesetzes von der Körperschaftsteuer
                        und nach § 3 Nr. 6 des Gewerbesteuergesetzes von der Gewerbesteuer befreit.
                    </p>
                    <p className="text-small text-justify">
                        Die Einhaltung der satzungsmäßigen Voraussetzungen nach den §§ 51, 59, 60 und 61 AO
                        wurde vom Finanzamt Paderborn, StNr. 339/5780/4167 mit Bescheid vom 27.06.2017 nach
                        § 60a AO gesondert festgestellt. Wir fördern nach unserer Satzung gemeinnützige Zwecke.
                    </p>
                    <p className="text-small text-justify">
                        Es wird bestätigt, dass die Zuwendungen nur zur Förderung gemeinnütziger Zwecke
                        verwendet werden. Es wird bestätigt, dass es sich nicht um Mit&shy;gliedsbeiträge
                        handelt, dessen Abzug nach § 10b Abs. 1 des Einkommensteuergesetzes ausgeschlossen ist.
                    </p>
                    <p className="text-small text-justify">
                        Es wird bestätigt, dass über die in der Gesamtsumme enthaltenen Zuwendungen keine
                        weiteren Bestätigungen, weder formelle Zu&shy;wen&shy;dungsbestäti&shy;gungen noch
                        Beitragsquittungen oder ähnliches, ausgestellt wurden und werden.
                    </p>
                    <p className="signature">
                        <img src={signatureImg} alt="signature" />
                        Christian Stoller, Buchhaltung
                    </p>
                    <p className="text-small text-justify">
                        <b>Hinweis:</b><br/>
                        Wer vorsätzlich oder grob fahrlässig eine unrichtige Zuwendungsbestätigung erstellt
                        oder veranlasst, dass Zuwendungen nicht zu den in der Zuwendungsbestätigung angegebenen
                        steuerbegünstigten Zwecken verwendet werden, haftet für die entgangene Steuer
                        (§ 10b Abs. 4 EStG, § 9 Abs. 3 KStG, § 9 Nr. 5 GewStG).
                    </p>
                    <p className="text-small text-justify">
                        Diese Bestätigung wird nicht als Nachweis für die steuerliche Berücksichtigung der
                        Zuwendung anerkannt, wenn das Datum des Freistellungsbescheides länger als 5 Jahre
                        bzw. das Datum der Feststellung der Einhaltung der satzungsmäßigen Voraussetzungen
                        nach § 60a Abs. 1 AO länger als 3 Jahre seit Ausstellung des Bescheides zurückliegt
                        (§ 63 Abs. 5 AO).
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
                    <table className="donations table table-bordered table-sm">
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
                                var amount = parseLocaleNumber(row['BETRAG'].toString());
                                return (
                                    <tr key={index}>
                                        <td>
                                            {
                                                parseGermanDate(row['DATUM']).toLocaleDateString('de-DE', {
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
            </div>
        );
    }
}

DonationReceipt.propTypes = {
    donationRows: PropTypes.array.isRequired
};

export default DonationReceipt;