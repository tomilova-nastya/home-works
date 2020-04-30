/* ДЗ 2 - работа с массивами и объектами */

/*
 Задание 1:

 Напишите аналог встроенного метода forEach для работы с массивами
 Посмотрите как работает forEach и повторите это поведение для массива, который будет передан в параметре array
 */
function forEach(array, fn) {
    for (let i = 0; i < array.length; i++ ) {
        fn(array[i], i, array);
    }
}

/*
 Задание 2:

 Напишите аналог встроенного метода map для работы с массивами
 Посмотрите как работает map и повторите это поведение для массива, который будет передан в параметре array
 */
function map(array, fn) {
    let resultArray = [];

    for (let i = 0; i < array.length; i++ ) {
        resultArray.push(fn(array[i], i, array));
    }

    return resultArray;
}

/*
 Задание 3:

 Напишите аналог встроенного метода reduce для работы с массивами
 Посмотрите как работает reduce и повторите это поведение для массива, который будет передан в параметре array
 */
function reduce(array, fn, initial) {
    let previousValue = initial;
    let counter = 0;

    if (initial === undefined) {
        previousValue = array[0];
        counter = 1;
    }

    while (counter < array.length) {
        previousValue = fn(previousValue, array[counter], counter, array);
        counter++;
    }

    return previousValue;
}

/*
 Задание 4:

 Функция должна перебрать все свойства объекта, преобразовать их имена в верхний регистр и вернуть в виде массива

 Пример:
   upperProps({ name: 'Сергей', lastName: 'Петров' }) вернет ['NAME', 'LASTNAME']
 */
function upperProps(obj) {
    let result = [];

    for (let propName in obj) {
        if (obj.hasOwnProperty(propName)) {
            result.push(propName.toUpperCase());
        }
    }

    return result;
}

/*
 Задание 5 *:

 Напишите аналог встроенного метода slice для работы с массивами
 Посмотрите как работает slice и повторите это поведение для массива, который будет передан в параметре array
 */
function slice(array, from, to) {
    if (from < 0) {
        from = array.length + from;
    }
    if (to < 0) {
        to = array.length + to;
    }

    if (from === undefined || from < 0) {
        from = 0;
    }
    if (to === undefined || to > array.length) {
        to = array.length;
    }

    let result = [];

    for (let i = from; i < to; i++) {
        result.push(array[i]);
    }

    return result;
}

/*
 Задание 6 *:

 Функция принимает объект и должна вернуть Proxy для этого объекта
 Proxy должен перехватывать все попытки записи значений свойств и возводить это значение в квадрат
*/
function createProxy(obj) {
    return new Proxy(obj, {
        set(target, prop, val) {
            return target[prop] = val * val;
        }
    });
}

export {
    forEach,
    map,
    reduce,
    upperProps,
    slice,
    createProxy
};