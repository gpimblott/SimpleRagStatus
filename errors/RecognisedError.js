/**
 * New Error that includes a title and message to display to the user
 */
export class RecognisedError extends Error {
    constructor(title, message) {
        super(message);
        this.title = title;
        // Ensure the name of this error is the same as the class name
        this.name = this.constructor.name;
    }
}
