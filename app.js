var inquirer = require("inquirer");
const fs = require("fs");
const generatePage = require("./src/page-template");

// const pageHTML = generatePage(name, github);

// fs.writeFile('./index.html', pageHTML, err => {
//   if (err) throw err;

//   console.log('Portfolio complete! Check out index.html to see the output!');
// });

const promptUser = () => {
  return inquirer.prompt([
    {
      type: "list",
      name: "name",
      message: "what would you like to do?",
      choices: [
        "View all Employees",
        "Add Employees",
        "Add Employee Role",
        "View All Roles",
        "Add Role",
        "View All Departments",
        "Add Departments",
        "Quit"],
    }
  ])
  
}