import { customTag } from '../../html';

function ensureFn(maybeFn) {
  if (typeof maybeFn === 'function') return maybeFn;
  return (e) => maybeFn || e;
}

customTag('await',
  function Await(props) {
    let placeholderTimeout;
    let {
      src,
      waitMs,
      transform = e => e,
      error = e => e,
      placeholder = 'Loading..',
      value = null,
      loaded = false
    } = props;

    if (!(src &&
      (src instanceof Promise || src.constructor.name === 'LazyPromise')
    )) {
      console.warn('[Radi] <await/> must have `src` as a Promise');
      return null;
    }

    if (!loaded) {
      if (placeholder !== value) {
        if (waitMs) {
          placeholderTimeout = setTimeout(() => {
            this.update({ ...props, value: placeholder });
          }, waitMs);
        } else {
          value = placeholder;
        }
      }

      src
        .then((value) => {
          clearTimeout(placeholderTimeout);
          this.update({ ...props, value: ensureFn(transform)(value), loaded: true });
        })
        .catch((err) => {
          clearTimeout(placeholderTimeout);
          this.update({ ...props, value: ensureFn(error)(err), loaded: true });
        })
    }

    return value;
  }
);
