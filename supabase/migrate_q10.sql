}', 'coding', NULL, '错误：scanf中num前缺少&。修正：scanf("%d", &num);', 'scanf需要变量的地址，正确写法是&num。修正后程序可正确读取输入。', 'easy', NULL, NULL, '顺序结构与基本输入输出', '2026-07-05T11:59:54.019431+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('17df060a-b49e-5e49-a6bd-df5ef9e051d6', 'c06969f4-d02e-552a-9d04-d4f0375d0728', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '编写程序，从键盘输入一个小数（float类型），输出它的整数部分和小数部分（提示：使用强制类型转换）。', 'coding', NULL, '#include <stdio.h>
int main() {
    float f;
    int intPart;
    float fracPart;
    printf("请输入一个小数：");
    scanf("%f", &f);
    intPart = (int)f;
    fracPart = f - intPart;
    printf("整数部分：%d\\n", intPart);
    printf("小数部分：%f\\n", fracPart);
    return 0;
}', '程序顺序执行：定义变量，输入浮点数，通过强制类型转换取整数部分，再用原数减整数部分得小数部分，最后输出。', 'easy', NULL, NULL, '顺序结构与基本输入输出', '2026-07-05T11:59:54.019431+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('99dd360a-1433-5af3-80c1-457eac5e965f', 'c06969f4-d02e-552a-9d04-d4f0375d0728', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '阅读程序，写出输出结果：
#include <stdio.h>
int main() {
    int a = 10, b = 20, c;
    c = a + b;
    printf("c=%d\\n", c);
    c = a - b;
    printf("c=%d\\n", c);
    return 0;
}', 'coding', NULL, '输出：
c=30
c=-10
执行过程：a=10,b=20；第一次赋值c=10+20=30，输出c=30；第二次赋值c=10-20=-10，输出c=-10。', '程序按顺序执行，变量c被先后赋值为30和-10，两次printf分别输出当前c的值。', 'easy', NULL, NULL, '顺序结构与基本输入输出', '2026-07-05T11:59:54.019431+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('f48778b3-ef53-5ec1-bd55-befabef305e4', 'c06969f4-d02e-552a-9d04-d4f0375d0728', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '在C语言中，if-else语句中条件表达式的值为多少时，执行if后面的语句块？', 'choice', '["A. 0", "B. 非零值", "C. 1", "D. 负数"]', 'B', 'C语言中，条件表达式的结果为整型，非零值被视为真，执行if后面的语句块；零值被视为假，执行else后面的语句块。', 'easy', NULL, NULL, 'if-else 分支结构', '2026-07-05T11:59:54.019431+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('4e3199fd-3b30-5d4a-a935-d9f05c72ab89', 'c06969f4-d02e-552a-9d04-d4f0375d0728', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '以下代码的输出结果是？
int a = 5;
if (a > 10)
    printf("A");
else
    printf("B");', 'choice', '["A. A", "B. B", "C. 无输出", "D. 编译错误"]', 'B', 'a的值为5，条件a>10为假，因此执行else后面的语句，输出B。', 'easy', NULL, NULL, 'if-else 分支结构', '2026-07-05T11:59:54.019431+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('ce4c2819-2b11-5a0b-83dd-91bb66d11131', 'c06969f4-d02e-552a-9d04-d4f0375d0728', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '关于if-else嵌套，下列说法正确的是？', 'choice', '["A. 嵌套层次越深越好", "B. else总是与最近的未配对的if配对", "C. else可以单独使用", "D. 嵌套时不允许使用大括号"]', 'B', 'C语言中，else与最近的未配对的if配对，这是else的匹配规则。嵌套过深会降低可读性，else不能单独使用，大括号可以明确配对关系。', 'easy', NULL, NULL, 'if-else 分支结构', '2026-07-05T11:59:54.019431+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('366703d7-7d4d-56e9-879f-61260848d6f4', 'c06969f4-d02e-552a-9d04-d4f0375d0728', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '执行以下代码后，输出结果是？
int x = 0;
if (x = 1)
    printf("真");
else
    printf("假");', 'choice', '["A. 真", "B. 假", "C. 编译错误", "D. 无输出"]', 'A', '条件表达式x=1是赋值语句，将1赋给x，表达式的值为1（非零），被视为真，因此输出“真”。这是一个常见的陷阱，应使用==进行比较。', 'easy', NULL, NULL, 'if-else 分支结构', '2026-07-05T11:59:54.019431+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('6d4567db-c197-5fad-9050-a4787bc8e2f2', 'c06969f4-d02e-552a-9d04-d4f0375d0728', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '以下代码中，如果score=75，输出结果是？
if (score >= 90)
    printf("A");
else if (score >= 80)
    printf("B");
else if (score >= 70)
    printf("C");
else
    printf("D");', 'choice', '["A. A", "B. B", "C. C", "D. D"]', 'C', 'score=75，不满足score>=90和score>=80，但满足score>=70，因此执行对应的printf，输出C。', 'easy', NULL, NULL, 'if-else 分支结构', '2026-07-05T11:59:54.019431+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('08597482-247e-5f31-8a58-805028b46dd7', 'c06969f4-d02e-552a-9d04-d4f0375d0728', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '在C语言中，if后面的条件表达式必须用括号括起来。', 'choice', '["A. 正确", "B. 错误"]', 'A', 'C语言语法规定，if后面的条件表达式必须用圆括号括起来，这是基本语法要求。', 'easy', NULL, NULL, 'if-else 分支结构', '2026-07-05T11:59:54.019431+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('5e00c21e-f058-5d73-83a7-2e59daf71dea', 'c06969f4-d02e-552a-9d04-d4f0375d0728', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', 'if-else语句中的else分支可以省略不写。', 'choice', '["A. 正确", "B. 错误"]', 'A', 'else是可选的，可以单独使用if，当条件为假时，不执行任何操作。', 'easy', NULL, NULL, 'if-else 分支结构', '2026-07-05T11:59:54.019431+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('2125e5bf-2da1-509d-9fdd-290103bb7def', 'c06969f4-d02e-552a-9d04-d4f0375d0728', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '以下代码中，无论x为何值，都会输出“相等”。
int x = 5;
if (x = 5)
    printf("相等");', 'choice', '["A. 正确", "B. 错误"]', 'B', '条件表达式x=5是赋值，结果为5（非零），始终为真，因此总是输出“相等”。但这是赋值而非比较，不是程序本意，逻辑上错误。', 'easy', NULL, NULL, 'if-else 分支结构', '2026-07-05T11:59:54.019431+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('2e31129f-33e6-5595-a519-f07e02bbdae1', 'c06969f4-d02e-552a-9d04-d4f0375d0728', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '在C语言中，条件表达式可以是任意类型的表达式，只要结果能转换为整型。', 'choice', '["A. 正确", "B. 错误"]', 'A', 'C语言中，条件表达式可以是任何标量类型（如整型、浮点型、指针等），最终会转换为整型判断真伪，非零为真，零为假。', 'easy', NULL, NULL, 'if-else 分支结构', '2026-07-05T11:59:54.019431+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('e4860d81-0b41-581f-ae6b-d21f48557321', 'c06969f4-d02e-552a-9d04-d4f0375d0728', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', 'else if 结构实际上就是嵌套的 if-else，只是书写更简洁。', 'choice', '["A. 正确", "B. 错误"]', 'A', 'else if 是嵌套if-else的简写形式，用于实现多分支判断，可读性更好。', 'easy', NULL, NULL, 'if-else 分支结构', '2026-07-05T11:59:54.019431+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('b352108b-09c1-55bd-9074-d9fe03beb439', 'c06969f4-d02e-552a-9d04-d4f0375d0728', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '以下代码的功能是判断一个整数是奇数还是偶数，请填空：
if (num % 2 ___ 0)
    printf("偶数");
else
    printf("奇数");', 'fill', NULL, '==', '判断偶数使用num % 2 == 0，如果余数为0则是偶数。', 'easy', NULL, NULL, 'if-else 分支结构', '2026-07-05T11:59:54.019431+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('29f7576d-e5d0-5315-9384-c2fbca775612', 'c06969f4-d02e-552a-9d04-d4f0375d0728', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '以下代码输出结果是___。
int a = 3, b = 5;
if (a > b)
    printf("%d", a);
else
    printf("%d", b);', 'fill', NULL, '5', 'a=3, b=5，条件a>b为假，执行else分支，输出b的值5。', 'easy', NULL, NULL, 'if-else 分支结构', '2026-07-05T11:59:54.019431+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('764db1c8-17df-5af3-b065-52c0538894f1', 'c06969f4-d02e-552a-9d04-d4f0375d0728', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '以下代码中，若输入为0，输出结果是___。
int x;
scanf("%d", &x);
if (x)
    printf("非零");
else
    printf("零");', 'fill', NULL, '零', 'x=0，条件表达式x的值为0（假），执行else分支，输出“零”。', 'medium', NULL, NULL, 'if-else 分支结构', '2026-07-05T11:59:54.019431+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('e94b123b-fe1b-5662-b584-cdb9b5a38561', 'c06969f4-d02e-552a-9d04-d4f0375d0728', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '以下代码中，若x=10，y=20，输出结果是___。
if (x < y)
    if (x > 5)
        printf("A");
    else
        printf("B");
else
    printf("C");', 'fill', NULL, 'A', 'x<y为真，进入内层if；内层条件x>5为真，输出A。注意else与最近的if配对，即内层if的else。', 'medium', NULL, NULL, 'if-else 分支结构', '2026-07-05T11:59:54.019431+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('4aaf3698-8e56-5a91-bea0-bcdddd43eb2e', 'c06969f4-d02e-552a-9d04-d4f0375d0728', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '将以下if-else语句改写为条件表达式（三目运算符）的形式：
if (a > b)
    max = a;
else
    max = b;
填空：max = a > b ___ a ___ b;', 'fill', NULL, '? :', '三目运算符格式：条件 ? 表达式1 : 表达式2，所以填 ? 和 :。', 'medium', NULL, NULL, 'if-else 分支结构', '2026-07-05T11:59:54.019431+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('bb6829d2-94d6-5e79-924e-70622c4d170c', 'c06969f4-d02e-552a-9d04-d4f0375d0728', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '编写一个C程序，输入一个整数，判断它是正数、负数还是零，并输出相应信息。要求使用if-else if-else结构。', 'coding', NULL, '#include <stdio.h>
int main() {
    int num;
    scanf("%d", &num);
    if (num > 0)
        printf("正数\\n");
    else if (num < 0)
        printf("负数\\n");
    else
        printf("零\\n");
    return 0;
}', '使用if-else if-else实现多分支：首先判断是否大于0，是则输出正数；否则判断是否小于0，是则输出负数；否则输出零。', 'medium', NULL, NULL, 'if-else 分支结构', '2026-07-05T11:59:54.019431+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('057c3931-1fe4-5072-af92-7917d2c28bd2', 'c06969f4-d02e-552a-9d04-d4f0375d0728', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '请写出以下程序的运行结果，并分析执行过程。
#include <stdio.h>
int main() {
    int a = 10, b = 20, c = 30;
    if (a > b)
        if (b > c)
            printf("%d", a);
        else
            printf("%d", b);
    else
        printf("%d", c);
    return 0;
}', 'coding', NULL, '运行结果为：30', '外层if条件a>b为假（10>20不成立），因此执行外层else分支，直接输出c的值30。内层的if-else不会被执行。', 'medium', NULL, NULL, 'if-else 分支结构', '2026-07-05T11:59:54.019431+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('d93ae6c0-221e-56e8-bb99-6c796ca1b9db', 'c06969f4-d02e-552a-9d04-d4f0375d0728', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '编写程序，输入三个整数，输出其中的最大值。要求使用if-else嵌套实现，不允许使用逻辑运算符。', 'coding', NULL, '#include <stdio.h>
int main() {
    int a, b, c, max;
    scanf("%d %d %d", &a, &b, &c);
    if (a > b) {
        if (a > c)
            max = a;
        else
            max = c;
    } else {
        if (b > c)
            max = b;
        else
            max = c;
    }
    printf("%d\\n", max);
    return 0;
}', '先比较a和b，若a>b，则最大值在a和c中；否则最大值在b和c中。再通过内层if-else找出较大者，赋值给max。', 'medium', NULL, NULL, 'if-else 分支结构', '2026-07-05T11:59:54.019431+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('66daedc6-d88e-50a3-ae0a-e395c6d983c5', 'c06969f4-d02e-552a-9d04-d4f0375d0728', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '以下程序的功能是判断年份是否为闰年。请补全代码并说明判断逻辑。
#include <stdio.h>
int main() {
    int year;
    scanf("%d", &year);
    if (year % 400 == 0)
        printf("闰年\\n");
    else if (___)
        printf("闰年\\n");
    else
        printf("不是闰年\\n");
    return 0;
}', 'coding', NULL, '填空：year % 4 == 0 && year % 100 != 0', '闰年规则：能被400整除，或者能被4整除但不能被100整除。第一个if处理能被400整除的情况；else if处理能被4整除但不能被100整除的情况；其余不是闰年。', 'medium', NULL, NULL, 'if-else 分支结构', '2026-07-05T11:59:54.019431+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('4f9bcc57-d530-5f7f-82f7-0b39e36c4b0c', 'c06969f4-d02e-552a-9d04-d4f0375d0728', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '请分析以下代码的输出结果，并指出其中可能存在的逻辑错误（如果有）。
#include <stdio.h>
int main() {
    int x = 0;
    if (x = 0)
        printf("x为零");
    else
        printf("x非零");
    return 0;
}', 'coding', NULL, '输出结果为：x非零', '条件表达式x=0是赋值语句，将0赋给x，表达式的值为0（假），因此执行else分支，输出“x非零”。这显然是逻辑错误，程序本意是判断x是否等于0，应使用x==0。', 'medium', NULL, NULL, 'if-else 分支结构', '2026-07-05T11:59:54.019431+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('332a7925-d2ab-5fcb-8dac-2e5c727350f3', 'c06969f4-d02e-552a-9d04-d4f0375d0728', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '在C语言中，switch语句后面括号内的表达式类型必须是？', 'choice', '["A. 整型或字符型", "B. 浮点型", "C. 字符串型", "D. 任意类型"]', 'A', 'switch语句要求表达式为整型或字符型（字符在C中视为整型），因为case标签必须为整型常量表达式。浮点型和字符串型不能用于switch，会编译错误。', 'medium', NULL, NULL, 'switch-case 多分支', '2026-07-05T11:59:54.019431+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('26f9ad96-209c-5559-bbd2-387d3a3efbe9', 'c06969f4-d02e-552a-9d04-d4f0375d0728', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '执行以下代码，输出结果是？
int x = 2;
switch(x) {
    case 1: printf("A"); break;
    case 2: printf("B");
    case 3: printf("C"); break;
    default: printf("D");
}', 'choice', '["A. B", "B. BC", "C. BD", "D. BCD"]', 'B', 'x=2匹配case 2，执行printf("B")，由于缺少break，发生穿透，继续执行case 3的printf("C")，遇到break后退出switch，因此输出"BC"。', 'medium', NULL, NULL, 'switch-case 多分支', '2026-07-05T11:59:54.019431+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('5df1143e-3ff0-544f-bdd2-19572cce8971', 'c06969f4-d02e-552a-9d04-d4f0375d0728', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '关于switch语句中的default分支，下列说法正确的是？', 'choice', '["A. 必须放在所有case之后", "B. 可以放在任意位置，但通常放在最后", "C. 每个switch必须有default", "D. default分支不能使用break"]', 'B', 'default可以放在任意位置，但通常放在最后以增强可读性。它不是必须的，且可以使用break。', 'medium', NULL, NULL, 'switch-case 多分支', '2026-07-05T11:59:54.019431+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('43a5f50a-a473-5780-bdb7-d584e405d6d4', 'c06969f4-d02e-552a-9d04-d4f0375d0728', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '下列代码中，变量a的值是多少？
int a = 0;
int b = 3;
switch(b) {
    case 1: a = 10; break;
    case 2: a = 20; break;
    default: a = 30;
}', 'choice', '["A. 0", "B. 10", "C. 20", "D. 30"]', 'D', 'b=3，没有匹配的case，因此执行default分支，将a赋值为30。', 'medium', NULL, NULL, 'switch-case 多分支', '2026-07-05T11:59:54.019431+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('d1519cbf-0bb7-512e-a85c-6a8d9822354d', 'c06969f4-d02e-552a-9d04-d4f0375d0728', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '以下哪个关键字用于跳出switch语句，防止穿透？', 'choice', '["A. continue", "B. break", "C. return", "D. exit"]', 'B', 'break用于跳出switch或循环结构。在switch中，break可以阻止执行流进入下一个case。continue仅用于循环，return用于函数返回，exit用于终止程序。', 'medium', NULL, NULL, 'switch-case 多分支', '2026-07-05T11:59:54.019431+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('a6cb130f-79fa-5e78-a6b2-ee5100b55d2a', 'c06969f4-d02e-552a-9d04-d4f0375d0728', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', 'switch语句中，case标签的值必须是常量表达式。', 'choice', '["A. 正确", "B. 错误"]', 'A', 'C语言规定case后面的值必须是整型常量表达式，不能是变量或非常量表达式，因为编译器需要在编译时构建跳转表。', 'medium', NULL, NULL, 'switch-case 多分支', '2026-07-05T11:59:54.019431+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('daa192b7-70da-586f-9351-2f84f5be042f', 'c06969f4-d02e-552a-9d04-d4f0375d0728', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '在switch语句中，所有case标签的值可以相同。', 'choice', '["A. 正确", "B. 错误"]', 'B', 'case标签的值必须唯一，不能重复。如果出现重复值，编译器会报错。', 'medium', NULL, NULL, 'switch-case 多分支', '2026-07-05T11:59:54.019431+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('9eefeb07-502e-5eb0-a6c1-6e08e5b98e66', 'c06969f4-d02e-552a-9d04-d4f0375d0728', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', 'switch语句比if-else if链执行效率一定更高。', 'choice', '["A. 正确", "B. 错误"]', 'B', 'switch语句在case值连续或密集时可能通过跳转表高效执行，但如果case值稀疏，编译器可能使用二分查找或顺序比较，效率不一定优于if-else if链。', 'medium', NULL, NULL, 'switch-case 多分支', '2026-07-05T11:59:54.019431+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('b2378a10-0f40-5e16-bdf3-1dcefad7d844', 'c06969f4-d02e-552a-9d04-d4f0375d0728', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', 'switch语句中，如果没有任何case匹配且没有default分支，则switch语句不执行任何操作。', 'choice', '["A. 正确", "B. 错误"]', 'A', '当表达式的值与所有case都不匹配且没有default时，程序直接跳过整个switch结构，不执行任何分支。', 'medium', NULL, NULL, 'switch-case 多分支', '2026-07-05T11:59:54.019431+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('0b27ea9a-60c4-5dce-9a0e-3478085f65e4', 'c06969f4-d02e-552a-9d04-d4f0375d0728', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '在switch语句中，break只能用于跳出switch，不能用于其他场合。', 'choice', '["A. 正确", "B. 错误"]', 'B', 'break也可以用于跳出循环（for、while、do-while），并非switch专用。', 'medium', NULL, NULL, 'switch-case 多分支', '2026-07-05T11:59:54.019431+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('b02b7d5a-f625-528d-a4ac-f73ee0e80ee3', 'c06969f4-d02e-552a-9d04-d4f0375d0728', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', 'switch语句中，用于处理所有未匹配情况的标签是___。', 'fill', NULL, 'default', 'default分支是可选的，用于处理所有未在case中列出的值，相当于if-else中的else。', 'medium', NULL, NULL, 'switch-case 多分支', '2026-07-05T11:59:54.18448+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('c984d653-2d43-5d62-ba61-7450a8758071', 'c06969f4-d02e-552a-9d04-d4f0375d0728', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '在switch中，如果case后没有___，则会发生穿透（fall-through）。', 'fill', NULL, 'break', '穿透是指执行完一个case后继续执行下一个case的代码，直到遇到break或switch结束。', 'medium', NULL, NULL, 'switch-case 多分支', '2026-07-05T11:59:54.18448+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('b98a4b05-5004-50ac-8984-138a664aa719', 'c06969f4-d02e-552a-9d04-d4f0375d0728', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '假设int day = 3; 执行switch(day) { case 1: ... case 2: ... case 3: printf("三"); } 输出结果为___。', 'fill', NULL, '三', 'day=3，匹配case 3，执行printf输出"三"。注意该case后没有break，但因为没有后续case，所以不会穿透。', 'medium', NULL, NULL, 'switch-case 多分支', '2026-07-05T11:59:54.18448+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('2b6982f1-05c8-5b0e-8cb8-ab8b796717ea', 'c06969f4-d02e-552a-9d04-d4f0375d0728', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', 'switch语句中，case标签后面必须跟一个___和一个冒号。', 'fill', NULL, '常量表达式', 'case标签的格式为 case 常量表达式:，常量表达式在编译时求值，且必须为整型。', 'medium', NULL, NULL, 'switch-case 多分支', '2026-07-05T11:59:54.18448+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('31800e1a-2ff7-5506-9c33-04c589d217cd', 'c06969f4-d02e-552a-9d04-d4f0375d0728', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '执行以下代码后，输出结果为___。
int n = 5;
switch(n) {
    case 1: printf("A"); break;
    case 5: printf("B");
    default: printf("C");
}', 'fill', NULL, 'BC', 'n=5匹配case 5，输出"B"，由于没有break，穿透到default，输出"C"，因此结果为"BC"。', 'medium', NULL, NULL, 'switch-case 多分支', '2026-07-05T11:59:54.18448+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('6e19b91e-1a41-584e-811f-4bdd857bcc1f', 'c06969f4-d02e-552a-9d04-d4f0375d0728', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '编写一个C程序，使用switch语句将百分制成绩（整数）转换为等级：90-100为''A''，80-89为''B''，70-79为''C''，60-69为''D''，0-59为''E''。输入成绩为85，输出对应等级。', 'coding', NULL, '#include <stdio.h>
int main() {
    int score = 85;
    int grade = score / 10;
    switch(grade) {
        case 10:
        case 9: printf("A"); break;
        case 8: printf("B"); break;
        case 7: printf("C"); break;
        case 6: printf("D"); break;
        default: printf("E");
    }
    return 0;
}
输出：B', '利用整除10将分数范围映射到0-10的整数。case 10和9对应90-100，case 8对应80-89，以此类推。85/10=8，匹配case 8，输出''B''。注意case 10穿透到case 9，共同处理100分的情况。', 'medium', NULL, NULL, 'switch-case 多分支', '2026-07-05T11:59:54.18448+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('03b79845-3ddf-5f0e-b473-344c2e6fc445', 'c06969f4-d02e-552a-9d04-d4f0375d0728', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '请分析以下代码的输出结果，并解释原因。
int x = 2, y = 3;
switch(x) {
    case 1: y++;
    case 2: y += 2;
    case 3: y += 3; break;
    default: y = 0;
}
printf("%d", y);', 'coding', NULL, '输出：8
原因：x=2匹配case 2，执行y+=2，此时y=5；由于没有break，穿透到case 3，执行y+=3，y=8；遇到break退出switch，因此输出8。', '考察switch穿透机制。case 2执行后未遇到break，继续执行case 3代码，直到break才退出。注意default未被执行。', 'medium', NULL, NULL, 'switch-case 多分支', '2026-07-05T11:59:54.18448+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('92e6a318-a57e-54a1-bab4-6a60c05a0628', 'c06969f4-d02e-552a-9d04-d4f0375d0728', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '请用switch语句实现一个简易计算器，根据运算符（+、-、*、/）对两个整数进行运算，并输出结果。假设输入为a=10, b=5, op=''*''。', 'coding', NULL, '#include <stdio.h>
int main() {
    int a = 10, b = 5;
    char op = ''*'';
    switch(op) {
        case ''+'': printf("%d", a+b); break;
        case ''-'': printf("%d", a-b); break;
        case ''*'': printf("%d", a*b); break;
        case ''/'': if(b!=0) printf("%d", a/b); else printf("除数不能为0"); break;
        default: printf("无效运算符");
    }
    return 0;
}
输出：50', 'switch根据运算符字符选择分支。op=''*''匹配case ''*''，执行a*b=50并输出。注意除法需检查除数是否为0。', 'medium', NULL, NULL, 'switch-case 多分支', '2026-07-05T11:59:54.18448+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('9b6697a7-3a11-5123-b5bc-211fe2a3e48f', 'c06969f4-d02e-552a-9d04-d4f0375d0728', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '以下代码段中，若输入为3，输出是什么？请说明执行流程。
int n;
scanf("%d", &n);
switch(n) {
    default: printf("X");
    case 1: printf("A");
    case 2: printf("B");
}', 'coding', NULL, '输出：XAB
执行流程：输入n=3，没有匹配的case，进入default分支，输出''X''；由于default后没有break，发生穿透，依次执行case 1和case 2的代码，输出''A''和''B''，直到switch结束。', 'default不一定放在最后，且穿透同样适用于default。即使default在前，也会依次执行后续case代码。', 'medium', NULL, NULL, 'switch-case 多分支', '2026-07-05T11:59:54.18448+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('24c69e27-368e-5c9c-b806-cf6560314ef7', 'c06969f4-d02e-552a-9d04-d4f0375d0728', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '请指出以下代码中的错误，并给出修正后的正确版本。
int a = 2;
switch(a) {
    case 1: printf("one");
    case 2.0: printf("two");
    case 3: printf("three");
}', 'coding', NULL, '错误：case 2.0使用了浮点常量，C语言不支持。修正：将case 2.0改为case 2。
正确代码：
int a = 2;
switch(a) {
    case 1: printf("one");
    case 2: printf("two");
    case 3: printf("three");
}', 'case标签必须是整型常量表达式，2.0是double类型，会导致编译错误。另外，每个case最好加上break以避免不必要的穿透，但本题未要求。', 'medium', NULL, NULL, 'switch-case 多分支', '2026-07-05T11:59:54.18448+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('3ea80d2f-0e61-525a-bd22-216cd06b6496', 'c06969f4-d02e-552a-9d04-d4f0375d0728', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '以下关于for循环的描述，正确的是？', 'choice', '["A. for循环的三个表达式都可以省略，但分号不能省略", "B. for循环只能用于已知循环次数的情况", "C. for循环的初始化表达式只能定义一个变量", "D. for循环的循环体至少会执行一次"]', 'A', 'for循环的三个表达式（初始化、条件、更新）都可以省略，但两个分号必须保留，例如 for(;;) 是合法的死循环。B错误，for循环也可用于未知次数；C错误，初始化可以定义多个变量（C99后支持），但语法上只能有一个定义语句；D错误，for循环先判断条件，可能一次都不执行。', 'hard', NULL, NULL, 'for/while/do-while 循环', '2026-07-05T11:59:54.18448+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('c46edc59-14d6-5f31-9d90-aa1f11a131b9', 'c06969f4-d02e-552a-9d04-d4f0375d0728', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '执行以下代码后，变量i的值是？
int i = 0;
while(i < 5) { i++; }', 'choice', '["A. 4", "B. 5", "C. 6", "D. 不确定"]', 'B', 'while循环中，i从0开始，每次循环i自增1，当i=4时条件为真，执行i++后i=5，再判断条件5<5为假，循环结束，因此i最终为5。', 'hard', NULL, NULL, 'for/while/do-while 循环', '2026-07-05T11:59:54.18448+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('b98f1ea0-e414-5d74-b40b-488443afdc41', 'c06969f4-d02e-552a-9d04-d4f0375d0728', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', 'do-while循环与while循环的主要区别是？', 'choice', '["A. do-while循环的循环体至少执行一次", "B. do-while循环不能使用break", "C. do-while循环的条件在循环体之前判断", "D. do-while循环只能用于整数条件"]', 'A', 'do-while循环先执行循环体再判断条件，因此至少执行一次；而while循环先判断条件，可能一次都不执行。B错误，do-while中可以使用break；C错误，do-while的条件在循环体之后判断；D错误，条件可以是任意表达式。', 'hard', NULL, NULL, 'for/while/do-while 循环', '2026-07-05T11:59:54.18448+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('57cb0053-8558-5107-8adb-7ae7cf37ab87', 'c06969f4-d02e-552a-9d04-d4f0375d0728', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '下列代码段中，输出结果是什么？
int i;
for(i=0; i<3; i++) {
  if(i==1) continue;
  printf("%d ", i);
}', 'choice', '["A. 0 1 2", "B. 0 2", "C. 1 2", "D. 0 1"]', 'B', 'for循环中i从0到2，当i==1时执行continue跳过本次循环的剩余部分，即不执行printf，因此只输出0和2。', 'hard', NULL, NULL, 'for/while/do-while 循环', '2026-07-05T11:59:54.18448+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('9b020734-caaa-51ed-8f00-01e50deb2cdb', 'c06969f4-d02e-552a-9d04-d4f0375d0728', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '以下代码会输出多少个"*"？
int i=0;
do {
  printf("*");
  i++;
} while(i < 0);', 'choice', '["A. 0个", "B. 1个", "C. 无限个", "D. 编译错误"]', 'B', 'do-while循环先执行一次循环体，输出一个''*''，然后i变为1，再判断条件i<0为假，循环结束，因此只输出1个''*''。', 'hard', NULL, NULL, 'for/while/do-while 循环', '2026-07-05T11:59:54.18448+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('192765c3-9549-5beb-9ca4-3a74e138af8a', 'c06969f4-d02e-552a-9d04-d4f0375d0728', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', 'for循环的初始化表达式只能执行一次。', 'choice', '["A. 正确", "B. 错误"]', 'A', 'for循环的执行流程中，初始化表达式仅在进入循环时执行一次，后续循环迭代不再执行初始化部分。', 'hard', NULL, NULL, 'for/while/do-while 循环', '2026-07-05T11:59:54.18448+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('adb1443f-a5f0-5234-978e-196a9af54c20', 'c06969f4-d02e-552a-9d04-d4f0375d0728', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', 'while循环中，如果条件表达式永远为真，则循环会无限执行下去。', 'choice', '["A. 正确", "B. 错误"]', 'A', '如果while的条件表达式始终为真（如while(1)），且循环体内没有break或return等退出语句，就会形成死循环。', 'hard', NULL, NULL, 'for/while/do-while 循环', '2026-07-05T11:59:54.18448+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('b1ea7bdc-2e1f-562b-bb04-211fa64277da', 'c06969f4-d02e-552a-9d04-d4f0375d0728', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', 'do-while循环的while后面的分号可以省略。', 'choice', '["A. 正确", "B. 错误"]', 'B', 'do-while循环的语法要求while(条件)后面必须有一个分号，表示语句结束，省略会导致编译错误。', 'hard', NULL, NULL, 'for/while/do-while 循环', '2026-07-05T11:59:54.18448+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('e6555562-47c5-5785-a740-35828bff96e6', 'c06969f4-d02e-552a-9d04-d4f0375d0728', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '在循环体内使用break语句会终止整个循环，而continue语句会跳过本次循环剩余代码进入下一次迭代。', 'choice', '["A. 正确", "B. 错误"]', 'A', 'break用于立即退出当前循环（或switch），continue用于跳过本次循环中continue之后的语句，直接进入下一次循环的条件判断（for循环中还会执行更新表达式）。', 'hard', NULL, NULL, 'for/while/do-while 循环', '2026-07-05T11:59:54.18448+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('18adc227-d7c0-5e41-995a-f6ae7147fe11', 'c06969f4-d02e-552a-9d04-d4f0375d0728', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', 'for(;;)是一个合法的死循环。', 'choice', '["A. 正确", "B. 错误"]', 'A', 'for循环的三个表达式都可以省略，但分号不能省略，for(;;)表示无条件循环，相当于while(1)，是合法的死循环。', 'hard', NULL, NULL, 'for/while/do-while 循环', '2026-07-05T11:59:54.18448+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('414c3b64-cf13-5cc5-8644-e1c2ff53654c', 'c06969f4-d02e-552a-9d04-d4f0375d0728', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '下列代码中，循环体执行的次数是___。
int i=10;
while(i>0) {
  i-=3;
}', 'fill', NULL, '4', 'i初始为10，每次减3：第一次i=7，第二次i=4，第三次i=1，第四次i=-2，此时i>0为假循环结束，共执行4次循环体。', 'hard', NULL, NULL, 'for/while/do-while 循环', '2026-07-05T11:59:54.18448+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('bd515366-3ac2-5df9-9cdb-0d303da8b3b2', 'c06969f4-d02e-552a-9d04-d4f0375d0728', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '下列for循环的空白处应填入___，使循环恰好执行5次。
for(int i=0; i<___; i++) { }', 'fill', NULL, '5', 'i从0开始，每次递增1，当i<5时循环执行，i=0,1,2,3,4共5次，因此条件为i<5，空位填5。', 'hard', NULL, NULL, 'for/while/do-while 循环', '2026-07-05T11:59:54.18448+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('d3845054-f7cc-5c3f-ba08-50cfd75c71d4', 'c06969f4-d02e-552a-9d04-d4f0375d0728', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '执行以下代码后，输出结果为___。
int i=0, sum=0;
do {
  sum += i;
  i++;
} while(i<3);
printf("%d", sum);', 'fill', NULL, '3', '循环执行过程：i=0时sum=0，i++后i=1；i=1时sum=1，i++后i=2；i=2时sum=3，i++后i=3；此时i<3为假，循环结束，sum=3。', 'hard', NULL, NULL, 'for/while/do-while 循环', '2026-07-05T11:59:54.18448+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('ee4104e5-a3e5-5179-8dc9-d54cfca14084', 'c06969f4-d02e-552a-9d04-d4f0375d0728', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '下列代码中，break语句执行后，变量i的值是___。
int i;
for(i=0; i<10; i++) {
  if(i==5) break;
}', 'fill', NULL, '5', 'for循环中i从0开始递增，当i==5时执行break退出循环，此时i的值为5，循环提前结束。', 'hard', NULL, NULL, 'for/while/do-while 循环', '2026-07-05T11:59:54.18448+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('aa0d5d5c-15d7-54f2-993e-95acd01c2e04', 'c06969f4-d02e-552a-9d04-d4f0375d0728', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '下列代码中，输出结果中数字的个数是___。
for(int i=1; i<=10; i++) {
  if(i%3==0) continue;
  printf("%d ", i);
}', 'fill', NULL, '7', 'i从1到10，共10个数，其中能被3整除的数有3,6,9共3个，continue跳过这些数，因此输出7个数。', 'hard', NULL, NULL, 'for/while/do-while 循环', '2026-07-05T11:59:54.18448+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('988edae1-90f5-5efa-9bf8-fc0117d275f6', 'c06969f4-d02e-552a-9d04-d4f0375d0728', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '编写一个C程序，使用while循环计算1到100之间所有奇数的和，并输出结果。', 'coding', NULL, '#include <stdio.h>
int main() {
    int i = 1, sum = 0;
    while(i <= 100) {
        if(i % 2 != 0) {
            sum += i;
        }
        i++;
    }
    printf("奇数和为: %d\\n", sum);
    return 0;
}
输出：奇数和为: 2500', '使用while循环遍历1到100，通过i%2!=0判断奇数，累加到sum中，每次循环i自增1，最终sum为2500。', 'hard', NULL, NULL, 'for/while/do-while 循环', '2026-07-05T11:59:54.18448+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('56fb54ac-9ff6-5078-a3a5-b4c327c90adb', 'c06969f4-d02e-552a-9d04-d4f0375d0728', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '请用for循环实现：输入一个正整数n，输出n的阶乘（n!），假设n不超过12。', 'coding', NULL, '#include <stdio.h>
int main() {
    int n, i;
    long long fact = 1;
    printf("请输入一个正整数n: ");
    scanf("%d", &n);
    for(i=1; i<=n; i++) {
        fact *= i;
    }
    printf("%d! = %lld\\n", n, fact);
    return 0;
}
例如输入5，输出120。', '使用for循环从1乘到n，累乘到fact变量中，注意n不超过12时结果在long long范围内。', 'hard', NULL, NULL, 'for/while/do-while 循环', '2026-07-05T11:59:54.18448+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('19d3215e-ad09-5f44-bf18-ed6d139563a3', 'c06969f4-d02e-552a-9d04-d4f0375d0728', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '分析以下代码的输出结果，并说明原因。
int i=0, j=0;
for(i=0; i<3; i++) {
  for(j=0; j<2; j++) {
    if(j==1) break;
    printf("(%d,%d) ", i, j);
  }
}', 'coding', NULL, '输出：(0,0) (1,0) (2,0)
原因：外层循环i从0到2，内层循环j从0到1，但当j==1时执行break跳出内层循环，因此内层循环只执行j=0的一次，所以每次i循环输出一个(i,0)。', 'break在内层循环中，只跳出当前内层循环，不影响外层循环。因此每次内层循环只输出j=0的情况。', 'hard', NULL, NULL, 'for/while/do-while 循环', '2026-07-05T11:59:54.18448+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('85c6dbdf-5cf8-54ea-bf46-b1d5c6302420', 'c06969f4-d02e-552a-9d04-d4f0375d0728', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '使用do-while循环编写程序，让用户输入一个正整数，然后输出该数的位数（例如输入12345，输出5）。要求：用户输入0时程序结束。', 'coding', NULL, '#include <stdio.h>
int main() {
    int num, temp, count;
    do {
        printf("请输入一个正整数(输入0退出): ");
        scanf("%d", &num);
        if(num == 0) break;
        temp = num;
        count = 0;
        do {
            count++;
            temp /= 10;
        } while(temp != 0);
        printf("%d的位数是: %d\\n", num, count);
    } while(1);
    return 0;
}', '外层do-while循环用于重复输入，内层do-while循环通过不断除以10统计位数，注意内层至少执行一次（因为至少有一位）。输入0时break退出外层循环。', 'hard', NULL, NULL, 'for/while/do-while 循环', '2026-07-05T11:59:54.18448+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('6e9f05fd-6529-5386-b175-58b82e708635', 'c06969f4-d02e-552a-9d04-d4f0375d0728', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '阅读以下代码，指出其中的错误并给出修正后的正确代码。
int i=0;
while(i<10);
{
  printf("%d ", i);
  i++;
}', 'coding', NULL, '错误：while(i<10);后面多了一个分号，导致循环体为空，形成死循环（条件永远不变），后面的花括号内的语句不属于循环体。
修正：去掉while后面的分号。
正确代码：
int i=0;
while(i<10) {
  printf("%d ", i);
  i++;
}', 'while语句后面直接跟分号表示循环体为空，并且条件i<10永远为真（i不变），造成死循环。应去掉分号使花括号内的语句成为循环体。', 'hard', NULL, NULL, 'for/while/do-while 循环', '2026-07-05T11:59:54.18448+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('8aaacda5-b812-5f97-89f0-fde342378443', '9ec67288-b3b7-562b-b50e-ea21f3c77c9d', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '以下程序是否有错误？如果有，请指出并改正。
#include <stdio.h>
int main() {
    void printMsg();
    printMsg();
    return 0;
}
void printMsg() {
    printf("Hello, world!\\n");
}', 'coding', NULL, '该程序没有语法错误。在main函数内部声明了printMsg的函数原型，然后调用，之后在全局作用域定义了printMsg函数。C语言允许在函数内部声明原型。因此程序可以正确输出"Hello, world!"。', '虽然通常将函数原型放在全局，但C语言也允许在函数内部声明原型，作用域仅限于该函数内部。本题考察函数声明的灵活性。', 'medium', NULL, NULL, '函数的定义与调用', '2026-07-05T11:59:54.785398+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('b1d6d673-a094-5f7b-9766-e1069b12db73', '9ec67288-b3b7-562b-b50e-ea21f3c77c9d', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '递归函数的基本思想是什么？', 'choice', '["A. 将复杂问题分解为更小的同类子问题", "B. 使用循环结构重复执行代码", "C. 通过全局变量传递数据", "D. 利用指针实现函数间的跳转"]', 'A', '递归的核心是将问题逐步简化为规模更小的同类问题，直到可以直接求解的基准情况。', 'medium', NULL, NULL, '递归函数', '2026-07-05T11:59:54.785398+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('b2942914-d392-5d36-ad2a-d0343ac7d14a', '9ec67288-b3b7-562b-b50e-ea21f3c77c9d', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '以下哪个是递归函数必须包含的部分？', 'choice', '["A. 循环语句", "B. 基准条件和递归条件", "C. 静态变量", "D. 全局变量"]', 'B', '递归函数必须包含基准条件（终止条件）和递归条件（调用自身），否则会导致无限递归。', 'medium', NULL, NULL, '递归函数', '2026-07-05T11:59:54.785398+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('d833f22e-4dae-5996-a4d6-e06c2f14e7d4', '9ec67288-b3b7-562b-b50e-ea21f3c77c9d', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '递归函数在执行过程中依赖于什么数据结构？', 'choice', '["A. 队列", "B. 栈", "C. 链表", "D. 数组"]', 'B', '递归调用利用函数调用栈，每次调用都会在栈上创建新的栈帧保存局部变量和返回地址。', 'medium', NULL, NULL, '递归函数', '2026-07-05T11:59:54.785398+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('e79a0a79-21af-57f7-a3ed-a429712c47ed', '9ec67288-b3b7-562b-b50e-ea21f3c77c9d', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '对于递归函数factorial(5)，共发生多少次递归调用（包括主调）？', 'choice', '["A. 4", "B. 5", "C. 6", "D. 3"]', 'B', 'factorial(5)调用factorial(4)……直到factorial(1)返回，共5次调用（factorial(5)到factorial(1)）。', 'medium', NULL, NULL, '递归函数', '2026-07-05T11:59:54.785398+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('9229ebe3-b1b1-5929-85e7-357bc620f630', '9ec67288-b3b7-562b-b50e-ea21f3c77c9d', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '递归函数相比迭代的主要缺点是什么？', 'choice', '["A. 代码可读性差", "B. 函数调用开销大，可能栈溢出", "C. 无法处理复杂问题", "D. 必须使用全局变量"]', 'B', '递归每次调用有函数调用开销，且深度过大时可能导致栈溢出，效率通常低于迭代。', 'medium', NULL, NULL, '递归函数', '2026-07-05T11:59:54.785398+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('fdd3e3c8-d741-58fc-9890-057c03ab6f7a', '9ec67288-b3b7-562b-b50e-ea21f3c77c9d', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '递归函数一定比迭代实现更高效。', 'choice', '["A. 正确", "B. 错误"]', 'B', '递归有函数调用开销，且可能栈溢出，通常效率低于迭代，但在某些场景代码更简洁。', 'medium', NULL, NULL, '递归函数', '2026-07-05T11:59:54.785398+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('265f4ca7-c716-5c54-a95f-779042fd3a1d', '9ec67288-b3b7-562b-b50e-ea21f3c77c9d', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '递归函数可以没有基准条件。', 'choice', '["A. 正确", "B. 错误"]', 'B', '缺少基准条件会导致无限递归，最终栈溢出，程序崩溃。', 'medium', NULL, NULL, '递归函数', '2026-07-05T11:59:54.785398+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('318d3bc9-da3c-52fb-b3e9-d7648790c54a', '9ec67288-b3b7-562b-b50e-ea21f3c77c9d', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '递归函数的每一次调用都会在栈上创建一个新的栈帧。', 'choice', '["A. 正确", "B. 错误"]', 'A', '每次递归调用都会在调用栈上分配新的栈帧，保存局部变量和返回地址。', 'medium', NULL, NULL, '递归函数', '2026-07-05T11:59:54.785398+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('68ffc4ab-fda0-520e-a677-c3fc59df57bc', '9ec67288-b3b7-562b-b50e-ea21f3c77c9d', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '使用递归解决斐波那契数列问题时，时间复杂度为O(n)。', 'choice', '["A. 正确", "B. 错误"]', 'B', '简单递归斐波那契的时间复杂度是O(2^n)，因为存在大量重复计算，而迭代才是O(n)。', 'medium', NULL, NULL, '递归函数', '2026-07-05T11:59:54.785398+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('2aa47632-baf0-516a-9a10-993b4e42d983', '9ec67288-b3b7-562b-b50e-ea21f3c77c9d', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '递归函数在回溯时会从最内层调用开始逐层返回结果。', 'choice', '["A. 正确", "B. 错误"]', 'A', '递归到达基准条件后，开始回溯，逐层将结果返回给上一层调用。', 'medium', NULL, NULL, '递归函数', '2026-07-05T11:59:54.785398+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('20cafa39-7314-56ea-a3ca-a1880ac081b8', '9ec67288-b3b7-562b-b50e-ea21f3c77c9d', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '递归函数必须包含两个关键部分：___和___。', 'fill', NULL, '基准条件, 递归条件', '递归函数需要基准条件（终止条件）和递归条件（调用自身），缺一不可。', 'hard', NULL, NULL, '递归函数', '2026-07-05T11:59:54.785398+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('45fdc43c-f445-5b18-8607-f2bfb77632cd', '9ec67288-b3b7-562b-b50e-ea21f3c77c9d', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '计算n的阶乘的递归函数中，基准条件是if (n ___ 1) return 1;', 'fill', NULL, '<=', '当n<=1时，阶乘结果为1，作为递归终止条件。', 'hard', NULL, NULL, '递归函数', '2026-07-05T11:59:54.785398+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('8ef5896e-4bef-58de-a390-6f67963f9ace', '9ec67288-b3b7-562b-b50e-ea21f3c77c9d', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '递归调用时，每次调用都会在___上创建一个新的栈帧。', 'fill', NULL, '栈（或函数调用栈）', '递归依赖于函数调用栈，每次调用压入新栈帧。', 'hard', NULL, NULL, '递归函数', '2026-07-05T11:59:54.785398+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('74b668a0-4d07-5a6c-9043-8ba70d092909', '9ec67288-b3b7-562b-b50e-ea21f3c77c9d', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '递归函数factorial(4)的返回值为___。', 'fill', NULL, '24', 'factorial(4)=4*3*2*1=24。', 'hard', NULL, NULL, '递归函数', '2026-07-05T11:59:54.785398+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('b2a51c95-44ba-5d6d-9abb-a41c9d2f0ab5', '9ec67288-b3b7-562b-b50e-ea21f3c77c9d', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '递归解决汉诺塔问题中，移动n个盘子需要调用递归函数___次（用n表示）。', 'fill', NULL, '2^n - 1', '汉诺塔递归移动次数为2^n - 1。', 'hard', NULL, NULL, '递归函数', '2026-07-05T11:59:54.785398+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('049a62c6-b645-5e34-b7c7-6acc37b750bc', '9ec67288-b3b7-562b-b50e-ea21f3c77c9d', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '请用递归函数实现计算斐波那契数列的第n项（n从0开始，F(0)=0, F(1)=1），并分析其时间复杂度。', 'coding', NULL, '参考代码：
int fib(int n) {
    if (n <= 1) return n;
    return fib(n-1) + fib(n-2);
}
时间复杂度为O(2^n)，因为每次调用产生两个子调用，形成指数级增长。', '解题思路：基准条件n<=1直接返回n；递归条件返回前两项之和。由于大量重复计算，时间复杂度高。', 'hard', NULL, NULL, '递归函数', '2026-07-05T11:59:54.785398+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('13e08cf2-5144-5400-a362-4e9033394679', '9ec67288-b3b7-562b-b50e-ea21f3c77c9d', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '使用递归函数求数组元素的和。数组为int arr[] = {2, 5, 8, 3}; 写出递归函数并计算sum(arr, 4)的结果。', 'coding', NULL, '参考代码：
int sum(int arr[], int n) {
    if (n == 0) return 0;
    return arr[n-1] + sum(arr, n-1);
}
sum(arr, 4) = 2+5+8+3 = 18。', '解题思路：基准条件n==0时返回0；递归条件返回最后一个元素加上前n-1个元素的和。', 'hard', NULL, NULL, '递归函数', '2026-07-05T11:59:54.785398+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('e0037b75-05d9-5350-b97e-49a7a69ed4a4', '9ec67288-b3b7-562b-b50e-ea21f3c77c9d', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '编写递归函数实现字符串反转，并说明递归过程。例如输入"abc"，输出"cba"。', 'coding', NULL, '参考代码：
void reverse(char *s, int left, int right) {
    if (left >= right) return;
    char temp = s[left];
    s[left] = s[right];
    s[right] = temp;
    reverse(s, left+1, right-1);
}
过程：交换首尾字符，递归处理内部子串。', '解题思路：基准条件left>=right时停止；递归条件交换左右字符后递归调用缩小范围。', 'hard', NULL, NULL, '递归函数', '2026-07-05T11:59:54.785398+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('846399de-0838-55f7-bff4-9f024146d9f4', '9ec67288-b3b7-562b-b50e-ea21f3c77c9d', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '用递归函数判断一个字符串是否为回文。例如"level"是回文，"hello"不是。写出函数并说明。', 'coding', NULL, '参考代码：
int isPalindrome(char *s, int start, int end) {
    if (start >= end) return 1;
    if (s[start] != s[end]) return 0;
    return isPalindrome(s, start+1, end-1);
}
调用isPalindrome("level", 0, 4)返回1。', '解题思路：基准条件start>=end时返回1（是回文）；若不相等返回0；否则递归检查内部子串。', 'hard', NULL, NULL, '递归函数', '2026-07-05T11:59:54.785398+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('dbdf2e0a-1541-5546-9e65-82ac301f6e3d', '9ec67288-b3b7-562b-b50e-ea21f3c77c9d', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '使用递归实现二分查找算法。给定有序数组int arr[] = {1,3,5,7,9}，查找目标值7，写出递归函数并给出查找过程。', 'coding', NULL, '参考代码：
int binarySearch(int arr[], int low, int high, int target) {
    if (low > high) return -1;
    int mid = (low+high)/2;
    if (arr[mid] == target) return mid;
    else if (arr[mid] > target) return binarySearch(arr, low, mid-1, target);
    else return binarySearch(arr, mid+1, high, target);
}
查找7：low=0,high=4,mid=2(arr[2]=5<7)->low=3,high=4,mid=3(arr[3]=7)返回3。', '解题思路：基准条件low>high返回-1；找到目标返回mid；否则根据大小在左半或右半递归查找。', 'hard', NULL, NULL, '递归函数', '2026-07-05T11:59:54.785398+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('fcb72006-5663-5dd0-999e-86aaacc63688', '89353830-b249-587d-ab7f-1a4723c827be', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '如果fopen()以"r"模式打开一个不存在的文件，程序会立即崩溃。', 'choice', '["A. 正确", "B. 错误"]', 'B', 'fopen()以"r"模式打开不存在的文件会返回NULL，但不会导致程序崩溃。程序员应检查返回值并适当处理错误。', 'medium', NULL, NULL, '文件的打开与关闭', '2026-07-05T11:59:55.381291+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('bcc34f3a-cdc6-5988-bf3d-6f8d65876d9b', '89353830-b249-587d-ab7f-1a4723c827be', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '在同一程序中，可以多次打开同一个文件，但每次都需要使用不同的FILE指针。', 'choice', '["A. 正确", "B. 错误"]', 'A', '可以多次调用fopen()打开同一个文件，每次调用返回独立的FILE指针，各自拥有独立的文件位置指示器和缓冲区。', 'medium', NULL, NULL, '文件的打开与关闭', '2026-07-05T11:59:55.381291+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('78b191a5-2e28-5e41-a660-58f3f13ab5c0', '89353830-b249-587d-ab7f-1a4723c827be', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', 'fopen()函数的原型是：FILE *fopen(const char *filename, const char *___);', 'fill', NULL, 'mode', 'fopen()的第二个参数是mode，即文件打开模式，如"r"、"w"、"a"等，用于指定文件的使用方式。', 'medium', NULL, NULL, '文件的打开与关闭', '2026-07-05T11:59:55.381291+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('5d08bcda-f6c5-5ea6-a60b-a27744735332', '89353830-b249-587d-ab7f-1a4723c827be', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '若文件打开失败，fopen()返回___。', 'fill', NULL, 'NULL', '当文件无法打开时（如文件不存在、权限不足），fopen()返回空指针NULL，程序应通过检查返回值来避免后续错误。', 'medium', NULL, NULL, '文件的打开与关闭', '2026-07-05T11:59:55.381291+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('c7704eef-bf12-5848-a5da-bd7eea1ef096', '89353830-b249-587d-ab7f-1a4723c827be', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '使用fclose()关闭文件后，若再次尝试通过原指针读写文件，会导致___。', 'fill', NULL, '未定义行为（或程序崩溃）', 'fclose()释放了文件资源，原FILE指针变为悬空指针，任何读写操作都将导致未定义行为，通常表现为程序崩溃。', 'medium', NULL, NULL, '文件的打开与关闭', '2026-07-05T11:59:55.381291+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('5f3453fe-06cb-599d-b479-77d1c146cf8e', '89353830-b249-587d-ab7f-1a4723c827be', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '在C语言中，文件指针的类型是___。', 'fill', NULL, 'FILE *', '文件指针是FILE类型的指针，FILE是在stdio.h中定义的结构体类型，用于管理文件流的状态和缓冲区。', 'medium', NULL, NULL, '文件的打开与关闭', '2026-07-05T11:59:55.381291+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('35d509bc-8210-55a6-8cb7-214bd81d7831', '89353830-b249-587d-ab7f-1a4723c827be', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '以"a+"模式打开文件时，允许的操作是___和___。', 'fill', NULL, '读、写（追加）', '"a+"模式以读写方式打开文件，读操作可以从任意位置开始，写操作总是在文件末尾追加。如果文件不存在则创建新文件。', 'medium', NULL, NULL, '文件的打开与关闭', '2026-07-05T11:59:55.381291+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('83d010a8-7689-5d2e-9365-eca01f8bc766', '89353830-b249-587d-ab7f-1a4723c827be', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '编写一个C程序，要求：以只读方式打开当前目录下的文件"data.txt"，如果打开失败则输出错误信息并退出，否则读取文件中的第一个整数并打印到屏幕上，然后关闭文件。请给出完整代码。', 'coding', NULL, '#include <stdio.h>
#include <stdlib.h>

int main() {
    FILE *fp = fopen("data.txt", "r");
    if (fp == NULL) {
        printf("无法打开文件 data.txt\\n");
        return 1;
    }
    int num;
    if (fscanf(fp, "%d", &num) == 1) {
        printf("%d\\n", num);
    } else {
        printf("文件为空或格式错误\\n");
    }
    fclose(fp);
    return 0;
}', '首先使用fopen()以"r"模式打开文件，检查返回值是否为NULL以判断是否成功。然后使用fscanf()读取第一个整数，成功则输出。最后用fclose()关闭文件释放资源。注意包含必要的头文件。', 'hard', NULL, NULL, '文件的打开与关闭', '2026-07-05T11:59:55.381291+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('ba59e228-e3ee-5bd0-b480-0fc570e9c955', '89353830-b249-587d-ab7f-1a4723c827be', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '编写一个程序，以追加模式打开文件"log.txt"，向其中写入一条日志信息（例如"2025-01-01: 程序启动"），然后关闭文件。要求处理文件打开失败的情况。', 'coding', NULL, '#include <stdio.h>
#include <stdlib.h>

int main() {
    FILE *fp = fopen("log.txt", "a");
    if (fp == NULL) {
        printf("无法打开文件 log.txt\\n");
        return 1;
    }
    fprintf(fp, "2025-01-01: 程序启动\\n");
    fclose(fp);
    return 0;
}', '使用"a"模式打开文件，写入操作会在文件末尾追加内容。检查fopen返回值确保文件打开成功。使用fprintf()写入字符串，最后fclose()关闭文件。如果文件不存在，"a"模式会自动创建。', 'hard', NULL, NULL, '文件的打开与关闭', '2026-07-05T11:59:55.381291+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('754770df-7e5c-5475-8cda-fae856a1305c', '89353830-b249-587d-ab7f-1a4723c827be', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '分析以下代码的错误并改正：
FILE *fp;
fp = fopen("test.txt", "r");
fprintf(fp, "Hello");
fclose(fp);', 'coding', NULL, '错误：以只读模式"r"打开文件后尝试写入，会导致写入失败。
改正：将模式改为"w"或"a"等可写模式。
正确代码：
FILE *fp;
fp = fopen("test.txt", "w");
if (fp != NULL) {
    fprintf(fp, "Hello");
    fclose(fp);
}', '"r"模式只允许读取，不允许写入。fprintf()在只读流上调用会导致未定义行为。应当使用"w"（写入）或"a"（追加）模式。同时应检查fopen返回值。', 'hard', NULL, NULL, '文件的打开与关闭', '2026-07-05T11:59:55.381291+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('4a4fa053-2fc3-5245-86eb-5d14219e0182', '89353830-b249-587d-ab7f-1a4723c827be', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '编写一个函数 int safe_open(const char *filename, const char *mode, FILE **fp)，该函数尝试以指定模式打开文件，如果成功返回1并将文件指针存入*fp，如果失败返回0并将*fp置为NULL。在主函数中测试该函数。', 'coding', NULL, '#include <stdio.h>

int safe_open(const char *filename, const char *mode, FILE **fp) {
    *fp = fopen(filename, mode);
    if (*fp == NULL) {
        return 0;
    }
    return 1;
}

int main() {
    FILE *fp;
    if (safe_open("data.txt", "r", &fp)) {
        printf("文件打开成功\\n");
        fclose(fp);
    } else {
        printf("文件打开失败\\n");
    }
    return 0;
}', '函数safe_open通过双重指针修改调用者的文件指针，返回成功/失败状态。主函数中调用并检查返回值，根据结果进行相应处理。这种封装提高了代码的复用性和安全性。', 'hard', NULL, NULL, '文件的打开与关闭', '2026-07-05T11:59:55.381291+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('667ee674-8ca6-5595-b782-20e2a632077e', '89353830-b249-587d-ab7f-1a4723c827be', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '某程序需要同时处理多个文件：以只读方式打开"input.txt"，以写入方式打开"output.txt"，从input.txt中读取所有整数并求和，将结果写入output.txt。请编写完整程序，并考虑文件打开失败的处理。', 'coding', NULL, '#include <stdio.h>
#include <stdlib.h>

int main() {
    FILE *fin = fopen("input.txt", "r");
    FILE *fout = fopen("output.txt", "w");
    if (fin == NULL || fout == NULL) {
        printf("文件打开失败\\n");
        if (fin) fclose(fin);
        if (fout) fclose(fout);
        return 1;
    }
    int num, sum = 0;
    while (fscanf(fin, "%d", &num) == 1) {
        sum += num;
    }
    fprintf(fout, "%d\\n", sum);
    fclose(fin);
    fclose(fout);
    return 0;
}', '同时打开两个文件，分别检查是否成功。使用fscanf()循环读取整数累加求和，最后将结果写入输出文件。注意在发生错误时关闭已打开的文件避免资源泄漏。', 'hard', NULL, NULL, '文件的打开与关闭', '2026-07-05T11:59:55.381291+00:00');