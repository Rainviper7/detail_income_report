//----------import
const _ = require('lodash'),
    pdf = require('pdfkit'),
    fs = require('fs'),
    moment = require('moment'),
    path = require('path'),
    C = require('./libs/constant')
    ;

//---------constant
//---[610,790]
var TEXT_SPACE_LOWER = 5,
    TEXT_SPACE_UPPER = 1,
    TEXT_SPACE = C.FONT.SIZE.NORMAL + TEXT_SPACE_LOWER,
    TEXT_SPACE_SMALL = C.FONT.SIZE.SMALL,
    ROW_CURRENT = C.ROW.DEFAULT,
    hilight = false,
    row_hilight = 0,
    line_tick = 0.4, //default 0.8
    report_type = "รายงานบิลการขาย",
    header_table = ["No.", "OderId", "Date", "Table", "Type", "Shift", "Cashier", "GranTotal", "ServiceCharge", "Item    Discount", "Discount", "Vat"],
    header_table_pointer = ["INDEX", "ORDERID", "DATE", "REFER", "TYPE", "SHIFT", "CASHIER", "GRANDTOTAL", "SERVICE", "ITEMDISCOUNT", "DISCOUNT", "VAT"]//--fixcode
    ;

//--style
var TEXT_padding = {
    left: 5,
    right: -5
},
    SET_PAGE_LANDSCAPE = {
        layout: "landscape",
        autoFirstPage: false
    },//--fixcode
    SET_HEADER_WIDTH =
        {
            width: 500,
            align: 'left'
        }//--fixcode
    ;

