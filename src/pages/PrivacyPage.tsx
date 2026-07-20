import { Link } from 'react-router-dom';
import { Brain, ArrowLeft, Shield, Eye, Lock, Database, UserCheck, Bell, Globe, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SECTIONS = [
  {
    icon: Eye,
    title: '一、我们收集的信息',
    content: `在您使用智学帮（以下简称"本平台"）的过程中，我们可能收集以下类型的个人信息：

1. **账户信息**：注册时提供的用户名、电子邮件地址、密码（加密存储）及头像。
2. **学习数据**：您在平台上的课程学习进度、练习题作答记录、错题情况、学习时长及频率。
3. **对话内容**：您与AI助手、辅导系统的对话记录，用于提供个性化学习服务和改善系统质量。
4. **画像数据**：基于您的学习行为自动生成的六维学习画像数据（知识基础、认知风格、学习偏好、易错点、学习目标、学习节奏）。
5. **设备信息**：浏览器类型、操作系统版本、IP地址、访问时间等技术日志信息。
6. **上传内容**：您主动上传至知识库的文件、图片等内容。`,
  },
  {
    icon: Database,
    title: '二、信息的使用目的',
    content: `我们收集和使用您的个人信息，主要用于以下目的：

1. **提供核心服务**：注册登录、课程学习、AI对话、辅导辅助、资源生成等平台核心功能。
2. **个性化学习体验**：分析您的学习数据，动态调整教学内容、难度和学习路径，提供精准的AI辅导建议。
3. **系统优化与安全**：监测系统运行状态，防范恶意攻击、欺诈行为，保障账号与数据安全。
4. **服务通知**：向您发送学习提醒、系统公告、安全提示等必要通知（不含商业推广）。
5. **合规义务**：配合国家法律法规要求，在必要时向监管机构提供相关信息。`,
  },
  {
    icon: Lock,
    title: '三、信息的保护措施',
    content: `我们采取符合行业标准的技术和管理措施保护您的个人信息安全：

1. **传输加密**：所有数据传输采用 TLS 1.3 加密协议，防止中间人攻击。
2. **存储安全**：用户密码采用 bcrypt 不可逆哈希算法存储，敏感数据在数据库中加密存放。
3. **访问控制**：基于行级安全策略（Row Level Security），严格限制数据访问权限，确保用户只能访问自己的数据。
4. **最小权限原则**：内部员工仅在必要范围内接触用户数据，并受严格保密协议约束。
5. **定期审计**：定期对系统安全性进行审查和渗透测试，及时修补安全漏洞。

尽管我们尽力保护您的信息安全，但请您理解，互联网传输本身存在一定风险，我们无法承诺绝对安全。如发生数据安全事件，我们将在72小时内通知受影响用户并采取补救措施。`,
  },
  {
    icon: Globe,
    title: '四、信息的共享与披露',
    content: `我们不会向任何第三方出售或租借您的个人信息。在以下情况下，我们可能共享您的信息：

1. **AI服务提供商**：为提供AI对话、辅导等功能，对话内容可能经匿名化处理后传递给 DeepSeek API 服务，该服务商受本平台与其签订的数据处理协议约束。
2. **知识库服务**：您上传至知识库的内容将存储于个人知识库中，仅您本人可访问和管理。
3. **法律要求**：在法律法规要求、政府机关依法调取或保护本平台合法权益时，我们可能依法披露相关信息。
4. **业务合并**：如发生公司合并、收购或资产转让，我们将确保接收方遵守本隐私政策继续保护您的信息。

除上述情况外，我们不会将您的个人信息共享给任何第三方。`,
  },
  {
    icon: UserCheck,
    title: '五、您的权利',
    content: `根据《个人信息保护法》等相关法律法规，您对自己的个人信息享有以下权利：

1. **知情权**：了解我们收集、使用您个人信息的目的、方式和范围。
2. **访问权**：登录账号后，您可在"设置"页面查看您的个人资料和学习数据。
3. **更正权**：如您的个人信息有误，可通过账户设置进行修改或联系我们协助更正。
4. **删除权**：您可以申请删除您的账户及相关数据。账户删除后，您的数据将在30天内从活跃数据库中移除，备份数据将在90天内完全清除。
5. **撤回同意权**：您可以撤回对非必要功能的数据授权，但这可能影响部分功能的使用体验。
6. **数据可携权**：您有权请求以常用格式获取您的个人数据副本。

如需行使上述权利，请通过本政策末尾的联系方式与我们联系，我们将在15个工作日内处理您的请求。`,
  },
  {
    icon: Bell,
    title: '六、Cookie 与追踪技术',
    content: `本平台使用 Cookie 和类似技术来改善您的使用体验：

1. **必要 Cookie**：用于维持登录状态和保障系统安全，无法关闭。
2. **功能 Cookie**：记住您的偏好设置（如主题、语言），可在浏览器设置中禁用，但可能影响使用体验。
3. **分析 Cookie**：用于统计匿名访问数据（如页面浏览量），帮助我们改善产品，您可以拒绝此类 Cookie。

我们不使用任何跨站追踪技术，也不将您的行为数据用于广告目的。`,
  },
  {
    icon: Shield,
    title: '七、未成年人保护',
    content: `本平台主要面向年满14周岁的用户。

1. 如您是14周岁以下的未成年人，请在监护人的陪同下使用本平台，并由监护人代为同意本隐私政策。
2. 如您是14-18周岁的未成年人，请在阅读并征得监护人同意本隐私政策后使用本平台。
3. 若我们发现在未获得监护人同意的情况下收集了未满14周岁儿童的个人信息，我们将立即删除相关数据。
4. 监护人如发现平台收集了其监护的未成年人信息，可通过本政策末尾的联系方式联系我们进行处理。`,
  },
  {
    icon: Mail,
    title: '八、联系我们与政策更新',
    content: `**联系我们**
如您对本隐私政策有任何疑问、意见或投诉，请通过以下方式联系我们：
- 电子邮件：privacy@zhixuebang.com
- 处理时限：我们将在15个工作日内回复您的请求

**政策更新**
我们可能根据法律法规变化或业务调整不时更新本隐私政策。发生重大变更时，我们将在平台显著位置发布通知，或通过您注册的电子邮件通知您。继续使用本平台视为您接受更新后的隐私政策。

本政策最后更新日期：2025年7月1日
本政策生效日期：2025年7月1日`,
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50"
        style={{ background: 'rgba(10,11,13,0.92)', backdropFilter: 'blur(12px)' }}>
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center gradient-bg">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold gradient-text">智学帮</span>
          </Link>
          <Link to="/">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground gap-1.5">
              <ArrowLeft className="w-4 h-4" />
              返回首页
            </Button>
          </Link>
        </div>
      </nav>

      <main className="pt-24 pb-20 container mx-auto px-6 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 gradient-bg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-3">隐私政策</h1>
          <p className="text-muted-foreground text-lg">智学帮 AI 学习系统</p>
          <p className="text-sm text-muted-foreground mt-2">最后更新：2025年7月1日 · 生效日期：2025年7月1日</p>
        </div>

        {/* 引言 */}
        <div className="glass-card rounded-2xl p-6 mb-8 border-l-4 glow-card" style={{ borderLeftColor: '#4F46E5' }}>
          <p className="text-muted-foreground leading-relaxed">
            感谢您使用智学帮 AI 学习系统（以下简称"本平台"、"我们"）。我们深知个人信息对您的重要性，
            并将竭尽全力保护您的个人信息安全与合法权益。本隐私政策旨在向您说明我们如何收集、使用、
            存储及保护您的个人信息，以及您在此过程中享有的权利。
          </p>
          <p className="text-muted-foreground leading-relaxed mt-3">
            请在使用本平台前仔细阅读本政策。如您不同意本政策的任何内容，请停止使用本平台服务。
            您使用或继续使用本平台服务，即表示您同意我们按照本政策收集、使用、储存和共享您的相关信息。
          </p>
        </div>

        {/* 各章节 */}
        <div className="space-y-6">
          {SECTIONS.map(({ icon: Icon, title, content }) => (
            <div key={title} className="glass-card rounded-2xl p-6 glow-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(79,70,229,0.15)', border: '1px solid rgba(79,70,229,0.3)' }}>
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">{title}</h2>
              </div>
              <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line space-y-2">
                {content.split('\n').map((line, i) => {
                  const trimmed = line.trim();
                  if (!trimmed) return <div key={i} className="h-1" />;
                  if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
                    return <p key={i} className="font-semibold text-foreground">{trimmed.replace(/\*\*/g, '')}</p>;
                  }
                  return (
                    <p key={i} dangerouslySetInnerHTML={{
                      __html: trimmed.replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground">$1</strong>')
                    }} />
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* 底部导航 */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-border">
          <Link to="/terms" className="text-sm text-primary hover:underline">查看用户协议 →</Link>
          <Link to="/">
            <Button className="gradient-bg text-white hover:opacity-90">返回首页</Button>
          </Link>
        </div>
      </main>

      <footer className="border-t border-border py-6">
        <div className="container mx-auto px-6 text-center">
          <p className="text-xs text-muted-foreground">© 2025 智学帮 AI 学习系统 · 软件杯 A3 赛题作品</p>
        </div>
      </footer>
    </div>
  );
}
