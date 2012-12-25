using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Windows.Graphics.Imaging;

namespace WindowsRuntimeComponent.ImageProcessing
{
    public sealed class ImageManager
    {
        public void SetTextToImage(string path, string textToAdd)
        {
            //Windows.Graphics.Imaging.
            //BitmapEncoder.
            //var bmp = Bitmap.FromFile("orig.jpg");
            //var newImage = new Bitmap(bmp.Width, bmp.Height + 50);

            //var gr = Graphics.FromImage(newImage);
            //gr.DrawImageUnscaled(bmp, 0, 0);
            //gr.DrawString("this is the added text", SystemFonts.DefaultFont, Brushes.Black,
            //    new RectangleF(0, bmp.Height, bmp.Width, 50));

            //newImage.Save("newImg.jpg");


            //FileStream fs = new FileStream(@"c:\somepic.gif", FileMode.Open, FileAccess.Read);
            //Image image = Image.FromStream(fs);
            //fs.Close();

            //Bitmap b = new Bitmap(image);
            //Graphics graphics = Graphics.FromImage(b);
            //graphics.DrawString("Hello", this.Font, Brushes.Black, 0, 0);

            //b.Save(@"c:\somepic.gif", image.RawFormat);

            //image.Dispose();
            //b.Dispose();
        }
    }
}
