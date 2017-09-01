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
    header_table = ["No.", "OderId", "Date", "Table", "Type", "Shift", "Cashier", "GrandTotal", "ServiceCh","ItemDisc","Discount","Vat"]
header_table_pointer = ["INDEX", "ORDERID", "DATE", "REFER", "TYPE", "SHIFT", "CASHIER", "GRANDTOTAL", "SERVICE","ITEMDISCOUNT","DISCOUNT","VAT"]
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
        //--Menu

        console.log("- building detail income report ");

        //-----Expenses

        NewLine(TEXT_SPACE);

        addTableLine(C.TAB.TABLE
            .INDEX, ROW_CURRENT, C.TAB.TABLE
                .LAST, ROW_CURRENT); //row line
        
                // NewLine(TEXT_SPACE_LOWER);

        _.forEach(header_table_pointer, function (text, index) {
            dailyReport.font('font_style_bold')//--font_style
            dailyReport.fontSize(C.FONT.SIZE.NORMAL)
                .text(header_table[index], C.TAB.TABLE[text] + TEXT_padding.left, ROW_CURRENT, {
                    align: 'left'
                })//--fixcode
        })
        dailyReport.font('font_style_normal')

        _.forEach(C.TAB.TABLE
            , function (value, key) {
                addColumnLine(value);
            })

        NewLine(TEXT_SPACE)

        addTableLine(C.TAB.TABLE
            .INDEX, ROW_CURRENT, C.TAB.TABLE
                .LAST, ROW_CURRENT); //row line


        // NewLine(TEXT_SPACE)

        //---detail data
        _.forEach(data, function (detail, index) {

            _.forEach(detail.Orders, function (record, index) {

                var t1 = "#" + record.OrderId
                var gtt1 = numberWithCommas2(record.GrandTotal)

                dailyReport.fontSize(C.FONT.SIZE.NORMAL)
                    .text(record.Id, C.TAB.TABLE.INDEX + TEXT_padding.left, ROW_CURRENT, {
                        widht: C.TAB.TABLE.ORDERID - C.TAB.TABLE.INDEX,
                        align: 'left'
                    })

                dailyReport.fontSize(C.FONT.SIZE.NORMAL)
                    .text(t1, C.TAB.TABLE.ORDERID + TEXT_padding.left, ROW_CURRENT, {
                        align: 'left'
                    })

                dailyReport.fontSize(C.FONT.SIZE.NORMAL)
                    .text(moment(record.OrderDate).format("HH:mm:ss DD-MM"), C.TAB.TABLE.DATE + TEXT_padding.left, ROW_CURRENT, {
                        align: 'left'
                    })
                dailyReport.fontSize(C.FONT.SIZE.NORMAL)
                    .text(record.Table, C.TAB.TABLE.REFER + TEXT_padding.left, ROW_CURRENT, {
                        align: 'left'
                    })
                dailyReport.fontSize(C.FONT.SIZE.NORMAL)
                    .text(record.PaymentType, C.TAB.TABLE.TYPE + TEXT_padding.left, ROW_CURRENT, {
                        align: 'left'
                    })
                dailyReport.fontSize(C.FONT.SIZE.NORMAL)
                    .text(record.ShiftWork, C.TAB.TABLE.SHIFT + TEXT_padding.left, ROW_CURRENT, {
                        align: 'left'
                    })
                dailyReport.fontSize(C.FONT.SIZE.NORMAL)
                    .text(record.User, C.TAB.TABLE.CASHIER + TEXT_padding.left, ROW_CURRENT, {
                        align: 'left'
                    })


                dailyReport.fontSize(C.FONT.SIZE.NORMAL)
                    .text("฿ " + gtt1, C.TAB.TABLE.GRANDTOTAL + TEXT_padding.right, ROW_CURRENT, {
                        width:C.TAB.TABLE.REMARK-C.TAB.TABLE.GRANDTOTAL,
                        align: 'right'
                    })

                 //--Remark column
                //service charge,discount,comment,vat
                //ServiceCharge,Discount,...,Vat

                // dailyReport.font('font_style_italic').fillColor('#333333');
                // "SERVICE","ITEMDISCOUNT","DISCOUNT","VAT"
                dailyReport.fontSize(C.FONT.SIZE.SMALL)
                    .text(record.ServiceCharge, C.TAB.TABLE.SERVICE + TEXT_padding.left, ROW_CURRENT, {
                        align: 'left'
                    })

                // _.forEach(C.TAB.TABLE
                //     , function (value, key) {
                //         addColumnLine(value);
                //     })

                // NewLine(TEXT_SPACE)

                dailyReport.fontSize(C.FONT.SIZE.SMALL)
                    .text( record.ItemDiscount, C.TAB.TABLE.ITEMDISCOUNT + TEXT_padding.left, ROW_CURRENT, STYLE_remark)

                // _.forEach(C.TAB.TABLE
                //     , function (value, key) {
                //         addColumnLine(value);
                //     })

                // NewLine(TEXT_SPACE)

                dailyReport.fontSize(C.FONT.SIZE.SMALL)
                    .text(record.Discount, C.TAB.TABLE.DISCOUNT + TEXT_padding.left, ROW_CURRENT, STYLE_remark)

                // _.forEach(C.TAB.TABLE
                //     , function (value, key) {
                //         addColumnLine(value);
                //     })

                // NewLine(TEXT_SPACE)


                dailyReport.fontSize(C.FONT.SIZE.SMALL)
                    .text("Vat: " + record.Vat, C.TAB.TABLE.VAT + TEXT_padding.left, ROW_CURRENT, STYLE_remark)


                // dailyReport.font('font_style_normal').fillColor('black');

                // _.forEach(C.TAB.TABLE
                //     , function (value, key) {
                //         addColumnLine(value);
                //     })

                // NewLine(TEXT_SPACE)

                addTableLine(C.TAB.TABLE
                    .INDEX, ROW_CURRENT, C.TAB.TABLE
                        .LAST, ROW_CURRENT); //row line

            })

            NewLine(TEXT_SPACE)

        })


    }

    function drawFooter() {

        //--footer

        NewLine(C.FONT.SIZE.HEADER + TEXT_SPACE);

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

    function addItems(item, key) {
        dailyReport.fontSize(C.FONT.SIZE.NORMAL)
            .text(key + 1 + '.', TAB_ITEMS.INDEX, ROW_CURRENT)
            .text(item.Name, TAB_ITEMS.NAME, ROW_CURRENT)
            .text(item.Quantity, TAB_ITEMS.QUANTITY, ROW_CURRENT)
            .text("฿ " + numberWithCommas(item.Amount), TAB_ITEMS.AMOUNT, ROW_CURRENT)
            .text(item.Percent + "%", TAB_ITEMS.PERCENT, ROW_CURRENT, {
                width: C.TAB.TABLE.LAST - (C.TAB.TABLE.PERCENT + 10), align: 'right'
            });

    }

    function addHilightExpenceDetail(position, row_height) {

        dailyReport.rect(C.TAB.TABLE_LANDSCAPE_DETAIL
            .INDEX, position, (C.TAB.TABLE_LANDSCAPE_DETAIL.LAST - C.TAB.TABLE_LANDSCAPE_DETAIL.INDEX), row_height).fill('#ddd');

        dailyReport.fill('black');
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

    function addHilightExpence(position, row_height) {

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