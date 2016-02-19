//Timer

//source: input (read) effects
//sinks: output (write) effects

//Logic (functional)
function main (sources) {

  const mouseover$ = sources.DOM.select('span').events('mouseover');

  const sinks =  {
    DOM : mouseover$
      .startWith(null) //start with null click
      .flatMapLatest(function () {
        return Rx.Observable.timer(0, 1000).map(
          function(i) {
            return CycleDOM.h1({style: { background: 'red'}}, [ CycleDOM.span(["Seconds elapsed " + i]) ])
          })
      }),
    Log: Rx.Observable.timer(0, 2000).map(function (i) { return 2 * i ;})
  }

  return sinks;
}

//Effects (imperative)
function consoleLogDriver( msg$ ) {
  msg$.subscribe(function (text) {
    console.log(text);
  });

}

// bProxy = ...
// a = f(bProxy)
// b = g(a)
// bProxy.imitate(b)

const drivers = {
  DOM: CycleDOM.makeDOMDriver("#timer"),
  Log: consoleLogDriver
}

//Run app
Cycle.run(main, drivers);
