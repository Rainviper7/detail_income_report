//----------import
const _ = require('lodash'),
    pdf = require('pdfkit'),
    fs = require('fs'),
    moment = require('moment'),
    path = require('path'),
    C = require('./libs/constant')
    ;

//---------constant
var TEXT_SPACE_LOWER = 5,
    TEXT_SPACE = C.FONT.SIZE.NORMAL + TEXT_SPACE_LOWER,
    ROW_CURRENT = C.ROW.DEFAULT,
    hilight = false,
    row_hilight = 0,
    line_tick = 0.4, //default 0.8
    report_type = "รายงานบิลการขาย",
    header_table = ["No.", "OderId", "Date", "Table", "Type", "Shift", "Cashier", "GranTotal", "ServiceCharge", "Item    Discount", "Discount", "Vat"]
header_table_pointer = ["INDEX", "ORDERID", "DATE", "REFER", "TYPE", "SHIFT", "CASHIER", "GRANDTOTAL", "SERVICE", "ITEMDISCOUNT", "DISCOUNT", "VAT"]
    ;

//--style
var TEXT_padding = {
    left: 5,
    right: -5
},
    STYLE_remark = {
        italic: true,
        align: 'left'
    }
    ;

//----------main---
function Report(pathPdf, data, shopname) {
    var _path = pathPdf;
    var _data = data;

    var filename = _path;
    var data = _data;

    var dailyReport = new pdf;

    var now = new Date()
    var datetime = moment(now).format("DD MMMM YYYY, HH:mm:ss");

    //----set font
    var fontpath = path.join(__dirname, 'fonts', 'ARIALUNI.ttf'),
        fontpath_bold = path.join(__dirname, 'fonts', 'arialbd.ttf'),
        fontpath_bold_bath = path.join(__dirname, 'fonts', 'cambriab.ttf')
    fontpath_italic = path.join(__dirname, 'fonts', 'ariali.ttf')
        ;

    dailyReport.registerFont('font_style_normal', fontpath, '')
    dailyReport.registerFont('font_style_bold', fontpath_bold, '')
    dailyReport.registerFont('font_style_italic', fontpath_italic, '')

    dailyReport.font('font_style_bold')//--font_style
    dailyReport.font('font_style_normal')


    return {
        buildPdf: buildPdf
    }
    function buildPdf() {

        console.log("ExpensesReport module");
        console.log("- Start...");
        main();
        console.log("- Genearate Complete : " + filename);
    }

    //------------function
    function main() {


        dailyReport.pipe(fs.createWriteStream(filename));
        dailyReport.font('font_style_normal')
        drawHeader();
        drawBody();
        drawFooter();
        dailyReport.end();

    }
    function drawHeader() {

        dailyReport.fontSize(C.FONT.SIZE.HEADER)
            .text(shopname, C.TAB.TABLE
                .INDEX, ROW_CURRENT, {
                width: C.TAB.TABLE
                    .QUANTITY - C.TAB.TABLE
                    .INDEX,
                align: 'left'
            });
        NewLine(C.FONT.SIZE.HEADER + TEXT_SPACE_LOWER);

        dailyReport.fontSize(C.FONT.SIZE.HEADER)
            .text(report_type, C.TAB.TABLE
                .INDEX, ROW_CURRENT, {
                width: C.TAB.TABLE
                    .LAST - C.TAB.TABLE
                    .INDEX,
                align: 'left'
            });

        NewLine(C.FONT.SIZE.HEADER + TEXT_SPACE);

        dailyReport.fontSize(C.FONT.SIZE.NORMAL).fillColor('#333333')
            .text("Generated at : " + datetime
            , C.TAB.TABLE.INDEX, ROW_CURRENT, {
                width: C.TAB.TABLE.QUANTITY - C.TAB.TABLE.INDEX,
                align: 'left'
            });

        dailyReport.fillColor('black');

        NewLine(TEXT_SPACE);

    }

    function drawBody() {
        console.log("- building detail income report ");

        NewLine(TEXT_SPACE);

        addTableLine(C.TAB.TABLE
            .INDEX, ROW_CURRENT, C.TAB.TABLE
                .LAST, ROW_CURRENT); //row line


        //--column title
        _.forEach(header_table_pointer, function (text, index) {

            dailyReport.font('font_style_bold').fontSize(C.FONT.SIZE.NORMAL)
                .text(header_table[index], C.TAB.TABLE[text] + TEXT_padding.left, ROW_CURRENT, {
                    width:C.TAB.TABLE[header_table_pointer[index+1]]-C.TAB.TABLE[header_table_pointer[index]]+TEXT_padding.right,
                    align: 'left'
                })//--fixcode

        })

        dailyReport.font('font_style_normal')


        _.forEach(C.TAB.TABLE
            , function (value, key) {
                addColumnLine(value);
            })

        NewLine(TEXT_SPACE)
        
        _.forEach(C.TAB.TABLE
            , function (value, key) {
                addColumnLine(value);
            })

        NewLine(TEXT_SPACE)

        addTableLine(C.TAB.TABLE
            .INDEX, ROW_CURRENT, C.TAB.TABLE
                .LAST, ROW_CURRENT); //row line

        //---detail data

        _.forEach(data, function (detail, index) {
            _.forEach(detail.Orders, function (record1, index1) {

                addItem(record1, index1)

                _.forEach(C.TAB.TABLE
                    , function (value, key) {
                        addColumnLine(value);
                    })
        
                addTableLine(C.TAB.TABLE
                    .INDEX, ROW_CURRENT, C.TAB.TABLE
                        .LAST, ROW_CURRENT); //row line
                NewLine(TEXT_SPACE)

            })

        })

        addTableLine(C.TAB.TABLE
            .INDEX, ROW_CURRENT, C.TAB.TABLE
                .LAST, ROW_CURRENT); //row line
        NewLine(TEXT_SPACE)


    }

    function drawFooter() {

        //--footer

        addTableLine(C.TAB.TABLE
            .INDEX, ROW_CURRENT, C.TAB.TABLE
                .LAST, ROW_CURRENT); //row line

        dailyReport.fontSize(C.FONT.SIZE.NORMAL).fillColor('#333333')
            .text("Generated at : " + datetime
            , C.TAB.TABLE.INDEX, ROW_CURRENT, {
                width: C.TAB.TABLE.QUANTITY - C.TAB.TABLE.INDEX,
                align: 'left'
            });

        dailyReport.fillColor('black');

        NewLine(TEXT_SPACE);

    }

    function addItem(record, index) {


        var t1 = "#" + record.OrderId,
            gtt1 = numberWithCommas2(record.GrandTotal),
            record_optins = {
                align: 'left'
            };

        dailyReport.fontSize(C.FONT.SIZE.NORMAL)
            .text(record.Id, C.TAB.TABLE.INDEX + TEXT_padding.left, ROW_CURRENT, {
                widht: C.TAB.TABLE.ORDERID - C.TAB.TABLE.INDEX,
                align: 'left'
            })
            .text(t1, C.TAB.TABLE.ORDERID + TEXT_padding.left, ROW_CURRENT, record_optins)
            .text(moment(record.OrderDate).format("HH:mm:ss DD-MM"), C.TAB.TABLE.DATE + TEXT_padding.left, ROW_CURRENT, {
                align: 'left'
            })
            .text(record.Table, C.TAB.TABLE.REFER + TEXT_padding.left, ROW_CURRENT, record_optins)
            .text(record.PaymentType, C.TAB.TABLE.TYPE + TEXT_padding.left, ROW_CURRENT, record_optins)
            .text(record.ShiftWork, C.TAB.TABLE.SHIFT + TEXT_padding.left, ROW_CURRENT, record_optins)
            .text(record.User, C.TAB.TABLE.CASHIER + TEXT_padding.left, ROW_CURRENT, record_optins)
            .text("฿ " + gtt1, C.TAB.TABLE.GRANDTOTAL + TEXT_padding.right, ROW_CURRENT, {
                width: C.TAB.TABLE.SERVICE - C.TAB.TABLE.GRANDTOTAL,
                align: 'right'
            })
            .text(record.ServiceCharge, C.TAB.TABLE.SERVICE + TEXT_padding.left, ROW_CURRENT, {
                width: C.TAB.TABLE.ITEMDISCOUNT - C.TAB.TABLE.SERVICE,
                align: 'left'
            })
            .text(record.ItemDiscount, C.TAB.TABLE.ITEMDISCOUNT + TEXT_padding.left, ROW_CURRENT, {
                width: C.TAB.TABLE.DISCOUNT - C.TAB.TABLE.ITEMDISCOUNT,
                align: 'left'
            })
            .text(record.Discount, C.TAB.TABLE.DISCOUNT + TEXT_padding.left, ROW_CURRENT, {
                width: C.TAB.TABLE.VAT - C.TAB.TABLE.DISCOUNT,
                align: 'left'
            })
            .text(record.Vat, C.TAB.TABLE.VAT + TEXT_padding.left, ROW_CURRENT, {
                width: C.TAB.TABLE.LAST - C.TAB.TABLE.VAT,
                align: 'left'
            })
            ;




    }

function checkPositionOutsideArea() {

    if (ROW_CURRENT > C.PAGE_TYPE.HEIGHT) {

        dailyReport.addPage();
        ROW_CURRENT = C.ROW.DEFAULT;

        if (hilight == true) {

            row_hilight = ROW_DEFAULT;

        }

    }

}

function addTableLine(sx, sy, ex, ey) {
    dailyReport.moveTo(sx, sy).lineTo(ex, ey).lineWidth(line_tick).strokeColor('gray').stroke();
}

function addDashLine(sx, sy, ex, ey) {
    dailyReport.moveTo(sx, sy).lineTo(ex, ey).lineWidth(line_tick).dash(5, { space: 5 }).strokeColor('gray').strokeOpacity(0.2).stroke().undash();
    dailyReport.strokeColor('black').strokeOpacity(1).lineWidth(1)
}

function NewLine(px) {
    ROW_CURRENT += px;
    checkPositionOutsideArea()
}

function addColumnLine(tab) {
    addTableLine(tab, ROW_CURRENT, tab, ROW_CURRENT + TEXT_SPACE);
}

function NewPage() {
    dailyReport.addPage(C.PAGE_TYPE.MAGIN);
    ROW_CURRENT = ROW_DEFAULT;
}

function addHilight(position, row_height) {

    dailyReport.rect(C.TAB.TABLE
        .INDEX, position, (C.TAB.TABLE
            .LAST - C.TAB.TABLE
                .INDEX), row_height).fill('#ddd');

    dailyReport.fill('black');
}

function addHilightTopping(position, row_height) {

    dailyReport.rect(C.TAB.TABLE
        .INDEX, position, (C.TAB.TABLE.LAST - C.TAB.TABLE.INDEX), row_height).fill('#ddd');

    dailyReport.fill('black');
}


function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

//--fixcode
function numberWithCommas2(x) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

}
module.exports = Report;