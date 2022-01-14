// feature instance
let instance = null

// all decorated steps
const steps = []

// loaded expressions
const expressions = []

// decorate a feature class
export const decorateFeature = (name?: string) => {
  return function (target: any) {
    target.feature = name

    // load assertions for current feature
    before(() => {
      const [currentFeature] = Cypress.currentTest.titlePath

      if (!instance && currentFeature === target.feature) {
        // load steps for feature and parent features
        steps.forEach(([feature, expression, step]) => {
          if (
            target === feature.constructor ||
            target.prototype instanceof feature.constructor
          ) {
            // prevent expression duplication
            if (expressions.indexOf(expression) === -1) {
              expressions.push(expression)
              step()
            }
          }
        })
      }
    })

    // create a fresh instance before each scenario
    beforeEach(() => {
      const [currentFeature] = Cypress.currentTest.titlePath

      if (!instance && currentFeature === target.feature) {
        instance = new target()
      }
    })

    // clear the instance after each scenario
    afterEach(() => {
      instance = null
    })
  }
}

type Implementation = (...args: any[]) => void

// create a step decorator for a cucumber assertion
export const decorateStep =
  (step) =>
  (
    expression: RegExp | string | Implementation,
    implementation?: Implementation
  ) => {
    if (typeof expression === 'function' || implementation) {
      implementation ? step(expression, implementation) : step(expression)
    } else {
      return function (target: any, propertyKey: string) {
        steps.unshift([
          target,
          expression,
          () =>
            step(expression, (...args) => {
              instance[propertyKey](...args)
            })
        ])
      }
    }
  }
