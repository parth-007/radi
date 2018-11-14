import { Subscribe } from './Subscribe';

/**
 * @param {Promise} resolver
 * @param {Function} success
 * @param {Function} error
 * @param {boolean} instant
 * @returns {Store}
 */
export function Fetcher(resolver, success, error, instant = false) {
  let init = false;
  let trigger = () => {};
  let data = null;

  if (typeof resolver !== 'function') {
    throw new Error(`[Radi.js] Fetcher first parameter must be function that returns promise`);
  }

  function promiseSubscriber(value, next) {
    trigger = next;
    if (instant && !init) {
      init = true;
      CustomSubscribe.fetch();
    }
  }

  function CustomSubscribe(defaultValue) {
    return Subscribe(promiseSubscriber)(defaultValue);
  }

  CustomSubscribe.fetch = function fetch(...args) {
    if (data !== null) return;

    trigger({loading: true});

    resolver(...args)
      .then(success || ((output) => {
        data = output;
        trigger(output);
      }))
      .catch(error || ((error) => {
        trigger({ error });
        console.error(error);
      }));
  }

  return CustomSubscribe;
}
