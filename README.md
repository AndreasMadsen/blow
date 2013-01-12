#blow

> Very simple binding between mocha and your browser.

##Install

```shell
npm install -g blow
```

##Example

```shell
$blow --listen=localhost:11000 test/*
blow server online at http://127.0.0.1:11000
```

You can then run all tests by opening `http://127.0.0.1:11000` in your browser.
Asuming that you have seperated your tests intro files, you can run a subset
of tests by pointing your browser to `http://127.0.0.1:11000/filename.js`

##Use

```
Usage:

blow OPTIONS [test files]

  Start blow test server

  OPTIONS:

    --listen    Default to 0.0.0.0:0, that means it will listen to all network
                interfaces and pick a random port.

    --style     Default to bdd, see the mocha documentation for more mocha
                styles.

    --index     Default see below, this is the template there will be used
                for createing test pages. By changeing this you can include
                scripts and other html elements, that you can use for testing.
                Note that scripts can be included by specifing a relative path
                from the index.html file to a .js file.
                (e.q. <script src="../script.js"></script>)
```

**Default index.html file**

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
