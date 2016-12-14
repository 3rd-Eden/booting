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

      waiting++;
      next.call(this, data, once(function done(failed) {
        waiting--;

        //
        // Don't override existing failures.
        //
        if (failed && !err) err = failed;

        //
        // Everything is executed, and we're no longer waiting for items to
        // execute so we can safely call our completion callback.
        //
        if (waiting === 0 && completion) {
          completion(err, data);
        }
      }));

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

      //
      // Boot sequence was already done with executing, so we can call our
      // completion callback.
      //
      if (waiting === 0) {
        completion(err, data);
      }

      return this;
    }
  };
};
