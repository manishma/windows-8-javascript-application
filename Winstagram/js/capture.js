(function () {
    
    WinJS.UI.Pages.define("/capture.html", {
        ready: function (element, options) {

            btn_capture.addEventListener("click", function() {
                takePhoto();
            });
            
            btn_back.addEventListener("click", function () {
                history.back();
            });

            startCamera();
        }
        
    });

    /*function navigateClickHandler(eventInfo) {
        //WinJS.Navigation.navigate("/default.html");
        
    }*/

    // Using
    var Capture = Windows.Media.Capture;
    var Storage = Windows.Storage;

    //// Globals
    var mediaCapture;
    //var recording = false;
    //var recordedFile;
    
    var pics;
    //var videos;
    //var flipView;
    //var imageProcessor;
    //var screensList;
    

    function startCamera() {
        var livePreview = document.getElementById("live-preview");
        mediaCapture = new Capture.MediaCapture();
        mediaCapture.initializeAsync().then(function () {
            livePreview.src = URL.createObjectURL(mediaCapture);
            livePreview.play();
        });
    }

    var picturesLib = Storage.KnownFolders.picturesLibrary;
    picturesLib.createFolderAsync("Winstagram", Storage.CreationCollisionOption.openIfExists)
      .then(function (folder) {
          pics = folder;
      });
    
    function takePhoto() {
        pics.createFileAsync((new Date()).getTime()+".jpg", Storage.CreationCollisionOption.generateUniqueName)
          .then(function (file) {
              var photoProperties = Windows.Media.MediaProperties.ImageEncodingProperties.createJpeg();

              mediaCapture.capturePhotoToStorageFileAsync(photoProperties, file).then(function () {
                  console.log("Image saved on disk on: " + file.path);
              });
          });
    }
    
})();