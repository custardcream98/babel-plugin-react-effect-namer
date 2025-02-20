import { performance } from 'perf_hooks';
import { gzipSync } from 'zlib';

interface PerformanceMetrics {
  bundleSize: number;
  gzippedSize: number;
  memoryUsage: number;
  transformationTime: number;
}

// 이상치 제거 함수
function removeOutliers(metrics: number[]): number[] {
  const sorted = [...metrics].sort((a, b) => a - b);
  const q1 = sorted[Math.floor(sorted.length * 0.25)];
  const q3 = sorted[Math.floor(sorted.length * 0.75)];
  const iqr = q3 - q1;
  return sorted.filter((x) => x >= q1 - 1.5 * iqr && x <= q3 + 1.5 * iqr);
}

// 중앙값 계산 함수
function calculateMedian(numbers: number[]): number {
  const sorted = [...numbers].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
}

export async function collectDetailedMetrics(
  code: string,
  transform: (code: string) => string,
  componentCount: number,
): Promise<PerformanceMetrics> {
  const ITERATIONS = 5;
  const MEMORY_STABILIZATION_DELAY = 200;

  const metrics: PerformanceMetrics[] = [];

  await Promise.all(
    Array.from({ length: ITERATIONS }).map(async () => {
      if (global.gc) {
        global.gc();
      }

      await new Promise((resolve) => setTimeout(resolve, MEMORY_STABILIZATION_DELAY));

      const startTime = performance.now();
      const startMemory = process.memoryUsage().heapUsed;

      const transformedCode = transform(code);

      const endTime = performance.now();
      const endMemory = process.memoryUsage().heapUsed;

      metrics.push({
        transformationTime: (endTime - startTime) / componentCount,
        memoryUsage: (endMemory - startMemory) / (1024 * 1024 * componentCount),
        bundleSize: transformedCode.length / (1024 * componentCount),
        gzippedSize: gzipSync(transformedCode).length / (1024 * componentCount),
      });
    }),
  );

  return {
    transformationTime: calculateMedian(removeOutliers(metrics.map((m) => m.transformationTime))),
    memoryUsage: calculateMedian(removeOutliers(metrics.map((m) => m.memoryUsage))),
    bundleSize: calculateMedian(removeOutliers(metrics.map((m) => m.bundleSize))),
    gzippedSize: calculateMedian(removeOutliers(metrics.map((m) => m.gzippedSize))),
  };
}
