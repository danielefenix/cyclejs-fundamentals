//source: input (read) effects
//sinks: output (write) effects

// ==== HELLO WORLD
function helloWorldIntent(helloWorldDOMSource) {
    return helloWorldDOMSource.select('.field').events('input').map(function (ev) {
        return ev.target.value;
    })
}
function helloWorldModel(name$) {
    return name$.startWith('World');
}
function helloWorldView(name$) {

    return name$.map(
        function (name) {
            return CycleDOM.div([
                CycleDOM.label('Name'),
                CycleDOM.input('.field', {type: 'input'}),
                CycleDOM.p([
                    CycleDOM.label("Hello " + name + "!")
                ])
            ])
        })
}

// ==== COUNTER
function counterIntent(counterSource) {

    //Counter
    const decrementClick$ = counterSource.select('.decrement').events('click');
    const incrementClick$ = counterSource.select('.increment').events('click');
    const decrementAction$ = decrementClick$.map(function () {
        return -1
    });
    const incrementAction$ = incrementClick$.map(function () {
        return +1
    });

    return {
        decrementAction$: decrementAction$,
        incrementAction$: incrementAction$
    }
}
function counterModel(actions$) {

    return Rx.Observable.of(0)
        .merge(actions$.decrementAction$)
        .merge(actions$.incrementAction$)
        .scan(function (prev, curr) {
            return prev + curr;
        }); //keep state with prev (previous value)

}
function counterView(number$) {
    return number$.map(function (number) {
        return CycleDOM.div([
            CycleDOM.button('.decrement', 'Decrement'),
            CycleDOM.button('.increment', 'Increment'),
            CycleDOM.p([
                CycleDOM.label(String(number))
            ])
        ])
    })
}

// ==== HTTP DRIVER
//button clicked (DOM read effect)
//request sent (HTTP write effect)
//response received (HTTP read effect)
//data displayed (DOM write effect)
function httpDriverRequestIntent(httpDriverDomSource) {
    return httpDriverDomSource.select('.get-first').events('click');
}
function httpDriverRequestModel(clickEvent$) {

    return clickEvent$.map(function () {
        return {
            url: 'http://jsonplaceholder.typicode.com/users/1',
            method: 'GET'
        }
    })

}
function httpDriverResponseModel(httpDriverSource) {
    //stream of streams
    const response$$ = httpDriverSource.filter(function (response$) {
        return response$.request.url === 'http://jsonplaceholder.typicode.com/users/1'; //filter request that match the url
    });
    const response$ = response$$.switch();
    //First user
    return response$.map(function (res) {
        return res.body;
    }).startWith(null);

}
function httpDriverResponseView(firstUser$) {
    return firstUser$.map(function (firstUser) {
        return CycleDOM.div([
            CycleDOM.button('.get-first', 'Get first user'),
            firstUser === null ? null : CycleDOM.div('.user-details', [
                CycleDOM.h2('.user-name', firstUser.name),
                CycleDOM.h4('.user-email', firstUser.email),
                CycleDOM.a('.user-website', {href: 'http://google.com'}, firstUser.website)
            ])

        ])
    });
}

// ==== BMI
//detect slider change (DOM read effect)
//calculate BMI (logic)
//display BMI (DOM write effect)
function bmiIntent(bmiDomSource) {
    const changeWeight$ = bmiDomSource.select('.weight').events('input').map(function (ev) {
        return ev.target.value;
    });
    const changeHeight$ = bmiDomSource.select('.height').events('input').map(function (ev) {
        return ev.target.value;
    });

    return {changeWeight$: changeWeight$, changeHeight$: changeHeight$};
}
function bmiModel(changes$) {
    const changeWeight$ = changes$.changeWeight$;
    const changeHeight$ = changes$.changeHeight$;
    return Rx.Observable.combineLatest(
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
}
function bmiView(state$) {
    return state$.map(function (state) {
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

}

//Logic (functional)
function main(sources) {

    // ==== HELLO WORLD
    var values$ = helloWorldIntent(sources.HELLO_WORLD_DOM);
    var names$ = helloWorldModel(values$);
    var helloWorldVTree$ = helloWorldView(names$);

    // ==== COUNTER
    const counterActions$ = counterIntent(sources.COUNTER_DOM);
    const number$ = counterModel(counterActions$);
    const counterVTree$ = counterView(number$);

    // ==== HTTP DRIVER
    const clickEvent$ = httpDriverRequestIntent(sources.HTTP_DRIVER_DOM);
    const request$ = httpDriverRequestModel(clickEvent$);
    const firstUser$ = httpDriverResponseModel(sources.HTTP);
    const httpVTree$ = httpDriverResponseView(firstUser$);

    // ==== BMI
    const changes$ = bmiIntent(sources.BMI_DOM);
    const state$ = bmiModel(changes$);
    const bmiVTree$ = bmiView(state$);

    const sinks = {
        HELLO_WORLD_DOM: helloWorldVTree$,
        COUNTER_DOM: counterVTree$,
        HTTP: request$,
        HTTP_DRIVER_DOM: httpVTree$,
        BMI_DOM: bmiVTree$
    };

    return sinks;
}

//Effects (imperative)
const drivers = {
    HELLO_WORLD_DOM: CycleDOM.makeDOMDriver("#hello"),
    COUNTER_DOM: CycleDOM.makeDOMDriver("#counter"),
    HTTP: CycleHTTPDriver.makeHTTPDriver(),
    HTTP_DRIVER_DOM: CycleDOM.makeDOMDriver("#http"),
    BMI_DOM: CycleDOM.makeDOMDriver("#bmi")
};

//Run app
Cycle.run(main, drivers);
