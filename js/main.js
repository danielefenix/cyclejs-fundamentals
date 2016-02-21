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

// ==== BMI (isolated component)
function LabeledIntent(DOMSource) {
    return DOMSource.select('.slider').events('input')
        .map(function (ev) {
            return ev.target.value;
        })
}
function LabeledModel(newValues$, props$) {
    const initValues$ = props$.map(function (props) {
        return props.init;
    }).first();
    const values$ = initValues$.concat(newValues$);
    return Rx.Observable.combineLatest(values$, props$, function (value, props) {
        return {
            label: props.label,
            unit: props.unit,
            min: props.min,
            max: props.max,
            value: value
        }
    })
}
function LabeledView(state$) {
    return state$.map(function (state) {
        return CycleDOM.div('.labeled-slider', [
            CycleDOM.label(state.label + ': ' + state.value + state.unit),
            CycleDOM.input('.slider', {type: 'range', min: state.min, max: state.max, value: state.value})
        ])
    })
}
function LabeledSlider(sources) {
    const change$ = LabeledIntent(sources.DOM);
    const state$ = LabeledModel(change$, sources.props);
    const vTree$ = LabeledView(state$);
    return {
        DOM: vTree$,
        value: state$.map(function (state) {
            return state.value;
        })
    }
}
function IsolatedLabeledSlider(sources) {
    return CycleIsolate(LabeledSlider)(sources);
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
    const weightProps$ = Rx.Observable.of({
        label: 'Weight',
        unit: 'kg',
        min: 40,
        max: 150,
        init: 70
    });
    const weightSinks = IsolatedLabeledSlider({
        DOM: sources.BMI_DOM,
        props: weightProps$
    });
    const weightVTree$ = weightSinks.DOM;
    const weightValue$ = weightSinks.value;

    const heightProps$ = Rx.Observable.of({
        label: 'Height',
        unit: 'cm',
        min: 140,
        max: 220,
        init: 170
    });
    const heightSinks = IsolatedLabeledSlider({
        DOM: sources.BMI_DOM,
        props: heightProps$
    });
    const heightVTree$ = heightSinks.DOM;
    const heightValue$ = heightSinks.value;

    const bmi$ = Rx.Observable.combineLatest(weightValue$, heightValue$, function (weight, height) {
        const heightMeters = height * 0.01;
        return Math.round(weight / (heightMeters * heightMeters));
    });

    const bmiVTree$ = Rx.Observable.combineLatest(
        bmi$, weightVTree$, heightVTree$, function (bmi, weightVTree, heightVTree) {
            return CycleDOM.div([
                weightVTree,
                heightVTree,
                CycleDOM.h2('BMI is ' + bmi)
            ])
        }
    );

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
