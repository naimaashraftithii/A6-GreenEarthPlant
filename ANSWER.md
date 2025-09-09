


#### 1) What is the difference between var, let, and const?
var: var is an old way of declaring variables in JavaScript.It is function-scoped, meaning the variable is accessible throughout the function it is declared in.Variables declared with var can be re-declared and re-assigned in the same scope.Not recommended in modern JavaScript (can cause bugs due to hoisting and scope issues).

let : let is a modern way of declaring variables introduced in ES6.It is block-scoped, meaning it is only accessible inside the block { } where it is defined.Variables declared with let can be re-assigned but not re-declared in the same scope.Use let when the variable’s value needs to change.

const: const is also introduced in ES6.It is block-scoped like let.Variables declared with const cannot be re-assigned or re-declared.Use const by default, unless you know the value will change.


#### 2) What is the difference between map(), forEach(), and filter()? 

map() :map() is an array method used to transform elements of an array.It returns a new array with the transformed values.It does not modify the original array.
Example:
const nums = [1,2,3];
const squares = nums.map(num => num * num);
console.log(squares); 

forEach() :forEach() is an array method used to loop through elements.It does not return a new array.It is mainly used for side effects like console.log, updating values, or making API calls.
Example:
[1,2,3].forEach(num => console.log(num));

filter(): filter() creates a new array with elements that pass a given test (condition).Returns only elements where the condition is true.
Example:
const numbers = [5,12,8,20];
const greaterThan10 = numbers.filter(x => x > 10);
console.log(greaterThan10); 


#### 3) What are arrow functions in ES6?
Arrow Functions (ES6) : Arrow functions are a shorter way to write functions.Introduced in ES6 (2015).They don’t have their own this binding (lexical this).Best for small inline functions.
Example:
const add = (a, b) => a + b;
console.log(add(2,3)); 

#### 4) How does destructuring assignment work in ES6?
Destructuring lets you unpack values from arrays or objects directly into variables.It makes code cleaner and avoids repetitive obj.something or arr[0].

// Array destructuring
const [x, y] = [10, 20]; // x=10, y=20
// Object destructuring
const {name, age} = {name: "Emi", age: 22};


#### 5) Explain template literals in ES6. How are they different from string concatenation?
Template literals are strings wrapped in backticks `, and they allow embedded expressions with ${}.
const name = "Emi";
console.log(`Hello, ${name}!`); 
•	With normal concatenation: "Hello, " + name + "!"
•	With template literals: `Hello, ${name}!`
Easier to read, support multi-line strings, and allow inline expressions.
