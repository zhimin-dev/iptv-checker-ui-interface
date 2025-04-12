class InternalRequest extends Request {
    execute() {
        console.log(`Executing strategy A: ${this.name}`);
    }
}