module.exports = {
  hrdiff: function(t1, t2) {
    var s = t2[0] - t1[0];
    var mms = t2[1] - t1[1];
    return s*1e9 + mms;
  },
  epoch: function(){
    var date = new Date;
    return Math.floor(date.getTime() / 1000)
  }
};