解释：每次将指数减半，合并操作为常数次乘法，因此效率为对数级。', '该算法利用分治思想，将幂运算分解为子问题的平方，通过奇偶性处理合并，避免了朴素算法的线性时间复杂度。', 'hard', NULL, NULL, '递归与分治思想', '2026-07-05T11:59:50.634539+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('a672cd59-3b99-5cbb-9b6a-7e962ab42ac7', 'a6a3e6bf-c1e1-5a19-8ddc-d6353ee793ae', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '链地址法中的链表长度不影响查找效率。', 'choice', '["A. 正确", "B. 错误"]', 'B', '链表越长，查找效率越低，理想情况下链表应保持短小。', 'easy', NULL, NULL, '散列表(Hash Table)', '2026-07-05T11:59:52.21998+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('22e6c28f-ec7f-5f8c-8980-7e9e4f60edcc', 'a6a3e6bf-c1e1-5a19-8ddc-d6353ee793ae', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '散列表的核心思想是___。', 'fill', NULL, '以空间换时间', '用较大的连续存储空间换取极快的访问速度。', 'easy', NULL, NULL, '散列表(Hash Table)', '2026-07-05T11:59:52.21998+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('b0779f5d-ee99-5fe9-b534-edb426bf7605', 'a6a3e6bf-c1e1-5a19-8ddc-d6353ee793ae', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '除留余数法中，哈希函数通常形式为___。', 'fill', NULL, 'key % p', '取键除以质数p的余数作为哈希地址。', 'easy', NULL, NULL, '散列表(Hash Table)', '2026-07-05T11:59:52.21998+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('fb0ec15c-9daa-5d03-9f7e-b2d79d0d0fb2', 'a6a3e6bf-c1e1-5a19-8ddc-d6353ee793ae', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '当负载因子超过阈值（如0.75）时，通常触发___操作。', 'fill', NULL, '动态扩容（rehashing）', '扩容并重新哈希所有元素，以降低负载因子。', 'medium', NULL, NULL, '散列表(Hash Table)', '2026-07-05T11:59:52.21998+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('b56a4c7a-9d77-5fd1-8fb3-f3d0cfdad063', 'a6a3e6bf-c1e1-5a19-8ddc-d6353ee793ae', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '解决冲突的两种主要方法是开放地址法和___。', 'fill', NULL, '链地址法', '链地址法将冲突元素链入同一链表中。', 'medium', NULL, NULL, '散列表(Hash Table)', '2026-07-05T11:59:52.21998+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('97eab5e2-5250-59d2-aac8-fd57dac5cd9f', 'a6a3e6bf-c1e1-5a19-8ddc-d6353ee793ae', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '线性探测中，若位置已被占用，则依次检查___。', 'fill', NULL, '下一个空位', '顺序查找下一个空位直到找到空槽或遍历完。', 'medium', NULL, NULL, '散列表(Hash Table)', '2026-07-05T11:59:52.21998+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('14176332-0d88-5e1c-b052-95d571885ec2', 'a6a3e6bf-c1e1-5a19-8ddc-d6353ee793ae', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '选择排序和冒泡排序的空间复杂度都是O(1)。', 'choice', '["A. 正确", "B. 错误"]', 'A', '两种排序算法都只使用常数个额外变量（如临时交换变量），不依赖输入规模，因此空间复杂度为O(1)。', 'medium', NULL, NULL, '基础排序（冒泡/选择/插入）', '2026-07-05T11:59:52.21998+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('9bcf035b-146a-5b72-b343-55538a52f68d', 'a6a3e6bf-c1e1-5a19-8ddc-d6353ee793ae', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '给定散列表槽位数为7，哈希函数为H(key)=key%7，使用链地址法处理冲突。依次插入键：15、22、8、29、16、1、36。请画出最终的散列表结构，并计算平均查找长度（ASL）成功时的值。', 'coding', NULL, '散列表结构：
槽0: 链 -> 29 -> 1 -> 36
槽1: 链 -> 15
槽2: 链 -> 16
槽3: 链 -> 8
槽4: 链 -> 22
槽5: 空
槽6: 空

各键查找长度：15(1)、22(1)、8(1)、29(1)、16(1)、1(2)、36(3)
ASL成功 = (1+1+1+1+1+2+3)/7 = 10/7 ≈ 1.43', '先计算每个键的哈希值，再按链地址法插入链表头部或尾部，最后计算每个键的查找长度并取平均值。', 'medium', NULL, NULL, '散列表(Hash Table)', '2026-07-05T11:59:52.21998+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('5c9e450d-1822-53ee-9d3d-7f0fe9be594f', 'a6a3e6bf-c1e1-5a19-8ddc-d6353ee793ae', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '散列表槽位数为11，哈希函数H(key)=key%11，使用线性探测法处理冲突。依次插入键：22、33、44、55、66、77、88。求最终散列表状态及ASL成功。', 'coding', NULL, '插入过程：
22%11=0 -> 槽0
33%11=0 -> 冲突，探测槽1 -> 槽1
44%11=0 -> 冲突，探测槽1、2 -> 槽2
55%11=0 -> 探测至槽3 -> 槽3
66%11=0 -> 探测至槽4 -> 槽4
77%11=0 -> 探测至槽5 -> 槽5
88%11=0 -> 探测至槽6 -> 槽6

最终表：槽0:22, 槽1:33, 槽2:44, 槽3:55, 槽4:66, 槽5:77, 槽6:88, 其余空

查找长度：22(1)、33(2)、44(3)、55(4)、66(5)、77(6)、88(7)
ASL成功 = (1+2+3+4+5+6+7)/7 = 28/7 = 4', '线性探测依次检查下一个空位，所有键哈希值相同导致严重聚集，查找长度递增。', 'medium', NULL, NULL, '散列表(Hash Table)', '2026-07-05T11:59:52.21998+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('723f48af-5c3e-5e0c-8898-bb4bf4199014', 'a6a3e6bf-c1e1-5a19-8ddc-d6353ee793ae', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '设计一个哈希函数，将字符串键（仅小写字母）映射到0~25的整数。并说明如何用链地址法处理冲突。', 'coding', NULL, '哈希函数：取字符串首字母的ASCII码减去''a''的ASCII码，即 H(s) = s[0] - ''a''。

链地址法：创建大小为26的数组，每个元素是一个链表头。插入时计算哈希值，将字符串插入对应链表的尾部。查找时计算哈希值，在对应链表中顺序查找。

示例：插入"apple"(H=0)、"banana"(H=1)、"ant"(H=0)，则槽0链表含"apple"->"ant"，槽1链表含"banana"。', '简单哈希函数适合演示，但实际应用中需考虑分布均匀性，链地址法将冲突元素存储在链表中。', 'medium', NULL, NULL, '散列表(Hash Table)', '2026-07-05T11:59:52.21998+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('99f892fd-5095-58ca-80fb-b6da24d5d577', 'a6a3e6bf-c1e1-5a19-8ddc-d6353ee793ae', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '散列表初始容量为4，负载因子阈值0.75，使用链地址法。依次插入键：1、5、9、13。当负载因子超过阈值时扩容为原来2倍并rehash。请描述每次插入后的负载因子变化及扩容过程。', 'coding', NULL, '初始容量4，空表。
插入1：负载因子=1/4=0.25<0.75
插入5：负载因子=2/4=0.5<0.75
插入9：负载因子=3/4=0.75，不超阈值（等于），继续
插入13：负载因子=4/4=1.0>0.75，触发扩容

扩容：新容量=4*2=8，重新哈希所有元素
新表：
1%8=1 -> 槽1
5%8=5 -> 槽5
9%8=1 -> 槽1链表
13%8=5 -> 槽5链表

最终负载因子=4/8=0.5', '负载因子等于阈值时通常不触发扩容，超过才触发。rehash时所有元素重新计算哈希并插入新表。', 'medium', NULL, NULL, '散列表(Hash Table)', '2026-07-05T11:59:52.21998+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('ce7656e3-515b-585f-8c68-4dd86a87989b', 'a6a3e6bf-c1e1-5a19-8ddc-d6353ee793ae', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '使用双重哈希法解决冲突，表大小m=7，哈希函数H1(key)=key%7，H2(key)=1+(key%5)。插入键：10、17、24、31。求最终散列表状态。', 'coding', NULL, '插入过程：
10%7=3 -> 槽3
17%7=3 -> 冲突，H2(17)=1+(17%5)=1+2=3，探测位置(3+3)%7=6 -> 槽6
24%7=3 -> 冲突，H2(24)=1+(24%5)=1+4=5，探测(3+5)%7=1 -> 槽1
31%7=3 -> 冲突，H2(31)=1+(31%5)=1+1=2，探测(3+2)%7=5 -> 槽5

最终表：槽1:24, 槽3:10, 槽5:31, 槽6:17, 其余空', '双重哈希使用两个哈希函数计算探测步长，有效减少聚集。', 'medium', NULL, NULL, '散列表(Hash Table)', '2026-07-05T11:59:52.21998+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('3fb21c56-1a17-5b75-9e58-689f619eb56d', 'a6a3e6bf-c1e1-5a19-8ddc-d6353ee793ae', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '以下哪种排序算法在最好情况下时间复杂度为O(n)？', 'choice', '["A. 冒泡排序", "B. 选择排序", "C. 插入排序", "D. 快速排序"]', 'C', '插入排序在数据已有序时，每次插入只需比较一次，无需移动，故最好情况时间复杂度为O(n)。冒泡排序最好情况O(n)需优化（无交换时提前退出），但标准冒泡也是O(n²)；选择排序无论如何都是O(n²)。', 'medium', NULL, NULL, '基础排序（冒泡/选择/插入）', '2026-07-05T11:59:52.21998+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('8c586a90-52ef-5a16-bc67-b90ffacb9be2', 'a6a3e6bf-c1e1-5a19-8ddc-d6353ee793ae', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '对序列[9, 7, 5, 3, 1]进行冒泡排序（升序），第一轮结束后序列变为？', 'choice', '["A. [7, 5, 3, 1, 9]", "B. [1, 9, 7, 5, 3]", "C. [7, 9, 5, 3, 1]", "D. [9, 7, 5, 1, 3]"]', 'A', '冒泡排序第一轮：比较9和7交换得[7,9,5,3,1]；比较9和5交换得[7,5,9,3,1]；比较9和3交换得[7,5,3,9,1]；比较9和1交换得[7,5,3,1,9]。最大值9冒泡到最后。', 'medium', NULL, NULL, '基础排序（冒泡/选择/插入）', '2026-07-05T11:59:52.21998+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('115c1212-0f74-51ce-aca6-3f0c06bd3f3e', 'a6a3e6bf-c1e1-5a19-8ddc-d6353ee793ae', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '选择排序（升序）每轮的主要操作是什么？', 'choice', '["A. 交换相邻元素", "B. 从无序区选择最小元素与无序区首元素交换", "C. 将当前元素插入已排序区", "D. 比较所有元素并整体移动"]', 'B', '选择排序每轮在未排序部分找出最小值，然后将其与未排序部分的第一个元素交换，从而扩大已排序区。', 'medium', NULL, NULL, '基础排序（冒泡/选择/插入）', '2026-07-05T11:59:52.21998+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('147a89be-e853-56f3-b404-e3340b24f444', 'a6a3e6bf-c1e1-5a19-8ddc-d6353ee793ae', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '关于插入排序的稳定性，以下说法正确的是？', 'choice', '["A. 不稳定，因为相等元素会交换位置", "B. 稳定，因为插入时不会改变相等元素的相对顺序", "C. 不稳定，因为元素会跳跃式移动", "D. 稳定性取决于具体实现"]', 'B', '插入排序在将元素插入已排序区时，遇到相等元素会放在其后面，因此不改变相等元素的相对顺序，是稳定排序。', 'medium', NULL, NULL, '基础排序（冒泡/选择/插入）', '2026-07-05T11:59:52.21998+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('6a3173b1-6547-5dd8-a259-028143f2a8bf', 'a6a3e6bf-c1e1-5a19-8ddc-d6353ee793ae', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '下列排序算法中，最坏情况下比较次数最少的是？', 'choice', '["A. 冒泡排序", "B. 选择排序", "C. 插入排序", "D. 三者比较次数相同"]', 'D', '冒泡排序最坏比较次数为n(n-1)/2，选择排序固定为n(n-1)/2，插入排序最坏也是n(n-1)/2，三者最坏比较次数相同。', 'medium', NULL, NULL, '基础排序（冒泡/选择/插入）', '2026-07-05T11:59:52.21998+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('ae0ed482-abaa-5b9f-9bf6-c83c3594e451', 'a6a3e6bf-c1e1-5a19-8ddc-d6353ee793ae', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '冒泡排序是稳定的排序算法。', 'choice', '["A. 正确", "B. 错误"]', 'A', '冒泡排序中，相邻元素比较时，若相等则不交换，因此相等元素的相对顺序不变，是稳定排序。', 'medium', NULL, NULL, '基础排序（冒泡/选择/插入）', '2026-07-05T11:59:52.21998+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('e18610c6-14e0-5e84-97b2-7ae6d9bdf5bf', 'a6a3e6bf-c1e1-5a19-8ddc-d6353ee793ae', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '选择排序在最好情况下的时间复杂度为O(n)。', 'choice', '["A. 正确", "B. 错误"]', 'B', '无论初始序列如何，选择排序每轮都需要扫描未排序部分寻找最小值，比较次数固定为n(n-1)/2，时间复杂度始终为O(n²)。', 'medium', NULL, NULL, '基础排序（冒泡/选择/插入）', '2026-07-05T11:59:52.21998+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('8861b0bb-4435-56d1-ba6e-0abefa7bf5f6', 'a6a3e6bf-c1e1-5a19-8ddc-d6353ee793ae', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '插入排序在数据基本有序时效率较高。', 'choice', '["A. 正确", "B. 错误"]', 'A', '当数据接近有序时，插入排序每次插入只需少量比较甚至一次比较即可定位，时间复杂度接近O(n)，因此效率较高。', 'medium', NULL, NULL, '基础排序（冒泡/选择/插入）', '2026-07-05T11:59:52.21998+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('47ac2599-fb42-563c-b85b-601a93836573', 'a6a3e6bf-c1e1-5a19-8ddc-d6353ee793ae', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '对长度为n的序列进行冒泡排序，最多需要n-1轮遍历。', 'choice', '["A. 正确", "B. 错误"]', 'A', '冒泡排序每轮至少将一个元素放到最终位置，n个元素最多需要n-1轮即可完成排序（最后一轮只剩一个元素）。', 'medium', NULL, NULL, '基础排序（冒泡/选择/插入）', '2026-07-05T11:59:52.21998+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('c53fe235-d719-599e-b6ef-6960d1b7d8a8', 'a6a3e6bf-c1e1-5a19-8ddc-d6353ee793ae', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '冒泡排序中，若某一轮遍历没有发生任何交换，则说明序列已经___。', 'fill', NULL, '有序', '冒泡排序通过相邻交换来纠正逆序，若一轮无交换，说明所有相邻元素都已有序，序列整体有序，可提前结束。', 'medium', NULL, NULL, '基础排序（冒泡/选择/插入）', '2026-07-05T11:59:52.408058+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('c6ec1509-bcd2-5c41-b8a9-d5ae291b7b8e', 'a6a3e6bf-c1e1-5a19-8ddc-d6353ee793ae', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '选择排序每轮从无序区选出最小元素，与___位置的元素交换。', 'fill', NULL, '无序区第一个（或已排序区末尾的下一个）', '选择排序将序列分为已排序区和未排序区，每轮从未排序区选最小值，与未排序区的第一个元素交换，从而扩展已排序区。', 'medium', NULL, NULL, '基础排序（冒泡/选择/插入）', '2026-07-05T11:59:52.408058+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('2856d2a2-83db-5a53-a7e3-e652aca27ef3', 'a6a3e6bf-c1e1-5a19-8ddc-d6353ee793ae', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '插入排序中，将待插入元素与已排序区元素从___向___依次比较。', 'fill', NULL, '右；左（或后；前）', '插入排序通常从已排序区的末尾开始向前比较，找到合适位置后插入，这样可以减少移动次数。', 'medium', NULL, NULL, '基础排序（冒泡/选择/插入）', '2026-07-05T11:59:52.408058+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('185e3b67-24da-5ae9-8b45-5da31cdda8d8', 'a6a3e6bf-c1e1-5a19-8ddc-d6353ee793ae', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '对序列[4, 2, 9, 1]进行插入排序（升序），第三轮插入完成后序列为___。', 'fill', NULL, '[1, 2, 4, 9]', '第一轮：4已有序；第二轮：将2插入到4前得[2,4,9,1]；第三轮：将9插入到4后得[2,4,9,1]；第四轮：将1插入到2前得[1,2,4,9]。注意题目问第三轮插入完成后，实际是第四轮结束。若按轮次定义（从第2个元素开始插入），第三轮插入的是9，结果仍是[2,4,9,1]，但通常插入排序轮次等于元素数-1，故第三轮插入后为[1,2,4,9]（共4个元素需插3次）。', 'medium', NULL, NULL, '基础排序（冒泡/选择/插入）', '2026-07-05T11:59:52.408058+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('5fa63194-3167-530f-84a5-2ebadfc79b62', 'a6a3e6bf-c1e1-5a19-8ddc-d6353ee793ae', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '在三种基础排序中，___排序算法在每一轮都能确定一个元素的最终位置。', 'fill', NULL, '选择（或冒泡）', '选择排序每轮将最小值放到最终位置；冒泡排序每轮将最大值（或最小值）冒泡到最终位置。插入排序每轮只是扩大已排序区，未确定任何元素的最终位置（因为后面可能插入更小元素）。', 'medium', NULL, NULL, '基础排序（冒泡/选择/插入）', '2026-07-05T11:59:52.408058+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('05b9c2e2-8fe9-57b9-bf0b-a39020dbc143', 'a6a3e6bf-c1e1-5a19-8ddc-d6353ee793ae', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '给定序列[6, 3, 7, 1, 5, 2]，请分别用冒泡排序、选择排序和插入排序进行升序排序，写出每一轮的结果，并比较三种算法的稳定性。', 'coding', NULL, '冒泡排序：
初始：[6,3,7,1,5,2]
第1轮：3,6,1,5,2,7
第2轮：3,1,5,2,6,7
第3轮：1,3,2,5,6,7
第4轮：1,2,3,5,6,7
第5轮：1,2,3,5,6,7（无交换）

选择排序：
初始：[6,3,7,1,5,2]
第1轮：1,3,7,6,5,2（1与6交换）
第2轮：1,2,7,6,5,3（2与3交换）
第3轮：1,2,3,6,5,7（3与7交换）
第4轮：1,2,3,5,6,7（5与6交换）
第5轮：1,2,3,5,6,7（无需交换）

插入排序：
初始：[6,3,7,1,5,2]
第1轮（插3）：3,6,7,1,5,2
第2轮（插7）：3,6,7,1,5,2
第3轮（插1）：1,3,6,7,5,2
第4轮（插5）：1,3,5,6,7,2
第5轮（插2）：1,2,3,5,6,7

稳定性：冒泡排序和插入排序是稳定的（相等元素不交换相对顺序）；选择排序是不稳定的（例如序列[5,5,1]中，第一轮交换会将第一个5与1交换，导致两个5的相对顺序改变）。', '本题要求实际模拟三种基础排序的完整过程，并理解稳定性的定义。冒泡和插入在相等元素时不进行交换或插入到相等元素后面，因此稳定；选择排序可能将后面的相等元素交换到前面，破坏稳定性。', 'medium', NULL, NULL, '基础排序（冒泡/选择/插入）', '2026-07-05T11:59:52.408058+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('d6b0685b-8b4e-500b-98b3-75268797ee69', 'a6a3e6bf-c1e1-5a19-8ddc-d6353ee793ae', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '已知序列[10, 9, 8, 7, 6, 5]完全逆序，分别计算冒泡排序、选择排序和插入排序在该序列上的比较次数和交换次数（或移动次数）。', 'coding', NULL, '冒泡排序：
比较次数：5+4+3+2+1=15次（每轮比较次数递减）
交换次数：5+4+3+2+1=15次（每次比较都需交换）

选择排序：
比较次数：5+4+3+2+1=15次（每轮找最小值比较次数固定）
交换次数：5次（每轮交换一次，共5轮）

插入排序：
比较次数：1+2+3+4+5=15次（第i个元素插入需比较i次）
移动次数：1+2+3+4+5=15次（每次比较后需移动元素）

注：插入排序的移动次数等于比较次数（逆序时每次比较后都要移动），实际移动次数为元素移动次数。', '对于完全逆序序列，三种排序的比较次数相同（均为n(n-1)/2），但交换/移动次数不同。冒泡交换次数多，选择交换次数少但比较次数固定，插入移动次数与比较次数相同。本题考察对算法操作细节的理解。', 'medium', NULL, NULL, '基础排序（冒泡/选择/插入）', '2026-07-05T11:59:52.408058+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('efb43e6e-b740-5fd5-b769-dab2bfa55396', 'a6a3e6bf-c1e1-5a19-8ddc-d6353ee793ae', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '设计一个场景，说明为什么在数据量较小且基本有序时，插入排序优于冒泡排序和选择排序。', 'coding', NULL, '场景：对序列[1, 2, 3, 5, 4]进行升序排序。

插入排序：
第1轮：1已有序
第2轮：2插入，比较1次，无需移动
第3轮：3插入，比较1次
第4轮：5插入，比较1次
第5轮：4插入，先与5比较，交换，再与3比较，停止。共比较4次，移动1次。

冒泡排序：
第1轮：1-2不换，2-3不换，3-5不换，5-4交换得[1,2,3,4,5]，比较4次，交换1次。
第2轮：1-2不换，2-3不换，3-4不换，比较3次，无交换。总比较7次，交换1次。

选择排序：
第1轮：找最小1，无需交换，比较4次
第2轮：找最小2，比较3次
第3轮：找最小3，比较2次
第4轮：找最小4，比较1次，交换4和5。总比较10次，交换1次。

结论：插入排序在基本有序时比较次数少，且移动次数少；冒泡排序需多轮扫描；选择排序比较次数固定，效率最低。', '本题要求通过具体数据展示三种排序在近似有序场景下的性能差异，强调插入排序的适应性优势。', 'medium', NULL, NULL, '基础排序（冒泡/选择/插入）', '2026-07-05T11:59:52.408058+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('05cb9de8-2809-56a6-84d3-2969f792e6fd', 'a6a3e6bf-c1e1-5a19-8ddc-d6353ee793ae', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '某排序算法在每一轮结束后都会将当前未排序部分的最大元素放到正确位置，请问这是什么排序？请写出其代码实现（伪代码或C语言），并分析其时间复杂度和空间复杂度。', 'coding', NULL, '这是冒泡排序（标准实现）。

伪代码：
BubbleSort(A, n):
  for i = 0 to n-2:
    swapped = false
    for j = 0 to n-2-i:
      if A[j] > A[j+1]:
        swap(A[j], A[j+1])
        swapped = true
    if not swapped: break

C语言实现：
void bubbleSort(int arr[], int n) {
    for (int i = 0; i < n-1; i++) {
        int swapped = 0;
        for (int j = 0; j < n-1-i; j++) {
            if (arr[j] > arr[j+1]) {
                int temp = arr[j];
                arr[j] = arr[j+1];
                arr[j+1] = temp;
                swapped = 1;
            }
        }
        if (!swapped) break;
    }
}

时间复杂度：最好O(n)（已有序），最坏O(n²)（逆序）；空间复杂度：O(1)。', '冒泡排序的核心特点是每轮将最大值冒泡到最后，通过优化（设置交换标志）可提前结束。本题要求考生识别算法特征并写出实现，同时分析复杂度。', 'medium', NULL, NULL, '基础排序（冒泡/选择/插入）', '2026-07-05T11:59:52.408058+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('3ae37aaf-8d8e-5252-8665-95f6441cc38a', '4faf7aea-bb5d-5b11-afb4-9babc37bab6a', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', 'C语言是一种面向过程的、解释型的通用计算机编程语言。', 'choice', '["A. 正确", "B. 错误"]', 'B', 'C语言是编译型语言，不是解释型语言。它通过编译器将源代码转换为机器码后执行。', 'easy', NULL, NULL, 'C语言的发展历史与特点', '2026-07-05T11:59:52.853217+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('3614fa16-5ad8-5d06-ae51-38bdfb8a5720', 'a6a3e6bf-c1e1-5a19-8ddc-d6353ee793ae', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '已知一个长度为n的序列，其中大部分元素已经有序，只有少数几个元素位置错误。请从冒泡、选择、插入三种排序中选择最合适的一种，并说明理由。如果要求排序算法必须稳定，你会选择哪种？', 'coding', NULL, '最合适的是插入排序。理由：插入排序在数据基本有序时，每个元素只需很少的比较和移动即可插入到正确位置，时间复杂度接近O(n)。而冒泡排序即使优化，仍需多轮扫描；选择排序比较次数固定，无法利用有序性。

如果要求稳定，插入排序和冒泡排序都是稳定的。但插入排序在基本有序时性能更好，因此仍选择插入排序。选择排序不稳定，不适合。

综上，推荐使用插入排序。', '本题综合考察算法对数据分布特性的适应能力，以及稳定性要求。插入排序在部分有序场景下效率最高，且稳定，是最优选择。', 'medium', NULL, NULL, '基础排序（冒泡/选择/插入）', '2026-07-05T11:59:52.408058+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('a5222b65-ba85-5c96-bf13-4ba82fdd5983', 'a6a3e6bf-c1e1-5a19-8ddc-d6353ee793ae', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '下列排序算法中，平均时间复杂度为O(n log n)的是？', 'choice', '["A. 冒泡排序", "B. 插入排序", "C. 快速排序", "D. 选择排序"]', 'C', '快速排序、归并排序、堆排序的平均时间复杂度均为O(n log n)，而冒泡、插入、选择排序的平均时间复杂度为O(n²)。', 'hard', NULL, NULL, '高级排序（快排/归并/堆排序）', '2026-07-05T11:59:52.408058+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('2143adf3-0a5b-5d66-9f75-512fd3552872', 'a6a3e6bf-c1e1-5a19-8ddc-d6353ee793ae', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '快速排序在最坏情况下的时间复杂度是？', 'choice', '["A. O(n)", "B. O(n log n)", "C. O(n²)", "D. O(log n)"]', 'C', '当每次选取的基准元素都是当前子数组的最大或最小值时，快速排序退化为O(n²)，例如数组已经有序时。', 'hard', NULL, NULL, '高级排序（快排/归并/堆排序）', '2026-07-05T11:59:52.408058+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('d9acf811-003c-51d0-955e-43c02b580905', 'a6a3e6bf-c1e1-5a19-8ddc-d6353ee793ae', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '归并排序在合并两个有序子数组时，需要借助的辅助空间复杂度为？', 'choice', '["A. O(1)", "B. O(log n)", "C. O(n)", "D. O(n log n)"]', 'C', '归并排序在合并时需要临时数组存放合并结果，因此需要O(n)的辅助空间。', 'hard', NULL, NULL, '高级排序（快排/归并/堆排序）', '2026-07-05T11:59:52.408058+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('24c3ff23-dcdd-523d-84bf-947c5348c63d', 'a6a3e6bf-c1e1-5a19-8ddc-d6353ee793ae', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '堆排序中，构建一个大小为n的最大堆的时间复杂度是？', 'choice', '["A. O(n)", "B. O(n log n)", "C. O(log n)", "D. O(n²)"]', 'A', '从最后一个非叶子节点开始向下调整，建堆的时间复杂度为O(n)，这是堆排序的一个重要性质。', 'hard', NULL, NULL, '高级排序（快排/归并/堆排序）', '2026-07-05T11:59:52.408058+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('4d58db6d-7c91-5973-8b00-7dcb0ece1fed', 'a6a3e6bf-c1e1-5a19-8ddc-d6353ee793ae', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '对数组[5, 3, 8, 6, 2, 7, 1, 4]进行快速排序，若选取第一个元素5作为基准，则第一趟partition后基准元素5的最终索引位置是？', 'choice', '["A. 2", "B. 3", "C. 4", "D. 5"]', 'C', '以5为基准，小于5的元素有3,2,1,4，大于5的有8,6,7。经过partition后，5最终位于索引2（从0开始），数组变为[4,3,1,2,5,8,6,7]或类似顺序。', 'hard', NULL, NULL, '高级排序（快排/归并/堆排序）', '2026-07-05T11:59:52.408058+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('ea354466-a097-5930-92a2-4b96da27b604', 'a6a3e6bf-c1e1-5a19-8ddc-d6353ee793ae', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '快速排序是稳定的排序算法。', 'choice', '["A. 正确", "B. 错误"]', 'B', '快速排序在partition操作中可能交换相等元素的相对位置，因此是不稳定的排序算法。', 'hard', NULL, NULL, '高级排序（快排/归并/堆排序）', '2026-07-05T11:59:52.408058+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('ae5052bc-8d8e-519e-b2dc-50f45bf2ea58', 'a6a3e6bf-c1e1-5a19-8ddc-d6353ee793ae', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '归并排序的空间复杂度为O(n)，因为它需要额外的数组来合并子序列。', 'choice', '["A. 正确", "B. 错误"]', 'A', '归并排序在合并阶段需要分配与原数组等长的临时数组，因此空间复杂度为O(n)。', 'hard', NULL, NULL, '高级排序（快排/归并/堆排序）', '2026-07-05T11:59:52.408058+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('93b0370b-979d-597e-8b42-fa78a094ab32', 'a6a3e6bf-c1e1-5a19-8ddc-d6353ee793ae', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '堆排序在最好、最坏、平均情况下的时间复杂度均为O(n log n)。', 'choice', '["A. 正确", "B. 错误"]', 'A', '堆排序的建堆过程为O(n)，每次调整堆为O(log n)，共n-1次调整，因此总时间复杂度始终为O(n log n)。', 'hard', NULL, NULL, '高级排序（快排/归并/堆排序）', '2026-07-05T11:59:52.408058+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('d3152083-587b-58db-8636-4bd4b4146b8e', 'a6a3e6bf-c1e1-5a19-8ddc-d6353ee793ae', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '归并排序可以原地实现，不需要额外空间。', 'choice', '["A. 正确", "B. 错误"]', 'B', '标准的归并排序需要O(n)的辅助空间来合并有序子数组，虽然存在原地归并的变种，但实现复杂且效率较低，通常认为归并排序不是原地排序。', 'hard', NULL, NULL, '高级排序（快排/归并/堆排序）', '2026-07-05T11:59:52.408058+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('d493e650-95f3-5d7e-bcb9-ea31e5d3da30', 'a6a3e6bf-c1e1-5a19-8ddc-d6353ee793ae', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '在快速排序中，如果每次都能将数组均匀分割，则递归深度为O(log n)。', 'choice', '["A. 正确", "B. 错误"]', 'A', '当每次partition都能将数组分成两个规模相近的子数组时，递归树的高度为log₂n，因此递归栈深度为O(log n)。', 'hard', NULL, NULL, '高级排序（快排/归并/堆排序）', '2026-07-05T11:59:52.408058+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('f5c13c7f-d237-56dd-a2d1-356a51547733', 'a6a3e6bf-c1e1-5a19-8ddc-d6353ee793ae', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '对数组[9, 7, 5, 11, 12, 2, 14, 3, 10, 6]进行堆排序，构建最大堆后，堆顶元素是___。', 'fill', NULL, '14', '构建最大堆时，最大值会上升到堆顶。该数组中最大值为14，因此堆顶元素为14。', 'hard', NULL, NULL, '高级排序（快排/归并/堆排序）', '2026-07-05T11:59:52.408058+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('ee66f9ae-0485-53e3-947c-3d5f37ad5254', 'a6a3e6bf-c1e1-5a19-8ddc-d6353ee793ae', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '归并排序的核心思想是分治法，其关键操作是___。', 'fill', NULL, '合并（或merge）', '归并排序将数组递归分解为单个元素，然后通过合并操作将两个有序子数组合并为一个有序数组，合并是归并排序的核心步骤。', 'hard', NULL, NULL, '高级排序（快排/归并/堆排序）', '2026-07-05T11:59:52.408058+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('50691152-69df-5845-a217-d7adce4fcd89', 'a6a3e6bf-c1e1-5a19-8ddc-d6353ee793ae', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '快速排序的partition操作中，若选取的基准元素恰好是数组的中位数，则每次递归的规模约为原来的___。', 'fill', NULL, '一半（或1/2）', '当基准元素是中位数时，数组被均匀分割为两个规模约为n/2的子数组，这是快速排序的最优情况。', 'hard', NULL, NULL, '高级排序（快排/归并/堆排序）', '2026-07-05T11:59:52.408058+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('1970308b-e1fc-5624-b84f-81968953408c', 'a6a3e6bf-c1e1-5a19-8ddc-d6353ee793ae', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '堆排序中，对长度为n的堆进行删除堆顶操作后，调整堆的时间复杂度为___。', 'fill', NULL, 'O(log n)', '删除堆顶后，将最后一个元素移到堆顶，然后进行向下调整，每次比较交换最多沿着树的高度进行，因此时间复杂度为O(log n)。', 'hard', NULL, NULL, '高级排序（快排/归并/堆排序）', '2026-07-05T11:59:52.408058+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('524f1e18-de66-5a23-b2b5-5d5a8a8be430', 'a6a3e6bf-c1e1-5a19-8ddc-d6353ee793ae', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '对数组[38, 27, 43, 3, 9, 82, 10]进行归并排序，在合并[27,38]和[3,43]后得到的有序子数组为___。', 'fill', NULL, '[3,27,38,43]', '合并两个有序子数组时，依次比较两数组的最小元素，将较小的放入结果数组。合并[27,38]和[3,43]时，先取3，再取27，再取38，最后取43，得到[3,27,38,43]。', 'hard', NULL, NULL, '高级排序（快排/归并/堆排序）', '2026-07-05T11:59:52.408058+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('57547384-4770-522b-9b42-bc011999aec4', '4faf7aea-bb5d-5b11-afb4-9babc37bab6a', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', 'C语言共有32个关键字。', 'choice', '["A. 正确", "B. 错误"]', 'A', '根据ANSI C标准，C语言共有32个关键字，如int、char、if、else、for等，体现了其简洁高效的特点。', 'easy', NULL, NULL, 'C语言的发展历史与特点', '2026-07-05T11:59:52.853217+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('1830fe4b-2f2d-5dd2-957c-1d0685de9624', '4faf7aea-bb5d-5b11-afb4-9babc37bab6a', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', 'C99标准引入了多线程支持特性。', 'choice', '["A. 正确", "B. 错误"]', 'B', '多线程支持是在C11标准中引入的，C99标准主要引入了内联函数、新数据类型（如long long）等特性。', 'easy', NULL, NULL, 'C语言的发展历史与特点', '2026-07-05T11:59:52.853217+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('51c87f14-537d-5674-9b8b-16fb275861b8', 'a6a3e6bf-c1e1-5a19-8ddc-d6353ee793ae', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '给定数组arr = [10, 80, 30, 90, 40, 50, 70]，请使用快速排序（选取最后一个元素作为基准）写出第一趟partition的详细过程，并给出partition后的数组状态以及基准元素最终位置。', 'coding', NULL, '选取基准pivot = 70。初始化i = -1（指向小于基准的最后一个元素）。
遍历j从0到5：
 j=0: arr[0]=10 < 70，i++变为0，交换arr[0]与arr[0]（不变），数组为[10,80,30,90,40,50,70]
 j=1: arr[1]=80 > 70，不交换
 j=2: arr[2]=30 < 70，i++变为1，交换arr[1]与arr[2]，数组变为[10,30,80,90,40,50,70]
 j=3: arr[3]=90 > 70，不交换
 j=4: arr[4]=40 < 70，i++变为2，交换arr[2]与arr[4]，数组变为[10,30,40,90,80,50,70]
 j=5: arr[5]=50 < 70，i++变为3，交换arr[3]与arr[5]，数组变为[10,30,40,50,80,90,70]
遍历结束，将基准与arr[i+1]交换：i+1=4，交换arr[4]与arr[6]，数组变为[10,30,40,50,70,90,80]。
基准70最终位于索引4。', '该题考查快速排序中partition的具体实现。通过遍历数组，将小于基准的元素交换到左侧，最后将基准放到正确位置。注意每一步交换后数组的变化。', 'hard', NULL, NULL, '高级排序（快排/归并/堆排序）', '2026-07-05T11:59:52.408058+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('b13328e7-3642-5a6f-9177-b76f8bebb50a', 'a6a3e6bf-c1e1-5a19-8ddc-d6353ee793ae', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '对数组[4, 10, 3, 5, 1]进行堆排序，请写出构建初始最大堆的过程，并给出建堆后的数组状态，然后写出第一次交换堆顶与末尾元素后的数组状态及调整堆的过程。', 'coding', NULL, '1. 建堆过程：数组长度为5，最后一个非叶子节点索引为(5//2)-1=1（从0开始）。
   - 从索引1开始调整：arr[1]=10，左孩子arr[3]=5，右孩子arr[4]=1，10最大，无需交换。
   - 调整索引0：arr[0]=4，左孩子arr[1]=10，右孩子arr[2]=3，最大值为10，交换arr[0]与arr[1]，数组变为[10,4,3,5,1]。
   - 此时索引1的子树可能不满足堆性质，调整索引1：arr[1]=4，左孩子arr[3]=5，右孩子arr[4]=1，最大值为5，交换arr[1]与arr[3]，数组变为[10,5,3,4,1]。
   - 建堆完成，最大堆为[10,5,3,4,1]。
2. 第一次交换：交换堆顶arr[0]=10与末尾arr[4]=1，数组变为[1,5,3,4,10]。10已就位。
3. 调整堆（排除末尾10）：从堆顶开始向下调整。
   - 当前堆顶arr[0]=1，左孩子arr[1]=5，右孩子arr[2]=3，最大值为5，交换arr[0]与arr[1]，数组变为[5,1,3,4,10]。
   - 调整索引1：arr[1]=1，左孩子arr[3]=4，右孩子无（索引4已排除），最大值为4，交换arr[1]与arr[3]，数组变为[5,4,3,1,10]。
   - 调整完成，当前堆为[5,4,3,1,10]。', '堆排序的关键在于建堆和调整堆。建堆从最后一个非叶子节点开始向前调整，确保每个子树都是最大堆。交换堆顶与末尾后，将新堆顶向下调整恢复堆性质。', 'hard', NULL, NULL, '高级排序（快排/归并/堆排序）', '2026-07-05T11:59:52.408058+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('302305be-66f5-5e14-8b0b-60b79f48f2a3', 'a6a3e6bf-c1e1-5a19-8ddc-d6353ee793ae', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '请比较快速排序、归并排序和堆排序在稳定性、空间复杂度和适用场景上的异同。', 'coding', NULL, '1. 稳定性：快速排序不稳定（partition可能交换相等元素），归并排序稳定（合并时相等元素保持原顺序），堆排序不稳定（调整堆时可能改变相等元素相对位置）。
2. 空间复杂度：快速排序平均O(log n)（递归栈），最坏O(n)；归并排序O(n)（辅助数组）；堆排序O(1)（原地排序）。
3. 适用场景：
   - 快速排序：适用于大规模随机数据，平均性能最好，但不适合基本有序的数据（会退化）。
   - 归并排序：适用于需要稳定排序的场景，或数据量较大但内存充足的情况，外部排序常用归并。
   - 堆排序：适用于内存受限且需要O(1)空间的场景，或需要快速获取最大/最小值的场景（如优先队列）。', '本题综合考查三种高级排序的核心特性。稳定性取决于元素交换方式，空间复杂度与算法实现相关，适用场景需结合时间、空间和稳定性需求分析。', 'hard', NULL, NULL, '高级排序（快排/归并/堆排序）', '2026-07-05T11:59:52.408058+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('e1b9e90c-9fbc-5ebb-a150-5964d5303264', 'a6a3e6bf-c1e1-5a19-8ddc-d6353ee793ae', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '现有1000万个整数（范围0~10^9），内存为256MB，要求按升序排序，请选择合适的排序算法并说明理由。', 'coding', NULL, '推荐使用归并排序（外部排序版本）或快速排序的优化版本。
理由：
1. 数据量：1000万个整数占约40MB（4字节/整数），内存256MB足够容纳，因此可以采用内部排序。
2. 时间复杂度：O(n log n)级别，三种高级排序均满足。
3. 空间复杂度：
   - 快速排序平均需要O(log n)递归栈（约24层），空间占用小，但最坏情况可能O(n)（约40MB），若数据随机则风险低。
   - 归并排序需要O(n)辅助空间（约40MB），256MB内存可承受。
   - 堆排序O(1)空间，但实际运行速度通常慢于快排和归并。
4. 稳定性：题目未要求稳定性，因此不成为关键因素。
5. 综合考量：若数据随机，快速排序（如三数取中选基准）平均最快；若要求稳定或数据接近有序，归并排序更可靠。
建议：使用快速排序（优化版）或C++标准库中的std::sort（内省排序，结合快排、堆排和插入排序）。', '该题考查算法选择与实际应用结合的能力。需考虑数据规模、内存限制、时间效率及最坏情况。256MB内存足以容纳数据，因此内部排序即可，但需避免快排最坏情况。', 'hard', NULL, NULL, '高级排序（快排/归并/堆排序）', '2026-07-05T11:59:52.408058+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('9d90d4c8-01a6-54d1-963e-ea901a93e6e9', '4faf7aea-bb5d-5b11-afb4-9babc37bab6a', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', 'C语言是由谁在1972年设计并实现的？', 'choice', '["A. 布莱恩·柯林汉", "B. 丹尼斯·里奇", "C. 肯·汤普逊", "D. 林纳斯·托瓦兹"]', 'B', 'C语言由美国贝尔实验室的丹尼斯·里奇在B语言的基础上设计并实现。布莱恩·柯林汉是K&R C的合著者，肯·汤普逊是B语言和UNIX的创始人之一，林纳斯·托瓦兹是Linux内核的创始人。', 'easy', NULL, NULL, 'C语言的发展历史与特点', '2026-07-05T11:59:52.853217+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('ab79dcf8-79b4-5241-b038-146431292df7', '4faf7aea-bb5d-5b11-afb4-9babc37bab6a', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '第一个C编译器是在哪台计算机上实现的？', 'choice', '["A. IBM PC", "B. DEC PDP-11", "C. Apple II", "D. UNIVAC I"]', 'B', '1972年，丹尼斯·里奇在DEC PDP-11计算机上实现了第一个C编译器，并用C重写了UNIX内核。', 'easy', NULL, NULL, 'C语言的发展历史与特点', '2026-07-05T11:59:52.853217+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('c7fe23d4-9b33-5449-bd6e-011ec86640d0', '4faf7aea-bb5d-5b11-afb4-9babc37bab6a', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '以下哪个标准是C语言第一个正式的国际标准？', 'choice', '["A. K&R C", "B. ANSI C (C89/C90)", "C. C99", "D. C11"]', 'B', '1989年，美国国家标准协会（ANSI）正式发布了C语言标准，即ANSI C（C89/C90），这是C语言的第一个正式标准。K&R C是1978年的非正式标准。', 'easy', NULL, NULL, 'C语言的发展历史与特点', '2026-07-05T11:59:52.853217+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('543470f6-e64a-5df0-b731-78e4169a38a7', '4faf7aea-bb5d-5b11-afb4-9babc37bab6a', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', 'C语言最初的设计目的是什么？', 'choice', '["A. 开发数据库系统", "B. 编写UNIX操作系统", "C. 开发图形界面", "D. 编写网络协议"]', 'B', 'C语言的设计初衷是为了编写UNIX操作系统，因此它兼具高级语言的易读性和低级语言对硬件的直接控制能力。', 'easy', NULL, NULL, 'C语言的发展历史与特点', '2026-07-05T11:59:52.853217+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('3df72714-6840-50b1-bc6d-a8a627eba4a1', '4faf7aea-bb5d-5b11-afb4-9babc37bab6a', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', 'C语言的核心特点不包括以下哪一项？', 'choice', '["A. 简洁高效", "B. 纯面向对象", "C. 灵活强大", "D. 支持指针直接操作内存"]', 'B', 'C语言是一种面向过程的语言，并非纯面向对象语言。其他三项（简洁高效、灵活强大、支持指针）都是C语言的核心特点。', 'easy', NULL, NULL, 'C语言的发展历史与特点', '2026-07-05T11:59:52.853217+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('ee25e7b0-1d37-599d-985a-d981b928bd39', '4faf7aea-bb5d-5b11-afb4-9babc37bab6a', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '丹尼斯·里奇和布莱恩·柯林汉合作出版了《C程序设计语言》一书，该书成为非正式标准。', 'choice', '["A. 正确", "B. 错误"]', 'A', '1978年，布莱恩·柯林汉和丹尼斯·里奇出版了《C程序设计语言》（即K&R C），成为广泛使用的非正式标准。', 'easy', NULL, NULL, 'C语言的发展历史与特点', '2026-07-05T11:59:52.853217+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('a330e5ec-ffbd-5b4f-b0fc-91e8396a2011', '4faf7aea-bb5d-5b11-afb4-9babc37bab6a', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', 'C语言只能用于编写操作系统，不能用于其他类型的软件开发。', 'choice', '["A. 正确", "B. 错误"]', 'B', 'C语言虽然最初用于编写UNIX操作系统，但因其高效灵活的特点，被广泛应用于嵌入式系统、游戏开发、编译器设计等多个领域。', 'easy', NULL, NULL, 'C语言的发展历史与特点', '2026-07-05T11:59:52.853217+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('0f97132f-fc55-546e-9e7b-532d5407f4af', '4faf7aea-bb5d-5b11-afb4-9babc37bab6a', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', 'C语言诞生于___年。', 'fill', NULL, '1972', 'C语言由丹尼斯·里奇于1972年在贝尔实验室设计并实现。', 'easy', NULL, NULL, 'C语言的发展历史与特点', '2026-07-05T11:59:52.853217+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('b96cb3e4-3a83-50e9-84da-3e8db177cf86', '4faf7aea-bb5d-5b11-afb4-9babc37bab6a', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', 'C语言在B语言的基础上设计，而B语言的前身是___语言。', 'fill', NULL, 'BCPL', 'C语言的发展谱系为：BCPL → B → C。B语言由肯·汤普逊在BCPL基础上简化而来，里奇又在B语言基础上设计了C。', 'easy', NULL, NULL, 'C语言的发展历史与特点', '2026-07-05T11:59:52.853217+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('3dd84108-170f-56a6-be79-585933d3af32', '4faf7aea-bb5d-5b11-afb4-9babc37bab6a', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', 'ANSI C标准发布的时间是___年。', 'fill', NULL, '1989', '1989年，美国国家标准协会（ANSI）正式发布了C语言标准，即ANSI C（C89/C90）。', 'easy', NULL, NULL, 'C语言的发展历史与特点', '2026-07-05T11:59:52.853217+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('eb11c654-99c6-5064-9890-01748f3d2eea', '4faf7aea-bb5d-5b11-afb4-9babc37bab6a', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', 'C语言中，用于直接操作内存的核心特性是___。', 'fill', NULL, '指针', '指针是C语言的核心特性之一，允许程序员直接访问和操作内存地址，提供了对硬件的直接控制能力。', 'easy', NULL, NULL, 'C语言的发展历史与特点', '2026-07-05T11:59:52.853217+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('f8de3782-5783-579c-9641-facde3e4236f', '4faf7aea-bb5d-5b11-afb4-9babc37bab6a', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', 'C11标准新增的重要特性之一是___支持。', 'fill', NULL, '多线程', 'C11标准引入了多线程支持（如<threads.h>头文件），使C语言能够更好地适应现代并发编程需求。', 'easy', NULL, NULL, 'C语言的发展历史与特点', '2026-07-05T11:59:52.853217+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('7362651e-3c1c-537a-8ad0-636b7b4c25a3', '4faf7aea-bb5d-5b11-afb4-9babc37bab6a', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '请简述C语言从诞生到C99标准期间的主要发展历程，并说明每个阶段的关键意义。', 'coding', NULL, '（1）1972年：丹尼斯·里奇在DEC PDP-11上实现第一个C编译器，并用C重写UNIX内核。意义：C语言正式诞生，证明了其用于系统编程的可行性。
（2）1978年：K&R C出版，成为非正式标准。意义：统一了C语言的语法和用法，促进了C语言的普及。
（3）1989年：ANSI C（C89/C90）发布，成为第一个正式国际标准。意义：使C语言标准化，保证了程序的可移植性。
（4）1999年：C99标准发布，引入内联函数、新数据类型（如long long）、变长数组等特性。意义：增强了C语言的表达能力和现代性。', '本题要求梳理C语言发展的关键时间节点及其意义。需要从诞生（1972年）、非正式标准化（1978年）、正式标准化（1989年）和现代扩展（1999年）四个阶段回答，每个阶段要突出其历史作用。', 'easy', NULL, NULL, 'C语言的发展历史与特点', '2026-07-05T11:59:52.853217+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('cdab5b14-5d62-5ccf-8dfe-e4aeb0ca4a67', '4faf7aea-bb5d-5b11-afb4-9babc37bab6a', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', 'C语言兼具高级语言的易读性和低级语言对硬件的直接控制能力。请结合C语言的特点，举例说明这一论断。', 'coding', NULL, '（1）高级语言的易读性：C语言使用接近自然语言的语法和结构化的控制语句（如if-else、for、while），使代码易于阅读和维护。例如：
   int sum = 0;
   for (int i = 1; i <= 10; i++) {
       sum += i;
   }
   这段代码直观地计算1到10的和，无需了解底层硬件细节。
（2）低级语言的控制能力：C语言提供指针、位运算等特性，允许直接操作内存和硬件。例如：
   int a = 10;
   int *p = &a;  // 获取变量a的地址
   *p = 20;      // 通过指针直接修改a的值
   此外，位运算可用于嵌入式系统中的寄存器操作：
   PORTB |= (1 << 3);  // 将PORTB的第3位置1
   这种能力与汇编语言类似，但保持了高级语言的语法结构。
结论：C语言通过平衡抽象层次，既能编写高效的系统软件（如操作系统、驱动程序），又能保持代码的可读性和可维护性。', '解题需从两方面展开：一是高级语言的易读性，用结构化控制语句举例；二是低级语言的硬件控制能力，用指针和位运算举例。最后总结C语言的平衡特性。', 'easy', NULL, NULL, 'C语言的发展历史与特点', '2026-07-05T11:59:52.853217+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('31743207-d42a-50a9-9f80-52d76814e30b', '4faf7aea-bb5d-5b11-afb4-9babc37bab6a', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '假设你正在设计一个新的编程语言，你希望它具备C语言的哪些特点？请列出至少三点，并说明理由。', 'coding', NULL, '（1）简洁高效：仅使用少量关键字（如C语言的32个关键字），语法紧凑，编译后执行效率高。理由：简洁性降低学习成本，高效性适合系统级开发和性能敏感场景。
（2）指针操作内存：允许程序员直接访问内存地址，进行底层控制。理由：在操作系统、嵌入式系统等领域，直接内存操作不可或缺，能实现高效的数据结构和硬件交互。
（3）可移植性：通过标准化（如ANSI C）确保代码在不同平台上编译运行。理由：可移植性减少重复开发工作，使语言适用于多种硬件和操作系统。
（4）丰富的运算符：包括算术、逻辑、位运算等。理由：位运算等低级操作在协议解析、加密算法中非常实用。
（5）预处理功能：宏定义、条件编译等。理由：支持代码生成和平台适配，提高开发灵活性。', '本题为开放性设计题，需从C语言的核心优势中选择至少三点，每点都要说明理由。参考答案给出了五个常见特点，考生任选三个即可，但需确保理由充分、逻辑清晰。', 'easy', NULL, NULL, 'C语言的发展历史与特点', '2026-07-05T11:59:52.853217+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('65c277e2-b613-5f77-8ab2-ab940ecbeaa5', '4faf7aea-bb5d-5b11-afb4-9babc37bab6a', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '请解释为什么C语言被称为“中级语言”，并比较它与高级语言（如Python）和低级语言（如汇编）的异同。', 'coding', NULL, '（1）C语言被称为“中级语言”的原因：它既具备高级语言的抽象能力和结构化特性（如函数、循环、数组），又提供低级语言的硬件控制能力（如指针、位运算、内存管理）。因此处于高级语言和低级语言之间。
（2）与高级语言（Python）的对比：
   - 相同点：都支持结构化编程、函数调用。
   - 不同点：C语言是编译型，执行效率高；Python是解释型，开发速度快但性能较低。C语言需要手动管理内存（malloc/free），Python有自动垃圾回收。C语言语法更接近底层，Python更抽象。
（3）与低级语言（汇编）的对比：
   - 相同点：都能直接操作内存和寄存器，适合系统编程。
   - 不同点：汇编语言使用助记符和机器指令，与硬件一一对应，编写效率低；C语言使用高级语法，可读性和可移植性远强于汇编。汇编代码通常比C更高效，但开发周期长。
结论：C语言在抽象层次上填补了高级语言和汇编之间的空白，是系统编程的“黄金标准”。', '首先解释“中级语言”的定义，然后分别与高级语言（Python）和低级语言（汇编）进行对比，从编译/解释、内存管理、可读性、执行效率等角度分析异同。', 'easy', NULL, NULL, 'C语言的发展历史与特点', '2026-07-05T11:59:52.853217+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('ff0ffab2-f457-523b-a991-e03875a7f1f8', '4faf7aea-bb5d-5b11-afb4-9babc37bab6a', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '阅读以下C语言代码片段，分析其输出结果，并说明C语言中指针和数组的关系。
```c
#include <stdio.h>
int main() {
    int arr[] = {10, 20, 30, 40, 50};
    int *p = arr;
    printf("%d\\n", *(p + 2));
    printf("%d\\n", p[3]);
    return 0;
}
```', 'coding', NULL, '输出结果：
30
40

分析：
（1）指针与数组的关系：在C语言中，数组名arr代表数组首元素的地址，即arr等价于&arr[0]。指针p被初始化为arr，因此p指向数组的第一个元素。
（2）*(p + 2)：p + 2指向数组第三个元素（下标为2），即arr[2] = 30，解引用后输出30。
（3）p[3]：指针支持下标运算，p[3]等价于*(p + 3)，即数组第四个元素（下标为3），arr[3] = 40，输出40。
（4）结论：指针和数组在C语言中紧密关联，指针可以通过偏移量访问数组元素，数组名在表达式中常被转换为指针。', '本题考察指针与数组的关系。需先计算输出结果（30和40），然后解释指针运算规则：p + 2是地址偏移，*(p+2)取值；p[3]是下标语法糖，等价于*(p+3)。最后总结数组名与指针的等价性。', 'easy', NULL, NULL, 'C语言的发展历史与特点', '2026-07-05T11:59:52.853217+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('c6236e74-438f-5034-b0d7-43836aff0f14', '4faf7aea-bb5d-5b11-afb4-9babc37bab6a', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', 'C语言开发环境的核心组件中，负责将源代码转换为机器码的是？', 'choice', '["A. 文本编辑器", "B. 编译器", "C. 链接器", "D. 调试器"]', 'B', '编译器的作用是将C语言源代码（.c文件）转换为机器可执行的机器码（目标文件），而文本编辑器用于编写代码，链接器用于合并目标文件，调试器用于排查错误。', 'easy', NULL, NULL, '开发环境安装与配置', '2026-07-05T11:59:52.853217+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('9f4bbe7f-6322-5d9a-b02c-653e7a0c8fad', '4faf7aea-bb5d-5b11-afb4-9babc37bab6a', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '以下哪个是集成开发环境（IDE）的典型代表？', 'choice', '["A. GCC", "B. MinGW", "C. Code::Blocks", "D. Makefile"]', 'C', 'Code::Blocks是一个流行的C/C++集成开发环境（IDE），集成了编辑器、编译器、调试器等工具。GCC是编译器，MinGW是Windows上的GCC移植版，Makefile是构建脚本，不属于IDE。', 'easy', NULL, NULL, '开发环境安装与配置', '2026-07-05T11:59:52.853217+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('2f026014-8ea9-5941-a78d-ebdef6d6e2e1', '4faf7aea-bb5d-5b11-afb4-9babc37bab6a', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', 'C语言编译过程中，预处理阶段的主要任务不包括？', 'choice', '["A. 处理宏定义", "B. 包含头文件", "C. 将汇编代码转换为机器码", "D. 删除注释"]', 'C', '预处理阶段处理宏定义、头文件包含和删除注释等。将汇编代码转换为机器码是汇编阶段的任务，不是预处理阶段。', 'easy', NULL, NULL, '开发环境安装与配置', '2026-07-05T11:59:52.853217+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('0b4c4aca-af44-5404-ac80-01017b41523e', '4faf7aea-bb5d-5b11-afb4-9babc37bab6a', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '在Windows系统中安装MinGW后，为了能在命令提示符中直接使用gcc命令，需要配置什么？', 'choice', '["A. 桌面快捷方式", "B. 系统环境变量PATH", "C. 注册表", "D. 防火墙规则"]', 'B', '配置系统环境变量PATH，将MinGW的bin目录（如C:\\MinGW\\bin）添加到PATH中，操作系统才能在任何目录下找到gcc可执行文件。', 'easy', NULL, NULL, '开发环境安装与配置', '2026-07-05T11:59:52.853217+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('04064dc4-795d-5fdc-9535-6de31adfeea4', '4faf7aea-bb5d-5b11-afb4-9babc37bab6a', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '链接器的主要功能是？', 'choice', '["A. 检查语法错误", "B. 将目标文件和库文件合并为可执行文件", "C. 将源代码转换为汇编代码", "D. 逐行执行代码"]', 'B', '链接器负责将编译生成的目标文件（.o/.obj）以及所需的库文件合并链接，最终生成可执行文件（.exe或可执行二进制）。', 'easy', NULL, NULL, '开发环境安装与配置', '2026-07-05T11:59:52.853217+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('b0caeb23-f14a-53d5-8c34-1048f6afc659', '4faf7aea-bb5d-5b11-afb4-9babc37bab6a', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', 'C语言开发环境中，调试器的作用是帮助开发者逐行执行代码并查看变量值，从而排查逻辑错误。', 'choice', '["A. 正确", "B. 错误"]', 'A', '调试器允许开发者设置断点、单步执行、监视变量值，是排查程序运行时错误和逻辑错误的重要工具。', 'easy', NULL, NULL, '开发环境安装与配置', '2026-07-05T11:59:52.853217+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('d3f3a27e-5b66-5331-81ab-c20307db4c4c', '4faf7aea-bb5d-5b11-afb4-9babc37bab6a', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '在Linux系统中，通常不需要额外安装GCC，因为多数发行版默认带有GCC编译器。', 'choice', '["A. 正确", "B. 错误"]', 'A', '许多Linux发行版（如Ubuntu、Debian）默认安装GCC或通过包管理器（apt、yum）轻松安装，因此Linux环境下配置C开发环境相对简便。', 'easy', NULL, NULL, '开发环境安装与配置', '2026-07-05T11:59:52.853217+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('11b67afc-561c-59c0-9634-3fd513d61ae4', '4faf7aea-bb5d-5b11-afb4-9babc37bab6a', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', 'IDE（如Visual Studio Code）安装后无需任何配置即可直接编译运行C语言程序。', 'choice', '["A. 正确", "B. 错误"]', 'B', 'IDE通常需要额外安装编译器（如MinGW或GCC）并配置编译器路径，否则无法编译。例如VS Code需要安装C/C++扩展并配置tasks.json和launch.json。', 'easy', NULL, NULL, '开发环境安装与配置', '2026-07-05T11:59:52.853217+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('de9b235f-72ac-58bf-95a9-bb9b8dd2803e', '4faf7aea-bb5d-5b11-afb4-9babc37bab6a', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', 'C语言编译过程中，汇编阶段生成的文件是目标文件（.obj或.o）。', 'choice', '["A. 正确", "B. 错误"]', 'A', '汇编阶段将汇编代码转换为机器码，生成目标文件（Windows下为.obj，Linux下为.o）。', 'easy', NULL, NULL, '开发环境安装与配置', '2026-07-05T11:59:52.853217+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('d0ff85fe-eea4-55ea-bdb7-c42abd93b120', '4faf7aea-bb5d-5b11-afb4-9babc37bab6a', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '环境变量PATH配置错误会导致编译器无法找到头文件，但不会影响链接过程。', 'choice', '["A. 正确", "B. 错误"]', 'B', 'PATH配置错误主要导致操作系统找不到编译器或链接器等可执行文件，而头文件路径由-I参数或环境变量C_INCLUDE_PATH控制，链接过程也受PATH影响（找不到链接器）。', 'easy', NULL, NULL, '开发环境安装与配置', '2026-07-05T11:59:52.853217+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('a69c0e4b-ddb5-5502-9f22-136e0923a2ca', '4faf7aea-bb5d-5b11-afb4-9babc37bab6a', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', 'C语言编译过程的四个阶段依次是：预处理、___、汇编、链接。', 'fill', NULL, '编译', '编译过程的四个标准阶段为：预处理（preprocessing）、编译（compilation）、汇编（assembly）、链接（linking）。其中编译阶段将预处理后的代码转换为汇编语言。', 'easy', NULL, NULL, '开发环境安装与配置', '2026-07-05T11:59:52.853217+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('7dbf5788-6c19-5571-8594-8622a9773c1c', '4faf7aea-bb5d-5b11-afb4-9babc37bab6a', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '在Windows上使用MinGW时，编译器对应的可执行文件名为___。', 'fill', NULL, 'gcc.exe', 'MinGW是GCC在Windows上的移植版，其C编译器可执行文件名为gcc.exe（通常位于MinGW安装目录的bin文件夹下）。', 'easy', NULL, NULL, '开发环境安装与配置', '2026-07-05T11:59:52.853217+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('e2c21c9f-5c0c-5625-b3dc-893bad6c8632', '4faf7aea-bb5d-5b11-afb4-9babc37bab6a', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '在命令行中使用gcc编译单个源文件hello.c并生成名为hello.exe的可执行文件，应输入命令：gcc hello.c -o ___。', 'fill', NULL, 'hello.exe', 'gcc命令中-o选项用于指定输出文件名，若不指定则默认生成a.exe（Windows）或a.out（Linux）。这里要求生成hello.exe，所以-o hello.exe。', 'medium', NULL, NULL, '开发环境安装与配置', '2026-07-05T11:59:52.853217+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('c999a426-b946-50eb-98ca-0c03a0f45e92', '4faf7aea-bb5d-5b11-afb4-9babc37bab6a', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', 'IDE的中文全称是___。', 'fill', NULL, '集成开发环境', 'IDE是Integrated Development Environment的缩写，意为集成开发环境，集成了代码编辑器、编译器、调试器等工具。', 'medium', NULL, NULL, '开发环境安装与配置', '2026-07-05T11:59:52.853217+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('0f55d52a-e836-5997-98bb-d1ae2338c4cd', '4faf7aea-bb5d-5b11-afb4-9babc37bab6a', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '在C语言编译过程中，___阶段负责处理#include指令，将头文件内容插入到源文件中。', 'fill', NULL, '预处理', '预处理阶段会处理以#开头的指令，如#include、#define等。其中#include指令将指定头文件的内容直接插入到源文件中。', 'medium', NULL, NULL, '开发环境安装与配置', '2026-07-05T11:59:52.853217+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('e1301603-2620-5155-86b0-ab88962b893b', '4faf7aea-bb5d-5b11-afb4-9babc37bab6a', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '请写出在Windows系统上使用MinGW手动配置C语言开发环境的完整步骤（包括下载、安装、配置环境变量及验证），并解释为什么需要配置PATH环境变量。', 'coding', NULL, '参考答案：
1. 下载MinGW安装程序（mingw-get-setup.exe）从官方或镜像站点。
2. 运行安装程序，选择安装路径（如C:\\MinGW），并选择需要安装的组件（至少包括gcc-core、gcc-g++、binutils、mingw32-make）。
3. 安装完成后，进入系统环境变量设置：右键“此电脑”->属性->高级系统设置->环境变量。在系统变量中找到Path，点击编辑，添加MinGW的bin目录（如C:\\MinGW\\bin）。
4. 点击确定保存所有设置。
5. 验证：打开命令提示符（cmd），输入gcc --version，若显示版本信息则配置成功。

为什么配置PATH：PATH环境变量告诉操作系统可执行文件的搜索路径。当在命令行输入gcc时，系统会依次在PATH所列的目录中查找gcc.exe。若不配置，只能在MinGW\\bin目录下运行gcc，无法在任意路径下直接调用。', '本题考察对开发环境手动配置的理解。配置PATH是使命令行工具全局可用的关键步骤，也是理解环境变量作用的典型示例。', 'medium', NULL, NULL, '开发环境安装与配置', '2026-07-05T11:59:52.853217+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('55092595-0633-5c02-88a7-ded4d4e07370', '4faf7aea-bb5d-5b11-afb4-9babc37bab6a', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '小明在Windows下使用MinGW编写了一个C程序，但编译时提示“stdio.h: No such file or directory”。请分析可能的原因并给出至少两种解决方案。', 'coding', NULL, '参考答案：
原因：编译器找不到标准头文件stdio.h，通常是因为MinGW安装不完整或头文件路径未被正确设置。

解决方案：
方案1：重新安装MinGW，确保在安装组件时勾选了“mingw32-gcc-g++”和“mingw32-gcc-core”，这些组件会附带标准库头文件。
方案2：手动设置环境变量C_INCLUDE_PATH（或CPATH），将其指向MinGW的include目录（如C:\\MinGW\\include），使编译器能搜索到头文件。
方案3：在编译命令中使用-I选项指定头文件路径，例如：gcc -I C:\\MinGW\\include program.c -o program.exe

验证：重新编译后应不再报错。', '本题考查对编译器头文件搜索机制的理解。常见错误为安装不完整或路径配置问题，需要从安装和环境变量两方面排查。', 'medium', NULL, NULL, '开发环境安装与配置', '2026-07-05T11:59:52.853217+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('def9e19f-6bd0-5971-a275-0c3cd58eed9a', '4faf7aea-bb5d-5b11-afb4-9babc37bab6a', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '请详细说明C语言从源代码到可执行文件的完整编译过程，并指出每个阶段产生的文件类型及后缀名（以Windows平台为例）。', 'coding', NULL, '参考答案：
1. 预处理：处理#include、#define等指令，删除注释。生成预处理后的文件（通常无后缀或.i文件）。例如：gcc -E main.c -o main.i
2. 编译：将预处理后的代码转换为汇编语言。生成汇编文件（.s文件）。例如：gcc -S main.i -o main.s
3. 汇编：将汇编代码转换为机器码，生成目标文件（.obj文件）。例如：gcc -c main.s -o main.obj
4. 链接：将目标文件和库文件（如libc.a）合并，生成可执行文件（.exe文件）。例如：gcc main.obj -o main.exe

注意：实际使用gcc main.c -o main.exe时，上述四个步骤由编译器自动完成。', '本题是编译原理的基础，要求清晰描述各阶段及文件类型。理解此过程有助于调试和优化程序。', 'medium', NULL, NULL, '开发环境安装与配置', '2026-07-05T11:59:52.853217+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('bfc4aaca-dc34-50f0-aa9d-38330af25252', '4faf7aea-bb5d-5b11-afb4-9babc37bab6a', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '某同学在macOS上使用终端编写C程序，但输入gcc命令后提示“command not found”。请分析原因并给出完整的安装与配置步骤（假设使用Homebrew）。', 'coding', NULL, '参考答案：
原因：macOS系统默认未安装GCC（或Xcode Command Line Tools未安装），导致终端无法识别gcc命令。

安装与配置步骤：
1. 安装Homebrew（若未安装）：在终端执行 /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
2. 使用Homebrew安装GCC：brew install gcc
3. 安装完成后，使用gcc-版本号（如gcc-13）编译，或创建别名：alias gcc=''gcc-13''（添加到~/.bash_profile或~/.zshrc中）
4. 验证：在终端输入gcc --version，显示版本信息即成功。

注意：macOS自带的clang编译器也可编译C程序，但题目要求使用gcc，故安装GCC。', '本题考查不同操作系统下的环境配置差异。macOS的默认编译器是clang，需要额外安装GCC，同时需注意命令名称可能带有版本号。', 'medium', NULL, NULL, '开发环境安装与配置', '2026-07-05T11:59:52.853217+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('35bc55e6-1fb6-55f8-b890-16a1b2e7f71a', '4faf7aea-bb5d-5b11-afb4-9babc37bab6a', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '在Linux系统中，使用命令行编译一个包含多个源文件（main.c、utils.c、utils.h）的C程序，请写出完整的编译命令，并解释每个参数的作用。', 'coding', NULL, '参考答案：
编译命令：gcc main.c utils.c -o program -Wall -Wextra -std=c99

参数解释：
- main.c utils.c：指定需要编译的源文件，编译器会分别编译它们并自动链接。
- -o program：指定输出可执行文件的名称为program（默认输出a.out）。
- -Wall：开启所有常见警告，帮助发现潜在问题。
- -Wextra：开启额外警告，更严格地检查代码。
- -std=c99：指定使用C99标准进行编译，确保代码符合特定标准。

若头文件不在当前目录，可使用-I选项添加头文件搜索路径，例如：gcc main.c utils.c -I ./include -o program', '本题考查多文件编译及常用编译选项。实际开发中需掌握多源文件编译方法及警告选项的使用。', 'medium', NULL, NULL, '开发环境安装与配置', '2026-07-05T11:59:52.853217+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('1a65de8d-15be-5853-b335-23d54fcc4d34', '4faf7aea-bb5d-5b11-afb4-9babc37bab6a', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '在C语言的第一个程序“Hello World”中，`#include <stdio.h>`的作用是什么？', 'choice', '["A. 定义主函数", "B. 包含标准输入输出库，以便使用printf函数", "C. 声明变量", "D. 输出字符串到屏幕"]', 'B', '`#include <stdio.h>`是预处理指令，它告诉编译器在编译前将标准输入输出库（stdio.h）的内容包含进来，这样程序才能使用像printf这样的输入输出函数。选项A错误，主函数由int main()定义；选项C错误，声明变量在函数内部；选项D错误，输出由printf函数完成。', 'medium', NULL, NULL, '第一个C程序：Hello World', '2026-07-05T11:59:52.853217+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('95e5c928-9f79-5c4a-863d-34a54308e695', '4faf7aea-bb5d-5b11-afb4-9babc37bab6a', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '以下哪个是C语言程序的正确入口？', 'choice', '["A. void setup()", "B. int main()", "C. void loop()", "D. start()"]', 'B', 'C语言程序的执行从main函数开始，标准定义是int main()，返回整型值给操作系统。setup和loop是Arduino编程中的函数，start不是C语言标准入口。', 'medium', NULL, NULL, '第一个C程序：Hello World', '2026-07-05T11:59:52.853217+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('bc3a7ab6-3398-5c43-82d8-cd0b204de693', '4faf7aea-bb5d-5b11-afb4-9babc37bab6a', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '在`printf("Hello World\\n");`中，`\\n`的作用是什么？', 'choice', '["A. 输出空格", "B. 换行", "C. 制表符", "D. 回车"]', 'B', '`\\n`是转义字符，代表换行符（newline），将光标移动到下一行开头。空格是空格字符，制表符是`\\t`，回车是`\\r`。', 'medium', NULL, NULL, '第一个C程序：Hello World', '2026-07-05T11:59:52.853217+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('8c3cfcd5-a67c-5b46-a849-1958404e330d', '4faf7aea-bb5d-5b11-afb4-9babc37bab6a', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '一个完整的C程序从编写到运行，通常需要经过哪些步骤？', 'choice', '["A. 编辑、编译、运行", "B. 编辑、编译、链接、运行", "C. 编译、链接、运行", "D. 编辑、链接、运行"]', 'B', 'C程序从编写到运行的正确流程是：编辑源代码（.c文件）→ 编译（生成目标文件.obj）→ 链接（将目标文件与库文件合并生成可执行文件.exe）→ 运行。选项A缺少链接步骤；选项C缺少编辑步骤；选项D缺少编译步骤。', 'medium', NULL, NULL, '第一个C程序：Hello World', '2026-07-05T11:59:52.853217+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('e5c0bd83-860f-512a-98bb-ae881b2576e2', '4faf7aea-bb5d-5b11-afb4-9babc37bab6a', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '以下关于`return 0;`的说法，正确的是？', 'choice', '["A. 表示程序出现错误", "B. 表示程序正常结束并返回0给操作系统", "C. 必须写在程序最后一行", "D. 可以省略不写"]', 'B', '`return 0;`表示程序正常结束，并将整数值0返回给操作系统，通常0表示成功。非0值表示错误。它可以放在main函数的任何位置（执行到该语句即结束），但通常放在最后。在C99标准中，main函数末尾可省略return 0（编译器自动添加），但为了明确性，一般建议保留。', 'medium', NULL, NULL, '第一个C程序：Hello World', '2026-07-05T11:59:52.853217+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('12a82b06-db81-54da-89be-572b5c1a8e56', '4faf7aea-bb5d-5b11-afb4-9babc37bab6a', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', 'C程序总是从`#include`预处理指令开始执行。', 'choice', '["A. 正确", "B. 错误"]', 'B', 'C程序从`main`函数开始执行，而不是从`#include`指令。`#include`是预处理指令，在编译之前处理，用于包含头文件，不是程序执行的起点。', 'medium', NULL, NULL, '第一个C程序：Hello World', '2026-07-05T11:59:52.853217+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('5a9c2bf0-f34a-5f9b-b09c-c7b9db6e37b7', '4faf7aea-bb5d-5b11-afb4-9babc37bab6a', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '在“Hello World”程序中，`printf`函数必须包含头文件`stdio.h`才能使用。', 'choice', '["A. 正确", "B. 错误"]', 'A', '`printf`函数是标准输入输出库中的函数，其声明位于`stdio.h`头文件中。如果不包含该头文件，编译器会报隐式声明警告或错误，导致编译失败。', 'medium', NULL, NULL, '第一个C程序：Hello World', '2026-07-05T11:59:52.853217+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('1304ac51-cf54-5816-830a-fdec08bfe96c', '4faf7aea-bb5d-5b11-afb4-9babc37bab6a', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', 'C语言中，主函数只能定义为`int main()`，不能有其他形式。', 'choice', '["A. 正确", "B. 错误"]', 'B', 'C语言标准允许主函数的两种形式：`int main(void)`（不接受参数）和`int main(int argc, char *argv[])`（接受命令行参数）。另外，在某些编译器中`void main()`也可能被接受，但不符合C标准，不推荐使用。', 'medium', NULL, NULL, '第一个C程序：Hello World', '2026-07-05T11:59:52.853217+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('0bd3b98a-eb4a-5934-bd21-9017768679d0', '4faf7aea-bb5d-5b11-afb4-9babc37bab6a', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '`printf("Hello World\\n");`语句中的双引号必须成对出现。', 'choice', '["A. 正确", "B. 错误"]', 'A', '在C语言中，字符串字面量必须用双引号括起来，且双引号必须成对出现。如果缺少一个双引号，编译器会报语法错误。', 'medium', NULL, NULL, '第一个C程序：Hello World', '2026-07-05T11:59:52.853217+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('b60e3505-b6f5-52e6-8551-bae5fe7cc8b3', '4faf7aea-bb5d-5b11-afb4-9babc37bab6a', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '编译C语言源程序时，编译器会将`#include <stdio.h>`替换为头文件的实际内容。', 'choice', '["A. 正确", "B. 错误"]', 'A', '预处理阶段，编译器遇到`#include`指令，会找到指定的头文件（如stdio.h），并将其全部内容复制到当前文件中，替换该指令。这是预处理器的功能。', 'medium', NULL, NULL, '第一个C程序：Hello World', '2026-07-05T11:59:52.853217+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('8fe1e636-13ea-5de9-99da-90b3134c6998', '4faf7aea-bb5d-5b11-afb4-9babc37bab6a', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', 'C程序“Hello World”中，输出语句使用的函数是___。', 'fill', NULL, 'printf', '在“Hello World”程序中，使用printf函数将字符串输出到控制台。printf是标准输出函数，定义在stdio.h头文件中。', 'medium', NULL, NULL, '第一个C程序：Hello World', '2026-07-05T11:59:53.051411+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('68cf0800-a065-5389-8ac1-d4a42ec83522', '4faf7aea-bb5d-5b11-afb4-9babc37bab6a', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '在C语言中，主函数返回类型是___。', 'fill', NULL, 'int', '根据C语言标准，main函数的返回类型应为int，表示返回一个整数值给操作系统，用于指示程序执行状态（0表示成功，非0表示出错）。', 'medium', NULL, NULL, '第一个C程序：Hello World', '2026-07-05T11:59:53.051411+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('198a0d6a-d4b5-5741-84a4-7835bf896ecc', '4faf7aea-bb5d-5b11-afb4-9babc37bab6a', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '预处理指令`#include`的作用是___。', 'fill', NULL, '包含头文件', '`#include`指令用于将指定的头文件内容插入到当前源文件中，通常用于包含标准库或自定义库的声明，使程序能够使用其中定义的函数和宏。', 'medium', NULL, NULL, '第一个C程序：Hello World', '2026-07-05T11:59:53.051411+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('00b1ad12-b678-5802-afbf-933f8b330492', '4faf7aea-bb5d-5b11-afb4-9babc37bab6a', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '在`printf`函数中，用于换行的转义字符是___。', 'fill', NULL, '\\n', '`\\n`是换行符转义序列，在输出时使光标移动到下一行开头。注意在C字符串中，反斜杠需要写为`\\`。', 'medium', NULL, NULL, '第一个C程序：Hello World', '2026-07-05T11:59:53.051411+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('f0179cb1-fc4f-50ec-8a7a-596e78157df5', '4faf7aea-bb5d-5b11-afb4-9babc37bab6a', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', 'C语言中，函数体由一对___包围。', 'fill', NULL, '花括号 {}', '在C语言中，函数体（包括main函数）由左花括号`{`和右花括号`}`包围，用于定义函数执行的语句序列。', 'medium', NULL, NULL, '第一个C程序：Hello World', '2026-07-05T11:59:53.051411+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('b05f8cac-4080-5288-860e-2153c2fccbea', '4faf7aea-bb5d-5b11-afb4-9babc37bab6a', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '请编写一个完整的C程序，在屏幕上输出两行内容：第一行“Hello World”，第二行“Welcome to C”。要求：使用正确的C语言结构，并解释每行代码的作用。', 'coding', NULL, '```c
#include <stdio.h>   // 预处理指令：包含标准输入输出库
int main() {          // 主函数入口，返回整型
    printf("Hello World\\n");   // 输出第一行并换行
    printf("Welcome to C\\n");  // 输出第二行并换行
    return 0;         // 返回0，表示程序正常结束
}
```', '解题思路：首先需要包含stdio.h头文件以使用printf函数。然后定义int main()作为程序入口。在函数体内，使用两个printf语句分别输出两行文本，每个语句末尾使用\\n换行。最后return 0表示程序成功结束。注意每行代码末尾的分号表示语句结束。', 'medium', NULL, NULL, '第一个C程序：Hello World', '2026-07-05T11:59:53.051411+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('8c3b9d17-0035-5f87-b113-621c3c6eef41', '4faf7aea-bb5d-5b11-afb4-9babc37bab6a', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '小明编写了如下程序，但编译时出现错误。请找出错误并改正。
```c
#include <stdio.h>
int main() {
    printf("Hello World\\n")
    return 0;
}
```', 'coding', NULL, '错误：第3行`printf("Hello World\\n")`末尾缺少分号。
改正：在`printf("Hello World\\n")`后添加分号，即`printf("Hello World\\n");`。
完整正确代码：
```c
#include <stdio.h>
int main() {
    printf("Hello World\\n");
    return 0;
}
```', '解题思路：在C语言中，每条语句（包括函数调用）必须以分号结束。原程序第3行缺少分号，导致编译器认为语句未结束，从而报错。添加分号后，程序可以正常编译运行。', 'medium', NULL, NULL, '第一个C程序：Hello World', '2026-07-05T11:59:53.051411+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('05ab7dc7-afd8-5e72-b576-71460f57a62d', '4faf7aea-bb5d-5b11-afb4-9babc37bab6a', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '请解释从编写“Hello World”程序到在屏幕上看到输出的完整过程，包括预处理、编译、链接、运行四个阶段。', 'coding', NULL, '1. 编辑：使用文本编辑器编写源代码，保存为hello.c文件。
2. 预处理：预处理器处理以#开头的指令，如`#include <stdio.h>`被替换为stdio.h文件的全部内容。
3. 编译：编译器将预处理后的源代码翻译成汇编代码，再转换为机器码，生成目标文件hello.obj（或.o）。
4. 链接：链接器将目标文件与标准库（如printf所在的库）合并，生成可执行文件hello.exe。
5. 运行：操作系统加载可执行文件，从main函数开始执行，调用printf函数将“Hello World”输出到屏幕。', '解题思路：C程序的执行需要经过多个阶段。预处理阶段处理宏和包含指令；编译阶段将C代码转换为机器指令；链接阶段解决函数调用与库的关联；运行阶段由操作系统加载并执行。每个阶段都是不可或缺的。', 'medium', NULL, NULL, '第一个C程序：Hello World', '2026-07-05T11:59:53.051411+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('13a889ef-779f-53fd-bdf7-4e4e1a5c05dc', 'c06969f4-d02e-552a-9d04-d4f0375d0728', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '在顺序结构中，每条语句执行的次数是？', 'choice', '["A. 0次", "B. 1次", "C. 多次", "D. 视条件而定"]', 'B', '顺序结构确保每条语句按顺序执行且仅执行一次。', 'easy', NULL, NULL, '顺序结构与基本输入输出', '2026-07-05T11:59:54.019431+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('c79d9aa1-39ec-52f0-bbd2-4c3f1d0219d7', '4faf7aea-bb5d-5b11-afb4-9babc37bab6a', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '假设在“Hello World”程序中，不小心将`printf("Hello World\\n");`写成了`printf("Hello World\\n"`（缺少右括号），请分析会有什么后果，并给出修改方法。', 'coding', NULL, '后果：编译器会报语法错误，提示缺少右括号，编译失败，无法生成可执行文件。错误信息通常指向该行附近，如“expected '')'' before ...”。
修改方法：补全右括号，改为`printf("Hello World\\n");`。', '解题思路：C语言中函数调用必须使用成对的括号，参数列表放在括号内。缺少右括号导致函数调用格式错误，编译器无法正确解析语句。修改时只需补全括号即可。', 'medium', NULL, NULL, '第一个C程序：Hello World', '2026-07-05T11:59:53.051411+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('f61eb981-3e5f-50e7-9aab-5ad474d98f2a', '4faf7aea-bb5d-5b11-afb4-9babc37bab6a', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '请编写一个C程序，输出以下图案（使用多个printf语句）：
   *
  ***
 *****
Hello World
要求：输出必须包含“Hello World”文本，且每行末尾换行。', 'coding', NULL, '```c
#include <stdio.h>
int main() {
    printf("  *\\n");
    printf(" ***\\n");
    printf("*****\\n");
    printf("Hello World\\n");
    return 0;
}
```', '解题思路：使用多个printf语句分别输出每一行。注意空格用于控制星号的对齐，每行末尾使用\\n换行。最后一行输出“Hello World”并换行。程序结构完整，包含头文件、主函数和返回值。', 'medium', NULL, NULL, '第一个C程序：Hello World', '2026-07-05T11:59:53.051411+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('42b5c606-f3ce-54e3-8bc0-2c5e1131f461', '4faf7aea-bb5d-5b11-afb4-9babc37bab6a', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '在C语言程序中，程序的入口点是哪个函数？', 'choice', '["A. main", "B. printf", "C. scanf", "D. exit"]', 'A', 'C语言规定main函数是程序的入口点，程序从main函数开始执行。', 'hard', NULL, NULL, '程序的基本结构与编译过程', '2026-07-05T11:59:53.051411+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('7a962a33-d1a9-5736-b32f-f673973e3fba', '4faf7aea-bb5d-5b11-afb4-9babc37bab6a', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '编译过程中，将汇编代码转换为机器码的阶段是？', 'choice', '["A. 预处理", "B. 编译", "C. 汇编", "D. 链接"]', 'C', '汇编阶段的任务是将汇编语言代码转换为机器指令，生成目标文件。', 'hard', NULL, NULL, '程序的基本结构与编译过程', '2026-07-05T11:59:53.051411+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('d97349c5-009a-5614-af2b-60509bcb2d13', '4faf7aea-bb5d-5b11-afb4-9babc37bab6a', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '下列哪一项是预处理指令？', 'choice', '["A. int main()", "B. #include <stdio.h>", "C. return 0;", "D. printf(\\"Hello\\");"]', 'B', '#include是预处理指令，用于包含头文件，其他选项都是普通语句。', 'hard', NULL, NULL, '程序的基本结构与编译过程', '2026-07-05T11:59:53.051411+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('ff94e1be-670d-59aa-bae4-efde52c8d650', '4faf7aea-bb5d-5b11-afb4-9babc37bab6a', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '在C语言编译过程中，链接器的主要作用是？', 'choice', '["A. 进行宏替换", "B. 生成汇编代码", "C. 合并目标文件和库文件，解决符号引用", "D. 检查语法错误"]', 'C', '链接器将多个目标文件和库文件合并，解析外部符号引用，生成可执行文件。', 'hard', NULL, NULL, '程序的基本结构与编译过程', '2026-07-05T11:59:53.051411+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('e9b642a8-e3b3-5c45-b187-3ad2ded41271', '4faf7aea-bb5d-5b11-afb4-9babc37bab6a', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '以下关于预处理阶段的说法，错误的是？', 'choice', '["A. 处理以#开头的指令", "B. 可以进行宏替换", "C. 会检查语法错误", "D. 可以包含头文件"]', 'C', '预处理阶段只处理文本替换和文件包含，不进行语法检查，语法检查在编译阶段进行。', 'hard', NULL, NULL, '程序的基本结构与编译过程', '2026-07-05T11:59:53.051411+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('efb52911-535b-53bb-82b5-6fb7fa0287c6', '4faf7aea-bb5d-5b11-afb4-9babc37bab6a', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', 'C语言程序可以没有main函数。', 'choice', '["A. 正确", "B. 错误"]', 'B', 'C语言程序必须有一个main函数作为入口点，否则无法执行。', 'hard', NULL, NULL, '程序的基本结构与编译过程', '2026-07-05T11:59:53.051411+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('f2f05616-2cd7-545d-80d4-2dc7005ce70e', '4faf7aea-bb5d-5b11-afb4-9babc37bab6a', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '编译过程中的预处理阶段会进行词法分析。', 'choice', '["A. 正确", "B. 错误"]', 'B', '词法分析是编译阶段的任务，预处理阶段只处理指令替换和文件包含。', 'hard', NULL, NULL, '程序的基本结构与编译过程', '2026-07-05T11:59:53.051411+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('6ace7d39-ceb3-5125-ad09-8c49b9b5c6d9', '4faf7aea-bb5d-5b11-afb4-9babc37bab6a', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '链接阶段可以处理多个目标文件之间的函数调用。', 'choice', '["A. 正确", "B. 错误"]', 'A', '链接器负责将不同目标文件中的符号引用进行解析，使得跨文件的函数调用得以实现。', 'hard', NULL, NULL, '程序的基本结构与编译过程', '2026-07-05T11:59:53.051411+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('f403f8a5-c393-5c4b-902c-6d35d7cb2d4a', '4faf7aea-bb5d-5b11-afb4-9babc37bab6a', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '汇编阶段生成的文件是可直接运行的可执行文件。', 'choice', '["A. 正确", "B. 错误"]', 'B', '汇编阶段生成的是目标文件（.obj或.o），还需经过链接阶段才能生成可执行文件。', 'hard', NULL, NULL, '程序的基本结构与编译过程', '2026-07-05T11:59:53.051411+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('b801b3ab-afb4-56e5-9d7f-20e0540158e5', '4faf7aea-bb5d-5b11-afb4-9babc37bab6a', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '在C语言中，变量声明只能出现在函数内部。', 'choice', '["A. 正确", "B. 错误"]', 'B', '变量声明可以出现在函数内部（局部变量）或函数外部（全局变量）。', 'hard', NULL, NULL, '程序的基本结构与编译过程', '2026-07-05T11:59:53.051411+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('36508d3e-a287-5350-b713-21cbf0b09668', '4faf7aea-bb5d-5b11-afb4-9babc37bab6a', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', 'C语言编译过程的四个阶段依次是：预处理、编译、___和链接。', 'fill', NULL, '汇编', '标准编译流程包括预处理、编译、汇编、链接四个阶段。', 'hard', NULL, NULL, '程序的基本结构与编译过程', '2026-07-05T11:59:53.051411+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('f9dda11b-db9b-5e5f-b81b-14694f892346', '4faf7aea-bb5d-5b11-afb4-9babc37bab6a', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '预处理指令#define用于定义___。', 'fill', NULL, '宏', '#define用于宏定义，在预处理阶段进行文本替换。', 'hard', NULL, NULL, '程序的基本结构与编译过程', '2026-07-05T11:59:53.051411+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('0e7c5d0b-1dfb-59cb-808f-2b51c5a219b3', '4faf7aea-bb5d-5b11-afb4-9babc37bab6a', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', 'C语言中，每个语句以___结束。', 'fill', NULL, '分号（;）', 'C语言规定语句以分号作为结束符。', 'hard', NULL, NULL, '程序的基本结构与编译过程', '2026-07-05T11:59:53.051411+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('45c2882f-c6ed-5f45-9a7f-115d59fdb28f', '4faf7aea-bb5d-5b11-afb4-9babc37bab6a', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '在编译过程中，___阶段负责将源代码翻译成汇编语言。', 'fill', NULL, '编译', '编译阶段对预处理后的代码进行词法、语法、语义分析，并生成汇编代码。', 'hard', NULL, NULL, '程序的基本结构与编译过程', '2026-07-05T11:59:53.051411+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('2ac24551-7a10-53c4-b2b3-535559f3b124', '4faf7aea-bb5d-5b11-afb4-9babc37bab6a', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '链接器解决的主要问题是___引用。', 'fill', NULL, '符号', '链接器解析目标文件中的符号引用，将不同模块连接起来。', 'hard', NULL, NULL, '程序的基本结构与编译过程', '2026-07-05T11:59:53.051411+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('23b3bc78-21c4-58af-bd59-08e631382951', '4faf7aea-bb5d-5b11-afb4-9babc37bab6a', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '请写出以下C程序经过预处理后的代码（假设头文件内容已知，仅写出替换后的main函数部分）。
```c
#include <stdio.h>
#define PI 3.14
#define SQUARE(x) ((x)*(x))
int main() {
    int r = 5;
    float area = PI * SQUARE(r);
    printf("Area = %f\\n", area);
    return 0;
}
```', 'coding', NULL, '```c
int main() {
    int r = 5;
    float area = 3.14 * ((r)*(r));
    printf("Area = %f\\n", area);
    return 0;
}
```', '预处理阶段，#include <stdio.h>被替换为头文件内容（此处省略），#define PI 3.14将PI替换为3.14，#define SQUARE(x) ((x)*(x))将SQUARE(r)替换为((r)*(r))，得到上述代码。', 'hard', NULL, NULL, '程序的基本结构与编译过程', '2026-07-05T11:59:53.051411+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('747ebdf4-218d-5252-95dd-c8df2e3e4982', 'c06969f4-d02e-552a-9d04-d4f0375d0728', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '顺序结构中的语句可以跳转到任意位置执行。', 'choice', '["A. 正确", "B. 错误"]', 'B', '顺序结构严格按代码顺序执行，不支持跳转，跳转需要使用goto或控制结构。', 'easy', NULL, NULL, '顺序结构与基本输入输出', '2026-07-05T11:59:54.019431+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('cd191c3e-4c23-5b54-bb40-be97aa48be79', 'c06969f4-d02e-552a-9d04-d4f0375d0728', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', 'printf函数在输出时不会自动换行。', 'choice', '["A. 正确", "B. 错误"]', 'A', 'printf不会自动添加换行符，需要手动写入\\n才能换行。', 'easy', NULL, NULL, '顺序结构与基本输入输出', '2026-07-05T11:59:54.019431+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('24c44b1b-0ab6-5e30-a480-15252dc98619', '4faf7aea-bb5d-5b11-afb4-9babc37bab6a', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '简述C语言编译过程中各个阶段的主要任务，并说明为什么需要链接阶段。', 'coding', NULL, '1. 预处理：处理以#开头的指令，如文件包含、宏替换、条件编译。
2. 编译：进行词法、语法、语义分析，生成汇编代码。
3. 汇编：将汇编代码转换为机器码，生成目标文件。
4. 链接：将多个目标文件和库文件合并，解析符号引用，分配地址，生成可执行文件。

需要链接阶段的原因：C程序通常由多个源文件组成，每个源文件编译生成独立的目标文件，这些目标文件之间可能存在函数调用或全局变量引用，链接阶段负责将这些分散的模块整合为一个可执行程序，并解决跨文件的符号引用。', '本题考察对编译全过程的理解，特别是链接阶段的必要性。', 'hard', NULL, NULL, '程序的基本结构与编译过程', '2026-07-05T11:59:53.051411+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('144fd8b0-77be-5c3d-b8d0-2ee36866045a', '4faf7aea-bb5d-5b11-afb4-9babc37bab6a', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '以下程序在编译时会出现错误，请指出错误原因并说明发生在哪个阶段。
```c
#include <stdio.h>
int main() {
    printf("Hello, World!\\n")
    return 0;
}
```', 'coding', NULL, '错误原因：printf语句后缺少分号。该错误发生在编译阶段（语法分析时）。
改正：在printf("Hello, World!\\n")后添加分号。', '预处理阶段不检查语法，编译阶段进行语法分析，发现缺少分号会报语法错误。', 'hard', NULL, NULL, '程序的基本结构与编译过程', '2026-07-05T11:59:53.051411+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('8cc6ae29-3e9c-5875-96ec-539c76d1c04d', '4faf7aea-bb5d-5b11-afb4-9babc37bab6a', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '假设有源文件a.c和b.c，a.c中定义了一个全局变量int x = 10;，b.c中想要使用该变量。请写出b.c中正确的变量声明，并说明在编译和链接过程中如何处理该变量。', 'coding', NULL, 'b.c中的声明：extern int x;

处理过程：
- 编译阶段：b.c编译时，extern int x;告诉编译器x是在其他文件中定义的，编译器不会为x分配空间，但会记录一个未解析的符号。
- 链接阶段：链接器将a.c的目标文件和b.c的目标文件合并，找到a.c中定义的x，将b.c中对x的引用与a.c中的定义绑定，完成符号解析。', 'extern关键字用于声明外部变量，链接阶段负责解析跨文件的符号引用。', 'hard', NULL, NULL, '程序的基本结构与编译过程', '2026-07-05T11:59:53.051411+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('0808c813-629d-50cc-8ff6-1284340b6372', '4faf7aea-bb5d-5b11-afb4-9babc37bab6a', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '请解释为什么C语言中函数可以放在main函数之后定义，但仍然能被main函数调用，并说明编译过程如何支持这一特性。', 'coding', NULL, '在C语言中，如果函数定义在main函数之后，需要在main函数之前提供函数声明（原型），例如：void func();。这样编译器在编译main函数时就知道func的存在和接口，不会报错。

编译过程支持：
- 编译阶段：编译器根据函数声明生成对func的调用指令，但暂时不知道func的地址，会生成一个未解析的符号。
- 链接阶段：链接器找到func函数的实际定义（在后面的目标代码中），将调用处的地址修正为func的实际地址，完成链接。', '函数声明使编译器能正确生成调用代码，链接阶段解决地址绑定。', 'hard', NULL, NULL, '程序的基本结构与编译过程', '2026-07-05T11:59:53.051411+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('701ed476-019b-59c1-ae38-09fe375e7c7d', '99da1ba1-6f61-5901-9da6-8b9a3f783a3d', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '宏常量#define PI 3.14在预处理阶段会被替换为3.14。', 'choice', '["A. 正确", "B. 错误"]', 'A', '#define是预处理指令，在编译前进行文本替换，因此PI会被替换为3.14。', 'easy', NULL, NULL, '变量与常量', '2026-07-05T11:59:53.455219+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('1d8acb76-8f25-5d64-a01b-19250576aca9', '99da1ba1-6f61-5901-9da6-8b9a3f783a3d', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '变量定义时可以不初始化，但使用未初始化的变量可能导致不确定的结果。', 'choice', '["A. 正确", "B. 错误"]', 'A', '未初始化的变量存储的是内存中的随机值，使用它可能导致不可预测的行为，因此说法正确。', 'easy', NULL, NULL, '变量与常量', '2026-07-05T11:59:53.455219+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('fa0f13a4-5c1e-546f-b57f-7bccdca0cebb', '99da1ba1-6f61-5901-9da6-8b9a3f783a3d', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '在C语言中，定义整型变量x并初始化为10的语句是：___。', 'fill', NULL, 'int x = 10;', 'int是数据类型，x是变量名，=10是初始化赋值，语句以分号结束。', 'easy', NULL, NULL, '变量与常量', '2026-07-05T11:59:53.455219+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('bafa8c8f-e23e-5015-b949-54386e419acc', '99da1ba1-6f61-5901-9da6-8b9a3f783a3d', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', 'C语言中，const常量在本质上是一个___。', 'fill', NULL, '只读变量', 'const修饰的变量具有只读属性，不能通过赋值修改其值，但仍占用内存。', 'easy', NULL, NULL, '变量与常量', '2026-07-05T11:59:53.455219+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('ca28be5c-71e1-52d4-adef-a57c1e9f569d', '99da1ba1-6f61-5901-9da6-8b9a3f783a3d', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '宏常量#define MAX 100在预处理阶段会将程序中所有的MAX替换为___。', 'fill', NULL, '100', '#define进行简单的文本替换，MAX被替换为100。', 'easy', NULL, NULL, '变量与常量', '2026-07-05T11:59:53.455219+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('6a013d23-87a9-5a66-87cb-a018bee95074', '99da1ba1-6f61-5901-9da6-8b9a3f783a3d', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '已知char类型占1字节，定义char ch;后，变量ch占用___字节的内存空间。', 'fill', NULL, '1', 'char类型固定占1字节，用于存储字符数据。', 'easy', NULL, NULL, '变量与常量', '2026-07-05T11:59:53.455219+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('e33d1fba-88bd-52f1-9a26-d906a56c8b94', '99da1ba1-6f61-5901-9da6-8b9a3f783a3d', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', 'C语言中，变量名不能以___开头。', 'fill', NULL, '数字', '变量命名规则：以字母或下划线开头，不能以数字开头。', 'medium', NULL, NULL, '变量与常量', '2026-07-05T11:59:53.455219+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('3ead9032-0b86-5430-b9a5-75b6b9ce21cd', '99da1ba1-6f61-5901-9da6-8b9a3f783a3d', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '请写出以下程序的输出结果，并解释变量和常量的存储与使用过程。
```c
#include <stdio.h>
#define PI 3.14
int main() {
    int r = 5;
    const double pi = 3.14159;
    double area1 = PI * r * r;
    double area2 = pi * r * r;
    printf("area1=%.2f, area2=%.2f\\n", area1, area2);
    return 0;
}
```', 'coding', NULL, '输出结果为：area1=78.50, area2=78.54
计算过程：
- area1 = PI * r * r = 3.14 * 5 * 5 = 3.14 * 25 = 78.50
- area2 = pi * r * r = 3.14159 * 5 * 5 = 3.14159 * 25 = 78.53975，保留两位小数为78.54', '程序分析：
1. PI是宏常量，在预处理阶段被替换为3.14，不占用内存。
2. r是整型变量，在栈上分配4字节，初始化为5。
3. pi是const常量，在栈上分配8字节（double），初始化为3.14159，不能修改。
4. area1和area2是double变量，分别存储计算结果。
5. 由于PI精度较低，area1略小于area2。', 'medium', NULL, NULL, '变量与常量', '2026-07-05T11:59:53.455219+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('80d0f815-65b4-5ddc-bc26-866bc977f259', '99da1ba1-6f61-5901-9da6-8b9a3f783a3d', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '阅读以下程序，指出错误并改正，要求使用const常量替代宏常量。
```c
#include <stdio.h>
#define MAX 100
int main() {
    int arr[MAX];
    MAX = 200;  // 试图修改宏常量
    printf("%d\\n", MAX);
    return 0;
}
```', 'coding', NULL, '错误：宏常量不能赋值修改。
改正后代码：
```c
#include <stdio.h>
int main() {
    const int MAX = 100;
    int arr[MAX];
    // MAX = 200;  // 此行应删除或注释，因为const变量不能赋值
    printf("%d\\n", MAX);
    return 0;
}
```
注意：使用const定义数组大小需要C99或更高版本支持变长数组。', '宏常量在预处理阶段进行文本替换，不能作为左值被赋值。使用const常量可以更好地进行类型检查，且仍然具有只读属性。', 'medium', NULL, NULL, '变量与常量', '2026-07-05T11:59:53.455219+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('3bca8dbe-d1ae-5059-93ac-954699973e2a', 'c06969f4-d02e-552a-9d04-d4f0375d0728', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', 'scanf("%d", a); 是正确的输入语句（假设a是int型变量）。', 'choice', '["A. 正确", "B. 错误"]', 'B', 'scanf需要变量地址，正确写法应为scanf("%d", &a);', 'easy', NULL, NULL, '顺序结构与基本输入输出', '2026-07-05T11:59:54.019431+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('057dc82d-5874-510a-a833-5bb2a1ee9835', 'c06969f4-d02e-552a-9d04-d4f0375d0728', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', 'C语言程序总是从main函数开始执行。', 'choice', '["A. 正确", "B. 错误"]', 'A', 'C程序的执行入口是main函数，顺序结构从main的第一条语句开始。', 'easy', NULL, NULL, '顺序结构与基本输入输出', '2026-07-05T11:59:54.019431+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('db7a2247-27d4-5ac4-af0b-9971e783b496', '99da1ba1-6f61-5901-9da6-8b9a3f783a3d', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '请定义一个符号常量TAX_RATE为0.08，并编写一段程序，输入商品价格，计算并输出含税价格（保留两位小数）。要求分别使用#define和const两种方式实现，并说明区别。', 'coding', NULL, '使用#define：
```c
#include <stdio.h>
#define TAX_RATE 0.08
int main() {
    double price, total;
    printf("请输入商品价格: ");
    scanf("%lf", &price);
    total = price * (1 + TAX_RATE);
    printf("含税价格: %.2f\\n", total);
    return 0;
}
```
使用const：
```c
#include <stdio.h>
int main() {
    const double TAX_RATE = 0.08;
    double price, total;
    printf("请输入商品价格: ");
    scanf("%lf", &price);
    total = price * (1 + TAX_RATE);
    printf("含税价格: %.2f\\n", total);
    return 0;
}
```
区别：
1. #define是预处理替换，不检查类型，不占用内存。
2. const是只读变量，占用内存，有类型检查，更安全。', '两种方式都能定义常量，但const提供了更好的类型安全性和作用域控制，推荐在现代C编程中使用const。', 'medium', NULL, NULL, '变量与常量', '2026-07-05T11:59:53.455219+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('981e9560-05cb-52fa-ac55-626a112c8465', '99da1ba1-6f61-5901-9da6-8b9a3f783a3d', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '已知变量定义如下：
```c
int a = 10;
const int b = 20;
```
请分析以下操作是否合法，并说明理由。
(1) a = 30;
(2) b = 40;
(3) int *p = &a;
(4) const int *q = &b;', 'coding', NULL, '(1) 合法：a是普通变量，可以赋值修改。
(2) 不合法：b是const常量，不能赋值修改。
(3) 合法：可以取普通变量的地址赋给普通指针。
(4) 合法：可以取const变量的地址赋给指向const的指针。

完整分析：
- (1) a的值由10变为30，正常。
- (2) 试图修改const变量，编译错误。
- (3) p指向a，可以通过*p修改a。
- (4) q指向b，但不能通过*q修改b。', 'const常量本质上是只读变量，不能通过赋值修改，但可以取地址。注意：如果试图通过指针强制修改const变量，行为未定义。', 'medium', NULL, NULL, '变量与常量', '2026-07-05T11:59:53.455219+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('7957d4af-ce70-55b1-bf38-373693899301', '99da1ba1-6f61-5901-9da6-8b9a3f783a3d', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '编写程序，使用#define定义圆周率PI为3.1415926，然后计算半径为5.5的圆的面积和周长，输出结果保留两位小数。请写出完整代码，并解释变量和常量的使用。', 'coding', NULL, '```c
#include <stdio.h>
#define PI 3.1415926
int main() {
    double radius = 5.5;
    double area = PI * radius * radius;
    double perimeter = 2 * PI * radius;
    printf("面积: %.2f\\n", area);
    printf("周长: %.2f\\n", perimeter);
    return 0;
}
```
输出：
面积: 95.03
周长: 34.56

解释：
- PI是宏常量，在预处理时替换为3.1415926。
- radius是double变量，存储半径值。
- area和perimeter是double变量，存储计算结果。
- 变量占用栈内存，宏常量不占用内存。', '宏常量在预处理阶段完成替换，提高代码可读性。变量在运行时分配内存，其值可以改变。保留两位小数使用%.2f格式控制。', 'medium', NULL, NULL, '变量与常量', '2026-07-05T11:59:53.455219+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('f7ea17b3-da8d-5a46-9aa0-d016bf3b4a95', '99da1ba1-6f61-5901-9da6-8b9a3f783a3d', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '在C语言中，表达式 7 / 2 的结果是？', 'choice', '["A. 3.5", "B. 3", "C. 3.0", "D. 0"]', 'B', '整数除法会截断小数部分，7/2 结果为整数 3。', 'medium', NULL, NULL, '算术运算符与表达式', '2026-07-05T11:59:53.455219+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('ae4459f0-ef5f-5c91-be0b-e3dae9bf78a9', '99da1ba1-6f61-5901-9da6-8b9a3f783a3d', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '下列哪个运算符只能用于整数操作数？', 'choice', '["A. +", "B. -", "C. *", "D. %"]', 'D', '取模运算符 % 要求两个操作数均为整数，结果是被除数除以除数的余数。', 'medium', NULL, NULL, '算术运算符与表达式', '2026-07-05T11:59:53.455219+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('b3b0f54c-e3cb-5456-9374-9072cf4b3d98', '99da1ba1-6f61-5901-9da6-8b9a3f783a3d', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '已知 int a=5, b=2; float c; c = a / b; 则 c 的值是？', 'choice', '["A. 2.5", "B. 2.0", "C. 2", "D. 3.0"]', 'B', 'a/b 是整数除法，结果为 2，然后隐式转换为 float 2.0 赋给 c。', 'medium', NULL, NULL, '算术运算符与表达式', '2026-07-05T11:59:53.455219+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('3d05a226-43d4-5682-8c8a-ec82fed56674', '99da1ba1-6f61-5901-9da6-8b9a3f783a3d', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '表达式 10 % (-3) 的结果是？', 'choice', '["A. -1", "B. 1", "C. -2", "D. 2"]', 'B', '取模结果符号与被除数相同，10 % (-3) = 10 - (10/(-3))*(-3) = 10 - (-3)*(-3) = 10 - 9 = 1。', 'medium', NULL, NULL, '算术运算符与表达式', '2026-07-05T11:59:53.455219+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('55e7f9c9-979e-5d7c-82a6-ef2a017ad3d3', '99da1ba1-6f61-5901-9da6-8b9a3f783a3d', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '设有 int x=3, y=4; 则表达式 x + y * 2 的值是？', 'choice', '["A. 14", "B. 11", "C. 10", "D. 12"]', 'B', '乘法优先级高于加法，y*2=8，x+8=11。', 'medium', NULL, NULL, '算术运算符与表达式', '2026-07-05T11:59:53.455219+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('d1390e57-119b-5696-8ff0-f73d3881a370', '99da1ba1-6f61-5901-9da6-8b9a3f783a3d', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '以下表达式中，结果类型为 float 的是？', 'choice', '["A. 5/2", "B. 5.0/2", "C. 5%2", "D. (int)5.0/2"]', 'B', '5.0/2 中一个操作数为浮点数，结果为浮点数 2.5。', 'medium', NULL, NULL, '算术运算符与表达式', '2026-07-05T11:59:53.455219+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('586484b9-8b16-53f4-bb29-49731df5ca53', '99da1ba1-6f61-5901-9da6-8b9a3f783a3d', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '已知 int a=7, b=2; 则表达式 a - b * 3 的值是？', 'choice', '["A. 15", "B. 1", "C. 13", "D. 3"]', 'B', 'b*3=6，a-6=1。', 'medium', NULL, NULL, '算术运算符与表达式', '2026-07-05T11:59:53.455219+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('9dc58c98-8417-5206-a0cd-0ededfd4658c', '99da1ba1-6f61-5901-9da6-8b9a3f783a3d', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '表达式 (int)(3.7 + 1.2) 的结果是？', 'choice', '["A. 4", "B. 5", "C. 4.9", "D. 4.0"]', 'A', '3.7+1.2=4.9，强制转换为 int 截断小数部分得 4。', 'medium', NULL, NULL, '算术运算符与表达式', '2026-07-05T11:59:53.455219+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('789cb766-f48e-5d01-b719-f03b1c399f43', '99da1ba1-6f61-5901-9da6-8b9a3f783a3d', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '下列表达式中，结果最大的是？', 'choice', '["A. 8/3", "B. 8.0/3", "C. 8%3", "D. (double)8/3"]', 'B', 'A=2，B≈2.6667，C=2，D≈2.6667，但B和D相同，选项B是 8.0/3 直接浮点除法。', 'medium', NULL, NULL, '算术运算符与表达式', '2026-07-05T11:59:53.455219+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('547958f1-69aa-572f-81f2-e4b3731a4d60', '99da1ba1-6f61-5901-9da6-8b9a3f783a3d', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '设有 int a=10, b=20, c=30; 则表达式 c = a + b 执行后 c 的值是？', 'choice', '["A. 30", "B. 10", "C. 20", "D. 50"]', 'D', '赋值运算符优先级低于加法，先计算 a+b=30，再赋给 c，c 由 30 变为 30，但原 c=30 被覆盖。', 'medium', NULL, NULL, '算术运算符与表达式', '2026-07-05T11:59:53.455219+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('099ef611-4e45-5127-9ae0-3727d7a4656a', '99da1ba1-6f61-5901-9da6-8b9a3f783a3d', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', 'C语言中，表达式 5/2 与 5.0/2 的结果类型相同。', 'choice', '["A. 正确", "B. 错误"]', 'B', '5/2 是整数除法结果为 int 类型 2，5.0/2 是浮点除法结果为 double 类型 2.5。', 'medium', NULL, NULL, '算术运算符与表达式', '2026-07-05T11:59:53.619493+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('ef8b2ccb-f8a0-5784-98f6-9a48a9903c6d', 'c06969f4-d02e-552a-9d04-d4f0375d0728', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', 'C语言中，顺序结构程序执行的特点是？', 'choice', '["A. 按代码书写顺序从上到下依次执行", "B. 按代码的优先级顺序执行", "C. 随机选择一条语句执行", "D. 反复执行某一段代码"]', 'A', '顺序结构是最基本的控制结构，程序按照代码的书写顺序，从上到下逐条执行，每条语句执行且仅执行一次。', 'easy', NULL, NULL, '顺序结构与基本输入输出', '2026-07-05T11:59:54.019431+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('39b90811-b96d-51f0-bc0e-25fdf932927a', 'c06969f4-d02e-552a-9d04-d4f0375d0728', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '下列哪个头文件提供了C语言的标准输入输出函数？', 'choice', '["A. <stdlib.h>", "B. <stdio.h>", "C. <string.h>", "D. <math.h>"]', 'B', '标准输入输出函数如printf()和scanf()由头文件<stdio.h>提供。', 'easy', NULL, NULL, '顺序结构与基本输入输出', '2026-07-05T11:59:54.019431+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('0d28ba42-a587-5678-bf03-cad5211fe158', 'c06969f4-d02e-552a-9d04-d4f0375d0728', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '执行printf("%d", 5+3); 后，屏幕输出的结果是？', 'choice', '["A. 5+3", "B. 8", "C. 53", "D. 出错"]', 'B', 'printf函数按格式说明符%d输出整数，5+3的结果为8。', 'easy', NULL, NULL, '顺序结构与基本输入输出', '2026-07-05T11:59:54.019431+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('8836c9d1-c3b6-5457-8f67-2c762569e771', 'c06969f4-d02e-552a-9d04-d4f0375d0728', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '若int a; scanf("%d", &a); 输入5，则a的值是？', 'choice', '["A. 5", "B. &a", "C. 随机值", "D. 0"]', 'A', 'scanf读取输入的整数并存储到变量a的地址中，因此a的值为5。', 'easy', NULL, NULL, '顺序结构与基本输入输出', '2026-07-05T11:59:54.019431+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('99978985-e8d2-51bb-8894-186c8529bc9e', 'c06969f4-d02e-552a-9d04-d4f0375d0728', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '程序计数器（PC）在顺序结构中会依次指向下一条指令的地址。', 'choice', '["A. 正确", "B. 错误"]', 'A', 'CPU通过程序计数器按地址顺序取指执行，实现顺序结构。', 'easy', NULL, NULL, '顺序结构与基本输入输出', '2026-07-05T11:59:54.019431+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('082ed1aa-cb2c-534b-bcb5-ddf3ec9caed2', 'c06969f4-d02e-552a-9d04-d4f0375d0728', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', 'C语言中，标准输出函数是___。', 'fill', NULL, 'printf', 'printf用于格式化输出，是标准输出函数。', 'easy', NULL, NULL, '顺序结构与基本输入输出', '2026-07-05T11:59:54.019431+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('625faba9-8af8-5a4a-a77c-012bbeadfca5', 'c06969f4-d02e-552a-9d04-d4f0375d0728', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '使用scanf函数时，变量前需要加___运算符来获取地址。', 'fill', NULL, '&', 'scanf需要变量的地址，因此使用&运算符。', 'easy', NULL, NULL, '顺序结构与基本输入输出', '2026-07-05T11:59:54.019431+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('39b0f408-147f-5596-8a3f-9ae22f20f7ff', 'c06969f4-d02e-552a-9d04-d4f0375d0728', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '执行printf("%d\\n", 10); 后，输出结果为___。', 'fill', NULL, '10', 'printf输出整数10，\\n表示换行，但答案只需输出内容10。', 'easy', NULL, NULL, '顺序结构与基本输入输出', '2026-07-05T11:59:54.019431+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('e2e051fb-502b-502e-9886-a4c219266c08', 'c06969f4-d02e-552a-9d04-d4f0375d0728', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '顺序结构的执行流程是___到___逐条执行。', 'fill', NULL, '上, 下', '顺序结构按代码书写顺序从上到下执行。', 'easy', NULL, NULL, '顺序结构与基本输入输出', '2026-07-05T11:59:54.019431+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('5c5eefcb-f92e-59b6-89c7-3f051732844d', 'c06969f4-d02e-552a-9d04-d4f0375d0728', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '输入函数scanf的底层依赖于操作系统提供的___系统调用。', 'fill', NULL, 'read', 'scanf调用read系统调用从标准输入读取数据。', 'easy', NULL, NULL, '顺序结构与基本输入输出', '2026-07-05T11:59:54.019431+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('b9c8f640-47f7-51ff-bba6-601934be93da', 'c06969f4-d02e-552a-9d04-d4f0375d0728', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '编写一个完整的C程序，要求：定义两个整型变量a和b，从键盘输入它们的值，计算并输出它们的和与差。', 'coding', NULL, '#include <stdio.h>
int main() {
    int a, b;
    printf("请输入两个整数：");
    scanf("%d%d", &a, &b);
    printf("和：%d\\n", a + b);
    printf("差：%d\\n", a - b);
    return 0;
}', '程序采用顺序结构：先定义变量，再输入，然后计算并输出。注意scanf中变量前加&，输出时使用格式说明符%d。', 'easy', NULL, NULL, '顺序结构与基本输入输出', '2026-07-05T11:59:54.019431+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('22dcc1d2-ac23-52eb-bb9e-db19f3eefa56', 'c06969f4-d02e-552a-9d04-d4f0375d0728', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '分析以下程序的输出结果，并说明每步执行过程。
#include <stdio.h>
int main() {
    int x = 5;
    int y = 3;
    printf("%d\\n", x + y);
    printf("%d\\n", x - y);
    return 0;
}', 'coding', NULL, '输出：
8
2
执行过程：定义x=5，y=3；第一条printf输出5+3=8并换行；第二条printf输出5-3=2并换行。', '程序按顺序执行：变量赋值后，依次执行两个printf语句，分别计算并输出和与差。', 'easy', NULL, NULL, '顺序结构与基本输入输出', '2026-07-05T11:59:54.019431+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('bf20c916-eb3b-5464-93fe-84c773ce0ad2', 'c06969f4-d02e-552a-9d04-d4f0375d0728', '9c01a8fb-9ebc-50ae-b160-527f3928a7d1', '请指出以下程序中的错误并修正：
#include <stdio.h>
int main() {
    int num;
    printf("输入一个数：");
    scanf("%d", num);
    printf("你输入了：%d\\n", num);
