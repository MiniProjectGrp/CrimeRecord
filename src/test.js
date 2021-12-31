
const fun = (name) => {
    console.log("hi " + name);
};

console.log(fun);

fun("Vasu");

function compute(data, next) {
    console.log(data);
    next();
}
