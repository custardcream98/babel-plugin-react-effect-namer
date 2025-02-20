import { faker } from '@faker-js/faker';

interface ComponentConfig {
  dependencies: string[];
  effectCount: number;
  name: string;
}

export interface ComponentVariant {
  hasChildren: boolean;
  hasProps: boolean;
  hasState: boolean;
  type: 'arrow' | 'class' | 'function' | 'memo';
}

// useEffect 타입을 정의
type EffectType = 'animation' | 'eventListener' | 'fetch' | 'interval' | 'subscription';

function generateEffectBody(type: EffectType, index: number): string {
  switch (type) {
    case 'fetch':
      return `
        const controller = new AbortController();
        const signal = controller.signal;
        
        async function fetchData${index}() {
          try {
            const response = await fetch('/api/data/${faker.string.uuid()}', { signal });
            const data = await response.json();
            setState((prev) => ({ ...prev, data }));
          } catch (error) {
            if (!signal.aborted) {
              console.error('Fetch error in ${index}:', error);
            }
          }
        }
        
        fetchData${index}();
        
        return () => {
          controller.abort();
        };`;

    case 'eventListener':
      return `
        const handleScroll${index} = (event) => {
          if (window.scrollY > 100) {
            setIsVisible(true);
          } else {
            setIsVisible(false);
          }
        };
        
        window.addEventListener('scroll', handleScroll${index});
        
        return () => {
          window.removeEventListener('scroll', handleScroll${index});
        };`;

    case 'subscription':
      return `
        const subscription${index} = someObservable.subscribe(
          (data) => {
            setSubscriptionData(data);
          },
          (error) => {
            console.error('Subscription error:', error);
          }
        );
        
        return () => {
          subscription${index}.unsubscribe();
        };`;

    case 'animation':
      return `
        let animationFrameId;
        
        const animate${index} = () => {
          setRotation((prev) => (prev + 1) % 360);
          animationFrameId = requestAnimationFrame(animate${index});
        };
        
        animationFrameId = requestAnimationFrame(animate${index});
        
        return () => {
          cancelAnimationFrame(animationFrameId);
        };`;

    case 'interval':
      return `
        const intervalId = setInterval(() => {
          setCount((prev) => prev + 1);
        }, ${1000 + index * 100});
        
        return () => {
          clearInterval(intervalId);
        };`;
  }
}

export function generateRealisticComponent({ name, effectCount, dependencies }: ComponentConfig) {
  // 상태 선언부 생성
  const states = `
    const [state, setState] = useState({});
    const [isVisible, setIsVisible] = useState(false);
    const [subscriptionData, setSubscriptionData] = useState(null);
    const [rotation, setRotation] = useState(0);
    const [count, setCount] = useState(0);
  `;

  // 다양한 타입의 effect 생성
  const effectTypes: EffectType[] = ['fetch', 'eventListener', 'subscription', 'animation', 'interval'];

  const effects = Array.from({ length: effectCount })
    .map((_, i) => {
      const effectType = effectTypes[i % effectTypes.length];
      const effectDeps = dependencies.slice(0, Math.floor(Math.random() * dependencies.length)).join(', ');

      return `
      useEffect(() => {
        ${generateEffectBody(effectType, i + 1)}
      }, [${effectDeps}]);
    `;
    })
    .join('\n');

  // 컴포넌트 전체 구조 반환 (name 사용)
  return `
    // ${name} 컴포넌트의 내부 로직
    ${states}
    
    ${effects}

    return (
      <div style={{ transform: \`rotate(\${rotation}deg)\` }}>
        {isVisible && <div>Visible Content</div>}
        {subscriptionData && <DataView data={subscriptionData} />}
        <div>Count: {count}</div>
        {state.data && <ChildComponent data={state.data} />}
      </div>
    );
  `;
}

interface ProjectConfig {
  componentCount: number;
  maxDependenciesPerEffect: number;
  maxEffectsPerComponent: number;
  variant: ComponentVariant;
}

function generateImports(): string {
  return `
    import React, { useEffect, useState, useCallback, useMemo } from 'react';
    import { DataView } from './components/DataView';
    import { someObservable } from './utils/observable';
  `;
}

