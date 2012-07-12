#blow

> Very simple binding between mocha and your browser.

##Install

```shell
npm install -g blow
```

##Use

The blow server is started with `blow`.

You can the input in your testcases with `blow test/*` or whatever you directory
name may be.

There are a few options there too.

#### port

By default the port is random, however you can set it with:

* `--port=number`
* `-p=number`

#### address

By default the address is `0.0.0.0` but you can set it with

* `--address=ip/name`
* `-a=ip/name`

#### style

By default the mocha teststyle is `bdd`, but you can set it with

* `--style=mochaStyleName`
* `-s=mochaStyleName`

#### index

By default the template file is the following:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title></title>
</head>
<body>
  <div id="mocha"></div>
</body>
</html>
```

However you may wich to include the some script files, to do that simply
use the following pattern:

```html
<!DOCTYPE html>
<html>
<head>
  <script src="../somefile.js"></script>
</head>
<body>
</body>
</html>
```

Blow will then transform the template file, to it points the correct file, relative
to your template file.

To set the template file, simply use:

* `--index=test/index.html`
* `-i=test/index.html`

##License

**The software is license under "MIT"**

> Copyright (c) 2012 Andreas Madsen
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in
> all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
> THE SOFTWARE.
