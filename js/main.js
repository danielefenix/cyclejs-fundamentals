//Timer

//source: input (read) effects
//sinks: output (write) effects

//Logic (functional)
function main (sources) {

  const click$ = sources.DOM;

  const sinks =  {
    DOM : click$
      .startWith(null) //start with null click
      .flatMapLatest(function () {
        return Rx.Observable.timer(0, 1000).map(function(i) { return "Second elapsed " + i ; })
      }),
    Log: Rx.Observable.timer(0, 2000).map(function (i) { return 2 * i ;})
  }

  return sinks;
}

//Effects (imperative)
function DOMDriver ( text$ ) {
  text$.subscribe(function(text) {
    const container = document.querySelector("#timer");
    container.textContent = text;
  });
  const DOMSource = Rx.Observable.fromEvent(document, 'click');
  return DOMSource;
}

function consoleLogDriver( msg$ ) {
  msg$.subscribe(function (text) {
    console.log(text);
  });

}

// bProxy = ...
// a = f(bProxy)
// b = g(a)
// bProxy.imitate(b)
/*
function run(mainFn, drivers) {

  const proxySources = {};
  //create a proxySouce for each of the drivers to allow read effect
  Object.keys(drivers).forEach(function (key) {
    proxySources[key] = new Rx.Subject();
  });

  const sinks = mainFn(proxySources);

  //loop through the keyset of effect and pass the correspondent logic
  Object.keys(drivers).forEach(function (key) {
    const source = drivers[key](sinks[key]);
    source.subscribe(function (x) {
      proxySources[key].onNext(x);
    });
  });
}
run(main, drivers);
*/

const drivers = {
  DOM: DOMDriver,
  Log: consoleLogDriver
}

//Run app
Cycle.run(main, drivers);
