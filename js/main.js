//Timer

//Logic (functional)
Rx.Observable.timer(0, 1000) // 0---1---2
  .map(function(i) { return "Second elapsed " + i ; })


  //Effects (imperative)
  .subscribe(function(text) {
    const container = document.querySelector("#timer");
    container.textContent = text;
  });
