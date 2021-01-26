//return a fn that accepts a fn, then it executes that fn and passes any errors to next
//wrapper for async fns
module.exports = func => {
    return (req, res, next) => {
        func(req, res, next).catch(next);
    }
}