export function parseLocaleNumber(stringNumber) {
    var thousandSeparator = (1111).toLocaleString().replace(/1/g, '');
    var decimalSeparator = (1.1).toLocaleString().replace(/1/g, '');

    return parseFloat(stringNumber
        .replace(new RegExp('\\' + thousandSeparator, 'g'), '')
        .replace(new RegExp('\\' + decimalSeparator), '.')
    );
}