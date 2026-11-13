/* Runs before first paint: applies the saved theme (if any) and marks the page as JS-enabled,
   so there is no flash of the wrong theme and scroll reveals only apply when scripts work. */
(function(){
  var root = document.documentElement;
  root.classList.add('js');
  try{
    var saved = window.localStorage.getItem('nm-theme');
    if(saved === 'light' || saved === 'dark') root.setAttribute('data-theme', saved);
  }catch(e){ /* storage blocked: follow the system theme */ }
})();
