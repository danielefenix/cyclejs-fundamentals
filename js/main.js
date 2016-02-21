//Timer

//source: input (read) effects
//sinks: output (write) effects

//Logic (functional)
function main (sources) {

    //Hello world
    const inputEv$ = sources.HELLO_WORLD.select('.field').events('input');
    const name$ = inputEv$.map(function(ev){ return ev.target.value; }).startWith("World");

    //Counter
    const decrementClick$ = sources.COUNTER.select('.decrement').events('click');
    const incrementClick$ = sources.COUNTER.select('.increment').events('click');
    const decremenetAction$ = decrementClick$.map(function () { return -1});
    const incremenetAction$ = incrementClick$.map(function () { return +1});
    const number$ = Rx.Observable.of(0)
        .merge(decremenetAction$)
        .merge(incremenetAction$)
        .scan( function (prev, curr) { return prev + curr; }); //keep state with prev (previous value)


    const sinks =  {

      HELLO_WORLD : name$.map(
          function (name) {
            return  CycleDOM.div([
                        CycleDOM.label('Name'),
                        CycleDOM.input('.field', {type: 'input'}),
                        CycleDOM.p([
                            CycleDOM.label("Hello " + name+ "!")
                        ])
                    ])
              }),
      COUNTER: number$.map(function (number) {
          return CycleDOM.div([
                      CycleDOM.button('.decrement', 'Decrement'),
                      CycleDOM.button('.increment', 'Increment'),
                      CycleDOM.p([
                          CycleDOM.label(String(number))
                      ])
                  ])
        })
  };

  return sinks;
}

//Effects (imperative)
const drivers = {
    HELLO_WORLD: CycleDOM.makeDOMDriver("#hello"),
    COUNTER : CycleDOM.makeDOMDriver("#counter")
};

//Run app
Cycle.run(main, drivers);
