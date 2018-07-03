# booting

A simple async and parallel booting sequence for your applications. It provides
you with a clean structure to setup and configure you application. Because the
more stuff you need to do during boot, the deeper you callback xmas tree will
become and the less maintainable the code base becomes.

## Installation

The package is released to our public npm registry.

```js
npm install --save booting
```

## Usage

```js
var booting = require('booting');
```

The exposed `booting` function takes a single argument which is the data or
state that can be passed around to all your booting layers:

```js
var app = require('your app instance');
var boot = booting(app);
```

The function returns an object that contains the following methods:

- `use` A function to introduce a new boot sequence. The boot sequence should be
  a function that receives two arguments:
  1. The data that you passed in to the `booting` function
  2. Error first completion callback for when your task is finished executing.
- `start` Completion callback for when your boot sequences that your added using
  `use` are completed. The callback receives two arguments:
  1. Option error for when a boot sequence failed.
  2. The data that you passed in to the `booting` function.


So setting up a boot sequence would be as easy as:

```js
var booting = require('booting');
var app = require('./app');

booting(app)
.use(require('./preboot/config'))
.use(require('./preboot/database'))
.use(require('./preboot/server'))
.use(require('./preboot/phonehome'))
.start(function (err, app) {
  app.start();
})
```

## License

MIT
