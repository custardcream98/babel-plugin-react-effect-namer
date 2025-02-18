import { types as t, NodePath } from '@babel/core';

export const getComponentName = (path: NodePath<t.Node>): null | string => {
  let componentName: null | string = null;

  path.findParent((p) => {
    if (p.isFunctionDeclaration() && p.node.id) {
      componentName = p.node.id.name;
      return true;
    }

    if (p.isVariableDeclarator() && t.isIdentifier(p.node.id)) {
      componentName = p.node.id.name;
      return true;
    }

    return false;
  });

  return componentName;
};

const isBuiltInEffectHook = (path: NodePath<t.Node>) => {
  return (
    path.isIdentifier({ name: 'useEffect' }) ||
    path.isIdentifier({ name: 'useLayoutEffect' }) ||
    path.isIdentifier({ name: 'useInsertionEffect' })
  );
};

export const getEffectHookName = (path: NodePath<t.Node>) => {
  // check if it's a built-in effect hook
  if (isBuiltInEffectHook(path)) {
    return path.node.name;
  }

  // check if it's a member expression
  // e.g. React.useEffect
  if (path.isMemberExpression()) {
    const object = path.get('object');
    const property = path.get('property');
    if (object.isIdentifier({ name: 'React' }) && isBuiltInEffectHook(property)) {
      return property.node.name;
    }
  }

  // check if it's a custom hook
  if (path.isIdentifier()) {
    const name = path.node.name;
    if (name.startsWith('use') && name.endsWith('Effect')) {
      return name;
    }
  }

  return null;
};

export const createNamedFunction = ({
  newIdentifier,
  callbackPath,
}: {
  newIdentifier: t.Identifier;
  callbackPath: NodePath<t.ArrowFunctionExpression> | NodePath<t.FunctionExpression>;
}) => {
  if (callbackPath.isArrowFunctionExpression()) {
    return t.arrowFunctionExpression(callbackPath.node.params, callbackPath.node.body, callbackPath.node.async);
  } else {
    return t.functionExpression(
      newIdentifier,
      callbackPath.node.params,
      callbackPath.node.body,
      callbackPath.node.generator,
      callbackPath.node.async,
    );
  }
};
