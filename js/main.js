//Timer

//Logic (functional)
function main () {
  return {
    DOM : Rx.Observable.timer(0, 1000) // 0---1---2
    .map(function(i) { return "Second elapsed " + i ; }),
    Log: Rx.Observable.timer(0, 2000)
    .map(function (i) { return 2 * i ;})
  }
}

//Effects (imperative)
function DOMEffect ( text$ ) {
  text$.subscribe(function(text) {
    const container = document.querySelector("#timer");
    container.textContent = text;
  });
}
function ConsoleLogEffect( msg$ ) {
  msg$.subscribe(function (text) {
    console.log(text);
  })
}

// start app
const sink = main();
DOMEffect(sink.DOM);

ConsoleLogEffect(sink.Log);
