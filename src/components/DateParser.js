export function parseGermanDate(dateString) {
    var splitted = dateString.split('.');
    return new Date(splitted[2] + '-' + splitted[1] + '-' + splitted[0]);
}
