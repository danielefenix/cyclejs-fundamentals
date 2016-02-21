//Timer

//source: input (read) effects
//sinks: output (write) effects

//Logic (functional)
function main(sources) {

    //Hello world
    const inputEv$ = sources.HELLO_WORLD.select('.field').events('input');
    const name$ = inputEv$.map(function (ev) {
        return ev.target.value;
    }).startWith("World");

    //Counter
    const decrementClick$ = sources.COUNTER.select('.decrement').events('click');
    const incrementClick$ = sources.COUNTER.select('.increment').events('click');
    const decremenetAction$ = decrementClick$.map(function () {
        return -1
    });
    const incremenetAction$ = incrementClick$.map(function () {
        return +1
    });
    const number$ = Rx.Observable.of(0)
        .merge(decremenetAction$)
        .merge(incremenetAction$)
        .scan(function (prev, curr) {
            return prev + curr;
        }); //keep state with prev (previous value)

    // ---- Http driver
    //button clicked (DOM read effect)
    //request sent (HTTP write effect)
    //response received (HTTP read effect)
    //data displayed (DOM write effect)
    const clickEvent$ = sources.HTTP_DOM.select('.get-first').events('click');

    const request$ = clickEvent$.map(function () {
        return {
            url: 'http://jsonplaceholder.typicode.com/users/1',
            method: 'GET'
        }
    });

    //stream of streams
    const response$$ = sources.HTTP.filter(function (response$) {
        return response$.request.url === 'http://jsonplaceholder.typicode.com/users/1'; //filter request that match the url
    });
    const response$ = response$$.switch();
    const firstUser$ = response$.map(function (res) {
        return res.body;
    }).startWith(null);

    //----- Body-mass calculator
    //detect slider change (DOM read effect)
    //calculate BMI (logic)
    //display BMI (DOM write effect)
    const changeWeight$ = sources.BMI_DOM.select('.weight').events('input').map(function (ev) {
        return ev.target.value;
    });
    const changeHeight$ = sources.BMI_DOM.select('.height').events('input').map(function (ev) {
        return ev.target.value;
    });

    //logic
    const state$ = Rx.Observable.combineLatest(
        changeWeight$.startWith(70),
        changeHeight$.startWith(170),
        function (weight, height) {
            const heightMeters = height * 0.01;
            const bmi = Math.round(weight / (heightMeters * heightMeters));
            return {
                bmi: bmi,
                weight: weight,
                height: height
            };
        }
    );

    const sinks = {
        HELLO_WORLD: name$.map(
            function (name) {
                return CycleDOM.div([
                    CycleDOM.label('Name'),
                    CycleDOM.input('.field', {type: 'input'}),
                    CycleDOM.p([
                        CycleDOM.label("Hello " + name + "!")
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
        }),
        HTTP: request$,
        HTTP_DOM: firstUser$.map(function (firstUser) {
            return CycleDOM.div([
                CycleDOM.button('.get-first', 'Get first user'),
                firstUser === null ? null : CycleDOM.div('.user-details', [
                    CycleDOM.h2('.user-name', firstUser.name),
                    CycleDOM.h4('.user-email', firstUser.email),
                    CycleDOM.a('.user-website', {href: 'http://google.com'}, firstUser.website)
                ])

            ])
        }),
        BMI_DOM: state$.map(function (state) {
            return CycleDOM.div([
                CycleDOM.div([
                    CycleDOM.label('Weight: ' + state.weight + 'kg'),
                    CycleDOM.input('.weight', {type: 'range', min: 40, max: 150, value: state.weight})
                ]),
                CycleDOM.div([
                    CycleDOM.label('Height: ' + state.height + 'cm'),
                    CycleDOM.input('.height', {type: 'range', min: 140, max: 220, value: state.height})
                ]),
                CycleDOM.h4('BMI is ' + state.bmi)
            ])
        })
    };

    return sinks;
}

//Effects (imperative)
const drivers = {
    HELLO_WORLD: CycleDOM.makeDOMDriver("#hello"),
    COUNTER: CycleDOM.makeDOMDriver("#counter"),
    HTTP: CycleHTTPDriver.makeHTTPDriver(),
    HTTP_DOM: CycleDOM.makeDOMDriver("#http-dom"),
    BMI_DOM: CycleDOM.makeDOMDriver("#bmi")
};

//Run app
Cycle.run(main, drivers);
