// feature instance
let instance = null;

// all decorated steps
const steps = [];

// loaded expressions
const expressions = [];

export interface FeatureOptions {
  stopOnFailure: boolean;
}

// decorate a feature class
export const decorateFeature = (
  name: string,
  options: FeatureOptions = {
    stopOnFailure: true,
  }
) => {
  return function (target: any) {
    target.feature = name;

    // load assertions for current feature
    before(function () {
      const [currentFeature] = Cypress.currentTest.titlePath;

      if (!instance && currentFeature === target.feature) {
        // load steps for feature and parent features
        steps.forEach(([feature, expression, step]) => {
          if (
            target === feature.constructor ||
            target.prototype instanceof feature.constructor
          ) {
            // prevent expression duplication
            if (expressions.indexOf(expression) === -1) {
              expressions.push(expression);
              step();
            }
          }
        });
      }
    });

    // create a fresh instance before each scenario
    beforeEach(function () {
      const [currentFeature] = Cypress.currentTest.titlePath;

      if (!instance && currentFeature === target.feature) {
        instance = new target();
      }
    });

    // clear the instance after each scenario
    afterEach(function () {
      instance = null;

      if (options.stopOnFailure && this.currentTest.state === "failed") {
        // @ts-expect-error
        Cypress.runner.stop();
      }
    });
  };
};

type Implementation = (...args: any[]) => void;

// create a step decorator for a cucumber assertion
export const decorateStep =
  (step) =>
  (
    expression: RegExp | string | Implementation,
    implementation?: Implementation
  ) => {
    if (typeof expression === "function" || implementation) {
      implementation ? step(expression, implementation) : step(expression);
    } else {
      return function (target: any, propertyKey: string) {
        steps.unshift([
          target,
          expression,
          () =>
            step(expression, (...args) => {
              instance[propertyKey](...args);
            }),
        ]);
      };
    }
  };
