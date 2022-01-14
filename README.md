# cucumber-cypress-decorators

Adds typescript decorator support for use with [cypress-cucumber-preprocessor](https://github.com/TheBrainFamily/cypress-cucumber-preprocessor)

## Basic example

Assumes [cypress-cucumber-preprocessor](https://github.com/TheBrainFamily/cypress-cucumber-preprocessor) is installed and configured properly

**Feature file**

``` yaml
Feature: Simple maths
  To do maths
  As a developer
  I want to increment variables

  Scenario: easy maths
    Given a variable set to 1
    When I increment the variable by 1
    Then the variable should contain 2

  Scenario Outline: much more complex stuff
    Given a variable set to <var>
    When I increment the variable by <increment>
    Then the variable should contain <result>

    Examples:
      | var | increment | result |
      | 100 | 5         | 105    |
      | 99  | 1234      | 1333   |
      | 12  | 5         | 17     |
```
<br>
**Typescript integration file**

``` typescript
import { Feature, Given, Then, When } from 'cucumber-cypress-decorators'

@Feature('Simple maths')
export default class SimpleMath {
  variable: number = 0

  @Given('a variable set to {int}')
  setVariable(num) {
    this.variable = num
  }

  @When('I increment the variable by {int}')
  incrVariable(num) {
    this.variable = this.variable + num
  }

  @Then('the variable should contain {int}')
  assertValue(num) {
    expect(this.variable).to.equal(num)
  })
}
```

### Notes

* The step definitions using decorators are not executed until right before the test is executed.
* The feature name on the class decorator must match the Cucumber feature name or the step definitions will not be executed. eg. `@Feature('Simple maths')` works but `@Feature('Simple math')` will result in errors about missing step definitions.
* The class instance is recreated for each scenario so in this example `variable` always starts as `0` for each example.
* The library supports both uppercase and lowercase step names to match your preferred style. eg. `After, And, Before, But, Feature, Given, Then, When` or `after, and, before, but, feature, given, then, when`
* Multiple features per file hasn't been tested and probably won't work.

## Inheritance example

The library supports step definition inheritance if the class extends another class already using step deinition decorators.

**Feature file**

``` yaml
Feature: Complex maths
  To do maths
  As a developer
  I want to increment variables

  Scenario Outline: much more complex stuff
    Given a variable set to <var>
    When I increment the variable by <increment>
    And multiply it by 2 # <------ new step
    Then the variable should contain <result>

    Examples:
      | var | increment | result |
      | 100 | 5         | 210    |
      | 99  | 1234      | 2666   |
      | 12  | 5         | 34     |
```

**Typescript integration file**

``` typescript
import { Feature, Given, Then, When } from 'cucumber-cypress-decorators'

import SimpleMath from '../simple-math'

@Feature('Complex maths')
export class ComplexMath extends SimpleMath {
  @When('I increment the variable by {int}')
  incrVariables(num) {
    console.log('I am the same but different than the parent')
    this.variable = this.variable + num
  }

  @And('multiply it by 2')
  multiplyBy2() {
    this.variable = this.variable * 2
  }
}
```

### Notes

* If you define a step that has already been defined by a parent class the parent step definition will be ignored when the step definintions are executed.

## Vanilla step definition support

The library also supports vanilla step definitions using the same functions used for decorators to make life easy.

This example is functionally equivalent to the Simple maths example above

``` typescript
import { Feature, Given, Then, When } from 'cucumber-cypress-decorators'

let variable = 0

Given('a variable set to {int}', (num) => {
  variable = num
})

@Feature('Simple maths')
export default class SimpleMath {
  @When('I increment the variable by {int}')
  incrVariable(num) {
    variable = this.variable + num
  }
}

Then('the variable should contain {int}', (num) => {
  expect(variable).to.equal(num)
})
```

### Notes

* Vanilla step definitions are executed as soon as they are called like normal