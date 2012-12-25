﻿//// THIS CODE AND INFORMATION IS PROVIDED "AS IS" WITHOUT WARRANTY OF
//// ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO
//// THE IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
//// PARTICULAR PURPOSE.
////
//// Copyright (c) Microsoft Corporation. All rights reserved

(function () {
    "use strict";


    
    var page = WinJS.UI.Pages.define("/collage.html", {

        init: function (element, options) {
            console.log('file path on init: ' + WinJS.Navigation.state.filePath);

        },

        ready: function (element, options) {
        
            document.getElementById("picture-thumb-start").addEventListener("click", pickPhoto, false);


            var imageMgr = new WindowsRuntimeComponent.ImageProcessing.ImageManager();
            imageMgr.setTextToImage("path to image", "this is my image caption");
        }
    });

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

        
        // Set API parameters
        var requestedSize = 200,
            thumbnailMode = Windows.Storage.FileProperties.ThumbnailMode.singleItem, //modes[modeSelected],
            thumbnailOptions = Windows.Storage.FileProperties.ThumbnailOptions.useCurrentScale;

       

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
            if (file) {
                file.getThumbnailAsync(thumbnailMode, requestedSize, thumbnailOptions).done(function (thumbnail) {
                    if (thumbnail) {
                        outputResult(file, thumbnail, Windows.Storage.FileProperties.ThumbnailMode.singleItem, requestedSize);
                    } else if (isFastSelected) {
                        WinJS.log && WinJS.log(SdkSample.errors.noExif, "sample", "status");
                    } else {
                        WinJS.log && WinJS.log(SdkSample.errors.noThumbnail, "sample", "status");
                    }
                }, function (error) {
                    WinJS.log && WinJS.log(SdkSample.errors.fail, "sample", "status");
                });
            } else {
                WinJS.log && WinJS.log(SdkSample.errors.cancel, "sample", "status");
            }
        });
    }

    function outputResult(item, thumbnailImage, thumbnailMode, requestedSize) {
        document.getElementById("picture-thumb-imageHolder").src = URL.createObjectURL(thumbnailImage, { oneTimeOnly: true });
        // Close the thumbnail stream once the image is loaded
        document.getElementById("picture-thumb-imageHolder").onload = function () {
            thumbnailImage.close();
        };
        document.getElementById("picture-thumb-modeName").innerText = thumbnailMode;
        document.getElementById("picture-thumb-fileName").innerText = "File used: " + item.name;
        document.getElementById("picture-thumb-requestedSize").innerText = "Requested size: " + requestedSize;
        document.getElementById("picture-thumb-returnedSize").innerText = "Returned size: " + thumbnailImage.originalWidth + "x" + thumbnailImage.originalHeight;
    }

    function cleanOutput() {
        WinJS.log && WinJS.log("", "sample", "status");
        document.getElementById("picture-thumb-imageHolder").src = "/images/placeholder-sdk.png";
        document.getElementById("picture-thumb-modeName").innerText = "";
        document.getElementById("picture-thumb-fileName").innerText = "";
        document.getElementById("picture-thumb-requestedSize").innerText = "";
        document.getElementById("picture-thumb-returnedSize").innerText = "";
    }
})();