// JavaScript 예약어 목록
const RESERVED_WORDS = new Set([
  'break',
  'case',
  'catch',
  'class',
  'const',
  'continue',
  'debugger',
  'default',
  'delete',
  'do',
  'else',
  'export',
  'extends',
  'finally',
  'for',
  'function',
  'if',
  'import',
  'in',
  'instanceof',
  'new',
  'return',
  'super',
  'switch',
  'this',
  'throw',
  'try',
  'typeof',
  'var',
  'void',
  'while',
  'with',
  'yield',
  'enum',
  'implements',
  'interface',
  'let',
  'package',
  'private',
  'protected',
  'public',
  'static',
  'await',
  'abstract',
  'boolean',
  'byte',
  'char',
  'double',
  'final',
  'float',
  'goto',
  'int',
  'long',
  'native',
  'short',
  'synchronized',
  'throws',
  'transient',
  'volatile',
]);

// 이미 사용된 변수명을 추적하기 위한 Set
const usedNames = new Set<string>();

// 안전하고 유니크한 변수명 생성 함수
function generateSafeVariableName(): string {
  const word = faker.lorem.word();
  let safeName = word;

  // 예약어이거나 숫자로 시작하는 경우 접두사 추가
  if (RESERVED_WORDS.has(word) || /^\d/.test(word)) {
    safeName = `prop${word}`;
  }

  // 이미 사용된 이름인 경우 숫자를 붙여서 유니크하게 만듦
  let counter = 1;
  while (usedNames.has(safeName)) {
    safeName = `${word}${counter}`;
    counter++;
  }

  usedNames.add(safeName);
  return safeName;
}

export function generateRealisticProject(config: ProjectConfig) {
  // 새로운 컴포넌트 생성 시 이전에 사용된 이름들을 초기화
  usedNames.clear();

  const { componentCount, maxEffectsPerComponent, maxDependenciesPerEffect, variant } = config;

  // 컴포넌트 이름 생성
  const componentNames = Array.from({ length: componentCount }).map(() => `Component${faker.string.alpha(5)}`);

  // 컴포넌트 생성
  const components = componentNames.map((name) => {
    const effectCount = Math.floor(Math.random() * maxEffectsPerComponent) + 1;
    const dependencies = Array.from({ length: Math.floor(Math.random() * maxDependenciesPerEffect) + 1 }).map(() =>
      generateSafeVariableName(),
    );

    // 커스텀 훅 생성
    const customHooks = `
const use${name}Data = () => {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    ${generateEffectBody('fetch', 0)}
  }, []);
  
  return data;
};`;

    // 메모이제이션된 값과 콜백 생성
    const memoizedLogic = `
const memoizedValue = useMemo(() => {
  return complexCalculation(${dependencies.join(', ')});
}, [${dependencies.join(', ')}]);

const handleUpdate = useCallback((newData) => {
  if (onUpdate) {
    onUpdate(newData);
  }
}, [onUpdate]);`;

    const componentConfig: ComponentConfig = {
      name: `${name}_Implementation`, // 내부 구현에서는 다른 이름 사용
      effectCount,
      dependencies,
    };

    const componentBody = generateRealisticComponent(componentConfig);

    // 컴포넌트 정의
    let componentDefinition;
    if (variant.type === 'memo') {
      componentDefinition = `const ${name} = React.memo(({ ${dependencies.join(
        ', ',
      )}, className, style, onUpdate }) => {
  ${memoizedLogic}
  ${componentBody}
});`;
    } else if (variant.type === 'arrow') {
      componentDefinition = `const ${name} = ({ ${dependencies.join(', ')}, className, style, onUpdate }) => {
  ${memoizedLogic}
  ${componentBody}
};`;
    } else {
      componentDefinition = `function ${name}({ ${dependencies.join(', ')}, className, style, onUpdate }) {
  ${memoizedLogic}
  ${componentBody}
}`;
    }

    // 각 컴포넌트를 별도의 모듈로 생성
    return {
      name,
      code: `${generateImports()}

${customHooks}

${componentDefinition}

export default ${name};`,
    };
  });

  // 각 컴포넌트를 별도의 파일로 처리하도록 수정
  return components.map(({ name, code }) => ({
    filename: `${name}.jsx`,
    code,
  }));
}
