// Tracker Client
var trackerServer = "%{TRACKER_SERVER_URL}",
    clientID = null,
    visitID = null,
    firstTimeVisitor = false;

var trackJSPrivate = {
  _init: function(){
    visitID = sessionStorage.getItem("UUID");
    if(visitID === null){
      visitID = this._guid();
      sessionStorage.setItem("UUID", visitID);
    }
    clientID = localStorage.getItem("UUID");
    if(clientID === null){
      clientID = this._guid();
      // localStorage.setItem("UUID", clientID);
      firstTimeVisitor = true;
    }
    if(firstTimeVisitor){
      this._firstTimeVisitor();
    }
  },
  _guid: function() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
                 .toString(16)
                 .substring(1);
    }
    return s4() + s4() + s4() + s4() + s4() + s4() + s4() + s4();
  },
  _firstTimeVisitor: function(){
    navigator.sayswho = (function(){
      var ua= navigator.userAgent, tem,
      M= ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*([\d\.]+)/i) || [];
      if(/trident/i.test(M[1])){
        tem=  /\brv[ :]+(\d+(\.\d+)?)/g.exec(ua) || [];
        return 'IE '+(tem[1] || '');
      }
      M= M[2]? [M[1], M[2]]:[navigator.appName, navigator.appVersion, '-?'];
      if((tem= ua.match(/version\/([\.\d]+)/i))!== null) M[2]= tem[1];
      return M;
    })();
    var data = [];
    data.push(navigator.sayswho[0]);
    data.push(navigator.sayswho[1]);
    data.push(navigator.cookieEnabled);
    data.push(navigator.language || navigator.userLanguage);
    var screenSize = '';
    if (screen.width) {
      width = (screen.width) ? screen.width : '';
      height = (screen.height) ? screen.height : '';
      screenSize += '' + width + "x" + height;
    }
    data.push(screenSize);
    var os = "unknown";
    var nAgt = navigator.userAgent;
    var clientStrings = [
      {s:'Windows 3.11', r:/Win16/},
      {s:'Windows 95', r:/(Windows 95|Win95|Windows_95)/},
      {s:'Windows ME', r:/(Win 9x 4.90|Windows ME)/},
      {s:'Windows 98', r:/(Windows 98|Win98)/},
      {s:'Windows CE', r:/Windows CE/},
      {s:'Windows 2000', r:/(Windows NT 5.0|Windows 2000)/},
      {s:'Windows XP', r:/(Windows NT 5.1|Windows XP)/},
      {s:'Windows Server 2003', r:/Windows NT 5.2/},
      {s:'Windows Vista', r:/Windows NT 6.0/},
      {s:'Windows 7', r:/(Windows 7|Windows NT 6.1)/},
      {s:'Windows 8.1', r:/(Windows 8.1|Windows NT 6.3)/},
      {s:'Windows 8', r:/(Windows 8|Windows NT 6.2)/},
      {s:'Windows NT 4.0', r:/(Windows NT 4.0|WinNT4.0|WinNT|Windows NT)/},
      {s:'Windows ME', r:/Windows ME/},
      {s:'Android', r:/Android/},
      {s:'Open BSD', r:/OpenBSD/},
      {s:'Sun OS', r:/SunOS/},
      {s:'Linux', r:/(Linux|X11)/},
      {s:'iOS', r:/(iPhone|iPad|iPod)/},
      {s:'Mac OS X', r:/Mac OS X/},
      {s:'Mac OS', r:/(MacPPC|MacIntel|Mac_PowerPC|Macintosh)/},
      {s:'QNX', r:/QNX/},
      {s:'UNIX', r:/UNIX/},
      {s:'BeOS', r:/BeOS/},
      {s:'OS/2', r:/OS\/2/},
      {s:'Search Bot', r:/(nuhk|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask Jeeves\/Teoma|ia_archiver)/}
    ];
    for (var id in clientStrings) {
      var cs = clientStrings[id];
      if (cs.r.test(nAgt)) {
        os = cs.s;
        break;
      }
    }
    var osVersion = "unknown";
    if (/Windows/.test(os)) {
      osVersion = /Windows (.*)/.exec(os)[1];
      os = 'Windows';
    }
    switch (os) {
      case 'Mac OS X':
        osVersion = /Mac OS X (10[\.\_\d]+)/.exec(nAgt)[1];
        break;

      case 'Android':
        osVersion = /Android ([\.\_\d]+)/.exec(nAgt)[1];
        break;

      case 'iOS':
        osVersion = /OS (\d+)_(\d+)_?(\d+)?/.exec(nVer);
        osVersion = osVersion[1] + '.' + osVersion[2] + '.' + (osVersion[3] | 0);
        break;
    }
    data.push(os);
    data.push(osVersion);
    data.push(/Mobile|mini|Fennec|Android|iP(ad|od|hone)/.test(navigator.appVersion));
    this._makeServiceCall("newClient", data);
  },
  _makeServiceCall: function(callPath, data){
    callPath = 'http://'+trackerServer+'/'+callPath+"?d="+data.join("~")+"&c="+clientID+"&v="+visitID;
    console.log("SERVICE CALL: "+callPath);
    script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = callPath;
    document.getElementsByTagName('head')[0].appendChild(script);
  }
};

var trackJS = {

};

trackJSPrivate._init();