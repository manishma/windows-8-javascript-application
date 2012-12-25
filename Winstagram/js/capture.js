(function () {
    

    WinJS.UI.Pages.define("/capture.html", {
        ready: function (element, options) {
            startCamera();
        }
    });

    // Using
    var Capture = Windows.Media.Capture;
    //var Storage = Windows.Storage;

    //// Globals
    //var mediaCapture;
    //var recording = false;
    //var recordedFile;
    
    //var pics;
    //var videos;
    //var flipView;
    //var imageProcessor;
    //var screensList;
    

    function startCamera() {
        var livePreview = document.getElementById("live-preview");
        var mediaCapture = new Capture.MediaCapture();
        mediaCapture.initializeAsync().then(function () {
            livePreview.src = URL.createObjectURL(mediaCapture);
            livePreview.play();
        });
    }

})();