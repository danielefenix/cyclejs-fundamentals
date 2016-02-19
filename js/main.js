//Timer

//source: input (read) effects
//sinks: output (write) effects

//Logic (functional)
function main (sources) {

  const inputEv$ = sources.DOM.select('.field').events('input');
  const name$ = inputEv$.map(function(ev){ return ev.target.value; }).startWith("World");

  const sinks =  {
    DOM : name$.map(
      function (name) {
        return  CycleDOM.div([
                CycleDOM.label('Name'),
                CycleDOM.input('.field', {type: 'input'}),
                CycleDOM.hr(),
                CycleDOM.h1("Hello " + name+ "!")
            ])
          })
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
