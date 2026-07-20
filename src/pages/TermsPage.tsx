import { Link } from 'react-router-dom';
import { Brain, ArrowLeft, FileText, AlertTriangle, CheckSquare, Ban, Scale, HelpCircle, RefreshCw, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SECTIONS = [
  {
    icon: CheckSquare,
    title: '一、协议的接受与适用范围',
    content: `欢迎您使用智学帮 AI 学习系统（以下简称"本平台"）。本用户协议（以下简称"本协议"）是您与智学帮平台运营方（以下简称"我们"）之间关于使用本平台服务所订立的法律协议。

1. **协议接受**：您在注册账号或使用本平台任何服务时，即表示您已阅读、理解并同意遵守本协议的全部条款。如您不同意本协议的任何内容，请立即停止注册或使用本平台。
2. **适用对象**：本协议适用于所有注册用户及访问本平台的访客。
3. **年龄要求**：您须年满14周岁方可注册和使用本平台。14-18周岁的未成年用户须在监护人同意本协议后方可使用。
4. **企业用户**：如您代表企业或其他法律实体注册，您声明并保证您有权代表该实体接受本协议。`,
  },
  {
    icon: FileText,
    title: '二、账户注册与管理',
    content: `1. **注册信息真实性**：您在注册时须提供真实、准确、完整的个人信息，并在信息变更时及时更新。提供虚假信息所造成的一切后果由您自行承担。
2. **账户安全责任**：您有责任妥善保管账户密码，不得将账户借给他人使用。因您的保管疏忽导致的账户盗用或信息泄露，我们不承担责任。
3. **一人一号原则**：每位用户仅可注册一个账号，不得通过技术手段绕过限制批量注册账号。
4. **账户异常处理**：如发现账户存在异常登录或遭受盗用，请立即联系我们。我们将协助您采取临时冻结等保护措施。
5. **实名认证**：根据国家相关法规要求，您可能需要完成实名认证方可使用部分功能。`,
  },
  {
    icon: Scale,
    title: '三、服务内容与使用规范',
    content: `**本平台提供的服务包括**：AI智能对话、诊断型AI辅导、学习画像分析、多模态资源生成、学习笔记管理、错题本、结构化学习路径规划、课程管理等学习功能。

**您在使用本平台时须遵守以下规范**：

1. 遵守中华人民共和国及您所在地区的法律法规，不得利用本平台从事任何违法违规活动。
2. 不得上传、发布或传播含有以下内容的信息：违反国家法律法规的内容、侵犯他人知识产权的内容、侵犯他人隐私的内容、含有恶意代码或病毒的内容、虚假欺骗性信息。
3. 不得尝试破解、逆向工程、攻击本平台系统，或进行任何可能损害平台稳定运行的操作。
4. 不得将本平台的AI能力用于生成有害内容，包括但不限于：歧视性内容、骚扰内容、虚假信息等。
5. 不得将AI生成内容伪装为真实人类创作进行学术欺诈。`,
  },
  {
    icon: Ban,
    title: '四、禁止行为',
    content: `以下行为被明确禁止，违者将面临账号封禁、法律追责等处理措施：

1. **学术不端**：使用本平台AI功能代替完成作业、考试等学术任务，并以此进行欺骗。
2. **系统滥用**：通过自动化脚本、爬虫或其他技术手段大量调用API、抓取数据。
3. **恶意评测**：故意输入有害提示词（Prompt Injection）企图绕过安全过滤，或测试系统安全漏洞。
4. **商业牟利**：未经授权将本平台内容或AI生成内容进行商业销售、转授权。
5. **账户交易**：买卖、租借、转让账户或会员资格。
6. **骚扰行为**：通过本平台的任何功能对其他用户或平台工作人员进行骚扰、威胁或诽谤。`,
  },
  {
    icon: FileText,
    title: '五、知识产权',
    content: `1. **平台内容归属**：本平台的设计、代码、界面、文字、图形、数据等内容，其知识产权归我们所有，受法律保护。未经授权，不得复制、修改、分发或用于商业目的。
2. **用户内容授权**：您上传或创建的内容（笔记、知识库文件等），知识产权归您所有。但您授权我们在提供服务必要范围内使用您的内容（如：将笔记内容用于AI检索增强）。
3. **AI生成内容**：由本平台AI功能生成的内容，您可将其用于个人学习目的。商业使用须遵守相关AI服务商的条款，我们不对AI生成内容的版权归属作出保证。
4. **侵权处理**：如您认为本平台侵犯了您的知识产权，请通过本协议末尾的联系方式联系我们，我们将依法处理。`,
  },
  {
    icon: AlertTriangle,
    title: '六、免责声明与责任限制',
    content: `1. **AI内容准确性**：本平台提供的AI辅导、解析等内容仅供参考，不能保证100%准确。请结合官方教材、权威资料进行学习，重要内容以官方来源为准。
2. **服务可用性**：我们将尽力保证平台稳定运行，但不对因网络故障、服务器维护、不可抗力等原因导致的服务中断承担责任。
3. **第三方服务**：本平台集成的第三方AI服务（DeepSeek等）的内容由第三方提供，我们不对第三方服务的可用性和内容准确性负责。
4. **学习效果**：学习成效受个人因素影响，我们不保证使用本平台后必然达到特定学习效果。
5. **责任上限**：在法律允许的最大范围内，我们对您因使用本平台而产生的任何间接损失、数据丢失等不承担责任，直接损失赔偿不超过您在过去12个月内为本平台服务支付的费用。`,
  },
  {
    icon: HelpCircle,
    title: '七、服务变更与终止',
    content: `1. **服务调整**：我们有权根据业务发展需要，随时对本平台的功能、内容或服务方式进行调整，无需单独通知。重大调整将通过公告或邮件提前通知。
2. **账号封禁**：如您违反本协议，我们有权暂停或终止您的账号，且无需承担任何赔偿责任。
3. **服务终止**：如本平台决定停止运营，我们将提前30天通过公告或邮件通知，您可在此期间导出个人数据。
4. **用户主动注销**：您可随时申请注销账号。注销后，您的账号数据将被删除，且该操作不可逆。注销前请务必导出需要保留的数据。`,
  },
  {
    icon: RefreshCw,
    title: '八、协议的修改',
    content: `1. **修改权利**：我们保留随时修改本协议的权利。协议修改后将在本平台发布，并注明修改日期。
2. **通知方式**：重大修改将通过平台公告或注册邮件提前14天通知您。
3. **视为接受**：修改后继续使用本平台服务，即视为您接受修改后的协议。如不接受修改，请停止使用本平台并申请注销账号。`,
  },
  {
    icon: Scale,
    title: '九、法律适用与争议解决',
    content: `1. **适用法律**：本协议的解释、执行及争议解决，适用中华人民共和国法律（不含香港、澳门、台湾地区法律）。
2. **友好协商**：如发生争议，双方应首先通过友好协商解决。协商不成的，可提交有管辖权的人民法院诉讼解决。
3. **争议通知**：您须在争议发生后12个月内以书面形式通知我们，否则视为放弃相关权利。`,
  },
  {
    icon: Phone,
    title: '十、联系方式',
    content: `如您对本用户协议有任何问题或建议，欢迎通过以下方式联系我们：

- **电子邮件**：support@zhixuebang.com
- **用户反馈**：登录后通过"设置 → 反馈与帮助"提交
- **处理时限**：我们承诺在5个工作日内回复一般咨询，紧急安全问题24小时内响应

本协议最后更新日期：2025年7月1日
本协议生效日期：2025年7月1日`,
  },
];

export default function TermsPage() {
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
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-3">用户协议</h1>
          <p className="text-muted-foreground text-lg">智学帮 AI 学习系统</p>
          <p className="text-sm text-muted-foreground mt-2">最后更新：2025年7月1日 · 生效日期：2025年7月1日</p>
        </div>

        {/* 引言 */}
        <div className="glass-card rounded-2xl p-6 mb-8 border-l-4 glow-card" style={{ borderLeftColor: '#7C3AED' }}>
          <p className="text-muted-foreground leading-relaxed">
            本用户协议（以下简称"本协议"）是您（以下简称"用户"或"您"）与智学帮 AI 学习系统
            （以下简称"本平台"、"我们"）之间，关于您使用本平台服务所订立的具有法律约束力的协议。
          </p>
          <p className="text-muted-foreground leading-relaxed mt-3 font-medium text-foreground">
            请您在注册账号或使用本平台前，仔细阅读并充分理解本协议各条款，特别是<span className="text-primary">免责声明、责任限制及禁止行为</span>等重要条款（已标注重点）。
            如您对本协议有任何疑问，请联系我们进行咨询后再决定是否接受。
          </p>
        </div>

        {/* 各章节 */}
        <div className="space-y-6">
          {SECTIONS.map(({ icon: Icon, title, content }) => (
            <div key={title} className="glass-card rounded-2xl p-6 glow-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)' }}>
                  <Icon className="w-5 h-5" style={{ color: '#7C3AED' }} />
                </div>
                <h2 className="text-xl font-semibold text-foreground">{title}</h2>
              </div>
              <div className="text-sm text-muted-foreground leading-relaxed">
                {content.split('\n').map((line, i) => {
                  const trimmed = line.trim();
                  if (!trimmed) return <div key={i} className="h-1" />;
                  if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
                    return <p key={i} className="font-semibold text-foreground mt-2 mb-1">{trimmed.replace(/\*\*/g, '')}</p>;
                  }
                  return (
                    <p key={i} className="mt-1" dangerouslySetInnerHTML={{
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
          <Link to="/privacy" className="text-sm text-primary hover:underline">查看隐私政策 →</Link>
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
