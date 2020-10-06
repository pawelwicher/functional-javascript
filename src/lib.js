const _ = require('underscore');

function fail(thing) {
  throw Error(thing);
}

function existy(x) {
  return x != null;
}

function truthy(x) {
  return x !== false && existy(x);
}

function doWhen(cond, action) {
  if (truthy(cond)) {
    return action();
  } else {
    return undefined;
  }
}

function isIndexed(x) {
  return _.isArray(x) || _.isString(x);
}

function nth(a, index) {
  if (!_.isNumber(index)) {
    fail('expected number as index');
  }
  if (!isIndexed(a)) {
    fail('non-indexed type');
  }
  if (index < 0 || index > a.length - 1) {
    fail('index out of bounds');
  }
  return a[index];
}

function second(a) {
  return nth(a, 1);
} 

function cat(...args) {
  const head = _.first(args);
  if (existy(head)) {
    return head.concat(... _.rest(args));
  } else {
    return [];
  }
}

function construct(head, tail) {
  return cat([head], _.toArray(tail));
}

function mapcat(fun, coll) {
  return cat(... _.map(coll, fun));
}

function butLast(coll) {
  return _.toArray(coll).slice(0, -1);
}

function interpose(inter, coll) {
  return butLast(mapcat(x => construct(x, [inter]), coll));
}

function project(table, keys) {
  return _.map(table, x => _.pick(x, keys))
}

function rename(obj, newNames) {
  return _.reduce(newNames, (o, nu, old) => {
    if (_.has(obj, old)) {
      o[nu] = obj[old];
    }
    return o;
  },
  _.omit(obj, _.keys(newNames)));
}

function as(table, newNames) {
  return _.map(table, x => rename(x, newNames));
}

function restrict(table, pred) {
  return _.reduce(table, (newTable, obj) => {
    if (truthy(pred(obj))) {
      return newTable
    } else {
      return _.without(newTable, obj);
    }
  },
  table);
}

function plucker(field) {
  return function(obj) {
    return obj && obj[field];
  }
}

function finder(valueFun, bestFun, coll) {
  return _.reduce(coll, (best, current) => {
    const bestValue = valueFun(best);
    const currentValue = valueFun(current);
    return bestValue === bestFun(bestValue, currentValue) ? best : current;
  });
}

function best(fun, coll) {
  return _.reduce(coll, (x, y) => fun(x, y) ? x : y);
}

function always(value) {
  return function() {
    return value;
  }
}

function repeatedly(times, fun) {
  return _.map(_.range(times), fun);
}

function iterateUntil(fun, check, init) {
  const ret = [];
  let result = fun(init);

  while (check(result)) {
    ret.push(result);
    result = fun(result);
  }

  return ret;
}

function invoker(name, method) {
  return function(target, ...args) {
    if (!existy(target)) {
      fail('must provide target');
    }
    const targetMethod = target[name];
    return doWhen((existy(targetMethod) && method === targetMethod), () => targetMethod.apply(target, args));
  }
}

function fnull(fun, ... defaults) {
  return (... args) => fun(... _.map(args, (arg, i) => existy(arg) ? arg : defaults[i]));
}

function defaults(d) {
  return function(o, k) {
    const val = fnull(_.identity, d[k]);
    return o && val(o[k]);
  };
}

function aMap(obj) {
  return _.isObject(obj);
}

function hasKeys(... keys) {
  const fun = function(obj) {
    return _.every(keys, k => _.has(obj, k));
  };
  fun.message = cat(['Must have keys:'], keys).join(' ');
  return fun;
}

function validator(message, fun) {
  const f = function(... args) {
    return fun(... args);
  };
  f.message = message;
  return f;
}

function checker(... validators) {
  return function(obj) {
    return _.reduce(validators, (errs, check) => {
      if (check(obj)) {
        return errs;
      } else {
        return _.chain(errs).push(check.message).value();
      }
    }, []);
  };
}

function dispatch(... funs) {
  const size = funs.length;

  return function(target, ... args) {
    let ret = undefined;

    for (let funIndex = 0; funIndex < size; funIndex++) {
      const fun = funs[funIndex];
      ret = fun(target, ... args);

      if (existy(ret)) {
        return ret;
      }
    }

    return ret;
  }
}

function stringReverse(s) {
  if (_.isString(s)) {
    return s.split('').reverse().join('');
  }
}

function isa(type, action) {
  return function(obj) {
    if (type === obj.type) {
      return action(obj);
    }
  }
}

function curry(fun) {
  return function(arg) {
    return fun(arg);
  }
}

function curry2(fun) {
  return function(secondArg) {
    return function(firstArg) {
      return fun(firstArg, secondArg);
    }
  }
}

function partial1(fun, arg1) {
  return function(... args) {
    args = construct(arg1, args);
    return fun(... args);
  }
}

function partial2(fun, arg1, arg2) {
  return function(... args) {
    args = cat([arg1, arg2], args);
    return fun(... args);
  }
}

function partial(fun, ... args) {
  return function(... pargs) {
    return fun(... [...args, ...pargs]);
  }
}

function condition1(... validators) {
  return function(fun, arg) {
    const errors = mapcat(isValid => isValid(arg) ? [] : [isValid.message], validators);

    if (!_.isEmpty(errors)) {
      throw Error(errors.join(', '));
    }

    return fun(arg);
  }
}

function not(x) {
  return !x;
}

const isntString = _.compose(not, _.isString);

function myLength(arr) {
  if (_.isEmpty(arr)) {
    return 0;
  } else {
    return 1 + myLength(_.tail(arr));
  } 
}

function cycle(times, arr) {
  if (times <= 0) {
    return [];
  } else {
    return cat(arr, cycle(times - 1, arr));
  }
}

function tcLength(arr, n) {
  const l = n ? n : 0;

  if (_.isEmpty(arr)) {
    return l;
  } else {
    return tcLength(_.tail(arr), l + 1);
  } 
}

function flat(arr) {
  if (_.isArray(arr)) {
    return cat(... _.map(arr, flat));
  } else {
    return [arr];
  }
}

function pipeline(seed, ... funs) {
  return _.reduce(funs, (l, r) => r(l), seed);
}

module.exports = {
  always, aMap, as, best, butLast, cat, checker, condition1, construct, curry, curry2, cycle, defaults, dispatch, doWhen, existy, finder, flat, fnull, hasKeys, interpose, invoker, isa, isIndexed, isntString, iterateUntil, mapcat, myLength, nth, partial, partial1, partial2, pipeline, plucker, project, rename, repeatedly, restrict, stringReverse, tcLength, truthy, validator
}