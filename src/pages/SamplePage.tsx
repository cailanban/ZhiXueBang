/**
 * 页面未找到 / 建设中
 */
import PageMeta from "../components/common/PageMeta";

export default function SamplePage() {
  return (
    <>
      <PageMeta title="页面未找到" description="该页面不存在或尚未开放" />
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <h2 className="text-xl font-semibold text-foreground mb-2">页面未找到</h2>
        <p className="text-sm text-muted-foreground">该页面不存在或尚未开放，请确认链接是否正确。</p>
      </div>
    </>
  );
}
