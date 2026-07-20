INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('3664d7ae-3b00-58b3-98c8-414ea3a93162', '25067395-cefc-5ade-9275-b149a9c9f967', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', 'protected修饰的成员只能被同一个包中的类访问。', 'choice', '["A. 正确", "B. 错误"]', 'B', 'protected修饰的成员除了可以被同一个包中的类访问外，还可以被不同包中的子类访问。题目描述不完整，因此错误。', 'easy', NULL, NULL, '访问修饰符与封装', '2026-07-05T11:58:58.589005+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('dcb1a40a-2270-5019-bcd3-676459cd9497', '8bfef00c-9dc5-576c-bf72-bcdf88b616e8', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '在动物类层次中，Animal为父类，Dog为子类，以下哪项体现了多态？', 'choice', '["A. Dog d = new Dog();", "B. Animal a = new Dog(); a.eat();", "C. Dog d = (Dog) new Animal();", "D. Animal a = new Animal();"]', 'B', 'Animal a = new Dog() 是向上转型，a.eat() 在运行时调用Dog类重写的eat()方法，体现了多态。选项A是普通实例化，选项C是向下转型但父类对象不能强制转为子类，选项D无多态。', 'easy', NULL, NULL, '面向对象三大特性概述', '2026-07-05T11:58:56.042974+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('c8a83356-c986-58c9-a064-7c9dfaf325e1', '8bfef00c-9dc5-576c-bf72-bcdf88b616e8', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', 'Java支持以下哪种继承方式？', 'choice', '["A. 多继承（一个子类多个父类）", "B. 单继承（一个子类一个直接父类）", "C. 循环继承", "D. 以上都不对"]', 'B', 'Java中一个子类只能有一个直接父类，即单继承。但可以通过实现多个接口来达到类似多继承的效果。', 'easy', NULL, NULL, '面向对象三大特性概述', '2026-07-05T11:58:56.042974+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('c62f79db-e46d-5b65-a1fa-34601257988b', '8bfef00c-9dc5-576c-bf72-bcdf88b616e8', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '封装要求所有属性都必须设置为private。', 'choice', '["A. 正确", "B. 错误"]', 'B', '封装通常建议将属性设为private，但并非强制。也可以使用protected或默认访问权限，只要对外隐藏实现细节即可。核心是通过getter/setter控制访问。', 'easy', NULL, NULL, '面向对象三大特性概述', '2026-07-05T11:58:56.042974+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('8d355aae-d3ba-580f-8e43-997a12788a17', '8bfef00c-9dc5-576c-bf72-bcdf88b616e8', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '子类可以继承父类的所有成员，包括private成员。', 'choice', '["A. 正确", "B. 错误"]', 'B', '子类不能继承父类的private成员，但可以通过父类提供的protected或public方法间接访问。继承仅包括非private成员。', 'easy', NULL, NULL, '面向对象三大特性概述', '2026-07-05T11:58:56.042974+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('28e9aed2-a272-57c8-8640-2778c6932d9e', '8bfef00c-9dc5-576c-bf72-bcdf88b616e8', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '多态必须依赖于继承或接口实现。', 'choice', '["A. 正确", "B. 错误"]', 'A', '多态的实现需要存在继承关系（子类重写父类方法）或接口实现（实现类重写接口方法），否则无法通过父类/接口引用调用不同子类的具体行为。', 'easy', NULL, NULL, '面向对象三大特性概述', '2026-07-05T11:58:56.042974+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('07b92dad-bdab-5b92-8e56-e94dab95268e', '8bfef00c-9dc5-576c-bf72-bcdf88b616e8', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '方法重载（Overload）属于运行时多态。', 'choice', '["A. 正确", "B. 错误"]', 'B', '方法重载是编译时多态，根据参数列表在编译期确定调用哪个方法。运行时多态（动态绑定）依赖于方法重写（Override）。', 'easy', NULL, NULL, '面向对象三大特性概述', '2026-07-05T11:58:56.042974+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('3baa200f-4503-5e6e-bc02-2d2a094363fe', '8bfef00c-9dc5-576c-bf72-bcdf88b616e8', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '在Java中，一个类可以同时继承多个类。', 'choice', '["A. 正确", "B. 错误"]', 'B', 'Java只支持单继承，一个类只能有一个直接父类。但可以通过多层继承链（如A extends B, B extends C）间接继承多个类的功能。', 'easy', NULL, NULL, '面向对象三大特性概述', '2026-07-05T11:58:56.042974+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('9c638a43-18ee-5cdd-b6b6-4d5815e4e02e', '8bfef00c-9dc5-576c-bf72-bcdf88b616e8', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '封装通过访问修饰符实现，通常将属性设置为___，并提供___方法供外部访问。', 'fill', NULL, 'private; getter/setter', '封装的标准做法是将属性用private隐藏，然后提供public的getter和setter方法控制读写权限，保护数据完整性。', 'easy', NULL, NULL, '面向对象三大特性概述', '2026-07-05T11:58:56.042974+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('3d7c8e07-5bdd-576e-b387-85661b214fc1', '8bfef00c-9dc5-576c-bf72-bcdf88b616e8', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '子类通过___关键字调用父类的构造器。', 'fill', NULL, 'super', 'super()用于调用父类构造器，必须放在子类构造器的第一行。super还可以调用父类的方法或访问父类成员。', 'easy', NULL, NULL, '面向对象三大特性概述', '2026-07-05T11:58:56.042974+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('70e39594-a645-5482-88b9-fbf7c59d7484', '8bfef00c-9dc5-576c-bf72-bcdf88b616e8', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '多态发生的两个核心机制是___和___。', 'fill', NULL, '向上转型; 动态绑定', '向上转型（父类引用指向子类对象）是多态的前提，动态绑定（运行时根据实际对象类型调用方法）是多态的实现机制。', 'easy', NULL, NULL, '面向对象三大特性概述', '2026-07-05T11:58:56.328898+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('6a9c8988-f3e9-5a18-b29a-7f9b3c23b6ce', '8bfef00c-9dc5-576c-bf72-bcdf88b616e8', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '在Java中，如果子类重写了父类的方法，则通过父类引用调用该方法时，实际执行的是___的方法。', 'fill', NULL, '子类', '动态绑定机制会检查引用实际指向的对象类型，如果子类重写了该方法，则调用子类的版本，这是多态的核心表现。', 'easy', NULL, NULL, '面向对象三大特性概述', '2026-07-05T11:58:56.328898+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('22a5c511-9be3-597e-9b34-53d2ea0030f4', '8bfef00c-9dc5-576c-bf72-bcdf88b616e8', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', 'Java中实现多态的两种方式是___和___。', 'fill', NULL, '继承; 接口', '多态可以通过继承（子类重写父类方法）实现，也可以通过实现接口（不同实现类重写接口方法）实现。', 'easy', NULL, NULL, '面向对象三大特性概述', '2026-07-05T11:58:56.328898+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('8a8ffb3e-07f2-5f76-a55a-0e0957620730', '8bfef00c-9dc5-576c-bf72-bcdf88b616e8', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '请设计一个简单的Java程序，使用封装、继承和多态三大特性：
1. 定义一个抽象类Animal，包含私有属性name（String），构造器初始化name，抽象方法eat()，以及getter方法getName()。
2. 定义两个子类Dog和Cat，分别重写eat()方法，输出“狗吃骨头”和“猫吃鱼”。
3. 在测试类中创建一个Animal数组，存放Dog和Cat对象，遍历数组调用eat()方法，体现多态。
请写出完整代码。', 'coding', NULL, '```java
// 抽象父类
abstract class Animal {
    private String name;
public Animal(String name) {
        this.name = name;
}

    public String getName() {
        return name;
}

    public abstract void eat();
}

// 子类Dog
class Dog extends Animal {
    public Dog(String name) {
        super(name);
}

    @Override
    public void eat() {
        System.out.println(getName() + "吃骨头");
}
}

// 子类Cat
class Cat extends Animal {
    public Cat(String name) {
        super(name);
}

    @Override
    public void eat() {
        System.out.println(getName() + "吃鱼");
}
}

// 测试类
public class Test {
    public static void main(String[] args) {
        Animal[] animals = new Animal[2];
animals[0] = new Dog("旺财");
animals[1] = new Cat("咪咪");
for (Animal a : animals) {
            a.eat();  // 多态：动态绑定调用子类重写的方法
        }
    }
}
```
输出结果：
旺财吃骨头
咪咪吃鱼', '本题综合考查三大特性：封装通过private name和public getName()实现；继承通过extends关键字使Dog和Cat复用Animal的name属性和getName方法，并重写eat()；多态通过父类引用Animal[]数组指向子类对象，遍历时调用eat()，JVM根据实际对象类型动态绑定到对应子类的eat()方法。', 'easy', NULL, NULL, '面向对象三大特性概述', '2026-07-05T11:58:56.328898+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('0013a77d-f8ac-5d28-8853-86417ac4ae69', '25067395-cefc-5ade-9275-b149a9c9f967', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '封装的核心思想是将数据和操作数据的方法绑定在一起，并对外隐藏内部实现。', 'choice', '["A. 正确", "B. 错误"]', 'A', '封装正是将对象的属性和方法包装在类内部，对外隐藏实现细节，仅通过公开接口交互，这是面向对象封装的基本定义。', 'easy', NULL, NULL, '访问修饰符与封装', '2026-07-05T11:58:58.589005+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('304b33d8-e7ab-5381-b538-a6bb406a5b4f', '25067395-cefc-5ade-9275-b149a9c9f967', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '如果一个类的所有属性都是private，那么这个类就完全无法被外部使用。', 'choice', '["A. 正确", "B. 错误"]', 'B', '即使所有属性都是private，仍然可以通过public的getter和setter方法或其它public方法来访问和修改这些属性，从而实现受控访问。', 'easy', NULL, NULL, '访问修饰符与封装', '2026-07-05T11:58:58.589005+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('899309fb-f374-5bc5-9acb-c5b889f1d29c', '25067395-cefc-5ade-9275-b149a9c9f967', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', 'Java编译器在编译阶段会检查访问修饰符的合法性。', 'choice', '["A. 正确", "B. 错误"]', 'A', 'Java编译器会在编译时检查访问修饰符，如果试图访问没有权限的成员，编译器会报错，从而在编译阶段就避免了非法访问。', 'easy', NULL, NULL, '访问修饰符与封装', '2026-07-05T11:58:58.589005+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('986bc6d3-b278-5d97-86c3-31dd0c86bb5b', '8bfef00c-9dc5-576c-bf72-bcdf88b616e8', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '阅读以下代码，指出其中体现了哪些面向对象特性，并解释每个特性的具体表现。
```java
class Person {
    private int age;
public Person(int age) {
        setAge(age);
}

    public int getAge() {
        return age;
}

    public void setAge(int age) {
        if (age >= 0 && age <= 150) {
            this.age = age;
} else {
            System.out.println("年龄不合法");
}
    }

    public void introduce() {
        System.out.println("我是人，年龄" + age);
}
}

class Student extends Person {
    private String school;
public Student(int age, String school) {
        super(age);
this.school = school;
}

    @Override
    public void introduce() {
        System.out.println("我是学生，来自" + school);
}
}

public class Main {
    public static void main(String[] args) {
        Person p = new Student(20, "清华大学");
p.introduce();
}
}
```', 'coding', NULL, '该代码体现了面向对象三大特性：
1. 封装：Person类的age属性设为private，通过公有的getAge()和setAge()方法控制访问，setAge()中还进行了合法性检查（0~150），保护数据完整性。
2. 继承：Student类通过extends继承Person类，使用super(age)调用父类构造器，并添加了自有属性school。
3. 多态：在main方法中，Person p = new Student(...) 是向上转型，p.introduce() 在运行时调用Student类重写的introduce()方法，输出“我是学生，来自清华大学”，体现了动态绑定。', '本题要求识别代码中的三大特性。封装体现在private属性+getter/setter+校验逻辑；继承体现在extends和super；多态体现在父类引用指向子类对象以及方法重写后的动态绑定。', 'easy', NULL, NULL, '面向对象三大特性概述', '2026-07-05T11:58:56.328898+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('c4b3cb1f-ce1d-5f9c-8d9b-cc89a19fd492', '8bfef00c-9dc5-576c-bf72-bcdf88b616e8', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '请比较方法重载（Overload）和方法重写（Override）的区别，并从面向对象多态的角度说明各自属于哪种多态。', 'coding', NULL, '方法重载（Overload）：
- 发生在同一个类中。
- 方法名相同，参数列表不同（参数个数、类型、顺序）。
- 与返回值类型无关，不能仅通过返回值区分。
- 属于编译时多态（静态多态），编译器根据参数列表在编译期确定调用哪个方法。

方法重写（Override）：
- 发生在继承关系的子类中（或实现接口的类中）。
- 方法签名（方法名+参数列表）必须与父类/接口完全相同。
- 返回值类型可以相同或是父类返回类型的子类型（协变返回类型）。
- 访问权限不能比父类更严格（public > protected > default > private）。
- 属于运行时多态（动态多态），JVM在运行时根据实际对象类型动态绑定调用对应方法。

从多态角度：方法重载是编译时多态（静态绑定），方法重写是运行时多态（动态绑定），通常所说的“多态”指运行时多态。', '本题考查对多态两种形式的理解。重载是编译期确定，重写是运行期确定。需要清晰列出区别，并指出各自归属的多态类型。', 'easy', NULL, NULL, '面向对象三大特性概述', '2026-07-05T11:58:56.328898+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('6f749fcb-9e96-5f0c-8d01-c02f42bdbb5e', '8bfef00c-9dc5-576c-bf72-bcdf88b616e8', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '在Java中，为什么说“封装是面向对象的基础，继承是复用的手段，多态是灵活性的体现”？请结合实例分析。', 'coding', NULL, '1. 封装是基础：通过隐藏内部细节，只暴露接口，降低了模块间的耦合度，提高了代码的安全性和可维护性。例如，银行账户类Account将余额balance设为private，提供deposit()和withdraw()方法，确保余额不会直接修改，防止非法操作。

2. 继承是复用的手段：子类可以复用父类的属性和方法，避免重复代码。例如，Vehicle类定义speed、run()，Car和Bicycle继承Vehicle，直接复用属性和方法，同时可添加自己的特性（如Car的trunkSize）。

3. 多态是灵活性的体现：同一操作作用于不同对象时产生不同行为，使得程序易于扩展。例如，一个Shape数组可以存放Circle、Rectangle等子类对象，调用draw()方法时各自绘制自己的形状。如果需要新增Triangle类，只需继承Shape并重写draw()，无需修改已有代码，符合开闭原则。

三者协同：封装保证了各模块的独立性，继承让代码复用成为可能，多态则让系统能够灵活应对变化，共同构成了面向对象设计的核心思想。', '本题要求从原理和实例角度阐述三大特性的作用。封装强调安全与低耦合，继承强调代码复用，多态强调可扩展性。实例需具体且能清晰对应各特性。', 'easy', NULL, NULL, '面向对象三大特性概述', '2026-07-05T11:58:56.328898+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('568543e9-ef58-5489-986a-d4d39398c06c', '25067395-cefc-5ade-9275-b149a9c9f967', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '在Java中，访问修饰符private修饰的成员可以被以下哪种类访问？', 'choice', '["A. 同一个类", "B. 同一个包中的其他类", "C. 不同包中的子类", "D. 所有类"]', 'A', 'private修饰的成员只能在定义它的类内部访问，其他任何类（包括同包类、子类）都无法访问。这是封装中最严格的访问控制级别。', 'easy', NULL, NULL, '访问修饰符与封装', '2026-07-05T11:58:58.589005+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('6e2e5632-b2a8-55a5-b3f5-35f259579644', '25067395-cefc-5ade-9275-b149a9c9f967', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '下列哪个访问修饰符修饰的成员可以被同一个包中的其他类以及不同包中的子类访问？', 'choice', '["A. private", "B. default（无修饰符）", "C. protected", "D. public"]', 'C', 'protected修饰的成员可以被同一个包中的其他类访问，也可以被不同包中的子类访问。default只能被同包类访问，不能跨包子类访问。', 'easy', NULL, NULL, '访问修饰符与封装', '2026-07-05T11:58:58.589005+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('4400fb3a-0c6f-58ef-82b0-fc9137be1d6f', '25067395-cefc-5ade-9275-b149a9c9f967', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '关于封装的说法，错误的是：', 'choice', '["A. 封装可以隐藏实现细节", "B. 封装通过访问修饰符实现", "C. 封装会降低代码的安全性", "D. 封装有助于降低耦合"]', 'C', '封装恰恰是为了提高安全性，通过将数据隐藏在类内部并仅提供受控的访问方式，防止外部直接修改。选项C说反了。', 'easy', NULL, NULL, '访问修饰符与封装', '2026-07-05T11:58:58.589005+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('d0088842-5130-5e92-bf94-85530bd9b2cb', '25067395-cefc-5ade-9275-b149a9c9f967', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '在同一个包中，如果类A的某个成员没有使用任何访问修饰符，那么该成员可以被哪些类访问？', 'choice', '["A. 只能被类A自身访问", "B. 只能被类A和其子类访问", "C. 可以被同一个包中的所有类访问", "D. 可以被所有包中的所有类访问"]', 'C', '默认访问修饰符（default）即不加任何修饰符，允许同一个包内的所有类访问，但不允许不同包中的类（包括子类）访问。', 'easy', NULL, NULL, '访问修饰符与封装', '2026-07-05T11:58:58.589005+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('d0211e08-c7c3-597e-9401-e7b86a2ab552', '25067395-cefc-5ade-9275-b149a9c9f967', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '以下哪个是封装带来的好处？', 'choice', '["A. 增加代码量", "B. 允许外部直接修改属性", "C. 可以在修改内部实现时不影响外部代码", "D. 降低代码的可维护性"]', 'C', '封装支持接口与实现分离，只要对外提供的public方法签名不变，内部实现可以自由修改，外部调用者无需改动代码，提高了可维护性。', 'easy', NULL, NULL, '访问修饰符与封装', '2026-07-05T11:58:58.589005+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('9818277b-9bf4-53a4-801e-aad4fb521b2f', '25067395-cefc-5ade-9275-b149a9c9f967', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '在Java中，使用public修饰的成员变量可以被任何类直接访问和修改。', 'choice', '["A. 正确", "B. 错误"]', 'A', 'public是访问权限最大的修饰符，没有任何访问限制，任何类都可以直接访问和修改public成员变量。但为了封装性，通常不建议将成员变量直接设为public。', 'easy', NULL, NULL, '访问修饰符与封装', '2026-07-05T11:58:58.589005+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('8fba4a00-0d22-5b2a-96b2-d571a17607bc', '25067395-cefc-5ade-9275-b149a9c9f967', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '在Java中，访问权限由小到大的顺序是：___、default、___、public。', 'fill', NULL, 'private, protected', 'private权限最小，仅类内可访问；default（无修饰符）允许同包访问；protected允许同包及子类访问；public权限最大，无限制。', 'easy', NULL, NULL, '访问修饰符与封装', '2026-07-05T11:58:58.589005+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('8623b641-2de9-5d81-aa76-4808f136e565', '25067395-cefc-5ade-9275-b149a9c9f967', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '封装通过将属性声明为___，并提供公共的___和___方法来实现对属性的受控访问。', 'fill', NULL, 'private, getter, setter', '通常将属性设为private，然后提供public的getter方法用于获取属性值，setter方法用于设置属性值，可以在setter中添加验证逻辑。', 'easy', NULL, NULL, '访问修饰符与封装', '2026-07-05T11:58:58.589005+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('d0ba9055-ee01-5067-9063-8ac97773fbfc', '25067395-cefc-5ade-9275-b149a9c9f967', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '如果一个类的成员没有使用任何访问修饰符，它的访问级别被称为___。', 'fill', NULL, 'default（或包级私有）', '在Java中，不写任何访问修饰符时，默认访问权限是包级私有（package-private），即同一个包内的类可以访问。', 'easy', NULL, NULL, '访问修饰符与封装', '2026-07-05T11:58:58.589005+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('b3272585-9db3-54f5-98a7-0a90eb238223', '5b7edb81-4b91-598d-85a1-3f4a79e1ecef', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '下列关于抽象类的描述，正确的是？', 'choice', '["A. 抽象类可以被实例化", "B. 抽象类中必须包含抽象方法", "C. 抽象类中可以包含构造方法", "D. 抽象类中不能定义具体方法"]', 'C', '抽象类不能被实例化（A错误）；抽象类中可以没有抽象方法（B错误）；抽象类中可以包含构造方法，用于子类初始化（C正确）；抽象类中可以定义具体方法（D错误）。', 'easy', NULL, NULL, '抽象类与抽象方法', '2026-07-05T11:59:00.264621+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('496998f9-2d44-55cd-ae9d-9cbbc17a9e62', '5b7edb81-4b91-598d-85a1-3f4a79e1ecef', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '以下哪个关键字用于声明抽象方法？', 'choice', '["A. static", "B. final", "C. abstract", "D. private"]', 'C', '抽象方法使用abstract关键字声明，且不能有方法体。static、final、private与abstract不能同时使用。', 'easy', NULL, NULL, '抽象类与抽象方法', '2026-07-05T11:59:00.264621+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('d2b390c1-c6c6-50e9-af03-949272a82e1a', '5b7edb81-4b91-598d-85a1-3f4a79e1ecef', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '假设有抽象类Animal，其子类Dog不是抽象类，则Dog必须做什么？', 'choice', '["A. 覆盖Animal中所有抽象方法", "B. 覆盖Animal中所有方法", "C. 可以只覆盖部分抽象方法", "D. 不需要做任何特殊处理"]', 'A', '非抽象子类必须实现父类中所有的抽象方法，否则编译器会报错。选项A正确。', 'easy', NULL, NULL, '抽象类与抽象方法', '2026-07-05T11:59:00.264621+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('a7692c3b-f348-5839-b0a0-1f4abad356e2', '5b7edb81-4b91-598d-85a1-3f4a79e1ecef', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '下列代码是否能通过编译？
abstract class A {
    public abstract void show();
}
class B extends A {
    public void show() {}
}', 'choice', '["A. 能通过编译", "B. 不能通过编译，因为A是抽象类", "C. 不能通过编译，因为B没有声明为抽象类", "D. 不能通过编译，因为show方法没有返回值"]', 'A', 'B类实现了父类A中的所有抽象方法（show），因此可以正常编译。抽象类A不能实例化，但子类B可以实例化。', 'easy', NULL, NULL, '抽象类与抽象方法', '2026-07-05T11:59:00.264621+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('16dd5c72-3fa9-5013-b6e3-820f7180ffd9', '5b7edb81-4b91-598d-85a1-3f4a79e1ecef', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '关于抽象类与接口的区别，下列哪项描述是错误的？', 'choice', '["A. 抽象类可以有构造方法，接口不能有构造方法", "B. 抽象类可以包含成员变量，接口只能包含常量", "C. 一个类可以同时实现多个接口，但只能继承一个抽象类", "D. 抽象类中的方法默认都是public的"]', 'D', '抽象类中的方法默认是默认访问权限（package-private），不是public。接口中的方法默认是public abstract。其他选项正确。', 'easy', NULL, NULL, '抽象类与抽象方法', '2026-07-05T11:59:00.264621+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('6e5ca513-114d-5501-839a-7f803704f0a2', '5b7edb81-4b91-598d-85a1-3f4a79e1ecef', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '抽象类不能包含构造方法。', 'choice', '["A. 正确", "B. 错误"]', 'B', '抽象类可以包含构造方法，虽然不能直接实例化，但构造方法可以在子类实例化时被调用，用于初始化父类的成员变量。', 'easy', NULL, NULL, '抽象类与抽象方法', '2026-07-05T11:59:00.264621+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('0c758655-8e04-5ee7-8b97-48a888f3961d', '5b7edb81-4b91-598d-85a1-3f4a79e1ecef', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '如果一个类中有一个抽象方法，那么这个类必须被声明为抽象类。', 'choice', '["A. 正确", "B. 错误"]', 'A', '如果一个类包含抽象方法，则该类必须用abstract修饰，否则编译错误。抽象方法只能存在于抽象类中。', 'easy', NULL, NULL, '抽象类与抽象方法', '2026-07-05T11:59:00.264621+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('a71b6fd0-57fe-593f-8663-c6665aa6965e', '5b7edb81-4b91-598d-85a1-3f4a79e1ecef', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '抽象方法可以被声明为static。', 'choice', '["A. 正确", "B. 错误"]', 'B', 'static方法属于类，可以被直接调用，而抽象方法需要子类重写，两者矛盾，因此abstract和static不能同时使用。', 'easy', NULL, NULL, '抽象类与抽象方法', '2026-07-05T11:59:00.264621+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('d445afaa-a181-55fd-a549-64be1e96b34b', '5b7edb81-4b91-598d-85a1-3f4a79e1ecef', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '抽象类中的具体方法可以被继承和重写。', 'choice', '["A. 正确", "B. 错误"]', 'A', '抽象类中的具体方法与普通类中的方法一样，可以被子类继承，也可以被子类重写。', 'easy', NULL, NULL, '抽象类与抽象方法', '2026-07-05T11:59:00.264621+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('c625d256-b42a-573a-9e2e-18cd73a11e81', '5b7edb81-4b91-598d-85a1-3f4a79e1ecef', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', 'final类可以继承抽象类。', 'choice', '["A. 正确", "B. 错误"]', 'B', 'final类不能被继承，因此无法继承抽象类，也无法实现抽象方法，所以final类不能继承抽象类。', 'easy', NULL, NULL, '抽象类与抽象方法', '2026-07-05T11:59:00.264621+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('7dc78afa-5e50-5717-9471-3f7cedb10a0a', '3671f83e-25d6-55a4-95b1-d0ab3cf3aea5', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', 'Java中所有异常和错误的顶级父类是哪个类？', 'choice', '["A. Exception", "B. Error", "C. Throwable", "D. RuntimeException"]', 'C', 'Throwable是Java中所有异常和错误的父类，它有两个主要子类：Error和Exception。Exception又分为运行时异常（RuntimeException）和其他检查型异常。', 'easy', NULL, NULL, '异常的概念与分类', '2026-07-05T11:59:02.207269+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('fa0feadb-0fd9-5d9e-a143-410a015c3554', '3671f83e-25d6-55a4-95b1-d0ab3cf3aea5', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '以下哪个属于检查型异常（Checked Exception）？', 'choice', '["A. NullPointerException", "B. ArrayIndexOutOfBoundsException", "C. IOException", "D. ArithmeticException"]', 'C', 'IOException是检查型异常，编译时必须处理。NullPointerException、ArrayIndexOutOfBoundsException和ArithmeticException都是运行时异常（RuntimeException），属于非检查型异常。', 'easy', NULL, NULL, '异常的概念与分类', '2026-07-05T11:59:02.207269+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('a7344514-3ab3-5fa3-8d08-6d48ef4af627', '3671f83e-25d6-55a4-95b1-d0ab3cf3aea5', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '下列哪种异常属于Error类型？', 'choice', '["A. ClassNotFoundException", "B. OutOfMemoryError", "C. FileNotFoundException", "D. NumberFormatException"]', 'B', 'OutOfMemoryError是Error的子类，表示系统级错误，通常无法恢复。ClassNotFoundException和FileNotFoundException是检查型异常，NumberFormatException是运行时异常。', 'easy', NULL, NULL, '异常的概念与分类', '2026-07-05T11:59:02.207269+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('726951b0-9437-5ffd-a0c1-510a16a04971', '3671f83e-25d6-55a4-95b1-d0ab3cf3aea5', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '关于运行时异常（RuntimeException）的描述，正确的是？', 'choice', '["A. 编译时必须使用try-catch处理", "B. 必须通过throws声明抛出", "C. 编译时不需要强制处理", "D. 只能由JVM自动抛出"]', 'C', '运行时异常（RuntimeException）属于非检查型异常，编译时不需要强制处理（try-catch或throws）。虽然不强制，但可以在运行时捕获处理。', 'easy', NULL, NULL, '异常的概念与分类', '2026-07-05T11:59:02.207269+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('cfb64014-0ed3-5818-ad07-ece1ef7c5320', '1f7997c3-dc08-5706-ad07-8db742cf3481', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', 'ArrayList的底层数据结构是什么？', 'choice', '["A. 双向链表", "B. 动态数组", "C. 哈希表", "D. 红黑树"]', 'B', 'ArrayList基于动态数组实现，支持高效的随机访问，但插入和删除（非尾部）需要移动元素。', 'easy', NULL, NULL, 'Collection接口与List实现', '2026-07-05T11:59:04.747188+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('d9a140ef-bb64-5009-a02d-14b99ab87dbb', '3671f83e-25d6-55a4-95b1-d0ab3cf3aea5', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '当方法内部抛出一个检查型异常且不捕获时，方法签名中必须包含什么？', 'choice', '["A. finally块", "B. throws子句", "C. throw语句", "D. return语句"]', 'B', '如果方法内部抛出一个检查型异常且不捕获，则必须在方法签名中使用throws子句声明该异常，以便调用者处理。', 'easy', NULL, NULL, '异常的概念与分类', '2026-07-05T11:59:02.207269+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('d96d928a-55a2-5cc6-8d9c-cf3fe6509429', '3671f83e-25d6-55a4-95b1-d0ab3cf3aea5', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '所有的RuntimeException都是检查型异常。', 'choice', '["A. 正确", "B. 错误"]', 'B', 'RuntimeException及其子类属于非检查型异常，编译时不需要强制处理。检查型异常是指Exception中除了RuntimeException及其子类以外的异常。', 'easy', NULL, NULL, '异常的概念与分类', '2026-07-05T11:59:02.207269+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('c670013f-959e-5313-a970-6477b5fc4f77', '3671f83e-25d6-55a4-95b1-d0ab3cf3aea5', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', 'Error类表示程序无法恢复的严重错误，通常不需要捕获。', 'choice', '["A. 正确", "B. 错误"]', 'A', 'Error表示系统级错误，如OutOfMemoryError、StackOverflowError等，程序通常无法恢复，一般不捕获处理。', 'easy', NULL, NULL, '异常的概念与分类', '2026-07-05T11:59:02.207269+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('656a626c-782e-538d-a816-c2bbc352ee71', '3671f83e-25d6-55a4-95b1-d0ab3cf3aea5', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', 'try-catch块中，finally块无论是否发生异常都会执行。', 'choice', '["A. 正确", "B. 错误"]', 'A', 'finally块通常用于释放资源，无论try块中是否发生异常，finally块都会执行（除非JVM提前退出）。', 'easy', NULL, NULL, '异常的概念与分类', '2026-07-05T11:59:02.207269+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('c4570f03-0d67-5b5e-ac1a-463618046ea9', '3671f83e-25d6-55a4-95b1-d0ab3cf3aea5', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', 'ArrayIndexOutOfBoundsException属于检查型异常。', 'choice', '["A. 正确", "B. 错误"]', 'B', 'ArrayIndexOutOfBoundsException是RuntimeException的子类，属于非检查型异常，编译时不需要强制处理。', 'easy', NULL, NULL, '异常的概念与分类', '2026-07-05T11:59:02.207269+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('1743fe3f-6d57-5319-90db-438760b39419', '3671f83e-25d6-55a4-95b1-d0ab3cf3aea5', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '多个catch块可以捕获同一类型的异常，但只有第一个匹配的catch块会执行。', 'choice', '["A. 正确", "B. 错误"]', 'B', '多个catch块不能捕获同一异常类型（编译报错），因为第一个catch块已经处理了该类型，后续catch块不可达。', 'easy', NULL, NULL, 'try-catch-finally机制', '2026-07-05T11:59:03.055537+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('fe4956cf-f37d-54a2-b464-be117ea48b36', '3671f83e-25d6-55a4-95b1-d0ab3cf3aea5', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '在try-catch-finally中，如果catch块中又抛出了异常，finally块仍然会执行。', 'choice', '["A. 正确", "B. 错误"]', 'A', '即使catch块中抛出新的异常，finally块仍然会在异常传播之前执行，确保资源释放。', 'easy', NULL, NULL, 'try-catch-finally机制', '2026-07-05T11:59:03.055537+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('dfe7eeb0-4679-5f8b-a504-80220e769893', '3671f83e-25d6-55a4-95b1-d0ab3cf3aea5', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', 'try-catch-finally可以嵌套使用，内层的异常可以被外层捕获。', 'choice', '["A. 正确", "B. 错误"]', 'A', 'try-catch-finally可以嵌套，内层未捕获的异常会向外层传播，被外层的catch块捕获。', 'easy', NULL, NULL, 'try-catch-finally机制', '2026-07-05T11:59:03.055537+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('e0883bb2-efdb-55e4-9d67-663090b487fb', '3671f83e-25d6-55a4-95b1-d0ab3cf3aea5', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '在Java中，finally块通常用于执行___操作，如关闭文件流或数据库连接。', 'fill', NULL, '资源清理', 'finally块保证无论是否发生异常都会执行，因此常用于释放系统资源，避免资源泄漏。', 'easy', NULL, NULL, 'try-catch-finally机制', '2026-07-05T11:59:03.055537+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('23281c31-5c01-5999-aa69-ebebd57caf93', '3671f83e-25d6-55a4-95b1-d0ab3cf3aea5', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '如果一个方法使用try-catch-finally处理异常，并且try块中有return语句，那么finally块会在___执行。', 'fill', NULL, 'return之前', 'finally块在方法返回前执行，即使try或catch块中有return语句，也会先执行finally再返回。', 'easy', NULL, NULL, 'try-catch-finally机制', '2026-07-05T11:59:03.055537+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('9d8b4fcb-368c-514b-91c6-748f322677d6', '3671f83e-25d6-55a4-95b1-d0ab3cf3aea5', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '下列代码的输出结果是：___
```java
try {
    System.out.print("A");
throw new RuntimeException();
} finally {
    System.out.print("B");
}
```', 'fill', NULL, 'AB', 'try块输出"A"后抛出异常，finally块在异常传播前执行，输出"B"，然后异常被抛出到调用者。', 'easy', NULL, NULL, 'try-catch-finally机制', '2026-07-05T11:59:03.055537+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('6a11368e-7c23-580c-a91a-55975a5a6033', '3671f83e-25d6-55a4-95b1-d0ab3cf3aea5', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '以下代码中，catch块捕获的异常类型是：___
```java
try {
    String s = null;
s.length();
} catch (NullPointerException e) {
    System.out.println("Null");
}
```', 'fill', NULL, 'NullPointerException', '对null对象调用方法会抛出NullPointerException，该异常被catch块捕获。', 'medium', NULL, NULL, 'try-catch-finally机制', '2026-07-05T11:59:03.055537+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('e65c33fb-c639-5512-91b0-adf6cd876ce0', '3671f83e-25d6-55a4-95b1-d0ab3cf3aea5', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', 'Java中，try-catch-finally结构中，如果try块和catch块都没有return，但finally块中有return，则方法的返回值由___决定。', 'fill', NULL, 'finally块', '如果finally块中有return语句，它会覆盖try或catch块中的返回值，方法最终返回finally块中的值。', 'medium', NULL, NULL, 'try-catch-finally机制', '2026-07-05T11:59:03.055537+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('4f41bd97-2169-56d2-8bed-e6c4fdbf0fe1', '3671f83e-25d6-55a4-95b1-d0ab3cf3aea5', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '阅读以下代码，分析输出结果并说明原因。
```java
public class Test {
    public static void main(String[] args) {
        System.out.println(test());
}
    public static int test() {
        int x = 10;
try {
            x = 20;
return x;
} catch (Exception e) {
            x = 30;
return x;
} finally {
            x = 40;
}
    }
}
```', 'coding', NULL, '输出结果为：20
解析：
1. try块中将x赋值为20，然后遇到return x，此时会将x的值20暂存为返回值。
2. 在执行return之前，会执行finally块，将x修改为40，但返回值仍然是之前暂存的20。
3. 方法返回20。', 'finally块在return之前执行，但不会改变已经暂存的返回值（基本类型按值传递）。因此最终返回的是try块中暂存的20。', 'medium', NULL, NULL, 'try-catch-finally机制', '2026-07-05T11:59:03.055537+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('c7ac9a15-c3c9-52aa-9dda-4fed1987227d', '3671f83e-25d6-55a4-95b1-d0ab3cf3aea5', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '编写一个方法，使用try-catch-finally从文件中读取第一行内容并返回，如果文件不存在则返回默认字符串"default"，并确保文件流正确关闭。', 'coding', NULL, '```java
import java.io.*;
public String readFirstLine(String filePath) {
    BufferedReader br = null;
try {
        br = new BufferedReader(new FileReader(filePath));
return br.readLine();
} catch (FileNotFoundException e) {
        return "default";
} catch (IOException e) {
        return "default";
} finally {
        if (br != null) {
            try {
                br.close();
} catch (IOException e) {
                // 记录日志
            }
        }
    }
}
```', '使用try块读取文件，捕获FileNotFoundException和IOException返回默认值，finally块中关闭BufferedReader，关闭时可能抛出IOException需要内部处理。', 'medium', NULL, NULL, 'try-catch-finally机制', '2026-07-05T11:59:03.055537+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('4487e86b-b61e-50f7-828f-2c6cbff4963a', '3671f83e-25d6-55a4-95b1-d0ab3cf3aea5', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '分析以下代码的运行结果，并解释为什么finally块中修改的变量没有影响返回值。
```java
public class Demo {
    public static void main(String[] args) {
        System.out.println(getValue());
}
    public static int getValue() {
        int i = 1;
try {
            i = 2;
return i;
} catch (Exception e) {
            i = 3;
return i;
} finally {
            i = 4;
System.out.println("finally: " + i);
}
    }
}
```', 'coding', NULL, '运行结果：
finally: 4
2
解析：
1. try块中i赋值为2，遇到return i，暂存返回值2。
2. 执行finally块，i赋值为4，输出"finally: 4"。
3. 方法返回暂存的2。
注意：finally块中的i=4修改的是局部变量i，但返回值已经暂存为2，不受影响。', '基本类型作为返回值时，在return语句执行前会暂存值，finally块对变量的修改不影响已暂存的值。', 'medium', NULL, NULL, 'try-catch-finally机制', '2026-07-05T11:59:03.326122+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('78450f1e-08c9-532d-9330-b46f3b9ac31e', '3671f83e-25d6-55a4-95b1-d0ab3cf3aea5', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '以下代码中，如果输入的数字为0，请写出输出结果并解释异常处理流程。
```java
import java.util.Scanner;
public class Divide {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
try {
            int a = 10;
int b = sc.nextInt();
int result = a / b;
System.out.println("Result: " + result);
} catch (ArithmeticException e) {
            System.out.println("除数不能为0");
} catch (Exception e) {
            System.out.println("其他异常");
} finally {
            sc.close();
System.out.println("资源已释放");
}
    }
}
```', 'coding', NULL, '输入0时输出：
除数不能为0
资源已释放
解析：
1. 用户输入0，执行a/b时抛出ArithmeticException（除零异常）。
2. 第一个catch块捕获ArithmeticException，输出"除数不能为0"。
3. 执行finally块，关闭Scanner并输出"资源已释放"。', '除零异常由ArithmeticException捕获，finally块保证资源释放，无论是否发生异常。', 'medium', NULL, NULL, 'try-catch-finally机制', '2026-07-05T11:59:03.326122+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('6e72add3-1554-56f6-bdd7-4ce78120bb26', '3671f83e-25d6-55a4-95b1-d0ab3cf3aea5', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '设计一个方法，尝试将字符串转换为整数，如果转换失败则返回-1，并确保任何情况下都输出"操作完成"，请用try-catch-finally实现。', 'coding', NULL, '```java
public int parseToInt(String str) {
    try {
        return Integer.parseInt(str);
} catch (NumberFormatException e) {
        return -1;
} finally {
        System.out.println("操作完成");
}
}
```
测试：
- 输入"123"，返回123，输出"操作完成"
- 输入"abc"，返回-1，输出"操作完成"', 'Integer.parseInt可能抛出NumberFormatException，catch块返回-1，finally块始终输出"操作完成"，符合要求。', 'medium', NULL, NULL, 'try-catch-finally机制', '2026-07-05T11:59:03.326122+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('517c38fe-879d-57f9-8d1f-4138b8e96602', '3671f83e-25d6-55a4-95b1-d0ab3cf3aea5', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '在Java中，使用哪个关键字可以在方法内部显式地抛出一个异常对象？', 'choice', '["A. throws", "B. throw", "C. try", "D. catch"]', 'B', 'throw关键字用于在方法内部显式地抛出一个异常实例，而throws用于在方法声明中声明可能抛出的异常类型。try和catch分别用于捕获和处理异常。', 'medium', NULL, NULL, 'throw与throws关键字', '2026-07-05T11:59:03.326122+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('52f600f6-b15b-512b-918c-708f15e451b9', '3671f83e-25d6-55a4-95b1-d0ab3cf3aea5', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '下列关于throws关键字的说法，正确的是？', 'choice', '["A. throws用于在方法内部抛出异常", "B. throws用于捕获异常", "C. throws用于在方法声明中声明可能抛出的异常类型", "D. throws用于终止程序"]', 'C', 'throws关键字用于在方法声明中声明该方法可能抛出的异常类型，提醒调用者处理。throw用于在方法内部抛出异常实例。catch用于捕获异常。throws不直接终止程序。', 'medium', NULL, NULL, 'throw与throws关键字', '2026-07-05T11:59:03.326122+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('92a5de55-39bd-5f39-b5a5-1a3c5959704d', '3671f83e-25d6-55a4-95b1-d0ab3cf3aea5', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '以下代码中，方法test()声明了抛出IOException，调用者应该如何处理？
public void test() throws IOException { ... }', 'choice', '["A. 必须使用try-catch捕获，或继续用throws声明", "B. 不需要任何处理", "C. 只能使用try-catch捕获，不能继续抛出", "D. 只能继续用throws声明，不能捕获"]', 'A', '如果方法声明了throws IOException，调用者必须处理该异常，要么使用try-catch捕获，要么在调用方法的方法声明中继续使用throws抛出。这是Java编译时检查的要求。', 'medium', NULL, NULL, 'throw与throws关键字', '2026-07-05T11:59:03.326122+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('7983bb43-03ef-5353-8837-6d25c274ce9e', '3671f83e-25d6-55a4-95b1-d0ab3cf3aea5', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', 'throw关键字后面必须跟一个异常类的实例，而不能是异常类的类型。', 'choice', '["A. 正确", "B. 错误"]', 'A', 'throw用于抛出具体的异常对象，因此必须是一个异常类的实例，例如 throw new Exception()，而不能是 throw Exception.class。', 'medium', NULL, NULL, 'throw与throws关键字', '2026-07-05T11:59:03.326122+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('69680a1d-c474-507f-88b5-8913fb0f0726', '3671f83e-25d6-55a4-95b1-d0ab3cf3aea5', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', 'throws关键字可以同时声明多个异常类型，用逗号分隔。', 'choice', '["A. 正确", "B. 错误"]', 'A', 'throws关键字允许声明多个异常类型，例如 public void method() throws IOException, SQLException {}，各异常类型之间用逗号分隔。', 'medium', NULL, NULL, 'throw与throws关键字', '2026-07-05T11:59:03.326122+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('bc37b8c0-87aa-58be-a479-7897854ef916', '3671f83e-25d6-55a4-95b1-d0ab3cf3aea5', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '在Java异常处理中，___用于在方法内部抛出异常实例，而___用于在方法声明中声明可能抛出的异常类型。', 'fill', NULL, 'throw; throws', 'throw用于在方法内部抛出异常对象，throws用于在方法声明中声明可能抛出的异常类型，以提醒调用者处理。', 'medium', NULL, NULL, 'throw与throws关键字', '2026-07-05T11:59:03.326122+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('9b98efa1-f80a-5714-ba3d-d7fd0779a2b6', '3671f83e-25d6-55a4-95b1-d0ab3cf3aea5', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '自定义异常类中必须重写getMessage()方法。', 'choice', '["A. 正确", "B. 错误"]', 'B', 'getMessage()方法已在Throwable类中实现，自定义异常可以直接继承使用，无需强制重写。', 'hard', NULL, NULL, '自定义异常', '2026-07-05T11:59:04.18072+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('43d79166-24e7-5f8c-9d13-d5ccb40e9ca8', '3671f83e-25d6-55a4-95b1-d0ab3cf3aea5', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', 'throws关键字用于方法内部抛出自定义异常实例。', 'choice', '["A. 正确", "B. 错误"]', 'B', 'throws用于方法声明，表示该方法可能抛出某种异常；throw用于方法内部实际抛出异常实例。', 'hard', NULL, NULL, '自定义异常', '2026-07-05T11:59:04.18072+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('eca0bccf-5ff6-5032-86d5-0593929ee2ae', '3671f83e-25d6-55a4-95b1-d0ab3cf3aea5', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '自定义异常可以用来封装特定的业务错误信息，便于调用者区分错误类型。', 'choice', '["A. 正确", "B. 错误"]', 'A', '这是自定义异常的主要用途之一，通过不同的异常类区分不同的业务错误，使错误处理更精确。', 'hard', NULL, NULL, '自定义异常', '2026-07-05T11:59:04.18072+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('4d936221-bf58-5dbe-91ee-b39cf2f3cfa5', '3671f83e-25d6-55a4-95b1-d0ab3cf3aea5', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '自定义异常类通常继承____（用于检查型异常）或____（用于非检查型异常）。', 'fill', NULL, 'Exception, RuntimeException', 'Exception用于检查型异常，RuntimeException用于非检查型异常，两者都是Throwable的子类。', 'hard', NULL, NULL, '自定义异常', '2026-07-05T11:59:04.18072+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('ddbcdfbd-6208-5fb4-a8aa-207a66a3171c', '3671f83e-25d6-55a4-95b1-d0ab3cf3aea5', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '在方法声明中使用____关键字声明可能抛出的自定义异常，在方法体内使用____关键字抛出异常实例。', 'fill', NULL, 'throws, throw', 'throws声明异常类型，throw抛出具体异常对象，两者配合使用。', 'hard', NULL, NULL, '自定义异常', '2026-07-05T11:59:04.18072+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('867b3ca9-c4af-531d-b9cc-e7d9c29e72a0', '3671f83e-25d6-55a4-95b1-d0ab3cf3aea5', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '自定义异常类中，通常通过调用父类构造方法传递____和____两个参数。', 'fill', NULL, 'message, cause', 'message是错误描述，cause是原始异常原因，通过super(message, cause)传递给父类。', 'hard', NULL, NULL, '自定义异常', '2026-07-05T11:59:04.18072+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('153a9799-9b73-5510-a45c-5bbbc1f593be', '3671f83e-25d6-55a4-95b1-d0ab3cf3aea5', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '若希望自定义异常为运行时异常且不强制处理，应继承____类。', 'fill', NULL, 'RuntimeException', 'RuntimeException及其子类是非检查型异常，编译器不强制捕获或声明。', 'hard', NULL, NULL, '自定义异常', '2026-07-05T11:59:04.18072+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('0e65495d-574a-5625-a97a-03d403c270de', '3671f83e-25d6-55a4-95b1-d0ab3cf3aea5', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', 'Java异常体系中的根类是____。', 'fill', NULL, 'Throwable', 'Throwable是所有异常和错误的直接或间接父类，包含Error和Exception两大分支。', 'hard', NULL, NULL, '自定义异常', '2026-07-05T11:59:04.18072+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('1f5bcb37-509c-534b-98a4-68b954ae22da', '1f7997c3-dc08-5706-ad07-8db742cf3481', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', 'LinkedList的插入操作（在链表中间）的时间复杂度是多少？', 'choice', '["A. O(1)", "B. O(log n)", "C. O(n)", "D. O(n^2)"]', 'A', 'LinkedList基于双向链表实现，插入操作只需修改前后节点的引用，时间复杂度为O(1)。注意：如果已经持有要插入位置的节点引用，则插入为O(1)；若需要先查找位置，则查找为O(n)。', 'easy', NULL, NULL, 'Collection接口与List实现', '2026-07-05T11:59:04.747188+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('e1ac9a63-bb1e-54da-b0a0-0c2d9d67dd8d', '3671f83e-25d6-55a4-95b1-d0ab3cf3aea5', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '编写一个自定义异常类InsufficientBalanceException，表示账户余额不足。要求：继承RuntimeException；包含两个构造方法（无参和带String message）；编写一个银行账户类BankAccount，包含取款方法withdraw(double amount)，当余额不足时抛出该异常。最后在main方法中测试，捕获并处理异常。', 'coding', NULL, '// 自定义异常类
public class InsufficientBalanceException extends RuntimeException {
    public InsufficientBalanceException() {
        super();
}
    public InsufficientBalanceException(String message) {
        super(message);
}
}

// 银行账户类
public class BankAccount {
    private double balance;
public BankAccount(double balance) {
        this.balance = balance;
}
    public void withdraw(double amount) {
        if (amount > balance) {
            throw new InsufficientBalanceException("余额不足，当前余额：" + balance + "，取款金额：" + amount);
}
        balance -= amount;
System.out.println("取款成功，剩余余额：" + balance);
}
}

// 测试类
public class Test {
    public static void main(String[] args) {
        BankAccount account = new BankAccount(1000);
try {
            account.withdraw(1500);
} catch (InsufficientBalanceException e) {
            System.out.println("捕获异常：" + e.getMessage());
}
    }
}', '首先定义继承RuntimeException的自定义异常类，提供两个构造方法方便使用。BankAccount类中withdraw方法检查余额，不足时throw异常。main方法中try-catch捕获并输出错误信息，体现了自定义异常在业务逻辑中的应用。', 'hard', NULL, NULL, '自定义异常', '2026-07-05T11:59:04.18072+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('1fe4bd79-5224-5ff4-a2fb-9d3f93c77170', '3671f83e-25d6-55a4-95b1-d0ab3cf3aea5', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '设计一个自定义检查型异常AgeOutOfRangeException，表示年龄超出合法范围（0-150）。编写一个Person类，包含设置年龄的方法setAge(int age)，当年龄不合法时抛出该异常。在main方法中调用setAge并处理异常。要求异常类包含带String message和Throwable cause的构造方法。', 'coding', NULL, '// 自定义检查型异常
public class AgeOutOfRangeException extends Exception {
    public AgeOutOfRangeException(String message) {
        super(message);
}
    public AgeOutOfRangeException(String message, Throwable cause) {
        super(message, cause);
}
}

// Person类
public class Person {
    private int age;
public void setAge(int age) throws AgeOutOfRangeException {
        if (age < 0 || age > 150) {
            throw new AgeOutOfRangeException("年龄不合法：" + age);
}
        this.age = age;
System.out.println("年龄设置成功：" + age);
}
}

// 测试类
public class Test {
    public static void main(String[] args) {
        Person p = new Person();
try {
            p.setAge(200);
} catch (AgeOutOfRangeException e) {
            System.out.println("捕获异常：" + e.getMessage());
e.printStackTrace();
}
    }
}', '继承Exception使其成为检查型异常，必须处理。构造方法传递message和cause，便于追踪错误链。setAge方法声明throws，当年龄不合法时throw异常。main方法中try-catch捕获并打印信息，符合强制处理的要求。', 'hard', NULL, NULL, '自定义异常', '2026-07-05T11:59:04.18072+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('f33d985f-ccaa-5342-afd6-3e10508a0254', '3671f83e-25d6-55a4-95b1-d0ab3cf3aea5', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '现有业务需求：用户注册时用户名不能为空且长度不能超过20。请自定义一个非检查型异常InvalidUsernameException，包含一个错误码属性int errorCode。编写注册服务类RegisterService，提供register(String username)方法，校验失败时抛出异常，并设置不同的错误码（1表示空，2表示超长）。在main方法中捕获异常并输出错误码和错误信息。', 'coding', NULL, '// 自定义异常
public class InvalidUsernameException extends RuntimeException {
    private int errorCode;
public InvalidUsernameException(int errorCode, String message) {
        super(message);
this.errorCode = errorCode;
}
    public int getErrorCode() {
        return errorCode;
}
}

// 注册服务
public class RegisterService {
    public void register(String username) {
        if (username == null || username.isEmpty()) {
            throw new InvalidUsernameException(1, "用户名不能为空");
}
        if (username.length() > 20) {
            throw new InvalidUsernameException(2, "用户名长度不能超过20");
}
        System.out.println("注册成功，用户名：" + username);
}
}

// 测试类
public class Test {
    public static void main(String[] args) {
        RegisterService service = new RegisterService();
try {
            service.register("");
} catch (InvalidUsernameException e) {
            System.out.println("错误码：" + e.getErrorCode() + ", 错误信息：" + e.getMessage());
}
    }
}', '自定义异常中增加errorCode属性，通过构造方法赋值并添加getter。RegisterService根据不同的校验失败原因设置不同的错误码并抛出。main中捕获后通过getErrorCode()获取错误码，实现更精细的错误区分。', 'hard', NULL, NULL, '自定义异常', '2026-07-05T11:59:04.455471+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('abd806ea-30b4-5868-a91b-50e1531ab755', '3671f83e-25d6-55a4-95b1-d0ab3cf3aea5', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '某系统要求：当用户尝试访问未授权的资源时，抛出UnAuthorizedException（检查型异常），异常类需包含资源路径和用户角色信息。请完整实现该异常类，并编写一个访问控制类AccessController，包含方法checkAccess(String resource, String role)，若角色不是"admin"则抛出异常。在main方法中测试，捕获异常并打印详细信息。', 'coding', NULL, '// 自定义检查型异常
public class UnAuthorizedException extends Exception {
    private String resource;
private String role;
public UnAuthorizedException(String resource, String role, String message) {
        super(message);
this.resource = resource;
this.role = role;
}
    public String getResource() { return resource; }
    public String getRole() { return role; }
}

// 访问控制类
public class AccessController {
    public void checkAccess(String resource, String role) throws UnAuthorizedException {
        if (!"admin".equals(role)) {
            throw new UnAuthorizedException(resource, role, 
                "访问被拒绝：用户角色[" + role + "]无权访问资源[" + resource + "]");
}
        System.out.println("访问授权成功：" + resource);
}
}

// 测试类
public class Test {
    public static void main(String[] args) {
        AccessController ac = new AccessController();
try {
            ac.checkAccess("/admin/config", "user");
} catch (UnAuthorizedException e) {
            System.out.println("异常信息：" + e.getMessage());
System.out.println("资源：" + e.getResource() + ", 角色：" + e.getRole());
}
    }
}', 'UnAuthorizedException继承Exception，增加resource和role字段，构造方法初始化并调用super。checkAccess方法根据角色判断，失败时抛出异常，填充详细信息。main中捕获后通过getter获取额外信息，实现完整的异常处理。', 'hard', NULL, NULL, '自定义异常', '2026-07-05T11:59:04.455471+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('a4e42039-dcb8-5ae2-b9f4-8f139f9a05bd', '1f7997c3-dc08-5706-ad07-8db742cf3481', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '以下哪个接口是Java集合框架的根接口？', 'choice', '["A. List", "B. Collection", "C. Set", "D. Map"]', 'B', 'Collection接口是集合框架的根接口，定义了集合的基本操作。List、Set等都是它的子接口，Map是独立的接口，不属于Collection体系。', 'easy', NULL, NULL, 'Collection接口与List实现', '2026-07-05T11:59:04.747188+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('59f77cb3-8c97-5d78-93ee-4d5cd3b1ae77', '1f7997c3-dc08-5706-ad07-8db742cf3481', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', 'List接口中哪个方法用于获取指定索引处的元素？', 'choice', '["A. add(int index, E element)", "B. remove(int index)", "C. get(int index)", "D. set(int index, E element)"]', 'C', 'get(int index)是List接口中专门用于根据索引获取元素的方法，返回该索引位置的元素。', 'easy', NULL, NULL, 'Collection接口与List实现', '2026-07-05T11:59:04.747188+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('b8bc965f-fe6f-538e-9bdf-7be6dce6da3a', '1f7997c3-dc08-5706-ad07-8db742cf3481', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', 'TreeSet的add操作时间复杂度为O(1)。', 'choice', '["A. 正确", "B. 错误"]', 'B', 'TreeSet基于红黑树，add操作的时间复杂度为O(log n)，而不是O(1)。O(1)是HashSet在理想情况下的性能。', 'easy', NULL, NULL, 'Set接口与HashSet/TreeSet', '2026-07-05T11:59:05.591441+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('8d6476ee-70b3-59a7-be36-2582ab61a294', '1f7997c3-dc08-5706-ad07-8db742cf3481', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', 'HashSet判断元素重复时，先调用___方法，若相同再调用___方法。', 'fill', NULL, 'hashCode, equals', 'HashSet先通过hashCode()确定存储位置，如果该位置已有元素，再使用equals()比较内容是否相同。', 'easy', NULL, NULL, 'Set接口与HashSet/TreeSet', '2026-07-05T11:59:05.591441+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('ee451d95-434f-59c8-9897-678fa1fe0e0e', '1f7997c3-dc08-5706-ad07-8db742cf3481', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', 'TreeSet不允许添加___元素（从Java 7开始）。', 'fill', NULL, 'null', '因为TreeSet需要比较元素进行排序，而null无法与任何对象比较，所以从Java 7开始TreeSet不允许添加null。', 'easy', NULL, NULL, 'Set接口与HashSet/TreeSet', '2026-07-05T11:59:05.591441+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('67236aed-adfc-58f7-8748-6dfb100ed836', '1f7997c3-dc08-5706-ad07-8db742cf3481', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', 'Set接口中，用于向集合添加元素的方法是___。', 'fill', NULL, 'add', 'Set继承自Collection，添加元素使用add(E e)方法，如果元素已存在则返回false。', 'medium', NULL, NULL, 'Set接口与HashSet/TreeSet', '2026-07-05T11:59:05.591441+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('dd3ed959-e444-5515-8766-889eb34f681f', '1f7997c3-dc08-5706-ad07-8db742cf3481', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '若希望HashSet中的元素按插入顺序迭代，应使用___类。', 'fill', NULL, 'LinkedHashSet', 'LinkedHashSet是HashSet的子类，它在哈希表的基础上维护了一个双向链表，从而保证迭代顺序与插入顺序一致。', 'medium', NULL, NULL, 'Set接口与HashSet/TreeSet', '2026-07-05T11:59:05.591441+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('cf36c799-cf9c-5f3d-a689-708e19523213', '1f7997c3-dc08-5706-ad07-8db742cf3481', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', 'TreeSet底层基于___数据结构实现。', 'fill', NULL, '红黑树', 'TreeSet通过TreeMap实现，而TreeMap底层是红黑树（一种自平衡二叉查找树）。', 'medium', NULL, NULL, 'Set接口与HashSet/TreeSet', '2026-07-05T11:59:05.591441+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('69df6680-f918-548d-9c7c-a618a1c46bbd', '1f7997c3-dc08-5706-ad07-8db742cf3481', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '编写一个方法，接收一个整数数组，使用HashSet去除重复元素，并返回不重复元素的数量。请写出完整代码。', 'coding', NULL, 'public static int countUnique(int[] arr) {
    Set<Integer> set = new HashSet<>();
for (int num : arr) {
        set.add(num);
}
    return set.size();
}', '利用HashSet元素唯一的特性，遍历数组将每个整数添加到set中，重复元素会自动被忽略，最后返回set的大小即为不重复元素的数量。', 'medium', NULL, NULL, 'Set接口与HashSet/TreeSet', '2026-07-05T11:59:05.591441+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('5929b3a2-7a75-5541-985f-047946883068', '1f7997c3-dc08-5706-ad07-8db742cf3481', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '现有Student类，包含name和score属性。请使用TreeSet对学生对象按score升序排序，并输出所有学生信息。要求：Student类需实现Comparable接口。', 'coding', NULL, 'class Student implements Comparable<Student> {
    private String name;
private int score;
public Student(String name, int score) { this.name = name; this.score = score; }
    @Override
    public int compareTo(Student o) { return this.score - o.score; }
    @Override
    public String toString() { return name + ":" + score; }
}

public class Main {
    public static void main(String[] args) {
        TreeSet<Student> set = new TreeSet<>();
set.add(new Student("Alice", 85));
set.add(new Student("Bob", 92));
set.add(new Student("Charlie", 78));
for (Student s : set) {
            System.out.println(s);
}
    }
}', 'Student实现Comparable接口，重写compareTo方法按score升序排列。TreeSet会自动排序，迭代输出即为升序结果。注意：若score相同，TreeSet会视为重复元素（取决于compareTo返回0），实际应用中可能需要额外比较字段。', 'medium', NULL, NULL, 'Set接口与HashSet/TreeSet', '2026-07-05T11:59:05.591441+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('a18aae4b-b784-5a9f-b777-182704cd239a', '1f7997c3-dc08-5706-ad07-8db742cf3481', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '分析以下代码输出结果，并解释原因。
Set<String> set = new HashSet<>();
set.add("Java");
set.add("Python");
set.add("Java");
System.out.println(set.size());', 'coding', NULL, '输出结果为2。', 'HashSet不允许重复元素，第二次添加"Java"时，由于"Java"已存在，add方法返回false，集合中仍然只有"Java"和"Python"两个元素，因此size为2。', 'medium', NULL, NULL, 'Set接口与HashSet/TreeSet', '2026-07-05T11:59:05.591441+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('867aa6f9-7dab-531e-9a40-2bc8dc76aea8', '1f7997c3-dc08-5706-ad07-8db742cf3481', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '请比较HashSet和TreeSet在元素存储、顺序、性能、null值处理方面的区别。', 'coding', NULL, 'HashSet：基于哈希表，元素无序，增删查平均O(1)，允许一个null；TreeSet：基于红黑树，元素按自然顺序或Comparator排序，增删查O(log n)，不允许null（Java 7+）。', '两者的核心区别在于底层数据结构不同导致顺序和性能差异。HashSet适合不要求顺序且追求速度的场景；TreeSet适合需要有序集合的场景。', 'medium', NULL, NULL, 'Set接口与HashSet/TreeSet', '2026-07-05T11:59:05.591441+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('4ba4ad59-e1b4-58ff-af25-1e00157dcccb', '1f7997c3-dc08-5706-ad07-8db742cf3481', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '编写一个程序，使用TreeSet存储以下整数：5, 3, 8, 1, 3, 9，并输出排序后的结果。要求：使用自定义Comparator实现降序排列。', 'coding', NULL, 'import java.util.*;
public class Main {
    public static void main(String[] args) {
        TreeSet<Integer> set = new TreeSet<>((a, b) -> b - a);
set.add(5); set.add(3); set.add(8); set.add(1); set.add(3); set.add(9);
for (Integer num : set) {
            System.out.print(num + " ");
}
    }
}
// 输出：9 8 5 3 1', '通过Lambda表达式传入Comparator实现降序，重复元素3只存储一次。TreeSet自动维护红黑树顺序，迭代输出即为降序结果。', 'medium', NULL, NULL, 'Set接口与HashSet/TreeSet', '2026-07-05T11:59:05.591441+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('9c65f9d3-3ce5-55a8-bce1-6d68f254a8be', '1f7997c3-dc08-5706-ad07-8db742cf3481', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '下列关于Map接口的描述，哪一项是正确的？', 'choice', '["A. Map接口继承自Collection接口", "B. Map中存储的是键值对，键可以重复，值必须唯一", "C. Map中键唯一，值可以重复", "D. Map中键和值都可以重复"]', 'C', 'Map接口不继承Collection接口，它存储键值对，其中键唯一，值可以重复。因此选项C正确。', 'medium', NULL, NULL, 'Map接口与HashMap/TreeMap', '2026-07-05T11:59:05.591441+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('fc55f640-7bd6-588d-a05f-e41dcef1db22', '1f7997c3-dc08-5706-ad07-8db742cf3481', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', 'Collections.synchronizedList()方法返回的线程安全列表，在多线程环境下可以完全避免并发问题。', 'choice', '["A. 正确", "B. 错误"]', 'B', 'synchronizedList()返回的列表每个方法都是同步的，但复合操作（如迭代）仍需要外部同步，否则可能出现并发修改异常。', 'hard', NULL, NULL, '泛型与集合工具类', '2026-07-05T11:59:06.421006+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('cd09afec-b0c7-5f41-8907-6dd0ea7ce18c', '1f7997c3-dc08-5706-ad07-8db742cf3481', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', 'Java泛型的核心原理是___，它在编译阶段将泛型信息擦除为原始类型。', 'fill', NULL, '类型擦除', '类型擦除（Type Erasure）是Java泛型实现的核心，编译时泛型参数被替换为它们的边界或Object，并插入必要的强制类型转换。', 'hard', NULL, NULL, '泛型与集合工具类', '2026-07-05T11:59:06.421006+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('28283a78-4eb0-5e79-8fef-b914bc5420c6', '1f7997c3-dc08-5706-ad07-8db742cf3481', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', 'Collections工具类中，用于返回一个不可修改的空列表的静态方法是___。', 'fill', NULL, 'emptyList()', 'Collections.emptyList()返回一个不可修改的空列表（类型为List<T>），常用于避免返回null。', 'hard', NULL, NULL, '泛型与集合工具类', '2026-07-05T11:59:06.421006+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('f095c8b7-7159-532e-88a3-78a9c8cb689a', '1f7997c3-dc08-5706-ad07-8db742cf3481', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '使用泛型通配符时，___表示集合只能读取元素（生产者），不能添加元素（除了null）。', 'fill', NULL, '? extends T', '? extends T是上界通配符，集合中的元素是T或T的子类，只能从中读取元素（赋值给T），不能添加元素，因为实际类型未知。', 'hard', NULL, NULL, '泛型与集合工具类', '2026-07-05T11:59:06.421006+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('6606aa72-d345-5204-95a3-bc86bf8e5242', '1f7997c3-dc08-5706-ad07-8db742cf3481', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', 'Collections.sort(List<T> list)要求T必须实现___接口，否则编译报错。', 'fill', NULL, 'Comparable', 'Collections.sort()的签名是public static <T extends Comparable<? super T>> void sort(List<T> list)，要求T实现Comparable接口。', 'hard', NULL, NULL, '泛型与集合工具类', '2026-07-05T11:59:06.421006+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('b01a66a5-e033-5aab-9de8-d5196e0a55fc', '1f7997c3-dc08-5706-ad07-8db742cf3481', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '若需要创建一个线程安全的List，可以使用Collections的___方法。', 'fill', NULL, 'synchronizedList()', 'Collections.synchronizedList(List<T> list)返回由指定列表支持的同步（线程安全）列表。', 'hard', NULL, NULL, '泛型与集合工具类', '2026-07-05T11:59:06.421006+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('ee4d1a48-4659-583b-b040-4bbaea7ec010', '1f7997c3-dc08-5706-ad07-8db742cf3481', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '编写一个泛型方法，实现将任意类型的数组转换为List（使用Collections工具类），并测试该方法。要求：方法签名public static <T> List<T> arrayToList(T[] arr)，如果数组为null则返回空列表。', 'coding', NULL, 'public static <T> List<T> arrayToList(T[] arr) {
    if (arr == null) {
        return Collections.emptyList();
}
    List<T> list = new ArrayList<>();
Collections.addAll(list, arr);
return list;
}

测试代码：
Integer[] intArr = {1, 2, 3};
List<Integer> intList = arrayToList(intArr);
System.out.println(intList); // 输出 [1, 2, 3]

String[] strArr = {"a", "b"};
List<String> strList = arrayToList(strArr);
System.out.println(strList); // 输出 [a, b]

// 测试null
List<Object> emptyList = arrayToList(null);
System.out.println(emptyList); // 输出 []', '该题考查泛型方法的定义和Collections工具类的使用。方法使用泛型T接受任意类型数组，利用Collections.addAll()将数组元素添加到新创建的ArrayList中。注意处理null数组返回空列表，使用Collections.emptyList()返回不可修改的空列表，避免返回null。', 'hard', NULL, NULL, '泛型与集合工具类', '2026-07-05T11:59:06.421006+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('98d90e2b-72d1-5372-9d22-84fcbbabef31', '1f7997c3-dc08-5706-ad07-8db742cf3481', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '使用Collections工具类对List<Student>进行排序，Student类包含name（String）和score（int）属性。要求：先按分数降序排序，分数相同则按姓名升序排序。请写出完整的Student类和排序代码。', 'coding', NULL, 'class Student {
    private String name;
private int score;
public Student(String name, int score) {
        this.name = name;
this.score = score;
}
    
    public String getName() { return name; }
    public int getScore() { return score; }
    
    @Override
    public String toString() {
        return name + ":" + score;
}
}

// 排序代码
List<Student> students = new ArrayList<>();
students.add(new Student("Alice", 90));
students.add(new Student("Bob", 85));
students.add(new Student("Charlie", 90));
Collections.sort(students, new Comparator<Student>() {
    @Override
    public int compare(Student s1, Student s2) {
        // 按分数降序
        int scoreCompare = Integer.compare(s2.getScore(), s1.getScore());
if (scoreCompare != 0) {
            return scoreCompare;
}
        // 分数相同按姓名升序
        return s1.getName().compareTo(s2.getName());
}
});
System.out.println(students); // 输出 [Alice:90, Charlie:90, Bob:85]', '本题考查Collections.sort()与Comparator的结合使用。由于需要自定义排序规则，使用Comparator接口。分数降序通过比较s2和s1的分数实现，姓名升序使用String的compareTo方法。注意泛型在Comparator中的使用。', 'hard', NULL, NULL, '泛型与集合工具类', '2026-07-05T11:59:06.421006+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('353c6ee4-c6a0-5426-899a-6bdc5bf2153e', '1f7997c3-dc08-5706-ad07-8db742cf3481', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '设计一个泛型类Box<T>，其中包含一个List<T>类型的成员变量，并提供add(T item)、get(int index)和sort()方法（使用Collections.sort()，要求T实现Comparable）。然后创建一个Box<Integer>并添加若干整数，调用sort()排序后输出。', 'coding', NULL, 'class Box<T extends Comparable<T>> {
    private List<T> items = new ArrayList<>();
public void add(T item) {
        items.add(item);
}
    
    public T get(int index) {
        return items.get(index);
}
    
    public void sort() {
        Collections.sort(items);
}
    
    @Override
    public String toString() {
        return items.toString();
}
}

// 测试
Box<Integer> integerBox = new Box<>();
integerBox.add(5);
integerBox.add(3);
integerBox.add(8);
