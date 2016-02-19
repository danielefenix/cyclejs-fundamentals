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
function DOMDriver ( text$ ) {
  text$.subscribe(function(text) {
    const container = document.querySelector("#timer");
    container.textContent = text;
  });
}

function consoleLogDriver( msg$ ) {
  msg$.subscribe(function (text) {
    console.log(text);
  })
}

function run(mainFn, effects) {
  const sinks = mainFn();
  //loop through the keyset of effect and pass the correspondent logic
  Object.keys(effects).forEach(function (key) {
    effects[key](sinks[key]);
  })
}

const drivers = {
  DOM: DOMDriver,
  Log: consoleLogDriver
}

//Run app
run(main, drivers);
