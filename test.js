//-------------------
var data = require('./libs/detail_income'),
    generatePdf = require('./index'),
    moment = require('moment')
    ;

//---------------------------------------
var ShopName = "Niceloop Test Lab",
    datetime = moment(now).format("DDMM_HHmmssSSS"),
    now = new Date()
    ;

//----------------
var filename = './output/detail_report_' + ShopName + '_' +datetime + '.pdf';

//------------------------------------
var aa = new generatePdf(filename, data, ShopName);

aa.buildPdf();