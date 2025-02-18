import { PluginObj, types as t, NodePath, PluginPass } from '@babel/core';
import { createNamedFunction, getComponentName, getEffectHookName } from './utils';

interface StateWithEffectCount extends PluginPass {
  effectCount: Record<string, Record<string, number>>;
}

export default function reactEffectNamer(): PluginObj<StateWithEffectCount> {
  return {
    name: 'react-effect-namer',

    pre() {
      this.effectCount = {};
    },

    visitor: {
      CallExpression(path: NodePath<t.CallExpression>, state: StateWithEffectCount) {
        const callee = path.get('callee');

        const hookName = getEffectHookName(callee);
        if (!hookName) return;

        const args = path.get('arguments');
        if (args.length === 0) return;

        const callback = args[0];
        if (!(callback.isArrowFunctionExpression() || callback.isFunctionExpression())) return;

        // if callback is already named, do not transform
        if ((callback.node as t.FunctionExpression).id) return;

        // get component or custom hook name from parent chain
        const componentName = getComponentName(path);
        if (!componentName) return;

        // Initialize the counter for this component and hook if needed
        if (!state.effectCount[componentName]) {
          state.effectCount[componentName] = {};
        }
        if (!state.effectCount[componentName][hookName]) {
          state.effectCount[componentName][hookName] = 0;
        }
        state.effectCount[componentName][hookName]++;
        const count = state.effectCount[componentName][hookName];

        // Create the new function name with the counter appended,
        // e.g. "MyComponent_useEffect_1", "MyComponent_useEffect_2", etc.
        const newFunctionName = `${componentName}_${hookName}_${count}`;
        const newIdentifier = t.identifier(newFunctionName);

        // create new function based on original callback
        const newFunction = createNamedFunction({
          newIdentifier,
          callbackPath: callback,
        });

        // replace the original callback with the new function
        args[0].replaceWith(newIdentifier);

        // create a new variable declaration for the new function
        const variableDeclaration = t.variableDeclaration('const', [t.variableDeclarator(newIdentifier, newFunction)]);

        // insert the new variable declaration before the call expression
        path.insertBefore(variableDeclaration);
      },
    },
  };
}
