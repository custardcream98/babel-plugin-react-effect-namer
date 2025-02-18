export const generateArrowFunctionEffectComponent = (
  effectType: 'useEffect' | 'useLayoutEffect' | `use${string}Effect`,
) => `
  import React, { ${effectType} } from 'react';

  function MyComponent() {
    ${effectType}(() => {
      console.log("Effect run");
    }, []);
    return <div>Hello</div>;
  }
`;

export const generateAnonymousFunctionEffectComponent = (
  effectType: 'useEffect' | 'useLayoutEffect' | `use${string}Effect`,
) => `
  import React, { ${effectType} } from 'react';

  function MyComponent() {
    ${effectType}(function () {
      console.log("Effect run");
    }, []);
    
    return <div>Hello</div>;
  }
`;

export const generateNamedFunctionEffectComponent = (
  effectType: 'useEffect' | 'useLayoutEffect' | `use${string}Effect`,
) => `
  import React, { ${effectType} } from 'react';

  function MyComponent() {
    ${effectType}(function namedCallback() {
      console.log("Effect run");
    }, []);
    return <div>Hello</div>;
  }
`;

export const generateMultipleEffectsComponent = (
  effectType: 'useEffect' | 'useLayoutEffect' | `use${string}Effect`,
) => `
  import React, { ${effectType} } from 'react';

  function MyComponent() {

    ${effectType}(() => {
      console.log("Effect run");
    }, []);

    ${effectType}(() => {
      console.log("Effect run");
    }, []);

    return <div>Hello</div>;
  }
`;

export const generateMultipleTypesOfEffectsComponent = () => `
  import React, { useEffect, useLayoutEffect } from 'react';

  function MyComponent() {

    useEffect(() => {
      console.log("Effect run");
    }, []);

    useLayoutEffect(() => {
      console.log("Effect run");
    }, []);

    return <div>Hello</div>;
  }
`;

export const generateAnonymousFunctionEffectCustomHook = () => `
  import { useEffect } from 'react';

  function useMyCustomHook() {
    useEffect(() => {
      console.log("Effect run");
    }, []);

    return null;
  }
`;
