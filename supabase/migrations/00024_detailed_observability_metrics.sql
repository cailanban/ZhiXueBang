-- 00024: Detailed observability metrics (TTFT, SSE, recommendations, GPU, indexing)
BEGIN;

CREATE TABLE IF NOT EXISTS public.edge_function_metrics (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  function_name text NOT NULL,
  metric_date date NOT NULL DEFAULT CURRENT_DATE,
  metric_type text NOT NULL CHECK (metric_type IN (
    'ttft_ms', 'total_latency_ms', 'sse_interrupt_rate',
    'recommendation_impression', 'recommendation_click', 'recommendation_completion',
    'index_latency_ms', 'index_success_rate',
    'gpu_online_minutes', 'gpu_first_frame_ms', 'gpu_audio_lip_delay_ms',
    'request_count', 'error_count', 'token_count'
  )),
  metric_value numeric NOT NULL,
  unit text,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for fast aggregation
CREATE INDEX IF NOT EXISTS idx_edge_function_metrics_lookup
  ON public.edge_function_metrics(function_name, metric_date, metric_type);

-- RPC: record a metric
CREATE OR REPLACE FUNCTION public.record_function_metric(
  p_function_name text,
  p_metric_type text,
  p_metric_value numeric,
  p_unit text DEFAULT NULL,
  p_metadata jsonb DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.edge_function_metrics
    (function_name, metric_date, metric_type, metric_value, unit, metadata)
  VALUES
    (p_function_name, CURRENT_DATE, p_metric_type, p_metric_value, p_unit, p_metadata);
END;
$$;

-- RPC: get metrics summary for a function
CREATE OR REPLACE FUNCTION public.get_function_metrics(
  p_function_name text,
  p_days integer DEFAULT 7
) RETURNS TABLE (
  metric_type text,
  avg_value numeric,
  max_value numeric,
  min_value numeric,
  sample_count bigint
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT
    metric_type,
    ROUND(AVG(metric_value), 3) as avg_value,
    ROUND(MAX(metric_value), 3) as max_value,
    ROUND(MIN(metric_value), 3) as min_value,
    COUNT(*) as sample_count
  FROM public.edge_function_metrics
  WHERE function_name = p_function_name
    AND metric_date >= CURRENT_DATE - (p_days || ' days')::interval
  GROUP BY metric_type
  ORDER BY metric_type;
$$;

-- RPC: get dashboard summary (all functions, today)
CREATE OR REPLACE FUNCTION public.get_dashboard_metrics()
RETURNS TABLE (
  function_name text,
  total_requests bigint,
  avg_ttft_ms numeric,
  avg_latency_ms numeric,
  error_rate numeric,
  today_cost numeric
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH requests AS (
    SELECT
      function_name,
      COUNT(*) FILTER (WHERE metric_type = 'request_count') as total_requests,
      AVG(metric_value) FILTER (WHERE metric_type = 'ttft_ms') as avg_ttft_ms,
      AVG(metric_value) FILTER (WHERE metric_type = 'total_latency_ms') as avg_latency_ms,
      SUM(metric_value) FILTER (WHERE metric_type = 'error_count')::numeric as error_count
    FROM public.edge_function_metrics
    WHERE metric_date = CURRENT_DATE
    GROUP BY function_name
  ),
  costs AS (
    SELECT function_name, SUM(daily_cost) as today_cost
    FROM public.edge_function_costs
    WHERE cost_date = CURRENT_DATE
    GROUP BY function_name
  )
  SELECT
    r.function_name,
    COALESCE(r.total_requests, 0)::bigint,
    ROUND(COALESCE(r.avg_ttft_ms, 0), 1),
    ROUND(COALESCE(r.avg_latency_ms, 0), 1),
    ROUND(COALESCE(r.error_count / NULLIF(r.total_requests, 0), 0) * 100, 1),
    ROUND(COALESCE(c.today_cost, 0), 4)
  FROM requests r
  LEFT JOIN costs c ON r.function_name = c.function_name
  ORDER BY COALESCE(r.total_requests, 0) DESC;
$$;

-- Grant
GRANT SELECT ON public.edge_function_metrics TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_function_metric TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_function_metrics TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_dashboard_metrics TO authenticated;

COMMIT;