        try (BufferedInputStream bis = new BufferedInputStream(new FileInputStream("source.txt"));
             BufferedOutputStream bos = new BufferedOutputStream(new FileOutputStream("dest.txt"))) {
            byte[] buffer = new byte[4096];
            int len;
            while ((len = bis.read(buffer)) != -1) {
                bos.write(buffer, 0, len);
            }
            System.out.println("复制完成");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```
优势：缓冲流内部维护了8KB的缓冲区，减少了直接磁盘I/O的次数，从而提升了读写速度。', '通过BufferedInputStream和BufferedOutputStream包装文件流，可以利用缓冲区一次读取/写入多个字节，减少系统调用，提高效率。', 'medium', NULL, NULL, '缓冲流与对象流', '2026-07-05T11:59:48.86174+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('d2c1c2d6-e865-57e2-b6a6-2f610e0b34be', '4346bc9d-4bbf-5b56-a3e3-ba76b16f73da', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '请编写代码，使用对象流将自定义类Student（包含name和age字段）的实例写入文件student.dat，然后读取并打印该对象。要求处理异常并关闭流。', 'coding', NULL, '```java
import java.io.*;

class Student implements Serializable {
    private String name;
    private int age;
    
    public Student(String name, int age) {
        this.name = name;
        this.age = age;
    }
    
    public String toString() {
        return "Student{name=''" + name + "'', age=" + age + "}";
    }
}

public class ObjectStreamDemo {
    public static void main(String[] args) {
        Student stu = new Student("张三", 20);
        // 写入
        try (ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream("student.dat"))) {
            oos.writeObject(stu);
        } catch (IOException e) {
            e.printStackTrace();
        }
        // 读取
        try (ObjectInputStream ois = new ObjectInputStream(new FileInputStream("student.dat"))) {
            Student readStu = (Student) ois.readObject();
            System.out.println(readStu);
        } catch (IOException | ClassNotFoundException e) {
            e.printStackTrace();
        }
    }
}
```', 'Student类实现了Serializable接口以支持序列化。使用ObjectOutputStream写入对象，ObjectInputStream读取对象，注意类型转换和异常处理。', 'medium', NULL, NULL, '缓冲流与对象流', '2026-07-05T11:59:48.86174+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('3a615e33-6246-5cd7-9034-36aaee4c4365', '4346bc9d-4bbf-5b56-a3e3-ba76b16f73da', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '假设有一个类Employee，包含name、salary和transient String password三个字段。请说明transient关键字的作用，并编写代码验证序列化时password字段不会被保存。', 'coding', NULL, '```java
import java.io.*;

class Employee implements Serializable {
    private String name;
    private double salary;
    private transient String password;
    
    public Employee(String name, double salary, String password) {
        this.name = name;
        this.salary = salary;
        this.password = password;
    }
    
    public String toString() {
        return "Employee{name=''" + name + "'', salary=" + salary + ", password=''" + password + "''}";
    }
}

public class TransientDemo {
    public static void main(String[] args) {
        Employee emp = new Employee("李四", 8000, "secret123");
        try (ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream("employee.dat"))) {
            oos.writeObject(emp);
        } catch (IOException e) {
            e.printStackTrace();
        }
        try (ObjectInputStream ois = new ObjectInputStream(new FileInputStream("employee.dat"))) {
            Employee readEmp = (Employee) ois.readObject();
            System.out.println("反序列化后: " + readEmp);
            // 输出中password应为null
        } catch (IOException | ClassNotFoundException e) {
            e.printStackTrace();
        }
    }
}
```
输出结果中password字段为null，说明transient修饰的字段在序列化时被忽略。', 'transient关键字用于标记不需要序列化的字段，反序列化后该字段为默认值（对象为null，基本类型为0等）。', 'medium', NULL, NULL, '缓冲流与对象流', '2026-07-05T11:59:48.86174+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('cd08a835-8e7c-5b33-ad30-5c289ac05630', '4346bc9d-4bbf-5b56-a3e3-ba76b16f73da', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '请解释缓冲流中的flush()方法的作用，并编写一段代码演示如果不调用flush()可能造成数据丢失的场景。', 'coding', NULL, '```java
import java.io.*;

