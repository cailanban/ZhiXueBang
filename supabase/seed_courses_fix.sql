-- 恢复原始 6 门课程（含章节和题目）
-- 先清理当前数据
DELETE FROM questions WHERE course_id IN (SELECT id FROM courses WHERE created_by IS NULL);
DELETE FROM chapters WHERE course_id IN (SELECT id FROM courses WHERE created_by IS NULL);
DELETE FROM courses WHERE created_by IS NULL;

-- 插入 6 门原始课程
INSERT INTO public.courses (title, description, category, difficulty, chapter_count, is_published) VALUES
('Java编程入门', '从零开始学习Java，涵盖面向对象编程、集合框架、IO等核心内容', 'programming', 'easy', 12, true),
('数据结构与算法', '深入理解常见数据结构和算法，提升编程能力', 'programming', 'medium', 15, true),
('C语言程序设计', 'C语言基础到进阶，指针、内存管理、系统编程', 'programming', 'medium', 10, true),
('英语四级备考', '词汇、阅读、听力、写作全方位备考指导', 'english', 'easy', 8, true),
('Python数据分析', '使用Python进行数据处理和分析', 'programming', 'medium', 10, true),
('计算机网络基础', 'TCP/IP协议栈、HTTP、网络安全等核心知识', 'cs', 'medium', 8, true);

-- Java编程入门：12 章
DO $$
DECLARE
  java_id uuid;
  chapter_titles text[] := ARRAY[
    'Java环境搭建与Hello World','基本数据类型与运算符','流程控制语句',
    '面向对象基础：类与对象','继承与多态','接口与抽象类',
    '异常处理机制','集合框架ArrayList与HashMap','字符串处理',
    'IO流基础','多线程编程','JDBC数据库操作'
  ];
  i int;
BEGIN
  SELECT id INTO java_id FROM courses WHERE title='Java编程入门' LIMIT 1;
  FOR i IN 1..array_length(chapter_titles, 1) LOOP
    INSERT INTO chapters (course_id, title, order_num) VALUES (java_id, chapter_titles[i], i);
  END LOOP;
END $$;

-- 数据结构与算法：5 章
DO $$
DECLARE
  ds_id uuid;
  chapter_titles text[] := ARRAY[
    '数组与链表','栈与队列','树与二叉树','图论基础','排序与查找算法'
  ];
  i int;
BEGIN
  SELECT id INTO ds_id FROM courses WHERE title='数据结构与算法' LIMIT 1;
  FOR i IN 1..array_length(chapter_titles, 1) LOOP
    INSERT INTO chapters (course_id, title, order_num) VALUES (ds_id, chapter_titles[i], i);
  END LOOP;
END $$;

-- C语言程序设计：5 章
DO $$
DECLARE
  c_id uuid;
  chapter_titles text[] := ARRAY[
    'C语言基础语法','函数与模块化编程','指针与内存管理','结构体与文件操作','预处理器与编译链接'
  ];
  i int;
BEGIN
  SELECT id INTO c_id FROM courses WHERE title='C语言程序设计' LIMIT 1;
  FOR i IN 1..array_length(chapter_titles, 1) LOOP
    INSERT INTO chapters (course_id, title, order_num) VALUES (c_id, chapter_titles[i], i);
  END LOOP;
END $$;

-- 英语四级备考：4 章
DO $$
DECLARE
  eng_id uuid;
  chapter_titles text[] := ARRAY[
    '词汇与语法','阅读理解','听力训练','写作翻译'
  ];
  i int;
BEGIN
  SELECT id INTO eng_id FROM courses WHERE title='英语四级备考' LIMIT 1;
  FOR i IN 1..array_length(chapter_titles, 1) LOOP
    INSERT INTO chapters (course_id, title, order_num) VALUES (eng_id, chapter_titles[i], i);
  END LOOP;
END $$;

-- Java 题库（3 题 - 继承与多态章节）
DO $$
DECLARE
  ch_id uuid;
  co_id uuid;
BEGIN
  SELECT c.id, co.id INTO ch_id, co_id
  FROM chapters c JOIN courses co ON c.course_id = co.id
  WHERE co.title='Java编程入门' AND c.order_num = 5 LIMIT 1;

  INSERT INTO questions (chapter_id, course_id, content, type, options, answer, explanation, difficulty, topic) VALUES
  (ch_id, co_id,
   '下面哪个关键字用于实现Java接口？',
   'choice',
   '["A. extends", "B. implements", "C. interface", "D. abstract"]',
   'B', 'Java中使用implements关键字实现接口，extends用于继承类', 'easy', '接口'),
  (ch_id, co_id,
   'Java中多态的实现依赖于什么机制？',
   'choice',
   '["A. 重载", "B. 重写+动态绑定", "C. 静态绑定", "D. 构造函数"]',
   'B', '多态通过方法重写和JVM动态绑定实现', 'medium', '多态'),
  (ch_id, co_id,
   'String类是不可变的，这意味着每次修改都会______',
   'fill',
   NULL,
   '创建新对象', '不可变性确保线程安全，频繁修改建议使用StringBuilder', 'medium', '字符串');
END $$;

-- 数据结构题库（3 题 - 树与二叉树章节）
DO $$
DECLARE
  ch_id uuid;
  co_id uuid;
BEGIN
  SELECT c.id, co.id INTO ch_id, co_id
  FROM chapters c JOIN courses co ON c.course_id = co.id
  WHERE co.title='数据结构与算法' AND c.order_num = 3 LIMIT 1;

  INSERT INTO questions (chapter_id, course_id, content, type, options, answer, explanation, difficulty, topic) VALUES
  (ch_id, co_id,
   '二叉树的前序遍历顺序是？',
   'choice',
   '["A. 左-根-右", "B. 根-左-右", "C. 左-右-根", "D. 根-右-左"]',
   'B', '前序遍历（Preorder）：先访问根节点，再左子树，再右子树', 'easy', '二叉树遍历'),
  (ch_id, co_id,
   '设一棵完全二叉树有 1000 个节点，则叶子节点数为______',
   'fill',
   NULL,
   '500', '完全二叉树中叶子节点数 = (n+1)/2 = 500（n为偶数）', 'medium', '二叉树性质'),
  (ch_id, co_id,
   '以下关于二叉搜索树（BST）的描述，错误的是？',
   'choice',
   '["A. 左子树所有节点值小于根节点", "B. 右子树所有节点值大于根节点", "C. BST的中序遍历结果有序", "D. BST一定是完全二叉树"]',
   'D', 'BST不一定是完全二叉树，例如退化成链表的BST', 'medium', '二叉搜索树');
END $$;
