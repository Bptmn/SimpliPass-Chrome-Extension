/**
 * Performance Profiler HOC - Wraps components with React Profiler for development monitoring
 */
import React, { Profiler, ProfilerOnRenderCallback } from 'react';

interface ProfilerData {
  id: string;
  phase: 'mount' | 'update' | 'nested-update';
  actualDuration: number;
  baseDuration: number;
  startTime: number;
  commitTime: number;
}

/**
 * Development-only profiler callback that logs render performance
 */
const onRenderCallback: ProfilerOnRenderCallback = (
  id,
  phase,
  actualDuration,
  baseDuration,
  startTime,
  commitTime,
) => {
  if (process.env.NODE_ENV !== 'development') return;

  const profilerData: ProfilerData = {
    id,
    phase,
    actualDuration,
    baseDuration,
    startTime,
    commitTime,
  };

  // Log slow renders (>16ms for 60fps)
  if (actualDuration > 16) {
    console.warn(`🐌 Slow render detected in ${id}:`, {
      ...profilerData,
      renderTime: `${actualDuration.toFixed(2)}ms`,
      phase: phase === 'mount' ? '🏗️ Mount' : phase === 'update' ? '🔄 Update' : '🔗 Nested',
    });
  }

  // Log all renders in verbose mode
  if (localStorage.getItem('simplipass-verbose-profiling') === 'true') {
    console.log(`📊 Render profile for ${id}:`, {
      ...profilerData,
      renderTime: `${actualDuration.toFixed(2)}ms`,
      phase: phase === 'mount' ? '🏗️ Mount' : phase === 'update' ? '🔄 Update' : '🔗 Nested',
    });
  }
};

/**
 * Higher-order component that wraps a component with React Profiler
 * Only active in development builds
 */
export function withProfiler<P extends Record<string, any>>(
  WrappedComponent: React.ComponentType<P>,
  profileId?: string,
) {
  const ProfiledComponent = (props: P) => {
    const id = profileId || WrappedComponent.displayName || WrappedComponent.name || 'Component';

    // In production, return component without profiling
    if (process.env.NODE_ENV === 'production') {
      return <WrappedComponent {...props} />;
    }

    // In development, wrap with Profiler
    return (
      <Profiler id={id} onRender={onRenderCallback}>
        <WrappedComponent {...props} />
      </Profiler>
    );
  };

  ProfiledComponent.displayName = `withProfiler(${WrappedComponent.displayName || WrappedComponent.name})`;

  return ProfiledComponent;
}

/**
 * Hook to enable/disable verbose profiling in development
 */
export function useProfilerSettings() {
  const enableVerboseProfiler = () => {
    if (process.env.NODE_ENV === 'development') {
      localStorage.setItem('simplipass-verbose-profiling', 'true');
      console.log('🔍 Verbose profiling enabled');
    }
  };

  const disableVerboseProfiler = () => {
    localStorage.removeItem('simplipass-verbose-profiling');
    console.log('🔇 Verbose profiling disabled');
  };

  const isVerboseEnabled = () => {
    return localStorage.getItem('simplipass-verbose-profiling') === 'true';
  };

  return {
    enableVerboseProfiler,
    disableVerboseProfiler,
    isVerboseEnabled,
  };
}

/**
 * Performance measurement hook for custom timing
 */
export function usePerformanceMark(name: string) {
  const startMark = React.useCallback(() => {
    if (process.env.NODE_ENV === 'development' && 'performance' in window) {
      performance.mark(`${name}-start`);
    }
  }, [name]);

  const endMark = React.useCallback(() => {
    if (process.env.NODE_ENV === 'development' && 'performance' in window) {
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);

      const measure = performance.getEntriesByName(name, 'measure')[0];
      if (measure && measure.duration > 16) {
        console.warn(`⏱️ Performance mark "${name}": ${measure.duration.toFixed(2)}ms`);
      }
    }
  }, [name]);

  return { startMark, endMark };
}
