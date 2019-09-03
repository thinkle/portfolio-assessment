function get_user_prop (name) {
    return PropertiesService.getUserProperties().getProperty(name)
}

function get_user_props (names) {
    return PropertiesService.getUserProperties().getProperties(names)
}

function set_user_prop (name,val) {

    PropertiesService.getUserProperties().setProperty(name,val);

    var obj = {}
    obj[name] = val;
    return obj
}

function set_user_props (lookup) {
    for (var k in lookup) {
        set_user_prop(k,lookup[k]);
    }
    return {complete:true}
}

functions.get_user_prop = get_user_prop;
functions.get_user_props = get_user_props;
functions.set_user_prop = set_user_prop;
functions.set_user_props = set_user_props;
