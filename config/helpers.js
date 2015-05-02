module.exports = {
  serialize: function (d) {
    return JSON.stringify(d);
  },
  if: function (d, e, options) {

    if (e && e.fn) { options = e; e = -1; }

    console.log(d, e);
    if (d && e == -1) {
      return options.fn(this);
    } else if (d == e) {
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  }
}
