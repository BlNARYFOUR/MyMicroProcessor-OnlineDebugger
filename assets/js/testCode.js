"use strict";

function partition(array, low, high) {
    let beginHighIndex = high;
    let pVal = array[beginHighIndex];
    high--;

    while(low < high) {
        while(array[low] <= pVal && low < high) {
            low++;
        }

        while(pVal <= array[high] && low < high) {
            high--;
        }

        let buf = array[low];
        array[low] = array[high];
        array[high] = buf;
    }

    if(pVal < array[low]) {
        array[beginHighIndex] = array[low];
        array[low] = pVal;
    }

    return low;
}

function quickSort(array, low, high) {
    if(low < high) {
        let pi = partition(array, low, high);

        quickSort(array, low, pi - 1);
        quickSort(array, pi + 1, high);
    }
}

function sort(array) {
    quickSort(array, 0, array.length - 1);
}