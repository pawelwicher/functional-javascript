import _ from 'underscore';
import { always, aMap, as, best, butLast, cat, checker, condition1, construct, curry, curry2, cycle, defaults, dispatch, doWhen, existy, finder, flat, fnull, hasKeys, interpose, invoker, isa, isIndexed, isntString, iterateUntil, mapcat, myLength, nth, partial, partial1, partial2, pipeline, plucker, project, rename, repeatedly, restrict, stringReverse, tcLength, truthy, validator } from './lib';

describe('Lib', () => {

  it('existy should return proper result', () => {
    expect(existy(0)).toBeTruthy();
    expect(existy(1)).toBeTruthy();
    expect(existy({})).toBeTruthy();
    expect(existy([])).toBeTruthy();
    expect(existy(false)).toBeTruthy();
    expect(existy(undefined)).toBeFalsy();
  });

  it('truthy should return proper result', () => {
    expect(truthy(0)).toBeTruthy();
    expect(truthy(1)).toBeTruthy();
    expect(truthy({})).toBeTruthy();
    expect(truthy([])).toBeTruthy();
    expect(truthy(false)).toBeFalsy();
    expect(truthy(undefined)).toBeFalsy();
  });

  it('truthy should return proper result', () => {
    expect(doWhen(true, () => 1)).toEqual(1);
    expect(doWhen(false, () => 1)).toEqual(undefined);
  });


  it('isIndexed should return proper result', () => {
    expect(isIndexed([])).toBeTruthy();
    expect(isIndexed('abc')).toBeTruthy();
    expect(isIndexed(1)).toBeFalsy();
  });

  it('nth should return proper result', () => {
    expect(() => nth([1, 2, 3], 'abc')).toThrowError('expected number as index');
    expect(() => nth({ foo: 1 }, 1)).toThrowError('non-indexed type');
    expect(() => nth([1, 2, 3], 5)).toThrowError('index out of bounds');
    expect(nth([1, 2, 3], 1)).toEqual(2);
  });

  it('cat should return proper result', () => {
    expect(cat([1, 2, 3], [4, 5], [6, 7, 8])).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it('construct should return proper result', () => {
    expect(construct(42, [1, 2, 3])).toEqual([42, 1, 2, 3]);
  });

  it('mapcat should return proper result', () => {
    expect(mapcat(x => construct(x, [',']), [1, 2, 3])).toEqual([1, ',', 2, ',', 3, ',']);
  });

  it('butLast should return proper result', () => {
    expect(butLast([1, 2, 3])).toEqual([1, 2]);
  });

  it('interpose should return proper result', () => {
    expect(interpose(',', [1, 2, 3])).toEqual([1, ',', 2, ',', 3]);
  });

  it('project should return proper result', () => {
    const table = [
      { id: 1, name: 'abc', value: 42 },
      { id: 2, name: 'abd', value: 43 },
      { id: 3, name: 'abe', value: 44 }
    ];
    const expected = [
      { id: 1, value: 42 },
      { id: 2, value: 43 },
      { id: 3, value: 44 }
    ];
    expect(project(table, ['id', 'value'])).toEqual(expected);
  });

  it('rename should return proper result', () => {
    expect(rename({ a: 1, b: 2}, { 'a': 'foo'})).toEqual({ foo: 1, b: 2 });
  });

  it('as should return proper result', () => {
    const table = [
      { id: 1, name: 'abc', value: 42 },
      { id: 2, name: 'abd', value: 43 },
      { id: 3, name: 'abe', value: 44 }
    ];
    const expected = [
      { num: 1, name: 'abc', val: 42 },
      { num: 2, name: 'abd', val: 43 },
      { num: 3, name: 'abe', val: 44 }
    ];
    expect(as(table, {id: 'num', value: 'val'})).toEqual(expected);
  });

  it('restrict should return proper result', () => {
    const table = [
      { id: 1, name: 'abc', value: 42 },
      { id: 2, name: 'abd', value: 43 },
      { id: 3, name: 'abe', value: 44 }
    ];
    const expected = [
      { id: 2, name: 'abd', value: 43 },
      { id: 3, name: 'abe', value: 44 }
    ];
    expect(restrict(table, x => x.id > 1)).toEqual(expected);
  });

  it('project, as and restrict should return proper result', () => {
    const table = [
      { id: 1, name: 'abc', value: 42 },
      { id: 2, name: 'abd', value: 43 },
      { id: 3, name: 'abe', value: 44 }
    ];
    const expected = [
      { id: 2, code: 'abd' },
      { id: 3, code: 'abe' }
    ];
    const actual = restrict(
      project(
        as(table, { name: 'code'}),
        ['id', 'code']
      ),
      x => x.id > 1
    );
    expect(actual).toEqual(expected);
  });

  it('plucker should return proper result', () => {
    const pluckFoo = plucker('foo');
    expect(pluckFoo(null)).toEqual(null);
    expect(pluckFoo({ foo: 1, bar: 2})).toEqual(1);
  });

  it('finder should return proper result', () => {
    expect(finder(_.identity, Math.max, [1, 2, 3])).toEqual(3);
    const table = [
      { id: 1, name: 'abc', value: 42 },
      { id: 2, name: 'abd', value: 43 },
      { id: 3, name: 'abe', value: 44 }
    ];
    expect(finder(plucker('id'), Math.max, table)).toEqual({ id: 3, name: 'abe', value: 44 });
  });

  it('best should return proper result', () => {
    expect(best((x, y) => x > y, [1, 2, 3])).toEqual(3);
  });

  it('always should return proper result', () => {
    const always10 = always(10);
    expect(always10()).toEqual(10);
  });
  
  it('repeatedly should return proper result', () => {
    expect(repeatedly(3, n => 'id' + n)).toEqual(['id0', 'id1', 'id2']);
  });

  it('iterateUntil should return proper result', () => {
    const actual = iterateUntil(x => x + x, x => x <= 1024, 1);
    const expected = [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024];
    expect(actual).toEqual(expected);
  });

  it('invoker should return proper result', () => {
    const rev = invoker('reverse', Array.prototype.reverse);
    expect(rev([1, 2, 3])).toEqual([3, 2, 1]);
  });

  it('fnull should return proper result', () => {
    const mult: (x: any, y: any) => any = fnull((x, y) => x * y, 1, 1)
    expect(mult(2, 3)).toEqual(6);
    expect(mult(2, null)).toEqual(2);
    expect(mult(null, null)).toEqual(1);
  });

  it('defaults should return proper result', () => {
    const doSomething = (config) => {
      const lookup = defaults({ foo: 42 });
      return lookup(config, 'foo');
    }
    expect(doSomething({ foo: 100 })).toEqual(100);
    expect(doSomething({})).toEqual(42);
  });  

  it('aMap should return proper result', () => {
    expect(aMap({})).toBeTruthy();
    expect(aMap(1)).toBeFalsy();
  });

  it('hasKeys should return proper result', () => {
    const validator = hasKeys('foo', 'bar');
    expect(validator({ foo: 1, bar: 2 })).toBeTruthy();
    expect(validator({ foo: 1 })).toBeFalsy();
  });

  it('validator should return proper result', () => {
    const fun = validator('test message', x => x === 1);
    expect(fun(1)).toBeTruthy();
    expect(fun(2)).toBeFalsy();
    expect(fun.message).toEqual('test message');
  });

  it('checker should return proper result', () => {
    const checkcommand = checker(
      validator('must be a map', aMap),
      hasKeys('msg', 'type')
    );
    expect(checkcommand({ msg: 'foo', type: 'test' })).toEqual([]);
    expect(checkcommand(42)).toEqual(['must be a map', 'Must have keys: msg type']);
    expect(checkcommand({})).toEqual(['Must have keys: msg type']);
  });

  it('dispatch should return proper result', () => {
    const rev = dispatch(
      invoker('reverse', Array.prototype.reverse),
      stringReverse,
      always(42)
    );
    expect(rev([1, 2, 3])).toEqual([3, 2, 1]);
    expect(rev('abc')).toEqual('cba');
    expect(rev(123)).toEqual(42);
  });

  it('isa should return proper result', () => {
    const performCommand = dispatch(
      isa('sqr', obj => obj.arg * obj.arg),
      isa('abs', obj => Math.abs(obj.arg)),
      () => 42
    );
    expect(performCommand({ type: 'sqr', arg: 2 })).toEqual(4);
    expect(performCommand({ type: 'abs', arg: -2 })).toEqual(2);
    expect(performCommand({})).toEqual(42);
  });

  it('curry should return proper result', () => {
    const add10 = x => x + 10;
    const fun = curry(add10);
    expect(fun(5)).toEqual(15);
  });

  it('curry2 should return proper result', () => {
    const add = (x, y) => x + y;
    const add5 = curry2(add)(5);
    expect(add5(5)).toEqual(10);
  });

  it('partial1 should return proper result', () => {
    const add = (x, y) => x + y;
    const add10 = partial1(add, 10);
    expect(add10(5)).toEqual(15);
  });

  it('partial2 should return proper result', () => {
    const add = (x, y, z) => x + y + z;
    const add10Then20 = partial2(add, 10, 20);
    expect(add10Then20(5)).toEqual(35);
  });

  it('partial should return proper result', () => {
    const add = (a, b, c, d, e) => a + b + c + d + e;
    const partialAdd = partial(add, 1, 2, 3);
    expect(partialAdd(4, 5)).toEqual(15);
  });

  it('condition1 should return proper result', () => {
    const sqrPre = condition1(
      validator('arg must not be zero', x => x !== 0),
      validator('arg must be a number', _.isNumber)
    );
    const sqr = x => x * x;
    const checkedSqr = partial1(sqrPre, sqr);
    expect(checkedSqr(10)).toEqual(100);
    expect(() => checkedSqr('')).toThrowError('arg must be a number');
    expect(() => checkedSqr(0)).toThrowError('arg must not be zero');
  });

  it('isntString should return proper result', () => {
    expect(isntString(1)).toEqual(true);
    expect(isntString('foo')).toEqual(false);
  });

  it('compose should return proper result', () => {
    const sqrPre = condition1(
      validator('arg must not be 0', x => x !== 0),
      validator('arg must not be 1', x => x !== 1)
    );
    const sqrPost = condition1(
      validator('result must not be 4', x => x !== 4),
      validator('result must not be 100', x => x !== 100)
    );
    const sqr = x => x * x;
    const checkedSqr = _.compose(partial(sqrPost, _.identity), partial(sqrPre, sqr));
    expect(checkedSqr(5)).toEqual(25);
    expect(() => checkedSqr(0)).toThrowError('arg must not be 0');
    expect(() => checkedSqr(1)).toThrowError('arg must not be 1');
    expect(() => checkedSqr(2)).toThrowError('result must not be 4');
    expect(() => checkedSqr(10)).toThrowError('result must not be 100');
  });

  it('myLength should return proper result', () => {
    expect(myLength([])).toEqual(0);
    expect(myLength([1, 2, 3])).toEqual(3);
  });

  it('cycle should return proper result', () => {
    expect(cycle(3, [1, 2, 3])).toEqual([1, 2, 3, 1, 2, 3, 1, 2, 3]);
  });
  
  it('tcLength should return proper result', () => {
    expect(tcLength([], undefined)).toEqual(0);
    expect(tcLength([1, 2, 3], undefined)).toEqual(3);
  });

  it('flat should return proper result', () => {
    expect(flat([[1, 2], [3, 4]])).toEqual([1, 2, 3, 4]);
  });

  it('pipeline should return proper result', () => {
    expect(pipeline([2, 3, null, 1, 42, false], _.compact, _.initial, _.tail)).toEqual([3, 1]);
  });

});
