function People(name, age) {
    this.name = name;
    this.age = age;
}


var person = new People('tom', 21)
console.log(person.name, person.age);