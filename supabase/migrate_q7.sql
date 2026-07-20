        throw new Exception("Error");
    }
}', 'choice', '["A. 编译错误", "B. Error", "C. Caught", "D. 无输出"]', 'C', 'methodA声明了抛出Exception，main方法中调用了methodA并捕获了Exception，因此输出"Caught"。程序正常运行。', 'medium', NULL, NULL, 'throw与throws关键字', '2026-07-05T11:59:47.834514+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('3be58bb8-ba3a-554d-9dd8-cdd9e0f0599e', '3671f83e-25d6-55a4-95b1-d0ab3cf3aea5', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', 'throw关键字可以抛出任何Throwable或其子类的实例。', 'choice', '["A. 正确", "B. 错误"]', 'A', 'throw后面必须跟一个Throwable或其子类的实例，包括Exception、Error等。但通常只抛出Exception或自定义异常，不推荐抛出Error。', 'medium', NULL, NULL, 'throw与throws关键字', '2026-07-05T11:59:47.834514+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('4079d2c7-d147-5c32-a78a-83fb5ddcbf92', '3671f83e-25d6-55a4-95b1-d0ab3cf3aea5', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '在方法声明中使用throws时，如果声明的异常是___类的子类，则调用者可以不用处理。', 'fill', NULL, 'RuntimeException', 'RuntimeException及其子类属于非检查型异常（unchecked exception），编译器不强制要求调用者捕获或声明抛出。', 'medium', NULL, NULL, 'throw与throws关键字', '2026-07-05T11:59:47.834514+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('773250f0-505d-5fab-806d-70a22299c3fc', '3671f83e-25d6-55a4-95b1-d0ab3cf3aea5', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '分析以下代码，指出其中的错误并给出修正后的完整代码。
public class Demo {
    public static void main(String[] args) {
        try {
            int result = divide(10, 0);
            System.out.println(result);
        } catch (ArithmeticException e) {
            System.out.println("除零异常");
        }
    }
    public static int divide(int a, int b) {
        if (b == 0) {
            throw new ArithmeticException("除数不能为0");
        }
        return a / b;
    }
}', 'coding', NULL, '代码本身没有语法错误，可以正常运行。但若将ArithmeticException改为检查型异常（如Exception），则需要在divide方法声明中添加throws。修正示例：
public static int divide(int a, int b) throws Exception {
    if (b == 0) {
        throw new Exception("除数不能为0");
    }
    return a / b;
}
同时main中catch改为Exception。', '原代码中ArithmeticException是运行时异常，不需要throws声明。但如果改为检查型异常，则必须声明throws，否则编译错误。题目旨在考察throw与throws的配合使用。', 'medium', NULL, NULL, 'throw与throws关键字', '2026-07-05T11:59:47.834514+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('45b09419-5359-5087-947a-90c0ca47af2e', '3671f83e-25d6-55a4-95b1-d0ab3cf3aea5', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '如果一个方法声明了throws多个异常，调用者应该如何处理？', 'choice', '["A. 只需捕获其中一个异常即可", "B. 必须捕获所有声明的异常，或继续用throws声明", "C. 不需要处理，因为throws只是提示", "D. 只能捕获第一个异常"]', 'B', '如果方法声明了多个异常，调用者必须捕获所有检查型异常，或者在自己的方法声明中继续使用throws声明这些异常（或它们的父类）。这是Java编译器的要求。', 'medium', NULL, NULL, 'throw与throws关键字', '2026-07-05T11:59:47.834514+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('1b2b56e9-2e36-51ff-bd88-a7b032c6ba34', '3671f83e-25d6-55a4-95b1-d0ab3cf3aea5', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '在方法内部使用throw抛出异常后，该方法会立即终止执行。', 'choice', '["A. 正确", "B. 错误"]', 'A', 'throw语句会立即中断当前方法的执行，控制权转移到调用栈中最近的匹配catch块，或者继续向上抛出。throw之后的代码不会被执行。', 'medium', NULL, NULL, 'throw与throws关键字', '2026-07-05T11:59:47.834514+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('4d8a17ff-8780-5fd9-a990-4e104f1717c4', '3671f83e-25d6-55a4-95b1-d0ab3cf3aea5', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '以下代码中，方法readFile()使用了throw和throws，请在横线处填入正确的关键字：
public void readFile(String path) ___ FileNotFoundException {
    if (path == null) {
        ___ new FileNotFoundException("路径为空");
    }
    // 读取文件
}', 'fill', NULL, 'throws; throw', '第一个空在方法声明处，用于声明可能抛出的异常类型，应填throws。第二个空在方法内部，用于抛出异常实例，应填throw。', 'medium', NULL, NULL, 'throw与throws关键字', '2026-07-05T11:59:47.834514+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('a6a68678-5a61-517d-91be-0a4fec6b9921', '3671f83e-25d6-55a4-95b1-d0ab3cf3aea5', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '设计一个银行账户类BankAccount，包含方法withdraw(double amount) throws InsufficientBalanceException。要求：
1. 自定义异常类InsufficientBalanceException，继承Exception。
2. withdraw方法中，如果余额不足，则抛出该异常。
3. 提供一个main方法测试，分别测试余额充足和余额不足的情况，并处理异常。', 'coding', NULL, 'class InsufficientBalanceException extends Exception {
    public InsufficientBalanceException(String message) {
        super(message);
    }
}

class BankAccount {
    private double balance;

    public BankAccount(double balance) {
        this.balance = balance;
    }

    public void withdraw(double amount) throws InsufficientBalanceException {
        if (amount > balance) {
            throw new InsufficientBalanceException("余额不足，当前余额: " + balance + ", 取款金额: " + amount);
        }
        balance -= amount;
        System.out.println("取款成功，剩余余额: " + balance);
    }

    public double getBalance() {
        return balance;
    }
}

public class TestBank {
    public static void main(String[] args) {
        BankAccount account = new BankAccount(1000);
        try {
            account.withdraw(500); // 余额充足
            account.withdraw(600); // 余额不足
        } catch (InsufficientBalanceException e) {
            System.out.println("异常: " + e.getMessage());
        }
    }
}', '自定义异常类继承Exception，提供构造方法。BankAccount类中withdraw方法检查余额，不足时throw异常，并用throws声明。main方法中创建账户，调用withdraw，用try-catch处理异常，验证两种情况。', 'medium', NULL, NULL, 'throw与throws关键字', '2026-07-05T11:59:47.834514+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('ab3dc6d4-88d4-5ffd-b204-90d7c818d82f', '3671f83e-25d6-55a4-95b1-d0ab3cf3aea5', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '关于throw和throws，以下说法错误的是？', 'choice', '["A. throw用于抛出异常实例", "B. throws用于声明异常类型", "C. throw可以单独使用，不需要任何其他关键字", "D. throws可以出现在方法体内部"]', 'D', 'throws只能出现在方法声明中，不能出现在方法体内部。throw可以出现在方法体内部。因此D错误。', 'medium', NULL, NULL, 'throw与throws关键字', '2026-07-05T11:59:47.834514+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('92863f65-57c6-56cc-8a37-5717e960362d', '3671f83e-25d6-55a4-95b1-d0ab3cf3aea5', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '如果一个方法重写父类方法，那么子类方法抛出的检查型异常范围必须小于等于父类方法声明的异常范围。', 'choice', '["A. 正确", "B. 错误"]', 'A', '方法重写时，子类方法不能抛出比父类方法更宽泛的检查型异常，可以抛出相同或更具体的异常，也可以不抛出。这是Java的里氏替换原则的要求。', 'medium', NULL, NULL, 'throw与throws关键字', '2026-07-05T11:59:47.834514+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('57a5488f-f4c9-5b37-9365-c2b104891da1', '3671f83e-25d6-55a4-95b1-d0ab3cf3aea5', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '在Java中，如果方法内部抛出了一个检查型异常，但该方法没有使用throws声明，则编译会报错，因为检查型异常必须被___或___。', 'fill', NULL, '捕获; 声明抛出', '检查型异常必须被处理，处理方式有两种：使用try-catch捕获，或者在方法声明中使用throws声明抛出给调用者。', 'medium', NULL, NULL, 'throw与throws关键字', '2026-07-05T11:59:47.834514+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('bc0804de-1c9b-54e2-b51b-3304e45bfe73', '3671f83e-25d6-55a4-95b1-d0ab3cf3aea5', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '请编写一个程序，模拟用户注册功能。要求：
1. 定义异常类UserNameExistsException（用户名已存在）和InvalidPasswordException（密码不合法）。
2. 定义UserService类，包含方法register(String username, String password) throws UserNameExistsException, InvalidPasswordException。
3. 如果用户名已存在（假设已有用户名列表），抛出UserNameExistsException；如果密码长度小于6位，抛出InvalidPasswordException。
4. 在main方法中模拟注册，处理异常。', 'coding', NULL, 'import java.util.HashSet;
import java.util.Set;

class UserNameExistsException extends Exception {
    public UserNameExistsException(String message) {
        super(message);
    }
}

class InvalidPasswordException extends Exception {
    public InvalidPasswordException(String message) {
        super(message);
    }
}

class UserService {
    private Set<String> existingUsernames = new HashSet<>();

    public void register(String username, String password) throws UserNameExistsException, InvalidPasswordException {
        if (existingUsernames.contains(username)) {
            throw new UserNameExistsException("用户名 ''" + username + "'' 已存在");
        }
        if (password == null || password.length() < 6) {
            throw new InvalidPasswordException("密码长度不能小于6位");
        }
        existingUsernames.add(username);
        System.out.println("用户 ''" + username + "'' 注册成功");
    }
}

public class RegisterDemo {
    public static void main(String[] args) {
        UserService service = new UserService();
        try {
            service.register("alice", "123456"); // 成功
            service.register("alice", "abc");    // 用户名已存在
        } catch (UserNameExistsException | InvalidPasswordException e) {
            System.out.println("注册失败: " + e.getMessage());
        }
        try {
            service.register("bob", "12");       // 密码太短
        } catch (UserNameExistsException | InvalidPasswordException e) {
            System.out.println("注册失败: " + e.getMessage());
        }
    }
}', '定义两个自定义异常类继承Exception。UserService类维护已存在用户名的集合，register方法检查用户名和密码，不满足条件时throw相应异常，并用throws声明。main方法中多次调用register，捕获并处理异常，展示不同情况。', 'hard', NULL, NULL, 'throw与throws关键字', '2026-07-05T11:59:47.834514+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('9b7fee3b-e97f-5574-a2b5-6ccf071e41a4', '3671f83e-25d6-55a4-95b1-d0ab3cf3aea5', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '自定义异常类通常继承自哪个类？', 'choice', '["A. Error", "B. Exception 或 RuntimeException", "C. Throwable", "D. Object"]', 'B', '自定义异常类一般继承Exception（检查型异常）或RuntimeException（非检查型异常），以便融入Java的异常处理机制。继承Error通常用于严重系统错误，不推荐自定义。', 'hard', NULL, NULL, '自定义异常', '2026-07-05T11:59:47.834514+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('1921a39f-420b-5bad-aef9-c8db3e904dde', '3671f83e-25d6-55a4-95b1-d0ab3cf3aea5', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '下列哪个关键字用于在方法中抛出自定义异常？', 'choice', '["A. try", "B. catch", "C. throw", "D. throws"]', 'C', 'throw用于在代码中主动抛出一个异常实例；throws用于在方法声明中声明可能抛出的异常类型。', 'hard', NULL, NULL, '自定义异常', '2026-07-05T11:59:47.834514+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('3861644b-72af-5878-aa92-68e8dcf17693', '3671f83e-25d6-55a4-95b1-d0ab3cf3aea5', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '自定义检查型异常必须继承哪个类？', 'choice', '["A. RuntimeException", "B. Exception", "C. Error", "D. Throwable"]', 'B', '检查型异常是Exception的子类（不包括RuntimeException及其子类），因此自定义检查型异常需直接或间接继承Exception。', 'hard', NULL, NULL, '自定义异常', '2026-07-05T11:59:47.834514+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('0912f0b0-442c-5630-9b69-e423aed2b926', '1f7997c3-dc08-5706-ad07-8db742cf3481', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', 'TreeSet中的元素必须实现Comparable接口或在构造时提供Comparator。', 'choice', '["A. 正确", "B. 错误"]', 'A', 'TreeSet需要比较元素以维持排序，因此元素必须可比较，要么实现Comparable，要么提供Comparator。', 'easy', NULL, NULL, 'Set接口与HashSet/TreeSet', '2026-07-05T11:59:48.241403+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('39f7576a-6565-5bec-9fee-7c1086b1b783', '3671f83e-25d6-55a4-95b1-d0ab3cf3aea5', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '以下关于自定义异常的说法，正确的是？', 'choice', '["A. 自定义异常必须包含无参构造方法", "B. 自定义异常只能继承RuntimeException", "C. 自定义异常可以包含自定义的成员变量和方法", "D. 自定义异常不需要提供任何构造方法"]', 'C', '自定义异常类可以像普通类一样添加成员变量和方法，用于传递更多错误信息。构造方法不是必须的，但通常提供多种构造方法以方便使用。', 'hard', NULL, NULL, '自定义异常', '2026-07-05T11:59:47.834514+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('826cec2e-b70d-547c-a170-3a3e9afaa0bf', '3671f83e-25d6-55a4-95b1-d0ab3cf3aea5', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '某业务场景需要强制调用者处理异常，应定义哪种类型的自定义异常？', 'choice', '["A. 继承RuntimeException", "B. 继承Exception", "C. 继承Error", "D. 继承Throwable"]', 'B', '继承Exception（非RuntimeException）会生成检查型异常，编译器强制调用者处理（try-catch或throws），适合需要强制处理的业务错误。', 'hard', NULL, NULL, '自定义异常', '2026-07-05T11:59:47.834514+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('680c827f-ad25-566f-b6c3-abc1f435f852', '3671f83e-25d6-55a4-95b1-d0ab3cf3aea5', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '自定义异常类可以同时继承Exception和RuntimeException。', 'choice', '["A. 正确", "B. 错误"]', 'B', 'Java不支持多重继承，一个类只能有一个直接父类。自定义异常只能选择继承Exception或RuntimeException之一。', 'hard', NULL, NULL, '自定义异常', '2026-07-05T11:59:47.834514+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('afdee57b-4946-576b-a6e0-fd7249630cd3', '3671f83e-25d6-55a4-95b1-d0ab3cf3aea5', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '继承RuntimeException的自定义异常可以不使用try-catch处理，编译也能通过。', 'choice', '["A. 正确", "B. 错误"]', 'A', 'RuntimeException及其子类是非检查型异常，编译器不强制处理，可以抛给JVM或选择捕获。', 'hard', NULL, NULL, '自定义异常', '2026-07-05T11:59:47.834514+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('1b2b9253-0c3c-5cac-a8f7-781dc5c53107', '1f7997c3-dc08-5706-ad07-8db742cf3481', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '以下关于List的描述，错误的是？', 'choice', '["A. List是有序的集合", "B. List允许存储重复元素", "C. List允许存储null值", "D. List的迭代顺序与元素插入顺序无关"]', 'D', 'List是有序集合，迭代顺序与元素插入顺序一致。D选项说法错误。', 'easy', NULL, NULL, 'Collection接口与List实现', '2026-07-05T11:59:48.241403+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('207730b4-26a1-521d-a044-c276842d59e8', '1f7997c3-dc08-5706-ad07-8db742cf3481', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', 'ArrayList和LinkedList都实现了List接口。', 'choice', '["A. 正确", "B. 错误"]', 'A', 'ArrayList和LinkedList都是List接口的实现类，都支持List定义的所有方法。', 'easy', NULL, NULL, 'Collection接口与List实现', '2026-07-05T11:59:48.241403+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('c8d7c0ef-d699-5678-b036-74dbdb535a88', '1f7997c3-dc08-5706-ad07-8db742cf3481', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', 'List中可以存储完全相同的两个对象。', 'choice', '["A. 正确", "B. 错误"]', 'A', 'List允许存储重复元素，因此可以存储两个完全相同的对象（equals返回true）。', 'easy', NULL, NULL, 'Collection接口与List实现', '2026-07-05T11:59:48.241403+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('15cb9d64-4273-5e13-b47b-ee6c96b2f768', '1f7997c3-dc08-5706-ad07-8db742cf3481', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', 'ArrayList在尾部添加元素的时间复杂度是O(n)。', 'choice', '["A. 正确", "B. 错误"]', 'B', 'ArrayList在尾部添加元素通常为O(1)，因为只需在数组末尾写入元素并更新size。只有在需要扩容时才为O(n)，但均摊后仍为O(1)。', 'easy', NULL, NULL, 'Collection接口与List实现', '2026-07-05T11:59:48.241403+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('e0b18f0e-b9ac-55b4-b9bc-c73827376dfb', '1f7997c3-dc08-5706-ad07-8db742cf3481', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', 'LinkedList的get(int index)方法时间复杂度为O(1)。', 'choice', '["A. 正确", "B. 错误"]', 'B', 'LinkedList基于双向链表，随机访问需要从头部或尾部遍历链表，时间复杂度为O(n)。', 'easy', NULL, NULL, 'Collection接口与List实现', '2026-07-05T11:59:48.241403+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('eccf7899-9c6d-5e3c-afaa-c0419b5618c6', '1f7997c3-dc08-5706-ad07-8db742cf3481', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', 'Collection接口中定义了add(E e)、remove(Object o)等方法。', 'choice', '["A. 正确", "B. 错误"]', 'A', 'Collection接口是集合框架的根接口，定义了add、remove、size、isEmpty等基本操作方法。', 'easy', NULL, NULL, 'Collection接口与List实现', '2026-07-05T11:59:48.241403+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('6185009d-629a-5080-bb8d-409f657363be', '1f7997c3-dc08-5706-ad07-8db742cf3481', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', 'List接口继承了___接口。', 'fill', NULL, 'Collection', 'List是Collection的子接口，继承了Collection中定义的所有方法，并增加了基于索引的操作。', 'easy', NULL, NULL, 'Collection接口与List实现', '2026-07-05T11:59:48.241403+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('10b7ed6f-b05e-5f15-89c1-3126a9c9800a', '1f7997c3-dc08-5706-ad07-8db742cf3481', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', 'ArrayList的初始默认容量是___。', 'fill', NULL, '10', '在Java中，ArrayList的默认初始容量为10，当元素数量超过容量时会自动扩容。', 'easy', NULL, NULL, 'Collection接口与List实现', '2026-07-05T11:59:48.241403+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('617d63d0-9f49-5dab-ae16-41134c1ff3a8', '1f7997c3-dc08-5706-ad07-8db742cf3481', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', 'LinkedList的底层数据结构是___。', 'fill', NULL, '双向链表', 'LinkedList内部使用双向链表实现，每个节点包含前驱、后继引用以及存储的元素。', 'easy', NULL, NULL, 'Collection接口与List实现', '2026-07-05T11:59:48.241403+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('566504f2-e205-5ded-88f5-46339ecc5fde', '1f7997c3-dc08-5706-ad07-8db742cf3481', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '在List中，用于替换指定索引处元素的方法是___。', 'fill', NULL, 'set(int index, E element)', 'set方法将指定索引处的元素替换为新元素，并返回被替换的旧元素。', 'easy', NULL, NULL, 'Collection接口与List实现', '2026-07-05T11:59:48.241403+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('f0aaded1-bb04-5d2c-9d95-66194e30c04f', '1f7997c3-dc08-5706-ad07-8db742cf3481', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', 'ArrayList的___操作在非尾部位置执行时，需要移动元素，时间复杂度为O(n)。', 'fill', NULL, '插入（add）或删除（remove）', '由于ArrayList基于数组存储，在非尾部插入或删除元素时，需要将后续元素整体移动，因此时间复杂度为O(n)。', 'easy', NULL, NULL, 'Collection接口与List实现', '2026-07-05T11:59:48.241403+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('243de0e4-fce1-5d10-865c-42b7a77b25c1', '1f7997c3-dc08-5706-ad07-8db742cf3481', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '编写一个方法，接收一个List<String>，删除其中所有以字母"A"开头的字符串（忽略大小写），并返回删除后的列表。要求分别使用ArrayList和LinkedList实现，并说明在大量数据下哪种实现效率更高？为什么？', 'coding', NULL, '参考答案：
```java
import java.util.*;

public class RemoveAStart {
    // 使用ArrayList实现
    public static List<String> removeAStartWithArrayList(List<String> list) {
        List<String> result = new ArrayList<>(list);
        Iterator<String> it = result.iterator();
        while (it.hasNext()) {
            String s = it.next();
            if (s != null && s.toUpperCase().startsWith("A")) {
                it.remove();
            }
        }
        return result;
    }

    // 使用LinkedList实现
    public static List<String> removeAStartWithLinkedList(List<String> list) {
        List<String> result = new LinkedList<>(list);
        Iterator<String> it = result.iterator();
        while (it.hasNext()) {
            String s = it.next();
            if (s != null && s.toUpperCase().startsWith("A")) {
                it.remove();
            }
        }
        return result;
    }
}
```
在大量数据下，LinkedList效率更高。因为使用迭代器遍历并调用remove()时，ArrayList的remove()操作需要移动后续元素，时间复杂度O(n)，整体为O(n^2)；而LinkedList的remove()只需修改引用，时间复杂度O(1)，整体为O(n)。', '解题思路：使用迭代器遍历列表，避免并发修改异常。分析ArrayList和LinkedList在删除操作上的性能差异。ArrayList删除元素需要移动数组，LinkedList只需修改节点引用。因此大量数据下LinkedList更适合频繁删除的场景。', 'easy', NULL, NULL, 'Collection接口与List实现', '2026-07-05T11:59:48.241403+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('a77f98d3-7f1c-5370-b56f-e20c3c3150fc', '1f7997c3-dc08-5706-ad07-8db742cf3481', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', 'HashSet保证元素的迭代顺序与插入顺序一致。', 'choice', '["A. 正确", "B. 错误"]', 'B', 'HashSet不保证任何顺序，元素的迭代顺序可能随时间变化。如果需要保持插入顺序，应使用LinkedHashSet。', 'easy', NULL, NULL, 'Set接口与HashSet/TreeSet', '2026-07-05T11:59:48.241403+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('999242e9-e7c3-5fca-98d0-44a88c1fc247', '612c5430-94a8-55f4-9225-63d5b14b1fbb', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '在循环队列中，若数组大小为10，front=7，rear=4，则队列中有效元素个数为___。', 'fill', NULL, '7', '有效元素个数 = (rear - front + MaxSize) % MaxSize = (4 - 7 + 10) % 10 = 7。', 'medium', NULL, NULL, '队列的定义与应用', '2026-07-05T11:59:50.477428+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('d47364b2-9dc4-53b5-86a7-d885f434586a', '1f7997c3-dc08-5706-ad07-8db742cf3481', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '现有两个List<Integer>：list1 = [1, 2, 3, 4, 5]，list2 = [3, 4, 5, 6, 7]。请编写代码找出它们的交集（即同时出现在两个列表中的元素），并输出结果。要求使用List的contains方法实现，并分析时间复杂度。', 'coding', NULL, '参考答案：
```java
import java.util.*;

public class Intersection {
    public static void main(String[] args) {
        List<Integer> list1 = Arrays.asList(1, 2, 3, 4, 5);
        List<Integer> list2 = Arrays.asList(3, 4, 5, 6, 7);
        List<Integer> intersection = new ArrayList<>();
        for (Integer num : list1) {
            if (list2.contains(num)) {
                intersection.add(num);
            }
        }
        System.out.println(intersection); // 输出 [3, 4, 5]
    }
}
```
时间复杂度分析：外层循环遍历list1，次数为m；内层contains方法遍历list2，次数为n。因此总时间复杂度为O(m * n)，即O(n^2)级别。若数据量大，建议使用HashSet优化。', '解题思路：遍历其中一个列表，对每个元素使用另一个列表的contains方法判断是否包含。contains方法在List中为线性查找，因此整体时间复杂度为O(m*n)。', 'easy', NULL, NULL, 'Collection接口与List实现', '2026-07-05T11:59:48.241403+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('a5c41748-b202-5a84-ba32-d3f723b245cb', '1f7997c3-dc08-5706-ad07-8db742cf3481', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '请分析以下代码的执行结果，并解释原因。
```java
List<String> list = new ArrayList<>();
list.add("A");
list.add("B");
list.add(1, "C");
list.set(2, "D");
System.out.println(list);
```', 'coding', NULL, '输出结果为：[A, C, D]

分析：
1. 初始添加"A"和"B"，列表为[A, B]
2. list.add(1, "C")：在索引1处插入"C"，原索引1及之后的元素后移，列表变为[A, C, B]
3. list.set(2, "D")：将索引2处的"B"替换为"D"，列表变为[A, C, D]
4. 最终输出[A, C, D]', '解题思路：理解List的add(int index, E element)方法会在指定索引插入元素，后续元素右移；set方法会替换指定索引处的元素。按步骤模拟即可得到结果。', 'easy', NULL, NULL, 'Collection接口与List实现', '2026-07-05T11:59:48.241403+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('a541a861-0d87-5db0-825b-0d4400da15b1', '1f7997c3-dc08-5706-ad07-8db742cf3481', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '设计一个程序，使用List存储学生成绩（整数），要求：
1. 添加10个成绩（包含重复）
2. 计算平均分
3. 找出最高分和最低分
4. 删除所有低于60分的成绩
5. 输出最终列表
请给出完整代码和输出示例。', 'coding', NULL, '参考答案：
```java
import java.util.*;

public class ScoreManager {
    public static void main(String[] args) {
        List<Integer> scores = new ArrayList<>();
        // 添加10个成绩
        scores.addAll(Arrays.asList(85, 92, 58, 73, 68, 45, 90, 88, 55, 79));
        
        // 计算平均分
        int sum = 0;
        for (int s : scores) sum += s;
        double avg = (double) sum / scores.size();
        System.out.println("平均分：" + avg);
        
        // 找出最高分和最低分
        int max = Collections.max(scores);
        int min = Collections.min(scores);
        System.out.println("最高分：" + max + ", 最低分：" + min);
        
        // 删除所有低于60分的成绩
        Iterator<Integer> it = scores.iterator();
        while (it.hasNext()) {
            if (it.next() < 60) {
                it.remove();
            }
        }
        
        System.out.println("删除不及格后的列表：" + scores);
    }
}
```
输出示例：
平均分：73.3
最高分：92, 最低分：45
删除不及格后的列表：[85, 92, 73, 68, 90, 88, 79]', '解题思路：使用ArrayList存储数据，利用Collections工具类求最大最小值，使用迭代器安全删除元素。注意删除时使用迭代器的remove方法，避免ConcurrentModificationException。', 'easy', NULL, NULL, 'Collection接口与List实现', '2026-07-05T11:59:48.241403+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('e7b7f727-7e50-5ddb-b6f0-9ce2fab73fe2', '1f7997c3-dc08-5706-ad07-8db742cf3481', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '请对比ArrayList和LinkedList在以下场景中的性能优劣，并说明理由：
1. 频繁在列表尾部添加元素
2. 频繁在列表头部插入元素
3. 频繁随机访问元素（通过索引获取）
4. 频繁遍历并删除元素', 'coding', NULL, '参考答案：
1. 频繁在尾部添加：两者性能相近，ArrayList均摊O(1)，LinkedList O(1)。但ArrayList可能触发扩容，LinkedList无扩容开销，总体差异不大。
2. 频繁在头部插入：LinkedList更优。ArrayList头部插入需要移动所有元素，O(n)；LinkedList只需修改头节点引用，O(1)。
3. 频繁随机访问：ArrayList更优。ArrayList通过数组下标直接访问，O(1)；LinkedList需要遍历链表，O(n)。
4. 频繁遍历并删除：LinkedList更优。ArrayList删除元素需要移动后续元素，O(n)；LinkedList删除只需修改引用，O(1)。但注意遍历时使用迭代器。

总结：随机访问多的场景用ArrayList，插入删除（尤其是头部）多的场景用LinkedList。', '解题思路：基于两种数据结构的底层实现分析时间复杂度。ArrayList基于数组，随机访问快，插入删除慢；LinkedList基于链表，插入删除快，随机访问慢。', 'easy', NULL, NULL, 'Collection接口与List实现', '2026-07-05T11:59:48.241403+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('b94558e2-94e4-5586-9d58-423955105884', '1f7997c3-dc08-5706-ad07-8db742cf3481', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '以下哪个接口是Set接口的父接口？', 'choice', '["A. List", "B. Collection", "C. Map", "D. Queue"]', 'B', 'Set接口继承自Collection接口，因此其父接口是Collection。List、Map、Queue与Set都是Collection体系下的平级接口或独立接口。', 'easy', NULL, NULL, 'Set接口与HashSet/TreeSet', '2026-07-05T11:59:48.241403+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('27f10cb3-e624-543f-a34a-0940ec89dad5', '1f7997c3-dc08-5706-ad07-8db742cf3481', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', 'HashSet底层基于什么数据结构实现？', 'choice', '["A. 数组", "B. 链表", "C. 哈希表（HashMap）", "D. 红黑树"]', 'C', 'HashSet底层通过HashMap实现，利用哈希表存储元素，元素作为HashMap的key，value统一为一个常量对象。', 'easy', NULL, NULL, 'Set接口与HashSet/TreeSet', '2026-07-05T11:59:48.241403+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('bf2eeaf0-8d0a-56a0-9fb4-0b7567f93452', '1f7997c3-dc08-5706-ad07-8db742cf3481', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', 'TreeSet中元素的排序依赖于什么？', 'choice', '["A. 元素的插入顺序", "B. 元素的hashCode值", "C. 元素的自然顺序或指定的Comparator", "D. 元素的equals方法"]', 'C', 'TreeSet基于红黑树实现，元素按自然顺序（实现Comparable接口）或通过构造时传入的Comparator进行排序。', 'easy', NULL, NULL, 'Set接口与HashSet/TreeSet', '2026-07-05T11:59:48.241403+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('03532c89-ee6f-5c21-b463-75e88968863c', '1f7997c3-dc08-5706-ad07-8db742cf3481', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '向HashSet中添加一个元素时，判断元素重复的依据是什么？', 'choice', '["A. 只比较hashCode", "B. 只比较equals", "C. 先比较hashCode，若相同再比较equals", "D. 先比较equals，若相同再比较hashCode"]', 'C', 'HashSet先调用元素的hashCode()方法，如果哈希值不同则直接添加；如果哈希值相同，再调用equals()方法进一步判断，只有两者都相同时才视为重复。', 'easy', NULL, NULL, 'Set接口与HashSet/TreeSet', '2026-07-05T11:59:48.241403+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('3b712094-6285-55a7-914f-a0dacc423477', '1f7997c3-dc08-5706-ad07-8db742cf3481', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '以下关于TreeSet的说法，正确的是？', 'choice', '["A. 允许添加null元素", "B. 元素无序", "C. 添加、删除、查找的时间复杂度为O(log n)", "D. 基于哈希表实现"]', 'C', 'TreeSet基于红黑树实现，基本操作时间复杂度为O(log n)。从Java 7开始不允许null元素，且元素是有序的。', 'easy', NULL, NULL, 'Set接口与HashSet/TreeSet', '2026-07-05T11:59:48.241403+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('07c38921-3b31-5ceb-939f-6e9f498dfd8f', '1f7997c3-dc08-5706-ad07-8db742cf3481', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', 'HashSet允许存储多个null元素。', 'choice', '["A. 正确", "B. 错误"]', 'B', 'HashSet允许最多一个null元素，因为Set中元素不可重复，null也只能存在一个。', 'easy', NULL, NULL, 'Set接口与HashSet/TreeSet', '2026-07-05T11:59:48.241403+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('abc37f32-e3a8-5b70-ad0f-c130e163346f', '1f7997c3-dc08-5706-ad07-8db742cf3481', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', 'Set接口继承自Collection接口，因此拥有按索引访问元素的方法。', 'choice', '["A. 正确", "B. 错误"]', 'B', 'Set接口没有提供按索引访问元素的方法（如get(int index)），因为Set是无序集合（特定实现除外）。', 'easy', NULL, NULL, 'Set接口与HashSet/TreeSet', '2026-07-05T11:59:48.241403+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('df516dae-6b3c-531f-9ee2-3ca2d858c23a', '1f7997c3-dc08-5706-ad07-8db742cf3481', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', 'HashMap的底层数据结构在JDK 8中不包括以下哪一项？', 'choice', '["A. 数组", "B. 链表", "C. 红黑树", "D. B+树"]', 'D', 'HashMap在JDK 8中采用数组+链表+红黑树实现，当链表长度超过阈值（8）时转换为红黑树，不涉及B+树。', 'medium', NULL, NULL, 'Map接口与HashMap/TreeMap', '2026-07-05T11:59:48.241403+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('1062db4b-31cc-5550-b9be-1903df8fe31c', '1f7997c3-dc08-5706-ad07-8db742cf3481', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '关于HashMap和TreeMap，下列说法正确的是？', 'choice', '["A. HashMap允许null键，TreeMap也允许null键", "B. HashMap线程安全，TreeMap线程不安全", "C. HashMap的插入和查找平均时间复杂度为O(1)，TreeMap为O(log n)", "D. TreeMap基于哈希表实现"]', 'C', 'HashMap允许null键，TreeMap不允许null键（除非自定义Comparator处理）；两者都线程不安全；HashMap基于哈希表，时间复杂度O(1)；TreeMap基于红黑树，时间复杂度O(log n)。因此C正确。', 'medium', NULL, NULL, 'Map接口与HashMap/TreeMap', '2026-07-05T11:59:48.241403+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('8fea43c2-b1b0-55c1-84dd-eb2df275633f', '1f7997c3-dc08-5706-ad07-8db742cf3481', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '以下代码运行后，hashMap中键值对的数量是多少？
Map<String, Integer> map = new HashMap<>();
map.put("A", 1);
map.put("B", 2);
map.put("A", 3);', 'choice', '["A. 1", "B. 2", "C. 3", "D. 0"]', 'B', 'HashMap中键唯一，第二次put("A", 3)会覆盖第一次put("A", 1)的值，因此最终只有两个键值对：{"A":3, "B":2}，数量为2。', 'medium', NULL, NULL, 'Map接口与HashMap/TreeMap', '2026-07-05T11:59:48.241403+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('98265ff9-1b0b-5a3b-9296-6d647775504d', '1f7997c3-dc08-5706-ad07-8db742cf3481', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '若希望Map中的键按照自然顺序（升序）排列，应选择哪个实现类？', 'choice', '["A. HashMap", "B. TreeMap", "C. LinkedHashMap", "D. Hashtable"]', 'B', 'TreeMap基于红黑树实现，会按照键的自然顺序或自定义Comparator进行排序。HashMap无序，LinkedHashMap保持插入顺序，Hashtable无序且线程安全。', 'medium', NULL, NULL, 'Map接口与HashMap/TreeMap', '2026-07-05T11:59:48.241403+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('7fc3ec61-5b24-5c90-817b-51ac744cd51c', '1f7997c3-dc08-5706-ad07-8db742cf3481', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', 'HashMap允许存储null键和null值。', 'choice', '["A. 正确", "B. 错误"]', 'A', 'HashMap允许一个null键和多个null值，这是其特性之一。', 'medium', NULL, NULL, 'Map接口与HashMap/TreeMap', '2026-07-05T11:59:48.241403+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('3a3438dd-4f85-5fe2-810c-62b36ddd1c8f', '1f7997c3-dc08-5706-ad07-8db742cf3481', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', 'TreeMap的键必须实现Comparable接口，或者在构造时提供Comparator。', 'choice', '["A. 正确", "B. 错误"]', 'A', 'TreeMap需要比较键以维持排序，因此键必须实现Comparable接口，或者通过构造器传入Comparator进行自定义排序，否则运行时可能抛出ClassCastException。', 'medium', NULL, NULL, 'Map接口与HashMap/TreeMap', '2026-07-05T11:59:48.241403+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('00b6da78-6fd9-583b-8630-a3712c309fc4', '1f7997c3-dc08-5706-ad07-8db742cf3481', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', 'HashMap和TreeMap都是线程安全的。', 'choice', '["A. 正确", "B. 错误"]', 'B', 'HashMap和TreeMap都是线程不安全的。如果需要线程安全，可以使用Collections.synchronizedMap()或ConcurrentHashMap。', 'medium', NULL, NULL, 'Map接口与HashMap/TreeMap', '2026-07-05T11:59:48.241403+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('4f637b52-7e2e-589d-9673-06169f4750a2', '1f7997c3-dc08-5706-ad07-8db742cf3481', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', 'Map接口中的keySet()方法返回所有键的Set集合。', 'choice', '["A. 正确", "B. 错误"]', 'A', 'keySet()方法返回Map中所有键组成的Set视图，因为键是唯一的，所以返回Set类型。', 'medium', NULL, NULL, 'Map接口与HashMap/TreeMap', '2026-07-05T11:59:48.241403+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('21a5a5bd-a6d1-5206-9617-665aead3ad97', '1f7997c3-dc08-5706-ad07-8db742cf3481', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '向HashMap中插入键值对时，如果键已存在，会抛出异常。', 'choice', '["A. 正确", "B. 错误"]', 'B', 'HashMap的put方法在键已存在时不会抛出异常，而是用新值替换旧值，并返回旧值（如果旧值为null则返回null）。', 'medium', NULL, NULL, 'Map接口与HashMap/TreeMap', '2026-07-05T11:59:48.241403+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('1ed9be25-5990-5c13-8043-5ab78d876f42', '1f7997c3-dc08-5706-ad07-8db742cf3481', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', 'HashMap的默认初始容量是___，默认负载因子是___。', 'fill', NULL, '16, 0.75', 'HashMap的默认初始容量为16，默认负载因子为0.75，当元素数量超过容量*负载因子时会进行扩容。', 'medium', NULL, NULL, 'Map接口与HashMap/TreeMap', '2026-07-05T11:59:48.440544+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('c81268e5-30d2-55e8-a302-a4f210f27592', '1f7997c3-dc08-5706-ad07-8db742cf3481', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', 'TreeMap基于___数据结构实现，其插入和查找的时间复杂度为___。', 'fill', NULL, '红黑树, O(log n)', 'TreeMap底层使用红黑树（自平衡二叉查找树），因此插入、删除、查找操作的时间复杂度均为O(log n)。', 'medium', NULL, NULL, 'Map接口与HashMap/TreeMap', '2026-07-05T11:59:48.440544+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('a79977a2-abd4-54b0-991a-58296db4a81a', '1f7997c3-dc08-5706-ad07-8db742cf3481', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '若要遍历Map中的所有键值对，可以使用___方法返回的Set<Map.Entry<K,V>>。', 'fill', NULL, 'entrySet()', 'entrySet()方法返回Map中所有键值对的Set视图，每个元素是Map.Entry类型，通过它可以同时获取键和值。', 'medium', NULL, NULL, 'Map接口与HashMap/TreeMap', '2026-07-05T11:59:48.440544+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('43183338-3cb2-5c38-9252-11d54daea67e', '1f7997c3-dc08-5706-ad07-8db742cf3481', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', 'HashMap在JDK 8中，当链表长度超过阈值___时，链表会转换为红黑树。', 'fill', NULL, '8', '当HashMap中某个桶的链表长度达到8（且数组长度不小于64）时，链表会转换为红黑树以提高查询效率。', 'medium', NULL, NULL, 'Map接口与HashMap/TreeMap', '2026-07-05T11:59:48.440544+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('093d7bdc-0ae0-59c0-b903-d493e86847ff', '1f7997c3-dc08-5706-ad07-8db742cf3481', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '以下代码输出结果为___。
Map<String, Integer> map = new HashMap<>();
map.put("x", 10);
System.out.println(map.getOrDefault("y", 0));', 'fill', NULL, '0', 'getOrDefault方法在键不存在时返回默认值，这里键"y"不存在，因此返回0。', 'medium', NULL, NULL, 'Map接口与HashMap/TreeMap', '2026-07-05T11:59:48.440544+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('2edcbab6-2332-5fe5-b84a-ea6670d0c011', '1f7997c3-dc08-5706-ad07-8db742cf3481', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '编写一个方法，接收一个字符串数组，返回出现次数最多的字符串及其出现次数。要求使用HashMap实现，并考虑并列最多的情况（返回任意一个即可）。', 'coding', NULL, 'public static Map.Entry<String, Integer> getMostFrequent(String[] words) {
    Map<String, Integer> freqMap = new HashMap<>();
    for (String word : words) {
        freqMap.put(word, freqMap.getOrDefault(word, 0) + 1);
    }
    Map.Entry<String, Integer> maxEntry = null;
    for (Map.Entry<String, Integer> entry : freqMap.entrySet()) {
        if (maxEntry == null || entry.getValue() > maxEntry.getValue()) {
            maxEntry = entry;
        }
    }
    return maxEntry;
}', '首先遍历数组，使用HashMap统计每个字符串的出现次数（利用getOrDefault简化代码）。然后遍历所有entry，找出值最大的entry并返回。时间复杂度O(n)，空间复杂度O(n)。', 'medium', NULL, NULL, 'Map接口与HashMap/TreeMap', '2026-07-05T11:59:48.440544+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('091fabeb-bf90-5ee5-b363-8ac09f4a5c57', '1f7997c3-dc08-5706-ad07-8db742cf3481', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '泛型通配符? super T表示该集合可以存放T及其父类型的对象。', 'choice', '["A. 正确", "B. 错误"]', 'A', '? super T是下界通配符，表示集合的元素类型是T的父类型（包括T本身），因此可以安全地向集合中添加T及其子类型的对象（因为所有子类型都可以赋值给父类型）。', 'hard', NULL, NULL, '泛型与集合工具类', '2026-07-05T11:59:48.440544+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('2b98763a-c648-5246-8726-b516e1c26bfc', '1f7997c3-dc08-5706-ad07-8db742cf3481', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', 'Java中，List<int>是合法的泛型声明。', 'choice', '["A. 正确", "B. 错误"]', 'B', '泛型类型参数必须是引用类型，不能是基本类型。int是基本类型，应使用包装类Integer，即List<Integer>。', 'hard', NULL, NULL, '泛型与集合工具类', '2026-07-05T11:59:48.440544+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('49ce2310-2ea3-5cbc-89ff-d396d6fc7b42', '1f7997c3-dc08-5706-ad07-8db742cf3481', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '使用TreeMap实现一个简易的电话簿，支持添加联系人（姓名、电话），并按照姓名升序输出所有联系人。要求编写完整代码。', 'coding', NULL, 'import java.util.*;
public class PhoneBook {
    private TreeMap<String, String> contacts = new TreeMap<>();
    
    public void addContact(String name, String phone) {
        contacts.put(name, phone);
    }
    
    public void printAll() {
        for (Map.Entry<String, String> entry : contacts.entrySet()) {
            System.out.println(entry.getKey() + ": " + entry.getValue());
        }
    }
    
    public static void main(String[] args) {
        PhoneBook pb = new PhoneBook();
        pb.addContact("Bob", "123456");
        pb.addContact("Alice", "789012");
        pb.addContact("Charlie", "345678");
        pb.printAll();
    }
}', 'TreeMap会按键的自然顺序（String的字典序）自动排序，因此添加联系人后直接遍历即可得到升序输出。注意null键会导致异常，但此处姓名不会为null。', 'medium', NULL, NULL, 'Map接口与HashMap/TreeMap', '2026-07-05T11:59:48.440544+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('f22d3bbe-aa00-5b34-b940-01befc1242a8', '1f7997c3-dc08-5706-ad07-8db742cf3481', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '分析以下代码的运行结果，并解释原因。
Map<String, Integer> map = new HashMap<>();
map.put("a", 1);
map.put("b", 2);
map.put("c", 3);
for (String key : map.keySet()) {
    if ("b".equals(key)) {
        map.remove(key);
    }
}', 'coding', NULL, '运行结果：抛出ConcurrentModificationException异常。
原因：使用keySet()迭代器遍历Map时，直接调用map.remove(key)会修改modCount，导致迭代器检测到并发修改而抛出异常。应使用迭代器的remove()方法或使用ConcurrentHashMap。', 'HashMap的迭代器是fail-fast的，在迭代过程中通过迭代器以外的结构修改（如直接调用map.remove()）会导致modCount与expectedModCount不一致，从而抛出异常。', 'medium', NULL, NULL, 'Map接口与HashMap/TreeMap', '2026-07-05T11:59:48.440544+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('76385841-6d88-5e09-bde0-193415bec251', '1f7997c3-dc08-5706-ad07-8db742cf3481', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '设计一个函数，输入两个字符串s和t，判断它们是否为字母异位词（即包含相同字母且每个字母出现次数相同）。要求使用Map实现，并分析时间复杂度。', 'coding', NULL, 'public boolean isAnagram(String s, String t) {
    if (s.length() != t.length()) return false;
    Map<Character, Integer> map = new HashMap<>();
    for (char c : s.toCharArray()) {
        map.put(c, map.getOrDefault(c, 0) + 1);
    }
    for (char c : t.toCharArray()) {
        if (!map.containsKey(c)) return false;
        int count = map.get(c);
        if (count == 1) {
            map.remove(c);
        } else {
            map.put(c, count - 1);
        }
    }
    return map.isEmpty();
}', '首先统计s中每个字符的出现次数存入HashMap，然后遍历t，每遇到一个字符就从map中减1，若字符不存在或减完后map为空则返回相应结果。时间复杂度O(n)，空间复杂度O(1)（最多26个字母）。', 'medium', NULL, NULL, 'Map接口与HashMap/TreeMap', '2026-07-05T11:59:48.440544+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('a1b2b9fc-12b6-5a87-a42e-e95f6aab0969', '1f7997c3-dc08-5706-ad07-8db742cf3481', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '在HashMap中，当两个不同的键具有相同的hashCode时，会发生什么？请详细说明存储和查找过程。', 'coding', NULL, '当两个不同的键具有相同的hashCode时，它们会被映射到同一个桶（数组索引）中，发生哈希冲突。
存储过程：HashMap会先计算键的hashCode，再通过扰动函数确定桶位置。如果该桶为空，直接存储；如果已有元素，则遍历桶中的链表或红黑树。对于链表，逐个比较键的equals()，如果找到相同键则替换值，否则在链表尾部插入新节点（JDK 8尾插法）。当链表长度超过阈值（8）且数组长度>=64时，链表转换为红黑树。
查找过程：同样计算哈希定位桶，然后遍历链表或红黑树，通过equals()比较键，找到则返回值，否则返回null。', '哈希冲突是HashMap设计中的核心问题，通过链表和红黑树解决。equals()方法用于在相同哈希的键中精确匹配，因此重写hashCode()时必须重写equals()以保证一致性。', 'medium', NULL, NULL, 'Map接口与HashMap/TreeMap', '2026-07-05T11:59:48.440544+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('5781c855-9cd2-5d74-9de2-863462d9ccf7', '1f7997c3-dc08-5706-ad07-8db742cf3481', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', 'Java中引入泛型的主要目的是什么？', 'choice', '["A. 提高程序运行速度", "B. 在编译时进行类型检查，避免运行时强制类型转换异常", "C. 简化代码书写", "D. 支持多线程"]', 'B', '泛型允许在类、接口和方法中使用类型参数，编译器在编译时进行类型检查，确保类型安全，从而避免运行时出现ClassCastException。', 'hard', NULL, NULL, '泛型与集合工具类', '2026-07-05T11:59:48.440544+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('807fa111-a849-51d5-9c7e-9bf27be3616b', '1f7997c3-dc08-5706-ad07-8db742cf3481', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '以下关于Java泛型类型擦除的说法，正确的是？', 'choice', '["A. 泛型信息在运行时完全保留", "B. 类型擦除后，List<String>和List<Integer>在运行时是同一个类型", "C. 类型擦除只在JDK 8之后才引入", "D. 类型擦除会导致程序运行变慢"]', 'B', 'Java泛型通过类型擦除实现，编译后泛型类型参数被替换为原始类型（如List），因此List<String>和List<Integer>在运行时都是List，但编译器保证了类型安全。', 'hard', NULL, NULL, '泛型与集合工具类', '2026-07-05T11:59:48.440544+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('aab687fc-cdbf-5830-a7e7-6a94743b7078', '1f7997c3-dc08-5706-ad07-8db742cf3481', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '下列哪个方法属于java.util.Collections工具类？', 'choice', '["A. Arrays.sort()", "B. Collections.sort()", "C. List.sort()", "D. Collection.sort()"]', 'B', 'Collections.sort(List<T> list)是Collections工具类提供的静态方法，用于对List进行排序。Arrays.sort()属于Arrays类，List.sort()是List接口的默认方法。', 'hard', NULL, NULL, '泛型与集合工具类', '2026-07-05T11:59:48.440544+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('a11ec131-2d27-5fe2-9736-ac27a87cc691', '1f7997c3-dc08-5706-ad07-8db742cf3481', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '给定代码：List<? extends Number> list = new ArrayList<Integer>(); 以下哪个操作是合法的？', 'choice', '["A. list.add(10)", "B. list.add(new Integer(10))", "C. Number n = list.get(0)", "D. list.add(new Object())"]', 'C', '使用? extends Number通配符时，list是生产者，只能读取元素（可以赋值给Number），不能添加元素（除了null），因为实际类型可能是Integer、Double等，编译器无法确定具体类型。', 'hard', NULL, NULL, '泛型与集合工具类', '2026-07-05T11:59:48.440544+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('24fc51e1-4091-5af7-bd97-018abfc60c57', '1f7997c3-dc08-5706-ad07-8db742cf3481', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', 'Collections.unmodifiableList()方法的作用是？', 'choice', '["A. 返回一个可修改的列表副本", "B. 返回一个不可修改的列表视图", "C. 对列表进行排序", "D. 将列表转换为数组"]', 'B', 'unmodifiableList()返回指定列表的不可修改视图，任何试图修改该视图的操作（如add、remove）都会抛出UnsupportedOperationException。', 'hard', NULL, NULL, '泛型与集合工具类', '2026-07-05T11:59:48.440544+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('be0fd894-e092-50dc-b418-80eca9fd11c9', '1f7997c3-dc08-5706-ad07-8db742cf3481', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '泛型方法可以定义在非泛型类中。', 'choice', '["A. 正确", "B. 错误"]', 'A', '泛型方法可以定义在泛型类或非泛型类中，只需要在方法返回类型前声明类型参数即可，例如 public <T> void print(T t)。', 'hard', NULL, NULL, '泛型与集合工具类', '2026-07-05T11:59:48.440544+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('1302360a-4215-52f6-8dff-7d9282fa198d', '1f7997c3-dc08-5706-ad07-8db742cf3481', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '使用Collections.sort()对List<String>排序时，String类必须实现Comparable接口。', 'choice', '["A. 正确", "B. 错误"]', 'A', 'Collections.sort(List<T> list)要求T实现Comparable<? super T>接口，String类已经实现了Comparable<String>，因此可以直接排序。', 'hard', NULL, NULL, '泛型与集合工具类', '2026-07-05T11:59:48.440544+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('65ded3a4-394b-5df2-9918-5c256d4c561f', '4346bc9d-4bbf-5b56-a3e3-ba76b16f73da', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', 'BufferedOutputStream在关闭时会自动刷新缓冲区。', 'choice', '["A. 正确", "B. 错误"]', 'A', 'BufferedOutputStream的close()方法会先调用flush()将缓冲区中剩余数据写入底层流，然后再关闭资源。', 'easy', NULL, NULL, '缓冲流与对象流', '2026-07-05T11:59:48.86174+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('0c95f83c-7459-589c-92b5-d3addaf6ccb4', '4346bc9d-4bbf-5b56-a3e3-ba76b16f73da', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', 'Java中，以下哪个类是字节输出流的基类？', 'choice', '["A. InputStream", "B. OutputStream", "C. Reader", "D. Writer"]', 'B', '字节输出流的基类是OutputStream，它定义了write()方法用于写入字节数据。InputStream是字节输入流的基类，Reader和Writer是字符流的基类。', 'easy', NULL, NULL, '字节流与字符流', '2026-07-05T11:59:48.86174+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('6b9bf031-4482-5b38-ae2d-a1bb8b4e8359', '4346bc9d-4bbf-5b56-a3e3-ba76b16f73da', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '字符流在底层实现时，最终依赖什么进行数据读写？', 'choice', '["A. 直接操作字符", "B. 字节流", "C. 缓冲区", "D. 编码表"]', 'B', '字符流底层实际上是基于字节流实现的。字符流在字节流之上增加了字符编码和解码层，例如FileReader内部使用FileInputStream读取字节，然后根据字符集解码为字符。', 'easy', NULL, NULL, '字节流与字符流', '2026-07-05T11:59:48.86174+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('38a2d59e-8816-59b5-9c3e-63eae3942211', '4346bc9d-4bbf-5b56-a3e3-ba76b16f73da', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '下列哪个类属于字符输入流？', 'choice', '["A. FileInputStream", "B. FileOutputStream", "C. FileReader", "D. FileWriter"]', 'C', 'FileReader是字符输入流，用于读取文本文件。FileInputStream和FileOutputStream是字节流，FileWriter是字符输出流。', 'easy', NULL, NULL, '字节流与字符流', '2026-07-05T11:59:48.86174+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('0f39b30f-17f9-50fa-be2e-976eed5a2153', '4346bc9d-4bbf-5b56-a3e3-ba76b16f73da', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '使用字节流读取文件时，read()方法返回值的含义是？', 'choice', '["A. 读取到的字符", "B. 读取到的字节（0-255），-1表示到达文件末尾", "C. 读取到的字节数", "D. 读取到的字符串"]', 'B', '字节流的read()方法返回读取到的字节（0-255），当返回-1时表示已经读取到文件末尾。这是字节流与字符流读取方式的重要区别。', 'easy', NULL, NULL, '字节流与字符流', '2026-07-05T11:59:48.86174+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('8803720f-5ab0-5a23-aa46-990610cab3ae', '4346bc9d-4bbf-5b56-a3e3-ba76b16f73da', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '对于二进制文件（如图片、音频）的复制操作，应优先选择哪种流？', 'choice', '["A. 字符流", "B. 字节流", "C. 缓冲字符流", "D. 转换流"]', 'B', '二进制文件（如图片、音频）应使用字节流进行操作，因为字节流以字节为单位读写，不涉及编码转换，能保证数据的完整性。字符流主要用于文本文件。', 'easy', NULL, NULL, '字节流与字符流', '2026-07-05T11:59:48.86174+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('ff7e8b92-5292-5552-9a84-1c7504ecdc5c', '4346bc9d-4bbf-5b56-a3e3-ba76b16f73da', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '字节流可以用于读写文本文件，但可能出现乱码问题。', 'choice', '["A. 正确", "B. 错误"]', 'A', '字节流可以读写任何文件，包括文本文件。但由于字节流不处理字符编码，直接读取字节后按默认编码转换为字符可能导致乱码，因此文本文件推荐使用字符流。', 'easy', NULL, NULL, '字节流与字符流', '2026-07-05T11:59:48.86174+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('8d74a82c-9136-51d5-b61f-55640f75adcd', '4346bc9d-4bbf-5b56-a3e3-ba76b16f73da', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', 'FileReader内部直接操作字符，不依赖于字节流。', 'choice', '["A. 正确", "B. 错误"]', 'B', 'FileReader内部实际上依赖于FileInputStream（字节流）来读取字节数据，然后根据指定的字符集（如UTF-8）将字节解码为字符。所以字符流底层是基于字节流的。', 'easy', NULL, NULL, '字节流与字符流', '2026-07-05T11:59:48.86174+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('f0429e03-7017-54db-a5bc-e8c464272c5c', '4346bc9d-4bbf-5b56-a3e3-ba76b16f73da', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '使用BufferedReader包装字符流可以提高读取效率，并支持readLine()方法。', 'choice', '["A. 正确", "B. 错误"]', 'A', 'BufferedReader是一个装饰器类，它包装了字符流，提供了缓冲功能，可以减少底层I/O次数，提高效率。同时它提供了readLine()方法，可以方便地按行读取文本。', 'easy', NULL, NULL, '字节流与字符流', '2026-07-05T11:59:48.86174+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('68d715a0-6d6a-5d13-aa2c-333417a41e5d', '4346bc9d-4bbf-5b56-a3e3-ba76b16f73da', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '字节流和字符流都提供了flush()方法用于强制刷新缓冲区。', 'choice', '["A. 正确", "B. 错误"]', 'B', '只有输出流才提供flush()方法。字节输出流（OutputStream）和字符输出流（Writer）都有flush()方法，用于将缓冲区中的数据强制写出。输入流没有flush()方法。', 'easy', NULL, NULL, '字节流与字符流', '2026-07-05T11:59:48.86174+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('bf0a3a3c-d232-5af5-9e7f-c76a6206f0f8', '4346bc9d-4bbf-5b56-a3e3-ba76b16f73da', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '使用字符流复制图片文件是安全的。', 'choice', '["A. 正确", "B. 错误"]', 'B', '图片文件是二进制文件，使用字符流复制可能会因为编码转换导致数据损坏。字符流在读取字节后会进行解码，写入时又进行编码，对于非文本数据这个过程可能改变数据内容。因此复制二进制文件应使用字节流。', 'easy', NULL, NULL, '字节流与字符流', '2026-07-05T11:59:48.86174+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('6bdcab18-d809-58ff-96fa-eb06459bb897', '4346bc9d-4bbf-5b56-a3e3-ba76b16f73da', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', 'Java中，字节输入流的基类是___，字符输出流的基类是___。', 'fill', NULL, 'InputStream, Writer', '字节输入流的基类是InputStream，字符输出流的基类是Writer。对应的，字节输出流基类是OutputStream，字符输入流基类是Reader。', 'easy', NULL, NULL, '字节流与字符流', '2026-07-05T11:59:48.86174+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('ccf1abbe-6595-5bdb-9b2e-27c69818aa56', '4346bc9d-4bbf-5b56-a3e3-ba76b16f73da', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '字符流底层基于字节流实现，并在字节流之上增加了___和___层。', 'fill', NULL, '字符编码, 解码', '字符流在字节流的基础上增加了字符编码和解码层。读取时，将字节解码为字符；写入时，将字符编码为字节。这是字符流能正确处理文本文件的关键。', 'easy', NULL, NULL, '字节流与字符流', '2026-07-05T11:59:48.86174+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('ac18d584-0228-54d9-99e0-4bc0cc2d7d32', '4346bc9d-4bbf-5b56-a3e3-ba76b16f73da', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '使用字节流读取文件时，read()方法返回-1表示___。', 'fill', NULL, '到达文件末尾', '字节流的read()方法返回一个0-255的整数表示读取到的字节，当返回-1时表示已经读取到文件的末尾，没有更多数据可读。', 'easy', NULL, NULL, '字节流与字符流', '2026-07-05T11:59:48.86174+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('364ade36-1e1c-537b-9811-d96f145a00bf', '4346bc9d-4bbf-5b56-a3e3-ba76b16f73da', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', 'BufferedReader的___方法可以一次读取一行文本，返回的字符串不包含行终止符。', 'fill', NULL, 'readLine', 'BufferedReader提供了readLine()方法，可以方便地按行读取文本数据，返回的字符串不包含换行符等行终止符。如果到达流末尾，则返回null。', 'easy', NULL, NULL, '字节流与字符流', '2026-07-05T11:59:48.86174+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('7c1b6591-b762-5573-a47b-9d218a19222f', '4346bc9d-4bbf-5b56-a3e3-ba76b16f73da', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '在Java中，用于将字节流转换为字符流的桥梁类是___和___。', 'fill', NULL, 'InputStreamReader, OutputStreamWriter', 'InputStreamReader和OutputStreamWriter是字节流与字符流之间的桥梁。InputStreamReader将字节输入流转换为字符输入流，OutputStreamWriter将字符输出流转换为字节输出流，它们允许指定字符编码。', 'easy', NULL, NULL, '字节流与字符流', '2026-07-05T11:59:48.86174+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('a07fd14b-ff84-5a01-bbb6-c334bd6c6ffa', '4346bc9d-4bbf-5b56-a3e3-ba76b16f73da', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '对象流可以直接读写任何Java对象，无需任何条件。', 'choice', '["A. 正确", "B. 错误"]', 'B', '对象流只能读写实现了Serializable接口的对象，否则会抛出NotSerializableException。', 'easy', NULL, NULL, '缓冲流与对象流', '2026-07-05T11:59:48.86174+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('68f37784-b30e-5be1-8fe3-651419777884', '4346bc9d-4bbf-5b56-a3e3-ba76b16f73da', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '缓冲流采用装饰器模式，可以包装其他输入/输出流。', 'choice', '["A. 正确", "B. 错误"]', 'A', 'BufferedInputStream和BufferedOutputStream都是FilterInputStream/FilterOutputStream的子类，采用装饰器模式包装底层流。', 'easy', NULL, NULL, '缓冲流与对象流', '2026-07-05T11:59:48.86174+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('4c1a1b59-c98c-5e4f-90c1-df4d758d4031', '4346bc9d-4bbf-5b56-a3e3-ba76b16f73da', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '使用ObjectOutputStream写入多个对象时，必须按写入顺序用ObjectInputStream读取。', 'choice', '["A. 正确", "B. 错误"]', 'A', '对象流按写入顺序序列化对象，读取时必须保持相同顺序，否则会导致数据错乱或StreamCorruptedException。', 'easy', NULL, NULL, '缓冲流与对象流', '2026-07-05T11:59:48.86174+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('cc607046-e948-55e3-903b-5e0cc545a19c', '4346bc9d-4bbf-5b56-a3e3-ba76b16f73da', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '请编写一个完整的Java方法，使用字节流复制一个图片文件（源文件路径为"source.jpg"，目标文件路径为"dest.jpg"）。要求使用缓冲字节流提高效率，并正确处理异常和资源释放。', 'coding', NULL, 'import java.io.*;

public class FileCopy {
    public static void copyImage() {
        try (BufferedInputStream bis = new BufferedInputStream(new FileInputStream("source.jpg"));
             BufferedOutputStream bos = new BufferedOutputStream(new FileOutputStream("dest.jpg"))) {
            byte[] buffer = new byte[8192];
            int bytesRead;
            while ((bytesRead = bis.read(buffer)) != -1) {
                bos.write(buffer, 0, bytesRead);
            }
            bos.flush();
            System.out.println("图片复制成功");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}', '1. 使用BufferedInputStream和BufferedOutputStream包装字节流，提供缓冲功能提高效率。2. 使用try-with-resources自动关闭资源，避免内存泄漏。3. 定义8KB的字节数组作为缓冲区，循环读取直到返回-1。4. 每次读取后立即写入目标文件，注意write方法要指定偏移量和长度。5. 最后调用flush()确保所有数据写出。', 'easy', NULL, NULL, '字节流与字符流', '2026-07-05T11:59:48.86174+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('1fe34c6a-0d1e-54f7-83c6-63ff6233b397', '4346bc9d-4bbf-5b56-a3e3-ba76b16f73da', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '请编写一个Java方法，使用字符流读取一个UTF-8编码的文本文件（路径为"input.txt"），并统计文件中每个字符出现的次数（忽略大小写），最后将统计结果写入另一个文本文件（路径为"output.txt"），每行格式为"字符:次数"。要求使用BufferedReader和BufferedWriter提高效率。', 'coding', NULL, 'import java.io.*;
import java.util.*;

public class CharCount {
    public static void countChars() {
        Map<Character, Integer> map = new HashMap<>();
        try (BufferedReader br = new BufferedReader(new InputStreamReader(new FileInputStream("input.txt"), "UTF-8"));
             BufferedWriter bw = new BufferedWriter(new OutputStreamWriter(new FileOutputStream("output.txt"), "UTF-8"))) {
            int ch;
            while ((ch = br.read()) != -1) {
                char c = Character.toLowerCase((char) ch);
                map.put(c, map.getOrDefault(c, 0) + 1);
            }
            for (Map.Entry<Character, Integer> entry : map.entrySet()) {
                bw.write(entry.getKey() + ":" + entry.getValue());
                bw.newLine();
            }
            bw.flush();
            System.out.println("统计完成");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}', '1. 使用InputStreamReader和OutputStreamWriter并指定UTF-8编码，确保正确读取和写入文本。2. 使用BufferedReader和BufferedWriter包装以利用缓冲和行操作。3. 逐字符读取，转换为小写后存入HashMap统计次数。4. 遍历Map，将结果写入输出文件，每行一个条目。5. 使用try-with-resources自动关闭资源。', 'easy', NULL, NULL, '字节流与字符流', '2026-07-05T11:59:48.86174+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('d7da359c-716b-51a4-8b93-21d764cafdf7', '4346bc9d-4bbf-5b56-a3e3-ba76b16f73da', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '请解释为什么使用字符流处理二进制文件可能导致数据损坏，并给出一个具体的示例说明。', 'coding', NULL, '字符流在处理数据时，会进行字符编码和解码。对于二进制文件，其字节数据可能不符合任何字符编码规则，导致解码失败或产生替代字符（如''?''），写入时重新编码又会改变原始字节序列，从而损坏数据。
示例：假设一个图片文件中包含字节序列0x80 0x81，使用UTF-8编码的字符流读取时，0x80不是有效的UTF-8起始字节，可能被解码为替换字符U+FFFD（即''?''），写入时''?''被编码为0xEF 0xBF 0xBD，原始数据被破坏。', '字符流的核心是编码转换，而二进制文件的数据是任意字节序列，不一定符合编码规则。因此，字符流会改变数据内容，导致文件损坏。正确的做法是使用字节流直接操作二进制数据。', 'easy', NULL, NULL, '字节流与字符流', '2026-07-05T11:59:48.86174+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('6a6cb84a-6d90-5c67-bde4-315d912ca227', '4346bc9d-4bbf-5b56-a3e3-ba76b16f73da', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '设计一个程序，将用户从控制台输入的文本（支持中文）保存到文件"user_input.txt"中，要求使用字节流与字符流的转换，并指定编码为GBK。请写出核心代码。', 'coding', NULL, 'import java.io.*;

public class SaveInput {
    public static void saveToFile() {
        try (BufferedReader br = new BufferedReader(new InputStreamReader(System.in, "GBK"));
             BufferedWriter bw = new BufferedWriter(new OutputStreamWriter(new FileOutputStream("user_input.txt"), "GBK"))) {
            System.out.println("请输入文本（输入exit结束）：");
            String line;
            while ((line = br.readLine()) != null) {
                if ("exit".equalsIgnoreCase(line.trim())) {
                    break;
                }
                bw.write(line);
                bw.newLine();
            }
            bw.flush();
            System.out.println("保存成功");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}', '1. 使用InputStreamReader(System.in, "GBK")将标准输入字节流转换为字符流，指定GBK编码支持中文。2. 使用BufferedReader包装以支持readLine()。3. 使用OutputStreamWriter(new FileOutputStream(...), "GBK")将字符输出流转换为字节流，指定GBK编码。4. 循环读取用户输入，遇到"exit"退出，否则写入文件。5. 使用try-with-resources自动关闭资源。', 'easy', NULL, NULL, '字节流与字符流', '2026-07-05T11:59:48.86174+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('313b905f-90c7-5377-9fed-923f36e9d580', '4346bc9d-4bbf-5b56-a3e3-ba76b16f73da', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', 'BufferedInputStream的默认缓冲区大小是多少？', 'choice', '["A. 512字节", "B. 1024字节", "C. 8192字节", "D. 4096字节"]', 'C', 'BufferedInputStream内部维护的字节数组默认大小为8192字节（8KB），这是Java IO中缓冲流的常见默认值。', 'easy', NULL, NULL, '缓冲流与对象流', '2026-07-05T11:59:48.86174+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('701fcc2f-bad3-5a43-b278-45de7ae1c111', '4346bc9d-4bbf-5b56-a3e3-ba76b16f73da', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '以下哪个类用于将Java对象写入输出流？', 'choice', '["A. ObjectInputStream", "B. ObjectOutputStream", "C. BufferedOutputStream", "D. FileOutputStream"]', 'B', 'ObjectOutputStream是对象输出流，用于将Java对象序列化为字节并写入底层输出流。', 'easy', NULL, NULL, '缓冲流与对象流', '2026-07-05T11:59:48.86174+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('27891478-d6ae-5cb5-9930-92802abd3b64', '4346bc9d-4bbf-5b56-a3e3-ba76b16f73da', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '如果要对一个对象进行序列化，该对象必须实现哪个接口？', 'choice', '["A. Cloneable", "B. Comparable", "C. Serializable", "D. Runnable"]', 'C', 'Java序列化要求对象所属类实现java.io.Serializable接口，否则会抛出NotSerializableException。', 'easy', NULL, NULL, '缓冲流与对象流', '2026-07-05T11:59:48.86174+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('e0846116-0bb2-5ab0-95d5-44407cb52e53', '4346bc9d-4bbf-5b56-a3e3-ba76b16f73da', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '缓冲流提高读写效率的主要原理是什么？', 'choice', '["A. 使用更快的硬件", "B. 减少系统调用次数", "C. 压缩数据", "D. 并行处理"]', 'B', '缓冲流通过在内存中建立缓冲区，一次读取/写入多个字节，从而减少对底层设备的访问次数（系统调用），提升效率。', 'easy', NULL, NULL, '缓冲流与对象流', '2026-07-05T11:59:48.86174+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('cc6a475f-ac52-5be6-aae8-05849f3aabd8', '4346bc9d-4bbf-5b56-a3e3-ba76b16f73da', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '以下哪个不是对象流的特点？', 'choice', '["A. 支持基本数据类型读写", "B. 支持对象序列化", "C. 自动压缩数据", "D. 需要实现Serializable接口"]', 'C', '对象流并不自动压缩数据，它只是将对象转换为字节序列。压缩需要额外使用压缩流。', 'easy', NULL, NULL, '缓冲流与对象流', '2026-07-05T11:59:48.86174+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('d14c33c7-34ac-5b1d-8bdd-ee1e0250f604', '4346bc9d-4bbf-5b56-a3e3-ba76b16f73da', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', 'transient修饰的成员变量在序列化时会被保留。', 'choice', '["A. 正确", "B. 错误"]', 'B', 'transient关键字用于标记不需要序列化的字段，在序列化过程中这些字段的值会被忽略，反序列化后为默认值。', 'easy', NULL, NULL, '缓冲流与对象流', '2026-07-05T11:59:48.86174+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('85a67131-7369-529c-8de3-befab0140059', '4346bc9d-4bbf-5b56-a3e3-ba76b16f73da', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', 'BufferedInputStream内部维护的缓冲区是一个___数组。', 'fill', NULL, '字节', '缓冲流基于字节流，内部缓冲区是byte[]类型，用于暂存从底层流读取的数据。', 'easy', NULL, NULL, '缓冲流与对象流', '2026-07-05T11:59:48.86174+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('cd94512e-6d4c-5f48-a17a-388340037716', '4346bc9d-4bbf-5b56-a3e3-ba76b16f73da', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '对象流通过___机制将对象状态转换为字节序列。', 'fill', NULL, '序列化', '序列化是将Java对象转换为可存储或传输的字节序列的过程，对象流利用序列化协议实现。', 'easy', NULL, NULL, '缓冲流与对象流', '2026-07-05T11:59:48.86174+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('a01f71ac-0032-5d64-b855-3b54753ff745', '4346bc9d-4bbf-5b56-a3e3-ba76b16f73da', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', 'ObjectInputStream的readObject()方法返回的类型是___。', 'fill', NULL, 'Object', 'readObject()方法返回Object类型，通常需要强制转换为实际类型。', 'easy', NULL, NULL, '缓冲流与对象流', '2026-07-05T11:59:48.86174+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('22e1d178-d971-5a20-850f-89a3cb35c454', '4346bc9d-4bbf-5b56-a3e3-ba76b16f73da', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '缓冲流的默认缓冲区大小是___字节。', 'fill', NULL, '8192', 'Java中BufferedInputStream和BufferedOutputStream的默认缓冲区大小为8192字节（8KB）。', 'medium', NULL, NULL, '缓冲流与对象流', '2026-07-05T11:59:48.86174+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('cc14d601-d59d-53e7-9bef-7fa7056c1a6b', '4346bc9d-4bbf-5b56-a3e3-ba76b16f73da', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '当调用BufferedOutputStream的write()方法时，数据首先写入___。', 'fill', NULL, '缓冲区', '缓冲输出流的write()方法先将数据存入内部缓冲区，待缓冲区满或调用flush()时才真正写入底层流。', 'medium', NULL, NULL, '缓冲流与对象流', '2026-07-05T11:59:48.86174+00:00');
