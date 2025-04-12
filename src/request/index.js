class Request {
    constructor(name) {
        this.name = name;
    }
    execute() {
        throw new Error("This method should be overridden!");
    }
}

export default function() {
    const strategyA = new ConcreteStrategyA("Task A");
    const strategyB = new ConcreteStrategyB("Task B");

    const context = new Context(strategyA);
    context.executeStrategy(); // 输出: Executing strategy A: Task A

    context.setStrategy(strategyB);
    context.executeStrategy(); // 输出: Executing strategy B: Task B
}