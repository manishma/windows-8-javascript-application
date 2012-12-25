//// THIS CODE AND INFORMATION IS PROVIDED "AS IS" WITHOUT WARRANTY OF
//// ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO
//// THE IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
//// PARTICULAR PURPOSE.
////
//// Copyright (c) Microsoft Corporation. All rights reserved

(function () {
    "use strict";


    
    var page = WinJS.UI.Pages.define("/collage.html", {

        init: function (element, options) {

        },

        ready: function (element, options) {
            btn_save.addEventListener("click", function() {
                saveCanvasToImage();
            });
            
            onLoad();
        }
    });

    var context;
    var brushList;
    var canvas;
    var output;
    var animationActive = false;

    // Set API parameters
    var requestedSize = 200;
    var canvasSize = 300;
    var thumbnailMode = Windows.Storage.FileProperties.ThumbnailMode.singleItem;
    var thumbnailOptions = Windows.Storage.FileProperties.ThumbnailOptions.useCurrentScale;

    function onLoad() {
        document.getElementById("picture-thumb-start").addEventListener("click", pickPhoto, false);

        if (WinJS.Navigation.state && WinJS.Navigation.state.file) {
            console.log('file path on init: ' + WinJS.Navigation.state.file.path);
            loadImage(WinJS.Navigation.state.file);
        }


        var element;
        canvas = document.getElementById("paintCanvas");
        output = document.getElementById("output");

        // account for margins
       
        context = canvas.getContext("2d");
        canvas.addEventListener("MSPointerDown", canvasHandler, false);
        canvas.addEventListener("MSPointerMove", canvasHandler, false);
        canvas.addEventListener("MSPointerUp", canvasHandler, false);
        canvas.addEventListener("MSPointerOver", canvasHandler, false);
        canvas.addEventListener("MSPointerOut", canvasHandler, false);
        canvas.addEventListener("MSPointerCancel", canvasHandler, false);
        canvas.width = canvasSize;
        canvas.height = canvasSize;
        context.lineWidth = 1;
        context.lineCap = "round";
        context.lineJoin = "round";

        initColorPalette();
        
        brushList = new Array();
    }

    function initColorPalette() {
        var element = document.getElementById("palette");
        var divs = element.getElementsByTagName("div");
        for (var idx = 0; idx < divs.length; idx++) {
            divs[idx].addEventListener("MSPointerUp", colorSelector, false);
        }
    }

    function colorSelector(evt) {
        context.strokeStyle = evt.srcElement.id;
        var element = document.getElementById("selectedColor");
        element.style.backgroundColor = evt.srcElement.id;
        evt.preventDefault();
    }

    function brushTool() {
        var brush = this;
        brush.started = false;
        brush.over = false;
        brush.prevX = 0;
        brush.prevY = 0;
        brush.currentX = 0;
        brush.currentY = 0;
        brush.lineWidth = 3;

        // Even though the choice of raw coordinates over predicted coordinates has performance
        // overhead we will use raw coordinates because predicted coordinates don't give
        // accurate results for our purpose.
        this.MSPointerDown = function (evt) {
            canvas.msSetPointerCapture(evt.pointerId);
            brush.currentX = evt.currentPoint.rawPosition.x;
            brush.currentY = evt.currentPoint.rawPosition.y;
            brush.prevX = brush.currentX;
            brush.prevY = brush.currentY;
            brush.started = true;
            brush.over = true;
            if (!animationActive) {
                window.requestAnimationFrame(animationHandler);
                animationActive = true;
            }
        };

        this.MSPointerOver = function (evt) {
            brush.over = true;
            if (brush.started) {
                brush.currentX = evt.currentPoint.rawPosition.x;
                brush.currentY = evt.currentPoint.rawPosition.y;
            } else if (evt.currentPoint.isInContact) {
                // If the Down occurred outside of the canvas element but the pointer is in contact,
                // simulate the Down behavior when the pointer enters the canvas
                brush.MSPointerDown(evt);
            }
        };

        this.MSPointerMove = function (evt) {
            if (brush.started) {
                // Adjust the line width by reading the contact width from
                // the event parameter. Use a width of 1 for pen and mouse.
                if (evt.pointerType === evt.MSPOINTER_TYPE_TOUCH) {
                    brush.lineWidth = evt.width / 2;
                } else {
                    brush.lineWidth = 1;
                }
                brush.currentX = evt.currentPoint.rawPosition.x;
                brush.currentY = evt.currentPoint.rawPosition.y;
            }
        };

        this.MSPointerUp = function (evt) {
            canvas.msReleasePointerCapture(evt.pointerId);
            brush.started = false;
        };

        this.MSPointerOut = function (evt) {
            brush.over = false;
        };

        this.MSPointerCancel = function (evt) {
            brush.over = false;
            brush.started = false;
        };
    }

    function canvasHandler(evt) {
        var brush;
        var func;

        if (brushList[evt.pointerId] === null ||
            brushList[evt.pointerId] === undefined) {
            brushList[evt.pointerId] = new brushTool();
        }

        brush = brushList[evt.pointerId];

        func = brush[evt.type];
        func(evt);

        if (!brush.started && !brush.over) {
            // clean up when the brush is finished
            delete brushList[evt.pointerId];
        }
    }

    function clearCanvas(evt) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        brushList.length = 0;
    }

    function animationHandler() {
        animationActive = false;
        for (var idx in brushList) {
            var currentBrush = brushList[idx];
            if (currentBrush.started) {
                context.beginPath();
                context.lineWidth = currentBrush.lineWidth;
                context.moveTo(currentBrush.prevX, currentBrush.prevY);
                context.lineTo(currentBrush.currentX, currentBrush.currentY);
                context.stroke();
                currentBrush.prevX = currentBrush.currentX;
                currentBrush.prevY = currentBrush.currentY;
                animationActive = true;
            }
        }
        if (animationActive) {
            // Request for another callback until all pointers are gone.
            window.requestAnimationFrame(animationHandler);
        }
    }

    function pickPhoto() {
        // Map thumbnail modes to HTML <select> options
        var modes = {
            //"picturesGrid": Windows.Storage.FileProperties.ThumbnailMode.picturesView,
            //"picturesList": Windows.Storage.FileProperties.ThumbnailMode.listView,
            //"singlePicture": Windows.Storage.FileProperties.ThumbnailMode.singleItem,
        };
        var modeNames = {
            //"picturesGrid": "ThumbnailMode.picturesView",
            //"picturesList": "ThumbnailMode.listView",
            //"singlePicture": "ThumbnailMode.singleItem",
        };


        // Verify that we are currently not snapped, or that we can unsnap to open the picker
        var currentState = Windows.UI.ViewManagement.ApplicationView.value;
        if (currentState === Windows.UI.ViewManagement.ApplicationViewState.snapped &&
            !Windows.UI.ViewManagement.ApplicationView.tryUnsnap()) {
            // Fail silently if we can't unsnap
            return;
        }

        // Clean output in case of repeat usage
        cleanOutput();

        var openpicker = new Windows.Storage.Pickers.FileOpenPicker();
        openpicker.fileTypeFilter.replaceAll([".jpg", ".png", ".bmp", ".gif", ".tif"]);
        openpicker.suggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.picturesLibrary;
        openpicker.pickSingleFileAsync().done(function (file) {
            loadImage(file);
        });
    }

    var loadImage = function(file) {
        if (file) {
            file.getThumbnailAsync(thumbnailMode, requestedSize, thumbnailOptions).done(function(thumbnail) {
                if (thumbnail) {
                    outputResult(file, thumbnail, Windows.Storage.FileProperties.ThumbnailMode.singleItem, requestedSize);
                } else if (isFastSelected) {
                    WinJS.log && WinJS.log(SdkSample.errors.noExif, "sample", "status");
                } else {
                    WinJS.log && WinJS.log(SdkSample.errors.noThumbnail, "sample", "status");
                }
            }, function(error) {
                WinJS.log && WinJS.log(SdkSample.errors.fail, "sample", "status");
            });
        } else {
            WinJS.log && WinJS.log(SdkSample.errors.cancel, "sample", "status");
        }
    };
    
    function outputResult(item, thumbnailImage, thumbnailMode, requestedSize) {
        document.getElementById("picture-thumb-modeName").innerText = thumbnailMode;
        document.getElementById("picture-thumb-fileName").innerText = "File used: " + item.name;
        document.getElementById("picture-thumb-requestedSize").innerText = "Requested size: " + requestedSize;
        document.getElementById("picture-thumb-returnedSize").innerText = "Returned size: " + thumbnailImage.originalWidth + "x" + thumbnailImage.originalHeight;

        var can = document.getElementById('paintCanvas');
        var ctx = can.getContext('2d');

        var img = new Image();
        img.onload = function () {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvasSize, canvasSize);
            ctx.drawImage(img, (canvasSize - img.width) / 2, (canvasSize - img.height) / 2);
            thumbnailImage.close();
        };
        
        img.src = URL.createObjectURL(thumbnailImage, { oneTimeOnly: true });

    }

    function cleanOutput() {
        WinJS.log && WinJS.log("", "sample", "status");
        document.getElementById("picture-thumb-modeName").innerText = "";
        document.getElementById("picture-thumb-fileName").innerText = "";
        document.getElementById("picture-thumb-requestedSize").innerText = "";
        document.getElementById("picture-thumb-returnedSize").innerText = "";
    }

    var saveCanvasToImage = function() {
        console.log("saving canvas to image.");

        var Imaging = Windows.Graphics.Imaging;
        var picker = new Windows.Storage.Pickers.FileSavePicker();
        picker.suggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.picturesLibrary;
        picker.fileTypeChoices.insert("PNG file", [".png"]);
        var imgData, fileStream = null;
        picker.pickSaveFileAsync().then(function(file) {
            if (file) {
                return file.openAsync(Windows.Storage.FileAccessMode.readWrite);
            } else {
                return WinJS.Promise.wrapError("No file selected");
            }
        }).then(function(stream) {
            fileStream = stream;
            var canvas = paintCanvas;
            var ctx = canvas.getContext("2d");
            imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

            return Imaging.BitmapEncoder.createAsync(Imaging.BitmapEncoder.pngEncoderId, stream);
        }).then(function(encoder) {
            //Set the pixel data--assume "encoding" object has options from elsewhere
            encoder.setPixelData(Windows.Graphics.Imaging.BitmapPixelFormat.rgba8,
                Windows.Graphics.Imaging.BitmapAlphaMode.premultiplied,
                imgData.width, /* width */
                imgData.height, /* height */
                96, /* dpiX */
                96, /* dpiY */
                new Uint8Array(imgData.data));
            //Go do the encoding
            return encoder.flushAsync();
        }).done(function() {
            //Make sure to do this at the end
            fileStream.close();
        }, function() {
            //Empty error handler (do nothing if the user canceled the picker
        });

    };
})();
