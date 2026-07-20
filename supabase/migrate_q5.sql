integerBox.add(1);
System.out.println("排序前: " + integerBox); // 输出 [5, 3, 8, 1]
integerBox.sort();
System.out.println("排序后: " + integerBox); // 输出 [1, 3, 5, 8]', '本题考查泛型类的定义和类型边界。Box<T extends Comparable<T>>确保T实现了Comparable接口，从而可以在sort()方法中直接调用Collections.sort()。add()和get()方法操作内部List，体现了泛型的类型安全。', 'hard', NULL, NULL, '泛型与集合工具类', '2026-07-05T11:59:06.698281+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('b44292d4-6e6e-578e-9c39-101a9106eece', '1f7997c3-dc08-5706-ad07-8db742cf3481', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '使用Collections工具类的unmodifiableList()方法返回一个不可修改的列表，并演示当尝试修改该列表时会发生什么。同时说明如何通过synchronizedList()创建一个线程安全的列表，并简述其局限性。', 'coding', NULL, '// 不可修改列表演示
List<String> original = new ArrayList<>();
original.add("A");
original.add("B");
List<String> unmodifiable = Collections.unmodifiableList(original);
System.out.println(unmodifiable.get(0)); // 输出 A
// 尝试修改会抛出异常
try {
    unmodifiable.add("C");
} catch (UnsupportedOperationException e) {
    System.out.println("不能修改不可修改列表");
}

// 线程安全列表
List<String> syncList = Collections.synchronizedList(new ArrayList<>());
syncList.add("X");
syncList.add("Y");
// 但复合操作需要外部同步
synchronized (syncList) {
    Iterator<String> it = syncList.iterator();
while (it.hasNext()) {
        System.out.println(it.next());
}
}

