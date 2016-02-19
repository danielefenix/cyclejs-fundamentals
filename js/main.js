//Timer

//source: input (read) effects
//sinks: output (write) effects

//Logic (functional)
function main (DOMSource) {

  const click$ = DOMSource;

  return {
    DOM : click$
      .startWith(null) //start with null click
      .flatMapLatest(function () {
        return Rx.Observable.timer(0, 1000).map(function(i) { return "Second elapsed " + i ; })
      }),
    Log: Rx.Observable.timer(0, 2000).map(function (i) { return 2 * i ;})
  }
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
  })
}

// bProxy = ...
// a = f(bProxy)
// b = g(a)
// bProxy.imitate(b)

function run(mainFn, drivers) {
  const proxyDOMSource = new Rx.Subject();
  const sinks = mainFn(proxyDOMSource);
  const DOMSource = drivers.DOM(sinks.DOM);

  DOMSource.subscribe(function (click) {
    proxyDOMSource.onNext(click);
  })

  //loop through the keyset of effect and pass the correspondent logic
  //Object.keys(drivers).forEach(function (key) {
  //  effects[key](sinks[key]);
  //})
}

const drivers = {
  DOM: DOMDriver,
  Log: consoleLogDriver
}

//Run app
run(main, drivers);
