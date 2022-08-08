const javaScriptToMysqlDate = () => {
    const pad = function(num) { return ('00'+num).slice(-2) };
    const date = new Date();
    const mySqlDate = date.getUTCFullYear() + '-' +
        pad(date.getUTCMonth() + 1) + '-' +
        pad(date.getUTCDate()) + ' ' +
        pad(date.getUTCHours()) + ':' +
        pad(date.getUTCMinutes()) + ':' +
        pad(date.getUTCSeconds());
    return mySqlDate;
}

module.exports={
    javaScriptToMysqlDate,
}