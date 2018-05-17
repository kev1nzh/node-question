function a () {
    console.log(1)
}

let b = (c, callback) => {
    console.log(c)
}

b(2, a())