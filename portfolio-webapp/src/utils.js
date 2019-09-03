function classNames (obj) {
    var out = [];
    for (var className in obj) {
        if (obj[className]) {
            out.push(className);
        }
    }
    return out.join(' ');
}

export  {classNames}
