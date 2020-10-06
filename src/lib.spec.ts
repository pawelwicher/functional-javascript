const _ = require('underscore');
const lib = require('./lib');

describe('Lib', () => {

  it('existy should return proper result', () => {
    expect(lib.existy(0)).toBeTruthy();
    expect(lib.existy(1)).toBeTruthy();
    expect(lib.existy({})).toBeTruthy();
    expect(lib.existy([])).toBeTruthy();
    expect(lib.existy(false)).toBeTruthy();
    expect(lib.existy(undefined)).toBeFalsy();
  });

  it('truthy should return proper result', () => {
    expect(lib.truthy(0)).toBeTruthy();
    expect(lib.truthy(1)).toBeTruthy();
    expect(lib.truthy({})).toBeTruthy();
    expect(lib.truthy([])).toBeTruthy();
    expect(lib.truthy(false)).toBeFalsy();
    expect(lib.truthy(undefined)).toBeFalsy();
  });

  it('truthy should return proper result', () => {
    expect(lib.doWhen(true, () => 1)).toEqual(1);
    expect(lib.doWhen(false, () => 1)).toEqual(undefined);
  });


  it('isIndexed should return proper result', () => {
    expect(lib.isIndexed([])).toBeTruthy();
    expect(lib.isIndexed('abc')).toBeTruthy();
    expect(lib.isIndexed(1)).toBeFalsy();
  });

  it('nth should return proper result', () => {
    expect(() => lib.nth([1, 2, 3], 'abc')).toThrowError('expected number as index');
    expect(() => lib.nth({ foo: 1 }, 1)).toThrowError('non-indexed type');
    expect(() => lib.nth([1, 2, 3], 5)).toThrowError('index out of bounds');
    expect(lib.nth([1, 2, 3], 1)).toEqual(2);
  });

  it('cat should return proper result', () => {
    expect(lib.cat([1, 2, 3], [4, 5], [6, 7, 8])).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it('construct should return proper result', () => {
    expect(lib.construct(42, [1, 2, 3])).toEqual([42, 1, 2, 3]);
  });

  it('mapcat should return proper result', () => {
    expect(lib.mapcat(x => lib.construct(x, [',']), [1, 2, 3])).toEqual([1, ',', 2, ',', 3, ',']);
  });

  it('butLast should return proper result', () => {
    expect(lib.butLast([1, 2, 3])).toEqual([1, 2]);
  });

  it('interpose should return proper result', () => {
    expect(lib.interpose(',', [1, 2, 3])).toEqual([1, ',', 2, ',', 3]);
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
    expect(lib.project(table, ['id', 'value'])).toEqual(expected);
  });

  it('rename should return proper result', () => {
    expect(lib.rename({ a: 1, b: 2}, { 'a': 'foo'})).toEqual({ foo: 1, b: 2 });
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
    expect(lib.as(table, {id: 'num', value: 'val'})).toEqual(expected);
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
    expect(lib.restrict(table, x => x.id > 1)).toEqual(expected);
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
    const actual = lib.restrict(
      lib.project(
        lib.as(table, { name: 'code'}),
        ['id', 'code']
      ),
      x => x.id > 1
    );
    expect(actual).toEqual(expected);
  });

  it('plucker should return proper result', () => {
    const pluckFoo = lib.plucker('foo');
    expect(pluckFoo(null)).toEqual(null);
    expect(pluckFoo({ foo: 1, bar: 2})).toEqual(1);
  });

  it('finder should return proper result', () => {
    expect(lib.finder(_.identity, Math.max, [1, 2, 3])).toEqual(3);
    const table = [
      { id: 1, name: 'abc', value: 42 },
      { id: 2, name: 'abd', value: 43 },
      { id: 3, name: 'abe', value: 44 }
    ];
    expect(lib.finder(lib.plucker('id'), Math.max, table)).toEqual({ id: 3, name: 'abe', value: 44 });
  });

  it('best should return proper result', () => {
    expect(lib.best((x, y) => x > y, [1, 2, 3])).toEqual(3);
  });

  it('always should return proper result', () => {
    const always10 = lib.always(10);
    expect(always10()).toEqual(10);
  });
  
  it('repeatedly should return proper result', () => {
    expect(lib.repeatedly(3, n => 'id' + n)).toEqual(['id0', 'id1', 'id2']);
  });

  it('iterateUntil should return proper result', () => {
    const actual = lib.iterateUntil(x => x + x, x => x <= 1024, 1);
    const expected = [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024];
    expect(actual).toEqual(expected);
  });

  it('invoker should return proper result', () => {
    const rev = lib.invoker('reverse', Array.prototype.reverse);
    expect(rev([1, 2, 3])).toEqual([3, 2, 1]);
  });

  it('fnull should return proper result', () => {
    const mult = lib.fnull((x, y) => x * y, 1, 1)
    expect(mult(2, 3)).toEqual(6);
    expect(mult(2, null)).toEqual(2);
    expect(mult(null, null)).toEqual(1);
  });

  it('defaults should return proper result', () => {
    const doSomething = (config) => {
      const lookup = lib.defaults({ foo: 42 });
      return lookup(config, 'foo');
    }
    expect(doSomething({ foo: 100 })).toEqual(100);
    expect(doSomething({})).toEqual(42);
  });  

  it('aMap should return proper result', () => {
    expect(lib.aMap({})).toBeTruthy();
    expect(lib.aMap(1)).toBeFalsy();
  });

  it('hasKeys should return proper result', () => {
    const validator = lib.hasKeys('foo', 'bar');
    expect(validator({ foo: 1, bar: 2 })).toBeTruthy();
    expect(validator({ foo: 1 })).toBeFalsy();
  });

  it('validator should return proper result', () => {
    const fun = lib.validator('test message', x => x === 1);
    expect(fun(1)).toBeTruthy();
    expect(fun(2)).toBeFalsy();
    expect(fun.message).toEqual('test message');
  });

  it('checker should return proper result', () => {
    const checkcommand = lib.checker(
      lib.validator('must be a map', lib.aMap),
      lib.hasKeys('msg', 'type')
    );
    expect(checkcommand({ msg: 'foo', type: 'test' })).toEqual([]);
    expect(checkcommand(42)).toEqual(['must be a map', 'Must have keys: msg type']);
    expect(checkcommand({})).toEqual(['Must have keys: msg type']);
  });

  it('dispatch should return proper result', () => {
    const rev = lib.dispatch(
      lib.invoker('reverse', Array.prototype.reverse),
      lib.stringReverse,
      lib.always(42)
    );
    expect(rev([1, 2, 3])).toEqual([3, 2, 1]);
    expect(rev('abc')).toEqual('cba');
    expect(rev(123)).toEqual(42);
  });

  it('isa should return proper result', () => {
    const performCommand = lib.dispatch(
      lib.isa('sqr', obj => obj.arg * obj.arg),
      lib.isa('abs', obj => Math.abs(obj.arg)),
      () => 42
    );
    expect(performCommand({ type: 'sqr', arg: 2 })).toEqual(4);
    expect(performCommand({ type: 'abs', arg: -2 })).toEqual(2);
    expect(performCommand({})).toEqual(42);
  });

  it('curry should return proper result', () => {
    const add10 = x => x + 10;
    const fun = lib.curry(add10);
    expect(fun(5)).toEqual(15);
  });

  it('curry2 should return proper result', () => {
    const add = (x, y) => x + y;
    const add5 = lib.curry2(add)(5);
    expect(add5(5)).toEqual(10);
  });

  it('partial1 should return proper result', () => {
    const add = (x, y) => x + y;
    const add10 = lib.partial1(add, 10);
    expect(add10(5)).toEqual(15);
  });

  it('partial2 should return proper result', () => {
    const add = (x, y, z) => x + y + z;
    const add10Then20 = lib.partial2(add, 10, 20);
    expect(add10Then20(5)).toEqual(35);
  });

  it('partial should return proper result', () => {
    const add = (a, b, c, d, e) => a + b + c + d + e;
    const partialAdd = lib.partial(add, 1, 2, 3);
    expect(partialAdd(4, 5)).toEqual(15);
  });

  it('condition1 should return proper result', () => {
    const sqrPre = lib.condition1(
      lib.validator('arg must not be zero', x => x !== 0),
      lib.validator('arg must be a number', _.isNumber)
    );
    const sqr = x => x * x;
    const checkedSqr = lib.partial1(sqrPre, sqr);
    expect(checkedSqr(10)).toEqual(100);
    expect(() => checkedSqr('')).toThrowError('arg must be a number');
    expect(() => checkedSqr(0)).toThrowError('arg must not be zero');
  });

  it('isntString should return proper result', () => {
    expect(lib.isntString(1)).toEqual(true);
    expect(lib.isntString('foo')).toEqual(false);
  });

  it('compose should return proper result', () => {
    const sqrPre = lib.condition1(
      lib.validator('arg must not be 0', x => x !== 0),
      lib.validator('arg must not be 1', x => x !== 1)
    );
    const sqrPost = lib.condition1(
      lib.validator('result must not be 4', x => x !== 4),
      lib.validator('result must not be 100', x => x !== 100)
    );
    const sqr = x => x * x;
    const checkedSqr = _.compose(lib.partial(sqrPost, _.identity), lib.partial(sqrPre, sqr));
    expect(checkedSqr(5)).toEqual(25);
    expect(() => checkedSqr(0)).toThrowError('arg must not be 0');
    expect(() => checkedSqr(1)).toThrowError('arg must not be 1');
    expect(() => checkedSqr(2)).toThrowError('result must not be 4');
    expect(() => checkedSqr(10)).toThrowError('result must not be 100');
  });

  it('myLength should return proper result', () => {
    expect(lib.myLength([])).toEqual(0);
    expect(lib.myLength([1, 2, 3])).toEqual(3);
  });

  it('cycle should return proper result', () => {
    expect(lib.cycle(3, [1, 2, 3])).toEqual([1, 2, 3, 1, 2, 3, 1, 2, 3]);
  });
  
  it('tcLength should return proper result', () => {
    expect(lib.tcLength([], undefined)).toEqual(0);
    expect(lib.tcLength([1, 2, 3], undefined)).toEqual(3);
  });

  it('flat should return proper result', () => {
    expect(lib.flat([[1, 2], [3, 4]])).toEqual([1, 2, 3, 4]);
  });

  it('pipeline should return proper result', () => {
    expect(lib.pipeline([2, 3, null, 1, 42, false], _.compact, _.initial, _.tail)).toEqual([3, 1]);
  });

});
