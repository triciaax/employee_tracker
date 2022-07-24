var inquirer = require("inquirer");
const fs = require("fs");
const generatePage = require("./src/page-template");
const { allowedNodeEnvironmentFlags } = require("process");

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
        "Add Employee",
        "View All Roles",
        "Add Role",
        "View All Departments",
        "Add Departments",
        "Quit"],
    }
  ])

  // responses to answers 
  .then((answers) => {
    const { choices } = answers; 

    if (choices === "View All Employees") {
        showRoles();
      }

    if (choices === "Add Employee Role") { 
        addEmployee();
    }

    if (choices === "View All Roles") {
        showRoles();
    }

    if (choices === "Add Role") {
        addRole();
    }

    if (choices === "View All Departments") {
      showDepartments();
    }

    if (choices === "Add Departments") {
        addDepartments();
    };
});
};