//Timer

//source: input (read) effects
//sinks: output (write) effects

//Logic (functional)
function main (sources) {

  const mouseover$ = sources.DOM.selectEvents('span', 'mouseover');

  const sinks =  {
    DOM : mouseover$
      .startWith(null) //start with null click
      .flatMapLatest(function () {
        return Rx.Observable.timer(0, 1000).map(function(i) {
          return {
            tagName: "H1",
            children: [
              {
                tagName: "SPAN",
                children : [
                  "Seconds elapsed " + i
                ]
              }
            ]
          } ;
        })
      }),
    Log: Rx.Observable.timer(0, 2000).map(function (i) { return 2 * i ;})
  }

  return sinks;
}

//Effects (imperative)
function DOMDriver ( obj$ ) {

  function createElement(obj) {
      const element= document.createElement(obj.tagName);

      obj.children
      .filter(function (c) {
          return typeof c === 'object';
      })
      .map(createElement)
      .forEach(function(c) {
        element.appendChild(c);
      });

      obj.children
      .filter(function (c) {
          return typeof c === 'string';
      })
      .forEach(function (c) {
          return element.innerHTML += c;
      });

      return element;
  }

  obj$.subscribe(function(obj) {
    const container = document.querySelector("#timer");
    const element = createElement(obj);
    container.innerHTML = ''; //empty container
    container.appendChild(element);

  });

  const DOMSource = {
    selectEvents : function (tagName, eventType) {
      return Rx.Observable.fromEvent(document, eventType)
        .filter(function (ev) {
          return ev.target.tagName === tagName.toUpperCase();
        });
    }
  }
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
