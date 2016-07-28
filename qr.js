;(function(w){

    var doc = w.document,
        $ = function(id){
            return doc.getElementById(id);
        },
        QR = (function(){

            var RenderEngine = {
                "canvas": function(config){
                    config = config || {};
                    var size = config.size || 400,
                        color = config.color || '#000',
                        border = config.border || 20,
                        shape = config.shape || 'rectangles',
                        shapes = this.SHAPES,
                        draw = shapes[shape],
                        width = config.width,
                        format = config.format,
                        data = config.data,
                        canvas = doc.createElement('canvas'),
                        ctx = canvas.getContext('2d'),
                        unit, diff, i, j;


                    canvas.width = canvas.height = size;
                    ctx.lineWidth = 1;
                    
                    unit = (size - 2*border)/width;
                    diff = Math.abs(unit - (unit >> 0));
                    unit = Math.round(unit - 0.5);

                    border = Math.round((border + (width * diff) / 2) - 0.5);
                    
                    ctx.fillStyle = '#fff';
                    ctx.fillRect(0, 0, size, size);
                    ctx.fillStyle = color;
                    
                    for(i = 0; i < width; i++){
                        for(j = 0; j < width; j++){
                            if(data[j * width + i]){
                                draw.call(shapes, ctx, unit*i + border, unit*j + border, unit);
                            }
                        }
                    }
                    
                    // future implementation of configuring qr codes with logos
                    if(config.image){
                        var imageConf = config.image,
                            el = imageConf.domel,
                            position = imageConf.position;
                            //...
                    }

                    return canvas.toDataURL(format);
                },
                "svg": function(config){
                    config = config || {};
                    var size = config.size || 400,
                        color = config.color || '#000',
                        border = config.border || 20,
                        shape = config.shape || 'rectangles',
                        shapes = this.SHAPES,
                        draw = shapes[shape],
                        width = config.width,
                        format = config.format,
                        data = config.data,
                        svgHeader = '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">',
                        svgContent = '',
                        unit, diff, i, j;

                    svgContent += '<svg width="'+size+'" height="'+size+'" fill="#fff" xmlns="http://www.w3.org/2000/svg" version="1.1">';

                    
                    unit = (size - 2*border)/width;
                    diff = Math.abs(unit - (unit >> 0));
                    unit = Math.round(unit - 0.5);

                    border = Math.round((border + (width * diff) / 2) - 0.5);
                    
                    
                    for(i = 0; i < width; i++){
                        for(j = 0; j < width; j++){
                            if(data[j * width + i]){
                                svgContent += draw.call(shapes, unit*i + border, unit*j + border, unit, color);
                            }
                        }
                    }

                    svgContent += '</svg>';

                    return svgHeader + svgContent;

                }
            };
            RenderEngine.canvas.SHAPES = {
                roundedRectangles: function(ctx, x, y, unitSize){
                    var radius = 5;
                    ctx.beginPath();
                    ctx.moveTo(x + radius, y);
                    ctx.lineTo(x + unitSize - radius, y);
                    ctx.quadraticCurveTo(x + unitSize, y, x + unitSize, y + radius);
                    ctx.lineTo(x + unitSize, y + unitSize - radius);
                    ctx.quadraticCurveTo(x + unitSize, y + unitSize, x + unitSize - radius, y + unitSize);
                    ctx.lineTo(x + radius, y + unitSize);
                    ctx.quadraticCurveTo(x, y + unitSize, x, y + unitSize - radius);
                    ctx.lineTo(x, y + radius);
                    ctx.quadraticCurveTo(x, y, x + radius, y);
                    ctx.closePath();
                    ctx.fill();   
                },
                rectangles: function(ctx, x, y, unitSize){
                    ctx.fillRect(x, y, unitSize, unitSize);
                },
                circles: function(ctx, x, y, unitSize){
                    ctx.beginPath();
                    ctx.arc(x+(unitSize/2), y+(unitSize/2), (unitSize/2), 0, Math.PI*2, true);
                    ctx.closePath();
                    ctx.fill();
                }
            };
            RenderEngine.svg.SHAPES = {
                roundedRectangles: function(x, y, unitSize, color){
                    var radius = ((unitSize/4) >> 0);
                    return '<rect x="'+x+'" y="'+y+'" rx="'+radius+'" ry="'+radius+'" width="'+unitSize+'" height="'+unitSize+'" fill="'+color+'" />';
                },
                rectangles: function(x, y, unitSize, color){
                    return '<rect x="'+x+'" y="'+y+'" width="'+unitSize+'" height="'+unitSize+'" fill="'+color+'" />';
                },
                circles: function(x, y, unitSize, color){
                    var radius = ((unitSize/1.8) >> 0);
                    x = x+radius;
                    y = y+radius;
                    return '<circle cx="'+x+'" cy="'+y+'" r="'+radius+'" fill="'+color+'" />';
                }
            };
            var RenderFormats = {
                'image/png': 'canvas',
                'image/jpg': 'canvas',
                'image/svg': 'svg'
            };

            var Encoder = (function(){

                var alignmentPattern = [
                    0, 11, 15, 19, 23, 27, 31,
                    16, 18, 20, 22, 24, 26, 28, 20, 22, 24, 24, 26, 28, 28, 22, 24, 24,
                    26, 26, 28, 28, 24, 24, 26, 26, 26, 28, 28, 24, 26, 26, 26, 28, 28
                ],
                versionPattern = [
                    0xc94, 0x5bc, 0xa99, 0x4d3, 0xbf6, 0x762, 0x847, 0x60d,
                    0x928, 0xb78, 0x45d, 0xa17, 0x532, 0x9a6, 0x683, 0x8c9,
                    0x7ec, 0xec4, 0x1e1, 0xfab, 0x08e, 0xc1a, 0x33f, 0xd75,
                    0x250, 0x9d5, 0x6f0, 0x8ba, 0x79f, 0xb0b, 0x42e, 0xa64,
                    0x541, 0xc69
                ],
                format = [
                    0x77c4, 0x72f3, 0x7daa, 0x789d, 0x662f, 0x6318, 0x6c41, 0x6976,    //L
                    0x5412, 0x5125, 0x5e7c, 0x5b4b, 0x45f9, 0x40ce, 0x4f97, 0x4aa0,    //M
                    0x355f, 0x3068, 0x3f31, 0x3a06, 0x24b4, 0x2183, 0x2eda, 0x2bed,    //Q
                    0x1689, 0x13be, 0x1ce7, 0x19d0, 0x0762, 0x0255, 0x0d0c, 0x083b    //H
                ],
                eccblocks = [
                    1, 0, 19, 7, 1, 0, 16, 10, 1, 0, 13, 13, 1, 0, 9, 17,
                    1, 0, 34, 10, 1, 0, 28, 16, 1, 0, 22, 22, 1, 0, 16, 28,
                    1, 0, 55, 15, 1, 0, 44, 26, 2, 0, 17, 18, 2, 0, 13, 22,
                    1, 0, 80, 20, 2, 0, 32, 18, 2, 0, 24, 26, 4, 0, 9, 16,
                    1, 0, 108, 26, 2, 0, 43, 24, 2, 2, 15, 18, 2, 2, 11, 22,
                    2, 0, 68, 18, 4, 0, 27, 16, 4, 0, 19, 24, 4, 0, 15, 28,
                    2, 0, 78, 20, 4, 0, 31, 18, 2, 4, 14, 18, 4, 1, 13, 26,
                    2, 0, 97, 24, 2, 2, 38, 22, 4, 2, 18, 22, 4, 2, 14, 26,
                    2, 0, 116, 30, 3, 2, 36, 22, 4, 4, 16, 20, 4, 4, 12, 24,
                    2, 2, 68, 18, 4, 1, 43, 26, 6, 2, 19, 24, 6, 2, 15, 28,
                    4, 0, 81, 20, 1, 4, 50, 30, 4, 4, 22, 28, 3, 8, 12, 24,
                    2, 2, 92, 24, 6, 2, 36, 22, 4, 6, 20, 26, 7, 4, 14, 28,
                    4, 0, 107, 26, 8, 1, 37, 22, 8, 4, 20, 24, 12, 4, 11, 22,
                    3, 1, 115, 30, 4, 5, 40, 24, 11, 5, 16, 20, 11, 5, 12, 24,
                    5, 1, 87, 22, 5, 5, 41, 24, 5, 7, 24, 30, 11, 7, 12, 24,
                    5, 1, 98, 24, 7, 3, 45, 28, 15, 2, 19, 24, 3, 13, 15, 30,
                    1, 5, 107, 28, 10, 1, 46, 28, 1, 15, 22, 28, 2, 17, 14, 28,
                    5, 1, 120, 30, 9, 4, 43, 26, 17, 1, 22, 28, 2, 19, 14, 28,
                    3, 4, 113, 28, 3, 11, 44, 26, 17, 4, 21, 26, 9, 16, 13, 26,
                    3, 5, 107, 28, 3, 13, 41, 26, 15, 5, 24, 30, 15, 10, 15, 28,
                    4, 4, 116, 28, 17, 0, 42, 26, 17, 6, 22, 28, 19, 6, 16, 30,
                    2, 7, 111, 28, 17, 0, 46, 28, 7, 16, 24, 30, 34, 0, 13, 24,
                    4, 5, 121, 30, 4, 14, 47, 28, 11, 14, 24, 30, 16, 14, 15, 30,
                    6, 4, 117, 30, 6, 14, 45, 28, 11, 16, 24, 30, 30, 2, 16, 30,
                    8, 4, 106, 26, 8, 13, 47, 28, 7, 22, 24, 30, 22, 13, 15, 30,
                    10, 2, 114, 28, 19, 4, 46, 28, 28, 6, 22, 28, 33, 4, 16, 30,
                    8, 4, 122, 30, 22, 3, 45, 28, 8, 26, 23, 30, 12, 28, 15, 30,
                    3, 10, 117, 30, 3, 23, 45, 28, 4, 31, 24, 30, 11, 31, 15, 30,
                    7, 7, 116, 30, 21, 7, 45, 28, 1, 37, 23, 30, 19, 26, 15, 30,
                    5, 10, 115, 30, 19, 10, 47, 28, 15, 25, 24, 30, 23, 25, 15, 30,
                    13, 3, 115, 30, 2, 29, 46, 28, 42, 1, 24, 30, 23, 28, 15, 30,
                    17, 0, 115, 30, 10, 23, 46, 28, 10, 35, 24, 30, 19, 35, 15, 30,
                    17, 1, 115, 30, 14, 21, 46, 28, 29, 19, 24, 30, 11, 46, 15, 30,
                    13, 6, 115, 30, 14, 23, 46, 28, 44, 7, 24, 30, 59, 1, 16, 30,
                    12, 7, 121, 30, 12, 26, 47, 28, 39, 14, 24, 30, 22, 41, 15, 30,
                    6, 14, 121, 30, 6, 34, 47, 28, 46, 10, 24, 30, 2, 64, 15, 30,
                    17, 4, 122, 30, 29, 14, 46, 28, 49, 10, 24, 30, 24, 46, 15, 30,
                    4, 18, 122, 30, 13, 32, 46, 28, 48, 14, 24, 30, 42, 32, 15, 30,
                    20, 4, 117, 30, 40, 7, 47, 28, 43, 22, 24, 30, 10, 67, 15, 30,
                    19, 6, 118, 30, 18, 31, 47, 28, 34, 34, 24, 30, 20, 61, 15, 30
                ],  
                glog = [
                    0xff, 0x00, 0x01, 0x19, 0x02, 0x32, 0x1a, 0xc6, 0x03, 0xdf, 0x33, 0xee, 0x1b, 0x68, 0xc7, 0x4b,
                    0x04, 0x64, 0xe0, 0x0e, 0x34, 0x8d, 0xef, 0x81, 0x1c, 0xc1, 0x69, 0xf8, 0xc8, 0x08, 0x4c, 0x71,
                    0x05, 0x8a, 0x65, 0x2f, 0xe1, 0x24, 0x0f, 0x21, 0x35, 0x93, 0x8e, 0xda, 0xf0, 0x12, 0x82, 0x45,
                    0x1d, 0xb5, 0xc2, 0x7d, 0x6a, 0x27, 0xf9, 0xb9, 0xc9, 0x9a, 0x09, 0x78, 0x4d, 0xe4, 0x72, 0xa6,
                    0x06, 0xbf, 0x8b, 0x62, 0x66, 0xdd, 0x30, 0xfd, 0xe2, 0x98, 0x25, 0xb3, 0x10, 0x91, 0x22, 0x88,
                    0x36, 0xd0, 0x94, 0xce, 0x8f, 0x96, 0xdb, 0xbd, 0xf1, 0xd2, 0x13, 0x5c, 0x83, 0x38, 0x46, 0x40,
                    0x1e, 0x42, 0xb6, 0xa3, 0xc3, 0x48, 0x7e, 0x6e, 0x6b, 0x3a, 0x28, 0x54, 0xfa, 0x85, 0xba, 0x3d,
                    0xca, 0x5e, 0x9b, 0x9f, 0x0a, 0x15, 0x79, 0x2b, 0x4e, 0xd4, 0xe5, 0xac, 0x73, 0xf3, 0xa7, 0x57,
                    0x07, 0x70, 0xc0, 0xf7, 0x8c, 0x80, 0x63, 0x0d, 0x67, 0x4a, 0xde, 0xed, 0x31, 0xc5, 0xfe, 0x18,
                    0xe3, 0xa5, 0x99, 0x77, 0x26, 0xb8, 0xb4, 0x7c, 0x11, 0x44, 0x92, 0xd9, 0x23, 0x20, 0x89, 0x2e,
                    0x37, 0x3f, 0xd1, 0x5b, 0x95, 0xbc, 0xcf, 0xcd, 0x90, 0x87, 0x97, 0xb2, 0xdc, 0xfc, 0xbe, 0x61,
                    0xf2, 0x56, 0xd3, 0xab, 0x14, 0x2a, 0x5d, 0x9e, 0x84, 0x3c, 0x39, 0x53, 0x47, 0x6d, 0x41, 0xa2,
                    0x1f, 0x2d, 0x43, 0xd8, 0xb7, 0x7b, 0xa4, 0x76, 0xc4, 0x17, 0x49, 0xec, 0x7f, 0x0c, 0x6f, 0xf6,
                    0x6c, 0xa1, 0x3b, 0x52, 0x29, 0x9d, 0x55, 0xaa, 0xfb, 0x60, 0x86, 0xb1, 0xbb, 0xcc, 0x3e, 0x5a,
                    0xcb, 0x59, 0x5f, 0xb0, 0x9c, 0xa9, 0xa0, 0x51, 0x0b, 0xf5, 0x16, 0xeb, 0x7a, 0x75, 0x2c, 0xd7,
                    0x4f, 0xae, 0xd5, 0xe9, 0xe6, 0xe7, 0xad, 0xe8, 0x74, 0xd6, 0xf4, 0xea, 0xa8, 0x50, 0x58, 0xaf
                ],
                gexp = [
                    0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1d, 0x3a, 0x74, 0xe8, 0xcd, 0x87, 0x13, 0x26,
                    0x4c, 0x98, 0x2d, 0x5a, 0xb4, 0x75, 0xea, 0xc9, 0x8f, 0x03, 0x06, 0x0c, 0x18, 0x30, 0x60, 0xc0,
                    0x9d, 0x27, 0x4e, 0x9c, 0x25, 0x4a, 0x94, 0x35, 0x6a, 0xd4, 0xb5, 0x77, 0xee, 0xc1, 0x9f, 0x23,
                    0x46, 0x8c, 0x05, 0x0a, 0x14, 0x28, 0x50, 0xa0, 0x5d, 0xba, 0x69, 0xd2, 0xb9, 0x6f, 0xde, 0xa1,
                    0x5f, 0xbe, 0x61, 0xc2, 0x99, 0x2f, 0x5e, 0xbc, 0x65, 0xca, 0x89, 0x0f, 0x1e, 0x3c, 0x78, 0xf0,
                    0xfd, 0xe7, 0xd3, 0xbb, 0x6b, 0xd6, 0xb1, 0x7f, 0xfe, 0xe1, 0xdf, 0xa3, 0x5b, 0xb6, 0x71, 0xe2,
                    0xd9, 0xaf, 0x43, 0x86, 0x11, 0x22, 0x44, 0x88, 0x0d, 0x1a, 0x34, 0x68, 0xd0, 0xbd, 0x67, 0xce,
                    0x81, 0x1f, 0x3e, 0x7c, 0xf8, 0xed, 0xc7, 0x93, 0x3b, 0x76, 0xec, 0xc5, 0x97, 0x33, 0x66, 0xcc,
                    0x85, 0x17, 0x2e, 0x5c, 0xb8, 0x6d, 0xda, 0xa9, 0x4f, 0x9e, 0x21, 0x42, 0x84, 0x15, 0x2a, 0x54,
                    0xa8, 0x4d, 0x9a, 0x29, 0x52, 0xa4, 0x55, 0xaa, 0x49, 0x92, 0x39, 0x72, 0xe4, 0xd5, 0xb7, 0x73,
                    0xe6, 0xd1, 0xbf, 0x63, 0xc6, 0x91, 0x3f, 0x7e, 0xfc, 0xe5, 0xd7, 0xb3, 0x7b, 0xf6, 0xf1, 0xff,
                    0xe3, 0xdb, 0xab, 0x4b, 0x96, 0x31, 0x62, 0xc4, 0x95, 0x37, 0x6e, 0xdc, 0xa5, 0x57, 0xae, 0x41,
                    0x82, 0x19, 0x32, 0x64, 0xc8, 0x8d, 0x07, 0x0e, 0x1c, 0x38, 0x70, 0xe0, 0xdd, 0xa7, 0x53, 0xa6,
                    0x51, 0xa2, 0x59, 0xb2, 0x79, 0xf2, 0xf9, 0xef, 0xc3, 0x9b, 0x2b, 0x56, 0xac, 0x45, 0x8a, 0x09,
                    0x12, 0x24, 0x48, 0x90, 0x3d, 0x7a, 0xf4, 0xf5, 0xf7, 0xf3, 0xfb, 0xeb, 0xcb, 0x8b, 0x0b, 0x16,
                    0x2c, 0x58, 0xb0, 0x7d, 0xfa, 0xe9, 0xcf, 0x83, 0x1b, 0x36, 0x6c, 0xd8, 0xad, 0x47, 0x8e, 0x00
                ],
                stringbuffer, eccbuffer, qrdata, framemask, badness, generatorPolynom, width,
                mask = function(x, y){
                    var bit;
                    if(x > y){
                        bit = x;
                        x = y;
                        y = bit;
                    }
                    
                    bit = (((y * y) + y) >> 1) + x;
                    framemask[bit] = 1;
                },
                set = function(x, y, value){
                    qrdata[x + width * y] = value;
                },
                align = function(x, y){
                    
                    var temp;

                    set(x, y, 1);
                    for(temp = -2; temp < 2; temp++){
                        set(x + temp, y - 2, 1);
                        set(x - 2, y + temp + 1, 1);
                        set(x + 2, y + temp, 1);
                        set(x + temp + 1, y + 2, 1);
                    }

                    for(temp = 0; temp < 2; temp++){
                        mask(x - 1, y + temp);
                        mask(x - temp, y - 1);
                        mask(x + 1, y - temp);
                        mask(x + temp, y + 1);
                    }

                },
                rsModN = function(x){
                    
                    while(x >= 255){
                        x -= 255;
                        x = (x >> 8) + (x & 255);
                    }
                    return x;
                },
                createRS = function(data, len, eccbuffer, ecclen){
                    var i, j, temp;

                    for(i = 0; i < ecclen; i++){
                        stringbuffer[eccbuffer + i] = 0;
                    }
                    for(i = 0; i < len; i++){
                        temp = glog[stringbuffer[data + i] ^ stringbuffer[eccbuffer]];
                       
                        if(temp == 255){
                            for(j = eccbuffer; j < eccbuffer + ecclen; j++){
                                stringbuffer[j] = stringbuffer[j + 1];
                            }
                        }else{
                            for(j = 1; j< ecclen; j++){
                                stringbuffer[eccbuffer + j - 1] = stringbuffer[eccbuffer + j] ^ gexp[rsModN(temp + generatorPolynom[ecclen - j])];
                            }
                        }
                        stringbuffer[eccbuffer + ecclen - 1] = (temp == 255)?0:gexp[rsModN(temp + generatorPolynom[0])];
                    }
                },
                isMasked = function(x, y){
                    var bit;
                    if(x > y){
                        bit = x;
                        x = y;
                        y = bit;
                    }
    
                    bit = ((y + (y * y)) >> 1) + x;

                    return framemask[bit];
                },
                maskFunctions = [
                    function(){
                        var x, y;
                        for(y = 0; y < width; y++){
                            for(x = 0; x < width; x++){
                                if(!((x + y) & 1) && !isMasked(x, y)){
                                    qrdata[x + y * width] ^= 1;
                                }
                            }

                        }
                    },
                    function(){
                        var x, y;
                        for(y = 0; y < width; y++){     
                            for(x = 0; x < width; x++){
                                if(!(y & 1) && !isMasked(x, y)){
                                    qrdata[x + y * width] ^= 1;
                                }
                            }
                        }
                    },
                    function(){
                        var x, y, rx;
                        for(y = 0; y < width; y++){     
                            for(rx = 0, x = 0; x < width; x++, rx++){
                                if(rx == 3){
                                    rx = 0;
                                }
                                if(!rx && !isMasked(x, y)){
                                    qrdata[x + y * width] ^= 1;
                                }
                            }
                        }
                    },
                    function(){
                        var x, y, rx, ry;
                        for(ry = 0,y = 0; y < width; y++, ry++){     
                            if(ry == 3){
                               ry = 0; 
                            }
                            for(rx = ry, x = 0; x < width; x++, rx++){
                                if(rx == 3){
                                    rx = 0;
                                }
                                if(!rx && !isMasked(x, y)){
                                    qrdata[x + y * width] ^= 1;
                                }
                            }
                        }
                    },
                    function(){
                        var x, y, rx, ry;
                        for(y = 0; y < width; y++){
                            for(rx = 0, ry = ((y >> 1) & 1), x = 0; x < width; x++, rx++){
                                if(rx == 3){
                                    rx = 0;
                                    ry = !ry;
                                }
                                if(!ry && !isMasked(x, y)){
                                    qrdata[x+ y * width] ^= 1;
                                }
                            }
                        }
                    },
                    function(){
                        var x, y, rx, ry;
                        for(ry = 0, y = 0; y < width; y++, ry++){
                            if(ry == 3){
                                ry = 0;
                            }
                            for(rx = 0, x = 0; x < width; x++, rx++){
                                if(rx == 3){
                                    rx = 0;
                                }
                                if(!((x & y & 1) + !(!rx | !ry)) && !isMasked(x, y)){
                                    qrdata[x + y * width] ^= 1;
                                }
                            }
                        }
                    },
                    function(){
                        var x, y, rx, ry;
                        for(ry = 0, y = 0; y < width; y++, ry++){
                            if(ry == 3){
                                ry = 0;
                            }
                            for(rx = 0, x = 0; x < width; x++, rx++){
                                if(rx == 3){
                                    rx = 0;
                                }
                                if(!(((x & y & 1) + (rx && (rx == ry))) & 1) && !isMasked(x, y)){
                                    qrdata[x + y * width] ^= 1;
                                }
                            }
                        }
                    },
                    function(){
                        var x, y, rx, ry;
                        for(ry =0, y = 0; y < width; y++, ry++){
                            if(ry == 3){
                                ry = 0;
                            }
                            for(rx = 0, x = 0; x < width; x++, rx++){
                                if(rx == 3){
                                    rx = 0;
                                }
                                if(!(((rx && (rx == ry)) + ((x + y) & 1)) & 1) && !isMasked(x, y)){
                                    qrdata[x + y * width] ^= 1;
                                }
                            }
                        }
                    }
                ],
                applyMask = function(mask){
                    maskFunctions[mask].apply(maskFunctions);
                    return;
                },
                badnessCoeff = [
                    3, 3, 40, 10
                ],
                runbad = function(len){
                    var i, bad = 0;
                    for(i = 0; i <= len; i++){
                        if(badness[i] >= 5){
                            bad += badnessCoeff[0] + badness[i] - 5;
                        }
                    }
                    for(i = 3; i < len - 1; i += 2){
                        if(badness[i - 2] == badness[i + 2] && badness[i + 2] == badness[i - 1]
                            && badness[i - 1] == badness[i + 1] && badness[i - 1] * 3 == badness[i]
                            && (badness[i - 3] == 0 || i + 3 > len || badness[i - 3] * 3 >= badness[i] * 4
                            || badness[i + 3] * 3 >= badness[i] * 4)){
                            bad += badnessCoeff[2];
                        }
                    }
                    return bad;
                },
                checkBadness = function(){
                    var x, y, h, block1, block2, big, count = 0, bad = 0, blackwhite = 0;

                    for(y = 0; y < width - 1; y++){
                        for(x = 0; x < width -1; x++){
                            if((qrdata[x + width * y] && qrdata[(x + 1) + width * y]
                                && qrdata[x + width * (y + 1)] && qrdata[(x + 1) + width * (y + 1)])
                                || !(qrdata[x + width * y] || qrdata[(x + 1) + width * y]
                                || qrdata[x + width * (y + 1)] || qrdata[(x + 1) + width * (y + 1)])){
                                bad += badnessCoeff[1];
                            }
                        }
                    }

                    for(y = 0; y < width; y++){
                        badness[0] = 0;
                        for(h = block1 = x = 0; x < width; x++){
                            if((block2 = qrdata[x + width * y]) == block1){
                                badness[h]++;
                            }else{
                                badness[++h] = 1;
                            }
                            block1 = block2;
                            blackwhite += block1?1:-1;
                        }
                        bad += runbad(h);
                    }

                    if(blackwhite < 0){
                        blackwhite = -blackwhite;
                    }
                    big = (blackwhite + (blackwhite << 2)) << 1;
                   
                    while(big > width * width){
                        big -= width * width;
                        count++;
                    }
                    bad += count * badnessCoeff[3];
                    
                    for(x = 0; x < width; x++){
                        badness[0] = 0;
                        for(h = block1 = y = 0; y < width; y++){
                            if((block2 = qrdata[x + width * y]) == block1){
                                badness[h]++;
                            }else{
                                badness[++h] = 1;
                            }
                            block1 = block2;
                        }
                        bad += runbad(h);
                    }
                    return bad;
                },
                generateQRdata = function(text, ecclevel){
                    // init
                    stringbuffer = [],
                    eccbuffer = [],
                    qrdata = [],
                    framemask = [],
                    badness = [],
                    generatorPolynom = [];

                    var version = 0,
                        tlen = text.length,
                        neccblock1, neccblock2,
                        datablock, eccblockwidth, x, y, k, l, temp, i, j, m;

                    do {
                        version++;
                        k = (ecclevel - 1) * 4 + (version - 1) * 16;
                        neccblock1 = eccblocks[k++];
                        neccblock2 = eccblocks[k++];
                        datablock = eccblocks[k++];
                        eccblockwidth = eccblocks[k];
                        k = datablock * (neccblock1 + neccblock2) + neccblock2 - 3 + (version <= 9);
                        if(tlen <= k){
                            break;
                        }
                    }while(version < 40);
                    
                    width = 17 + 4 * version;
                    
                    l = datablock + (datablock + eccblockwidth) * (neccblock1 + neccblock2) + neccblock2;
                    for(temp = 0; temp < l; temp++){
                        eccbuffer[temp] = 0;
                    }
                    stringbuffer = text.slice(0);
                    temp = width * width;
                    while(temp--){
                        qrdata[temp] = 0;
                    }
                    temp = (width * (width + 1) + 1) / 2;
                    for(i = 0; i < temp; i++){
                        framemask[i] = 0;
                    }
                    tlen = stringbuffer.length;
                    for(i = 0; i < tlen; i++){
                        eccbuffer[i] = stringbuffer.charCodeAt(i);
                    }
                    stringbuffer = eccbuffer.slice(0);

                    for(temp = 0; temp < 3; temp++){
                        k = y = 0;
                        if(temp == 1){
                            k = width - 7;
                        }
                        if(temp == 2){
                            y = width -7;
                        }
                        set(y + 3, k + 3, 1);
                        for(x = 0; x < 6; x++){
                            set(x + y, k, 1);
                            set(y, k + x + 1, 1);
                            set(y + 6, k + x, 1);
                            set(x + y + 1, k + 6, 1);
                        }
                        for(x = 1; x < 5; x++){
                            mask(x + y, k + 1);
                            mask(y + 1, k + x + 1);
                            mask(y + 5, k + x);
                            mask(x + y + 1, k + 5);
                        }
                        for(x = 2; x < 4; x++){
                            set(x + y, k + 2, 1);
                            set(y + 2, k + x + 1, 1);
                            set(y + 4, k + x, 1);
                            set(x + y + 1, k + 4, 1);
                        }
                    }
                    
                    if(version > 1){
                        temp = alignmentPattern[version];
                        y = width - 7;
                        while(true){
                            x = width - 7;
                            while(x > temp - 3){
                                align(x, y);
                                if(x < temp){
                                    break;
                                }
                                x -= temp;
                            }
                            if(y <= temp + 9){
                                break;
                            }
                            y -= temp;
                            align(6, y);
                            align(y, 6);
                        }
                    }
                    set(8, width - 8, 1);
                    for(y = 0; y < 7; y++){
                        mask(7, y);
                        mask(width - 8, y);
                        mask(7, y + width - 7);
                    }
                    for(x = 0; x < 8; x++){
                        mask(x, 7);
                        mask(x + width - 8, 7);
                        mask(x, width - 8);
                    }
                    for(x = 0; x < 9; x++){
                        mask(x, 8);
                    }
                    for(x = 0; x < 8; x++){
                        mask(x + width - 8, 8);
                        mask(8, x);
                    }
                    for(y = 0; y < 7; y++){
                        mask(8, y + width - 7);
                    }
                    
                    for(x = 0; x < width - 14; x++){
                        if(x & 1){
                            mask(8 + x, 6);
                            mask(6, 8 + x);
                        }else{
                            set(8 + x, 6, 1);
                            set(6, 8 + x, 1);
                        }
                    }

                    if(version > 6){
                        temp = versionPattern[version - 7];
                        k = 17;
                        for(x = 0; x < 6; x++){
                            for(y = 0; y < 3; y++, k--){
                                if(1 & (k > 11?version >> (k - 12): temp >> k)){
                                    set(5 - x, 2 - y + width - 11, 1);
                                    set(2 - y + width - 11, 5 - x, 1);
                                }else{
                                    mask(5 - x, 2 - y + width - 11);
                                    mask(2 - y + width - 11, 5 - x);
                                }
                            }
                        }
                    }
                    for(y = 0; y < width; y++){
                        for(x = 0; x <= y; x++){
                            if(qrdata[x + width * y]){
                                mask(x, y);
                            }
                        }
                    }

                    x = datablock * (neccblock1 + neccblock2) + neccblock2;
                    if(tlen >= x - 2){
                        tlen = x - 2;
                        if(version > 9){
                            tlen--;
                        }
                    }
                    
                    i = tlen;
                    if(version > 9){
                        stringbuffer[i + 2] = 0;
                        stringbuffer[i + 3] = 0;
                        while(i--){
                            temp = stringbuffer[i];
                            stringbuffer[i + 3] |= 255 & (temp << 4);
                            stringbuffer[i + 2] = temp >> 4;
                        }
                        stringbuffer[2] |= 255 & (tlen << 4);
                        stringbuffer[1] = tlen >> 4;
                        stringbuffer[0] = 0x40 | (tlen >> 12);
                    }else{
                        stringbuffer[i + 1] = 0;
                        stringbuffer[i + 2] = 0;
                        while(i--){
                            temp = stringbuffer[i];
                            stringbuffer[i + 2] |= 255 & (temp << 4);
                            stringbuffer[i + 1] = temp >> 4;
                        }
                        stringbuffer[1] |= 255 & (tlen << 4);
                        stringbuffer[0] = 0x40 | (tlen >> 4);
                    }
                    i = tlen + 3 - (version < 10);
                    while(i < x){
                        stringbuffer[i++] = 0xec;
                        stringbuffer[i++] = 0x11;
                    }
                    
                    generatorPolynom[0] = 1;
                    for(i = 0; i < eccblockwidth; i++){
                        generatorPolynom[i + 1] = 1;
                        for(j = i; j > 0; j--){
                            generatorPolynom[j] = generatorPolynom[j] ? generatorPolynom[j - 1] ^ gexp[rsModN(glog[generatorPolynom[j]] + i)] : generatorPolynom[j - 1];
                        }
                        generatorPolynom[0] = gexp[rsModN(glog[generatorPolynom[0]] + i)];

                    }
                    for(i = 0; i <= eccblockwidth; i++){
                        generatorPolynom[i] = glog[generatorPolynom[i]];
                    }
                    k = x, y = 0;
                    for(i = 0; i < neccblock1; i++){
                        createRS(y, datablock, k, eccblockwidth);
                        y += datablock;
                        k += eccblockwidth;
                    }
                    for(i = 0; i < neccblock2; i++){
                        createRS(y, datablock + 1, k, eccblockwidth);
                        y += datablock + 1;
                        k += eccblockwidth;
                    }
                    y = 0;
                    for(i = 0; i < datablock; i++){
                        for(j = 0; j < neccblock1; j++){
                            eccbuffer[y++] = stringbuffer[i + j * datablock];
                        }
                        for(j = 0; j < neccblock2; j++){
                            eccbuffer[y++] = stringbuffer[(neccblock1 * datablock) + i + (j * (datablock + 1))];
                        }
                    }
                    for(j = 0; j < neccblock2; j++){
                        eccbuffer[y++] = stringbuffer[(neccblock1 * datablock) + i + (j * (datablock + 1))];
                    }
                    for(i = 0; i < eccblockwidth; i++){
                        for(j = 0; j < neccblock1 + neccblock2; j++){
                            eccbuffer[y++] = stringbuffer[x + i + j * eccblockwidth];
                        }
                    }
                    stringbuffer = eccbuffer;
                    
                    x = y = width - 1;
                    k = tlen = 1;
                    m = (datablock + eccblockwidth) * (neccblock1 + neccblock2) + neccblock2;
                    for(i = 0; i < m; i++){
                        temp = stringbuffer[i];
                        for(j = 0; j < 8; j++, temp <<= 1){
                            if(0x80 & temp){
                                set(x, y, 1);
                            }
                            do{
                                if(tlen){
                                    x--;
                                }else{
                                    x++;
                                    if(k){
                                        if(y != 0){
                                            y--;
                                        }else{
                                            x -= 2;
                                            k = !k;
                                            if(x == 6){
                                                x--;
                                                y = 9;
                                            }
                                        }
                                    }else{
                                        if( y != width - 1){
                                            y++;
                                        }else{
                                            x -= 2;
                                            k = !k;
                                            if(x == 6){
                                                x--;
                                                y -= 8;
                                            }
                                        }
                                    }
                                }
                                tlen = !tlen;
                            }while(isMasked(x, y));
                        }
                    }
                    stringbuffer = qrdata.slice(0);
                    temp = 0;
                    y = 30000;
                    for(k = 0; k < 8; k++){
                        applyMask(k);
                        x = checkBadness();
                        if(x < y){
                            y = x;
                            temp = k;
                        }
                        if(temp == 7){
                            break;
                        }
                        qrdata = stringbuffer.slice(0);
                    }
                    if(temp != k){
                        applyMask(temp);
                    }
                    y = format[temp + ((ecclevel - 1) << 3)];
                    for(k = 0; k < 8; k++, y >>= 1){
                        if(y & 1){
                            set(width - 1 - k, 8, 1);
                            if(k < 6){
                                set(8, k, 1);
                            }else{
                                set(8, k + 1, 1);
                            }
                        }
                    }
                    for(k = 0; k < 7; k++, y >>= 1){
                        if(y & 1){
                            set(8, width - 7 + k, 1);
                            if(k){
                                set(6 - k, 8, 1);
                            }else{
                                set(7, 8, 1);
                            }
                        }
                    }
                    return [width, qrdata];
                },
                prefixes = {
                    'plain': '',
                    'email': 'mailto:',
                    'telephone': 'tel:',
                    'sms': 'sms:',
                    'mms': 'mms:',
                    'geolocation': 'geo:',
                    'mecard': 'MECARD:',
                    'bizcard': 'BIZCARD'
                };


                return {
                    encode: function(config){
                        config = config || {};
                        var eccLevel = config.ecclevel || 4,
                            type = config.type || 'plain',
                            text = prefixes[type] + (config.text || ''),
                            format = config.format || 'image/png',
                            qrdata = generateQRdata(text, eccLevel),
                            renderer = RenderEngine[RenderFormats[format]];

                        config.width = qrdata[0];
                        config.data = qrdata[1];
                        
                        return renderer.call(renderer, config);
                    }
                };
            })();

            return {
                encode: function(){
                    return Encoder.encode.apply(Encoder, arguments);
                }
            };

        })();

    w.QR = QR;

})(this);
