import * as babel from '@babel/core';
import { describe, it, expect } from 'vitest';

import reactEffectNamerPlugin from '../index';
import {
  generateAnonymousFunctionEffectComponent,
  generateAnonymousFunctionEffectCustomHook,
  generateArrowFunctionEffectComponent,
  generateMultipleEffectsComponent,
  generateMultipleTypesOfEffectsComponent,
  generateNamedFunctionEffectComponent,
} from './utils';

describe('useEffect', () => {
  it('should transform anonymous useEffect arrow function callback into named function', () => {
    const inputCode = generateArrowFunctionEffectComponent('useEffect');

    const { code } =
      babel.transformSync(inputCode, {
        filename: 'MyComponent.jsx',
        plugins: [reactEffectNamerPlugin],
        presets: ['@babel/preset-react'],
      }) || {};

    expect(code).toContain('const MyComponent_useEffect_1 =');
    expect(code).toContain('useEffect(MyComponent_useEffect_1,');
  });

  it('should transform anonymous useEffect anonymous function callback into named function', () => {
    const inputCode = generateAnonymousFunctionEffectComponent('useEffect');

    const { code } =
      babel.transformSync(inputCode, {
        filename: 'MyComponent.jsx',
        plugins: [reactEffectNamerPlugin],
        presets: ['@babel/preset-react'],
      }) || {};

    expect(code).toContain('function MyComponent_useEffect_1()');
    expect(code).toContain('useEffect(MyComponent_useEffect_1,');
  });

  it('should transform multiple effects', () => {
    const inputCode = generateMultipleEffectsComponent('useEffect');

    const { code } =
      babel.transformSync(inputCode, {
        filename: 'MyComponent.jsx',
        plugins: [reactEffectNamerPlugin],
        presets: ['@babel/preset-react'],
      }) || {};

    expect(code).toContain('useEffect(MyComponent_useEffect_1,');
    expect(code).toContain('useEffect(MyComponent_useEffect_2,');
  });

  it('should not transform if callback already has a name', () => {
    const inputCode = generateNamedFunctionEffectComponent('useEffect');

    const { code } =
      babel.transformSync(inputCode, {
        filename: 'MyComponent.jsx',
        plugins: [reactEffectNamerPlugin],
        presets: ['@babel/preset-react'],
      }) || {};

    expect(code).toContain('namedCallback');
    expect(code).not.toContain('MyComponent_useEffect_1');
  });
});

describe('useLayoutEffect', () => {
  it('should transform anonymous useLayoutEffect arrow function callback into named function', () => {
    const inputCode = generateArrowFunctionEffectComponent('useLayoutEffect');

    const { code } =
      babel.transformSync(inputCode, {
        filename: 'MyComponent.jsx',
        plugins: [reactEffectNamerPlugin],
        presets: ['@babel/preset-react'],
      }) || {};

    expect(code).toContain('const MyComponent_useLayoutEffect_1 =');
    expect(code).toContain('useLayoutEffect(MyComponent_useLayoutEffect_1,');
  });

  it('should transform anonymous useLayoutEffect anonymous function callback into named function', () => {
    const inputCode = generateAnonymousFunctionEffectComponent('useLayoutEffect');

    const { code } =
      babel.transformSync(inputCode, {
        filename: 'MyComponent.jsx',
        plugins: [reactEffectNamerPlugin],
        presets: ['@babel/preset-react'],
      }) || {};

    expect(code).toContain('function MyComponent_useLayoutEffect_1()');
    expect(code).toContain('useLayoutEffect(MyComponent_useLayoutEffect_1,');
  });

  it('should transform multiple effects', () => {
    const inputCode = generateMultipleEffectsComponent('useLayoutEffect');

    const { code } =
      babel.transformSync(inputCode, {
        filename: 'MyComponent.jsx',
        plugins: [reactEffectNamerPlugin],
        presets: ['@babel/preset-react'],
      }) || {};

    expect(code).toContain('useLayoutEffect(MyComponent_useLayoutEffect_1,');
    expect(code).toContain('useLayoutEffect(MyComponent_useLayoutEffect_2,');
  });

  it('should not transform if callback already has a name', () => {
    const inputCode = generateNamedFunctionEffectComponent('useLayoutEffect');

    const { code } =
      babel.transformSync(inputCode, {
        filename: 'MyComponent.jsx',
        plugins: [reactEffectNamerPlugin],
        presets: ['@babel/preset-react'],
      }) || {};

    expect(code).toContain('namedCallback');
    expect(code).not.toContain('MyComponent_useLayoutEffect_1');
  });
});

describe('multiple types of effects', () => {
  it('should transform multiple types of effects', () => {
    const inputCode = generateMultipleTypesOfEffectsComponent();

    const { code } =
      babel.transformSync(inputCode, {
        filename: 'MyComponent.jsx',
        plugins: [reactEffectNamerPlugin],
        presets: ['@babel/preset-react'],
      }) || {};

    expect(code).toContain('MyComponent_useEffect_1');
    expect(code).toContain('MyComponent_useLayoutEffect_1');
  });
});

describe('useEffect custom hook', () => {
  it('should transform anonymous useEffect arrow function callback into named function', () => {
    const inputCode = generateAnonymousFunctionEffectCustomHook();

    const { code } =
      babel.transformSync(inputCode, {
        filename: 'useMyCustomHook.js',
        plugins: [reactEffectNamerPlugin],
        presets: ['@babel/preset-react'],
      }) || {};

    expect(code).toContain('useEffect(useMyCustomHook_useEffect_1,');
  });
});

describe('custom effect hook', () => {
  it('should transform anonymous useEffect arrow function callback into named function', () => {
    const inputCode = generateArrowFunctionEffectComponent('useMyCustomEffect');

    const { code } =
      babel.transformSync(inputCode, {
        filename: 'useMyCustomHook.js',
        plugins: [reactEffectNamerPlugin],
        presets: ['@babel/preset-react'],
      }) || {};

    expect(code).toContain('useMyCustomEffect(MyComponent_useMyCustomEffect_1,');
  });
});