public class FlushDemo {
    public static void main(String[] args) throws IOException {
        // 不使用flush，程序异常结束可能丢失数据
        BufferedOutputStream bos = new BufferedOutputStream(new FileOutputStream("test.txt"));
        bos.write("Hello".getBytes());
        // 模拟程序异常退出，未调用close()或flush()
        // bos.close();  // 如果注释掉，数据可能未写入文件
        // 为了演示，直接让程序结束而不关闭流
        System.out.println("数据可能未写入");
    }
}
```
flush()方法强制将缓冲区中的数据写入底层输出流。如果不调用flush()且缓冲区未满，数据会滞留在内存中，若程序异常终止则数据丢失。', '缓冲输出流在缓冲区满或调用flush()/close()时才会真正写入数据。flush()用于手动刷新，确保数据及时写入。', 'medium', NULL, NULL, '缓冲流与对象流', '2026-07-05T11:59:48.86174+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('f3d83dbd-ee39-52da-93b9-ad1ca8ac0135', '612c5430-94a8-55f4-9225-63d5b14b1fbb', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '若线性表最常用的操作是访问第i个元素及其前驱，则最合适的存储结构是（ ）。', 'choice', '["A. 单链表", "B. 双向链表", "C. 顺序表", "D. 循环单链表"]', 'C', '顺序表支持随机访问，通过下标可以直接访问第i个元素，其前驱即为第i-1个元素，时间复杂度均为O(1)。链表访问第i个元素需要遍历，时间复杂度为O(n)，因此顺序表更合适。', 'easy', NULL, NULL, '顺序表与链表', '2026-07-05T11:59:50.477428+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('f9b5f3ca-5e68-5dca-a616-a81a284df49a', '4346bc9d-4bbf-5b56-a3e3-ba76b16f73da', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '请分析以下代码的错误并修正：
```java
ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream("data.dat"));
oos.writeInt(100);
oos.writeObject("Hello");
oos.writeObject(new Student());  // Student未实现Serializable
```
要求说明错误原因并给出修正方案。', 'coding', NULL, '错误原因：Student类未实现Serializable接口，调用writeObject时会抛出NotSerializableException。
修正方案：让Student类实现Serializable接口：
```java
class Student implements Serializable {
    // 类内容
}
```
或者如果不需要序列化Student对象，则移除writeObject(new Student())语句。', 'Java对象流只能序列化实现了Serializable接口的对象。对于未实现该接口的对象，必须实现接口或避免序列化。', 'medium', NULL, NULL, '缓冲流与对象流', '2026-07-05T11:59:48.86174+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('386dd6e1-29bd-5b7e-a43f-f7007a5b4b20', '4346bc9d-4bbf-5b56-a3e3-ba76b16f73da', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '在Java中，线程的创建方式不包括以下哪一项？', 'choice', '["A. 继承Thread类", "B. 实现Runnable接口", "C. 实现Callable接口", "D. 继承Runtime类"]', 'D', '线程创建主要有三种方式：继承Thread类、实现Runnable接口、实现Callable接口（结合FutureTask）。Runtime类与线程创建无关，因此D选项错误。', 'medium', NULL, NULL, '线程的创建与生命周期', '2026-07-05T11:59:48.86174+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('3938f851-f2a8-5bca-96a8-ba357f092eea', '4346bc9d-4bbf-5b56-a3e3-ba76b16f73da', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '线程调用start()方法后，线程进入哪个状态？', 'choice', '["A. 新建（New）", "B. 就绪（Runnable）", "C. 运行（Running）", "D. 阻塞（Blocked）"]', 'B', 'start()方法使线程进入就绪状态，等待CPU时间片。只有获得CPU后才会进入运行状态，因此正确答案是B。', 'medium', NULL, NULL, '线程的创建与生命周期', '2026-07-05T11:59:48.86174+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('9dd7baa7-9362-5215-bdc1-83e4754f494b', '4346bc9d-4bbf-5b56-a3e3-ba76b16f73da', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '以下哪个方法会使线程进入阻塞状态？', 'choice', '["A. start()", "B. run()", "C. sleep()", "D. yield()"]', 'C', 'sleep()方法使当前线程暂停执行，进入阻塞状态。start()启动线程，run()执行任务，yield()使线程回到就绪状态，因此C正确。', 'medium', NULL, NULL, '线程的创建与生命周期', '2026-07-05T11:59:48.86174+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('62c35e0b-2383-5828-b27c-1eea9dafad26', '4346bc9d-4bbf-5b56-a3e3-ba76b16f73da', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '线程死亡后，能否再次调用start()方法？', 'choice', '["A. 可以", "B. 不可以", "C. 取决于JVM实现", "D. 取决于操作系统"]', 'B', '线程一旦死亡（Terminated），就不能再次启动。调用start()会抛出IllegalThreadStateException异常，因此B正确。', 'medium', NULL, NULL, '线程的创建与生命周期', '2026-07-05T11:59:48.86174+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('dc80e87c-c15f-5627-93d2-b346db880607', '4346bc9d-4bbf-5b56-a3e3-ba76b16f73da', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '关于线程优先级，以下说法正确的是？', 'choice', '["A. 优先级高的线程一定会先执行", "B. 优先级范围是1~10", "C. 默认优先级是5", "D. 可以通过setPriority()设置任意整数值"]', 'C', 'Java线程优先级范围是1~10，默认优先级为5（NORM_PRIORITY）。优先级高不一定先执行，只是概率更大，且不能设置超出范围的值，因此C正确。', 'medium', NULL, NULL, '线程的创建与生命周期', '2026-07-05T11:59:48.86174+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('c4454829-744a-5557-9c42-896d7a57a01f', '4346bc9d-4bbf-5b56-a3e3-ba76b16f73da', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '线程的run()方法可以直接调用，效果与start()相同。', 'choice', '["A. 正确", "B. 错误"]', 'B', '直接调用run()方法不会启动新线程，而是在当前线程中同步执行run()方法的内容，与普通方法调用无异。start()才会创建新线程并进入就绪状态。', 'medium', NULL, NULL, '线程的创建与生命周期', '2026-07-05T11:59:48.86174+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('b59d5267-b5d7-545d-9fdf-11aee9f3468a', '4346bc9d-4bbf-5b56-a3e3-ba76b16f73da', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '线程在运行状态中调用yield()方法会立即进入阻塞状态。', 'choice', '["A. 正确", "B. 错误"]', 'B', 'yield()方法使当前线程从运行状态回到就绪状态，而不是阻塞状态。它只是让出CPU，线程仍然在就绪队列中等待调度。', 'medium', NULL, NULL, '线程的创建与生命周期', '2026-07-05T11:59:48.86174+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('f064623c-8181-59c4-8361-c56248ae85df', '4346bc9d-4bbf-5b56-a3e3-ba76b16f73da', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '一个线程可以多次调用start()方法。', 'choice', '["A. 正确", "B. 错误"]', 'B', '每个线程只能调用一次start()方法。第二次调用会抛出IllegalThreadStateException，因为线程已经启动过，不能重复启动。', 'medium', NULL, NULL, '线程的创建与生命周期', '2026-07-05T11:59:48.86174+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('8b5a8f52-fce0-5f73-8e23-0291b1675dba', '4346bc9d-4bbf-5b56-a3e3-ba76b16f73da', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '实现Runnable接口创建线程的方式可以避免单继承的局限性。', 'choice', '["A. 正确", "B. 错误"]', 'A', 'Java只支持单继承，如果类已经继承了其他类，就不能再继承Thread类。实现Runnable接口则没有这个限制，同时还能共享同一个Runnable实例的变量，便于资源共享。', 'medium', NULL, NULL, '线程的创建与生命周期', '2026-07-05T11:59:48.86174+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('15c7dbf5-0e99-592a-9f21-c9bd9fecc1d1', '4346bc9d-4bbf-5b56-a3e3-ba76b16f73da', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '线程进入死亡状态后，其占用的栈空间会立即被JVM回收。', 'choice', '["A. 正确", "B. 错误"]', 'B', '线程死亡后，其占用的栈空间不会立即回收，而是由JVM的垃圾回收机制在适当时候回收。但线程对象本身可能还存在于内存中，直到没有引用指向它。', 'medium', NULL, NULL, '线程的创建与生命周期', '2026-07-05T11:59:48.86174+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('d69a4ce6-4c9f-50c2-b341-5e9faa640100', '4346bc9d-4bbf-5b56-a3e3-ba76b16f73da', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '线程生命周期中的五个状态分别是：新建、就绪、运行、阻塞和___。', 'fill', NULL, '死亡（Terminated）', '线程的五个状态：新建（New）、就绪（Runnable）、运行（Running）、阻塞（Blocked）、死亡（Terminated）。死亡状态是线程执行完run()方法或异常退出后的最终状态。', 'medium', NULL, NULL, '线程的创建与生命周期', '2026-07-05T11:59:48.86174+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('65aac389-93df-5fbb-97b0-17f79141df57', '4346bc9d-4bbf-5b56-a3e3-ba76b16f73da', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '在Java中，创建线程的两种主要方式是继承___类和实现___接口。', 'fill', NULL, 'Thread, Runnable', 'Java中创建线程的两种经典方式：继承Thread类并重写run()方法，或者实现Runnable接口并实现run()方法。此外还有Callable方式。', 'medium', NULL, NULL, '线程的创建与生命周期', '2026-07-05T11:59:49.050718+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('be3ae5bb-a026-555c-af9c-b3fe5114a6df', '4346bc9d-4bbf-5b56-a3e3-ba76b16f73da', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '线程调用___方法后，会释放CPU执行权，但不会释放锁资源。', 'fill', NULL, 'sleep()', 'sleep()方法使线程暂停执行指定时间，期间不会释放已持有的锁。与wait()不同，wait()会释放锁并进入等待池。', 'medium', NULL, NULL, '线程的创建与生命周期', '2026-07-05T11:59:49.050718+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('829dba44-2b60-5da2-8b9b-c0d7071ffa82', '4346bc9d-4bbf-5b56-a3e3-ba76b16f73da', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '线程进入阻塞状态后，当阻塞条件解除，线程会先进入___状态。', 'fill', NULL, '就绪（Runnable）', '阻塞解除后，线程不会直接回到运行状态，而是先进入就绪状态，等待CPU调度。只有获得CPU时间片后才能再次进入运行状态。', 'medium', NULL, NULL, '线程的创建与生命周期', '2026-07-05T11:59:49.050718+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('65ff8206-97a8-53ba-b35c-67ae8e154c44', '4346bc9d-4bbf-5b56-a3e3-ba76b16f73da', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '在Java中，每个线程都有一个独立的___空间，用于存储局部变量和方法调用。', 'fill', NULL, '栈', 'JVM为每个线程分配独立的栈空间，用于存储局部变量、方法调用帧等，保证线程之间的数据隔离。', 'medium', NULL, NULL, '线程的创建与生命周期', '2026-07-05T11:59:49.050718+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('a4b053f5-1eeb-576a-80e8-4b5f73b2f9de', '612c5430-94a8-55f4-9225-63d5b14b1fbb', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '以下关于链表的说法中，正确的是（ ）。', 'choice', '["A. 链表插入和删除操作的时间复杂度总是O(1)", "B. 链表不需要预分配连续存储空间", "C. 链表的查找操作时间复杂度为O(1)", "D. 链表节点只存储数据，不存储指针"]', 'B', '链表采用动态内存分配，节点之间通过指针链接，不需要预分配连续空间，因此选项B正确。选项A错误，因为插入和删除在已知位置时才是O(1)，未知位置需要先查找；选项C错误，查找需遍历，时间复杂度O(n)；选项D错误，链表节点包含数据域和指针域。', 'easy', NULL, NULL, '顺序表与链表', '2026-07-05T11:59:50.477428+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('36587a4d-8cac-5e52-8447-ba92498d64cd', '4346bc9d-4bbf-5b56-a3e3-ba76b16f73da', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '编写一个Java程序，创建两个线程：一个线程打印1~10的奇数，另一个线程打印1~10的偶数，要求两个线程交替执行，输出结果为“1 2 3 4 5 6 7 8 9 10”。请写出完整代码，并说明线程的生命周期变化。', 'coding', NULL, '参考答案：
```java
public class AlternatePrint {
    private static final Object lock = new Object();
    private static int count = 1;
    private static final int MAX = 10;

