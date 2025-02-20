import * as babel from '@babel/core';
import { describe, it, beforeAll } from 'vitest';

import reactEffectNamerPlugin from '../index';
import { collectDetailedMetrics } from './performance-metrics';
import { ComponentVariant, generateRealisticProject } from './performance-utils';

describe('Realistic Performance Tests', () => {
  // 테스트 타임아웃 증가 (30초)
  const TEST_TIMEOUT = 30_000;

  // 워밍업을 위한 설정
  beforeAll(async () => {
    const WARMUP_ITERATIONS = 5;
    const WARMUP_COMPONENTS = 10;

    for (let i = 0; i < WARMUP_ITERATIONS; i++) {
      // JIT 컴파일러 워밍업
      const warmupCode = generateRealisticProject({
        componentCount: WARMUP_COMPONENTS * (i + 1),
        maxEffectsPerComponent: 3,
        maxDependenciesPerEffect: 2,
        variant: { type: 'function', hasChildren: true, hasProps: true, hasState: true },
      });

      for (const { code } of warmupCode) {
        babel.transformSync(code, {
          plugins: [reactEffectNamerPlugin],
          presets: ['@babel/preset-react'],
        });
      }

      // 시스템 안정화를 위한 대기
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  });

  const componentVariants: ComponentVariant[] = [
    { type: 'function', hasChildren: true, hasProps: true, hasState: true },
    { type: 'arrow', hasChildren: false, hasProps: true, hasState: false },
    { type: 'memo', hasChildren: true, hasProps: true, hasState: true },
  ];

  // 더 다양한 크기의 테스트 케이스 추가
  const testCases = [
    { componentCount: 10, maxEffectsPerComponent: 3, maxDependenciesPerEffect: 2, variant: componentVariants[0] },
    { componentCount: 25, maxEffectsPerComponent: 4, maxDependenciesPerEffect: 3, variant: componentVariants[1] },
    { componentCount: 50, maxEffectsPerComponent: 5, maxDependenciesPerEffect: 3, variant: componentVariants[1] },
    { componentCount: 75, maxEffectsPerComponent: 4, maxDependenciesPerEffect: 4, variant: componentVariants[2] },
    { componentCount: 100, maxEffectsPerComponent: 3, maxDependenciesPerEffect: 4, variant: componentVariants[2] },
  ];

  it.each(
    testCases.map((testCase) => ({
      ...testCase,
      type: testCase.variant.type,
    })),
  )(
    'should measure realistic performance for project with $componentCount components ($type type)',
    async ({ componentCount, maxEffectsPerComponent, maxDependenciesPerEffect, variant }) => {
      const components = generateRealisticProject({
        componentCount,
        maxEffectsPerComponent,
        maxDependenciesPerEffect,
        variant,
      });

      const totalMetrics = {
        transformationTime: 0,
        memoryUsage: 0,
        bundleSize: 0,
        gzippedSize: 0,
      };

      // 각 컴포넌트별 메트릭 수집
      for (const { code } of components) {
        const metrics = await collectDetailedMetrics(
          code,
          (inputCode) =>
            babel.transformSync(inputCode, {
              plugins: [reactEffectNamerPlugin],
              presets: ['@babel/preset-react'],
            })?.code || '',
          1,
        );

        totalMetrics.transformationTime += metrics.transformationTime;
        totalMetrics.memoryUsage += metrics.memoryUsage;
        totalMetrics.bundleSize += metrics.bundleSize;
        totalMetrics.gzippedSize += metrics.gzippedSize;
      }

      // 평균 메트릭 계산
      const avgMetrics = {
        transformationTime: totalMetrics.transformationTime / componentCount,
        memoryUsage: totalMetrics.memoryUsage / componentCount,
        bundleSize: totalMetrics.bundleSize / componentCount,
        gzippedSize: totalMetrics.gzippedSize / componentCount,
      };

      // 결과 출력
      console.log(`\n테스트 케이스: ${componentCount}개의 컴포넌트`);
      console.log(`- 컴포넌트 타입: ${variant.type}`);
      console.log(`- 컴포넌트당 최대 ${maxEffectsPerComponent}개의 effect`);
      console.log(`- Effect당 최대 ${maxDependenciesPerEffect}개의 의존성`);
      console.log('\n성능 메트릭 (컴포넌트당 중앙값):');
      console.log(`- 변환 시간: ${avgMetrics.transformationTime.toFixed(2)}ms`);
      console.log(`- 메모리 사용량: ${avgMetrics.memoryUsage.toFixed(2)}MB`);
      console.log(`- 번들 크기: ${avgMetrics.bundleSize.toFixed(2)}KB`);
      console.log(`- Gzip 크기: ${avgMetrics.gzippedSize.toFixed(2)}KB`);
    },
    TEST_TIMEOUT,
  );
});