//----------main---
function Report(pathPdf, data, shopname) {
    var _path = pathPdf,
        _data = data,
        filename = _path,
        data = _data
        ;

    var dailyReport = new pdf;

    dailyReport.addPage(SET_PAGE_LANDSCAPE)

    var now = new Date(),
        datetime = moment(now).format("DD MMMM YYYY, HH:mm:ss")
        ;

    //----set font
    var fontpath = path.join(__dirname, 'fonts', 'ARIALUNI.ttf'),
        fontpath_bold = path.join(__dirname, 'fonts', 'arialbd.ttf'),
        fontpath_bold_bath = path.join(__dirname, 'fonts', 'cambriab.ttf'),
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
            .text(shopname, C.TAB.TABLE_LANDSCAPE.INDEX, ROW_CURRENT, SET_HEADER_WIDTH);

        NewLine(C.FONT.SIZE.HEADER + TEXT_SPACE_LOWER);

        dailyReport.fontSize(C.FONT.SIZE.HEADER)
            .text(report_type, C.TAB.TABLE_LANDSCAPE.INDEX, ROW_CURRENT, SET_HEADER_WIDTH);

        NewLine(C.FONT.SIZE.HEADER + TEXT_SPACE);

        dailyReport.fontSize(C.FONT.SIZE.NORMAL).fillColor('#333333')
            .text("Generated at : " + datetime
            , C.TAB.TABLE_LANDSCAPE.INDEX, ROW_CURRENT, SET_HEADER_WIDTH);

        dailyReport.fillColor('black');

        NewLine(TEXT_SPACE);

    }

    function drawBody() {
        console.log("- building detail income report ");

        NewLine(TEXT_SPACE);

        addTableLine(C.TAB.TABLE_LANDSCAPE
            .INDEX, ROW_CURRENT, C.TAB.TABLE_LANDSCAPE
                .LAST, ROW_CURRENT); //row line


        //--column title
        _.forEach(header_table_pointer, function (text, index) {

            dailyReport.font('font_style_bold').fontSize(C.FONT.SIZE.NORMAL)
                .text(header_table[index], C.TAB.TABLE_LANDSCAPE[text] + TEXT_padding.left, ROW_CURRENT + 2, {
                    width: C.TAB.TABLE_LANDSCAPE[header_table_pointer[index + 1]]
                    - C.TAB.TABLE_LANDSCAPE[header_table_pointer[index]] + TEXT_padding.right,
                    align: 'left'
                })//--fix code

        })

        dailyReport.font('font_style_normal')


        _.forEach(C.TAB.TABLE_LANDSCAPE
            , function (value, key) {
                addColumnLine(value);
            })

        NewLine(TEXT_SPACE)

        _.forEach(C.TAB.TABLE_LANDSCAPE
            , function (value, key) {
                addColumnLine(value);
            })

        NewLine(TEXT_SPACE)

        addTableLine(C.TAB.TABLE_LANDSCAPE
            .INDEX, ROW_CURRENT, C.TAB.TABLE_LANDSCAPE
                .LAST, ROW_CURRENT); //row line

        //---detail data

        _.forEach(data, function (detail, index) {
            _.forEach(detail.Orders, function (record1, index1) {

                if (((index1 + 1) % 2) == 1) {

                    hilight = true
                }

                if (hilight) {
                    addHilight(ROW_CURRENT, TEXT_SPACE);

                    addTableLine(C.TAB.TABLE_LANDSCAPE
                        .INDEX, ROW_CURRENT, C.TAB.TABLE_LANDSCAPE
                            .LAST, ROW_CURRENT); //row line
                }


                addItem(record1, index1)


                _.forEach(C.TAB.TABLE_LANDSCAPE
                    , function (value, key) {
                        addColumnLine(value);
                    })

                NewLine(TEXT_SPACE)

                if (record1.Note) {


                    if (hilight) {
                        addHilight(ROW_CURRENT, TEXT_SPACE_SMALL * lineCount(record1.Note));
                    }

                    dailyReport.font('font_style_italic').fontSize(C.FONT.SIZE.SMALL).fillColor('#333333')
                        .text("Remark: " + record1.Note, C.TAB.TABLE_LANDSCAPE.GRANDTOTAL + TEXT_padding.left, ROW_CURRENT + TEXT_SPACE_UPPER, {
                            width: C.TAB.TABLE_LANDSCAPE.SERVICE - C.TAB.TABLE_LANDSCAPE.GRANDTOTAL,
                            align: 'left'
                        })

                    dailyReport.font('font_style_normal').fillColor('black');

                    //--dynamic remark newline
                    for (var i = 0; i < lineCount(record1.Note); i++) {
                        _.forEach(C.TAB.TABLE_LANDSCAPE
                            , function (value, key) {
                                addColumnLine(value);
                            })

                        NewLine(TEXT_SPACE_SMALL)
                    }


                    addTableLine(C.TAB.TABLE_LANDSCAPE
                        .INDEX, ROW_CURRENT, C.TAB.TABLE_LANDSCAPE
                            .LAST, ROW_CURRENT); //row line
                }
                else {

                    addTableLine(C.TAB.TABLE_LANDSCAPE
                        .INDEX, ROW_CURRENT, C.TAB.TABLE_LANDSCAPE
                            .LAST, ROW_CURRENT); //row line

                }

                hilight = false

            })

        })

        addTableLine(C.TAB.TABLE_LANDSCAPE
            .INDEX, ROW_CURRENT, C.TAB.TABLE_LANDSCAPE
                .LAST, ROW_CURRENT); //row line
        NewLine(TEXT_SPACE)


    }

    function drawFooter() {

        //--footer

        addTableLine(C.TAB.TABLE_LANDSCAPE
            .INDEX, ROW_CURRENT, C.TAB.TABLE_LANDSCAPE
                .LAST, ROW_CURRENT); //row line

        dailyReport.fontSize(C.FONT.SIZE.NORMAL).fillColor('#333333')
            .text("Generated at : " + datetime
            , C.TAB.TABLE_LANDSCAPE.INDEX, ROW_CURRENT, {
                width: C.TAB.TABLE_LANDSCAPE.QUANTITY - C.TAB.TABLE_LANDSCAPE.INDEX,
                align: 'left'
            });

        dailyReport.fillColor('black');

        NewLine(TEXT_SPACE);

    }

    function lineCount(str) {
        var remark_lenght = str.length * C.FONT.SIZE.SMALL
        var grandtotal_width = C.TAB.TABLE_LANDSCAPE.SERVICE - C.TAB.TABLE_LANDSCAPE.GRANDTOTAL
        var line_count = remark_lenght / grandtotal_width
        return Number(line_count.toFixed(0))
    }

    function addItem(record, index) {


        var t1 = "#" + record.OrderId,
            gtt1 = numberWithCommas2(record.GrandTotal.toFixed(2)),
            record_options = {
                width: C.TAB.TABLE_LANDSCAPE[header_table_pointer[index + 1]]
                - C.TAB.TABLE_LANDSCAPE[header_table_pointer[index]],
                align: 'left'
            };

        dailyReport.fontSize(C.FONT.SIZE.NORMAL)
            .text(record.Id, C.TAB.TABLE_LANDSCAPE.INDEX + TEXT_padding.left, ROW_CURRENT + TEXT_SPACE_UPPER, record_options)
            .text(t1, C.TAB.TABLE_LANDSCAPE.ORDERID + TEXT_padding.left, ROW_CURRENT + TEXT_SPACE_UPPER, record_options)
            .text(moment(record.OrderDate).format("HH:mm:ss DD-MM"), C.TAB.TABLE_LANDSCAPE.DATE + TEXT_padding.left, ROW_CURRENT + TEXT_SPACE_UPPER, {
                width: C.TAB.TABLE_LANDSCAPE.REFER - C.TAB.TABLE_LANDSCAPE.DATE,
                align: 'left'
            })
            .text(record.Table, C.TAB.TABLE_LANDSCAPE.REFER + TEXT_padding.left, ROW_CURRENT + TEXT_SPACE_UPPER, record_options)
            .text(record.PaymentType, C.TAB.TABLE_LANDSCAPE.TYPE + TEXT_padding.left, ROW_CURRENT + TEXT_SPACE_UPPER, record_options)
            .text(record.ShiftWork, C.TAB.TABLE_LANDSCAPE.SHIFT + TEXT_padding.left, ROW_CURRENT + TEXT_SPACE_UPPER, record_options)
            .text(record.User, C.TAB.TABLE_LANDSCAPE.CASHIER + TEXT_padding.left, ROW_CURRENT + TEXT_SPACE_UPPER, record_options)
            .text("฿ " + gtt1, C.TAB.TABLE_LANDSCAPE.GRANDTOTAL + TEXT_padding.right, ROW_CURRENT + TEXT_SPACE_UPPER, {
                width: C.TAB.TABLE_LANDSCAPE.SERVICE - C.TAB.TABLE_LANDSCAPE.GRANDTOTAL,
                align: 'right'
            })
            .text(record.ServiceCharge, C.TAB.TABLE_LANDSCAPE.SERVICE + TEXT_padding.left, ROW_CURRENT + TEXT_SPACE_UPPER, record_options)
            .text(record.ItemDiscount.toFixed(2), C.TAB.TABLE_LANDSCAPE.ITEMDISCOUNT + TEXT_padding.left, ROW_CURRENT + TEXT_SPACE_UPPER, record_options)
            .text(record.Discount.toFixed(2), C.TAB.TABLE_LANDSCAPE.DISCOUNT + TEXT_padding.left, ROW_CURRENT + TEXT_SPACE_UPPER, record_options)
            .text(record.Vat, C.TAB.TABLE_LANDSCAPE.VAT + TEXT_padding.left, ROW_CURRENT + TEXT_SPACE_UPPER, record_options)
            ;
    }

    function addRemark(record, index) {
        dailyReport.font('font_style_italic').fontSize(C.FONT.SIZE.SMALL).fillColor('#333333')
            .text(record.Note, C.TAB.TABLE_LANDSCAPE.GRANDTOTAL + TEXT_padding.right, ROW_CURRENT + TEXT_SPACE_UPPER, {
                width: C.TAB.TABLE_LANDSCAPE.SERVICE - C.TAB.TABLE_LANDSCAPE.GRANDTOTAL,
                align: 'left'
            })

        dailyReport.font('font_style_normal').fillColor('black');
    }

    function checkPositionOutsideArea() {

        if (ROW_CURRENT > C.PAGE_TYPE.HEIGHT) {

            dailyReport.addPage(SET_PAGE_LANDSCAPE);
            ROW_CURRENT = C.ROW.DEFAULT;

            if (hilight == true) {

                row_hilight = C.ROW.DEFAULT;

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

    function addHilight(position, row_height) {

        dailyReport.rect(C.TAB.TABLE_LANDSCAPE
            .INDEX, position, (C.TAB.TABLE_LANDSCAPE.LAST - C.TAB.TABLE_LANDSCAPE.INDEX), row_height).fill('#ddd');

        dailyReport.fill('black');
    }

    function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    //--fix code
    function numberWithCommas2(x) {
        var parts = x.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
    }

}
module.exports = Report;