// 局限性：synchronizedList只保证单个方法的原子性，复合操作（如迭代、检查再写入）仍需手动同步，否则可能产生并发问题。', '本题综合考查Collections工具类的两个重要方法。unmodifiableList()返回视图，对视图的修改操作会抛出异常，但原列表仍可修改（视图只是包装）。synchronizedList()返回的列表每个方法都同步，但复合操作不是原子性的，需要外部同步。理解这些局限性对编写线程安全代码很重要。', 'hard', NULL, NULL, '泛型与集合工具类', '2026-07-05T11:59:06.698281+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('21f08743-f592-5d35-87ca-2a85a9976c33', '8bfef00c-9dc5-576c-bf72-bcdf88b616e8', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '在Java中，使用哪个关键字来定义类？', 'choice', '["A. class", "B. struct", "C. object", "D. type"]', 'A', 'Java中使用class关键字定义类，struct是C/C++中的关键字，object和type不是定义类的关键字。', 'easy', NULL, NULL, '类的定义与对象创建', '2026-07-05T11:59:45.909896+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('e5d84ab2-92e3-5df0-87f6-9553d8eeafab', '8bfef00c-9dc5-576c-bf72-bcdf88b616e8', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '创建对象时，使用哪个关键字在堆内存中分配空间？', 'choice', '["A. malloc", "B. new", "C. create", "D. alloc"]', 'B', 'Java中使用new关键字在堆内存中为对象分配空间并调用构造方法初始化对象。', 'easy', NULL, NULL, '类的定义与对象创建', '2026-07-05T11:59:45.909896+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('89d352b3-093c-56da-b860-ee7bd1d9e1d4', '8bfef00c-9dc5-576c-bf72-bcdf88b616e8', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '下列哪个说法是正确的？', 'choice', '["A. 类占用内存空间", "B. 对象是类的模板", "C. 类是对象的实例", "D. 对象是类的实例"]', 'D', '类是模板，对象是类的具体实例，类不占用内存空间，对象占用堆内存。', 'easy', NULL, NULL, '类的定义与对象创建', '2026-07-05T11:59:45.909896+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('5034bb1f-48b9-5e17-a0b0-6439f29c785d', '8bfef00c-9dc5-576c-bf72-bcdf88b616e8', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '假设有一个类Student，以下哪个语句正确创建了一个Student对象？', 'choice', '["A. Student s;", "B. Student s = new Student();", "C. new Student s;", "D. Student s = Student();"]', 'B', '正确的对象创建语法是：类名 引用变量 = new 构造方法(); 选项B符合。', 'easy', NULL, NULL, '类的定义与对象创建', '2026-07-05T11:59:45.909896+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('1f837cda-46d4-5dd3-85ac-0e0fd9b191b0', '8bfef00c-9dc5-576c-bf72-bcdf88b616e8', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '对象引用变量存储在Java内存的哪个区域？', 'choice', '["A. 堆内存", "B. 栈内存", "C. 方法区", "D. 程序计数器"]', 'B', '对象引用变量存储在栈内存中，指向堆内存中的对象。', 'easy', NULL, NULL, '类的定义与对象创建', '2026-07-05T11:59:45.909896+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('0f2fbc89-438e-5dee-96cf-3d96cc53fcba', '8bfef00c-9dc5-576c-bf72-bcdf88b616e8', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '类的定义中必须包含成员变量和成员方法。', 'choice', '["A. 正确", "B. 错误"]', 'B', '类定义中可以只有成员变量或只有成员方法，甚至可以为空。', 'easy', NULL, NULL, '类的定义与对象创建', '2026-07-05T11:59:45.909896+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('2d329f70-bcfd-5125-bdd4-32badefbb97d', '8bfef00c-9dc5-576c-bf72-bcdf88b616e8', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '使用new关键字创建对象后，JVM会在栈内存中为对象分配空间。', 'choice', '["A. 正确", "B. 错误"]', 'B', 'new创建的对象在堆内存中分配空间，栈内存中存储的是对象的引用。', 'easy', NULL, NULL, '类的定义与对象创建', '2026-07-05T11:59:45.909896+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('8c014a00-1615-5958-bb95-20e61af34770', '8bfef00c-9dc5-576c-bf72-bcdf88b616e8', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '同一个类的不同对象拥有独立的实例变量副本。', 'choice', '["A. 正确", "B. 错误"]', 'A', '每个对象在堆中有自己独立的实例变量，互不影响。', 'easy', NULL, NULL, '类的定义与对象创建', '2026-07-05T11:59:45.909896+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('34784b8d-3d75-5f11-b077-4c874ad907d0', '8bfef00c-9dc5-576c-bf72-bcdf88b616e8', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '类的成员方法存放在堆内存中，每个对象一份。', 'choice', '["A. 正确", "B. 错误"]', 'B', '成员方法存放在方法区中，由该类的所有对象共享调用。', 'easy', NULL, NULL, '类的定义与对象创建', '2026-07-05T11:59:45.909896+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('f05d640b-64c7-5da4-a0f1-af0aa1713303', '8bfef00c-9dc5-576c-bf72-bcdf88b616e8', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '定义类时，class关键字后面跟的是类的名称，类名通常首字母大写。', 'choice', '["A. 正确", "B. 错误"]', 'A', 'Java命名规范中类名首字母大写，class关键字后跟类名。', 'easy', NULL, NULL, '类的定义与对象创建', '2026-07-05T11:59:45.909896+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('ac8dd9cd-3d20-56d2-bc38-9db920e06459', '8bfef00c-9dc5-576c-bf72-bcdf88b616e8', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '创建对象的过程称为___。', 'fill', NULL, '实例化', '通过new关键字创建对象的过程称为实例化，对象是类的实例。', 'easy', NULL, NULL, '类的定义与对象创建', '2026-07-05T11:59:45.909896+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('510e6a5f-6f4c-583b-9a76-235609a5fb54', '8bfef00c-9dc5-576c-bf72-bcdf88b616e8', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '在Java中，类是一种___数据类型。', 'fill', NULL, '引用', '类属于引用数据类型，与基本数据类型（如int、double）不同。', 'easy', NULL, NULL, '类的定义与对象创建', '2026-07-05T11:59:45.909896+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('8b1f0a60-ddcc-5ef6-9213-0c69637875e1', '8bfef00c-9dc5-576c-bf72-bcdf88b616e8', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '假设有类Car，创建Car对象的语句是：Car myCar = ___ Car();', 'fill', NULL, 'new', '使用new关键字调用构造方法创建对象，格式为：new 类名()。', 'easy', NULL, NULL, '类的定义与对象创建', '2026-07-05T11:59:45.909896+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('04a4f48e-5d7e-5461-a277-b053c45d13cb', '8bfef00c-9dc5-576c-bf72-bcdf88b616e8', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '对象被创建后，其成员变量会被赋予默认值，例如int类型的默认值是___。', 'fill', NULL, '0', 'Java中int类型的成员变量默认值为0，其他基本类型也有对应默认值。', 'medium', NULL, NULL, '类的定义与对象创建', '2026-07-05T11:59:45.909896+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('d7e242dd-6a6d-5779-98de-9ec3a33ae061', '8bfef00c-9dc5-576c-bf72-bcdf88b616e8', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '在Java中，定义类的关键字是___。', 'fill', NULL, 'class', 'class是定义类的关键字，后跟类名和类体。', 'medium', NULL, NULL, '类的定义与对象创建', '2026-07-05T11:59:45.909896+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('fbd977f5-074d-5a7a-8ce6-8c90ff795952', '8bfef00c-9dc5-576c-bf72-bcdf88b616e8', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '请定义一个名为Book的类，包含成员变量title（String类型）、price（double类型）和一个成员方法showInfo()，该方法打印书籍信息。然后在main方法中创建两个Book对象，分别设置属性并调用showInfo方法。', 'coding', NULL, 'public class Book {
    String title;
    double price;

    public void showInfo() {
        System.out.println("书名：" + title + ", 价格：" + price);
    }

    public static void main(String[] args) {
        Book book1 = new Book();
        book1.title = "Java编程思想";
        book1.price = 89.0;
        book1.showInfo();

        Book book2 = new Book();
        book2.title = "深入理解Java虚拟机";
        book2.price = 129.0;
        book2.showInfo();
    }
}', '首先定义Book类，包含两个成员变量和一个成员方法。在main方法中通过new创建两个Book对象，分别赋值并调用方法。', 'medium', NULL, NULL, '类的定义与对象创建', '2026-07-05T11:59:45.909896+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('f7b7c2b6-2718-53be-bab6-5d38d66a14ce', '8bfef00c-9dc5-576c-bf72-bcdf88b616e8', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '分析以下代码，指出错误并修正：
```java
public class Dog {
    String name;
    int age;
    public void bark() {
        System.out.println(name + " is barking");
    }
}
class Test {
    public static void main(String[] args) {
        Dog d;
        d.name = "旺财";
        d.age = 2;
        d.bark();
    }
}
```', 'coding', NULL, '错误：Dog d; 只声明了引用变量，没有创建对象，导致空指针异常。
修正：Dog d = new Dog();
完整代码：
public class Dog {
    String name;
    int age;
    public void bark() {
        System.out.println(name + " is barking");
    }
}
class Test {
    public static void main(String[] args) {
        Dog d = new Dog();
        d.name = "旺财";
        d.age = 2;
        d.bark();
    }
}', '在Java中，必须先通过new创建对象才能使用对象的属性和方法，否则引用变量为null，调用成员会抛出NullPointerException。', 'medium', NULL, NULL, '类的定义与对象创建', '2026-07-05T11:59:45.909896+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('bab44979-ade9-5ec6-a0a1-47e690fd9517', '8bfef00c-9dc5-576c-bf72-bcdf88b616e8', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '请定义一个Rectangle类，包含width和height两个double成员变量，以及计算面积的方法getArea()。在main中创建两个矩形对象，分别设置宽高，并输出面积。', 'coding', NULL, 'public class Rectangle {
    double width;
    double height;

    public double getArea() {
        return width * height;
    }

    public static void main(String[] args) {
        Rectangle rect1 = new Rectangle();
        rect1.width = 5.0;
        rect1.height = 3.0;
        System.out.println("矩形1面积：" + rect1.getArea());

        Rectangle rect2 = new Rectangle();
        rect2.width = 4.5;
        rect2.height = 2.0;
        System.out.println("矩形2面积：" + rect2.getArea());
    }
}', 'Rectangle类封装了矩形的宽高属性和面积计算方法。通过创建不同对象并设置不同属性，可以计算不同矩形的面积。', 'medium', NULL, NULL, '类的定义与对象创建', '2026-07-05T11:59:45.909896+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('093296b7-73bc-561d-9811-ea5bf44bd511', '8bfef00c-9dc5-576c-bf72-bcdf88b616e8', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '定义一个Student类，包含name、age、score三个成员变量，以及一个方法isPassed()，如果score>=60返回true，否则返回false。在main中创建三个学生对象并输出是否通过。', 'coding', NULL, 'public class Student {
    String name;
    int age;
    double score;

    public boolean isPassed() {
        return score >= 60;
    }

    public static void main(String[] args) {
        Student s1 = new Student();
        s1.name = "张三";
        s1.age = 20;
        s1.score = 85;
        System.out.println(s1.name + "是否通过：" + s1.isPassed());

        Student s2 = new Student();
        s2.name = "李四";
        s2.age = 21;
        s2.score = 45;
        System.out.println(s2.name + "是否通过：" + s2.isPassed());

        Student s3 = new Student();
        s3.name = "王五";
        s3.age = 19;
        s3.score = 60;
        System.out.println(s3.name + "是否通过：" + s3.isPassed());
    }
}', '每个学生对象有独立的name、age、score属性，isPassed方法根据score判断是否及格。输出结果分别为true、false、true。', 'medium', NULL, NULL, '类的定义与对象创建', '2026-07-05T11:59:45.909896+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('06220cd1-4c6f-57e1-8b58-34f4c9549fe4', '8bfef00c-9dc5-576c-bf72-bcdf88b616e8', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '静态方法中可以直接调用非静态方法。', 'choice', '["A. 正确", "B. 错误"]', 'B', '静态方法不依赖对象，而非静态方法需要通过对象调用，因此静态方法中不能直接调用非静态方法。', 'hard', NULL, NULL, 'static关键字与代码块', '2026-07-05T11:59:46.105851+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('35a3a224-886f-580b-8005-165d12a47980', '8bfef00c-9dc5-576c-bf72-bcdf88b616e8', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '设计一个Circle类，包含半径radius（double）成员变量，以及计算周长和面积的方法getPerimeter()和getArea()。在main中创建一个半径为5.0的圆对象，输出其周长和面积（π取3.14）。', 'coding', NULL, 'public class Circle {
    double radius;

    public double getPerimeter() {
        return 2 * 3.14 * radius;
    }

    public double getArea() {
        return 3.14 * radius * radius;
    }

    public static void main(String[] args) {
        Circle c = new Circle();
        c.radius = 5.0;
        System.out.println("周长：" + c.getPerimeter());
        System.out.println("面积：" + c.getArea());
    }
}', 'Circle类封装了半径属性和周长、面积计算方法。创建对象后设置半径，调用方法计算结果：周长=31.4，面积=78.5。', 'medium', NULL, NULL, '类的定义与对象创建', '2026-07-05T11:59:45.909896+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('316f4b54-f423-5d71-a727-70fe2d900b9a', '8bfef00c-9dc5-576c-bf72-bcdf88b616e8', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '以下关于Java构造方法的说法，哪一个是正确的？', 'choice', '["A. 构造方法可以有返回值类型，但必须与类名相同", "B. 构造方法必须用void声明返回类型", "C. 构造方法名称必须与类名完全相同，且没有返回类型", "D. 构造方法可以被static修饰"]', 'C', '构造方法是一种特殊方法，其名称必须与类名完全相同，且没有返回类型（包括void）。选项A和B错误，因为构造方法不能有返回值类型；选项D错误，因为构造方法属于实例化过程，不能是静态的。', 'medium', NULL, NULL, '构造方法与this关键字', '2026-07-05T11:59:45.909896+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('5a22fb38-534c-59eb-b5aa-c2c5103a04e7', '8bfef00c-9dc5-576c-bf72-bcdf88b616e8', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '在Java中，如果类没有显式定义任何构造方法，编译器会自动生成一个默认构造方法。这个默认构造方法具有什么特征？', 'choice', '["A. 有参构造方法，参数为Object类型", "B. 无参构造方法，访问权限与类相同", "C. 私有无参构造方法", "D. 受保护的无参构造方法"]', 'B', '当类中没有定义任何构造方法时，编译器会生成一个默认的无参构造方法，其访问权限与类的访问权限一致（public或默认包级私有）。选项B正确。', 'medium', NULL, NULL, '构造方法与this关键字', '2026-07-05T11:59:45.909896+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('0190f84b-d7ae-5ca9-b455-bb76f8ed2f95', '8bfef00c-9dc5-576c-bf72-bcdf88b616e8', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '关于this关键字的使用，下列哪一项是错误的？', 'choice', '["A. 在实例方法中可以使用this访问当前对象的成员变量", "B. 在构造方法中可以使用this()调用本类的其他构造方法", "C. this关键字可以在静态方法中使用", "D. this可以用于区分成员变量和局部变量"]', 'C', 'this关键字代表当前对象的引用，而静态方法属于类级别，不依赖于具体对象，因此不能在静态方法中使用this。选项C错误。', 'medium', NULL, NULL, '构造方法与this关键字', '2026-07-05T11:59:45.909896+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('8bb2cbf8-9ec0-573c-ab3b-ed766e628e25', '8bfef00c-9dc5-576c-bf72-bcdf88b616e8', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '假设有一个类Student，其构造方法重载如下：Student()和Student(String name)。在Student(String name)构造方法中，要调用无参构造方法，正确的写法是？', 'choice', '["A. this();", "B. super();", "C. Student();", "D. new Student();"]', 'A', '在构造方法中使用this()可以调用本类的其他构造方法，且必须放在第一行。选项A正确；super()用于调用父类构造方法；直接写类名或new会创建新对象，不符合需求。', 'medium', NULL, NULL, '构造方法与this关键字', '2026-07-05T11:59:45.909896+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('a7282547-5b43-5cd8-b55a-1c324fb17596', '8bfef00c-9dc5-576c-bf72-bcdf88b616e8', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '在构造方法中，使用this()调用另一个构造方法时，必须满足什么条件？', 'choice', '["A. 可以放在构造方法的任意位置", "B. 必须放在构造方法的第一行", "C. 只能在无参构造方法中使用", "D. 只能调用有参构造方法"]', 'B', 'this()调用必须作为构造方法中的第一条语句，这是Java语法强制要求，以确保对象初始化顺序正确。选项B正确。', 'medium', NULL, NULL, '构造方法与this关键字', '2026-07-05T11:59:45.909896+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('079aabf8-db0d-5859-b8cc-e37e712f2b6a', '8bfef00c-9dc5-576c-bf72-bcdf88b616e8', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '构造方法可以被重载，即一个类可以有多个参数列表不同的构造方法。', 'choice', '["A. 正确", "B. 错误"]', 'A', '构造方法支持重载，允许通过不同的参数列表提供多种对象初始化方式，这是Java面向对象的基本特性之一。', 'medium', NULL, NULL, '构造方法与this关键字', '2026-07-05T11:59:45.909896+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('1f505fcf-4ff7-541e-9596-b9b6e29e22c2', '8bfef00c-9dc5-576c-bf72-bcdf88b616e8', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', 'this关键字在静态上下文中可以正常使用，因为它代表当前类的实例。', 'choice', '["A. 正确", "B. 错误"]', 'B', '静态方法属于类，不依赖具体对象，因此没有当前对象的引用，this不能在静态方法或静态代码块中使用。', 'medium', NULL, NULL, '构造方法与this关键字', '2026-07-05T11:59:45.909896+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('e25ea6f5-529f-51db-8fa5-b474cedeb994', '8bfef00c-9dc5-576c-bf72-bcdf88b616e8', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '如果类中显式定义了一个有参构造方法，则编译器不会再生成默认无参构造方法。', 'choice', '["A. 正确", "B. 错误"]', 'A', '只要显式定义了任何构造方法，编译器就不会自动生成默认无参构造方法。如果需要无参构造，必须显式定义。', 'medium', NULL, NULL, '构造方法与this关键字', '2026-07-05T11:59:45.909896+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('25ac5bf8-01ec-5e8a-87e3-742a53670d9d', '8bfef00c-9dc5-576c-bf72-bcdf88b616e8', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '构造方法在执行时，会先执行父类的构造方法，再执行子类的构造方法。', 'choice', '["A. 正确", "B. 错误"]', 'A', '在Java继承体系中，子类构造方法的第一条语句默认是super()，用于调用父类构造方法，确保父类先初始化。', 'medium', NULL, NULL, '构造方法与this关键字', '2026-07-05T11:59:45.909896+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('e9e011f6-1ed8-57b8-a743-03de2d6e1eba', '8bfef00c-9dc5-576c-bf72-bcdf88b616e8', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', 'this关键字可以用于返回当前对象的引用，例如在方法中返回this。', 'choice', '["A. 正确", "B. 错误"]', 'A', 'this代表当前对象，可以作为返回值使用，常见于链式调用设计模式中，如return this。', 'medium', NULL, NULL, '构造方法与this关键字', '2026-07-05T11:59:45.909896+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('26284b22-2fe9-503f-835a-bf792b326d4e', '8bfef00c-9dc5-576c-bf72-bcdf88b616e8', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '构造方法的名称必须与___完全相同，并且没有___类型。', 'fill', NULL, '类名, 返回', '构造方法名称必须与类名一致，且不能有返回类型（包括void），这是Java语法规定。', 'medium', NULL, NULL, '构造方法与this关键字', '2026-07-05T11:59:45.909896+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('af605ad1-0f83-5f27-96dc-04b1676fd2c5', '8bfef00c-9dc5-576c-bf72-bcdf88b616e8', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '在构造方法中，使用___可以调用本类的其他构造方法，且该语句必须放在构造方法的___。', 'fill', NULL, 'this(), 第一行', 'this()用于构造方法间的调用，必须作为第一条语句，以确保初始化顺序正确。', 'medium', NULL, NULL, '构造方法与this关键字', '2026-07-05T11:59:46.105851+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('bb0add2f-5f35-5fd1-b51a-3a86ea442ddf', '8bfef00c-9dc5-576c-bf72-bcdf88b616e8', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '当成员变量与局部变量同名时，可以使用___关键字来区分，它代表当前对象的引用。', 'fill', NULL, 'this', 'this关键字可以引用当前对象的成员变量，避免与局部变量混淆。', 'medium', NULL, NULL, '构造方法与this关键字', '2026-07-05T11:59:46.105851+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('a86173b4-ec81-54d0-8076-9cf7e4c429fb', '8bfef00c-9dc5-576c-bf72-bcdf88b616e8', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '如果一个类没有定义任何构造方法，编译器会自动生成一个___构造方法，其访问权限与___相同。', 'fill', NULL, '默认无参, 类', '默认构造方法是无参的，且访问权限与类的访问修饰符一致（public或包级私有）。', 'medium', NULL, NULL, '构造方法与this关键字', '2026-07-05T11:59:46.105851+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('05284047-5705-5d76-816d-2bef47ab4c24', '8bfef00c-9dc5-576c-bf72-bcdf88b616e8', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '在静态方法中不能使用this关键字，因为静态方法属于___而非___。', 'fill', NULL, '类, 对象', '静态方法在类加载时存在，不依赖具体对象，因此没有this引用的对象。', 'medium', NULL, NULL, '构造方法与this关键字', '2026-07-05T11:59:46.105851+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('00451976-b9ee-504b-8adc-81d9c9fe1058', '8bfef00c-9dc5-576c-bf72-bcdf88b616e8', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '请定义一个名为Book的类，包含私有属性title（String）和price（double）。要求：1）提供无参构造方法，将title设为"未知"，price设为0.0；2）提供有参构造方法，初始化所有属性；3）使用this关键字在无参构造中调用有参构造。请写出完整代码。', 'coding', NULL, 'public class Book {
    private String title;
    private double price;

    // 有参构造
    public Book(String title, double price) {
        this.title = title;
        this.price = price;
    }

    // 无参构造，通过this调用有参构造
    public Book() {
        this("未知", 0.0);
    }
}', '本题考察构造方法重载以及this()的使用。无参构造通过this("未知", 0.0)调用有参构造，避免代码重复，同时满足初始化要求。注意this()必须放在第一行。', 'medium', NULL, NULL, '构造方法与this关键字', '2026-07-05T11:59:46.105851+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('63a712c7-1676-5e3c-b546-1b5793400178', '8bfef00c-9dc5-576c-bf72-bcdf88b616e8', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '阅读以下代码，指出其中的错误并改正：
public class Person {
    private String name;
    private int age;

    public Person(String name, int age) {
        name = name;
        age = age;
    }

    public static void show() {
        System.out.println(this.name);
    }
}', 'coding', NULL, '错误1：构造方法中name = name; age = age; 由于参数和成员变量同名，未使用this区分，导致赋值无效（参数赋值给自己）。应改为this.name = name; this.age = age;
错误2：静态方法show()中使用了this关键字，静态方法不能引用this。应移除this，或改为实例方法。
改正后代码：
public class Person {
    private String name;
    private int age;

    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }

    public void show() {
        System.out.println(name);
    }
}', '本题考察this关键字的两个典型错误：在构造方法中未使用this区分同名变量导致赋值失败；在静态方法中非法使用this。改正后使用了this.name和this.age正确赋值，并将show改为实例方法。', 'medium', NULL, NULL, '构造方法与this关键字', '2026-07-05T11:59:46.105851+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('41d99cd0-3365-5e8e-9848-5d41bc885fd1', '8bfef00c-9dc5-576c-bf72-bcdf88b616e8', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '设计一个类Calculator，包含两个int类型的成员变量a和b。要求：1）提供无参构造，将a和b都初始化为0；2）提供有参构造，初始化a和b；3）提供有参构造，只初始化a，b使用默认值0；4）提供有参构造，只初始化b，a使用默认值0。请使用this()实现构造方法之间的调用，并写出完整代码。', 'coding', NULL, 'public class Calculator {
    private int a;
    private int b;

    // 全参构造
    public Calculator(int a, int b) {
        this.a = a;
        this.b = b;
    }

    // 只初始化a
    public Calculator(int a) {
        this(a, 0);
    }

    // 只初始化b
    public Calculator(double b) { // 用double区分参数列表，实际使用时注意类型
        this(0, (int)b);
    }

    // 无参构造
    public Calculator() {
        this(0, 0);
    }
}
（注：为避免重载冲突，只初始化b的构造方法使用了double类型参数作为区分，实际开发中可用其他方式）', '本题考察构造方法重载和this()的链式调用。通过全参构造作为基础，其他构造方法使用this()传递默认值，避免了重复赋值代码。注意参数列表必须不同，因此只初始化b的构造使用double类型。', 'medium', NULL, NULL, '构造方法与this关键字', '2026-07-05T11:59:46.105851+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('212f05a4-ec5c-56df-a9a9-ff8cf19d17ba', '8bfef00c-9dc5-576c-bf72-bcdf88b616e8', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '请分析以下代码的输出结果，并解释原因：
public class Test {
    private int x;

    public Test() {
        this(10);
        System.out.println("无参构造");
    }

    public Test(int x) {
        this.x = x;
        System.out.println("有参构造: x=" + x);
    }

    public static void main(String[] args) {
        Test t = new Test();
    }
}', 'coding', NULL, '输出结果：
有参构造: x=10
无参构造

原因：当执行new Test()时，首先调用无参构造，其第一行this(10)调用了有参构造（int类型参数），因此先执行有参构造输出"有参构造: x=10"，然后返回无参构造继续执行，输出"无参构造"。', '本题考察this()调用的执行顺序。this()调用必须放在第一行，且会先执行被调用的构造方法体，然后返回原构造方法继续执行剩余代码。因此输出顺序是先有参后无参。', 'medium', NULL, NULL, '构造方法与this关键字', '2026-07-05T11:59:46.105851+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('0cbbe61a-2d1f-52d4-939d-03e68716dd0e', '8bfef00c-9dc5-576c-bf72-bcdf88b616e8', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '下面代码中，this关键字的用法是否正确？如果不正确，请说明原因并改正。
public class Student {
    private String name;

    public void setName(String name) {
        name = name;
    }

    public String getName() {
        return this.name;
    }

    public static void printName() {
        System.out.println(this.name);
    }
}', 'coding', NULL, '不正确。错误有两处：
1. setName方法中name = name; 由于参数和成员变量同名，未使用this区分，导致赋值无效。应改为this.name = name;
2. printName是静态方法，不能使用this。应移除this，但静态方法不能访问非静态成员，因此需要将printName改为实例方法，或者将name改为静态变量。
改正后代码（建议改为实例方法）：
public class Student {
    private String name;

    public void setName(String name) {
        this.name = name;
    }

    public String getName() {
        return this.name;
    }

    public void printName() {
        System.out.println(this.name);
    }
}', '本题综合考察this在实例方法和静态方法中的使用限制，以及同名变量区分。setName中必须使用this.name来引用成员变量；静态方法中不能使用this，且不能访问非静态成员，因此改为实例方法。', 'medium', NULL, NULL, '构造方法与this关键字', '2026-07-05T11:59:46.105851+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('364eaab4-4063-5b3f-a4ef-19ef3df5f8cb', '8bfef00c-9dc5-576c-bf72-bcdf88b616e8', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '在Java中，被static修饰的变量通常被称为什么？', 'choice', '["A. 实例变量", "B. 局部变量", "C. 静态变量（类变量）", "D. 常量"]', 'C', 'static修饰的变量属于类本身，称为静态变量或类变量，被所有实例共享。', 'medium', NULL, NULL, 'static关键字与代码块', '2026-07-05T11:59:46.105851+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('6d4b0556-561c-51ed-94c6-d4f57e2bf606', '8bfef00c-9dc5-576c-bf72-bcdf88b616e8', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '静态方法可以直接访问以下哪种成员？', 'choice', '["A. 非静态变量", "B. 非静态方法", "C. 静态变量", "D. 实例变量"]', 'C', '静态方法属于类，不依赖对象，因此只能直接访问静态成员（静态变量和静态方法）。', 'hard', NULL, NULL, 'static关键字与代码块', '2026-07-05T11:59:46.105851+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('cc36af83-1ea9-5b40-8eef-6b5939c19602', '8bfef00c-9dc5-576c-bf72-bcdf88b616e8', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '静态代码块在什么时候执行？', 'choice', '["A. 每次创建对象时", "B. 调用静态方法时", "C. 类加载时仅执行一次", "D. 程序结束时"]', 'C', '静态代码块在类加载时自动执行，且只执行一次，用于初始化静态资源。', 'hard', NULL, NULL, 'static关键字与代码块', '2026-07-05T11:59:46.105851+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('f20d3016-69fa-5d6e-b29a-cd18df160f27', '8bfef00c-9dc5-576c-bf72-bcdf88b616e8', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '以下关于构造代码块的说法正确的是？', 'choice', '["A. 使用static关键字声明", "B. 在类加载时执行", "C. 每次创建对象时执行，且优先于构造方法", "D. 只执行一次"]', 'C', '构造代码块没有static修饰，每次创建对象时执行，且位于构造方法之前，用于提取公共初始化逻辑。', 'hard', NULL, NULL, 'static关键字与代码块', '2026-07-05T11:59:46.105851+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('1ffdf8ce-e100-570f-ad87-745dcc71a9af', '8bfef00c-9dc5-576c-bf72-bcdf88b616e8', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '在Java中，静态变量存储在哪个区域？', 'choice', '["A. 堆内存", "B. 栈内存", "C. 方法区（JDK8后元空间）", "D. 寄存器"]', 'C', '静态变量属于类，存储在方法区（JDK8后为元空间），所有对象共享同一份数据。', 'hard', NULL, NULL, 'static关键字与代码块', '2026-07-05T11:59:46.105851+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('297aeacb-7cad-5c37-84cd-e5b0081215b6', '8bfef00c-9dc5-576c-bf72-bcdf88b616e8', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '静态变量被类的所有实例共享。', 'choice', '["A. 正确", "B. 错误"]', 'A', '静态变量属于类，所有实例共享同一份数据，修改一个实例的静态变量会影响其他实例。', 'hard', NULL, NULL, 'static关键字与代码块', '2026-07-05T11:59:46.105851+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('4ace2c5f-c360-5314-8707-085af7d1711f', '8bfef00c-9dc5-576c-bf72-bcdf88b616e8', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '普通代码块可以定义在方法内部，用于限制变量的作用域。', 'choice', '["A. 正确", "B. 错误"]', 'A', '普通代码块在方法内定义，其中的变量只在块内有效，可以限制作用域。', 'hard', NULL, NULL, 'static关键字与代码块', '2026-07-05T11:59:46.105851+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('2cf4550c-421f-519a-9609-b644351b6f0e', '8bfef00c-9dc5-576c-bf72-bcdf88b616e8', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '静态变量优先于任何对象存在。', 'choice', '["A. 正确", "B. 错误"]', 'A', '静态变量在类加载时创建，而对象在类加载之后通过new创建，因此静态变量优先于对象存在。', 'hard', NULL, NULL, 'static关键字与代码块', '2026-07-05T11:59:46.105851+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('3ade2226-3001-5577-a6b8-01e80421529b', '8bfef00c-9dc5-576c-bf72-bcdf88b616e8', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '在Java中，使用___关键字可以声明静态代码块。', 'fill', NULL, 'static', '静态代码块使用static关键字声明，形式为static { ... }。', 'hard', NULL, NULL, 'static关键字与代码块', '2026-07-05T11:59:46.105851+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('19dac6d5-86df-57e6-ba51-fdcb558be9ab', '8bfef00c-9dc5-576c-bf72-bcdf88b616e8', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '静态方法可以通过___直接调用，无需创建对象。', 'fill', NULL, '类名', '静态方法属于类，可以通过类名.方法名()直接调用。', 'hard', NULL, NULL, 'static关键字与代码块', '2026-07-05T11:59:46.105851+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('4fb8f386-11e7-578a-9c38-97080cd324c9', '8bfef00c-9dc5-576c-bf72-bcdf88b616e8', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '构造代码块在每次创建对象时执行，且执行时机位于___之前。', 'fill', NULL, '构造方法', '构造代码块在构造方法之前执行，用于提取多个构造方法的公共初始化代码。', 'hard', NULL, NULL, 'static关键字与代码块', '2026-07-05T11:59:46.105851+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('8e9f12ee-9fb1-55fc-9c54-70644540516a', '8bfef00c-9dc5-576c-bf72-bcdf88b616e8', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '静态变量存储在方法区，JDK8后称为___。', 'fill', NULL, '元空间', 'JDK8中，方法区被元空间取代，静态变量存储在元空间中。', 'hard', NULL, NULL, 'static关键字与代码块', '2026-07-05T11:59:46.105851+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('146e1039-224a-5e3a-a7af-47014bace81e', '8bfef00c-9dc5-576c-bf72-bcdf88b616e8', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '下列代码中，静态变量count的默认值是___。static int count;', 'fill', NULL, '0', '静态变量是类变量，有默认值，int类型的默认值为0。', 'hard', NULL, NULL, 'static关键字与代码块', '2026-07-05T11:59:46.105851+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('91a46c56-176d-5801-9bdf-cd6e4a133d44', '8bfef00c-9dc5-576c-bf72-bcdf88b616e8', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '阅读以下代码，写出程序的输出结果并解释原因。
public class StaticBlockTest {
    static int a = 10;
    static {
        System.out.println("静态代码块执行");
        a = 20;
    }
    {
        System.out.println("构造代码块执行");
    }
    public StaticBlockTest() {
        System.out.println("构造方法执行");
    }
    public static void main(String[] args) {
        System.out.println("main方法开始");
        StaticBlockTest t1 = new StaticBlockTest();
        System.out.println("a = " + a);
        StaticBlockTest t2 = new StaticBlockTest();
    }
}', 'coding', NULL, '输出结果：
静态代码块执行
main方法开始
构造代码块执行
构造方法执行
a = 20
构造代码块执行
构造方法执行

解释：
1. 类加载时先执行静态代码块，输出"静态代码块执行"，并将a赋值为20。
2. main方法开始执行，输出"main方法开始"。
3. 创建t1对象：先执行构造代码块（输出"构造代码块执行"），再执行构造方法（输出"构造方法执行"）。
4. 输出a的值20。
5. 创建t2对象：再次执行构造代码块和构造方法，输出相应内容。', '本题考察静态代码块、构造代码块和构造方法的执行顺序。静态代码块在类加载时执行一次；构造代码块在每次创建对象时优先于构造方法执行。', 'hard', NULL, NULL, 'static关键字与代码块', '2026-07-05T11:59:46.105851+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('0d918732-2286-5a0f-9fdb-99a1e3532939', '8bfef00c-9dc5-576c-bf72-bcdf88b616e8', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '设计一个工具类MathUtils，包含一个静态方法add(int a, int b)返回两数之和，以及一个静态变量count记录add方法被调用的次数。在主类中调用add方法三次，输出count的值。请写出完整代码。', 'coding', NULL, 'public class MathUtils {
    public static int count = 0;
    public static int add(int a, int b) {
        count++;
        return a + b;
    }
}

public class Main {
    public static void main(String[] args) {
        MathUtils.add(1, 2);
        MathUtils.add(3, 4);
        MathUtils.add(5, 6);
        System.out.println("add方法被调用了" + MathUtils.count + "次");
    }
}

输出：add方法被调用了3次', '静态变量count被所有实例共享，每次调用add方法时count自增，最终输出3。', 'hard', NULL, NULL, 'static关键字与代码块', '2026-07-05T11:59:46.105851+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('96744f07-abda-5a56-85e0-34a9263f9df7', '8bfef00c-9dc5-576c-bf72-bcdf88b616e8', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '分析以下代码是否存在编译错误？如果存在，请指出并说明原因；如果不存在，写出输出结果。
public class StaticErrorDemo {
    int x = 10;
    static int y = 20;
    public static void staticMethod() {
        System.out.println(x);
        System.out.println(y);
    }
    public void instanceMethod() {
        System.out.println(x);
        System.out.println(y);
    }
}', 'coding', NULL, '存在编译错误。原因：静态方法staticMethod中不能直接访问非静态变量x，因为x属于实例，而静态方法不依赖对象。应改为通过对象访问x，例如创建对象后使用对象.x。instanceMethod可以正常访问x和y。', '静态方法只能访问静态成员，非静态成员需要通过对象引用访问。', 'hard', NULL, NULL, 'static关键字与代码块', '2026-07-05T11:59:46.105851+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('2041f7d3-2810-5c5e-817c-5b9aded0d1e8', '8bfef00c-9dc5-576c-bf72-bcdf88b616e8', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '编写一个程序，演示普通代码块的作用：在方法中定义普通代码块，在块内声明一个局部变量并输出，在块外尝试访问该变量，观察编译结果。', 'coding', NULL, 'public class BlockScopeDemo {
    public static void main(String[] args) {
        {
            int a = 10;
            System.out.println("块内a = " + a);
        }
        // System.out.println(a);  // 编译错误，a超出作用域
    }
}

输出：块内a = 10
如果取消注释最后一行，编译会报错：找不到符号a。', '普通代码块限制了变量的作用域，块内变量在块外不可访问。', 'hard', NULL, NULL, 'static关键字与代码块', '2026-07-05T11:59:46.105851+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('5dfe781f-bf4d-5714-a51f-6c8ba82828c0', '8bfef00c-9dc5-576c-bf72-bcdf88b616e8', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '以下代码中，静态变量和构造代码块如何影响对象创建？请写出输出结果。
public class OrderDemo {
    static int count = 0;
    static {
        System.out.println("静态代码块1");
    }
    {
        count++;
        System.out.println("构造代码块，count=" + count);
    }
    public OrderDemo() {
        System.out.println("构造方法");
    }
    public static void main(String[] args) {
        new OrderDemo();
        new OrderDemo();
    }
}', 'coding', NULL, '输出结果：
静态代码块1
构造代码块，count=1
构造方法
构造代码块，count=2
构造方法

解释：
1. 类加载时执行静态代码块，输出"静态代码块1"。
2. 第一次创建对象：先执行构造代码块，count变为1，输出"构造代码块，count=1"；再执行构造方法，输出"构造方法"。
3. 第二次创建对象：再次执行构造代码块，count变为2，输出"构造代码块，count=2"；再执行构造方法，输出"构造方法"。', '静态代码块只执行一次，构造代码块每次创建对象时执行，且优先于构造方法。静态变量count被所有对象共享，因此每次创建对象时count递增。', 'hard', NULL, NULL, 'static关键字与代码块', '2026-07-05T11:59:46.105851+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('62545148-e910-5433-9460-3e2ad625afd8', '25067395-cefc-5ade-9275-b149a9c9f967', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', 'final修饰的变量一旦赋值后，___。', 'fill', NULL, '不能再修改', 'final变量的特性是赋值后不可变，基本类型值不可变，引用类型引用地址不可变。', 'hard', NULL, NULL, 'final关键字与Object类', '2026-07-05T11:59:46.68185+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('b757898d-eddf-5add-b787-f4b6063b8d6b', '8bfef00c-9dc5-576c-bf72-bcdf88b616e8', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '设计一个学生类Student，包含静态变量schoolName（学校名称）和实例变量name（姓名）。要求：
1. 在静态代码块中初始化schoolName为"清华大学"。
2. 提供构造方法初始化name。
3. 提供一个静态方法printSchool输出学校名称。
4. 提供一个实例方法printInfo输出学生信息。
在主类中创建两个学生对象，调用相关方法。', 'coding', NULL, 'public class Student {
    static String schoolName;
    String name;
    
    static {
        schoolName = "清华大学";
        System.out.println("静态代码块：学校名称初始化");
    }
    
    public Student(String name) {
        this.name = name;
    }
    
    public static void printSchool() {
        System.out.println("学校：" + schoolName);
    }
    
    public void printInfo() {
        System.out.println("姓名：" + name + "，学校：" + schoolName);
    }
    
    public static void main(String[] args) {
        Student s1 = new Student("张三");
        Student s2 = new Student("李四");
        Student.printSchool();
        s1.printInfo();
        s2.printInfo();
    }
}

输出：
静态代码块：学校名称初始化
学校：清华大学
姓名：张三，学校：清华大学
姓名：李四，学校：清华大学', '静态代码块在类加载时执行，初始化静态变量schoolName。静态方法printSchool通过类名调用。实例方法printInfo访问了静态变量schoolName，由于静态变量被所有对象共享，因此两个学生对象输出的学校名称相同。', 'hard', NULL, NULL, 'static关键字与代码块', '2026-07-05T11:59:46.105851+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('9c077dad-ef58-5a46-8b4e-e331d8338303', '25067395-cefc-5ade-9275-b149a9c9f967', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '以下代码中，类B与类A不在同一个包中，且类B继承类A。类A中有一个protected方法m()，则类B中___（能/不能）访问m()。', 'fill', NULL, '能', 'protected修饰的成员可以被不同包中的子类访问，因此类B继承类A后，可以在类B内部访问protected方法m()。', 'easy', NULL, NULL, '访问修饰符与封装', '2026-07-05T11:59:46.520832+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('fbf442ff-0025-5679-8d66-1c167bd6b40e', '25067395-cefc-5ade-9275-b149a9c9f967', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '封装基于的原则是___原则，其目的是保护对象内部状态的完整性。', 'fill', NULL, '信息隐藏', '信息隐藏是封装的核心原则，通过隐藏内部实现细节，仅暴露必要的接口，从而降低系统复杂度并提高安全性。', 'easy', NULL, NULL, '访问修饰符与封装', '2026-07-05T11:59:46.520832+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('484685d2-90e6-5472-8c94-12fdc317a432', '25067395-cefc-5ade-9275-b149a9c9f967', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '设计一个名为Student的类，要求：
1. 属性id（int）、name（String）、score（double）均为private。
2. 为每个属性提供public的getter和setter方法。
3. 在setScore方法中，要求score必须在0到100之间，否则抛出IllegalArgumentException。
4. 提供一个public的构造方法，接收id、name、score三个参数。
请写出完整的Java代码。', 'coding', NULL, 'public class Student {
    private int id;
    private String name;
    private double score;

    public Student(int id, String name, double score) {
        this.id = id;
        this.name = name;
        setScore(score); // 复用setter中的验证逻辑
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public double getScore() {
        return score;
    }

    public void setScore(double score) {
        if (score < 0 || score > 100) {
            throw new IllegalArgumentException("分数必须在0到100之间");
        }
        this.score = score;
    }
}', '本题考察封装的具体实现。将属性设为private，提供public的getter/setter，并在setter中加入验证逻辑，确保数据的合法性。构造方法中调用setScore可以复用验证，避免重复代码。', 'easy', NULL, NULL, '访问修饰符与封装', '2026-07-05T11:59:46.520832+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('ed37539b-63d9-513c-ad9c-4ab4c9bdad87', '25067395-cefc-5ade-9275-b149a9c9f967', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '现有以下代码，请指出其中违反封装原则的问题，并给出修改方案。

class BankAccount {
    public double balance;

    public BankAccount(double initialBalance) {
        this.balance = initialBalance;
    }
}

public class Test {
    public static void main(String[] args) {
        BankAccount acc = new BankAccount(1000);
        acc.balance = -500; // 直接修改为负数
        System.out.println("余额：" + acc.balance);
    }
}', 'coding', NULL, '问题：balance属性被声明为public，外部可以直接修改，导致可以设置负值，破坏了账户余额的合法性。

修改方案：
1. 将balance改为private。
2. 提供public的getter方法getBalance()。
3. 提供public的setter方法或存款/取款方法，在方法内添加验证逻辑（例如不允许余额为负）。

修改后的代码：

class BankAccount {
    private double balance;

    public BankAccount(double initialBalance) {
        if (initialBalance < 0) {
            throw new IllegalArgumentException("初始余额不能为负");
        }
        this.balance = initialBalance;
    }

    public double getBalance() {
        return balance;
    }

    public void deposit(double amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("存款金额必须为正");
        }
        balance += amount;
    }

    public void withdraw(double amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("取款金额必须为正");
        }
        if (amount > balance) {
            throw new IllegalArgumentException("余额不足");
        }
        balance -= amount;
    }
}', '原代码直接将balance暴露为public，无法控制外部修改，破坏了封装。修改后通过private隐藏数据，提供受控的存款、取款方法，确保余额始终合法，体现了封装的安全性和数据完整性。', 'easy', NULL, NULL, '访问修饰符与封装', '2026-07-05T11:59:46.520832+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('e8c1a9d5-0060-5e94-a16f-ee942f8f5b8e', '25067395-cefc-5ade-9275-b149a9c9f967', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '请编写一个工具类MathUtils，要求：
1. 构造方法私有化，不允许外部创建实例。
2. 提供一个public static方法max(int a, int b)，返回两个整数中的较大值。
3. 提供一个public static方法min(int a, int b)，返回两个整数中的较小值。
请写出完整代码，并说明这种设计体现了封装的哪个方面？', 'coding', NULL, 'public class MathUtils {
    // 构造方法私有化，防止实例化
    private MathUtils() {
        throw new UnsupportedOperationException("工具类不允许实例化");
    }

    public static int max(int a, int b) {
        return a > b ? a : b;
    }

    public static int min(int a, int b) {
        return a < b ? a : b;
    }
}

说明：这种设计体现了封装中的“隐藏实现细节”和“控制访问”。构造方法私有化隐藏了实例化细节，外部只能通过静态方法访问功能，内部实现（如比较逻辑）可以随时修改而不影响调用者。', '工具类通常不需要实例化，因此将构造方法私有化是常见的封装手法。同时将方法声明为public static，对外提供统一接口，内部实现可以自由变更，符合封装中接口与实现分离的原则。', 'easy', NULL, NULL, '访问修饰符与封装', '2026-07-05T11:59:46.520832+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('9ff0281a-7776-5d44-a88b-b82b87578fcb', '25067395-cefc-5ade-9275-b149a9c9f967', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '所有Java类都直接继承自Object类。', 'choice', '["A. 正确", "B. 错误"]', 'B', '所有Java类都直接或间接继承自Object类，有些类可能继承自其他类，但最终根类都是Object。', 'hard', NULL, NULL, 'final关键字与Object类', '2026-07-05T11:59:46.520832+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('1597700e-91e7-5a81-89cd-74c5784ba9fe', '25067395-cefc-5ade-9275-b149a9c9f967', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', 'final局部变量必须在声明时赋值。', 'choice', '["A. 正确", "B. 错误"]', 'B', 'final局部变量可以在声明时不赋值，但只能赋值一次，且在使用前必须赋值。', 'hard', NULL, NULL, 'final关键字与Object类', '2026-07-05T11:59:46.520832+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('bb484ce4-f32a-5044-9b18-2e345efc70d3', '25067395-cefc-5ade-9275-b149a9c9f967', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '阅读以下代码，分析为什么在main方法中注释行会编译错误，并说明如何修改才能使代码正确运行。

package pack1;
public class A {
    protected int x = 10;
}

package pack2;
import pack1.A;
public class B extends A {
    public void method() {
        System.out.println(x); // 正确
    }
}

public class Test {
    public static void main(String[] args) {
        A a = new A();
        // System.out.println(a.x); // 编译错误
    }
}', 'coding', NULL, '编译错误原因：Test类与A类不在同一个包中，且Test类没有继承A类，因此无法访问A的protected成员x。在Test中，只能通过子类B的对象来访问继承的protected成员，但通过父类引用a直接访问x是不允许的。

修改方法：
1. 将Test类放在pack1包中。
2. 或者将A中x的访问修饰符改为public。
3. 或者在Test中通过B类的对象来访问（但注意B类中x是继承来的，在B类内部可以访问，但在Test中通过B的对象访问时，需要B类提供public的getter方法）。

推荐修改：在A类中添加public的getter方法：

public class A {
    protected int x = 10;
    public int getX() {
        return x;
    }
}

然后在Test中调用a.getX()。', '本题考察protected跨包访问的规则：只有子类内部可以访问继承的protected成员，但通过父类引用在外部（非子类）访问是不允许的。通过封装提供public的getter方法是最佳实践，既保护了数据又提供了受控访问。', 'easy', NULL, NULL, '访问修饰符与封装', '2026-07-05T11:59:46.520832+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('b39c0dd9-042b-59c7-b1ac-8972f541f3fb', '25067395-cefc-5ade-9275-b149a9c9f967', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '下列关于Java方法重写的描述，正确的是？', 'choice', '["A. 重写的方法必须具有不同的方法名", "B. 重写的方法必须具有不同的参数列表", "C. 重写的方法必须具有相同的方法名、参数列表和返回类型（或子类型）", "D. 重写只能发生在同一个类中"]', 'C', '方法重写要求子类方法与父类方法具有相同的方法名、参数列表和返回类型（或返回类型的子类型）。选项A、B错误，因为方法名和参数列表必须相同；选项D错误，因为重写发生在继承关系的子类和父类之间。', 'easy', NULL, NULL, '方法重写(Override)', '2026-07-05T11:59:46.520832+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('66c4a119-e40e-54ae-9d69-8d2862983dd7', '25067395-cefc-5ade-9275-b149a9c9f967', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '以下代码输出什么？
class Parent {
    void show() { System.out.print("Parent"); }
}
class Child extends Parent {
    @Override
    void show() { System.out.print("Child"); }
}
public class Test {
    public static void main(String[] args) {
        Parent p = new Child();
        p.show();
    }
}', 'choice', '["A. Parent", "B. Child", "C. 编译错误", "D. 运行时异常"]', 'B', '由于动态绑定，父类引用指向子类对象时，调用重写的方法会执行子类的版本，因此输出"Child"。', 'easy', NULL, NULL, '方法重写(Override)', '2026-07-05T11:59:46.520832+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('3066f943-4b15-5519-b031-63b5ab95c17e', '25067395-cefc-5ade-9275-b149a9c9f967', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '在Java中，以下哪个注解用于显式表示方法重写？', 'choice', '["A. @Override", "B. @Overload", "C. @Inherit", "D. @Polymorphism"]', 'A', '@Override注解用于标记子类方法重写父类方法，编译器会检查该方法是否确实重写了父类方法，有助于避免错误。', 'easy', NULL, NULL, '方法重写(Override)', '2026-07-05T11:59:46.520832+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('9c483dfb-2aeb-50ba-97c9-702605c4ba93', '25067395-cefc-5ade-9275-b149a9c9f967', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '静态方法能否被重写？', 'choice', '["A. 可以，静态方法也遵循重写规则", "B. 不可以，静态方法属于类，不存在重写，只能隐藏", "C. 可以，但必须使用@Override注解", "D. 取决于访问修饰符"]', 'B', '静态方法属于类级别，子类中定义相同签名的静态方法只是隐藏父类的静态方法，而不是重写。重写只适用于实例方法。', 'easy', NULL, NULL, '方法重写(Override)', '2026-07-05T11:59:46.520832+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('5423a567-1165-5b25-862c-627293afe301', '25067395-cefc-5ade-9275-b149a9c9f967', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '关于重写方法的访问修饰符，以下说法正确的是？', 'choice', '["A. 子类重写方法的访问权限可以比父类更严格", "B. 子类重写方法的访问权限必须与父类完全相同", "C. 子类重写方法的访问权限不能比父类更严格（可以更宽松）", "D. 访问修饰符不影响重写"]', 'C', '重写时，子类方法的访问权限不能低于父类方法的访问权限，即可以相同或更宽松。例如父类方法为protected，子类可以是public。', 'easy', NULL, NULL, '方法重写(Override)', '2026-07-05T11:59:46.520832+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('ebabaea6-a2dc-5766-8e5b-ca48b5787e2e', '25067395-cefc-5ade-9275-b149a9c9f967', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '子类中重写父类方法时，返回类型必须与父类方法完全一致。', 'choice', '["A. 正确", "B. 错误"]', 'B', '从Java 5开始，重写方法允许返回类型是父类方法返回类型的子类型（协变返回类型），例如父类返回Object，子类可以返回String。', 'medium', NULL, NULL, '方法重写(Override)', '2026-07-05T11:59:46.520832+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('db6b1fce-5faa-57a0-8303-69369282e5bc', '25067395-cefc-5ade-9275-b149a9c9f967', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', 'private方法可以被重写。', 'choice', '["A. 正确", "B. 错误"]', 'B', 'private方法仅在定义它的类中可见，子类无法访问，因此不能被重写。子类中定义相同签名的方法只是新方法，与父类无关。', 'medium', NULL, NULL, '方法重写(Override)', '2026-07-05T11:59:46.520832+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('63d06ffe-420a-5461-82f0-fa7a2c311d40', '25067395-cefc-5ade-9275-b149a9c9f967', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', 'final方法可以被重写。', 'choice', '["A. 正确", "B. 错误"]', 'B', 'final方法禁止被重写，这是final关键字的用途之一，用于确保方法行为不可改变。', 'medium', NULL, NULL, '方法重写(Override)', '2026-07-05T11:59:46.520832+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('10fa8b48-a41f-5fd7-afc9-0bbd36e9b22b', '25067395-cefc-5ade-9275-b149a9c9f967', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '构造函数可以被重写。', 'choice', '["A. 正确", "B. 错误"]', 'B', '构造函数不属于普通方法，不能被继承，因此也不能被重写。子类构造函数通过super()调用父类构造函数。', 'medium', NULL, NULL, '方法重写(Override)', '2026-07-05T11:59:46.520832+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('76f8cf39-99a7-52bd-9a88-15492b3e1d29', '25067395-cefc-5ade-9275-b149a9c9f967', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '在Java中，通过父类引用调用重写方法时，实际执行的是父类的方法。', 'choice', '["A. 正确", "B. 错误"]', 'B', '由于动态绑定，实际执行的是子类重写后的方法，而不是父类方法。', 'medium', NULL, NULL, '方法重写(Override)', '2026-07-05T11:59:46.520832+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('7fb2a245-d74e-55ea-8f0a-482320e4a947', '25067395-cefc-5ade-9275-b149a9c9f967', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '在Java中，方法重写发生在具有___关系的两个类之间。', 'fill', NULL, '继承', '方法重写是继承机制的一部分，子类重写父类的方法。', 'medium', NULL, NULL, '方法重写(Override)', '2026-07-05T11:59:46.520832+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('dd8ddbf9-1271-542c-8aef-b3d54ffcf2a5', '25067395-cefc-5ade-9275-b149a9c9f967', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '子类重写父类方法时，可以使用___注解让编译器检查重写是否正确。', 'fill', NULL, '@Override', '@Override注解会触发编译检查，确保方法确实重写了父类方法，避免因拼写错误等导致的重写失败。', 'medium', NULL, NULL, '方法重写(Override)', '2026-07-05T11:59:46.520832+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('5e5bd087-6c33-5bbb-bece-0ee21e98ec13', '25067395-cefc-5ade-9275-b149a9c9f967', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '假设父类方法返回类型是Number，子类重写该方法时，返回类型可以是Number或___。', 'fill', NULL, 'Integer', '协变返回类型允许子类返回父类返回类型的子类型，Integer是Number的子类。', 'medium', NULL, NULL, '方法重写(Override)', '2026-07-05T11:59:46.520832+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('ae999b6b-947f-5420-9731-f39a0e31f380', '25067395-cefc-5ade-9275-b149a9c9f967', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '方法重写基于JVM的___绑定机制实现。', 'fill', NULL, '动态', '动态绑定（后期绑定）在运行时根据对象实际类型确定调用哪个方法，是重写和多态的基础。', 'medium', NULL, NULL, '方法重写(Override)', '2026-07-05T11:59:46.520832+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('d1dd1f34-b453-5293-a14e-1bf17b94f09d', '25067395-cefc-5ade-9275-b149a9c9f967', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '父类中声明为___的方法不能被子类重写。', 'fill', NULL, 'final', 'final方法不可被重写，这是final关键字的语义。', 'medium', NULL, NULL, '方法重写(Override)', '2026-07-05T11:59:46.520832+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('1672bf3f-90a4-5212-b5b7-362d2fa501e9', '25067395-cefc-5ade-9275-b149a9c9f967', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '阅读以下代码，写出运行结果并解释原因。
class A {
    public void print() {
        System.out.println("A");
    }
}
class B extends A {
    @Override
    public void print() {
        System.out.println("B");
    }
}
class C extends B {
    @Override
    public void print() {
        System.out.println("C");
    }
}
public class Test {
    public static void main(String[] args) {
        A a = new C();
        a.print();
        B b = (B) a;
        b.print();
        C c = (C) b;
        c.print();
    }
}', 'coding', NULL, '运行结果：
C
C
C
原因：变量a、b、c虽然引用类型不同，但实际对象都是C类的实例。由于动态绑定，调用print()方法时总是执行实际类型C中的重写版本，因此三次输出均为"C"。', '本题考察动态绑定和多态性。无论引用类型如何，调用的方法版本由对象实际类型决定。C类重写了print()，所以所有调用都执行C的print()。', 'medium', NULL, NULL, '方法重写(Override)', '2026-07-05T11:59:46.520832+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('1156667d-bd77-5431-af2d-327e177cdee3', '25067395-cefc-5ade-9275-b149a9c9f967', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '请设计一个场景，展示方法重写与多态性的结合。要求：定义父类Shape，包含方法draw()；子类Circle和Rectangle分别重写draw()。编写测试代码，使用父类数组存储不同子类对象，并循环调用draw()方法，输出各自图形信息。', 'coding', NULL, 'class Shape {
    public void draw() {
        System.out.println("Drawing shape");
    }
}
class Circle extends Shape {
    @Override
    public void draw() {
        System.out.println("Drawing circle");
    }
}
class Rectangle extends Shape {
    @Override
    public void draw() {
        System.out.println("Drawing rectangle");
    }
}
public class Test {
    public static void main(String[] args) {
        Shape[] shapes = {new Circle(), new Rectangle(), new Circle()};
        for (Shape s : shapes) {
            s.draw();
        }
    }
}
输出：
Drawing circle
Drawing rectangle
Drawing circle', '使用父类数组存储子类对象，通过循环调用draw()，由于动态绑定，每个对象执行自己的重写版本，体现了多态性。', 'medium', NULL, NULL, '方法重写(Override)', '2026-07-05T11:59:46.520832+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('4218b59a-cefd-547b-a668-268692d6aa05', '25067395-cefc-5ade-9275-b149a9c9f967', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '分析以下代码，指出错误并修正。
class Parent {
    public final void display() {
        System.out.println("Parent");
    }
}
class Child extends Parent {
    @Override
    public void display() {
        System.out.println("Child");
    }
}', 'coding', NULL, '错误：父类display()方法被声明为final，子类不能重写final方法。
修正方法：删除父类方法前的final关键字，或者删除子类中的重写方法。
修正后代码示例：
class Parent {
    public void display() {
        System.out.println("Parent");
    }
}
class Child extends Parent {
    @Override
    public void display() {
        System.out.println("Child");
    }
}', 'final方法禁止重写，这是Java语言规则。子类试图重写final方法会导致编译错误。', 'medium', NULL, NULL, '方法重写(Override)', '2026-07-05T11:59:46.520832+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('93f63e9a-2c84-549b-9228-273256e5d59e', '25067395-cefc-5ade-9275-b149a9c9f967', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '请解释为什么在调用被重写的方法时，Java使用动态绑定而不是静态绑定，并说明其优势。', 'coding', NULL, '动态绑定（后期绑定）是指在运行时根据对象的实际类型来决定调用哪个方法版本。优势包括：
1. 支持多态：允许通过父类引用调用子类的方法，提高代码的灵活性和可扩展性。
2. 代码复用：可以编写通用代码处理多种子类对象，而不需要为每个子类编写单独的逻辑。
3. 易于维护：添加新的子类时，无需修改现有代码，只要子类正确重写方法即可。
例如，定义一个方法接受父类参数，传入不同子类对象时自动执行对应子类的方法，这就是动态绑定的典型应用。', '本题考察对动态绑定原理及优势的理解。动态绑定是多态实现的基石，使得面向对象设计更加灵活。', 'medium', NULL, NULL, '方法重写(Override)', '2026-07-05T11:59:46.520832+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('6b194cf9-46fb-5f7e-933e-98a75eac3152', '25067395-cefc-5ade-9275-b149a9c9f967', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '编写一个程序，演示重写方法时访问权限可以更宽松但不能更严格。要求：父类方法为protected，子类重写为public，并验证调用成功。', 'coding', NULL, 'class Parent {
    protected void show() {
        System.out.println("Parent show");
    }
}
class Child extends Parent {
    @Override
    public void show() {
        System.out.println("Child show");
    }
}
public class Test {
    public static void main(String[] args) {
        Parent p = new Child();
        p.show();  // 输出 Child show
    }
}
说明：父类show()为protected，子类重写为public（更宽松），编译运行正常。如果子类改为private（更严格），则编译报错。', '重写规则要求子类方法的访问权限不能低于父类方法，这是为了保证多态性下父类接口的可用性。', 'medium', NULL, NULL, '方法重写(Override)', '2026-07-05T11:59:46.520832+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('1cf09b3c-aa76-5752-b77f-0e97b3cb0852', '25067395-cefc-5ade-9275-b149a9c9f967', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '在Java中，以下哪个关键字用于声明不可变的实体？', 'choice', '["A. static", "B. final", "C. abstract", "D. synchronized"]', 'B', 'final关键字用于声明不可变的实体，可以修饰类、方法和变量，被修饰后不能被继承、重写或修改。', 'medium', NULL, NULL, 'final关键字与Object类', '2026-07-05T11:59:46.520832+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('dbc334a9-800c-5754-956a-19365fd1bd26', '25067395-cefc-5ade-9275-b149a9c9f967', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '被final修饰的类有什么特性？', 'choice', '["A. 可以被继承", "B. 不能被继承", "C. 可以实例化但不能被继承", "D. 只能被抽象类继承"]', 'B', 'final类不能被继承，这是final修饰类的基本规则，用于确保类的设计不被破坏。', 'medium', NULL, NULL, 'final关键字与Object类', '2026-07-05T11:59:46.520832+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('2438c909-51a3-5f0d-9a6e-cb45ca6094ff', '25067395-cefc-5ade-9275-b149a9c9f967', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', 'Object类位于哪个包中？', 'choice', '["A. java.lang", "B. java.util", "C. java.io", "D. java.object"]', 'A', 'Object类是java.lang包中的类，是Java所有类的根父类。', 'medium', NULL, NULL, 'final关键字与Object类', '2026-07-05T11:59:46.520832+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('86bd9405-e3eb-5fa5-ab94-312504daa409', '25067395-cefc-5ade-9275-b149a9c9f967', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '以下哪个Object类的方法默认比较引用地址？', 'choice', '["A. toString()", "B. hashCode()", "C. equals()", "D. getClass()"]', 'C', 'Object类的equals()方法默认比较两个对象的引用地址是否相同，即是否指向同一个内存地址。', 'medium', NULL, NULL, 'final关键字与Object类', '2026-07-05T11:59:46.520832+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('e126c8e2-19ef-5e37-899f-f68f91eb0679', '25067395-cefc-5ade-9275-b149a9c9f967', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '关于final修饰的变量，以下说法正确的是？', 'choice', '["A. 只能赋值一次，但可以通过反射修改", "B. 基本类型变量值不可变，引用类型变量引用地址不可变但对象内部可变", "C. 成员变量可以不初始化", "D. 局部变量必须声明时赋值"]', 'B', 'final引用类型变量，引用地址不可变，但对象内部状态可以改变；基本类型变量值不可变。', 'medium', NULL, NULL, 'final关键字与Object类', '2026-07-05T11:59:46.520832+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('64ddc5cb-1ed6-59c8-aa5b-65e8a65bdf00', '25067395-cefc-5ade-9275-b149a9c9f967', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', 'final修饰的方法可以被重写。', 'choice', '["A. 正确", "B. 错误"]', 'B', 'final修饰的方法不能被子类重写，这是final方法的基本规则。', 'medium', NULL, NULL, 'final关键字与Object类', '2026-07-05T11:59:46.520832+00:00');
