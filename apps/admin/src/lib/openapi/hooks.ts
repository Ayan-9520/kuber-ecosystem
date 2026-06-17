import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { buildEndpointIndex, groupEndpointsByModule, parseOpenApiYaml } from './parser';
import type { OpenApiDocument, OpenApiEndpoint } from './types';

const SPEC_URL = '/openapi/kuberone-v1.yaml';

async function fetchOpenApiSpec(): Promise<OpenApiDocument> {
  const res = await fetch(SPEC_URL);
  if (!res.ok) throw new Error(`Failed to load OpenAPI spec (${res.status})`);
  const text = await res.text();
  return parseOpenApiYaml(text);
}

export function useOpenApiSpec() {
  return useQuery({
    queryKey: ['openapi-spec'],
    queryFn: fetchOpenApiSpec,
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
  });
}

export function useApiEndpoints(): {
  endpoints: OpenApiEndpoint[];
  byModule: Map<string, OpenApiEndpoint[]>;
  isLoading: boolean;
  isError: boolean;
  spec: OpenApiDocument | undefined;
} {
  const { data: spec, isLoading, isError } = useOpenApiSpec();

  const endpoints = useMemo(
    () => (spec ? buildEndpointIndex(spec) : []),
    [spec],
  );

  const byModule = useMemo(
    () => groupEndpointsByModule(endpoints),
    [endpoints],
  );

  return { endpoints, byModule, isLoading, isError, spec };
}
