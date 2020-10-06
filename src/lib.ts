import _ from 'underscore';

function fail(thing) {
  throw Error(thing);
}

export function existy(x) {
  return x != null;
}

export function truthy(x) {
  return x !== false && existy(x);
}

export function doWhen(cond, action) {
  if (truthy(cond)) {
    return action();
  } else {
    return undefined;
  }
}

export function isIndexed(x) {
  return _.isArray(x) || _.isString(x);
}

export function nth(a, index) {
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

export function second(a) {
  return nth(a, 1);
} 

export function cat(...args: any[]) {
  const head = _.first(args);
  if (existy(head)) {
    return head.concat(... _.rest(args));
  } else {
    return [];
  }
}

export function construct(head, tail) {
  return cat([head], _.toArray(tail));
}

export function mapcat(fun, coll) {
  return cat(... _.map(coll, fun));
}

export function butLast(coll) {
  return _.toArray(coll).slice(0, -1);
}

export function interpose(inter, coll) {
  return butLast(mapcat(x => construct(x, [inter]), coll));
}

export function project(table, keys) {
  return _.map(table, x => _.pick(x, keys))
}

export function rename(obj, newNames) {
  return _.reduce(newNames, (o, nu, old) => {
    if (_.has(obj, old)) {
      o[nu] = obj[old];
    }
    return o;
  },
  _.omit(obj, _.keys(newNames)));
}

export function as(table, newNames) {
  return _.map(table, x => rename(x, newNames));
}

export function restrict(table, pred) {
  return _.reduce(table, (newTable, obj) => {
    if (truthy(pred(obj))) {
      return newTable
    } else {
      return _.without(newTable, obj);
    }
  },
  table);
}

export function plucker(field) {
  return function(obj) {
    return obj && obj[field];
  }
}

export function finder(valueFun, bestFun, coll) {
  return _.reduce(coll, (best, current) => {
    const bestValue = valueFun(best);
    const currentValue = valueFun(current);
    return bestValue === bestFun(bestValue, currentValue) ? best : current;
  });
}

export function best(fun, coll) {
  return _.reduce(coll, (x, y) => fun(x, y) ? x : y);
}

export function always(value) {
  return function() {
    return value;
  }
}

export function repeatedly(times, fun) {
  return _.map(_.range(times), fun);
}

export function iterateUntil(fun, check, init) {
  const ret = [];
  let result = fun(init);

  while (check(result)) {
    ret.push(result);
    result = fun(result);
  }

  return ret;
}

export function invoker(name, method) {
  return function(target, ...args: any[]) {
    if (!existy(target)) {
      fail('must provide target');
    }
    const targetMethod = target[name];
    return doWhen((existy(targetMethod) && method === targetMethod), () => targetMethod.apply(target, args));
  }
}

export function fnull(fun, ... defaults: any[]) {
  return (... args: any[]) => fun(... _.map(args, (arg, i) => existy(arg) ? arg : defaults[i]));
}

export function defaults(d) {
  return function(o, k) {
    const val = fnull(_.identity, d[k]);
    return o && val(o[k]);
  };
}

export function aMap(obj) {
  return _.isObject(obj);
}

export function hasKeys(... keys: any[]) {
  const fun = function(obj) {
    return _.every(keys, k => _.has(obj, k));
  };
  fun.message = cat(['Must have keys:'], keys).join(' ');
  return fun;
}

export function validator(message, fun) {
  const f = function(... args: any[]) {
    return fun(... args);
  };
  f.message = message;
  return f;
}

export function checker(... validators: any[]) {
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

export function dispatch(... funs: any[]) {
  const size = funs.length;

  return function(target, ... args: any[]) {
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

export function stringReverse(s) {
  if (_.isString(s)) {
    return s.split('').reverse().join('');
  }
}

export function isa(type, action) {
  return function(obj) {
    if (type === obj.type) {
      return action(obj);
    }
  }
}

export function curry(fun) {
  return function(arg) {
    return fun(arg);
  }
}

export function curry2(fun) {
  return function(secondArg) {
    return function(firstArg) {
      return fun(firstArg, secondArg);
    }
  }
}

export function partial1(fun, arg1) {
  return function(... args: any[]) {
    args = construct(arg1, args);
    return fun(... args);
  }
}

export function partial2(fun, arg1, arg2) {
  return function(... args: any[]) {
    args = cat([arg1, arg2], args);
    return fun(... args);
  }
}

export function partial(fun, ... args: any[]) {
  return function(... pargs: any[]) {
    return fun(... [...args, ...pargs]);
  }
}

export function condition1(... validators: any[]) {
  return function(fun, arg) {
    const errors = mapcat(isValid => isValid(arg) ? [] : [isValid.message], validators);

    if (!_.isEmpty(errors)) {
      throw Error(errors.join(', '));
    }

    return fun(arg);
  }
}

export function not(x) {
  return !x;
}

export const isntString = _.compose(not, _.isString);

export function myLength(arr) {
  if (_.isEmpty(arr)) {
    return 0;
  } else {
    return 1 + myLength(_.tail(arr));
  } 
}

export function cycle(times, arr) {
  if (times <= 0) {
    return [];
  } else {
    return cat(arr, cycle(times - 1, arr));
  }
}

export function tcLength(arr, n) {
  const l = n ? n : 0;

  if (_.isEmpty(arr)) {
    return l;
  } else {
    return tcLength(_.tail(arr), l + 1);
  } 
}

export function flat(arr) {
  if (_.isArray(arr)) {
    return cat(... _.map(arr, flat));
  } else {
    return [arr];
  }
}

export function pipeline(seed, ... funs: any[]) {
  return _.reduce(funs, (l, r) => r(l), seed);
}