    public static void main(String[] args) {
        Thread oddThread = new Thread(() -> {
            while (count <= MAX) {
                synchronized (lock) {
                    if (count % 2 == 1) {
                        System.out.print(count + " ");
                        count++;
                        lock.notify();
                    } else {
                        try {
                            lock.wait();
                        } catch (InterruptedException e) {
                            e.printStackTrace();
                        }
                    }
                }
            }
        });

        Thread evenThread = new Thread(() -> {
            while (count <= MAX) {
                synchronized (lock) {
                    if (count % 2 == 0) {
                        System.out.print(count + " ");
                        count++;
                        lock.notify();
                    } else {
                        try {
                            lock.wait();
                        } catch (InterruptedException e) {
                            e.printStackTrace();
                        }
                    }
                }
            }
        });

        oddThread.start();
        evenThread.start();
    }
}
```
线程生命周期变化：
1. 两个线程通过new创建后处于新建状态。
2. 调用start()后进入就绪状态，等待CPU调度。
3. 获得CPU后进入运行状态，执行run()方法。
4. 当遇到wait()时，线程释放锁并进入阻塞状态（等待池）。
5. 被notify()唤醒后，线程回到就绪状态，再次竞争锁。
6. 循环结束后，run()执行完毕，线程进入死亡状态。', '解题思路：使用synchronized和wait/notify机制实现线程交替执行。共享变量count记录当前要打印的数字，两个线程分别判断奇偶性，符合条件则打印并唤醒对方，否则等待。线程生命周期贯穿整个执行过程，体现了新建→就绪→运行→阻塞→就绪→运行→死亡的状态转换。', 'medium', NULL, NULL, '线程的创建与生命周期', '2026-07-05T11:59:49.050718+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('7082f8e7-439c-507d-90f6-09136925333b', '4346bc9d-4bbf-5b56-a3e3-ba76b16f73da', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '请解释Java中线程的创建方式有哪些？分别说明它们的优缺点，并给出一个使用匿名内部类创建线程的代码示例。', 'coding', NULL, '参考答案：
创建方式：
1. 继承Thread类：重写run()方法。
   - 优点：代码简单，可以直接使用Thread类的方法。
   - 缺点：无法继承其他类，不灵活。
2. 实现Runnable接口：实现run()方法。
   - 优点：避免单继承限制，适合资源共享。
   - 缺点：不能直接使用Thread类的方法，需通过Thread.currentThread()获取。
3. 实现Callable接口：配合FutureTask使用，有返回值。
   - 优点：可以获取线程执行结果，支持泛型。
   - 缺点：使用稍复杂。

匿名内部类示例：
```java
public class AnonymousThread {
    public static void main(String[] args) {
        Thread thread = new Thread(new Runnable() {
            @Override
            public void run() {
                System.out.println("匿名内部类线程运行");
            }
        });
        thread.start();
    }
}
```', '解题思路：首先列举三种创建方式，分别分析优缺点。然后使用匿名内部类实现Runnable接口创建线程，这是常见的简化写法。注意匿名内部类中不能直接访问非final局部变量（Java8后effectively final也可）。', 'medium', NULL, NULL, '线程的创建与生命周期', '2026-07-05T11:59:49.050718+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('41b65147-8ee2-574c-b6c4-fcd4a818b8f0', '4346bc9d-4bbf-5b56-a3e3-ba76b16f73da', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '有一个多线程程序，主线程创建了三个子线程，每个子线程打印自己的名称后休眠2秒。请写出代码，并分析主线程和子线程的生命周期变化（包括新建、就绪、运行、阻塞、死亡）。', 'coding', NULL, '参考答案：
```java
public class ThreadLifecycle {
    public static void main(String[] args) {
        System.out.println("主线程开始");

        for (int i = 1; i <= 3; i++) {
            Thread thread = new Thread(() -> {
                System.out.println(Thread.currentThread().getName() + " 运行");
                try {
                    Thread.sleep(2000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                System.out.println(Thread.currentThread().getName() + " 结束");
            }, "子线程" + i);
            thread.start();
        }

        System.out.println("主线程结束");
    }
}
```
生命周期分析：
- 主线程：新建→就绪→运行（打印信息）→运行结束（死亡）。
- 每个子线程：
  1. 新建：new Thread()创建对象。
  2. 就绪：start()调用后进入就绪队列。
  3. 运行：获得CPU后进入运行，打印名称。
  4. 阻塞：调用sleep(2000)进入阻塞状态（不释放锁）。
  5. 就绪：2秒后阻塞解除，回到就绪状态。
  6. 运行：再次获得CPU，打印结束信息。
  7. 死亡：run()执行完毕。
注意：主线程和子线程并发执行，输出顺序不确定。', '解题思路：使用for循环创建3个子线程并启动，每个子线程执行打印和休眠操作。分析生命周期时，需要区分主线程和子线程，注意sleep()是阻塞状态，不释放锁。线程死亡后不可再启动。', 'medium', NULL, NULL, '线程的创建与生命周期', '2026-07-05T11:59:49.050718+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('4f2cddf1-9335-539c-9ec1-43c6633f4f30', '4346bc9d-4bbf-5b56-a3e3-ba76b16f73da', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '设计一个程序，使用实现Runnable接口的方式创建两个线程，共享一个整数变量count（初始值为0）。一个线程对count加1，另一个线程对count减1，各执行1000次。要求最终count的值必须为0，并解释如何保证线程安全。', 'coding', NULL, '参考答案：
```java
public class SafeCounter {
    private int count = 0;
    private final Object lock = new Object();

    public static void main(String[] args) throws InterruptedException {
        SafeCounter counter = new SafeCounter();

        Runnable incrementTask = () -> {
            for (int i = 0; i < 1000; i++) {
                synchronized (counter.lock) {
                    counter.count++;
                }
            }
        };

        Runnable decrementTask = () -> {
            for (int i = 0; i < 1000; i++) {
                synchronized (counter.lock) {
                    counter.count--;
                }
            }
        };

        Thread t1 = new Thread(incrementTask);
        Thread t2 = new Thread(decrementTask);
        t1.start();
        t2.start();
        t1.join();
        t2.join();

        System.out.println("最终count值: " + counter.count); // 输出0
    }
}
```
线程安全保证：使用synchronized关键字对count的修改操作进行同步，确保同一时刻只有一个线程能修改count，避免竞态条件。如果不加同步，由于count++和count--不是原子操作，可能导致结果不为0。', '解题思路：实现Runnable接口创建两个线程，共享count变量。通过synchronized同步块保证原子性。使用join()确保主线程等待子线程执行完毕。线程生命周期中，两个线程交替进入运行和阻塞状态，但同步机制保证了数据一致性。', 'medium', NULL, NULL, '线程的创建与生命周期', '2026-07-05T11:59:49.050718+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('070188a2-1e32-5c96-af68-4dace8d743ef', '612c5430-94a8-55f4-9225-63d5b14b1fbb', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '顺序表扩容时，若采用加倍策略，则插入n个元素的总时间复杂度为（ ）。', 'choice', '["A. O(n)", "B. O(n^2)", "C. O(1)", "D. O(n log n)"]', 'A', '采用加倍扩容策略时，每次扩容的代价为O(k)，但扩容次数为O(log n)，分摊到每个元素的插入操作上，均摊时间复杂度为O(1)，因此插入n个元素的总时间复杂度为O(n)。', 'easy', NULL, NULL, '顺序表与链表', '2026-07-05T11:59:50.477428+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('7da26a71-81be-5bf9-834c-3f52dddea8a4', '612c5430-94a8-55f4-9225-63d5b14b1fbb', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '顺序表中，逻辑上相邻的元素在物理内存中不一定相邻。', 'choice', '["A. 正确", "B. 错误"]', 'B', '顺序表采用连续存储空间，逻辑上相邻的元素在物理位置上也相邻。该描述是链表的特点，因此判断为错误。', 'easy', NULL, NULL, '顺序表与链表', '2026-07-05T11:59:50.477428+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('1cd0ffb1-fec0-58e1-ab8a-f3e52a3ec3bf', '612c5430-94a8-55f4-9225-63d5b14b1fbb', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '递归算法的空间复杂度通常与递归调用的深度成正比。', 'choice', '["A. 正确", "B. 错误"]', 'A', '递归调用会使用系统栈保存现场信息，递归深度越大，占用的栈空间越多，因此空间复杂度通常与递归深度线性相关。', 'hard', NULL, NULL, '递归与分治思想', '2026-07-05T11:59:50.477428+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('f5bc4388-7efa-54a9-a84f-16598339886a', '4346bc9d-4bbf-5b56-a3e3-ba76b16f73da', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '请编写一个程序，演示线程从新建到死亡的全过程，包括就绪、运行、阻塞状态的转换。要求至少包含以下操作：创建线程、启动线程、让线程休眠、中断线程，并在每个状态转换时打印当前状态。', 'coding', NULL, '参考答案：
```java
public class LifecycleDemo {
    public static void main(String[] args) {
        Thread thread = new Thread(() -> {
            System.out.println("线程进入运行状态");
            try {
                System.out.println("线程即将进入阻塞状态（sleep）");
                Thread.sleep(3000);
                System.out.println("线程阻塞结束，回到就绪状态");
            } catch (InterruptedException e) {
                System.out.println("线程被中断，进入死亡状态");
                return;
            }
            System.out.println("线程运行结束，进入死亡状态");
        });

        System.out.println("线程新建状态");
        thread.start();
        System.out.println("线程进入就绪状态");

        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        // 中断线程，演示中断导致的死亡
        thread.interrupt();
    }
}
```
状态转换说明：
1. 新建：new Thread()创建对象。
2. 就绪：start()调用后。
3. 运行：获得CPU后执行run()。
4. 阻塞：sleep()调用后。
5. 就绪：sleep结束或中断后回到就绪。
6. 死亡：run()正常结束或异常退出（如中断）。
注意：中断会抛出InterruptedException，线程捕获后可以选择退出。', '解题思路：通过打印语句标记每个状态转换点。使用sleep()模拟阻塞，使用interrupt()模拟中断导致的死亡。注意中断后线程不会立即死亡，而是由catch块决定退出。', 'medium', NULL, NULL, '线程的创建与生命周期', '2026-07-05T11:59:49.050718+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('c16f9dc7-0805-520e-9292-484489421bf3', '4346bc9d-4bbf-5b56-a3e3-ba76b16f73da', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '在Java中，使用synchronized关键字修饰方法时，线程获取的是哪个对象的锁？', 'choice', '["A. 当前类的Class对象", "B. 当前实例对象（this）", "C. 调用该方法的线程对象", "D. 任意指定的锁对象"]', 'B', 'synchronized修饰实例方法时，线程获取的是调用该方法的实例对象（this）的锁。修饰静态方法时获取的是当前类的Class对象锁。', 'medium', NULL, NULL, '线程同步与死锁', '2026-07-05T11:59:49.050718+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('4b035029-512b-5827-8754-e183463c50ce', '4346bc9d-4bbf-5b56-a3e3-ba76b16f73da', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '以下哪个不是死锁产生的必要条件？', 'choice', '["A. 互斥条件", "B. 请求与保持条件", "C. 非剥夺条件", "D. 资源优先分配条件"]', 'D', '死锁产生的四个必要条件是：互斥、请求与保持、不可剥夺、循环等待。资源优先分配不是必要条件。', 'hard', NULL, NULL, '线程同步与死锁', '2026-07-05T11:59:49.050718+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('87b594db-d5e5-5336-9281-1f5c6992ca87', '4346bc9d-4bbf-5b56-a3e3-ba76b16f73da', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '在Java中，使用Lock接口实现同步时，通常与哪个类配合使用？', 'choice', '["A. Thread", "B. ReentrantLock", "C. Object", "D. Runnable"]', 'B', 'Lock接口的常用实现类是ReentrantLock，它提供了可重入的互斥锁功能，比synchronized更灵活。', 'hard', NULL, NULL, '线程同步与死锁', '2026-07-05T11:59:49.050718+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('2c0e0a90-da4c-5d2c-842b-193a6f82ac46', '4346bc9d-4bbf-5b56-a3e3-ba76b16f73da', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '下列关于volatile关键字的说法，正确的是？', 'choice', '["A. volatile可以保证原子性", "B. volatile可以保证可见性和有序性", "C. volatile可以替代synchronized实现线程同步", "D. volatile能保证多个线程同时写共享变量时的安全"]', 'B', 'volatile关键字保证可见性和有序性（禁止指令重排），但不保证原子性，不能替代synchronized实现复合操作的同步。', 'hard', NULL, NULL, '线程同步与死锁', '2026-07-05T11:59:49.050718+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('4b87fb60-7903-52d5-8601-e0ecea224c35', '4346bc9d-4bbf-5b56-a3e3-ba76b16f73da', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '下面哪个场景最容易导致死锁？', 'choice', '["A. 多个线程访问同一个非同步方法", "B. 两个线程各自持有锁并等待对方释放锁", "C. 一个线程多次进入同步块", "D. 使用线程池执行任务"]', 'B', '死锁的典型场景是多个线程相互等待对方持有的锁，形成循环等待条件。选项B描述了这种情形。', 'hard', NULL, NULL, '线程同步与死锁', '2026-07-05T11:59:49.050718+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('9e51b0e8-2b73-5106-b134-e409aa9c772d', '4346bc9d-4bbf-5b56-a3e3-ba76b16f73da', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', 'synchronized关键字可以修饰静态方法和实例方法，它们使用的锁对象相同。', 'choice', '["A. 正确", "B. 错误"]', 'B', 'synchronized修饰实例方法锁的是当前实例对象（this），修饰静态方法锁的是当前类的Class对象，两者不同。', 'hard', NULL, NULL, '线程同步与死锁', '2026-07-05T11:59:49.050718+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('17bc45ad-9f84-5b0e-8ad3-2671b153d665', '4346bc9d-4bbf-5b56-a3e3-ba76b16f73da', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '死锁发生后，系统一定会检测到并自动解除死锁。', 'choice', '["A. 正确", "B. 错误"]', 'B', 'Java不会自动检测或解除死锁，死锁发生后程序将永久阻塞，需要开发者通过设计避免或手动干预。', 'hard', NULL, NULL, '线程同步与死锁', '2026-07-05T11:59:49.050718+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('c3c13bf2-a907-59fa-9e05-4bf3db79ea45', '4346bc9d-4bbf-5b56-a3e3-ba76b16f73da', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '使用ReentrantLock时，必须手动释放锁，通常放在finally块中。', 'choice', '["A. 正确", "B. 错误"]', 'A', 'ReentrantLock不会像synchronized那样自动释放锁，必须在finally块中调用unlock()以确保锁被释放，避免死锁。', 'hard', NULL, NULL, '线程同步与死锁', '2026-07-05T11:59:49.050718+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('55211403-5ffd-5c07-b1c1-e94094867d2e', '4346bc9d-4bbf-5b56-a3e3-ba76b16f73da', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '多个线程同时访问共享变量时，使用volatile就一定能保证数据安全。', 'choice', '["A. 正确", "B. 错误"]', 'B', 'volatile只保证可见性和有序性，不保证原子性。对于复合操作（如i++），仍需同步机制保证原子性。', 'hard', NULL, NULL, '线程同步与死锁', '2026-07-05T11:59:49.050718+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('72f4817b-57cb-5b53-8ef4-2171c12b0646', '4346bc9d-4bbf-5b56-a3e3-ba76b16f73da', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '线程同步的目的是为了提高程序运行效率。', 'choice', '["A. 正确", "B. 错误"]', 'B', '线程同步的主要目的是保证数据一致性和线程安全，避免竞态条件，但会降低并发性能。', 'hard', NULL, NULL, '线程同步与死锁', '2026-07-05T11:59:49.050718+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('c43a4182-3d8f-588c-97ab-d59965ef1fdf', '4346bc9d-4bbf-5b56-a3e3-ba76b16f73da', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '在Java中，每个对象都有一个内置的锁，通常称为___。', 'fill', NULL, '监视器锁（Monitor）', '每个Java对象都关联一个监视器（Monitor），synchronized通过获取和释放监视器锁来实现同步。', 'hard', NULL, NULL, '线程同步与死锁', '2026-07-05T11:59:49.050718+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('75808586-b251-5495-a22c-8f76d5910df1', '4346bc9d-4bbf-5b56-a3e3-ba76b16f73da', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '死锁产生的四个必要条件包括：互斥、请求与保持、不可剥夺和___。', 'fill', NULL, '循环等待', '循环等待指多个线程形成环路，每个线程都在等待下一个线程持有的资源，这是死锁发生的最后一个条件。', 'hard', NULL, NULL, '线程同步与死锁', '2026-07-05T11:59:49.050718+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('627ddc56-46f9-5e91-84f8-30e255768997', '4346bc9d-4bbf-5b56-a3e3-ba76b16f73da', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', 'synchronized同步块通过___和___指令实现锁的获取与释放（填JVM指令名）。', 'fill', NULL, 'monitorenter、monitorexit', 'JVM通过monitorenter指令获取锁，通过monitorexit指令释放锁，确保同步块的互斥执行。', 'hard', NULL, NULL, '线程同步与死锁', '2026-07-05T11:59:49.050718+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('173b1aed-db1e-5108-89b8-50c9a94fd873', '4346bc9d-4bbf-5b56-a3e3-ba76b16f73da', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '使用ReentrantLock时，通常调用___方法尝试获取锁，若获取失败则线程进入等待状态。', 'fill', NULL, 'lock()', 'lock()方法用于获取锁，如果锁被其他线程持有，当前线程会阻塞直到获取到锁。也可用tryLock()尝试非阻塞获取。', 'hard', NULL, NULL, '线程同步与死锁', '2026-07-05T11:59:49.050718+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('a08fddc0-584d-5050-8409-8899fd917656', '4346bc9d-4bbf-5b56-a3e3-ba76b16f73da', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '为了避免死锁，可以采用___策略，即规定所有线程必须按相同的顺序获取锁。', 'fill', NULL, '锁顺序', '通过规定固定的锁获取顺序，可以打破循环等待条件，从而避免死锁。', 'hard', NULL, NULL, '线程同步与死锁', '2026-07-05T11:59:49.050718+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('e326360c-ba10-502c-ba7c-9cb9002373f8', '4346bc9d-4bbf-5b56-a3e3-ba76b16f73da', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '请分析以下代码是否存在死锁风险，并说明原因。若存在，请给出修改方案。

```java
public class DeadlockRisk {
    private static final Object lockA = new Object();
    private static final Object lockB = new Object();

    public void method1() {
        synchronized (lockA) {
            System.out.println("method1 获得lockA");
            synchronized (lockB) {
                System.out.println("method1 获得lockB");
            }
        }
    }

    public void method2() {
        synchronized (lockB) {
            System.out.println("method2 获得lockB");
            synchronized (lockA) {
                System.out.println("method2 获得lockA");
            }
        }
    }
}
```', 'coding', NULL, '存在死锁风险。当线程1执行method1获得lockA，线程2执行method2获得lockB后，线程1等待lockB，线程2等待lockA，形成循环等待，导致死锁。

修改方案：统一锁的获取顺序，例如两个方法都先获取lockA再获取lockB，或者使用tryLock()尝试获取锁并设置超时。
```java
public void method2() {
    synchronized (lockA) {  // 与method1顺序一致
        System.out.println("method2 获得lockA");
        synchronized (lockB) {
            System.out.println("method2 获得lockB");
        }
    }
}
```', '死锁检测的关键看是否形成循环等待。两个方法加锁顺序相反，极易触发死锁。通过固定加锁顺序可打破循环等待。', 'hard', NULL, NULL, '线程同步与死锁', '2026-07-05T11:59:49.050718+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('6f529b18-2d95-5a74-85ad-b626be8fbdf2', '4346bc9d-4bbf-5b56-a3e3-ba76b16f73da', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '使用synchronized实现一个线程安全的计数器类，包含increment()和getCount()方法。要求：多个线程同时调用increment()时，计数器正确累加。', 'coding', NULL, '```java
public class SafeCounter {
    private int count = 0;

    public synchronized void increment() {
        count++;
    }

    public synchronized int getCount() {
        return count;
    }
}
```
或者使用同步块：
```java
public class SafeCounter {
    private int count = 0;
    private final Object lock = new Object();

    public void increment() {
        synchronized (lock) {
            count++;
        }
    }

    public int getCount() {
        synchronized (lock) {
            return count;
        }
    }
}
```', 'count++不是原子操作，需要同步保证原子性。synchronized修饰方法或使用同步块均可。注意读操作也要同步，保证可见性。', 'hard', NULL, NULL, '线程同步与死锁', '2026-07-05T11:59:49.050718+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('aebeeb41-fbb2-5685-a8f7-9f3df88d00b5', '4346bc9d-4bbf-5b56-a3e3-ba76b16f73da', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '请解释什么是线程同步中的“竞态条件”，并给出一个Java代码示例说明。', 'coding', NULL, '竞态条件（Race Condition）是指多个线程同时访问共享数据，且至少一个线程进行写操作，最终结果依赖于线程执行的时序，导致结果不可预测。

示例：
```java
public class RaceConditionDemo {
    private int count = 0;

    public void increment() {
        count++;  // 非原子操作
    }

    public static void main(String[] args) throws Exception {
        RaceConditionDemo demo = new RaceConditionDemo();
        Thread t1 = new Thread(() -> { for (int i=0; i<1000; i++) demo.increment(); });
        Thread t2 = new Thread(() -> { for (int i=0; i<1000; i++) demo.increment(); });
        t1.start(); t2.start();
        t1.join(); t2.join();
        System.out.println(demo.count);  // 可能小于2000
    }
}
```
由于count++分为读取、加1、写入三步，线程交替执行可能导致更新丢失。', '竞态条件是线程不安全的典型表现。解决方法是使用synchronized或Lock保证操作的原子性。', 'hard', NULL, NULL, '线程同步与死锁', '2026-07-05T11:59:49.050718+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('d99d5e43-9d70-599c-a4ce-a98149ec8fa0', '4346bc9d-4bbf-5b56-a3e3-ba76b16f73da', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '简述Java中Lock接口与synchronized关键字的区别，并给出一个使用ReentrantLock实现同步的示例。', 'coding', NULL, '区别：
1. synchronized是Java关键字，自动释放锁；Lock是接口，需手动释放（通常在finally中）。
2. Lock支持尝试非阻塞获取锁（tryLock()）、可中断获取锁（lockInterruptibly()）、超时获取锁。
3. Lock可以实现公平锁，synchronized只能是非公平锁。
4. synchronized在发生异常时自动释放锁，Lock必须手动释放。

示例：
```java
import java.util.concurrent.locks.ReentrantLock;

public class LockExample {
    private final ReentrantLock lock = new ReentrantLock();
    private int count = 0;

    public void increment() {
        lock.lock();
        try {
            count++;
        } finally {
            lock.unlock();
        }
    }

    public int getCount() {
        lock.lock();
        try {
            return count;
        } finally {
            lock.unlock();
        }
    }
}
```', 'ReentrantLock提供了更灵活的锁操作，但使用时要确保unlock()被调用，否则可能造成死锁。', 'hard', NULL, NULL, '线程同步与死锁', '2026-07-05T11:59:49.050718+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('a4cfbfb6-f6b3-5246-9372-b8b035646047', '4346bc9d-4bbf-5b56-a3e3-ba76b16f73da', 'ee457af5-4c72-5d64-8d8f-3e11bf82f0f7', '设计一个程序，模拟两个线程死锁的场景，并说明如何通过改变锁获取顺序避免死锁。', 'coding', NULL, '死锁模拟代码：
```java
public class DeadlockSimulation {
    private static final Object lock1 = new Object();
    private static final Object lock2 = new Object();

    public static void main(String[] args) {
        Thread t1 = new Thread(() -> {
            synchronized (lock1) {
                System.out.println("线程1持有lock1");
                try { Thread.sleep(100); } catch (InterruptedException e) {}
                synchronized (lock2) {
                    System.out.println("线程1持有lock2");
                }
            }
        });

        Thread t2 = new Thread(() -> {
            synchronized (lock2) {
                System.out.println("线程2持有lock2");
                try { Thread.sleep(100); } catch (InterruptedException e) {}
                synchronized (lock1) {
                    System.out.println("线程2持有lock1");
                }
            }
        });

        t1.start();
        t2.start();
    }
}
```

避免死锁：让两个线程按相同顺序获取锁，例如都先获取lock1再获取lock2。
```java
// 修改线程2
Thread t2 = new Thread(() -> {
    synchronized (lock1) {  // 先获取lock1
        System.out.println("线程2持有lock1");
        synchronized (lock2) {
            System.out.println("线程2持有lock2");
        }
    }
});
```', '通过固定锁顺序打破循环等待条件，从而避免死锁。这是最常见的死锁预防策略。', 'hard', NULL, NULL, '线程同步与死锁', '2026-07-05T11:59:49.050718+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('1cc458d6-7624-5c8b-9d7a-b481e84248ee', '612c5430-94a8-55f4-9225-63d5b14b1fbb', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '顺序表的主要特点是（ ）。', 'choice', '["A. 逻辑上相邻的元素在物理位置上不一定相邻", "B. 插入和删除操作不需要移动元素", "C. 支持随机访问，查找时间复杂度为O(1)", "D. 每个节点包含数据域和指针域"]', 'C', '顺序表采用连续存储空间，可通过下标直接访问任意元素，因此随机访问时间复杂度为O(1)。选项A描述的是链表特点；选项B错误，顺序表插入删除需要移动元素；选项D描述的是链表节点结构。', 'easy', NULL, NULL, '顺序表与链表', '2026-07-05T11:59:50.477428+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('b4a63a87-9c28-5fc3-bc71-d0d129ef72ac', '612c5430-94a8-55f4-9225-63d5b14b1fbb', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '在单链表中，已知某个节点的指针p，要在其之后插入一个新节点s，正确的操作是（ ）。', 'choice', '["A. s->next = p; p->next = s;", "B. p->next = s; s->next = p;", "C. s->next = p->next; p->next = s;", "D. p->next = s->next; s->next = p;"]', 'C', '在单链表中，已知节点p，在其后插入节点s，应先将s的next指向p原来的后继（即p->next），再将p的next指向s，这样才能正确链接。选项C符合此逻辑。', 'easy', NULL, NULL, '顺序表与链表', '2026-07-05T11:59:50.477428+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('2e148dec-6c2b-5e10-9720-2cded609a691', '612c5430-94a8-55f4-9225-63d5b14b1fbb', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '在单链表中，头结点不是必须的，但设置头结点可以简化边界操作。', 'choice', '["A. 正确", "B. 错误"]', 'A', '头结点是链表第一个节点之前的辅助节点，不存储实际数据。它可以统一空表和非空表的操作，简化插入、删除等边界情况的处理，因此说法正确。', 'easy', NULL, NULL, '顺序表与链表', '2026-07-05T11:59:50.477428+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('bddc6b18-22e9-5031-98ef-290793190fe6', '612c5430-94a8-55f4-9225-63d5b14b1fbb', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '双向链表在插入和删除操作时，修改指针的数量比单链表多，因此效率更低。', 'choice', '["A. 正确", "B. 错误"]', 'B', '双向链表插入或删除时需要修改更多指针（前后两个方向），但时间复杂度依然是O(1)（已知位置时）。虽然修改指针数量多，但常数时间差异不大，不能简单认为效率更低。', 'easy', NULL, NULL, '顺序表与链表', '2026-07-05T11:59:50.477428+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('bc244551-4a17-5fcb-9175-420e18957673', '612c5430-94a8-55f4-9225-63d5b14b1fbb', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '顺序表适合频繁插入和删除操作的场景。', 'choice', '["A. 正确", "B. 错误"]', 'B', '顺序表插入和删除需要移动大量元素，平均时间复杂度为O(n)，不适合频繁插入删除的场景。链表更适合此类操作，因此判断为错误。', 'easy', NULL, NULL, '顺序表与链表', '2026-07-05T11:59:50.477428+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('0e9d628e-5592-567b-a887-2b8a62d5c964', '612c5430-94a8-55f4-9225-63d5b14b1fbb', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '循环链表中，从任一节点出发都可以访问到所有节点。', 'choice', '["A. 正确", "B. 错误"]', 'A', '循环链表的最后一个节点指向头节点（或第一个节点），形成环状结构。因此从任意节点出发，沿next指针遍历，最终都能回到起点，从而访问所有节点。', 'easy', NULL, NULL, '顺序表与链表', '2026-07-05T11:59:50.477428+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('301811bd-1437-5e31-a009-bae69115dafd', '612c5430-94a8-55f4-9225-63d5b14b1fbb', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '顺序表插入操作的平均时间复杂度是___。', 'fill', NULL, 'O(n)', '顺序表在插入元素时，需要将插入位置后的所有元素依次后移，平均移动n/2个元素，因此平均时间复杂度为O(n)。', 'easy', NULL, NULL, '顺序表与链表', '2026-07-05T11:59:50.477428+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('2dd58e1d-74ed-5c3b-b9aa-4cea4a293e46', '612c5430-94a8-55f4-9225-63d5b14b1fbb', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '单链表每个节点包含数据域和___域。', 'fill', NULL, '指针', '单链表节点由两部分组成：数据域存储数据元素，指针域存储指向下一个节点的地址（指针）。', 'easy', NULL, NULL, '顺序表与链表', '2026-07-05T11:59:50.477428+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('d6ec7cd9-ea96-5d1c-8b7b-dd264744eac2', '612c5430-94a8-55f4-9225-63d5b14b1fbb', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '若顺序表当前长度为n，在第i个位置插入一个新元素，需要移动的元素个数为___。', 'fill', NULL, 'n - i + 1', '在第i个位置插入元素，需要将第i个到第n个元素（共n-i+1个）依次后移一位，因此移动元素个数为n-i+1。', 'easy', NULL, NULL, '顺序表与链表', '2026-07-05T11:59:50.477428+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('3324965b-790e-58ed-8f22-4550308c0fb5', '612c5430-94a8-55f4-9225-63d5b14b1fbb', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '双向循环链表中，每个节点包含两个指针，分别指向前驱节点和___节点。', 'fill', NULL, '后继', '双向链表的每个节点包含两个指针：prior指向前驱节点，next指向后继节点。循环链表则使头尾相连。', 'easy', NULL, NULL, '顺序表与链表', '2026-07-05T11:59:50.477428+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('b5f03d48-6918-59f8-a5c4-3d832b5810c7', '612c5430-94a8-55f4-9225-63d5b14b1fbb', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '在单链表中，删除节点p的后继节点（假设p的后继存在），需要修改的指针数量为___。', 'fill', NULL, '1', '删除p的后继节点q，只需将p的next指针指向q的next（即p->next = q->next），然后释放q。只修改了一个指针，因此答案为1。', 'easy', NULL, NULL, '顺序表与链表', '2026-07-05T11:59:50.477428+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('c2320d1f-cbd3-5321-a7d7-041139858192', '612c5430-94a8-55f4-9225-63d5b14b1fbb', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '设计一个算法，将两个递增有序的单链表合并为一个递减有序的单链表，要求利用原链表节点，不额外分配新节点。给出算法思路和关键代码。', 'coding', NULL, '参考答案：
算法思路：
1. 定义三个指针：p1指向第一个链表头，p2指向第二个链表头，head指向新链表头（初始为空）。
2. 比较p1和p2指向节点的数据域，将值较大的节点从原链表中摘下，采用头插法插入到新链表中（头插法可实现递减顺序）。
3. 重复步骤2直到其中一个链表为空。
4. 将剩余非空链表中的节点依次头插到新链表中。
5. 返回新链表头指针。

关键代码（C语言风格）：
```c
struct ListNode* mergeDescending(struct ListNode* L1, struct ListNode* L2) {
    struct ListNode *p1 = L1, *p2 = L2, *head = NULL, *temp;
    while (p1 != NULL && p2 != NULL) {
        if (p1->data >= p2->data) {
            temp = p1;
            p1 = p1->next;
        } else {
            temp = p2;
            p2 = p2->next;
        }
        temp->next = head;
        head = temp;
    }
    while (p1 != NULL) {
        temp = p1;
        p1 = p1->next;
        temp->next = head;
        head = temp;
    }
    while (p2 != NULL) {
        temp = p2;
        p2 = p2->next;
        temp->next = head;
        head = temp;
    }
    return head;
}
```', '本题考察链表合并与逆序操作。需要理解头插法可以实现在新链表头部插入节点，从而得到递减序列。利用原节点避免额外空间开销，体现了链表操作的灵活性。', 'easy', NULL, NULL, '顺序表与链表', '2026-07-05T11:59:50.477428+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('ac8dfd23-837e-5982-b0f4-e1631e308602', '612c5430-94a8-55f4-9225-63d5b14b1fbb', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '给定一个长度为n的顺序表，编写算法删除其中所有值为x的元素，要求时间复杂度为O(n)，空间复杂度为O(1)。写出算法思路和关键代码。', 'coding', NULL, '参考答案：
算法思路：
1. 设置一个索引k，初始为0，用于记录非x元素应存放的位置。
2. 遍历顺序表，对于每个元素，如果当前元素不等于x，则将其复制到位置k，并k自增。
3. 遍历结束后，将顺序表的长度更新为k。

关键代码（C语言风格）：
```c
void deleteAllX(int arr[], int *len, int x) {
    int k = 0;
    for (int i = 0; i < *len; i++) {
        if (arr[i] != x) {
            arr[k++] = arr[i];
        }
    }
    *len = k;
}
```', '本题要求高效删除所有指定值的元素。使用双指针（一个遍历指针i，一个写入指针k）的方法，只需一次遍历，时间复杂度O(n)，且只使用常数额外空间，满足题目要求。', 'easy', NULL, NULL, '顺序表与链表', '2026-07-05T11:59:50.477428+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('8f7f7680-0cdd-5e2f-b2e0-9dcbc1bb4469', '612c5430-94a8-55f4-9225-63d5b14b1fbb', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '设计一个算法，判断一个带头结点的单链表是否中心对称（即正序和逆序相同）。要求时间复杂度O(n)，空间复杂度O(1)。写出算法思路和关键步骤。', 'coding', NULL, '参考答案：
算法思路：
1. 使用快慢指针找到链表的中间节点（快指针每次走两步，慢指针每次走一步）。
2. 将链表的后半部分就地反转（反转链表）。
3. 同时遍历前半部分和反转后的后半部分，比较对应节点的数据是否相等。
4. 若全部相等则为中心对称，否则不是。
5. 可选：将后半部分重新反转恢复原链表。

关键步骤：
- 快慢指针定位中间：while(fast && fast->next) slow = slow->next; fast = fast->next->next;
- 反转后半部分：使用三个指针prev=NULL, curr=slow->next, next; 循环反转。
- 比较：p1 = head->next, p2 = 反转后的头，逐个比较直到p2为NULL。', '本题综合考查链表查找中间节点、链表反转和遍历比较。通过反转后半部分，可以在不额外分配空间的情况下实现对称性判断，时间复杂度O(n)，空间复杂度O(1)。', 'easy', NULL, NULL, '顺序表与链表', '2026-07-05T11:59:50.477428+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('40304ed8-c067-5eda-87a3-68eca1d2bdee', '612c5430-94a8-55f4-9225-63d5b14b1fbb', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '一个顺序队列的初始状态为front=0, rear=0，经过三次入队和两次出队后，front的值为___。', 'fill', NULL, '2', '初始front=0，每次出队front加1。两次出队后front = 0 + 2 = 2。', 'medium', NULL, NULL, '队列的定义与应用', '2026-07-05T11:59:50.477428+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('67ccb918-661e-51c4-b2bf-cc31b71a48ac', '612c5430-94a8-55f4-9225-63d5b14b1fbb', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '顺序表与链表在内存分配方式上有何根本区别？分别说明它们对插入、删除、查找操作时间复杂度的影响。', 'coding', NULL, '参考答案：
根本区别：
- 顺序表采用静态连续内存分配（或动态连续分配），所有元素存储在连续的内存区域。
- 链表采用动态非连续内存分配，每个节点单独分配，通过指针链接。

时间复杂度影响：
1. 查找：
   - 顺序表支持随机访问，按位置查找时间复杂度O(1)；按值查找需遍历，O(n)。
   - 链表无论按位置还是按值查找，都需要从头遍历，时间复杂度O(n)。
2. 插入/删除：
   - 顺序表在中间插入/删除需要移动大量元素，平均时间复杂度O(n)。
   - 链表已知插入/删除位置时，只需修改指针，时间复杂度O(1)；若未知位置则需先查找，总体O(n)。

总结：顺序表适合查找频繁、插入删除较少的场景；链表适合插入删除频繁、查找较少的场景。', '本题要求对比两种存储结构的内存分配方式及其对操作效率的影响。回答需抓住连续与非连续这一核心区别，并准确分析各操作的时间复杂度，体现对基本概念的深入理解。', 'easy', NULL, NULL, '顺序表与链表', '2026-07-05T11:59:50.477428+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('7bcbb2c9-00cd-578e-a089-89ce26cec147', '612c5430-94a8-55f4-9225-63d5b14b1fbb', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '假设有两个递增有序的单链表A和B，设计算法求它们的交集（即同时出现在A和B中的元素），结果存放在新的链表中，要求不破坏原链表。写出算法思路和关键代码。', 'coding', NULL, '参考答案：
算法思路：
1. 定义两个指针pA和pB分别指向A和B的头节点（带头结点则指向第一个数据节点）。
2. 定义一个新链表的头指针head和尾指针tail，初始为空。
3. 循环比较pA和pB所指节点的数据域：
   - 若相等，则复制该数据创建新节点，尾插到新链表末尾，然后pA和pB同时后移；
   - 若pA->data < pB->data，则pA后移；
   - 否则pB后移。
4. 当任一链表遍历完毕，结束循环。
5. 返回新链表头指针。

关键代码（C语言风格）：
```c
struct ListNode* getIntersection(struct ListNode* A, struct ListNode* B) {
    struct ListNode *pA = A, *pB = B;
    struct ListNode *head = NULL, *tail = NULL;
    while (pA != NULL && pB != NULL) {
        if (pA->data == pB->data) {
            struct ListNode *newNode = (struct ListNode*)malloc(sizeof(struct ListNode));
            newNode->data = pA->data;
            newNode->next = NULL;
            if (head == NULL) {
                head = newNode;
                tail = newNode;
            } else {
                tail->next = newNode;
                tail = newNode;
            }
            pA = pA->next;
            pB = pB->next;
        } else if (pA->data < pB->data) {
            pA = pA->next;
        } else {
            pB = pB->next;
        }
    }
    return head;
}
```', '本题考查有序链表求交集。利用有序性质，通过双指针线性扫描，每次比较后移动较小者或同时移动相等者，时间复杂度O(m+n)。注意要求不破坏原链表，因此需要复制节点创建新链表。', 'easy', NULL, NULL, '顺序表与链表', '2026-07-05T11:59:50.477428+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('05730c8e-8498-5295-8486-885f101fdc18', '612c5430-94a8-55f4-9225-63d5b14b1fbb', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '队列是一种（ ）的线性数据结构。', 'choice', '["A. 先进后出", "B. 先进先出", "C. 后进先出", "D. 随机访问"]', 'B', '队列（Queue）的核心特性是先进先出（FIFO），即最先进入队列的元素最先被取出，与栈的后进先出相反。', 'easy', NULL, NULL, '队列的定义与应用', '2026-07-05T11:59:50.477428+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('6542d9d5-0e41-5af9-aa77-a3582c5cf47a', '612c5430-94a8-55f4-9225-63d5b14b1fbb', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '在顺序队列中，解决“假溢出”问题通常采用的方法是（ ）。', 'choice', '["A. 增大数组容量", "B. 使用链式存储", "C. 将数组视为循环结构", "D. 每次出队后移动所有元素"]', 'C', '“假溢出”是指队尾指针已到数组末尾但队头之前还有空位，此时无法入队。循环队列通过取模运算将数组逻辑上首尾相连，从而利用这些空闲位置。', 'easy', NULL, NULL, '队列的定义与应用', '2026-07-05T11:59:50.477428+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('4c4186a9-008b-51b7-ac44-802fae3a8771', '612c5430-94a8-55f4-9225-63d5b14b1fbb', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '循环队列的队满条件（设数组大小为MaxSize）是（ ）。', 'choice', '["A. front == rear", "B. front == (rear + 1) % MaxSize", "C. rear == (front + 1) % MaxSize", "D. front == (rear - 1) % MaxSize"]', 'B', '循环队列通常牺牲一个存储单元来区分队空和队满。队空条件为 front == rear，队满条件为 (rear + 1) % MaxSize == front。', 'easy', NULL, NULL, '队列的定义与应用', '2026-07-05T11:59:50.477428+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('4e29a420-067c-50d5-9db3-d77efa9e9eea', '612c5430-94a8-55f4-9225-63d5b14b1fbb', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '链式队列中，队头指针指向（ ）。', 'choice', '["A. 头结点", "B. 第一个数据节点", "C. 最后一个数据节点", "D. 队尾指针"]', 'B', '链式队列的队头指针指向链表中的第一个数据节点（即队头元素），出队操作时删除该节点。', 'easy', NULL, NULL, '队列的定义与应用', '2026-07-05T11:59:50.477428+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('982eba03-9d54-5a14-8291-07984a77f30c', '612c5430-94a8-55f4-9225-63d5b14b1fbb', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '以下哪个操作不是队列的基本操作？', 'choice', '["A. 入队（enqueue）", "B. 出队（dequeue）", "C. 取队头元素（front）", "D. 随机插入（insert）"]', 'D', '队列是操作受限的线性表，只允许在队尾插入、在队头删除，随机插入不符合队列的FIFO特性。', 'medium', NULL, NULL, '队列的定义与应用', '2026-07-05T11:59:50.477428+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('250847b4-350a-584a-8e39-3c5cfadadfa2', '612c5430-94a8-55f4-9225-63d5b14b1fbb', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '队列是一种操作受限的线性表。', 'choice', '["A. 正确", "B. 错误"]', 'A', '队列只允许在队尾插入、在队头删除，因此是操作受限的线性表。', 'medium', NULL, NULL, '队列的定义与应用', '2026-07-05T11:59:50.477428+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('5ed635b5-8a01-522b-9724-cc9c1bb61701', '612c5430-94a8-55f4-9225-63d5b14b1fbb', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '循环队列中，当front == rear时，队列一定为空。', 'choice', '["A. 正确", "B. 错误"]', 'B', '在循环队列中，front == rear既是队空条件，也可能是队满条件（如果采用不牺牲存储单元的实现）。通常约定牺牲一个单元来区分，此时front == rear表示队空。但若未做此约定，则需额外标志判断。本题默认常规实现，故该说法不绝对正确。', 'medium', NULL, NULL, '队列的定义与应用', '2026-07-05T11:59:50.477428+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('14a2143d-f9f5-5dba-a1da-e2c883a9c33a', '612c5430-94a8-55f4-9225-63d5b14b1fbb', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '链式队列不存在“假溢出”问题。', 'choice', '["A. 正确", "B. 错误"]', 'A', '链式队列采用动态内存分配，只要系统内存足够，就可以随时添加新节点，不会出现顺序队列中因数组边界导致的“假溢出”。', 'medium', NULL, NULL, '队列的定义与应用', '2026-07-05T11:59:50.477428+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('605fcb76-dded-5fe8-82fc-04c81dda5adb', '612c5430-94a8-55f4-9225-63d5b14b1fbb', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '队列的入队操作在队头进行。', 'choice', '["A. 正确", "B. 错误"]', 'B', '队列的入队操作在队尾进行，出队操作在队头进行。', 'medium', NULL, NULL, '队列的定义与应用', '2026-07-05T11:59:50.477428+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('ed22c750-373d-54ac-9f5e-fd4387ff738f', '612c5430-94a8-55f4-9225-63d5b14b1fbb', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '在银行排队系统中，顾客先到先服务，这体现了队列的FIFO特性。', 'choice', '["A. 正确", "B. 错误"]', 'A', '银行排队系统正是队列的典型应用，先到达的顾客先被服务，符合先进先出原则。', 'medium', NULL, NULL, '队列的定义与应用', '2026-07-05T11:59:50.477428+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('d415ae84-ccc4-5c76-a4e1-0d26090a2f48', '612c5430-94a8-55f4-9225-63d5b14b1fbb', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '队列的英文名称是___。', 'fill', NULL, 'Queue', '队列的英文为Queue，意为排队。', 'medium', NULL, NULL, '队列的定义与应用', '2026-07-05T11:59:50.477428+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('7ab86726-2221-5060-b274-e9883cfaac4c', '612c5430-94a8-55f4-9225-63d5b14b1fbb', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '循环队列中，队空的条件是___。', 'fill', NULL, 'front == rear', '在循环队列的常规实现中，用front和rear相等表示队列为空。', 'medium', NULL, NULL, '队列的定义与应用', '2026-07-05T11:59:50.477428+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('ee17f44c-ca62-5a5d-aa28-116a5f32ad8a', '612c5430-94a8-55f4-9225-63d5b14b1fbb', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '设循环队列的数组容量为MaxSize=6，初始状态front=0, rear=0。依次执行以下操作：入队a、b、c、d；出队两次；入队e、f、g。请写出每一步操作后front和rear的值，并判断最终队列是否为空或满。', 'coding', NULL, '初始：front=0, rear=0
1. 入队a：rear=(0+1)%6=1, front=0
2. 入队b：rear=(1+1)%6=2, front=0
3. 入队c：rear=(2+1)%6=3, front=0
4. 入队d：rear=(3+1)%6=4, front=0
5. 出队：front=(0+1)%6=1, rear=4
6. 出队：front=(1+1)%6=2, rear=4
7. 入队e：rear=(4+1)%6=5, front=2
8. 入队f：rear=(5+1)%6=0, front=2
9. 入队g：rear=(0+1)%6=1, front=2
最终front=2, rear=1。
队满条件：(rear+1)%MaxSize == front → (1+1)%6=2 == front=2，所以队满。', '按照循环队列的入队出队规则，逐步计算rear和front的变化。注意取模运算，最后根据队满条件判断。', 'medium', NULL, NULL, '队列的定义与应用', '2026-07-05T11:59:50.477428+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('ca007790-f4eb-523e-babc-2cef21866da0', '612c5430-94a8-55f4-9225-63d5b14b1fbb', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '请用C语言定义链式队列的节点结构，并写出入队和出队操作的函数实现（假设元素类型为int）。', 'coding', NULL, '节点结构定义：
typedef struct QNode {
    int data;
    struct QNode *next;
} QNode;

typedef struct {
    QNode *front;
    QNode *rear;
} LinkQueue;

入队操作：
void EnQueue(LinkQueue *Q, int x) {
    QNode *s = (QNode*)malloc(sizeof(QNode));
    s->data = x;
    s->next = NULL;
    Q->rear->next = s;
    Q->rear = s;
}

出队操作：
int DeQueue(LinkQueue *Q) {
    if (Q->front == Q->rear) return -1; // 队空
    QNode *p = Q->front->next;
    int x = p->data;
    Q->front->next = p->next;
    if (p == Q->rear) Q->rear = Q->front; // 队列中只有一个节点时
    free(p);
    return x;
}', '链式队列使用带头结点的单链表实现，front指向头结点，rear指向最后一个节点。入队时在rear后插入新节点并更新rear；出队时删除front后的第一个节点，注意处理队列变空的情况。', 'medium', NULL, NULL, '队列的定义与应用', '2026-07-05T11:59:50.477428+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('fc363c61-466c-58c4-9938-9a4d2afe0da2', '612c5430-94a8-55f4-9225-63d5b14b1fbb', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '假设有一个循环队列，数组大小为5，初始front=0, rear=0。现要存储元素序列：1,2,3,4,5。请说明能否全部存入？若能，写出最终front和rear；若不能，说明原因。', 'coding', NULL, '不能全部存入。
因为循环队列为了区分队空和队满，通常牺牲一个存储单元，即最大有效元素个数为MaxSize-1=4。
存入1: rear=1
存入2: rear=2
存入3: rear=3
存入4: rear=4
此时(rear+1)%5=0 == front，队满，无法再存入5。', '循环队列中，队满条件为(rear+1)%MaxSize == front，因此最多只能存储MaxSize-1个元素。', 'medium', NULL, NULL, '队列的定义与应用', '2026-07-05T11:59:50.477428+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('dad8067c-e6b6-5c53-b667-07fbcb004389', '612c5430-94a8-55f4-9225-63d5b14b1fbb', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '请简述队列在计算机系统中的一个应用实例，并说明其如何体现FIFO特性。', 'coding', NULL, '例如：操作系统中的打印任务队列。多个用户同时向打印机发送打印任务时，系统将这些任务放入一个队列中。打印机按照任务到达的先后顺序依次处理，先到达的任务先被打印，后到达的任务排在队尾等待。这完美体现了队列的先进先出（FIFO）特性。', '队列广泛应用于资源分配、任务调度等场景，如打印队列、CPU任务调度队列、消息队列等，核心都是利用FIFO保证公平性。', 'medium', NULL, NULL, '队列的定义与应用', '2026-07-05T11:59:50.477428+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('be49b4c5-4522-578c-b373-d21fef7d6705', '612c5430-94a8-55f4-9225-63d5b14b1fbb', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '设计一个算法，利用两个队列实现一个栈（即用队列模拟栈的后进先出特性）。请写出算法思路并给出入栈和出栈操作的时间复杂度。', 'coding', NULL, '算法思路：使用两个队列Q1和Q2。
入栈（push）：将元素直接入队到Q1。时间复杂度O(1)。
出栈（pop）：将Q1中除最后一个元素外的所有元素依次出队并入队到Q2；然后Q1中剩下的最后一个元素即为栈顶元素，将其出队返回；最后交换Q1和Q2的角色（或直接将Q2中的元素移回Q1）。时间复杂度O(n)，n为当前栈中元素个数。
（另一种实现：入栈时调整，出栈时直接出队，复杂度相反。）', '利用队列的FIFO特性模拟栈的LIFO特性，关键在于将队列中的元素顺序反转。每次出栈时需要将前n-1个元素移到另一个队列，从而取出最后一个元素。', 'medium', NULL, NULL, '队列的定义与应用', '2026-07-05T11:59:50.477428+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('62036140-865a-546c-b4f3-5a6a731e238d', '612c5430-94a8-55f4-9225-63d5b14b1fbb', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '递归函数必须包含的两个基本要素是：', 'choice', '["A. 循环和条件语句", "B. 递归基（终止条件）和递归关系（递推公式）", "C. 参数和返回值", "D. 全局变量和局部变量"]', 'B', '递归的核心在于递归基确保问题在最小规模时直接求解，递归关系将当前问题转化为更小规模的问题，两者缺一不可。', 'medium', NULL, NULL, '递归与分治思想', '2026-07-05T11:59:50.477428+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('94c39fa8-519e-5a49-9fd9-888c69faced1', '612c5430-94a8-55f4-9225-63d5b14b1fbb', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '分治思想中，将原问题拆分成多个子问题的步骤称为：', 'choice', '["A. 求解（Conquer）", "B. 合并（Combine）", "C. 分解（Divide）", "D. 递归（Recurse）"]', 'C', '分治原理的三步是：分解（Divide）、求解（Conquer）、合并（Combine），其中分解是将原问题拆分成多个子问题。', 'medium', NULL, NULL, '递归与分治思想', '2026-07-05T11:59:50.477428+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('ed2e2a9d-1a5e-5153-ba8a-6a23c140ffac', '612c5430-94a8-55f4-9225-63d5b14b1fbb', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '以下哪个算法是典型的递归与分治结合的应用？', 'choice', '["A. 顺序查找", "B. 冒泡排序", "C. 二分查找", "D. 直接插入排序"]', 'C', '二分查找采用分治策略，将有序数组分为左右子区间，并通过递归实现查找，是递归与分治结合的经典实例。', 'medium', NULL, NULL, '递归与分治思想', '2026-07-05T11:59:50.477428+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('7827bae6-6897-52f9-8ff8-85a65dc7d329', '612c5430-94a8-55f4-9225-63d5b14b1fbb', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '递归求解问题的时间复杂度通常由什么决定？', 'choice', '["A. 递归深度", "B. 递推关系式", "C. 输入规模大小", "D. 递归基的个数"]', 'B', '递归算法的效率由递推关系如T(n)=aT(n/b)+f(n)决定，并通过主定理分析时间复杂度。', 'medium', NULL, NULL, '递归与分治思想', '2026-07-05T11:59:50.477428+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('bc3e6e15-04f9-5f0c-b40d-241d9cfccc29', '612c5430-94a8-55f4-9225-63d5b14b1fbb', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '对于分治算法，如果子问题相互独立，则合并步骤的复杂度通常取决于：', 'choice', '["A. 子问题的个数", "B. 子问题的规模", "C. 合并操作的实现方式", "D. 递归基的复杂度"]', 'C', '合并步骤的复杂度取决于如何将子问题的解组合成原问题的解，不同的合并实现方式（如线性扫描、分组合并）会影响整体效率。', 'medium', NULL, NULL, '递归与分治思想', '2026-07-05T11:59:50.477428+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('8163e3cb-30b7-543f-9df7-d46d532c58a6', '612c5430-94a8-55f4-9225-63d5b14b1fbb', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '递归函数中，只要定义了递归关系，就可以保证程序正确终止。', 'choice', '["A. 正确", "B. 错误"]', 'B', '递归函数必须同时具备递归基（终止条件）和递归关系，缺少递归基可能导致无限递归，程序无法终止。', 'hard', NULL, NULL, '递归与分治思想', '2026-07-05T11:59:50.477428+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('19a0712a-b4dd-5a8d-b355-0a830ee83683', '612c5430-94a8-55f4-9225-63d5b14b1fbb', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '分治思想要求子问题之间必须相互独立，不能有重叠。', 'choice', '["A. 正确", "B. 错误"]', 'A', '分治策略的核心假设是子问题相互独立，这样才可以分别求解后合并，若子问题重叠则更适合用动态规划。', 'hard', NULL, NULL, '递归与分治思想', '2026-07-05T11:59:50.477428+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('597ed981-e974-5193-be9c-782043ea8f6a', '612c5430-94a8-55f4-9225-63d5b14b1fbb', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '二分查找的分治过程中，合并步骤需要将左右子问题的结果进行组合。', 'choice', '["A. 正确", "B. 错误"]', 'B', '二分查找中，每次递归只在一个子区间内查找，不需要合并左右子问题的结果，因此没有显式的合并步骤。', 'hard', NULL, NULL, '递归与分治思想', '2026-07-05T11:59:50.477428+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('2c405e79-764d-5769-8edc-2173da479211', '612c5430-94a8-55f4-9225-63d5b14b1fbb', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '所有递归算法都可以通过迭代方式实现。', 'choice', '["A. 正确", "B. 错误"]', 'A', '理论上，任何递归算法都可以使用栈等数据结构模拟递归过程，转化为迭代实现，但代码复杂度可能增加。', 'hard', NULL, NULL, '递归与分治思想', '2026-07-05T11:59:50.477428+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('86751464-c1c8-50d2-9380-9d9328dc22d6', '612c5430-94a8-55f4-9225-63d5b14b1fbb', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '递归的核心要素包括递归基和___。', 'fill', NULL, '递归关系（递推公式）', '递归基确保最小规模直接求解，递归关系将问题规模缩小，两者共同构成递归的完整定义。', 'hard', NULL, NULL, '递归与分治思想', '2026-07-05T11:59:50.634539+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('2bb0d757-c628-5c47-8a99-5ae70388391c', '612c5430-94a8-55f4-9225-63d5b14b1fbb', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '分治思想的三步是分解、求解和___。', 'fill', NULL, '合并', '分治策略的三个步骤：分解（Divide）、求解（Conquer）、合并（Combine）。', 'hard', NULL, NULL, '递归与分治思想', '2026-07-05T11:59:50.634539+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('f337fc3f-de83-5fd7-8c83-aafd17373726', '612c5430-94a8-55f4-9225-63d5b14b1fbb', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '二分查找中，递归基的条件是子数组___时查找失败。', 'fill', NULL, '为空', '当子数组没有元素时，说明目标值不存在，此时返回查找失败标志（如-1）。', 'hard', NULL, NULL, '递归与分治思想', '2026-07-05T11:59:50.634539+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('326d44fe-0e06-5ed3-bae2-98f89a26c910', '612c5430-94a8-55f4-9225-63d5b14b1fbb', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '分析递归算法时间复杂度的常用工具是___。', 'fill', NULL, '主定理', '主定理用于求解形如T(n)=aT(n/b)+f(n)的递推关系，快速确定递归算法的时间复杂度。', 'hard', NULL, NULL, '递归与分治思想', '2026-07-05T11:59:50.634539+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('eef213e1-2893-52a9-9f0b-f63c6f9cab6a', '612c5430-94a8-55f4-9225-63d5b14b1fbb', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '若递归算法的时间递推关系为T(n)=2T(n/2)+O(n)，则其时间复杂度为___。', 'fill', NULL, 'O(n log n)', '根据主定理，a=2, b=2, f(n)=O(n)，log_b(a)=1，f(n)与n^1同阶，因此时间复杂度为O(n log n)。', 'hard', NULL, NULL, '递归与分治思想', '2026-07-05T11:59:50.634539+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('d2425028-30b2-59c8-8444-c6c1fd351781', '612c5430-94a8-55f4-9225-63d5b14b1fbb', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '请用递归与分治思想实现一个函数，计算整数数组中的最大值。写出递归函数（伪代码或代码均可），并分析其时间复杂度和空间复杂度。', 'coding', NULL, '伪代码：
function findMax(arr, left, right):
    if left == right:
        return arr[left]
    mid = (left + right) // 2
    leftMax = findMax(arr, left, mid)
    rightMax = findMax(arr, mid+1, right)
    return max(leftMax, rightMax)

调用时传入 left=0, right=n-1。
时间复杂度：T(n)=2T(n/2)+O(1)，由主定理得 O(n)。
空间复杂度：递归深度为 O(log n)，栈空间为 O(log n)。', '该问题采用分治策略：将数组分成左右两半，分别递归求最大值，然后合并（取两者较大值）。递归基是只有一个元素时直接返回。复杂度分析基于递推关系。', 'hard', NULL, NULL, '递归与分治思想', '2026-07-05T11:59:50.634539+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('3516c9e3-3cd0-5715-b4c6-b346d780cd92', '612c5430-94a8-55f4-9225-63d5b14b1fbb', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '给定一个有序数组 arr = [1, 3, 5, 7, 9, 11, 13, 15]，使用递归二分查找目标值 7 和 8。请写出查找过程（每一步的中间下标、比较结果、递归方向），并给出最终结果。', 'coding', NULL, '查找7：
初始区间[0,7]，mid=3，arr[3]=7，相等，返回下标3。
查找8：
初始区间[0,7]，mid=3，arr[3]=7<8，递归右半区间[4,7]；
mid=5，arr[5]=11>8，递归左半区间[4,4]；
mid=4，arr[4]=9>8，递归左半区间[4,3]（空区间）；
返回-1（查找失败）。
结果：7的下标为3，8不存在返回-1。', '二分查找每次取中间元素与目标比较，根据大小决定递归方向，当子数组为空时查找失败。', 'hard', NULL, NULL, '递归与分治思想', '2026-07-05T11:59:50.634539+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('1b7a9e9b-48a4-51b3-9040-f50e97d6ce35', '612c5430-94a8-55f4-9225-63d5b14b1fbb', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '编写一个递归函数计算斐波那契数列的第n项（F(0)=0, F(1)=1），并指出该实现的时间复杂度。然后提出一种改进的分治方法（如矩阵快速幂），分析其时间复杂度。', 'coding', NULL, '朴素递归实现：
function fib(n):
    if n==0: return 0
    if n==1: return 1
    return fib(n-1)+fib(n-2)
时间复杂度：T(n)=T(n-1)+T(n-2)+O(1)，约 O(2^n)。
改进的分治方法（矩阵快速幂）：
利用公式 [F(n), F(n-1)] = [ [1,1],[1,0] ]^(n-1) * [1,0]^T，通过快速幂计算矩阵的幂，时间复杂度 O(log n)。', '朴素递归存在大量重复计算，效率极低；矩阵快速幂利用分治思想将指数问题分解为子问题，结合递归实现O(log n)的高效计算。', 'hard', NULL, NULL, '递归与分治思想', '2026-07-05T11:59:50.634539+00:00');
INSERT INTO public.questions (id, chapter_id, course_id, content, type, options, answer, explanation, difficulty, knowledge_point, ima_context, topic, created_at) VALUES ('6fa3e5e6-a62f-5861-8a41-4605a8428b61', '612c5430-94a8-55f4-9225-63d5b14b1fbb', '0b49df3d-2ca1-5373-befe-4cf212d8db28', '某分治算法的时间递推关系为 T(n) = 4T(n/2) + n^2，请使用主定理求解其时间复杂度，并说明该算法的分解与合并特点。', 'coding', NULL, '主定理：a=4, b=2, f(n)=n^2，log_b(a)=log2(4)=2，f(n)=n^2 与 n^2 同阶，属于情况2，因此 T(n)=O(n^2 log n)。
特点：分解时将原问题分成4个规模为n/2的子问题，合并操作的时间复杂度为O(n^2)，说明合并步骤较耗时。', '主定理提供了一种系统求解递推关系的方法。该算法子问题数量较多（4个），合并代价为平方级，整体复杂度略高于n^2。', 'hard', NULL, NULL, '递归与分治思想', '2026-07-05T11:59:50.634539+00:00');
