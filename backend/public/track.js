/* City Bike Tours visitor counter. No cookies, no personal data stored.
   Add to any page:  <script defer src="https://YOUR-BACKEND/track.js"></script> */
(function () {
  var api = new URL(document.currentScript.src).origin + "/api/track";
  var last = "";
  function send() {
    var path = location.pathname;
    if (path === last) return;
    last = path;
    try {
      fetch(api, {
        method: "POST", keepalive: true, headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: path, referrer: document.referrer, host: location.host }),
      }).catch(function () {});
    } catch (e) {}
  }
  var push = history.pushState;
  history.pushState = function () { push.apply(this, arguments); setTimeout(send, 0); };
  window.addEventListener("popstate", send);
  send();
})();
