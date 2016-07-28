<a href='http://192.241.245.137/~themegee/qr/'>DEMO HERE</a>

<h3>QR.encode(config)</h3>

<p>QR.encode takes a configuration object as an argument.<br/>
The configuration object can have the following properties:</p>

<ul>
<li><strong>text</strong> (String): The text to encode</li>
<li><strong>size</strong> (Number): The QR code size (pixels) Default 400x400</li>
<li><strong>color</strong> (String): The QR code color e.g. &ldquo;#fff&rdquo;</li>
<li><strong>border</strong> (Number): The QR code border width (pixels)</li>
<li><p><strong>shape</strong> (String): The unit shape.</p>

<p>   Possible values:<br/>
  &ldquo;rectangles&rdquo;, &ldquo;roundedRectangles&rdquo;,&ldquo;circles&rdquo;</p></li>
<li><strong>format</strong> (String): The output format. Currently supported: &ldquo;image/png&rdquo;, &ldquo;image/svg&rdquo;</li>
<li><p><strong>type</strong> (String): The type of text that should be encoded (mobile phone actions are triggered based on that type)</p>

<p>  Possible values:</p>

<ul>
<li><strong>&ldquo;telephone&rdquo;</strong>: for telephone numbers, text should be nr</li>
<li><strong>&ldquo;email&rdquo;</strong>: for e-mail addresses, text should be email</li>
<li><strong>&ldquo;geolocation&rdquo;</strong>: for geocoordinates, text should be lon lat</li>
<li><strong>&ldquo;mecard&rdquo;</strong>: for MECARDs, text should be mecard</li>
<li><strong>&ldquo;sms&rdquo;</strong>: for opening SMS, text should be number</li>
<li><strong>&ldquo;mms&rdquo;</strong>: for opening MMS, text should be number</li>
</ul>
</li>
</ul>


<h2>How to use</h2>

<h3>Append script to document</h3>

<p>Add the qr-encoder.js right before the end of your &lt;body></p>

<h3>Using QR</h3>

<p>Access QR after page is loaded:</p>

<pre><code>window.onload = function(){
    // create config object
    // The following object configuration
    // creates a 500x500 red QR code with 
    // "Text to encode" as content
    // and rounded rectangles as unit shapes.
    var config = {
        text: "Text to encode",
        size: 500,
        border: 20,
        shape: "roundedRectangles",
        color: "red"
    };
    // set the qr code as image src 
    var img = document.getElementById("img_src");
    img.src = QR.encode(config);
}
</code></pre>

<h2>Known Limitations</h2>

<p>If you want use format: &ldquo;image/png&rdquo; it will only work in <strong>modern web browsers</strong> since HTML5 Canvas is required to generate the QR codes. If you want to generate a vector graphic using format: &ldquo;image/svg&rdquo; it should work in all common browsers. It only works for characters from the english language. Sometimes the border does not render exactly the configurated amount of pixels.</p>
