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
        })
    };

    return sinks;
}

//Effects (imperative)
const drivers = {
    HELLO_WORLD: CycleDOM.makeDOMDriver("#hello"),
    COUNTER: CycleDOM.makeDOMDriver("#counter"),
    HTTP: CycleHTTPDriver.makeHTTPDriver(),
    HTTP_DOM: CycleDOM.makeDOMDriver("#http-dom")
};

//Run app
Cycle.run(main, drivers);
