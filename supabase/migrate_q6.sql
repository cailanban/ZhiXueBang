INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('66d5dbe5-1483-531f-bf07-474735cc1abb', '25067395-cefc-5ade-9275-b149a9c9f967', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', 'Object类的hashCode()方法默认返回对象内存地址的哈希值。', 'choice', '["A. 正确", "B. 错误"]', 'A', 'Object类的hashCode()默认实现是基于对象的内存地址计算哈希值。', 'hard', NULL, NULL, 'final关键字与Object类', '2026-07-05T11:59:46.520832+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('1e8fd77e-356b-52b9-bf25-cfa89846e188', '25067395-cefc-5ade-9275-b149a9c9f967', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', 'final类可以包含抽象方法。', 'choice', '["A. 正确", "B. 错误"]', 'B', 'final类不能被继承，而抽象方法必须在子类中实现，因此final类不能包含抽象方法。', 'hard', NULL, NULL, 'final关键字与Object类', '2026-07-05T11:59:46.520832+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('f11d60ad-3f55-53d2-9037-4565e1a467fd', '25067395-cefc-5ade-9275-b149a9c9f967', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', 'Object类的toString()方法默认返回___。', 'fill', NULL, '类名@哈希码的十六进制表示', 'Object类的toString()方法返回字符串格式为：类名 + ''@'' + 哈希码的十六进制无符号整数形式。', 'hard', NULL, NULL, 'final关键字与Object类', '2026-07-05T11:59:46.68185+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('15a197ad-99f4-5233-b957-c0fb76331730', '25067395-cefc-5ade-9275-b149a9c9f967', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', 'final修饰的方法不能被子类___。', 'fill', NULL, '重写', 'final方法禁止子类重写，以确保方法行为的一致性。', 'hard', NULL, NULL, 'final关键字与Object类', '2026-07-05T11:59:46.68185+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('bf8f4e3d-6609-5823-8dc0-a3e711fbcaf7', '25067395-cefc-5ade-9275-b149a9c9f967', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '如果希望一个类不能被继承，应该使用关键字___修饰该类。', 'fill', NULL, 'final', 'final类不能被继承，这是防止类被扩展的常用手段。', 'hard', NULL, NULL, 'final关键字与Object类', '2026-07-05T11:59:46.68185+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('7bde60ef-5df2-521a-a736-d99c1ee85acf', '25067395-cefc-5ade-9275-b149a9c9f967', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '请编写一个Java程序，定义一个final类MyConstants，包含一个final常量PI（值为3.14159），以及一个final方法display()，该方法打印常量PI的值。然后尝试创建一个子类继承MyConstants，并解释会发生什么。', 'coding', NULL, 'final class MyConstants {
    public static final double PI = 3.14159;
    public final void display() {
        System.out.println("PI = " + PI);
    }
}
// 尝试继承：class SubClass extends MyConstants { } // 编译错误
// 解释：因为MyConstants是final类，不能被继承，所以编译时会报错。', 'final类禁止继承，因此任何尝试继承final类的操作都会导致编译错误。此外，final方法不能被重写，但这里由于类本身是final的，继承已不可能，方法重写也无从谈起。', 'hard', NULL, NULL, 'final关键字与Object类', '2026-07-05T11:59:46.68185+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('46370cf7-6968-58d2-9452-d9bdc7e69814', '25067395-cefc-5ade-9275-b149a9c9f967', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '分析以下代码，指出错误并修正：
class Person {
    public final String name;
    public Person(String name) {
        this.name = name;
    }
    public void setName(String name) {
        this.name = name;
    }
}', 'coding', NULL, '错误：final成员变量name在构造器中赋值后，不能再通过setName方法修改。修正：删除setName方法，或去掉name的final修饰。
修正后代码：
class Person {
    public final String name;
    public Person(String name) {
        this.name = name;
    }
}', 'final成员变量一旦赋值后不能修改，setName方法试图修改name变量会导致编译错误。正确的做法是只在构造器中初始化final变量，并且不提供修改方法。', 'hard', NULL, NULL, 'final关键字与Object类', '2026-07-05T11:59:46.68185+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('7cb77645-8edd-5624-a9fd-92676cecae6b', '25067395-cefc-5ade-9275-b149a9c9f967', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '编写一个类Student，重写equals()方法，使其比较两个学生的学号（id）是否相等；重写hashCode()方法，使其基于学号返回哈希值。要求使用final关键字修饰学号字段。', 'coding', NULL, 'public class Student {
    private final int id;
    private String name;
    public Student(int id, String name) {
        this.id = id;
        this.name = name;
    }
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        Student student = (Student) obj;
        return id == student.id;
    }
    @Override
    public int hashCode() {
        return Integer.hashCode(id);
    }
}', '学号id使用final修饰，确保一旦创建对象后学号不可变。equals方法比较id字段，hashCode方法基于id计算哈希值，符合Java规范：如果两个对象equals相等，则hashCode必须相等。', 'hard', NULL, NULL, 'final关键字与Object类', '2026-07-05T11:59:46.68185+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('e6a0b103-582e-5b6f-b8a3-38888dac2366', '25067395-cefc-5ade-9275-b149a9c9f967', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '请解释final关键字在JVM层面的优化原理，并举例说明final方法的内联优化。', 'coding', NULL, 'final关键字的JVM优化原理：
1. 对于final基本类型变量，编译器将其视为编译时常量，在编译时直接内联到使用处，避免运行时访问。
2. 对于final引用类型变量，引用地址不可变，JVM可以安全地进行缓存和优化。
3. final方法在编译期或JIT编译时可能被内联，因为方法不会被重写，调用目标确定。
示例：
public class MathUtils {
    public static final double PI = 3.14159;
    public final double area(double radius) {
        return PI * radius * radius;
    }
}
// 在调用area方法时，JIT编译器可能将方法体直接内联到调用处，消除方法调用开销。', 'final方法的内联优化减少了方法调用的开销，提升了性能。final常量在编译时直接替换为常量值，避免了运行时变量查找。', 'hard', NULL, NULL, 'final关键字与Object类', '2026-07-05T11:59:46.68185+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('39cd9c3b-3da3-5737-aeec-cca246318e92', '25067395-cefc-5ade-9275-b149a9c9f967', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '设计一个不可变类Point，包含x和y两个final int字段，提供构造器初始化，并重写toString()方法返回坐标字符串。解释不可变类的优点。', 'coding', NULL, 'public final class Point {
    private final int x;
    private final int y;
    public Point(int x, int y) {
        this.x = x;
        this.y = y;
    }
    public int getX() { return x; }
    public int getY() { return y; }
    @Override
    public String toString() {
        return "(" + x + ", " + y + ")";
    }
}
// 不可变类的优点：
// 1. 线程安全，无需同步
// 2. 易于缓存和共享
// 3. 防止被恶意修改
// 4. 适合作为Map的键', '将类声明为final防止继承破坏不可变性，所有字段用final修饰且不提供setter方法，确保对象创建后状态不可变。toString方法返回格式化的坐标字符串。', 'hard', NULL, NULL, 'final关键字与Object类', '2026-07-05T11:59:46.68185+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('9459508a-93af-5edc-ba20-b47ff6f129d6', '5b7edb81-4b91-598d-85a1-3f4a79e1ecef', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '在Java中，使用关键字___来声明抽象类。', 'fill', NULL, 'abstract', 'abstract关键字用于声明抽象类和抽象方法。', 'easy', NULL, NULL, '抽象类与抽象方法', '2026-07-05T11:59:47.074823+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('b84da271-e7eb-53b6-9ba8-2b265cc96f91', '5b7edb81-4b91-598d-85a1-3f4a79e1ecef', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '抽象方法___（可以/不可以）有方法体。', 'fill', NULL, '不可以', '抽象方法只有方法签名，没有方法体，具体实现由子类提供。', 'easy', NULL, NULL, '抽象类与抽象方法', '2026-07-05T11:59:47.074823+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('abc83fef-8ce9-5e4c-aea1-db03425eac62', '5b7edb81-4b91-598d-85a1-3f4a79e1ecef', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '假设有抽象类Base，其中有一个抽象方法void doSomething()。子类Sub继承Base，如果Sub不是抽象类，则Sub必须___Base中的所有抽象方法。', 'fill', NULL, '实现（或覆盖）', '非抽象子类必须实现父类中所有的抽象方法，否则编译错误。', 'easy', NULL, NULL, '抽象类与抽象方法', '2026-07-05T11:59:47.074823+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('2a31d244-fee4-5bb6-a3c8-58af617e5cf7', '5b7edb81-4b91-598d-85a1-3f4a79e1ecef', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '抽象类中的构造方法在子类实例化时被调用，用于初始化___。', 'fill', NULL, '父类的成员变量', '抽象类虽然不能直接实例化，但它的构造方法可以通过子类的构造方法调用（super()），用于初始化抽象类中定义的成员变量。', 'easy', NULL, NULL, '抽象类与抽象方法', '2026-07-05T11:59:47.074823+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('908e61e6-78f9-5f6c-958b-29d8cf1f84d8', '5b7edb81-4b91-598d-85a1-3f4a79e1ecef', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '以下代码的输出结果是：___

abstract class Shape {
    abstract double area();
}
class Circle extends Shape {
    double r;
    Circle(double r) { this.r = r; }
    double area() { return 3.14 * r * r; }
}
public class Test {
    public static void main(String[] args) {
        Shape s = new Circle(2.0);
        System.out.println(s.area());
    }
}', 'fill', NULL, '12.56', '通过向上转型，Shape引用指向Circle对象，调用area()方法时执行子类的实现，计算2.0*2.0*3.14=12.56。', 'easy', NULL, NULL, '抽象类与抽象方法', '2026-07-05T11:59:47.074823+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('9c68eb8a-2d2e-581d-8765-6b5a965cd423', '612c5430-94a8-55f4-9225-63d5b14b1fbb', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '链式队列中，入队操作需要修改___指针。', 'fill', NULL, '队尾（rear）', '入队时在队尾插入新节点，因此需要修改队尾指针rear指向新节点。', 'medium', NULL, NULL, '队列的定义与应用', '2026-07-05T11:59:50.477428+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('550d28c4-fc0e-5f91-83d6-9ae68c1493ad', '5b7edb81-4b91-598d-85a1-3f4a79e1ecef', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '请设计一个抽象类Vehicle（交通工具），包含一个抽象方法move()，以及一个具体方法info()输出“这是交通工具”。然后创建两个子类Car和Bicycle，分别实现move()方法输出“汽车在公路上行驶”和“自行车在骑行”。最后编写测试类，创建Car和Bicycle对象，调用move()和info()方法。请写出完整的Java代码。', 'coding', NULL, '```java
abstract class Vehicle {
    public abstract void move();
    public void info() {
        System.out.println("这是交通工具");
    }
}

class Car extends Vehicle {
    @Override
    public void move() {
        System.out.println("汽车在公路上行驶");
    }
}

class Bicycle extends Vehicle {
    @Override
    public void move() {
        System.out.println("自行车在骑行");
    }
}

public class TestVehicle {
    public static void main(String[] args) {
        Vehicle car = new Car();
        Vehicle bicycle = new Bicycle();
        car.info();
        car.move();
        bicycle.info();
        bicycle.move();
    }
}
```', '本题考察抽象类的定义、抽象方法的实现以及向上转型的使用。首先定义抽象类Vehicle，包含抽象方法move()和具体方法info()。子类Car和Bicycle分别实现move()方法。在测试类中，使用父类引用指向子类对象，调用info()和move()方法，体现了多态性。', 'easy', NULL, NULL, '抽象类与抽象方法', '2026-07-05T11:59:47.074823+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('328d85a3-8f4e-55fa-8928-1b69d6ed4ced', '5b7edb81-4b91-598d-85a1-3f4a79e1ecef', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '下面是一个不完整的程序，请补充代码使其能够正常运行并输出“猫在叫”和“狗在叫”。

```java
abstract class Animal {
    public abstract void sound();
}

class Cat extends Animal {
    // 请补充
}

class Dog extends Animal {
    // 请补充
}

public class TestAnimal {
    public static void main(String[] args) {
        Animal a1 = new Cat();
        Animal a2 = new Dog();
        a1.sound();
        a2.sound();
    }
}
```', 'coding', NULL, '```java
class Cat extends Animal {
    @Override
    public void sound() {
        System.out.println("猫在叫");
    }
}

class Dog extends Animal {
    @Override
    public void sound() {
        System.out.println("狗在叫");
    }
}
```', '子类Cat和Dog必须实现父类Animal中的抽象方法sound()，否则编译错误。使用@Override注解是可选的但推荐，有助于编译器检查。在方法体中分别输出指定字符串即可。', 'easy', NULL, NULL, '抽象类与抽象方法', '2026-07-05T11:59:47.074823+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('abe26420-ce6a-5982-8100-82825e9079bc', '5b7edb81-4b91-598d-85a1-3f4a79e1ecef', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '阅读以下代码，指出其中的错误并说明原因。

```java
abstract class Person {
    String name;
    public Person(String name) {
        this.name = name;
    }
    public abstract void work();
}

class Student extends Person {
    int score;
    public Student(String name, int score) {
        this.score = score;
    }
    public void work() {
        System.out.println(name + "学习");
    }
}
```', 'coding', NULL, '错误：Student类的构造方法中没有调用父类Person的构造方法。
原因：Person类有一个带参数的构造方法，没有无参构造方法，因此子类Student的构造方法必须显式地通过super(name)调用父类构造方法，否则编译错误。
修正：在Student构造方法第一行添加 super(name); 例如：
public Student(String name, int score) {
    super(name);
    this.score = score;
}', '当父类只有带参构造方法时，子类构造方法必须显式调用父类的构造方法（使用super），否则编译器会尝试调用父类的无参构造方法，但不存在，导致编译错误。', 'easy', NULL, NULL, '抽象类与抽象方法', '2026-07-05T11:59:47.074823+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('5dd34212-3c1e-5d4b-bef8-5ce44a350de9', '5b7edb81-4b91-598d-85a1-3f4a79e1ecef', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '请编写一个抽象类Calculator，包含一个抽象方法int calculate(int a, int b)，以及两个具体方法add和subtract（分别调用calculate方法实现加法和减法）。然后创建两个子类Adder和Subtractor，分别实现calculate方法返回a+b和a-b。最后编写测试类，分别使用Adder和Subtractor计算10+5和10-5的结果并输出。', 'coding', NULL, '```java
abstract class Calculator {
    public abstract int calculate(int a, int b);
    public int add(int a, int b) {
        return calculate(a, b);
    }
    public int subtract(int a, int b) {
        return calculate(a, b);
    }
}

class Adder extends Calculator {
    @Override
    public int calculate(int a, int b) {
        return a + b;
    }
}

class Subtractor extends Calculator {
    @Override
    public int calculate(int a, int b) {
        return a - b;
    }
}

public class TestCalculator {
    public static void main(String[] args) {
        Calculator adder = new Adder();
        Calculator subtractor = new Subtractor();
        System.out.println("10+5=" + adder.add(10, 5));
        System.out.println("10-5=" + subtractor.subtract(10, 5));
    }
}
```
输出：
10+5=15
10-5=5', '本题利用模板方法模式，抽象类Calculator定义了抽象方法calculate，具体方法add和subtract内部调用calculate，子类通过实现calculate改变具体运算逻辑。测试类中通过父类引用调用add和subtract，实际执行子类的calculate方法。', 'easy', NULL, NULL, '抽象类与抽象方法', '2026-07-05T11:59:47.074823+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('a99e6efc-b16a-5182-a2f1-0f6ff0fb4fa0', '5b7edb81-4b91-598d-85a1-3f4a79e1ecef', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '请分析以下代码的运行结果，并解释为什么。

```java
abstract class Base {
    public Base() {
        System.out.println("Base构造方法");
    }
    public abstract void test();
}

class Derived extends Base {
    private int value = 10;
    public Derived() {
        System.out.println("Derived构造方法");
    }
    @Override
    public void test() {
        System.out.println("value = " + value);
    }
}

public class Main {
    public static void main(String[] args) {
        Base b = new Derived();
        b.test();
    }
}
```', 'coding', NULL, '运行结果：
Base构造方法
Derived构造方法
value = 10

解释：
1. 创建Derived对象时，先调用父类Base的构造方法，输出"Base构造方法"。
2. 然后调用子类Derived的构造方法，输出"Derived构造方法"。
3. 调用b.test()时，由于多态，执行子类Derived的test()方法，此时value已经初始化为10，所以输出"value = 10"。', '本题考察抽象类的构造方法调用顺序和多态。抽象类可以有构造方法，子类实例化时会先调用父类构造方法。子类成员变量在构造方法执行前完成初始化（默认值或显式赋值），因此test()中能正确输出10。', 'easy', NULL, NULL, '抽象类与抽象方法', '2026-07-05T11:59:47.074823+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('7f8ebceb-a4e0-5b51-b6a5-6669d3c655c0', '5b7edb81-4b91-598d-85a1-3f4a79e1ecef', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '在Java中，接口中的方法默认的访问修饰符是什么？', 'choice', '["A. private", "B. protected", "C. public", "D. 默认包访问权限"]', 'C', '接口中的方法默认是public abstract，因此访问修饰符为public。即使不写public关键字，编译器也会自动添加。', 'easy', NULL, NULL, '接口的定义与实现', '2026-07-05T11:59:47.074823+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('94c21623-48f0-5a62-ab41-8a7e6f5ee5b3', '5b7edb81-4b91-598d-85a1-3f4a79e1ecef', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '以下哪个关键字用于让类实现接口？', 'choice', '["A. extends", "B. implements", "C. interface", "D. abstract"]', 'B', 'implements关键字用于类实现接口，extends用于类继承类或接口继承接口。', 'easy', NULL, NULL, '接口的定义与实现', '2026-07-05T11:59:47.074823+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('5bf480e7-4c3e-5b0b-9376-1534ab6adcf4', '5b7edb81-4b91-598d-85a1-3f4a79e1ecef', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '接口中的变量默认使用哪些修饰符？', 'choice', '["A. public static final", "B. private static final", "C. public abstract", "D. protected final"]', 'A', '接口中定义的变量默认是public static final，即常量，存储在方法区的常量池中，所有实现类共享。', 'easy', NULL, NULL, '接口的定义与实现', '2026-07-05T11:59:47.074823+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('a19948a8-d54e-5540-addf-53ac34b2a43a', '5b7edb81-4b91-598d-85a1-3f4a79e1ecef', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', 'Java 8之后，接口中可以包含以下哪种方法？', 'choice', '["A. 私有方法", "B. 默认方法和静态方法", "C. 受保护方法", "D. 同步方法"]', 'B', 'Java 8引入了接口的默认方法（default）和静态方法（static），允许在接口中提供默认实现。Java 9进一步允许私有方法。', 'easy', NULL, NULL, '接口的定义与实现', '2026-07-05T11:59:47.074823+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('2227cffb-393f-5f7b-83ac-9f291af88057', '5b7edb81-4b91-598d-85a1-3f4a79e1ecef', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '一个类最多可以实现多少个接口？', 'choice', '["A. 1个", "B. 2个", "C. 没有限制", "D. 取决于JVM"]', 'C', 'Java支持接口的多继承，一个类可以实现任意多个接口，用逗号分隔，从而弥补单继承的局限性。', 'medium', NULL, NULL, '接口的定义与实现', '2026-07-05T11:59:47.074823+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('41a5ef99-c96a-539e-b306-2cf7e7078c99', '5b7edb81-4b91-598d-85a1-3f4a79e1ecef', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '接口中的抽象方法可以带有方法体。', 'choice', '["A. 正确", "B. 错误"]', 'B', '接口中的抽象方法只能声明方法签名，不能有方法体。只有default方法和static方法可以在接口中提供实现。', 'medium', NULL, NULL, '接口的定义与实现', '2026-07-05T11:59:47.074823+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('6cfcfb19-210b-5c16-bed5-21eb81e6d68c', '5b7edb81-4b91-598d-85a1-3f4a79e1ecef', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '一个类可以实现多个接口，但只能继承一个父类。', 'choice', '["A. 正确", "B. 错误"]', 'A', 'Java是单继承多实现的，类只能继承一个父类，但可以实现多个接口，这是Java设计上弥补单继承局限的重要特性。', 'medium', NULL, NULL, '接口的定义与实现', '2026-07-05T11:59:47.074823+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('1e3fbe9e-0495-5ff9-a7ac-a84c37e6ca48', '5b7edb81-4b91-598d-85a1-3f4a79e1ecef', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '接口可以继承另一个接口，使用extends关键字。', 'choice', '["A. 正确", "B. 错误"]', 'A', '接口之间可以继承，使用extends关键字，一个接口可以继承多个父接口，形成接口的多继承。', 'medium', NULL, NULL, '接口的定义与实现', '2026-07-05T11:59:47.074823+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('47716a79-28b7-5b53-a133-c69d2b2f9f26', '5b7edb81-4b91-598d-85a1-3f4a79e1ecef', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '接口中的变量可以被实现类直接修改。', 'choice', '["A. 正确", "B. 错误"]', 'B', '接口中的变量默认是public static final，即常量，一旦初始化后不能被修改。实现类只能访问，不能重新赋值。', 'medium', NULL, NULL, '接口的定义与实现', '2026-07-05T11:59:47.074823+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('d78d0bd1-60d2-5bb6-96ad-c52022665583', '5b7edb81-4b91-598d-85a1-3f4a79e1ecef', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '如果一个类实现了某个接口，但只实现了部分抽象方法，那么这个类必须声明为抽象类。', 'choice', '["A. 正确", "B. 错误"]', 'A', '如果实现类没有实现接口中的所有抽象方法，那么该类必须声明为abstract，否则编译会报错。', 'medium', NULL, NULL, '接口的定义与实现', '2026-07-05T11:59:47.074823+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('bb98d157-a854-5830-950e-8cc8f33825d6', '5b7edb81-4b91-598d-85a1-3f4a79e1ecef', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '在Java中，接口使用关键字___来定义。', 'fill', NULL, 'interface', '定义接口使用interface关键字，例如：public interface Animal { }。', 'medium', NULL, NULL, '接口的定义与实现', '2026-07-05T11:59:47.074823+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('c6f24e59-3fbb-5e9d-9149-fdfc4fe70439', '5b7edb81-4b91-598d-85a1-3f4a79e1ecef', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '接口中的方法默认是public abstract，变量默认是public static final，其中final关键字表示该变量是___。', 'fill', NULL, '常量（不可变）', 'final修饰的变量表示常量，一旦赋值不能修改。接口中的变量默认是final的，因此所有实现类共享同一个值。', 'medium', NULL, NULL, '接口的定义与实现', '2026-07-05T11:59:47.074823+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('3d8a96d7-8184-5531-bd37-4b025dc5fee3', '5b7edb81-4b91-598d-85a1-3f4a79e1ecef', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '从Java 8开始，接口中可以定义___方法，它提供了默认的实现，子类可以选择重写或不重写。', 'fill', NULL, 'default', 'default方法在接口中使用default关键字修饰，提供默认的方法体，实现类可以直接继承或重写。', 'medium', NULL, NULL, '接口的定义与实现', '2026-07-05T11:59:47.074823+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('f002179e-1e45-5ed2-92c7-72b32a3dd95e', '5b7edb81-4b91-598d-85a1-3f4a79e1ecef', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '如果一个类实现了一个接口，但没有实现接口中的所有抽象方法，那么这个类必须被声明为___。', 'fill', NULL, '抽象类（abstract class）', '如果实现类只实现了部分接口方法，则必须使用abstract修饰该类，否则编译器会要求实现所有抽象方法。', 'medium', NULL, NULL, '接口的定义与实现', '2026-07-05T11:59:47.074823+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('af5a0c0d-bfdf-5fa3-902b-50e6bb91363c', '5b7edb81-4b91-598d-85a1-3f4a79e1ecef', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '接口中定义的静态方法可以通过___直接调用。', 'fill', NULL, '接口名', '接口中的静态方法属于接口本身，只能通过接口名调用，不能通过实现类的实例调用。', 'medium', NULL, NULL, '接口的定义与实现', '2026-07-05T11:59:47.074823+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('e977b83a-074a-55d7-88c6-6cb6c7fc8d45', '5b7edb81-4b91-598d-85a1-3f4a79e1ecef', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '请定义一个名为Flyable的接口，包含一个抽象方法fly()和一个默认方法land()，默认实现输出“Landing...”。然后创建一个Bird类实现Flyable接口，并重写fly()方法输出“Bird is flying.”。最后在main方法中创建Bird对象，调用fly()和land()方法。', 'coding', NULL, '// 接口定义
public interface Flyable {
    void fly();
    default void land() {
        System.out.println("Landing...");
    }
}

// 实现类
public class Bird implements Flyable {
    @Override
    public void fly() {
        System.out.println("Bird is flying.");
    }
}

// 测试类
public class Test {
    public static void main(String[] args) {
        Bird bird = new Bird();
        bird.fly();   // 输出：Bird is flying.
        bird.land();  // 输出：Landing...
    }
}', '该题考察接口的定义与实现、抽象方法和默认方法的使用。Flyable接口定义了一个抽象方法fly和一个默认方法land。Bird类通过implements实现Flyable，必须重写fly方法，可以选择是否重写land方法。main方法中创建Bird对象并调用两个方法，验证接口的契约和默认方法继承。', 'medium', NULL, NULL, '接口的定义与实现', '2026-07-05T11:59:47.074823+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('15cae566-9940-5286-b6d2-1ac7267d2fa5', '5b7edb81-4b91-598d-85a1-3f4a79e1ecef', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '设计一个接口Shape，包含一个抽象方法double area()。然后创建两个类Circle和Rectangle实现Shape接口，分别计算面积。其中Circle有半径radius属性，Rectangle有长length和宽width属性。最后编写一个测试类，创建Circle和Rectangle对象并输出面积。', 'coding', NULL, '// 接口定义
public interface Shape {
    double area();
}

// Circle实现
public class Circle implements Shape {
    private double radius;
    public Circle(double radius) {
        this.radius = radius;
    }
    @Override
    public double area() {
        return Math.PI * radius * radius;
    }
}

// Rectangle实现
public class Rectangle implements Shape {
    private double length;
    private double width;
    public Rectangle(double length, double width) {
        this.length = length;
        this.width = width;
    }
    @Override
    public double area() {
        return length * width;
    }
}

// 测试类
public class TestShape {
    public static void main(String[] args) {
        Shape circle = new Circle(5);
        Shape rectangle = new Rectangle(4, 6);
        System.out.println("Circle area: " + circle.area());
        System.out.println("Rectangle area: " + rectangle.area());
    }
}', '该题综合考察接口的定义、实现以及多态。接口Shape声明了area()方法，Circle和Rectangle分别根据自身属性实现面积计算。测试类中使用接口类型引用具体实现类对象，展示了面向接口编程和多态性。', 'medium', NULL, NULL, '接口的定义与实现', '2026-07-05T11:59:47.074823+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('fdb8ffc2-81cb-517c-a08b-0658ef4538fe', '5b7edb81-4b91-598d-85a1-3f4a79e1ecef', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '在下面的代码中，内部类Inner可以访问外部类的私有成员msg，这是因为内部类持有对外部类___的隐式引用。
class Outer {
    private String msg = "Hello";
    class Inner {
        void display() {
            System.out.println(msg);
        }
    }
}', 'fill', NULL, '实例', '非静态内部类持有对外部类实例的隐式引用，因此可以访问外部类的所有成员。', 'hard', NULL, NULL, '内部类与匿名类', '2026-07-05T11:59:47.241493+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('a16b1e5e-a6de-5a92-8586-8b2cfa09e51a', '5b7edb81-4b91-598d-85a1-3f4a79e1ecef', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '现有两个接口：Swimmable（含抽象方法swim()）和Flyable（含抽象方法fly()）。请创建一个Duck类同时实现这两个接口，并重写所有抽象方法，分别输出“Duck is swimming.”和“Duck is flying.”。此外，在Duck类中添加一个自己的方法quack()输出“Quack!” 。编写测试类，创建Duck对象并依次调用三个方法。', 'coding', NULL, '// 接口1
public interface Swimmable {
    void swim();
}

// 接口2
public interface Flyable {
    void fly();
}

// Duck类实现两个接口
public class Duck implements Swimmable, Flyable {
    @Override
    public void swim() {
        System.out.println("Duck is swimming.");
    }
    @Override
    public void fly() {
        System.out.println("Duck is flying.");
    }
    public void quack() {
        System.out.println("Quack!");
    }
}

// 测试类
public class TestDuck {
    public static void main(String[] args) {
        Duck duck = new Duck();
        duck.swim();
        duck.fly();
        duck.quack();
    }
}', '本题考察类实现多个接口的能力。Duck类同时实现Swimmable和Flyable两个接口，必须实现所有抽象方法。此外类可以拥有自己的额外方法。测试类展示了多接口实现的完整用法。', 'medium', NULL, NULL, '接口的定义与实现', '2026-07-05T11:59:47.074823+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('d280bb72-7036-50d3-9156-167f280c7868', '5b7edb81-4b91-598d-85a1-3f4a79e1ecef', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '阅读以下代码，指出错误并修正。
```java
interface A {
    int x = 10;
    void show();
}
class B implements A {
    void show() {
        System.out.println(x);
    }
}
```', 'coding', NULL, '错误有两处：
1. 接口中的变量x默认是public static final，但代码正确；
2. 实现类B中的show()方法缺少public修饰符，因为接口方法默认是public，实现类重写时访问权限不能更低，必须使用public。
修正后的代码：
```java
interface A {
    int x = 10;
    void show();
}
class B implements A {
    public void show() {
        System.out.println(x);
    }
}
```', '接口中的方法默认是public，实现类重写接口方法时必须使用public修饰符，否则编译错误（访问权限降低）。变量x是常量，可以直接访问。', 'medium', NULL, NULL, '接口的定义与实现', '2026-07-05T11:59:47.074823+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('46553a35-94b7-59e4-9064-86d9607cec9f', '5b7edb81-4b91-598d-85a1-3f4a79e1ecef', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '请解释接口中default方法和static方法的区别，并分别给出一个使用场景示例。', 'coding', NULL, '区别：
1. default方法通过实例调用，可以被实现类继承或重写；static方法通过接口名直接调用，不能被实现类继承。
2. default方法用于为接口提供默认实现，避免修改所有实现类；static方法用于提供工具方法，属于接口本身。

示例：
```java
interface Vehicle {
    void start();
    default void honk() {
        System.out.println("Beep!");
    }
    static void service() {
        System.out.println("Vehicle service.");
    }
}
class Car implements Vehicle {
    @Override
    public void start() {
        System.out.println("Car started.");
    }
}
// 使用
Car car = new Car();
car.start();
car.honk();       // 继承default方法
Vehicle.service(); // 接口名调用static方法
```', 'default方法提供可选实现，static方法提供接口级别的工具。理解两者的区别有助于合理设计接口。', 'medium', NULL, NULL, '接口的定义与实现', '2026-07-05T11:59:47.074823+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('edf91e97-9638-5184-bfd3-481681dbd7af', '5b7edb81-4b91-598d-85a1-3f4a79e1ecef', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '在Java中，内部类可以访问外部类的哪些成员？', 'choice', '["A. 只能访问公有成员", "B. 只能访问公有和受保护成员", "C. 可以访问所有成员（包括私有成员）", "D. 只能访问静态成员"]', 'C', '内部类持有对外部类实例的隐式引用，因此可以访问外部类的所有成员，包括私有成员。', 'medium', NULL, NULL, '内部类与匿名类', '2026-07-05T11:59:47.074823+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('1c936d86-d551-58a3-8087-e9d15d9adafd', '5b7edb81-4b91-598d-85a1-3f4a79e1ecef', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '匿名类通常用于什么场景？', 'choice', '["A. 定义多个可复用的类", "B. 简化接口或抽象类的实现", "C. 实现继承层次结构", "D. 定义工具类"]', 'B', '匿名类没有类名，只能在创建时定义一次，常用于简化接口或抽象类的实现，如事件处理和回调。', 'medium', NULL, NULL, '内部类与匿名类', '2026-07-05T11:59:47.074823+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('57d7a9e7-da4d-5cd0-99f1-fc3f5b0a6c05', '5b7edb81-4b91-598d-85a1-3f4a79e1ecef', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '下列哪个选项是正确的内部类编译后class文件命名格式？', 'choice', '["A. 外部类名_内部类名.class", "B. 外部类名$内部类名.class", "C. 内部类名$外部类名.class", "D. 外部类名.内部类名.class"]', 'B', '内部类编译后生成独立class文件，命名格式为“外部类名$内部类名.class”，例如Outer$Inner.class。', 'medium', NULL, NULL, '内部类与匿名类', '2026-07-05T11:59:47.074823+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('37bf0c53-ce60-5ea3-857c-d1929769f6fc', '5b7edb81-4b91-598d-85a1-3f4a79e1ecef', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '关于静态内部类，下列说法正确的是？', 'choice', '["A. 静态内部类可以访问外部类的非静态成员", "B. 静态内部类不持有对外部类实例的隐式引用", "C. 静态内部类不能定义静态成员", "D. 静态内部类只能在静态方法中创建"]', 'B', '静态内部类不依赖于外部类实例，因此不持有对外部类实例的隐式引用，不能访问外部类的非静态成员。', 'medium', NULL, NULL, '内部类与匿名类', '2026-07-05T11:59:47.074823+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('00914695-a280-5326-bd26-74d3b51eb784', '5b7edb81-4b91-598d-85a1-3f4a79e1ecef', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '匿名类在编译后生成的class文件命名格式是？', 'choice', '["A. 外部类名$匿名类名.class", "B. 外部类名$1.class", "C. 匿名类名.class", "D. 外部类名_1.class"]', 'B', '匿名类没有类名，编译后生成“外部类名$1.class”、“外部类名$2.class”等带编号的文件。', 'medium', NULL, NULL, '内部类与匿名类', '2026-07-05T11:59:47.074823+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('44585e10-af81-5784-a10d-1b818739a01b', '5b7edb81-4b91-598d-85a1-3f4a79e1ecef', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '内部类可以定义在方法内部，称为局部内部类。', 'choice', '["A. 正确", "B. 错误"]', 'A', '内部类可以定义在方法内部，这种内部类称为局部内部类，其作用域仅限于该方法。', 'hard', NULL, NULL, '内部类与匿名类', '2026-07-05T11:59:47.074823+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('ed320423-c029-5b41-bca4-c71ba150e3c3', '5b7edb81-4b91-598d-85a1-3f4a79e1ecef', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '匿名类可以有显式的构造方法。', 'choice', '["A. 正确", "B. 错误"]', 'B', '匿名类没有类名，因此不能定义构造方法，但可以通过实例初始化块来完成初始化。', 'hard', NULL, NULL, '内部类与匿名类', '2026-07-05T11:59:47.074823+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('e187dc2c-c486-5748-bc0d-1efa4a939c54', '5b7edb81-4b91-598d-85a1-3f4a79e1ecef', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '静态内部类可以直接访问外部类的私有成员。', 'choice', '["A. 正确", "B. 错误"]', 'B', '静态内部类不持有外部类实例的引用，因此不能直接访问外部类的非静态成员，包括私有成员。', 'hard', NULL, NULL, '内部类与匿名类', '2026-07-05T11:59:47.074823+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('5507b501-46bd-582b-bc9d-6b6751a89746', '5b7edb81-4b91-598d-85a1-3f4a79e1ecef', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '内部类编译后不会生成独立的class文件。', 'choice', '["A. 正确", "B. 错误"]', 'B', '内部类编译后会生成独立的class文件，命名格式为“外部类名$内部类名.class”。', 'hard', NULL, NULL, '内部类与匿名类', '2026-07-05T11:59:47.074823+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('56d050f3-287a-5e9a-953d-172682d15fe5', '5b7edb81-4b91-598d-85a1-3f4a79e1ecef', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '匿名类只能用于实现接口，不能用于继承抽象类。', 'choice', '["A. 正确", "B. 错误"]', 'B', '匿名类既可以用于实现接口，也可以用于继承抽象类，甚至可以继承具体类。', 'hard', NULL, NULL, '内部类与匿名类', '2026-07-05T11:59:47.074823+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('68782cb3-5500-5b35-ba6d-8a5702c259ba', '5b7edb81-4b91-598d-85a1-3f4a79e1ecef', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '内部类编译后生成的class文件命名格式为“外部类名___内部类名.class”。', 'fill', NULL, '$', '内部类编译后的class文件名使用美元符号$连接外部类名和内部类名。', 'hard', NULL, NULL, '内部类与匿名类', '2026-07-05T11:59:47.241493+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('9dd43acb-ec1a-56a2-9355-59d8b5f0aba9', '5b7edb81-4b91-598d-85a1-3f4a79e1ecef', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '匿名类编译后生成的class文件命名为“外部类名___1.class”等形式。', 'fill', NULL, '$', '匿名类编译后使用美元符号$后跟数字编号作为类名。', 'hard', NULL, NULL, '内部类与匿名类', '2026-07-05T11:59:47.241493+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('185a876a-8bc0-57de-8860-32f277a34e34', '5b7edb81-4b91-598d-85a1-3f4a79e1ecef', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '在下面的代码中，匿名类实现了哪个接口？
Runnable r = new Runnable() {
    public void run() {
        System.out.println("Run");
    }
};', 'fill', NULL, 'Runnable', '代码中new Runnable()表明匿名类实现了Runnable接口。', 'hard', NULL, NULL, '内部类与匿名类', '2026-07-05T11:59:47.241493+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('b70a982f-625a-5533-87b6-734aac73f62f', '5b7edb81-4b91-598d-85a1-3f4a79e1ecef', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '请编写一个Java程序，使用匿名类实现一个按钮点击事件监听器，当按钮被点击时输出“Button clicked!”。要求：定义一个Button类，包含一个click()方法，该方法接受一个ActionListener接口类型的参数，ActionListener接口中定义onClick()方法。在main方法中创建Button对象并调用click()方法，传入匿名类实现。', 'coding', NULL, '```java
interface ActionListener {
    void onClick();
}

class Button {
    void click(ActionListener listener) {
        listener.onClick();
    }
}

public class Main {
    public static void main(String[] args) {
        Button btn = new Button();
        btn.click(new ActionListener() {
            @Override
            public void onClick() {
                System.out.println("Button clicked!");
            }
        });
    }
}
```', '首先定义ActionListener接口，包含onClick()方法。Button类的click()方法接受ActionListener参数，并在方法内调用listener.onClick()。在main方法中创建Button实例，调用click()并传入匿名类实现，重写onClick()方法输出信息。', 'hard', NULL, NULL, '内部类与匿名类', '2026-07-05T11:59:47.241493+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('6dc68281-beb0-52a9-9d3a-fe24e675d931', '5b7edb81-4b91-598d-85a1-3f4a79e1ecef', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '请编写一个Java程序，使用内部类实现一个计数器。外部类Counter包含一个私有整型变量count，内部类Incrementor有一个方法increment()，每次调用将count加1。外部类提供getCount()方法返回当前计数值。在main方法中测试，创建Counter对象，使用内部类对象调用increment()三次，然后输出计数值。', 'coding', NULL, '```java
public class Counter {
    private int count = 0;
    
    class Incrementor {
        void increment() {
            count++;
        }
    }
    
    public int getCount() {
        return count;
    }
    
    public static void main(String[] args) {
        Counter counter = new Counter();
        Counter.Incrementor inc = counter.new Incrementor();
        inc.increment();
        inc.increment();
        inc.increment();
        System.out.println("Count: " + counter.getCount()); // 输出3
    }
}
```', 'Counter类中定义私有成员count，内部类Incrementor通过持有外部类实例的引用直接访问count并自增。外部类提供getCount()方法。在main中创建Counter实例，通过counter.new Incrementor()创建内部类对象，调用三次increment()后输出count值。', 'hard', NULL, NULL, '内部类与匿名类', '2026-07-05T11:59:47.241493+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('ef8c0877-7762-54c1-9234-f900f81ebdb0', '5b7edb81-4b91-598d-85a1-3f4a79e1ecef', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '请分析以下代码，指出其中的错误并解释原因。
```java
class Outer {
    private int x = 10;
    static class Inner {
        void display() {
            System.out.println(x);
        }
    }
}
```', 'coding', NULL, '错误：静态内部类Inner不能访问外部类的非静态成员x。
修正：将x改为static，或将Inner改为非静态内部类。
```java
// 修正方案1：将x改为static
class Outer {
    private static int x = 10;
    static class Inner {
        void display() {
            System.out.println(x);
        }
    }
}
// 修正方案2：将Inner改为非静态内部类
class Outer {
    private int x = 10;
    class Inner {
        void display() {
            System.out.println(x);
        }
    }
}
```', '静态内部类不持有外部类实例的引用，因此不能直接访问外部类的非静态成员。要访问非静态成员，需要将内部类改为非静态，或者将外部类成员改为静态。', 'hard', NULL, NULL, '内部类与匿名类', '2026-07-05T11:59:47.241493+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('e7f4e0ea-2371-5364-bda4-5f34693132dd', '5b7edb81-4b91-598d-85a1-3f4a79e1ecef', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '请编写一个程序，使用匿名类对整数数组进行排序，排序规则为按数字的绝对值大小升序排列。要求：使用Arrays.sort()方法，并传入一个Comparator接口的匿名类实现。', 'coding', NULL, '```java
import java.util.Arrays;
import java.util.Comparator;

public class Main {
    public static void main(String[] args) {
        Integer[] numbers = {3, -1, 2, -5, 4};
        Arrays.sort(numbers, new Comparator<Integer>() {
            @Override
            public int compare(Integer a, Integer b) {
                return Integer.compare(Math.abs(a), Math.abs(b));
            }
        });
        System.out.println(Arrays.toString(numbers)); // 输出[-1, 2, 3, 4, -5]
    }
}
```', '使用Arrays.sort()方法，第二个参数为Comparator接口的匿名类实现。在compare方法中，通过Math.abs()获取绝对值，然后使用Integer.compare()比较绝对值大小，实现按绝对值升序排序。', 'hard', NULL, NULL, '内部类与匿名类', '2026-07-05T11:59:47.241493+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('536de298-6025-5658-a9c8-c26ecc07714d', '5b7edb81-4b91-598d-85a1-3f4a79e1ecef', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '请编写一个程序，演示如何从外部类外部创建非静态内部类的实例。要求：外部类Outer包含一个非静态内部类Inner，Inner有一个方法show()输出“Inner class”。在另一个类Main中创建Inner的实例并调用show()。', 'coding', NULL, '```java
class Outer {
    class Inner {
        void show() {
            System.out.println("Inner class");
        }
    }
}

public class Main {
    public static void main(String[] args) {
        Outer outer = new Outer();
        Outer.Inner inner = outer.new Inner();
        inner.show();
    }
}
```', '非静态内部类的实例必须依附于外部类实例。首先创建外部类实例outer，然后通过outer.new Inner()语法创建内部类实例，再调用show()方法。', 'hard', NULL, NULL, '内部类与匿名类', '2026-07-05T11:59:47.241493+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('344fcf0b-802f-59fe-9af4-102dbbd6b182', '3671f83e-25d6-55a4-95b1-d0ab3cf3aea5', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', 'throw关键字用于在方法签名中声明可能抛出的异常。', 'choice', '["A. 正确", "B. 错误"]', 'B', 'throw用于在方法内部实际抛出一个异常对象，而throws用于在方法签名中声明可能抛出的异常类型。', 'easy', NULL, NULL, '异常的概念与分类', '2026-07-05T11:59:47.646719+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('53fa32d1-7e6a-5cbe-b11f-0bad7f199161', '3671f83e-25d6-55a4-95b1-d0ab3cf3aea5', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', 'Java异常处理机制基于面向对象思想，所有异常类都继承自___类。', 'fill', NULL, 'Throwable', 'Throwable是Java异常体系的根类，所有异常和错误都直接或间接继承自它。', 'easy', NULL, NULL, '异常的概念与分类', '2026-07-05T11:59:47.646719+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('b1e43183-fdc3-5bee-803f-a2b8d1d6da64', '3671f83e-25d6-55a4-95b1-d0ab3cf3aea5', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '检查型异常在编译时必须被处理，方式有两种：使用try-catch捕获或使用___声明抛出。', 'fill', NULL, 'throws', '对于检查型异常，要么在方法内部用try-catch处理，要么在方法签名中用throws声明抛出，由调用者处理。', 'easy', NULL, NULL, '异常的概念与分类', '2026-07-05T11:59:47.646719+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('f503fae6-d23b-584e-b47f-3fc3a06295bb', '3671f83e-25d6-55a4-95b1-d0ab3cf3aea5', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', 'Error和Exception是Throwable的两个主要子类，其中___表示程序无法恢复的系统级错误。', 'fill', NULL, 'Error', 'Error代表系统级错误，如OutOfMemoryError，通常程序无法恢复，不建议捕获。', 'easy', NULL, NULL, '异常的概念与分类', '2026-07-05T11:59:47.646719+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('36a75388-352a-5a24-ac83-b647ab2ee7b2', '3671f83e-25d6-55a4-95b1-d0ab3cf3aea5', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '非检查型异常包括运行时异常（RuntimeException）和___。', 'fill', NULL, 'Error', '非检查型异常包括RuntimeException及其子类，以及Error及其子类，编译时都不强制处理。', 'easy', NULL, NULL, '异常的概念与分类', '2026-07-05T11:59:47.646719+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('87992438-5d18-5953-b4e8-ce6b118710ff', '3671f83e-25d6-55a4-95b1-d0ab3cf3aea5', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '当异常发生时，Java运行时系统会创建异常对象并沿着方法调用栈向___传递。', 'fill', NULL, '上', '异常对象会沿着方法调用栈向上层方法传递，直到被捕获或最终由JVM处理。', 'easy', NULL, NULL, '异常的概念与分类', '2026-07-05T11:59:47.646719+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('464f2ca3-69cb-58bb-9de7-2a433736f103', '3671f83e-25d6-55a4-95b1-d0ab3cf3aea5', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '编写一个Java方法，从文件中读取整数并返回其平方值。要求：处理FileNotFoundException（检查型异常）和NumberFormatException（运行时异常），并在finally中关闭文件资源。请写出完整代码。', 'coding', NULL, 'import java.io.*;
import java.util.Scanner;

public class FileSquare {
    public static int readAndSquare(String filePath) {
        Scanner scanner = null;
        try {
            File file = new File(filePath);
            scanner = new Scanner(file);
            String line = scanner.nextLine();
            int num = Integer.parseInt(line);
            return num * num;
        } catch (FileNotFoundException e) {
            System.out.println("文件未找到: " + e.getMessage());
            return -1;
        } catch (NumberFormatException e) {
            System.out.println("文件内容不是整数: " + e.getMessage());
            return -2;
        } finally {
            if (scanner != null) {
                scanner.close();
                System.out.println("资源已关闭");
            }
        }
    }

    public static void main(String[] args) {
        int result = readAndSquare("test.txt");
        System.out.println("结果: " + result);
    }
}', 'FileNotFoundException是检查型异常，必须处理（try-catch或throws），这里用try-catch捕获。NumberFormatException是运行时异常，可以不处理但这里也捕获以增强健壮性。finally块确保Scanner资源被关闭，无论是否发生异常。', 'easy', NULL, NULL, '异常的概念与分类', '2026-07-05T11:59:47.646719+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('83802ad2-e9e8-5bbd-8747-38c00b20eb86', '3671f83e-25d6-55a4-95b1-d0ab3cf3aea5', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '某方法调用另一个可能抛出检查型异常的方法，但调用者不想处理该异常。请用throws关键字声明，并写出两个方法的完整代码示例。', 'coding', NULL, 'import java.io.*;

public class ExceptionDemo {
    // 方法A：抛出检查型异常
    public static void methodA() throws IOException {
        BufferedReader reader = new BufferedReader(new FileReader("data.txt"));
        String line = reader.readLine();
        System.out.println(line);
        reader.close();
    }

    // 方法B：调用methodA，但不处理异常，继续抛出
    public static void methodB() throws IOException {
        methodA();  // 不捕获，继续向上抛出
    }

    public static void main(String[] args) {
        try {
            methodB();
        } catch (IOException e) {
            System.out.println("最终处理异常: " + e.getMessage());
        }
    }
}', 'methodA中FileReader构造方法可能抛出FileNotFoundException（IOException的子类），所以methodA用throws IOException声明。methodB调用methodA，同样不想处理，所以也声明throws IOException。最终在main中捕获处理。', 'easy', NULL, NULL, '异常的概念与分类', '2026-07-05T11:59:47.646719+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('904fc5bc-1170-596b-90ed-92a06cdcd48a', '3671f83e-25d6-55a4-95b1-d0ab3cf3aea5', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '请解释Java中异常处理机制的工作原理，包括异常对象的创建、抛出、传播以及捕获过程。', 'coding', NULL, '当程序执行过程中出现异常情况时，Java运行时系统会创建对应异常类的对象（如new NullPointerException()），该对象包含异常类型、描述信息及调用栈信息。然后使用throw关键字将该对象抛出。异常对象会沿着方法调用栈逐层向上传播（方法调用顺序的反向），直到遇到一个能处理该异常类型的try-catch块。如果一直未找到合适的catch块，则最终由JVM的默认异常处理器处理，通常打印异常栈信息并终止程序。捕获时，catch块根据异常类型匹配，可以一个catch捕获多种异常（多异常捕获），也可以多个catch分别处理。finally块无论是否捕获异常都会执行，常用于释放资源。', '该题考查异常处理的核心流程：创建异常对象→抛出→沿调用栈传播→匹配catch→finally执行。理解此过程有助于编写健壮的异常处理代码。', 'easy', NULL, NULL, '异常的概念与分类', '2026-07-05T11:59:47.646719+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('6b66c756-43ac-5368-b855-01b2972cca0c', '3671f83e-25d6-55a4-95b1-d0ab3cf3aea5', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '编写一个程序，演示自定义检查型异常的使用。要求：定义一个检查型异常类InvalidAgeException，在setAge方法中如果年龄小于0或大于150则抛出该异常，并在main中处理。', 'coding', NULL, '// 自定义检查型异常
class InvalidAgeException extends Exception {
    public InvalidAgeException(String message) {
        super(message);
    }
}

// Person类
class Person {
    private int age;

    public void setAge(int age) throws InvalidAgeException {
        if (age < 0 || age > 150) {
            throw new InvalidAgeException("年龄不合法: " + age);
        }
        this.age = age;
    }

    public int getAge() {
        return age;
    }
}

// 测试类
public class TestCustomException {
    public static void main(String[] args) {
        Person p = new Person();
        try {
            p.setAge(200);  // 抛出异常
        } catch (InvalidAgeException e) {
            System.out.println("捕获异常: " + e.getMessage());
        }
        // 正常情况
        try {
            p.setAge(25);
            System.out.println("年龄设置成功: " + p.getAge());
        } catch (InvalidAgeException e) {
            System.out.println(e.getMessage());
        }
    }
}', '自定义检查型异常需继承Exception类，并在构造中传递错误信息。setAge方法用throws声明异常，在条件不满足时用throw抛出。调用者必须用try-catch处理或继续throws。', 'easy', NULL, NULL, '异常的概念与分类', '2026-07-05T11:59:47.646719+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('0db3cd8b-8714-544a-b1b3-d2c270b3cadb', '3671f83e-25d6-55a4-95b1-d0ab3cf3aea5', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '请分析以下代码的运行结果，并解释异常传播过程。

public class ExceptionFlow {
    public static void main(String[] args) {
        try {
            method1();
        } catch (Exception e) {
            System.out.println("Caught in main: " + e.getMessage());
        }
    }
    public static void method1() throws Exception {
        method2();
    }
    public static void method2() throws Exception {
        throw new Exception("Exception in method2");
    }
}', 'coding', NULL, '运行结果：
Caught in main: Exception in method2

异常传播过程：
1. method2()中通过throw new Exception("Exception in method2")创建并抛出异常对象。
2. 异常从method2()向上传播到调用者method1()，method1()没有捕获，继续向上传播到main()。
3. main()中的try-catch捕获了该异常（因为Exception是通用类型），打印"Caught in main: Exception in method2"。
4. 程序正常结束。', '该题考查异常沿调用栈传播的机制。异常从method2抛出，经过method1，最终在main中被捕获。注意method1和method2都声明了throws Exception，但实际并未捕获，而是继续向上抛出。', 'easy', NULL, NULL, '异常的概念与分类', '2026-07-05T11:59:47.646719+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('5bc6f670-7ec7-59b5-af57-73f3a39b8787', '3671f83e-25d6-55a4-95b1-d0ab3cf3aea5', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '在Java中，try-catch-finally机制的主要作用是什么？', 'choice', '["A. 提高代码执行速度", "B. 将正常逻辑与错误处理逻辑分离，提高代码健壮性", "C. 简化循环结构", "D. 实现多线程同步"]', 'B', 'try-catch-finally机制用于异常处理，将可能出错的代码放在try块中，错误处理放在catch块中，finally块用于清理资源，从而分离正常逻辑与错误处理逻辑，提升代码健壮性和可读性。', 'easy', NULL, NULL, 'try-catch-finally机制', '2026-07-05T11:59:47.646719+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('0a3eff6b-7134-50f7-aad2-d2a9b48490ca', '3671f83e-25d6-55a4-95b1-d0ab3cf3aea5', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '当try块中抛出异常时，catch块的匹配顺序是？', 'choice', '["A. 按照异常类型的继承层次从子类到父类", "B. 按照catch块声明的顺序依次匹配", "C. 随机匹配一个catch块", "D. 只匹配第一个catch块，无论类型是否匹配"]', 'B', 'Java中catch块按照声明顺序依次匹配异常类型，一旦匹配成功则执行该catch块，后续catch块不再执行。', 'easy', NULL, NULL, 'try-catch-finally机制', '2026-07-05T11:59:47.646719+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('0981e19a-851d-51a7-a349-c7bf2d287039', '3671f83e-25d6-55a4-95b1-d0ab3cf3aea5', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '以下关于finally块的说法，正确的是？', 'choice', '["A. 只有try块中抛出异常时才会执行finally块", "B. 如果catch块中捕获了异常，finally块就不会执行", "C. 即使try或catch块中有return语句，finally块也会在方法返回前执行", "D. finally块可以省略不写"]', 'C', 'finally块无论try块是否抛出异常、是否被捕获，甚至遇到return语句，都会在方法返回前执行（除非JVM退出），常用于资源释放。', 'easy', NULL, NULL, 'try-catch-finally机制', '2026-07-05T11:59:47.646719+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('a9e5c8ad-6816-592b-a11d-cd06531c1c9f', '3671f83e-25d6-55a4-95b1-d0ab3cf3aea5', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '执行以下代码，输出结果是什么？
```java
try {
    int[] arr = new int[5];
    System.out.println(arr[10]);
} catch (ArrayIndexOutOfBoundsException e) {
    System.out.println("A");
} catch (Exception e) {
    System.out.println("B");
} finally {
    System.out.println("C");
}
```', 'choice', '["A. A", "B. B", "C. A C", "D. B C"]', 'C', '访问数组越界会抛出ArrayIndexOutOfBoundsException，第一个catch块匹配成功，输出"A"，然后执行finally块输出"C"，最终输出"A C"。', 'easy', NULL, NULL, 'try-catch-finally机制', '2026-07-05T11:59:47.646719+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('de89962b-07a7-5d19-975f-2da833abb91c', '3671f83e-25d6-55a4-95b1-d0ab3cf3aea5', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '在try-catch-finally结构中，如果try块中抛出了一个未被任何catch块捕获的异常，会发生什么？', 'choice', '["A. 程序立即终止，不执行finally块", "B. 执行finally块后，异常沿调用栈向上传播", "C. 异常被忽略，继续执行后续代码", "D. 程序抛出编译错误"]', 'B', '如果try块抛出的异常没有匹配的catch块，finally块仍然会执行，然后异常会沿调用栈向上传播给方法的调用者。', 'easy', NULL, NULL, 'try-catch-finally机制', '2026-07-05T11:59:47.646719+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('9c577571-46f1-54be-8e8c-a23d1d0be812', '3671f83e-25d6-55a4-95b1-d0ab3cf3aea5', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '在Java中，try块后面必须至少有一个catch块或一个finally块。', 'choice', '["A. 正确", "B. 错误"]', 'A', '根据Java语法，try块不能单独存在，必须紧跟至少一个catch块或finally块，或者两者都有。', 'easy', NULL, NULL, 'try-catch-finally机制', '2026-07-05T11:59:47.646719+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('61b41597-ab28-5df7-b645-d8503679022b', '3671f83e-25d6-55a4-95b1-d0ab3cf3aea5', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', 'finally块中的代码在遇到System.exit(0)时仍会执行。', 'choice', '["A. 正确", "B. 错误"]', 'B', '如果JVM在执行finally块之前退出（如调用System.exit()），则finally块不会执行。', 'easy', NULL, NULL, 'try-catch-finally机制', '2026-07-05T11:59:47.646719+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('32ef0299-3602-51fd-9cb1-0ca7c4c40fb1', '3671f83e-25d6-55a4-95b1-d0ab3cf3aea5', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '以下代码中，方法divide()可能抛出ArithmeticException，请在横线处填入合适的关键字：
public int divide(int a, int b) ___ ArithmeticException { return a / b; }', 'fill', NULL, 'throws', '由于ArithmeticException是运行时异常，可以不强制声明，但为了明确告知调用者，可以使用throws声明。此处应填入throws。', 'medium', NULL, NULL, 'throw与throws关键字', '2026-07-05T11:59:47.646719+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('876cc5b8-2393-563e-ae3b-a8370389ee0d', '3671f83e-25d6-55a4-95b1-d0ab3cf3aea5', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '如果方法中使用了throw抛出一个检查型异常（checked exception），则该方法必须在声明中使用throws，否则编译会出错。', 'choice', '["A. 正确", "B. 错误"]', 'A', '检查型异常（如IOException）必须被捕获或声明抛出。如果方法内使用throw抛出了检查型异常，而方法没有用throws声明，则编译无法通过。', 'medium', NULL, NULL, 'throw与throws关键字', '2026-07-05T11:59:47.646719+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('46057674-af16-5c26-8a00-6bdef467d25b', '3671f83e-25d6-55a4-95b1-d0ab3cf3aea5', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '下列哪个异常类型可以不在throws中声明而直接在方法内抛出？', 'choice', '["A. IOException", "B. SQLException", "C. NullPointerException", "D. FileNotFoundException"]', 'C', 'NullPointerException是运行时异常（RuntimeException的子类），属于非检查型异常，可以不使用throws声明。其他三个选项都是检查型异常，必须声明或捕获。', 'medium', NULL, NULL, 'throw与throws关键字', '2026-07-05T11:59:47.646719+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('560fb88d-c98f-56a1-8303-2c515ebd043f', '3671f83e-25d6-55a4-95b1-d0ab3cf3aea5', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '请编写一个Java方法，该方法接收一个整数数组作为参数，返回数组元素的平均值。如果数组为null或长度为0，则使用throw抛出一个自定义异常InvalidArrayException（需定义该异常类）。在方法声明中使用throws声明该异常。要求给出完整的类定义。', 'coding', NULL, 'class InvalidArrayException extends Exception {
    public InvalidArrayException(String message) {
        super(message);
    }
}

public class ArrayUtils {
    public static double average(int[] arr) throws InvalidArrayException {
        if (arr == null || arr.length == 0) {
            throw new InvalidArrayException("Array is null or empty");
        }
        int sum = 0;
        for (int num : arr) {
            sum += num;
        }
        return (double) sum / arr.length;
    }
}', '首先定义自定义异常类InvalidArrayException，继承Exception。然后在average方法中检查参数，如果为null或长度为0，则使用throw抛出异常，并在方法签名中使用throws声明。最后计算平均值并返回。注意返回类型为double以避免整数除法。', 'medium', NULL, NULL, 'throw与throws关键字', '2026-07-05T11:59:47.646719+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('e30dc5cb-c466-5969-9104-ff77108fa82e', '3671f83e-25d6-55a4-95b1-d0ab3cf3aea5', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '以下代码的输出结果是什么？
public class Test {
    public static void main(String[] args) {
        try {
            methodA();
        } catch (Exception e) {
            System.out.println("Caught");
