'use strict';

var once = require('one-time');

/**
 * Simple async boot sequence for applications. So we have a cleaner and more
 * maintainable API to work with.
 *
 * @param {Object} data Initial source of data that needs to be shared
 * @returns {Object} Middleware and finish function.
 * @public
 */
module.exports = function booting(data) {
  var waiting = 0;      // Amount of layers we're waiting to finish.
  var completion;       // Completion callback.
  var err;              // Potential errors that occurred in the execution sequence.

  /**
   * Check if we are ready to execute the completion function.
   *
   * @private
   */
  function ready() {
    //
    // Everything is executed, and we're no longer waiting for items to
    // execute so we can safely call our completion callback.
    //
    if (waiting === 0 && completion) {
      completion(err, data);
    }
  }

  return {
    /**
     * Introduce another boot sequence to the flow.
     *
     * @param {Function} next The sequence that we want to execute.
     * @returns {This} For chaining purposes.
     * @public
     */
    use: function use(next) {
      //
      // Special edge case, we have received an error already, so we know that
      // our boot sequence has already failed so we don't need to execute this
      // sequence either because we should just fail.
      //
      if (err) return this;

      /**
       * Async execution handler to ensure that our completion callback is
       * called in case of unexpected failure.
       *
       * @param {Error} [failed] Optional error callback.
       * @private
       */
      var done = once(function done(failed) {
        waiting--;

        //
        // Don't override existing failures.
        //
        if (failed && !err) err = failed;
        ready();
      });

      if (next.length > 1) {
        waiting++;
        next.call(this, data, done);

        return this;
      }

      //
      // There could be 2 reasons why received a function with a single arg
      //
      // 1. This is a sync function, and does not want to handle a callback
      // 2. It's a returns a Promise, which is also the case for async/await.
      //
      try {
        var promised = next.call(this, data);

        if (promised instanceof Promise && typeof promised.then === 'function') {
          waiting++;
          promised.then(done, done);
        }
      } catch (e) {
        if (!err) err = e;
      }

      ready();
      return this;
    },

    /**
     * Callback that needs to be called once all boot sequences have been
     * executed. We assume that the callback follows an error first callback
     * pattern.
     *
     * @param {Function} done Completion callback.
     * @returns {This} For chaining purposes.
     * @public
     */
    start: function start(done) {
      completion = once(done);

      ready();
      return this;
    }
  };
};
