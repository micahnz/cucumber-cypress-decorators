import * as Cucumber from 'cypress-cucumber-preprocessor/steps'
import { decorateFeature, decorateStep } from './decorators'

// register class by feature name for use with decorators
export const Feature = decorateFeature

// create decorators from cypress-cucumber-preprocessor steps
export const After = decorateStep(Cucumber.After)
export const And = decorateStep(Cucumber.And)
export const Before = decorateStep(Cucumber.Before)
export const But = decorateStep(Cucumber.But)
export const Given = decorateStep(Cucumber.Given)
export const Then = decorateStep(Cucumber.Then)
export const When = decorateStep(Cucumber.When)

// lower case support for personal preference
export const after = After
export const and = And
export const before = Before
export const but = But
export const feature = Feature
export const given = Given
export const then = Then
export const when = When
