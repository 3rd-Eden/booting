'use strict';

var assume = require('assume');
var booting = require('./');

describe('booting', function () {
  it('is exposed as function', function () {
    assume(booting).is.a('function');
  });

  it('returns an object on execution', function () {
    assume(booting()).is.a('object');
    assume(booting().use).is.a('function');
    assume(booting().start).is.a('function');
  });

  describe('use', function () {
    it('receives the inital supplied data as first argument', function (next) {
      var boot = booting('what');

      boot.use(function (what, done) {
        assume(what).equals('what');
        assume(done).is.a('function');

        next();
      });
    });

    it('returns it self for chaining', function () {
      var boot = booting('what');

      assume(boot.use(function () {})).equals(boot);
    });

    it('doesnt call another boot sequence if the previous one failed', function () {
      var boot = booting('data');

      boot
      .use(function (data, next) {
        next(new Error('failed'));
      })
      .use(function (data, next) {
        throw new Error('I should fail');
      });
    });

    it('can introduce another boot using `this`', function (next) {
      var boot = booting('data');

      boot.use(function () {
        assume(this.use).equals(boot.use);

        this.use(function (data, done) {
          next();
        });
      });
    });
  });

  describe('start', function () {
    it('is called when there are no boot sequences to execute', function (next) {
      booting().start(next);
    });

    it('receives the supplied data as second argument', function (next) {
      booting('data').start(function (err, data) {
        assume(err).is.a('undefined');
        assume(data).equals('data');

        next();
      });
    });

    it('receives an error as first argument when a sequenced failed', function (next) {
      booting('data')
      .use(function (data, next) {
        next(new Error('testing'));
      })
      .start(function (err) {
        assume(err.message).equals('testing');
        next();
      });
    });

    it('is called once the boot layers are done', function (next) {
      var start = Date.now();
      var seq = [];

      booting()
      .use(function (data, done) {
        setTimeout(function () {
          seq.push(1);
          done();
        }, 100);
      })
      .use(function (data, done) {
        setTimeout(function () {
          seq.push(2);
          done();
        }, 200);
      })
      .use(function (data, done) {
        setTimeout(function () {
          seq.push(3);
          done();
        }, 300);
      })
      .use(function (data, done) {
        setTimeout(function () {
          seq.push(4);
          done();
        }, 400);
      })
      .use(function (data, done) {
        setTimeout(function () {
          seq.push(5);
          done();
        }, 500);
      })
      .use(function (data, done) {
        setTimeout(function () {
          seq.push(6);
          done();
        }, 600);
      })
      .use(function (data, done) {
        setTimeout(function () {
          seq.push(7);
          done();
        }, 700);
      })
      .start(function () {
        var taken = Date.now() - start;

        assume(taken).within(600, 800);
        assume(seq).deep.equals([1,2,3,4,5,6,7]);

        next();
      });
    });
  });
});
